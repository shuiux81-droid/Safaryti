import fs from 'fs';
import path from 'path';
import { defineConfig, transformWithEsbuild } from 'vite';

function collectFilesRecursive(dirAbs: string, baseAbs: string, out: string[] = []): string[] {
  if (!fs.existsSync(dirAbs)) return out;
  const entries = fs.readdirSync(dirAbs, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dirAbs, entry.name);
    if (entry.isDirectory()) {
      collectFilesRecursive(full, baseAbs, out);
    } else if (entry.isFile()) {
      out.push(path.relative(baseAbs, full).split(path.sep).join('/'));
    }
  }
  return out;
}

export default defineConfig(() => {
  const rootDir = import.meta.dirname;
  let assetMap: Record<string, string> = {};
  let sectionsBelowHashed = '';
  let extraModulePreloads: string[] = [];
  let deletedCssLiterals: string[] = [];

  const rewriteAssetUrl = (rawUrl: string, fromAssetsDir: boolean): string | null => {
    const clean = rawUrl.split('?')[0].split('#')[0];
    const m = clean.match(/(src\/assets\/images|mobile|partners|assets\/aistudio|fonts)\/(.+)$/);
    if (!m) return null;
    const key = m[1] + '/' + m[2];
    const mapped = assetMap[key];
    if (!mapped) return null;
    if (fromAssetsDir) {
      return './' + path.posix.basename(mapped);
    }
    return mapped;
  };

  const rewriteCssUrls = (cssText: string, fromAssetsDir: boolean): string => {
    return cssText.replace(/url\((['"]?)([^'")]+)\1\)/g, (full, q, inner) => {
      if (/^data:|^https?:|^#/i.test(inner)) return full;
      const hashed = rewriteAssetUrl(inner, fromAssetsDir);
      if (hashed) return `url(${q}${hashed}${q})`;
      if (!fromAssetsDir && inner.startsWith('./') && !inner.startsWith('./assets/')) {
        return `url(${q}./assets/${inner.slice(2)}${q})`;
      }
      return full;
    });
  };

  return {
    base: process.env.VITE_BASE || './',
    plugins: [
      {
        name: 'safaryti-hashed-assets-and-critical-css',
        apply: 'build',
        enforce: 'post',
        transformIndexHtml: {
          order: 'pre',
          handler(html, ctx) {
            if (ctx && ctx.server) return html;
            return html
              .replace(/<link\b[^>]*data-sections-below[^>]*>\s*/gi, '')
              .replace(/<noscript\b[^>]*data-sections-below[^>]*>[\s\S]*?<\/noscript>/gi, '<!--SAFARYTI_SECTIONS_BELOW_CSS-->');
          },
        },
        async generateBundle(_outputOptions, bundle) {
          assetMap = {};
          extraModulePreloads = [];
          sectionsBelowHashed = '';
          deletedCssLiterals = [];

          const rootsToHash: Array<{ absDir: string; keyBaseAbs: string }> = [
            { absDir: path.resolve(rootDir, 'src/assets/images'), keyBaseAbs: rootDir },
            { absDir: path.resolve(rootDir, 'public/mobile'), keyBaseAbs: path.resolve(rootDir, 'public') },
            { absDir: path.resolve(rootDir, 'public/partners'), keyBaseAbs: path.resolve(rootDir, 'public') },
            { absDir: path.resolve(rootDir, 'public/assets/aistudio'), keyBaseAbs: path.resolve(rootDir, 'public') },
            { absDir: path.resolve(rootDir, 'public/fonts'), keyBaseAbs: path.resolve(rootDir, 'public') },
          ];

          for (const { absDir, keyBaseAbs } of rootsToHash) {
            const relKeys = collectFilesRecursive(absDir, keyBaseAbs);
            for (const relKey of relKeys) {
              if (assetMap[relKey]) continue;
              const absFile = path.resolve(keyBaseAbs, relKey);
              const refId = this.emitFile({
                type: 'asset',
                name: path.basename(relKey),
                source: fs.readFileSync(absFile),
              });
              const emittedName = this.getFileName(refId);
              assetMap[relKey] = './' + emittedName;
            }
          }

          const belowCssPath = path.resolve(rootDir, 'css/sections-below.css');
          if (fs.existsSync(belowCssPath)) {
            const rawBelow = fs.readFileSync(belowCssPath, 'utf8');
            const urlRewritten = rewriteCssUrls(rawBelow, true);
            const minified = await transformWithEsbuild(urlRewritten, 'sections-below.css', {
              loader: 'css',
              minify: true,
            });
            const refId = this.emitFile({
              type: 'asset',
              name: 'sections-below.css',
              source: minified.code,
            });
            sectionsBelowHashed = './' + this.getFileName(refId);
          }

          // Also ensure all existing CSS assets in bundle have rewritten URLs
          for (const [fileName, item] of Object.entries(bundle)) {
            if (item.type === 'asset' && fileName.endsWith('.css') && typeof item.source === 'string') {
              item.source = rewriteCssUrls(item.source, true);
            }
          }

          // Inject compacted asset map into JS chunk containing placeholder & collect Home preloads
          const compactAssetMap: Record<string, string> = {};
          const jsPrefixes: Array<[string, string]> = [
            ['src/assets/images/', '0/'],
            ['mobile/m/', '1/'],
            ['mobile/', '2/'],
            ['partners/', '3/'],
            ['assets/aistudio/', '4/'],
          ];
          for (const [k, v] of Object.entries(assetMap)) {
            if (k.startsWith('fonts/')) continue;
            let shortKey = k;
            for (const [p, code] of jsPrefixes) {
              if (k.startsWith(p)) {
                shortKey = code + k.slice(p.length);
                break;
              }
            }
            let encodedVal = v.startsWith('./assets/') ? '=' + v.slice('./assets/'.length) : '@' + v;
            if (v.startsWith('./assets/')) {
              const origName = path.posix.basename(k);
              const ext = path.posix.extname(origName);
              const base = ext ? origName.slice(0, -ext.length) : origName;
              const vFile = v.slice('./assets/'.length);
              if (vFile.startsWith(base + '-') && (!ext || vFile.endsWith(ext))) {
                const hashToken = vFile.slice(base.length + 1, ext ? -ext.length : vFile.length);
                if (/^[A-Za-z0-9_-]+$/.test(hashToken)) {
                  encodedVal = hashToken;
                }
              }
            }
            compactAssetMap[shortKey] = encodedVal;
          }
          const serializedMapLiteral = JSON.stringify(JSON.stringify(compactAssetMap));
          const homeDeps = new Set<string>();
          const contactJsDeps = new Set<string>();
          const contactCssDeps = new Set<string>();
          const searchJsDeps = new Set<string>();
          const searchCssDeps = new Set<string>();
          const cultureJsDeps = new Set<string>();
          const cultureCssDeps = new Set<string>();
          let contactChunkFile = '';
          let searchChunkFile = '';
          let cultureChunkFile = '';
          for (const [fileName, item] of Object.entries(bundle)) {
            if (item.type === 'chunk') {
              if (item.code.includes('__SAFARYTI_ASSET_MAP_JSON__')) {
                item.code = item.code.replace(/(['"])__SAFARYTI_ASSET_MAP_JSON__\1/g, () => serializedMapLiteral);
              }
              if (/^assets\/home-[^/]+\.js$/.test(fileName)) {
                homeDeps.add(fileName);
                for (const imp of item.imports || []) {
                  homeDeps.add(imp);
                }
              }
              if (/^assets\/contact-[^/]+\.js$/.test(fileName)) {
                contactChunkFile = fileName;
              }
              if (/^assets\/search-[^/]+\.js$/.test(fileName)) {
                searchChunkFile = fileName;
              }
              if (/^assets\/culture-[^/]+\.js$/.test(fileName)) {
                cultureChunkFile = fileName;
              }
            }
          }
          const collectChunkTree = (entryFile: string, jsOut: Set<string>, cssOut: Set<string>) => {
            if (!entryFile) return;
            const queue = [entryFile];
            while (queue.length) {
              const dep = queue.shift()!;
              if (jsOut.has(dep)) continue;
              jsOut.add(dep);
              const chunk = bundle[dep];
              if (chunk && chunk.type === 'chunk') {
                for (const imp of chunk.imports || []) {
                  if (!jsOut.has(imp)) queue.push(imp);
                }
                const importedCss = (chunk as { viteMetadata?: { importedCss?: Set<string> } }).viteMetadata?.importedCss;
                if (importedCss) {
                  for (const cssFile of importedCss) {
                    if (!/^assets\/index-[^/]+\.css$/.test(cssFile)) {
                      cssOut.add(cssFile);
                    }
                  }
                }
              }
            }
          };
          collectChunkTree(contactChunkFile, contactJsDeps, contactCssDeps);
          collectChunkTree(searchChunkFile, searchJsDeps, searchCssDeps);
          collectChunkTree(cultureChunkFile, cultureJsDeps, cultureCssDeps);
          const searchBoot = {
            js: Array.from(searchJsDeps).map((f) => './' + f),
            css: Array.from(searchCssDeps).map((f) => './' + f),
            belowCss: sectionsBelowHashed,
            fd:
              assetMap['src/assets/images/about_warm_clouds_1795352383366.webp'] ||
              './src/assets/images/about_warm_clouds_1795352383366.webp',
            fm:
              assetMap['src/assets/images/about_warm_clouds_1795352383366-480w.webp'] ||
              './src/assets/images/about_warm_clouds_1795352383366-480w.webp',
          };
          const contactBoot = {
            js: Array.from(contactJsDeps).map((f) => './' + f),
            css: Array.from(contactCssDeps).map((f) => './' + f),
            m: {
              hm: (assetMap['mobile/hero-marsa-m.webp'] || './mobile/hero-marsa-m.webp') + ' 800w',
              hmHref: assetMap['mobile/hero-marsa-m.webp'] || './mobile/hero-marsa-m.webp',
              hd: [
                (assetMap['src/assets/images/hero_marsa_alam_1794996468348-240w.webp'] || '') + ' 240w',
                (assetMap['src/assets/images/hero_marsa_alam_1794996468348-480w.webp'] || '') + ' 480w',
                (assetMap['src/assets/images/hero_marsa_alam_1794996468348-800w.webp'] || '') + ' 800w',
                (assetMap['src/assets/images/hero_marsa_alam_1794996468348-1120w.webp'] || '') + ' 1120w',
                (assetMap['src/assets/images/hero_marsa_alam_1794996468348.webp'] || '') + ' 1376w',
              ].join(', '),
              hdHref:
                assetMap['src/assets/images/hero_marsa_alam_1794996468348.webp'] ||
                './src/assets/images/hero_marsa_alam_1794996468348.webp',
              pm: [
                (assetMap['mobile/m/contact_temple_traveler_1795429682873-320w.webp'] || '') + ' 320w',
                (assetMap['mobile/m/contact_temple_traveler_1795429682873-480w.webp'] || '') + ' 480w',
              ].join(', '),
              pmHref:
                assetMap['mobile/m/contact_temple_traveler_1795429682873-480w.webp'] ||
                './mobile/m/contact_temple_traveler_1795429682873-480w.webp',
              pd: [
                (assetMap['src/assets/images/contact_temple_traveler_1795429682873-240w.webp'] || '') + ' 240w',
                (assetMap['src/assets/images/contact_temple_traveler_1795429682873-480w.webp'] || '') + ' 480w',
                (assetMap['src/assets/images/contact_temple_traveler_1795429682873-640w.webp'] || '') + ' 640w',
                (assetMap['src/assets/images/contact_temple_traveler_1795429682873-760w.webp'] || '') + ' 760w',
                (assetMap['src/assets/images/contact_temple_traveler_1795429682873.webp'] || '') + ' 896w',
              ].join(', '),
              pdHref:
                assetMap['src/assets/images/contact_temple_traveler_1795429682873.webp'] ||
                './src/assets/images/contact_temple_traveler_1795429682873.webp',
            },
          };
          const hubBoot = {
            js: Array.from(cultureJsDeps).map((f) => './' + f),
            css: Array.from(cultureCssDeps).map((f) => './' + f),
            m: {
              cm: (assetMap['mobile/hub-culture-m.webp'] || './mobile/hub-culture-m.webp') + ' 800w',
              cmHref: assetMap['mobile/hub-culture-m.webp'] || './mobile/hub-culture-m.webp',
              cd: [
                (assetMap['src/assets/images/about_temple_pillars_1794996471329-240w.webp'] || '') + ' 240w',
                (assetMap['src/assets/images/about_temple_pillars_1794996471329-480w.webp'] || '') + ' 480w',
                (assetMap['src/assets/images/about_temple_pillars_1794996471329-640w.webp'] || '') + ' 640w',
                (assetMap['src/assets/images/about_temple_pillars_1794996471329-760w.webp'] || '') + ' 760w',
                (assetMap['src/assets/images/about_temple_pillars_1794996471329.webp'] || '') + ' 896w',
              ].join(', '),
              cdHref:
                assetMap['src/assets/images/about_temple_pillars_1794996471329.webp'] ||
                './src/assets/images/about_temple_pillars_1794996471329.webp',
              dm:
                (assetMap['src/assets/images/region_asia_landscape_1794996469512-800w.webp'] ||
                  './src/assets/images/region_asia_landscape_1794996469512-800w.webp') + ' 800w',
              dmHref:
                assetMap['src/assets/images/region_asia_landscape_1794996469512-800w.webp'] ||
                './src/assets/images/region_asia_landscape_1794996469512-800w.webp',
              dd: [
                (assetMap['src/assets/images/region_asia_landscape_1794996469512-240w.webp'] || '') + ' 240w',
                (assetMap['src/assets/images/region_asia_landscape_1794996469512-480w.webp'] || '') + ' 480w',
                (assetMap['src/assets/images/region_asia_landscape_1794996469512-800w.webp'] || '') + ' 800w',
                (assetMap['src/assets/images/region_asia_landscape_1794996469512-1120w.webp'] || '') + ' 1120w',
                (assetMap['src/assets/images/region_asia_landscape_1794996469512.webp'] || '') + ' 1376w',
              ].join(', '),
              ddHref:
                assetMap['src/assets/images/region_asia_landscape_1794996469512.webp'] ||
                './src/assets/images/region_asia_landscape_1794996469512.webp',
            },
          };
          extraModulePreloads = Array.from(homeDeps);

          const htmlAsset = bundle['index.html'];
          if (htmlAsset && htmlAsset.type === 'asset' && typeof htmlAsset.source === 'string') {
            let out = htmlAsset.source;

            // Inline base + critical above-the-fold CSS
            const linkMatch = out.match(
              /<link\b[^>]*rel=["']stylesheet["'][^>]*href=["'](?:\.\/|\/)?(assets\/index-[^"']+\.css)["'][^>]*>/i
            );
            if (linkMatch) {
              const assetKey = linkMatch[1];
              const cssChunk = bundle[assetKey];
              if (cssChunk && cssChunk.type === 'asset' && typeof cssChunk.source === 'string') {
                const rewrittenCss = rewriteCssUrls(cssChunk.source, false).replace(/<\/style>/gi, '<\\/style>');
                delete bundle[assetKey];
                out = out.replace(linkMatch[0], () => '<style>' + rewrittenCss + '</style>');
                deletedCssLiterals.push(JSON.stringify('./' + path.posix.basename(assetKey)));
              }
            }

            // Emit noscript fallback for sections-below.css (JS preload emitted selectively in head script)
            if (sectionsBelowHashed) {
              const belowTags = `<noscript><link rel="stylesheet" href="${sectionsBelowHashed}"></noscript>`;
              out = out.replace('<!--SAFARYTI_SECTIONS_BELOW_CSS-->', () => belowTags);
            }

            // Rewrite @font-face / inline CSS url(...) in <style> and minify whitespace
            const styleBlocks: string[] = [];
            out = out.replace(/<style>([\s\S]*?)<\/style>/gi, (_full, cssBody) => {
              const idx = styleBlocks.length;
              styleBlocks.push(rewriteCssUrls(cssBody, false));
              return `<!--SAFARYTI_STYLE_${idx}-->`;
            });
            for (let si = 0; si < styleBlocks.length; si++) {
              const minCss = await transformWithEsbuild(styleBlocks[si], `inline-${si}.css`, {
                loader: 'css',
                minify: true,
              });
              out = out.replace(`<!--SAFARYTI_STYLE_${si}-->`, () => '<style>' + minCss.code.trim() + '</style>');
            }

            // Rewrite href="...", src="...", data-lazy-src="...", data-fb="..."
            out = out.replace(
              /\b(href|src|data-lazy-src|data-fb)=(["'])([^"']+)\2/gi,
              (full, attr, q, val) => {
                const hashed = rewriteAssetUrl(val, false);
                return hashed ? `${attr}=${q}${hashed}${q}` : full;
              }
            );

            // Rewrite imagesrcset / srcset / data-lazy-srcset
            out = out.replace(
              /\b(imagesrcset|srcset|data-lazy-srcset)=(["'])([^"']+)\2/gi,
              (_full, attr, q, val) => {
                const nextVal = val
                  .split(',')
                  .map((part: string) => {
                    const trimmed = part.trim();
                    if (!trimmed) return '';
                    const sp = trimmed.search(/\s/);
                    const urlPart = sp === -1 ? trimmed : trimmed.slice(0, sp);
                    const desc = sp === -1 ? '' : trimmed.slice(sp);
                    const hashed = rewriteAssetUrl(urlPart, false);
                    return (hashed || urlPart) + desc;
                  })
                  .filter(Boolean)
                  .join(', ');
                return `${attr}=${q}${nextVal}${q}`;
              }
            );

            // Inject modulepreload tags for initial Home chunks to eliminate serial waterfall
            if (extraModulePreloads.length) {
              const preloadTags = extraModulePreloads
                .filter((dep) => !out.includes(dep))
                .map((dep) => `  <link rel="modulepreload" crossorigin href="./${dep}">`)
                .join('\n');
              if (preloadTags) {
                out = out.replace('</head>', () => `${preloadTags}\n</head>`);
              }
            }

            out = out.replace('/*__SAFARYTI_CONTACT_BOOT__*/null', () => JSON.stringify(contactBoot));
            out = out.replace('/*__SAFARYTI_SEARCH_BOOT__*/null', () => JSON.stringify(searchBoot));
            out = out.replace('/*__SAFARYTI_HUB_BOOT__*/null', () => JSON.stringify(hubBoot));
            out = out.replace('/*__SAFARYTI_BELOW_CSS__*/null', () => JSON.stringify(sectionsBelowHashed || ''));
            htmlAsset.source = out;
          }
        },
      },
      // Fallback copy for any unbundled references
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(rootDir, 'dist');
          const distAssetsDir = path.resolve(distDir, 'assets');
          if (deletedCssLiterals.length && fs.existsSync(distAssetsDir)) {
            for (const entry of fs.readdirSync(distAssetsDir)) {
              if (!entry.endsWith('.js')) continue;
              const fp = path.join(distAssetsDir, entry);
              let code = fs.readFileSync(fp, 'utf8');
              let changed = false;
              for (const lit of deletedCssLiterals) {
                if (code.includes(lit)) {
                  code = code.split(lit).join('""');
                  changed = true;
                }
              }
              if (changed) {
                code = code.replace(/=>\s*i\.map\(\s*i\s*=>\s*d\[i\]\s*\)/g, '=>i.map(i=>d[i]).filter(Boolean)');
                fs.writeFileSync(fp, code, 'utf8');
              }
            }
          }
          const srcAssets = path.resolve(rootDir, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, { recursive: true, force: true });
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(rootDir, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
