import '../../css/routes/hub.css';
import { CONFIG, IMG } from '../config.js';
import { esc, formatArabicDate, formatViews, arrowLeftSvg, renderPictureHtml } from '../utils.js';
import { getAllCatalog } from '../utils/searchHelpers.js';
import { filterTipsStories } from '../safarytiLogic.js';
import { initScrollReveals } from '../utils/viewHelpers.js';
import { activateAdSlots } from '../components/adSlots.js';
import { renderHubHeaderHtml } from '../components/hubHeader.js';

export function renderTips(main) {
  const pageTitle = 'نصائح السفر';
  const subText = 'إرشادات عملية لتخطيط رحلاتك والتنقل بذكاء وسفر آمن ومريح.';

  const planningTheme = CONFIG.themes.filter((t) => t.slug === 'trip-planning')[0] || {
    slug: 'trip-planning',
    name: 'تخطيط الرحلات والتنقل',
    count: 74,
    image: IMG.aboutWing,
  };

  const catalog = getAllCatalog();
  const initialStories = filterTipsStories(catalog, 'all', 3);

  function renderThemeCardHtml(theme) {
    return (
      '<a href="#category/' +
      esc(theme.slug) +
      '" class="hub-card theme-hub-card hub-reveal-card" data-reveal>' +
      (theme.image
        ? renderPictureHtml(theme.image, {
            alt: '',
            cls: 'hub-card-img',
            loading: 'lazy',
            decoding: 'async',
            sizes: '(min-width: 1024px) 520px, 95vw',
            onerror: "this.style.display='none'",
          })
        : '') +
      '<div class="hub-card-scrim" aria-hidden="true"></div>' +
      '<div class="hub-card-top">' +
      '<span class="hub-glass-pill tabular">' +
      esc(String(theme.count)) +
      ' قصة</span>' +
      '</div>' +
      '<div class="hub-card-bottom">' +
      '<div class="hub-card-text">' +
      '<h2 class="hub-card-title no-auto-ads">' +
      esc(theme.name) +
      '</h2>' +
      '<p class="hub-card-sub">استكشف ' +
      esc(String(theme.count)) +
      ' قصة في ' +
      esc(theme.name) +
      '</p>' +
      '</div>' +
      '<span class="hub-card-arrow" aria-hidden="true">' +
      arrowLeftSvg() +
      '</span>' +
      '</div>' +
      '</a>'
    );
  }

  function renderTipCardHtml(story) {
    const hasImg = Boolean(story.image && String(story.image).trim());
    const mediaCls = 'culture-story-media' + (hasImg ? '' : ' is-fallback');
    return (
      '<a href="' +
      esc(story.href || '#article/' + story.id) +
      '" data-reveal class="culture-story-card hub-reveal-card" data-story-sub="' +
      esc(story.sub || 'tips') +
      '">' +
      '<div class="' +
      mediaCls +
      '">' +
      (hasImg
        ? renderPictureHtml(story.image, {
            alt: story.title,
            cls: 'culture-story-img',
            loading: 'lazy',
            decoding: 'async',
            sizes: '(min-width: 1024px) 340px, 90vw',
            onerror: "this.closest('.culture-story-media').classList.add('is-fallback')",
          })
        : '') +
      '<div class="culture-story-fallback" aria-hidden="true"><img src="' +
      esc(CONFIG.assets.logo) +
      '" alt="" decoding="async" onerror="window.__safarytiLogoFallback&&window.__safarytiLogoFallback(this,false)"></div>' +
      '</div>' +
      '<div class="culture-story-body">' +
      '<span class="culture-story-title-wrap"><h3 class="culture-story-title">' +
      esc(story.title) +
      '</h3></span>' +
      '<div class="culture-story-meta">' +
      '<span>' +
      esc(formatArabicDate(story.date)) +
      '</span>' +
      '<span aria-hidden="true">·</span>' +
      '<span class="tabular">' +
      esc(formatViews(story.views)) +
      '</span>' +
      '</div>' +
      '</div>' +
      '</a>'
    );
  }

  main.innerHTML =
    renderHubHeaderHtml(pageTitle, subText, IMG.expand) +
    '<div class="container">' +
    '<section class="hub-section" aria-label="نصائح السفر">' +
    '<div class="culture-columns">' +
    '<div class="culture-col">' +
    renderThemeCardHtml(planningTheme) +
    '</div>' +
    '</div>' +
    '<div class="culture-latest-section" aria-labelledby="tips-latest-title">' +
    '<div class="culture-latest-header">' +
    '<h2 id="tips-latest-title" class="culture-latest-heading no-auto-ads">أحدث القصص</h2>' +
    '</div>' +
    '<div id="tips-stories-grid" class="culture-stories-grid">' +
    initialStories.map((s) => renderTipCardHtml(s)).join('') +
    '</div>' +
    '</div>' +
    '</section>' +
    '</div>';

  activateAdSlots(main);
  initScrollReveals(main);
  return 'نصائح السفر | سفريتي';
}
