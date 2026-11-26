import { CONFIG } from '../config.js';
import { registerCleanup } from '../store.js';
import {
  esc,
  formatArabicDate,
  formatViews,
  isReducedMotion,
  isMobileViewport,
  isDesktopViewport,
  isTabletOrLarger,
  arrowLeftSvg,
  arrowRightSvg,
  diagArrowSvg,
  renderPictureHtml,
} from '../utils.js';
import {
  initScrollReveals,
  initTabsWidget,
  animateCountUp,
  initHeroPattern,
  hydrateLazyMedia,
} from '../utils/viewHelpers.js';
import { renderAdSlotHtml, activateAdSlots } from '../components/adSlots.js';
import { renderAsideFactsCardHtml, initFactsCarouselWidget } from '../components/factsCarousel.js';
import { renderAsideSearchHtml, renderAsidePopularTabsHtml, wireSharedAsideWidgets, initAsidePopTabsWidget } from '../components/sharedAside.js';
import { renderPicksCoverflowHtml, renderPicksControlsHtml, renderPicksGridHtml, initPicksCoverflow } from '../components/picksCoverflow.js';

function createHomeBuilders(isMobile, isDesktop, sortedStories) {
  function buildLatestContext() {
    const t1 = sortedStories.slice(0, 4);
    const t2 = CONFIG.popular
      .concat(CONFIG.picks)
      .filter(
        (p) =>
          p.category === 'المأكولات العالمية' ||
          p.category === 'التراث والتقاليد' ||
          p.title.indexOf('أكلات') !== -1 ||
          p.title.indexOf('الاكلات') !== -1 ||
          p.title.indexOf('الماكولات') !== -1
      )
      .slice(0, 4);
    const t3 = CONFIG.picks
      .filter((p) => p.isTip || p.category === 'نصائح السفر')
      .concat(CONFIG.stories)
      .slice(0, 4);
    return { t1, t2, t3 };
  }

  function formatLatestTag(cat) {
    if (cat === 'إفريقيا') return 'إفريقيا || القارة السمراء';
    if (cat === 'آسيا') return 'آسيا || سحر الشرق';
    if (cat === 'أوروبا') return 'أوروبا || القارة العجوز';
    return cat;
  }

  function renderLatestCard(item) {
    return (
      '<a href="' +
      esc(item.href) +
      '" class="latest-card">' +
      renderPictureHtml(item.image, {
        alt: item.title,
        cls: 'latest-card-img',
        loading: 'lazy',
        decoding: 'async',
        sizes: '(min-width: 1024px) 220px, (min-width: 640px) 45vw, 155px',
      }) +
      '<span class="latest-card-badge">' +
      esc(formatLatestTag(item.category)) +
      '</span>' +
      '<div class="latest-card-body">' +
      '<h3 class="latest-card-title">' +
      esc(item.title) +
      '</h3>' +
      '<div class="latest-card-meta">' +
      '<span class="latest-card-meta-item tabular">' +
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' +
      '<span>' +
      esc(String(item.views)) +
      '</span>' +
      '</span>' +
      '<span class="latest-card-meta-item tabular">' +
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
      '<span>' +
      esc(item.date) +
      '</span>' +
      '</span>' +
      '</div>' +
      '</div>' +
      '</a>'
    );
  }

  function buildExpandHtml() {
    const marqueeText = 'من نحن • سفريتي • اكتشف العالم معنا • من نحن • سفريتي • اكتشف العالم معنا • ';
    const canDeferExpand = isMobile && !isReducedMotion() && typeof window !== 'undefined' && 'IntersectionObserver' in window;
    return (
      '<section id="expand-wrapper" class="expand-wrapper" aria-label="من نحن">' +
      '<div class="expand-stage">' +
      '<div id="marquee-layer" class="marquee-layer">' +
      '<div class="marquee-track t-marquee" aria-hidden="true"><span>' +
      marqueeText +
      '</span><span>' +
      marqueeText +
      '</span></div>' +
      '</div>' +
      '<div id="expand-photo-layer" class="expand-photo-layer">' +
      renderPictureHtml(CONFIG.assets.expandImage, {
        alt: 'طريق ساحلي يلتقي بالبحر والجبال',
        isExpand: true,
        lazySrc: canDeferExpand,
        loading: 'lazy',
        decoding: 'async',
        sizes: '(min-width: 1024px) 1120px, 100vw',
      }) +
      '<div class="expand-scrim" aria-hidden="true"></div>' +
      '</div>' +
      '<div id="expand-overlay-text" class="expand-overlay-text">' +
      '<h2 class="t-h2 no-auto-ads">من نحن</h2>' +
      '<p class="expand-about-sub no-auto-ads">اكتشف العالم معنا في رحلة بلا حدود</p>' +
      '<p class="expand-about-body">هنا ستبدأ مغامراتكم وتنتهي بذكريات لا تُنسى. نحن فريق من عشاق السفر والمغامرات، نهدف إلى تقديم محتوى ثري وملهم لكل من يسعى لاكتشاف جمال هذا العالم الواسع. موقعنا هو دليلك الشامل لكل ما يخص السفر، ويحتوي على معلومات متنوعة حول مختلف الدول والقارات، فضلاً عن الأنشطة المثيرة وحيل السفر المفيدة.</p>' +
      '<div style="display:flex;justify-content:center;"><a href="#about" class="btn-primary-pill">اقرأ المزيد عنا</a></div>' +
      '</div>' +
      '</div>' +
      '</section>'
    );
  }

  function buildRegionsHtml() {
    const canDeferRegions = !isReducedMotion() && typeof window !== 'undefined' && 'IntersectionObserver' in window;
    const regionsHtml = CONFIG.regions
      .map((r, idx) => {
        const displayName = r.name;
        const btnName = r.shortName || r.name;
        const mediaHtml = renderPictureHtml(r.image, {
          alt: displayName,
          lazySrc: (idx > 0 || isMobile) && canDeferRegions,
          loading: 'lazy',
          decoding: 'async',
          sizes: '(min-width: 1024px) 1120px, 390px',
        });
        return (
          '<article class="region-scene' +
          (idx === 0 ? ' is-active' : '') +
          '" data-region-idx="' +
          idx +
          '" data-target-count="' +
          r.count +
          '" data-reveal>' +
          '<div class="region-scene-media">' +
          mediaHtml +
          '</div>' +
          '<div class="region-scene-scrim" aria-hidden="true"></div>' +
          '<div class="region-scene-content">' +
          '<div class="region-line-mask"><h3 class="t-scene region-line-inner no-auto-ads" style="--line-i:0">' +
          esc(displayName) +
          '</h3></div>' +
          '<div class="region-line-mask"><div class="region-count-row region-line-inner" style="--line-i:1"><span class="t-count region-count-num">' +
          r.count +
          '</span><span class="t-h3">قصة</span></div></div>' +
          '<div class="region-line-mask"><p class="t-lead region-line-inner" style="--line-i:2">استكشف ' +
          r.count +
          ' قصة وملفًا عن ' +
          esc(displayName) +
          '</p></div>' +
          '<div class="region-line-mask"><div class="region-line-inner" style="--line-i:3"><a href="#category/' +
          esc(r.slug) +
          '" class="btn-white-pill"><span>استكشف ' +
          esc(btnName) +
          '</span><span class="cta-circle" aria-hidden="true">' +
          diagArrowSvg() +
          '</span></a></div></div>' +
          '</div>' +
          '</article>'
        );
      })
      .join('');

    return (
      '<section id="regions-section" aria-label="قارات العالم">' +
      '<div class="container regions-section-head" data-reveal><h2 class="t-h2 no-auto-ads">اكتشف العالم</h2></div>' +
      '<div id="regions-wrapper" class="regions-wrapper">' +
      '<div class="regions-stage on-dark">' +
      regionsHtml +
      '<span id="region-scroll-hint" class="region-scroll-hint">(مرّر)</span>' +
      '<div id="region-progress-rail" class="region-progress-rail" aria-hidden="true">' +
      '<div class="region-seg-track"><div class="region-seg-fill"></div></div>' +
      '<div class="region-seg-track"><div class="region-seg-fill"></div></div>' +
      '<div class="region-seg-track"><div class="region-seg-fill"></div></div>' +
      '<div class="region-seg-track"><div class="region-seg-fill"></div></div>' +
      '<div class="region-seg-track"><div class="region-seg-fill"></div></div>' +
      '<div class="region-seg-track"><div class="region-seg-fill"></div></div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</section>'
    );
  }

  function buildLatestSectionHtml(t1) {
    return (
      '<section id="latest-section">' +
      '<div class="section-head" data-reveal><h2 class="t-h2 no-auto-ads latest-heading">جديد جولاتنا حول العالم</h2></div>' +
      '<div id="latest-tabs-widget">' +
      '<div class="tabs-bar" role="tablist" aria-label="أقسام القصص الحديثة">' +
      '<button type="button" role="tab" class="tab-btn" aria-selected="true" tabindex="0" data-tab-key="world">اكتشف العالم</button>' +
      '<button type="button" role="tab" class="tab-btn" aria-selected="false" tabindex="-1" data-tab-key="culture">ثقافات وتجارب</button>' +
      '<button type="button" role="tab" class="tab-btn" aria-selected="false" tabindex="-1" data-tab-key="tips">نصائح السفر</button>' +
      '<span class="tab-indicator" aria-hidden="true"></span>' +
      '</div>' +
      '<div role="tabpanel" class="tab-panel"><div class="latest-cards-grid">' +
      t1.map(renderLatestCard).join('') +
      '</div></div>' +
      '</div>' +
      '</section>'
    );
  }

  function buildPicksSectionHtml(skipGrid) {
    const isPicksCoverflow = isTabletOrLarger();
    const nPicks = CONFIG.picks.slice(0, 5).length;
    const picksHtml = renderPicksCoverflowHtml(isPicksCoverflow);
    const picksControlsHtml = isPicksCoverflow ? renderPicksControlsHtml(nPicks) : '';
    const picksGridHtml = skipGrid ? '' : renderPicksGridHtml();
    return (
      '<section id="picks-section" style="margin-top:2rem;">' +
      '<div class="section-head" data-reveal><div><h2 class="t-h2 no-auto-ads">من اختيارات المسافرين</h2><p class="t-lead section-sub">قصص يفضلها متابعينا</p></div></div>' +
      '<div class="picks-cf-root">' +
      '<div id="picks-cf-stage" class="picks-cf-stage" role="region"' +
      (isPicksCoverflow ? ' aria-roledescription="carousel" tabindex="0"' : '') +
      ' aria-label="من اختيارات المسافرين">' +
      picksHtml +
      '</div>' +
      picksControlsHtml +
      '</div>' +
      '<div class="picks-grid" style="margin-top:2rem;">' +
      picksGridHtml +
      '</div>' +
      '<div class="picks-grid-more"><a href="#all-stories" class="btn-primary-pill"><span>عرض المزيد من القصص</span>' +
      arrowLeftSvg() +
      '</a></div>' +
      '</section>'
    );
  }

  function buildMobileSearchHtml() {
    return !isDesktop
      ? '<section class="home-mobile-search-section" id="mobile-search-section" aria-label="البحث في القصص">' +
        '<div class="container">' +
        renderAsideSearchHtml('home-mobile') +
        '</div>' +
        '</section>'
      : '';
  }

  function buildMobileDiscoverHtml() {
    return !isDesktop
      ? '<section class="section-pad" id="discover-section">' +
        '<div class="container">' +
        renderAsidePopularTabsHtml('discover-tabs-widget') +
        '</div>' +
        '</section>' +
        '<div class="container">' +
        renderAdSlotHtml('AD-SB-HALF', { isMobileInline: true }) +
        '</div>'
      : '';
  }

  function buildMobileFactsHtml() {
    return !isDesktop
      ? '<section class="section-pad" id="facts-section" aria-label="مواضيع مقترحة">' +
        '<div class="container">' +
        renderAsideFactsCardHtml() +
        '</div>' +
        '</section>'
      : '';
  }

  function buildBelowHeroHtml(t1) {
    const desktopAsideHtml = isDesktop
      ? '<aside class="aside-stack" id="home-desktop-aside">' +
        renderAsideSearchHtml('home') +
        renderAdSlotHtml('AD-SB1', { wrapCls: 'is-aside' }) +
        renderAsidePopularTabsHtml('home-aside-pop-tabs') +
        renderAsideFactsCardHtml() +
        renderAdSlotHtml('AD-H4', { wrapCls: 'is-aside' }) +
        '</aside>'
      : '';

    return (
      buildExpandHtml() +
      buildRegionsHtml() +
      buildMobileSearchHtml() +
      '<div class="container home-split">' +
      '<div class="home-main-col">' +
      buildLatestSectionHtml(t1) +
      buildPicksSectionHtml() +
      '</div>' +
      desktopAsideHtml +
      '</div>' +
      buildMobileDiscoverHtml() +
      buildMobileFactsHtml()
    );
  }

  return {
    buildLatestContext,
    renderLatestCard,
    buildExpandHtml,
    buildRegionsHtml,
    buildLatestSectionHtml,
    buildPicksSectionHtml,
    buildMobileSearchHtml,
    buildMobileDiscoverHtml,
    buildMobileFactsHtml,
    buildBelowHeroHtml,
  };
}

function initBelowFoldCommon(main, deferReveals, initLatestTabsFn) {
  const mLayer = document.getElementById('marquee-layer');
  if (mLayer && isReducedMotion()) {
    mLayer.classList.add('is-paused');
  }

  const mobileScenes = Array.prototype.slice.call(document.querySelectorAll('.region-scene'));
  if (mobileScenes.length && !isDesktopViewport() && !isReducedMotion() && 'IntersectionObserver' in window) {
    const rIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const numEl = entry.target.querySelector('.region-count-num');
            const target = Number(entry.target.getAttribute('data-target-count') || 0);
            if (numEl) animateCountUp(numEl, target);
            rIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    mobileScenes.forEach((sc) => rIo.observe(sc));
    registerCleanup(() => rIo.disconnect());
  }

  function observeOnceNearViewport(el, rootMargin, initFn) {
    if (!el) return;
    let done = false;
    let io = null;
    const trigger = () => {
      if (done) return;
      done = true;
      if (io) {
        io.disconnect();
        io = null;
      }
      el.removeEventListener('pointerdown', trigger);
      el.removeEventListener('focusin', trigger);
      initFn();
    };
    if (!('IntersectionObserver' in window)) {
      trigger();
      return;
    }
    el.addEventListener('pointerdown', trigger, { passive: true });
    el.addEventListener('focusin', trigger);
    io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          trigger();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    registerCleanup(() => {
      el.removeEventListener('pointerdown', trigger);
      el.removeEventListener('focusin', trigger);
      if (io) io.disconnect();
    });
  }

  const isMob = isMobileViewport();
  const expLayer = document.getElementById('expand-photo-layer');
  if (expLayer && expLayer.querySelector('[data-lazy-src],[data-lazy-srcset]')) {
    observeOnceNearViewport(expLayer, isMob ? '100px 0px' : '350px 0px', () => {
      hydrateLazyMedia(expLayer);
    });
  }
  const regWrap = document.getElementById('regions-wrapper');
  if (regWrap && regWrap.querySelector('[data-lazy-src],[data-lazy-srcset]')) {
    if (isMob && 'IntersectionObserver' in window) {
      const lazyScenes = Array.prototype.slice.call(regWrap.querySelectorAll('.region-scene'));
      const sceneIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              hydrateLazyMedia(entry.target);
              sceneIo.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '250px 0px' }
      );
      lazyScenes.forEach((sc) => {
        if (sc.querySelector('[data-lazy-src],[data-lazy-srcset]')) sceneIo.observe(sc);
      });
      registerCleanup(() => sceneIo.disconnect());
    } else {
      observeOnceNearViewport(regWrap, '800px 0px', () => {
        hydrateLazyMedia(regWrap);
      });
    }
  }

  const nearMargin = '600px 0px';
  if (initLatestTabsFn) {
    observeOnceNearViewport(document.getElementById('latest-tabs-widget'), nearMargin, initLatestTabsFn);
  }
  observeOnceNearViewport(document.getElementById('discover-tabs-widget'), nearMargin, () => {
    initAsidePopTabsWidget(document.getElementById('discover-tabs-widget'));
  });
  observeOnceNearViewport(document.getElementById('home-aside-pop-tabs'), nearMargin, () => {
    initAsidePopTabsWidget(document.getElementById('home-aside-pop-tabs'));
  });
  observeOnceNearViewport(document.getElementById('picks-section'), nearMargin, initPicksCoverflow);
  observeOnceNearViewport(document.getElementById('aside-facts-card'), nearMargin, initFactsCarouselWidget);
  initHeroPattern();

  if (main) {
    if (deferReveals) {
      const scheduleReveals = () => initScrollReveals(main);
      if ('requestIdleCallback' in window) {
        const rIdleId = window.requestIdleCallback(scheduleReveals, { timeout: 600 });
        registerCleanup(() => {
          try {
            window.cancelIdleCallback(rIdleId);
          } catch (_e) {}
        });
      } else {
        const rTid = setTimeout(scheduleReveals, 16);
        registerCleanup(() => clearTimeout(rTid));
      }
    } else {
      initScrollReveals(main);
    }
  }
}

export function mountMobileChunkedBelowFold(main, ssrHeroBand, sortedStories, isCancelled, registerTimers) {
  if (typeof window !== 'undefined') window.__safarytiAnimateCountUp = animateCountUp;
  const b = createHomeBuilders(true, false, sortedStories);
  const scheduleStep = (fn) => {
    const run = () => {
      if (!isCancelled()) fn();
    };
    if (window.scrollY > 10 || !('requestIdleCallback' in window)) {
      const id = setTimeout(run, window.scrollY > 10 ? 0 : 16);
      if (registerTimers) registerTimers(id);
    } else {
      const idleId = window.requestIdleCallback(run, { timeout: 120 });
      registerCleanup(() => {
        try {
          window.cancelIdleCallback(idleId);
        } catch (_e) {}
      });
    }
  };

  scheduleStep(() => {
    if (!ssrHeroBand || !ssrHeroBand.isConnected) return;
    ssrHeroBand.insertAdjacentHTML('afterend', b.buildExpandHtml() + b.buildRegionsHtml());
    ssrHeroBand.removeAttribute('data-ssr-hero');
    scheduleStep(() => {
      const { t1, t2, t3 } = b.buildLatestContext();
      const splitHtml =
        b.buildMobileSearchHtml() +
        '<div class="container home-split" id="home-split-dyn">' +
        '<div class="home-main-col" id="home-main-col-dyn">' +
        b.buildLatestSectionHtml(t1) +
        '</div>' +
        '</div>';
      const regSec = document.getElementById('regions-section');
      if (regSec) regSec.insertAdjacentHTML('afterend', splitHtml);
      else main.insertAdjacentHTML('beforeend', splitHtml);
      scheduleStep(() => {
        const mainCol = document.getElementById('home-main-col-dyn');
        if (mainCol) mainCol.insertAdjacentHTML('beforeend', b.buildPicksSectionHtml(false));
        scheduleStep(() => {
          const splitEl = document.getElementById('home-split-dyn');
          const tailHtml = b.buildMobileDiscoverHtml() + b.buildMobileFactsHtml();
          if (splitEl) splitEl.insertAdjacentHTML('afterend', tailHtml);
          else main.insertAdjacentHTML('beforeend', tailHtml);
          scheduleStep(() => {
            activateAdSlots(main);
            const initLatestTabs = () => {
              initTabsWidget(document.getElementById('latest-tabs-widget'), (k) => {
                const list = k === 'world' ? t1 : k === 'culture' ? t2 : t3;
                return '<div class="latest-cards-grid">' + list.map(b.renderLatestCard).join('') + '</div>';
              });
            };
            scheduleStep(() => {
              wireSharedAsideWidgets(main, { deferFacts: true, deferTabs: true });
              initBelowFoldCommon(main, true, initLatestTabs);
            });
          });
        });
      });
    });
  });
}

export function renderFullHome(main, {
  ssrHeroBand,
  sortedStories,
  heroSlides,
  tickerStories,
  dayNum,
  monthYear,
  renderHeroSlideHtml,
  renderTickerItemHtml,
  initHeroAndTicker,
}) {
  if (typeof window !== 'undefined') window.__safarytiAnimateCountUp = animateCountUp;
  const isMobile = isMobileViewport();
  const isDesktop = isDesktopViewport();
  const b = createHomeBuilders(isMobile, isDesktop, sortedStories);
  const { t1: tab1Items, t2: tab2Items, t3: tab3Items } = b.buildLatestContext();
  const belowHeroHtml = b.buildBelowHeroHtml(tab1Items);

  if (ssrHeroBand) {
    ssrHeroBand.removeAttribute('data-ssr-hero');
    const nsEl = main.querySelector('noscript');
    if (nsEl) nsEl.remove();
    const ssrDayEl = document.getElementById('ssr-ticker-day');
    const ssrMyEl = document.getElementById('ssr-ticker-my');
    if (ssrDayEl) ssrDayEl.textContent = dayNum;
    if (ssrMyEl) ssrMyEl.textContent = monthYear;
    const slidesEl = ssrHeroBand.querySelector('.hero-slides');
    if (slidesEl && heroSlides.length > 1) {
      slidesEl.insertAdjacentHTML(
        'beforeend',
        heroSlides.slice(1).map((s, idx) => renderHeroSlideHtml(s, idx + 1)).join('')
      );
    }
    const tickerTrack = ssrHeroBand.querySelector('.ticker-track');
    if (tickerTrack && tickerStories.length > 1) {
      tickerTrack.insertAdjacentHTML(
        'beforeend',
        tickerStories.slice(1).map((s, idx) => renderTickerItemHtml(s, idx + 1)).join('')
      );
    }
    ssrHeroBand.insertAdjacentHTML('afterend', belowHeroHtml);
  } else {
    const heroHtml = heroSlides.map((s, i) => renderHeroSlideHtml(s, i)).join('');
    const dotsHtml = heroSlides
      .map((_, i) => {
        return (
          '<button type="button" class="hero-dot' +
          (i === 0 ? ' is-active' : '') +
          '" data-dot-idx="' +
          i +
          '" aria-label="الشريحة ' +
          (i + 1) +
          '"><span class="hero-dot-track"><span class="hero-dot-fill"></span></span></button>'
        );
      })
      .join('');
    const tickerHtml = tickerStories.map((s, i) => renderTickerItemHtml(s, i)).join('');

    main.innerHTML =
      '<section id="hero-band" class="hero-band no-auto-ads" aria-label="القصص المميزة">' +
      '<div class="hero-zone-inner">' +
      '<div id="hero-section" class="hero on-dark no-auto-ads">' +
      '<div class="hero-slides">' +
      heroHtml +
      '</div>' +
      '<div class="hero-controls">' +
      '<div class="hero-dots">' +
      dotsHtml +
      '</div>' +
      '<button type="button" id="hero-prev" class="hero-ctrl-btn" aria-label="السابق">' +
      arrowRightSvg() +
      '</button>' +
      '<button type="button" id="hero-next" class="hero-ctrl-btn" aria-label="التالي">' +
      arrowLeftSvg() +
      '</button>' +
      '<button type="button" id="hero-pause" class="hero-ctrl-btn" aria-label="إيقاف مؤقت" aria-pressed="false">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>' +
      '</button>' +
      '</div>' +
      '<div class="hero-ticker" aria-label="أحدث العناوين">' +
      '<div class="ticker-inner">' +
      '<div class="ticker-date-group"><span class="ticker-day">' +
      esc(dayNum) +
      '</span><span class="ticker-month-year">' +
      esc(monthYear) +
      '</span></div>' +
      '<div class="ticker-track">' +
      tickerHtml +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="hero-partner-col">' +
      renderAdSlotHtml('AD-H1', { wrapCls: 'is-hero-card', immediate: true }) +
      renderAdSlotHtml('AD-H2', { wrapCls: 'is-hero-card', immediate: true }) +
      '</div>' +
      '</div>' +
      '</section>' +
      belowHeroHtml;
  }

  activateAdSlots(main);
  initHeroAndTicker();
  wireSharedAsideWidgets(main, { deferFacts: true, deferTabs: true });
  const initLatestTabs = () => {
    initTabsWidget(document.getElementById('latest-tabs-widget'), (k) => {
      const list = k === 'world' ? tab1Items : k === 'culture' ? tab2Items : tab3Items;
      return '<div class="latest-cards-grid">' + list.map(b.renderLatestCard).join('') + '</div>';
    });
  };
  initBelowFoldCommon(main, false, initLatestTabs);
}
