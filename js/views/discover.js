import '../../css/routes/hub.css';
import { CONFIG, IMG } from '../config.js';
import { esc, diagArrowSvg, renderPictureHtml } from '../utils.js';
import { initScrollReveals } from '../utils/viewHelpers.js';
import { activateAdSlots } from '../components/adSlots.js';
import { renderHubHeaderHtml } from '../components/hubHeader.js';
import { renderGlobeFallbackSvg, initDiscoverInteractive } from '../components/regionGlobe.js';

export function renderDiscover(main) {
  const pageTitle = 'اكتشف العالم';
  const subText = 'ست وجهات ومئات القصص. اختر قارتك وابدأ رحلتك.';

  const regionOrder = ['asia', 'africa', 'europe', 'north-america', 'south-america', 'australia'];
  const regions = regionOrder
    .map((slug) => CONFIG.regions.filter((r) => r.slug === slug)[0])
    .filter(Boolean);
  const totalRegions = regions.length;

  function findRegionIndexBySlug(slug) {
    for (let i = 0; i < regions.length; i++) {
      if (regions[i].slug === slug) return i;
    }
    return -1;
  }

  function findRegionBySlug(slug) {
    const idx = findRegionIndexBySlug(slug);
    return idx >= 0 ? regions[idx] : regions[0];
  }

  function buildCardBgHtml(region) {
    return renderPictureHtml(region.image, {
      alt: '',
      cls: 'discover-card-bg-img',
      loading: 'eager',
      decoding: 'async',
      sizes: '(min-width: 1024px) 540px, 95vw',
      onerror: "this.style.display='none'",
    });
  }

  function buildCardContentHtml(region) {
    const count = region.hubCount != null ? region.hubCount : region.count;
    const btnName = region.shortName || region.name;

    return (
      '<div class="discover-card-top">' +
      '<span class="discover-card-pill tabular">' +
      esc(String(count)) +
      ' قصة</span>' +
      '</div>' +
      '<div class="discover-card-body">' +
      '<div class="discover-card-heading">' +
      '<h2 class="discover-card-title no-auto-ads">' +
      esc(region.name) +
      '</h2>' +
      '<p class="discover-card-sub">استكشف ' +
      esc(String(count)) +
      ' قصة عن ' +
      esc(region.name) +
      '</p>' +
      '</div>' +
      '<div class="discover-card-bottom">' +
      '<a href="#category/' +
      esc(region.slug) +
      '" class="btn-white-pill discover-card-cta">' +
      '<span>استكشف ' +
      esc(btnName) +
      '</span>' +
      '<span class="cta-circle" aria-hidden="true">' +
      diagArrowSvg() +
      '</span>' +
      '</a>' +
      '</div>' +
      '</div>'
    );
  }

  const initialIndex = 0;
  const initialRegion = regions[initialIndex];

  main.innerHTML =
    renderHubHeaderHtml(pageTitle, subText, IMG.asia) +
    '<div class="container">' +
    '<section id="discover-hero-split" class="discover-hero-split no-auto-ads" aria-label="نظرة عامة على الوجهات">' +
    '<div class="discover-hero-copy">' +
    '<div id="discover-carousel" class="discover-carousel" role="region" aria-roledescription="carousel" aria-label="مناطق سفريتي" tabindex="0">' +
    '<div id="discover-region-card" class="discover-region-card" role="group" aria-label="1 من ' +
    esc(String(totalRegions)) +
    '" data-active-region="' +
    esc(initialRegion.slug) +
    '">' +
    '<div class="discover-card-bg-layer">' +
    buildCardBgHtml(initialRegion) +
    '</div>' +
    '<div class="discover-card-scrim" aria-hidden="true"></div>' +
    '<div class="discover-card-content-layer">' +
    buildCardContentHtml(initialRegion) +
    '</div>' +
    '</div>' +
    '<div class="discover-carousel-controls">' +
    '<button type="button" id="discover-prev" class="discover-page-btn" aria-label="المنطقة السابقة">' +
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>' +
    '</button>' +
    '<span id="discover-counter" class="discover-page-counter tabular" dir="ltr" aria-live="polite" aria-atomic="true" aria-label="1 من ' +
    esc(String(totalRegions)) +
    '">' +
    '<span class="discover-page-cur">1</span>' +
    '<span class="discover-page-sep" aria-hidden="true">/</span>' +
    '<span class="discover-page-total">' +
    esc(String(totalRegions)) +
    '</span>' +
    '</span>' +
    '<button type="button" id="discover-next" class="discover-page-btn" aria-label="المنطقة التالية">' +
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>' +
    '</button>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div id="discover-globe-wrap" class="discover-globe-wrap" data-active-region="' +
    esc(initialRegion.slug) +
    '">' +
    renderGlobeFallbackSvg() +
    '<canvas id="discover-globe-canvas" class="discover-globe-canvas" data-testid="discover-globe-canvas" role="img" aria-label="كرة أرضية تفاعلية لست قارات ومناطق"></canvas>' +
    '<div id="discover-globe-tooltip" class="discover-globe-tooltip" role="status" aria-live="off"></div>' +
    '</div>' +
    '</section>' +
    '</div>';

  activateAdSlots(main);
  initScrollReveals(main);
  initDiscoverInteractive({
    regions,
    initialIndex,
    initialRegion,
    findRegionIndexBySlug,
    findRegionBySlug,
    buildCardBgHtml,
    buildCardContentHtml,
  });

  return 'اكتشف العالم | سفريتي';
}
