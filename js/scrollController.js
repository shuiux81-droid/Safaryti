import { getState, setState } from './store.js';
import { clamp, easeInOutQuad } from './utils/coreFormatters.js';
import {
  isReducedMotion,
  isDesktopViewport,
  isTabletOrLarger,
  isSmallPhoneViewport,
} from './utils.js';

let footerInView = false;
let hasFooterObserver = false;

export function updateScrollEffects(preReadScrollY) {
  const { currentView, activeSceneIndex } = getState();
  const isDesk = isDesktopViewport();
  const isTab = isTabletOrLarger();
  const isMobileHomeAtZero = preReadScrollY === 0 && currentView === 'home' && !isTab;
  const y = isMobileHomeAtZero ? 0 : typeof preReadScrollY === 'number' ? preReadScrollY : window.scrollY || window.pageYOffset || 0;
  const ih = isMobileHomeAtZero ? 844 : window.innerHeight || 900;
  const isPhone = isSmallPhoneViewport();
  const reduced = isReducedMotion();

  const header = document.getElementById('site-header');
  const logoPill = document.getElementById('header-logo-pill');
  const progBar = document.getElementById('reading-progress');
  const tocFills = currentView === 'article' && progBar ? document.querySelectorAll('.article-toc-track-fill') : null;
  const promo = document.getElementById('floating-callout');
  const footer = promo && !hasFooterObserver && !isMobileHomeAtZero ? document.getElementById('site-footer') : null;
  const expandWrap = !reduced && (isTab || y > 10) ? document.getElementById('expand-wrapper') : null;
  const regWrap = isDesk && !reduced ? document.getElementById('regions-wrapper') : null;

  // --- READ PHASE (batch all layout reads before any writes) ---
  const docH = progBar && currentView === 'article' ? Math.max(1, document.documentElement.scrollHeight - ih) : 0;
  const fRect = promo && footer ? footer.getBoundingClientRect() : null;
  const expRect = expandWrap ? expandWrap.getBoundingClientRect() : null;
  const rwTop = regWrap ? regWrap.offsetTop : 0;
  const rwH = regWrap ? regWrap.offsetHeight : 0;

  let aboutData = null;
  if (currentView === 'about') {
    const scWrap = document.getElementById('about-scatter-wrapper');
    const storySec = document.getElementById('about-story-section');
    const photoA = document.getElementById('about-photo-a');
    const photoB = document.getElementById('about-photo-b');
    const travelersLayerEl = document.getElementById('about-travelers');
    const closingSec = document.getElementById('about-closing-section');
    const closingMedia = document.getElementById('about-closing-media');
    const revealsToActivate = [];
    if (storySec) {
      storySec.querySelectorAll('[data-about-reveal]').forEach((b) => {
        if (!b.classList.contains('is-revealed') && b.getBoundingClientRect().top < ih * 0.96) {
          revealsToActivate.push(b);
        }
      });
    }
    let rectA = null;
    let rectB = null;
    let swTop = 0;
    let swH = 0;
    let cRect = null;
    if (isDesk && !reduced) {
      if (!getState().aboutTravelerMetrics && window.__safarytiMeasureAbout) window.__safarytiMeasureAbout();
      rectA = photoA ? photoA.getBoundingClientRect() : null;
      rectB = photoB ? photoB.getBoundingClientRect() : null;
      swTop = scWrap ? scWrap.offsetTop : 0;
      swH = scWrap ? scWrap.offsetHeight : 0;
      cRect = closingSec && closingMedia ? closingSec.getBoundingClientRect() : null;
    }
    aboutData = {
      scWrap,
      storySec,
      travelersLayerEl,
      closingMedia,
      revealsToActivate,
      rectA,
      rectB,
      swTop,
      swH,
      cRect,
    };
  }

  // --- WRITE PHASE ---
  if (header && header.classList.contains('is-scrolled') !== (y > 8)) {
    header.classList.toggle('is-scrolled', y > 8);
  }
  if (logoPill && logoPill.style.transform && logoPill.style.transform !== 'none') {
    logoPill.style.transform = 'none';
  }

  if (progBar) {
    if (currentView === 'article') {
      progBar.classList.add('is-active');
      const artProgress = clamp(y / docH, 0, 1);
      progBar.style.transform = 'scaleX(' + artProgress.toFixed(4) + ')';
      if (tocFills) {
        for (let tf = 0; tf < tocFills.length; tf++) {
          tocFills[tf].style.transform = 'scaleY(' + artProgress.toFixed(4) + ')';
        }
      }
    } else if (progBar.classList.contains('is-active')) {
      progBar.classList.remove('is-active');
    }
  }

  if (promo) {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem('safaryti_promo_closed') === '1';
    } catch (_e) {}
    if (promo.classList.contains('is-visible') !== !dismissed) {
      promo.classList.toggle('is-visible', !dismissed);
    }
    if (hasFooterObserver) {
      if (promo.classList.contains('is-hidden-footer') !== footerInView) {
        promo.classList.toggle('is-hidden-footer', footerInView);
      }
    } else if (fRect) {
      const hideFooter = fRect.top < ih;
      if (promo.classList.contains('is-hidden-footer') !== hideFooter) {
        promo.classList.toggle('is-hidden-footer', hideFooter);
      }
    }
  }

  if (expandWrap && expRect) {
    const photoLayer = document.getElementById('expand-photo-layer');
    const marqueeLayer = document.getElementById('marquee-layer');
    const overlayText = document.getElementById('expand-overlay-text');
    const pExp = clamp((ih * 0.95 - expRect.top) / Math.max(1, ih * 0.55), 0, 1);
    const eExp = pExp < 0.5 ? 2 * pExp * pExp : 1 - Math.pow(-2 * pExp + 2, 2) / 2;
    const vIn = (isPhone ? 18 : 14) * (1 - eExp);
    const hIn = (isPhone ? 12 : 30) * (1 - eExp);
    const rad = (isPhone ? 28 : 40) * (1 - eExp);
    if (photoLayer) {
      photoLayer.style.clipPath = 'inset(' + vIn.toFixed(2) + 'vh ' + hIn.toFixed(2) + 'vw round ' + rad.toFixed(2) + 'px)';
    }
    if (marqueeLayer) {
      marqueeLayer.style.opacity = String(1 - clamp((pExp - 0.55) / 0.35, 0, 1));
    }
    if (overlayText) {
      const ov = clamp((pExp - 0.62) / 0.25, 0, 1);
      overlayText.style.opacity = String(ov);
      overlayText.classList.toggle('is-visible', ov > 0.35);
    }
  }

  if (regWrap) {
    const pReg = clamp((y - rwTop) / Math.max(1, rwH - ih), 0, 1);
    const idx = Math.min(5, Math.floor(pReg * 6));
    const scenes = regWrap.querySelectorAll('.region-scene');
    scenes.forEach((sc, i) => {
      sc.classList.toggle('is-active', i === idx);
    });
    const inRegionView = y + ih * 0.6 >= rwTop && y <= rwTop + rwH;
    if (inRegionView && idx !== activeSceneIndex) {
      setState({ activeSceneIndex: idx });
      const activeScene = scenes[idx];
      if (activeScene) {
        const numEl = activeScene.querySelector('.region-count-num');
        const targetNum = Number(activeScene.getAttribute('data-target-count') || 0);
        if (numEl && window.__safarytiAnimateCountUp) window.__safarytiAnimateCountUp(numEl, targetNum);
      }
    }
    const fills = regWrap.querySelectorAll('.region-seg-fill');
    fills.forEach((fill, i) => {
      fill.style.transform = 'scaleX(' + clamp(pReg * 6 - i, 0, 1).toFixed(4) + ')';
    });
    const hint = document.getElementById('region-scroll-hint');
    if (hint) hint.classList.toggle('is-hidden', pReg > 0.02);
  }

  if (aboutData) {
    const {
      scWrap,
      storySec,
      travelersLayerEl,
      closingMedia,
      revealsToActivate,
      rectA,
      rectB,
      swTop,
      swH,
      cRect,
    } = aboutData;

    revealsToActivate.forEach((b) => {
      b.classList.add('is-revealed');
    });

    if (isDesk && !reduced) {
      const metrics = getState().aboutTravelerMetrics;
      const validMetrics = Boolean(
        scWrap &&
          storySec &&
          metrics &&
          rectA &&
          rectA.width > 0 &&
          rectA.height > 0 &&
          rectB &&
          rectB.width > 0 &&
          rectB.height > 0 &&
          metrics.temple.startRect.width > 0 &&
          metrics.wing.startRect.width > 0
      );

      if (validMetrics) {
        if (travelersLayerEl) travelersLayerEl.style.display = '';
        const photoATopDoc = rectA.top + y;
        const denomAb = Math.max(1, photoATopDoc - swTop - 0.2 * ih);
        const pAb = clamp((y - swTop) / denomAb, 0, 1);
        const stageTopAb = Math.max(0, swTop - y);
        const passedTarget = y >= swTop + swH || rectA.top <= 0.2 * ih || pAb >= 1;

        let tFlight = 0;
        let txFlight = 0;
        if (passedTarget) {
          tFlight = 1;
          txFlight = 1;
        } else if (pAb > 0.25) {
          tFlight = easeInOutQuad(clamp((pAb - 0.25) / 0.75, 0, 1));
          txFlight = tFlight;
        }

        const handedOff = passedTarget || tFlight >= 1;
        const pairs = [
          { meta: metrics.temple, targetRect: rectA },
          { meta: metrics.wing, targetRect: rectB },
        ];

        storySec.classList.toggle('is-flying', !handedOff);
        storySec.classList.toggle('is-landed', handedOff);

        for (let pi = 0; pi < pairs.length; pi++) {
          const pair = pairs[pi];
          const trEl = pair.meta.el;
          const sr = pair.meta.startRect;
          if (handedOff) {
            trEl.style.opacity = '0';
            trEl.style.visibility = 'hidden';
          } else {
            let fx, fy, fs;
            if (pAb <= 0.25) {
              const kDrift = 1 - pAb / 0.25;
              fx = sr.left;
              fy = stageTopAb + sr.top + pair.meta.driftYAt0 * kDrift;
              fs = 1;
            } else {
              const tr = pair.targetRect;
              fx = sr.left + (tr.left - sr.left) * txFlight;
              fy = sr.top + (tr.top - sr.top) * tFlight;
              fs = (sr.width + (tr.width - sr.width) * tFlight) / Math.max(1, sr.width);
            }
            trEl.style.visibility = 'visible';
            trEl.style.opacity = '1';
            trEl.style.transform =
              'translate3d(' + fx.toFixed(2) + 'px, ' + fy.toFixed(2) + 'px, 0) scale(' + fs.toFixed(5) + ')';
            trEl.style.setProperty('--s', fs.toFixed(5));
          }
        }
      } else {
        if (travelersLayerEl) travelersLayerEl.style.display = 'none';
        if (storySec) {
          storySec.classList.remove('is-flying');
          storySec.classList.add('is-landed');
        }
      }
      if (cRect && closingMedia) {
        const tCl = clamp((ih - cRect.top) / Math.max(1, ih * 0.6), 0, 1);
        const cV = (10 * (1 - tCl)).toFixed(2);
        const cH = (8 * (1 - tCl)).toFixed(2);
        const cR = (2.5 * (1 - tCl)).toFixed(2);
        closingMedia.style.clipPath = 'inset(' + cV + 'vh ' + cH + 'vw round ' + cR + 'rem)';
      }
    } else {
      if (travelersLayerEl) travelersLayerEl.style.display = 'none';
      if (storySec) {
        storySec.classList.remove('is-flying');
        storySec.classList.add('is-landed');
      }
      if (closingMedia) closingMedia.style.clipPath = '';
    }
  }
}

export function initScrollController() {
  const footerEl = document.getElementById('site-footer');
  if (footerEl && 'IntersectionObserver' in window) {
    hasFooterObserver = true;
    const fIo = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        footerInView = entry.isIntersecting;
        const promoEl = document.getElementById('floating-callout');
        if (promoEl) promoEl.classList.toggle('is-hidden-footer', footerInView);
      },
      { threshold: 0 }
    );
    fIo.observe(footerEl);
  }
  let scrollScheduled = false;
  let resizeScheduled = false;
  const schedule = () => {
    if (!scrollScheduled) {
      scrollScheduled = true;
      requestAnimationFrame(() => {
        scrollScheduled = false;
        updateScrollEffects();
      });
    }
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener(
    'resize',
    () => {
      if (!resizeScheduled) {
        resizeScheduled = true;
        requestAnimationFrame(() => {
          resizeScheduled = false;
          updateScrollEffects();
        });
      }
    },
    { passive: true }
  );
}
