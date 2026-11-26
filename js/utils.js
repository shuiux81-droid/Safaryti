import { CONFIG } from './config.js';
import { resolveHashedAssetPath } from './assetMap.js';
import {
  clamp,
  easeInOutQuad,
  formatArabicDate,
  formatViews,
} from './utils/coreFormatters.js';

export { clamp, easeInOutQuad, formatArabicDate, formatViews };

const reducedMotionQuery = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : { matches: false };
const mqMobileMax767 = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(max-width: 767.98px)')
  : null;
const mqSmallPhoneMax639 = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(max-width: 639.98px)')
  : null;
const mqTabletMin768 = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(min-width: 768px)')
  : null;
const mqDesktopMin1024 = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(min-width: 1024px)')
  : null;

export function getTabletMin768Query() {
  return mqTabletMin768;
}

export function getDesktopMin1024Query() {
  return mqDesktopMin1024;
}

export function isMobileViewport() {
  return mqMobileMax767 ? mqMobileMax767.matches : typeof window !== 'undefined' ? window.innerWidth < 768 : false;
}

export function isSmallPhoneViewport() {
  return mqSmallPhoneMax639 ? mqSmallPhoneMax639.matches : typeof window !== 'undefined' ? window.innerWidth < 640 : false;
}

export function isTabletOrLarger() {
  return mqTabletMin768 ? mqTabletMin768.matches : typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
}

export function isDesktopViewport() {
  return mqDesktopMin1024 ? mqDesktopMin1024.matches : typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
}

export function isReducedMotion() {
  return reducedMotionQuery.matches || document.documentElement.classList.contains('no-motion');
}

export function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function replaceLogoWithTextFallback(img, onDark) {
  if (!img || img.tagName !== 'IMG' || !img.parentNode || img.dataset.logoReplaced) return;
  if (typeof window !== 'undefined' && typeof window.__safarytiLogoFallback === 'function') {
    window.__safarytiLogoFallback(img, Boolean(onDark));
    return;
  }
  img.dataset.logoReplaced = '1';
  const span = document.createElement('span');
  span.className = 'logo-text-fallback' + (onDark ? ' is-on-dark' : '');
  if (img.id) span.id = img.id;
  span.textContent = 'سفريتي';
  span.setAttribute('aria-label', img.alt || 'سفريتي');
  if (img.style && img.style.cssText) span.style.cssText = img.style.cssText;
  const target = img.parentNode.tagName === 'PICTURE' ? img.parentNode : img;
  target.parentNode.replaceChild(span, target);
}

export function wireLogoFallback(img, onDark) {
  if (!img || img.tagName !== 'IMG') return;
  if (img.complete && img.naturalWidth === 0) {
    replaceLogoWithTextFallback(img, onDark);
    return;
  }
  if (img.dataset.logoFallbackWired) return;
  img.dataset.logoFallbackWired = '1';
  img.addEventListener(
    'error',
    () => {
      replaceLogoWithTextFallback(img, onDark);
    },
    { once: true }
  );
}

export function rawHtml(str) {
  return { __html: String(str == null ? '' : str) };
}

export function html(strings, ...values) {
  let out = '';
  for (let i = 0; i < strings.length; i++) {
    out += strings[i];
    if (i < values.length) {
      const val = values[i];
      if (val && typeof val === 'object' && Object.prototype.hasOwnProperty.call(val, '__html')) {
        out += val.__html;
      } else {
        out += esc(val);
      }
    }
  }
  return out;
}

export function waUrl(msg) {
  return 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(msg || 'تواصل مع ادارة سفريتي');
}

export function socialSvg(key) {
  if (key === 'facebook') {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/></svg>';
  }
  if (key === 'x') {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';
  }
  if (key === 'instagram') {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>';
  }
  return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002zM7 8.48H3V21h4V8.48zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68z"/></svg>';
}

export function arrowLeftSvg() {
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>';
}

export function arrowRightSvg() {
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
}

export function diagArrowSvg() {
  return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M17 17L7 7M7 7h8M7 7v8"/></svg>';
}

const PORTRAIT_896_STEMS = {
  about_temple_pillars_1794996471329: true,
  contact_temple_traveler_1795429682873: true,
};

const LANDSCAPE_1200_STEMS = {
  fact_giza_pyramids_1794996471282: true,
  fact_giza_sphinx_1794996471257: true,
  hero_ad_lodge_1795088418758: true,
  hero_ad_resort_1795088419124: true,
  about_airplane_wing_1795352381013: true,
};

const MOBILE_HERO_MAP = {
  hero_suez_canal_1794996466961: './mobile/hero-suez-m.webp 800w',
  about_temple_pillars_1794996471329: './mobile/hero-pillars-m.webp 640w',
  hero_marsa_alam_1794996468348: './mobile/hero-marsa-m.webp 800w',
};

const MOBILE_EXPAND_MAP = {
  expand_horizon_road_1794996468234: './mobile/expand-road-m.webp',
};

const MOBILE_M_STEMS = {
  about_airplane_wing_1795352381013: true,
  about_plane_sunset_roof_1795352382468: true,
  about_sunset_sky_1795352381897: true,
  about_temple_pillars_1794996471329: true,
  about_warm_clouds_1795352383366: true,
  contact_temple_traveler_1795429682873: true,
  expand_horizon_road_1794996468234: true,
  fact_giza_pyramids_1794996471282: true,
  fact_giza_sphinx_1794996471257: true,
  food_egyptian_street_1795420971065: true,
  food_sudanese_cuisine_1795420971980: true,
  food_world_cuisines_1795420971675: true,
  hero_ad_lodge_1795088418758: true,
  hero_ad_resort_1795088419124: true,
  hero_marsa_alam_1794996468348: true,
  hero_suez_canal_1794996466961: true,
  hero_taba_citadel_1794996468396: true,
  hero_zone_backdrop_1795088843394: true,
  region_americas_canyon_1794996470001: true,
  region_asia_landscape_1794996469512: true,
  region_europe_alpine_1794996469940: true,
  region_oceania_coast_1794996470039: true,
  region_south_america_andes_1794996469994: true,
};

function hashSrcset(srcsetStr) {
  if (!srcsetStr) return '';
  return String(srcsetStr)
    .split(',')
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return '';
      const sp = trimmed.search(/\s/);
      if (sp === -1) return resolveHashedAssetPath(trimmed);
      return resolveHashedAssetPath(trimmed.slice(0, sp)) + trimmed.slice(sp);
    })
    .filter(Boolean)
    .join(', ');
}

export function getResponsiveImageInfo(src, opts) {
  const s = String(src || '');
  if (!s || /^data:/i.test(s) || /\.svg(\?|$)/i.test(s)) return null;
  const srcAssetMatch = s.match(/^(.*\/src\/assets\/images\/([^/?#]+))\.jpe?g(\?.*)?$/i);
  if (srcAssetMatch) {
    const base = srcAssetMatch[1];
    const stem = srcAssetMatch[2];
    const rawMobile =
      opts && opts.isHero && MOBILE_HERO_MAP[stem]
        ? MOBILE_HERO_MAP[stem]
        : opts && opts.isExpand && MOBILE_EXPAND_MAP[stem]
          ? MOBILE_EXPAND_MAP[stem]
          : MOBILE_M_STEMS[stem]
            ? './mobile/m/' + stem + '-320w.webp 320w, ./mobile/m/' + stem + '-480w.webp 480w'
            : null;
    const mobileWebp = rawMobile ? hashSrcset(rawMobile) : null;
    if (PORTRAIT_896_STEMS[stem]) {
      return {
        webp: resolveHashedAssetPath(base + '.webp'),
        srcset: hashSrcset(base + '-240w.webp 240w, ' + base + '-480w.webp 480w, ' + base + '-640w.webp 640w, ' + base + '-760w.webp 760w, ' + base + '.webp 896w'),
        width: 896,
        height: 1200,
        mobileWebp,
      };
    }
    if (LANDSCAPE_1200_STEMS[stem]) {
      return {
        webp: resolveHashedAssetPath(base + '.webp'),
        srcset: hashSrcset(base + '-240w.webp 240w, ' + base + '-480w.webp 480w, ' + base + '-800w.webp 800w, ' + base + '.webp 1200w'),
        width: 1200,
        height: 896,
        mobileWebp,
      };
    }
    return {
      webp: resolveHashedAssetPath(base + '.webp'),
      srcset: hashSrcset(base + '-240w.webp 240w, ' + base + '-480w.webp 480w, ' + base + '-800w.webp 800w, ' + base + '-1120w.webp 1120w, ' + base + '.webp 1376w'),
      width: 1376,
      height: 768,
      mobileWebp,
    };
  }
  const partnerMatch = s.match(/^(.*\/partners\/(redsea-resort|oasis-lodge))\.jpe?g(\?.*)?$/i);
  if (partnerMatch) {
    return {
      webp: resolveHashedAssetPath(partnerMatch[1] + '.webp'),
      srcset: resolveHashedAssetPath(partnerMatch[1] + '.webp'),
      width: 600,
      height: 448,
      mobileWebp: resolveHashedAssetPath(
        partnerMatch[2] === 'redsea-resort' ? './mobile/redsea-resort-m.webp' : './mobile/oasis-lodge-m.webp'
      ),
    };
  }
  const logoMatch = s.match(/^(.*\/assets\/aistudio\/logo_ebd6693e)\.png(\?.*)?$/i);
  if (logoMatch) {
    const u = resolveHashedAssetPath(logoMatch[1] + '.webp');
    return { webp: u, srcset: u, width: 272, height: 112 };
  }
  const dbMatch = s.match(/^(.*\/assets\/aistudio\/1111_f9de6c5d)\.png(\?.*)?$/i);
  if (dbMatch) {
    const u = resolveHashedAssetPath(dbMatch[1] + '.webp');
    return { webp: u, srcset: u, width: 96, height: 96 };
  }
  return null;
}

const LAZY_GIF_DATA = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export function renderPictureHtml(src, opts) {
  opts = opts || {};
  const s = String(src || '');
  const info = getResponsiveImageInfo(s, opts);
  const resolvedFallback = info ? info.webp : resolveHashedAssetPath(s);
  const isLazySrc = Boolean(opts.lazySrc);
  const wAttr = opts.width != null ? opts.width : info && !opts.skipDims ? info.width : null;
  const hAttr = opts.height != null ? opts.height : info && !opts.skipDims ? info.height : null;
  let attrs = isLazySrc
    ? 'src="' + LAZY_GIF_DATA + '" data-lazy-src="' + esc(resolvedFallback) + '"'
    : 'src="' + esc(resolvedFallback) + '"';
  attrs += ' alt="' + esc(opts.alt || '') + '"';
  if (opts.id) attrs += ' id="' + esc(opts.id) + '"';
  if (opts.cls) attrs += ' class="' + esc(opts.cls) + '"';
  if (wAttr != null) attrs += ' width="' + esc(String(wAttr)) + '"';
  if (hAttr != null) attrs += ' height="' + esc(String(hAttr)) + '"';
  if (opts.loading) attrs += ' loading="' + esc(opts.loading) + '"';
  attrs += ' decoding="' + esc(opts.decoding || 'async') + '"';
  if (opts.fetchpriority) attrs += ' fetchpriority="' + esc(opts.fetchpriority) + '"';
  if (opts.referrerpolicy) attrs += ' referrerpolicy="' + esc(opts.referrerpolicy) + '"';
  if (opts.style) attrs += ' style="' + esc(opts.style) + '"';
  if (opts.onerror) attrs += ' onerror="' + opts.onerror + '"';
  if (opts.extraAttrs) attrs += ' ' + opts.extraAttrs;
  const imgTag = '<img ' + attrs + '>';
  if (!info) return imgTag;
  const sizesAttr = opts.sizes ? ' sizes="' + esc(opts.sizes) + '"' : '';
  const mobileSizesVal = opts.mobileSizes || opts.sizes || '';
  const mobileHasWidth = info.mobileWebp && /\s\d+w(?:,|$)/.test(info.mobileWebp);
  const mobileSizesAttr = mobileHasWidth && mobileSizesVal ? ' sizes="' + esc(mobileSizesVal) + '"' : '';
  const srcAttrName = isLazySrc ? 'data-lazy-srcset' : 'srcset';
  const mobileSource = info.mobileWebp
    ? '<source media="(max-width: 767px)" type="image/webp" ' + srcAttrName + '="' + esc(info.mobileWebp) + '"' + mobileSizesAttr + '>'
    : '';
  return '<picture>' + mobileSource + '<source type="image/webp" ' + srcAttrName + '="' + esc(info.srcset) + '"' + sizesAttr + '>' + imgTag + '</picture>';
}
