import { CONFIG } from '../config.js';
import { resolveHashedAssetPath } from '../assetMap.js';
import { setState, registerCleanup } from '../store.js';
import { clamp } from './coreFormatters.js';
import {
  esc,
  getResponsiveImageInfo,
  renderPictureHtml,
  isMobileViewport,
  isDesktopViewport,
  isReducedMotion,
} from '../utils.js';

export function toWebpUrl(src) {
  const info = getResponsiveImageInfo(src);
  return info ? info.webp : resolveHashedAssetPath(String(src || ''));
}

export function toBgImageSetCss(src) {
  const s = String(src || '');
  const info = getResponsiveImageInfo(s);
  const hashedRaw = resolveHashedAssetPath(s);
  if (!info) return "url('" + esc(hashedRaw) + "')";
  const mime = /\.png(\?|$)/i.test(s) ? 'image/png' : 'image/jpeg';
  return "image-set(url('" + esc(info.webp) + "') type('image/webp'), url('" + esc(hashedRaw) + "') type('" + mime + "'))";
}

export function hydrateLazyMedia(root) {
  if (!root) return;
  root.querySelectorAll('source[data-lazy-srcset]').forEach((srcEl) => {
    const val = srcEl.getAttribute('data-lazy-srcset');
    if (val) srcEl.setAttribute('srcset', val);
    srcEl.removeAttribute('data-lazy-srcset');
  });
  root.querySelectorAll('img[data-lazy-src]').forEach((imgEl) => {
    const val = imgEl.getAttribute('data-lazy-src');
    if (val) imgEl.setAttribute('src', val);
    imgEl.removeAttribute('data-lazy-src');
  });
}

export function renderMediaBox(src, alt, cls, eager, sizes) {
  const imgHtml = renderPictureHtml(src, {
    alt: alt || '',
    loading: eager ? 'eager' : 'lazy',
    fetchpriority: eager ? 'high' : '',
    decoding: 'async',
    sizes: sizes || '(min-width: 1024px) 340px, (min-width: 640px) 46vw, 92vw',
    onerror: "this.closest('.media-box').classList.add('is-fallback')",
  });
  return (
    '<div class="media-box ' +
    (cls || '') +
    '">' +
    imgHtml +
    '<div class="media-fallback-mark" aria-hidden="true"><img src="' +
    esc(CONFIG.assets.logoLight) +
    '" alt="" decoding="async" onerror="window.__safarytiLogoFallback&&window.__safarytiLogoFallback(this,true)"></div>' +
    '</div>'
  );
}

export function initScrollReveals(root) {
  const nodes = Array.prototype.slice.call((root || document).querySelectorAll('[data-reveal]'));
  if (!nodes.length) return;
  if (isReducedMotion() || !('IntersectionObserver' in window)) {
    nodes.forEach((n) => n.classList.add('is-revealed'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      const batch = entries.filter((e) => e.isIntersecting || e.boundingClientRect.bottom < 0);
      batch.forEach((entry, idx) => {
        const el = entry.target;
        el.style.setProperty('--reveal-delay', Math.min(idx, 5) * 80 + 'ms');
        el.classList.add('is-revealed');
        io.unobserve(el);
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -4% 0px' }
  );
  nodes.forEach((n) => io.observe(n));
  registerCleanup(() => io.disconnect());
}

export function initTabsWidget(container, onSwitch) {
  if (!container) return;
  const bar = container.querySelector('.tabs-bar');
  const indicator = container.querySelector('.tab-indicator');
  const tabs = Array.prototype.slice.call(container.querySelectorAll('[role="tab"]'));
  const panel = container.querySelector('[role="tabpanel"]');
  if (!bar || !indicator || !tabs.length || !panel) return;

  function positionIndicator(btn) {
    if (typeof window !== 'undefined' && window.getComputedStyle && window.getComputedStyle(indicator).display === 'none') {
      return;
    }
    const bRect = bar.getBoundingClientRect();
    const tRect = btn.getBoundingClientRect();
    const x = tRect.left - bRect.left + bar.scrollLeft;
    indicator.style.width = tRect.width + 'px';
    indicator.style.transform = 'translateX(' + x + 'px)';
  }

  let tabInitRaf = null;
  let tabIo = null;
  const scheduleInitialIndicator = () => {
    if (tabInitRaf !== null) return;
    tabInitRaf = requestAnimationFrame(() => {
      tabInitRaf = null;
      const cur = tabs.filter((t) => t.getAttribute('aria-selected') === 'true')[0] || tabs[0];
      positionIndicator(cur);
    });
  };
  if (isMobileViewport() && 'IntersectionObserver' in window) {
    tabIo = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          tabIo.disconnect();
          tabIo = null;
          scheduleInitialIndicator();
        }
      },
      { rootMargin: '400px 0px' }
    );
    tabIo.observe(container);
  } else {
    scheduleInitialIndicator();
  }
  let tabResizeRaf = null;
  const ro = () => {
    if (tabResizeRaf === null) {
      tabResizeRaf = requestAnimationFrame(() => {
        tabResizeRaf = null;
        const cur = tabs.filter((t) => t.getAttribute('aria-selected') === 'true')[0] || tabs[0];
        positionIndicator(cur);
      });
    }
  };
  window.addEventListener('resize', ro, { passive: true });
  registerCleanup(() => {
    if (tabInitRaf !== null) cancelAnimationFrame(tabInitRaf);
    if (tabIo) tabIo.disconnect();
    if (tabResizeRaf !== null) cancelAnimationFrame(tabResizeRaf);
    window.removeEventListener('resize', ro);
  });

  let switchTimer = null;
  function selectTab(btn) {
    if (btn.getAttribute('aria-selected') === 'true') return;
    tabs.forEach((t) => {
      t.setAttribute('aria-selected', 'false');
      t.tabIndex = -1;
    });
    btn.setAttribute('aria-selected', 'true');
    btn.tabIndex = 0;
    positionIndicator(btn);
    const key = btn.getAttribute('data-tab-key');
    if (isReducedMotion()) {
      panel.innerHTML = onSwitch(key);
      return;
    }
    clearTimeout(switchTimer);
    panel.classList.add('is-fading-out');
    switchTimer = setTimeout(() => {
      panel.innerHTML = onSwitch(key);
      panel.classList.remove('is-fading-out');
      panel.classList.add('is-entering');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          panel.classList.remove('is-entering');
        });
      });
    }, 200);
  }
  registerCleanup(() => clearTimeout(switchTimer));

  tabs.forEach((btn, idx) => {
    btn.addEventListener('click', () => selectTab(btn));
    btn.addEventListener('keydown', (e) => {
      let nextIdx = idx;
      if (e.key === 'ArrowRight') nextIdx = (idx - 1 + tabs.length) % tabs.length;
      else if (e.key === 'ArrowLeft') nextIdx = (idx + 1) % tabs.length;
      else return;
      e.preventDefault();
      tabs[nextIdx].focus();
      selectTab(tabs[nextIdx]);
    });
  });
}

const countAnimMap = Object.create(null);

export function animateCountUp(el, target) {
  if (isReducedMotion()) {
    el.textContent = String(target);
    return;
  }
  if (countAnimMap[el.dataset.regionCountId]) {
    cancelAnimationFrame(countAnimMap[el.dataset.regionCountId]);
  }
  const id = el.dataset.regionCountId || String(Math.random());
  el.dataset.regionCountId = id;
  const start = performance.now();
  const dur = 1200;
  function tick(now) {
    const t = clamp((now - start) / dur, 0, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = String(Math.round(eased * target));
    if (t < 1) {
      countAnimMap[id] = requestAnimationFrame(tick);
    }
  }
  countAnimMap[id] = requestAnimationFrame(tick);
}

export function measureAboutTravelers() {
  const travelersLayer = document.getElementById('about-travelers');
  if (!isDesktopViewport() || isReducedMotion()) {
    setState({ aboutTravelerMetrics: null });
    if (travelersLayer) travelersLayer.style.display = 'none';
    return;
  }
  const stage = document.getElementById('about-scatter-stage');
  const anchorWing = document.getElementById('about-anchor-wing');
  const anchorTemple = document.getElementById('about-anchor-temple');
  const trWing = document.getElementById('about-traveler-wing');
  const trTemple = document.getElementById('about-traveler-temple');
  if (!stage || !anchorWing || !anchorTemple || !trWing || !trTemple) {
    setState({ aboutTravelerMetrics: null });
    return;
  }
  if (travelersLayer) travelersLayer.style.display = '';
  const stRect = stage.getBoundingClientRect();
  const wRect = anchorWing.getBoundingClientRect();
  const tRect = anchorTemple.getBoundingClientRect();
  if (
    stRect.width <= 0 ||
    stRect.height <= 0 ||
    wRect.width <= 0 ||
    wRect.height <= 0 ||
    tRect.width <= 0 ||
    tRect.height <= 0
  ) {
    setState({ aboutTravelerMetrics: null });
    if (travelersLayer) travelersLayer.style.display = 'none';
    return;
  }
  const ih = window.innerHeight || 900;

  trWing.style.width = wRect.width.toFixed(2) + 'px';
  trWing.style.height = wRect.height.toFixed(2) + 'px';
  trTemple.style.width = tRect.width.toFixed(2) + 'px';
  trTemple.style.height = tRect.height.toFixed(2) + 'px';

  setState({
    aboutTravelerMetrics: {
      stageHeight: stRect.height,
      wing: {
        el: trWing,
        startRect: {
          left: wRect.left,
          top: wRect.top - stRect.top,
          width: wRect.width,
          height: wRect.height,
        },
        driftYAt0: Math.min(36, 0.04 * ih),
      },
      temple: {
        el: trTemple,
        startRect: {
          left: tRect.left,
          top: tRect.top - stRect.top,
          width: tRect.width,
          height: tRect.height,
        },
        driftYAt0: -Math.min(32, 0.035 * ih),
      },
    },
  });
}

export function initHeroPattern(bandId) {
  const targetId = bandId || 'hero-band';
  const band = document.getElementById(targetId);
  if (!band) return;
  const routeId = targetId + '-route-a';
  const innerGrid = band.querySelector('.hero-zone-inner');
  const NS = 'http://www.w3.org/2000/svg';
  const XLINK = 'http://www.w3.org/1999/xlink';

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function contourPath(cx, cy, rx, ry, rotDeg, wobble, seed) {
    const rand = mulberry32(seed);
    const n = 14;
    const rad = (rotDeg * Math.PI) / 180;
    const cosR = Math.cos(rad);
    const sinR = Math.sin(rad);
    const pts = [];
    for (let k = 0; k < n; k++) {
      const theta = (2 * Math.PI * k) / n;
      const fk = 1 + wobble * (2 * rand() - 1);
      const dx = rx * fk * Math.cos(theta);
      const dy = ry * fk * Math.sin(theta);
      pts.push({
        x: cx + dx * cosR - dy * sinR,
        y: cy + dx * sinR + dy * cosR,
      });
    }
    let d = 'M' + pts[0].x.toFixed(1) + ',' + pts[0].y.toFixed(1);
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % n];
      const p3 = pts[(i + 2) % n];
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      d +=
        ' C' +
        c1x.toFixed(1) +
        ',' +
        c1y.toFixed(1) +
        ' ' +
        c2x.toFixed(1) +
        ',' +
        c2y.toFixed(1) +
        ' ' +
        p2.x.toFixed(1) +
        ',' +
        p2.y.toFixed(1);
    }
    return d + ' Z';
  }

  function buildRulerD(x, yStart, height, step, dir) {
    const count = Math.floor(height / step);
    let d = 'M' + x.toFixed(1) + ',' + yStart.toFixed(1) + ' V' + (yStart + height).toFixed(1);
    for (let k = 0; k <= count; k++) {
      const y = yStart + k * step;
      const len = k % 10 === 0 ? 13 : k % 5 === 0 ? 9 : 5;
      d += ' M' + x.toFixed(1) + ',' + y.toFixed(1) + ' h' + dir * len;
    }
    return d;
  }

  function el(tag, attrs) {
    const node = document.createElementNS(NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => node.setAttribute(k, String(attrs[k])));
    }
    return node;
  }

  let svgEl = null;
  let idleId = null;
  let resizeTimer = null;

  function buildSvg() {
    if (!band.isConnected) return;
    const rect = band.getBoundingClientRect();
    const W = Math.round(rect.width);
    const H = Math.round(rect.height);
    if (W <= 0 || H <= 0) return;

    const isDesktop = isDesktopViewport();
    const reduced = isReducedMotion();

    const svg = el('svg', {
      class: 'hero-pattern',
      'aria-hidden': 'true',
      focusable: 'false',
      width: W,
      height: H,
    });

    const stepA = isDesktop ? 58 : 40;
    for (let i = 0; i < 9; i++) {
      const rxA = 70 + stepA * i;
      const ryA = 0.6 * rxA;
      const isIdxA = i % 4 === 3;
      svg.appendChild(
        el('path', {
          class: 'hero-contour',
          'data-family': 'A',
          'data-ring': i,
          d: contourPath(W - 110, 70, rxA, ryA, -14, 0.08, 7),
          fill: 'none',
          stroke: '#222222',
          'stroke-opacity': isIdxA ? '0.11' : '0.055',
          'stroke-width': isIdxA ? '1.25' : '1',
          'vector-effect': 'non-scaling-stroke',
        })
      );
    }

    if (isDesktop) {
      for (let j = 0; j < 9; j++) {
        const rxB = 64 + 56 * j;
        const ryB = 0.62 * rxB;
        const isIdxB = j % 4 === 3;
        svg.appendChild(
          el('path', {
            class: 'hero-contour',
            'data-family': 'B',
            'data-ring': j,
            d: contourPath(110, H - 70, rxB, ryB, 12, 0.09, 19),
            fill: 'none',
            stroke: '#222222',
            'stroke-opacity': isIdxB ? '0.11' : '0.055',
            'stroke-width': isIdxB ? '1.25' : '1',
            'vector-effect': 'non-scaling-stroke',
          })
        );
      }

      const gridRect = innerGrid ? innerGrid.getBoundingClientRect() : rect;
      const gridLeft = gridRect.left - rect.left;
      const gridRight = gridRect.right - rect.left;
      const rulerAttrs = {
        class: 'hero-ruler',
        fill: 'none',
        stroke: '#222222',
        'stroke-opacity': '0.22',
        'stroke-width': '1',
        'vector-effect': 'non-scaling-stroke',
      };
      const rL = el('path', rulerAttrs);
      rL.setAttribute('d', buildRulerD(gridLeft - 16, 96, 480, 12, -1));
      svg.appendChild(rL);
      const rR = el('path', rulerAttrs);
      rR.setAttribute('d', buildRulerD(gridRight + 16, 96, 480, 12, 1));
      svg.appendChild(rR);

      const routeD =
        'M ' +
        (W + 40).toFixed(1) +
        ',' +
        (H - 36).toFixed(1) +
        ' C ' +
        (0.86 * W).toFixed(1) +
        ',' +
        (H - 62).toFixed(1) +
        ' ' +
        (0.64 * W).toFixed(1) +
        ',' +
        (H - 14).toFixed(1) +
        ' ' +
        (0.46 * W).toFixed(1) +
        ',' +
        (H - 38).toFixed(1) +
        ' S ' +
        (0.16 * W).toFixed(1) +
        ',' +
        (H - 60).toFixed(1) +
        ' -40,' +
        (H - 30).toFixed(1);
      const routePath = el('path', {
        id: routeId,
        class: 'hero-route',
        d: routeD,
        fill: 'none',
        stroke: '#e93314',
        'stroke-opacity': '0.55',
        'stroke-width': '2',
        'stroke-dasharray': '0.1 10',
        'stroke-linecap': 'round',
        'vector-effect': 'non-scaling-stroke',
      });
      svg.appendChild(routePath);

      if (svgEl && svgEl.parentNode) {
        svgEl.parentNode.replaceChild(svg, svgEl);
      } else {
        band.insertBefore(svg, band.firstChild);
      }
      svgEl = svg;

      let totalLen = 0;
      try {
        totalLen = routePath.getTotalLength();
      } catch (_e) {}

      [0.2, 0.5, 0.82].forEach((frac) => {
        if (totalLen <= 0) return;
        const pt = routePath.getPointAtLength(totalLen * frac);
        svg.appendChild(
          el('circle', {
            class: 'hero-route-stop',
            cx: pt.x.toFixed(1),
            cy: pt.y.toFixed(1),
            r: '3.5',
            fill: '#FBF6F1',
            stroke: '#e93314',
            'stroke-opacity': '0.7',
            'stroke-width': '1.5',
            'vector-effect': 'non-scaling-stroke',
          })
        );
      });

      const planeOuter = el('g', { class: 'hero-plane' });
      const planeBody = el('path', {
        d: 'M12 0 L-8 -7 L-4 0 L-8 7 Z',
        fill: '#e93314',
        'fill-opacity': '0.9',
      });
      const planeLine = el('path', {
        d: 'M-4 0 L12 0',
        stroke: '#ffffff',
        'stroke-opacity': '0.8',
        'stroke-width': '1',
        'vector-effect': 'non-scaling-stroke',
      });

      if (reduced) {
        const posLen = totalLen * 0.55;
        const pMid = totalLen > 0 ? routePath.getPointAtLength(posLen) : { x: W * 0.45, y: H - 38 };
        const pPrev = totalLen > 0 ? routePath.getPointAtLength(Math.max(0, posLen - 2)) : { x: pMid.x + 2, y: pMid.y };
        const pNext = totalLen > 0 ? routePath.getPointAtLength(Math.min(totalLen, posLen + 2)) : { x: pMid.x - 2, y: pMid.y };
        const ang = (Math.atan2(pNext.y - pPrev.y, pNext.x - pPrev.x) * 180) / Math.PI;
        planeOuter.setAttribute('opacity', '1');
        planeOuter.setAttribute('transform', 'translate(' + pMid.x.toFixed(1) + ',' + pMid.y.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')');
        planeOuter.appendChild(planeBody);
        planeOuter.appendChild(planeLine);
      } else {
        const animMot = el('animateMotion', {
          dur: '90s',
          repeatCount: 'indefinite',
          rotate: 'auto',
        });
        const mpath = el('mpath', { href: '#' + routeId });
        mpath.setAttributeNS(XLINK, 'xlink:href', '#' + routeId);
        animMot.appendChild(mpath);

        const animOp = el('animate', {
          attributeName: 'opacity',
          values: '0;1;1;0',
          keyTimes: '0;.06;.94;1',
          dur: '90s',
          repeatCount: 'indefinite',
        });
        planeOuter.appendChild(planeBody);
        planeOuter.appendChild(planeLine);
        planeOuter.appendChild(animMot);
        planeOuter.appendChild(animOp);
      }
      svg.appendChild(planeOuter);

      if (document.hidden && typeof svg.pauseAnimations === 'function') {
        svg.pauseAnimations();
      }
    } else {
      if (svgEl && svgEl.parentNode) {
        svgEl.parentNode.replaceChild(svg, svgEl);
      } else {
        band.insertBefore(svg, band.firstChild);
      }
      svgEl = svg;
    }
  }

  let delayTimerId = null;
  const startPatternIdle = () => {
    delayTimerId = null;
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(buildSvg, { timeout: isMobileViewport() ? 1000 : 300 });
    } else {
      idleId = window.setTimeout(buildSvg, 300);
    }
  };
  if (isMobileViewport()) {
    delayTimerId = window.setTimeout(startPatternIdle, 3800);
  } else {
    startPatternIdle();
  }

  let ro = null;
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildSvg, 150);
    });
    ro.observe(band);
  }

  const onVisPattern = () => {
    if (!svgEl) return;
    if (document.hidden) {
      if (typeof svgEl.pauseAnimations === 'function') svgEl.pauseAnimations();
    } else if (!isReducedMotion()) {
      if (typeof svgEl.unpauseAnimations === 'function') svgEl.unpauseAnimations();
    }
  };
  document.addEventListener('visibilitychange', onVisPattern);

  const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const onMqChange = () => buildSvg();
  if (mq && mq.addEventListener) mq.addEventListener('change', onMqChange);

  registerCleanup(() => {
    if ('cancelIdleCallback' in window && idleId !== null) {
      try {
        window.cancelIdleCallback(idleId);
      } catch (_e) {}
    }
    clearTimeout(delayTimerId);
    clearTimeout(idleId);
    clearTimeout(resizeTimer);
    if (ro) ro.disconnect();
    document.removeEventListener('visibilitychange', onVisPattern);
    if (mq && mq.removeEventListener) mq.removeEventListener('change', onMqChange);
  });
}
