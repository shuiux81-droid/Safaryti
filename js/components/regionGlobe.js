import { REGION_GLOBE_TARGETS } from '../data/globeTargets.js';
import { registerCleanup } from '../store.js';
import { clamp, isReducedMotion, isDesktopViewport } from '../utils.js';

export function loadScriptOnce(src) {
  window.__SAFARYTI_SCRIPT_CACHE = window.__SAFARYTI_SCRIPT_CACHE || Object.create(null);
  if (window.__SAFARYTI_SCRIPT_CACHE[src]) return window.__SAFARYTI_SCRIPT_CACHE[src];
  window.__SAFARYTI_SCRIPT_CACHE[src] = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="' + src + '"]');
    if (existing && existing.dataset.loaded === '1') {
      resolve();
      return;
    }
    const s = existing || document.createElement('script');
    s.async = true;
    s.src = src;
    s.crossOrigin = 'anonymous';
    s.addEventListener(
      'load',
      () => {
        s.dataset.loaded = '1';
        resolve();
      },
      { once: true }
    );
    s.addEventListener(
      'error',
      () => {
        reject(new Error('Failed to load ' + src));
      },
      { once: true }
    );
    if (!existing) document.head.appendChild(s);
  });
  return window.__SAFARYTI_SCRIPT_CACHE[src];
}

export function loadGlobeAssetsOnce() {
  if (window.__SAFARYTI_GLOBE_PROMISE) return window.__SAFARYTI_GLOBE_PROMISE;
  window.__SAFARYTI_GLOBE_PROMISE = Promise.all([
    loadScriptOnce('https://cdn.jsdelivr.net/npm/d3-array@3/dist/d3-array.min.js').then(() =>
      loadScriptOnce('https://cdn.jsdelivr.net/npm/d3-geo@3/dist/d3-geo.min.js')
    ),
    loadScriptOnce('https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js'),
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then((r) => {
      if (!r.ok) throw new Error('world-atlas fetch failed');
      return r.json();
    }),
  ])
    .then((res) => {
      const topology = res[2];
      if (!window.d3 || !window.d3.geoOrthographic || !window.topojson || !topology || !topology.objects || !topology.objects.countries) {
        throw new Error('Globe dependencies unavailable');
      }
      const countries = window.topojson.feature(topology, topology.objects.countries);
      return { d3: window.d3, countries };
    })
    .catch(() => null);
  return window.__SAFARYTI_GLOBE_PROMISE;
}

export function renderGlobeFallbackSvg() {
  return (
    '<svg class="discover-globe-svg" viewBox="0 0 360 360" role="img" aria-label="خريطة العالم">' +
    '<defs>' +
    '<radialGradient id="hub-globe-grad" cx="38%" cy="32%" r="68%"><stop offset="0%" stop-color="#FFFDFB"/><stop offset="100%" stop-color="#EFE6DC"/></radialGradient>' +
    '<clipPath id="hub-globe-clip"><circle cx="180" cy="180" r="167"/></clipPath>' +
    '</defs>' +
    '<circle cx="180" cy="180" r="168" fill="url(#hub-globe-grad)" stroke="#CBCBCB" stroke-width="1.5"/>' +
    '<g clip-path="url(#hub-globe-clip)">' +
    '<g fill="none" stroke="#222222" stroke-opacity="0.08" stroke-width="1">' +
    '<ellipse cx="180" cy="180" rx="168" ry="62"/>' +
    '<ellipse cx="180" cy="180" rx="168" ry="118"/>' +
    '<ellipse cx="180" cy="180" rx="72" ry="168"/>' +
    '<ellipse cx="180" cy="180" rx="130" ry="168"/>' +
    '<line x1="12" y1="180" x2="348" y2="180"/>' +
    '<line x1="180" y1="12" x2="180" y2="348"/>' +
    '</g>' +
    '<g fill="#D6CEC4" stroke="#FBF6F1" stroke-width="1.1" stroke-linejoin="round">' +
    '<path data-region-svg="north-america" d="M36,96 L56,78 L88,68 L118,64 L132,76 L124,94 L112,102 L120,118 L106,136 L98,148 L106,162 L114,174 L104,178 L88,164 L78,146 L62,134 L52,114 Z"/>' +
    '<path data-region-svg="south-america" d="M112,182 L128,184 L144,200 L152,222 L142,250 L130,280 L122,302 L114,290 L114,262 L106,232 L104,204 Z"/>' +
    '<path data-region-svg="europe" d="M168,112 L162,96 L172,82 L188,68 L210,64 L228,74 L224,90 L212,100 L204,112 L190,116 L178,114 Z"/>' +
    '<path data-region-svg="africa" d="M164,126 L188,122 L210,130 L226,148 L234,168 L224,192 L222,216 L208,244 L196,260 L186,246 L182,214 L172,190 L156,168 L154,144 Z"/>' +
    '<path data-region-svg="asia" class="is-highlighted" d="M226,74 L258,68 L296,78 L322,102 L326,126 L310,148 L294,166 L278,178 L260,164 L248,176 L236,160 L226,142 L214,126 L220,104 Z"/>' +
    '<path data-region-svg="australia" d="M270,224 L292,216 L312,226 L316,246 L302,262 L280,260 L264,244 Z M324,254 L334,250 L330,268 L320,264 Z"/>' +
    '</g>' +
    '<circle cx="204" cy="134" r="3.5" fill="#222222" stroke="#FFFFFF" stroke-width="1.5"/>' +
    '</g>' +
    '</svg>'
  );
}

export function initDiscoverInteractive({ regions, initialIndex, initialRegion, findRegionIndexBySlug, findRegionBySlug, buildCardBgHtml, buildCardContentHtml }) {
  const totalRegions = regions.length;
  const splitSection = document.getElementById('discover-hero-split');
  const carouselEl = document.getElementById('discover-carousel');
  const cardEl = document.getElementById('discover-region-card');
  const prevBtn = document.getElementById('discover-prev');
  const nextBtn = document.getElementById('discover-next');
  const counterEl = document.getElementById('discover-counter');
  const counterCurEl = counterEl ? counterEl.querySelector('.discover-page-cur') : null;
  const globeWrap = document.getElementById('discover-globe-wrap');
  const canvas = document.getElementById('discover-globe-canvas');
  const tooltipEl = document.getElementById('discover-globe-tooltip');

  let activeIndex = initialIndex;
  let selectedRegion = initialRegion.slug;
  let currentRot = [-52, -16, 0];
  let globeData = null;
  let animRaf = null;
  const transTimers = [];
  let hasAutoSpun = false;
  let userSelected = false;
  let destroyed = false;

  function cubicEase22(t) {
    const c = clamp(t, 0, 1);
    if (c <= 0) return 0;
    if (c >= 1) return 1;
    const x1 = 0.22;
    const y1 = 1;
    const x2 = 0.36;
    const y2 = 1;
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;
    let u = c;
    for (let i = 0; i < 6; i++) {
      const err = ((ax * u + bx) * u + cx) * u - c;
      const dx = (3 * ax * u + 2 * bx) * u + cx;
      if (Math.abs(err) < 1e-5 || Math.abs(dx) < 1e-6) break;
      u = clamp(u - err / dx, 0, 1);
    }
    return clamp(((ay * u + by) * u + cy) * u, 0, 1);
  }

  function syncSvgHighlight() {
    if (!globeWrap) return;
    globeWrap.setAttribute('data-active-region', selectedRegion || '');
    globeWrap.querySelectorAll('[data-region-svg]').forEach((pathEl) => {
      const pSlug = pathEl.getAttribute('data-region-svg');
      pathEl.classList.toggle('is-highlighted', pSlug === selectedRegion);
    });
  }

  function syncCounterAndCardAria() {
    const oneBased = activeIndex + 1;
    if (cardEl) {
      cardEl.setAttribute('aria-label', oneBased + ' من ' + totalRegions);
      cardEl.setAttribute('data-active-region', selectedRegion);
    }
    if (counterCurEl) counterCurEl.textContent = String(oneBased);
    if (counterEl) counterEl.setAttribute('aria-label', oneBased + ' من ' + totalRegions);
  }

  function updateRegionCard(region, direction) {
    if (!cardEl) return;
    const bgHtml = buildCardBgHtml(region);
    const contentHtml = buildCardContentHtml(region);

    if (isReducedMotion()) {
      const curBg = cardEl.querySelector('.discover-card-bg-layer');
      const curContent = cardEl.querySelector('.discover-card-content-layer');
      if (curBg) curBg.innerHTML = bgHtml;
      if (curContent) curContent.innerHTML = contentHtml;
      return;
    }

    const oldBgs = Array.prototype.slice.call(cardEl.querySelectorAll('.discover-card-bg-layer'));
    const newBg = document.createElement('div');
    newBg.className = 'discover-card-bg-layer is-entering';
    newBg.innerHTML = bgHtml;
    const scrimEl = cardEl.querySelector('.discover-card-scrim');
    if (scrimEl) cardEl.insertBefore(newBg, scrimEl);
    else cardEl.appendChild(newBg);

    oldBgs.forEach((bgLayer) => {
      bgLayer.classList.add('is-leaving');
      const bgTid = setTimeout(() => {
        if (bgLayer.parentNode === cardEl) cardEl.removeChild(bgLayer);
      }, 520);
      transTimers.push(bgTid);
    });

    const oldContents = Array.prototype.slice.call(cardEl.querySelectorAll('.discover-card-content-layer'));
    oldContents.forEach((contentLayer) => {
      contentLayer.classList.add('is-leaving');
      const cTid = setTimeout(() => {
        if (contentLayer.parentNode === cardEl) cardEl.removeChild(contentLayer);
      }, 420);
      transTimers.push(cTid);
    });

    const newContent = document.createElement('div');
    newContent.className = 'discover-card-content-layer ' + (direction === 'prev' ? 'is-enter-prev' : 'is-enter-next');
    newContent.innerHTML = contentHtml;
    cardEl.appendChild(newContent);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (destroyed) return;
        newBg.classList.remove('is-entering');
        newContent.classList.remove('is-enter-next', 'is-enter-prev');
      });
    });
  }

  function buildProjection(size) {
    if (!globeData) return null;
    return globeData.d3
      .geoOrthographic()
      .translate([size / 2, size / 2])
      .scale(size * 0.465)
      .clipAngle(90)
      .rotate(currentRot);
  }

  function drawCanvasGlobe() {
    if (!globeData || !canvas || !globeWrap) return;
    const rect = globeWrap.getBoundingClientRect();
    const size = Math.max(120, Math.round(rect.width || 420));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const px = Math.round(size * dpr);
    if (canvas.width !== px || canvas.height !== px) {
      canvas.width = px;
      canvas.height = px;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const d3 = globeData.d3;
    const projection = buildProjection(size);
    const pathGen = d3.geoPath(projection, ctx);

    ctx.beginPath();
    pathGen({ type: 'Sphere' });
    const grad = ctx.createRadialGradient(size * 0.38, size * 0.34, size * 0.05, size * 0.5, size * 0.5, size * 0.5);
    grad.addColorStop(0, '#FFFDFB');
    grad.addColorStop(1, '#EFE6DC');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#CBCBCB';
    ctx.lineWidth = 1.25;
    ctx.stroke();

    ctx.beginPath();
    pathGen(d3.geoGraticule10());
    ctx.strokeStyle = 'rgba(34, 34, 34, 0.08)';
    ctx.lineWidth = 0.75;
    ctx.stroke();

    const selectedIds = selectedRegion && REGION_GLOBE_TARGETS[selectedRegion] ? REGION_GLOBE_TARGETS[selectedRegion].isoIds : [];
    const features = globeData.countries.features || [];

    for (let i = 0; i < features.length; i++) {
      const f = features[i];
      const isoNum = Number(f.id);
      const isSel = selectedIds.indexOf(isoNum) !== -1;
      ctx.beginPath();
      pathGen(f);
      ctx.fillStyle = isSel ? 'rgba(233, 51, 20, 0.85)' : '#D6CEC4';
      ctx.fill();
      ctx.strokeStyle = isSel ? '#FFFFFF' : '#FBF6F1';
      ctx.lineWidth = isSel ? 0.9 : 0.6;
      ctx.stroke();
    }

    const egyptCoord = [31.2357, 30.0444];
    const viewCenter = [-currentRot[0], -currentRot[1]];
    if (d3.geoDistance(egyptCoord, viewCenter) <= Math.PI / 2 - 0.04) {
      const pinPt = projection(egyptCoord);
      if (pinPt && Number.isFinite(pinPt[0]) && Number.isFinite(pinPt[1])) {
        ctx.beginPath();
        ctx.arc(pinPt[0], pinPt[1], 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#222222';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  function rotateToRegion(slug) {
    if (!slug || !REGION_GLOBE_TARGETS[slug]) {
      drawCanvasGlobe();
      return;
    }
    const target = REGION_GLOBE_TARGETS[slug].rotate;
    if (animRaf) {
      cancelAnimationFrame(animRaf);
      animRaf = null;
    }
    if (isReducedMotion() || !globeData) {
      currentRot = target.slice();
      drawCanvasGlobe();
      return;
    }
    const from = currentRot.slice();
    const dLon = ((((target[0] - from[0]) % 360) + 540) % 360) - 180;
    const dLat = target[1] - from[1];
    const dRoll = target[2] - from[2];
    const start = performance.now();
    const dur = 1200;
    function step(now) {
      if (destroyed) return;
      const t = clamp((now - start) / dur, 0, 1);
      const eased = cubicEase22(t);
      currentRot = [from[0] + dLon * eased, from[1] + dLat * eased, from[2] + dRoll * eased];
      drawCanvasGlobe();
      if (t < 1) {
        animRaf = requestAnimationFrame(step);
      } else {
        animRaf = null;
      }
    }
    animRaf = requestAnimationFrame(step);
  }

  function hideTooltip() {
    if (tooltipEl) tooltipEl.classList.remove('is-visible');
  }

  function showTooltip(slug, clientX, clientY) {
    if (!tooltipEl || !globeWrap || !slug) {
      hideTooltip();
      return;
    }
    const reg = findRegionBySlug(slug);
    const count = reg.hubCount != null ? reg.hubCount : reg.count;
    const displayName = reg.shortName || reg.name;
    tooltipEl.textContent = displayName + ' · ' + count + ' قصة';
    const rect = globeWrap.getBoundingClientRect();
    const tipW = tooltipEl.offsetWidth || 120;
    const tipH = tooltipEl.offsetHeight || 30;
    const x = clamp(clientX - rect.left + 12, 8, Math.max(8, rect.width - tipW - 8));
    const y = clamp(clientY - rect.top - tipH - 10, 8, Math.max(8, rect.height - tipH - 8));
    tooltipEl.style.transform = 'translate3d(' + Math.round(x) + 'px, ' + Math.round(y) + 'px, 0)';
    tooltipEl.classList.add('is-visible');
  }

  function goToIndex(nextIndex, direction, opts) {
    const wrapped = ((nextIndex % totalRegions) + totalRegions) % totalRegions;
    const nextRegion = regions[wrapped];
    if (!nextRegion) return;
    const options = opts || {};
    const changed = wrapped !== activeIndex;
    activeIndex = wrapped;
    selectedRegion = nextRegion.slug;
    syncCounterAndCardAria();
    syncSvgHighlight();
    if (changed && !options.skipTransition) {
      updateRegionCard(nextRegion, direction || 'next');
    }
    if (options.rotate !== false) {
      rotateToRegion(selectedRegion);
    } else {
      drawCanvasGlobe();
    }
  }

  function goToRegionSlug(slug, opts) {
    const targetIdx = findRegionIndexBySlug(slug);
    if (targetIdx < 0) return;
    const dir = targetIdx >= activeIndex ? 'next' : 'prev';
    goToIndex(targetIdx, dir, opts);
  }

  function findRegionSlugByIso(isoId) {
    const num = Number(isoId);
    if (!Number.isFinite(num)) return '';
    const keys = Object.keys(REGION_GLOBE_TARGETS);
    for (let i = 0; i < keys.length; i++) {
      if (REGION_GLOBE_TARGETS[keys[i]].isoIds.indexOf(num) !== -1) {
        return keys[i];
      }
    }
    return '';
  }

  function hitTestGlobe(clientX, clientY) {
    if (!globeData || !globeWrap) return '';
    const rect = globeWrap.getBoundingClientRect();
    const size = Math.max(120, Math.round(rect.width || 420));
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const radius = size * 0.465;
    const dx = x - size / 2;
    const dy = y - size / 2;
    if (dx * dx + dy * dy > radius * radius) return '';
    const projection = buildProjection(size);
    if (!projection || !projection.invert) return '';
    const lonLat = projection.invert([x, y]);
    if (!lonLat || !Number.isFinite(lonLat[0]) || !Number.isFinite(lonLat[1])) return '';
    const d3 = globeData.d3;
    const features = globeData.countries.features || [];
    for (let i = 0; i < features.length; i++) {
      if (d3.geoContains(features[i], lonLat)) {
        return findRegionSlugByIso(features[i].id);
      }
    }
    return '';
  }

  function triggerInitialAsiaSpinIfReady() {
    if (hasAutoSpun || userSelected || destroyed) return;
    if (!isDesktopViewport() || !globeData) return;
    hasAutoSpun = true;
    goToIndex(0, 'next', { rotate: true, skipTransition: true });
  }

  let globeInitialized = false;
  function ensureGlobeLoaded() {
    if (globeInitialized || !isDesktopViewport() || !canvas) return;
    globeInitialized = true;
    loadGlobeAssetsOnce().then((assets) => {
      if (destroyed || !assets) return;
      globeData = assets;
      if (isReducedMotion()) {
        currentRot = REGION_GLOBE_TARGETS[selectedRegion].rotate.slice();
      }
      drawCanvasGlobe();
      if (globeWrap) globeWrap.classList.add('is-canvas-ready');
      if (splitSection) {
        const r = splitSection.getBoundingClientRect();
        const vh = window.innerHeight || 900;
        const visibleH = Math.min(r.bottom, vh) - Math.max(r.top, 0);
        if (r.height > 0 && visibleH / r.height >= 0.3) {
          triggerInitialAsiaSpinIfReady();
        }
      }
    });
  }

  if (splitSection && 'IntersectionObserver' in window) {
    const loadIo = new IntersectionObserver(
      (entries) => {
        if (entries.some((en) => en.isIntersecting)) {
          ensureGlobeLoaded();
          loadIo.disconnect();
        }
      },
      { rootMargin: '600px' }
    );
    loadIo.observe(splitSection);
    registerCleanup(() => {
      loadIo.disconnect();
    });
  } else {
    ensureGlobeLoaded();
  }

  if (splitSection && 'IntersectionObserver' in window) {
    const splitIo = new IntersectionObserver(
      (entries) => {
        for (let i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting && entries[i].intersectionRatio >= 0.3) {
            if (globeData) {
              triggerInitialAsiaSpinIfReady();
            }
            splitIo.disconnect();
            break;
          }
        }
      },
      { threshold: 0.3 }
    );
    splitIo.observe(splitSection);
    registerCleanup(() => {
      splitIo.disconnect();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      userSelected = true;
      hasAutoSpun = true;
      goToIndex(activeIndex - 1, 'prev', { rotate: true });
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      userSelected = true;
      hasAutoSpun = true;
      goToIndex(activeIndex + 1, 'next', { rotate: true });
    });
  }

  if (carouselEl) {
    carouselEl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        userSelected = true;
        hasAutoSpun = true;
        goToIndex(activeIndex - 1, 'prev', { rotate: true });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        userSelected = true;
        hasAutoSpun = true;
        goToIndex(activeIndex + 1, 'next', { rotate: true });
      }
    });
  }

  if (cardEl) {
    let swipeStartX = 0;
    let swipeStartY = 0;
    let swipeTracking = false;
    let swipeBlockedClick = false;
    let swipeTimer = null;

    cardEl.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      swipeStartX = e.clientX;
      swipeStartY = e.clientY;
      swipeTracking = true;
      swipeBlockedClick = false;
    });
    cardEl.addEventListener('pointerup', (e) => {
      if (!swipeTracking) return;
      swipeTracking = false;
      const dx = e.clientX - swipeStartX;
      const dy = e.clientY - swipeStartY;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
        swipeBlockedClick = true;
        userSelected = true;
        hasAutoSpun = true;
        if (dx > 0) {
          goToIndex(activeIndex + 1, 'next', { rotate: true });
        } else {
          goToIndex(activeIndex - 1, 'prev', { rotate: true });
        }
        clearTimeout(swipeTimer);
        swipeTimer = setTimeout(() => {
          swipeBlockedClick = false;
        }, 140);
      }
    });
    cardEl.addEventListener('pointercancel', () => {
      swipeTracking = false;
      swipeBlockedClick = false;
    });
    cardEl.addEventListener(
      'click',
      (e) => {
        if (swipeBlockedClick) {
          e.preventDefault();
          swipeBlockedClick = false;
        }
      },
      true
    );
    registerCleanup(() => {
      clearTimeout(swipeTimer);
    });
  }

  if (canvas) {
    let pointerDown = false;
    let downX = 0;
    let downY = 0;
    let lastX = 0;
    let lastY = 0;
    let didDrag = false;

    canvas.addEventListener('pointerdown', (e) => {
      if (!globeData) return;
      pointerDown = true;
      didDrag = false;
      downX = e.clientX;
      downY = e.clientY;
      lastX = e.clientX;
      lastY = e.clientY;
      if (canvas.setPointerCapture) {
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch (_err) {}
      }
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!globeData) return;
      if (pointerDown) {
        if (!didDrag && Math.hypot(e.clientX - downX, e.clientY - downY) >= 4) {
          didDrag = true;
          canvas.classList.add('is-dragging');
          hideTooltip();
          if (animRaf) {
            cancelAnimationFrame(animRaf);
            animRaf = null;
          }
        }
        if (didDrag) {
          const dx = e.clientX - lastX;
          const dy = e.clientY - lastY;
          lastX = e.clientX;
          lastY = e.clientY;
          currentRot = [currentRot[0] + dx * 0.45, clamp(currentRot[1] - dy * 0.45, -75, 75), 0];
          drawCanvasGlobe();
        }
        return;
      }
      const hitSlug = hitTestGlobe(e.clientX, e.clientY);
      canvas.classList.toggle('is-land-hover', Boolean(hitSlug));
      if (hitSlug) {
        showTooltip(hitSlug, e.clientX, e.clientY);
      } else {
        hideTooltip();
      }
    });
    canvas.addEventListener('pointerup', (e) => {
      if (!pointerDown) return;
      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      pointerDown = false;
      canvas.classList.remove('is-dragging');
      if (dist < 4 && globeData) {
        const hitSlug = hitTestGlobe(e.clientX, e.clientY);
        if (hitSlug) {
          userSelected = true;
          hasAutoSpun = true;
          goToRegionSlug(hitSlug, { rotate: true });
        }
      }
      didDrag = false;
    });
    canvas.addEventListener('pointercancel', () => {
      pointerDown = false;
      didDrag = false;
      canvas.classList.remove('is-dragging');
    });
    canvas.addEventListener('pointerleave', () => {
      canvas.classList.remove('is-land-hover');
      hideTooltip();
    });
  }

  if (globeWrap) {
    globeWrap.querySelectorAll('[data-region-svg]').forEach((pathEl) => {
      const sSlug = pathEl.getAttribute('data-region-svg');
      pathEl.addEventListener('mouseenter', (e) => {
        showTooltip(sSlug, e.clientX, e.clientY);
      });
      pathEl.addEventListener('mousemove', (e) => {
        showTooltip(sSlug, e.clientX, e.clientY);
      });
      pathEl.addEventListener('mouseleave', () => {
        hideTooltip();
      });
      pathEl.addEventListener('click', () => {
        userSelected = true;
        hasAutoSpun = true;
        goToRegionSlug(sSlug, { rotate: true });
      });
    });
  }

  const onGlobeResize = () => {
    if (isDesktopViewport()) {
      if (!globeInitialized) ensureGlobeLoaded();
      else drawCanvasGlobe();
    } else {
      hideTooltip();
    }
  };
  window.addEventListener('resize', onGlobeResize, { passive: true });
  registerCleanup(() => {
    destroyed = true;
    if (animRaf) cancelAnimationFrame(animRaf);
    transTimers.forEach((tid) => {
      clearTimeout(tid);
    });
    window.removeEventListener('resize', onGlobeResize);
  });
}
