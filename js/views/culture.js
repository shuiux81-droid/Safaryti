import '../../css/routes/hub.css';
import { CONFIG, IMG } from '../config.js';
import { registerCleanup } from '../store.js';
import { esc, formatArabicDate, formatViews, isReducedMotion, arrowLeftSvg, renderPictureHtml } from '../utils.js';
import { initScrollReveals } from '../utils/viewHelpers.js';
import { activateAdSlots } from '../components/adSlots.js';
import { renderHubHeaderHtml } from '../components/hubHeader.js';

export function renderCulture(main) {
  const pageTitle = 'ثقافات وتجارب';
  const subText = 'من المطبخ إلى التراث: قصص عن أطعمة الشعوب وعاداتها.';

  const foodTheme = CONFIG.themes.filter((t) => t.slug === 'food')[0] || {
    slug: 'food',
    name: 'المأكولات العالمية',
    count: 60,
    image: IMG.heroAd2,
  };
  const heritageTheme = CONFIG.themes.filter((t) => t.slug === 'heritage')[0] || {
    slug: 'heritage',
    name: 'التراث والتقاليد',
    count: 38,
    image: IMG.pillars,
  };

  function getFilteredCultureStories(filterKey) {
    return CONFIG.stories
      .filter((story) => {
        if (!story || story.isCmsSlot) return false;
        if (story.theme !== 'food' && story.theme !== 'heritage') return false;
        return filterKey === 'all' ? true : story.theme === filterKey;
      })
      .slice()
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, 6);
  }

  function renderThemeCardHtml(theme, isFirst) {
    return (
      '<a href="#category/' +
      esc(theme.slug) +
      '" class="hub-card theme-hub-card hub-reveal-card" data-reveal>' +
      (theme.image
        ? renderPictureHtml(theme.image, {
            alt: '',
            cls: 'hub-card-img',
            loading: isFirst ? 'eager' : 'lazy',
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

  function renderCultureCardHtml(story, alreadyRevealed) {
    const hasImg = Boolean(story.image && String(story.image).trim());
    const mediaCls = 'culture-story-media' + (hasImg ? '' : ' is-fallback');
    const revealAttr = alreadyRevealed
      ? ' data-reveal class="culture-story-card hub-reveal-card is-revealed"'
      : ' data-reveal class="culture-story-card hub-reveal-card"';
    return (
      '<a href="' +
      esc(story.href || '#article/' + story.id) +
      '"' +
      revealAttr +
      ' data-story-theme="' +
      esc(story.theme) +
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
      '" data-fb="' +
      esc(CONFIG.assets.logoPng || '') +
      '" width="272" height="112" alt="" loading="lazy" decoding="async" onerror="if(!this.dataset.fbTried){this.dataset.fbTried=\'1\';var f=this.getAttribute(\'data-fb\');if(f){this.src=f;return;}}window.__safarytiLogoFallback&&window.__safarytiLogoFallback(this,false)"></div>' +
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

  const initialStories = getFilteredCultureStories('food');

  main.innerHTML =
    renderHubHeaderHtml(pageTitle, subText, IMG.pillars) +
    '<div class="container">' +
    '<section class="hub-section" aria-label="ثقافات وتجارب">' +
    '<div class="culture-columns">' +
    '<div class="culture-col">' +
    renderThemeCardHtml(foodTheme, true) +
    '</div>' +
    '<div class="culture-col">' +
    renderThemeCardHtml(heritageTheme, false) +
    '</div>' +
    '</div>' +
    '<div class="culture-latest-section" aria-labelledby="culture-latest-title">' +
    '<div class="culture-latest-header">' +
    '<h2 id="culture-latest-title" class="culture-latest-heading no-auto-ads">أحدث القصص</h2>' +
    '</div>' +
    '<div class="culture-filter-bar" role="group" aria-label="تصفية القصص حسب التصنيف">' +
    '<button type="button" class="culture-filter-chip" data-culture-filter="food" aria-pressed="true">المأكولات العالمية</button>' +
    '<button type="button" class="culture-filter-chip" data-culture-filter="heritage" aria-pressed="false">التراث والتقاليد</button>' +
    '</div>' +
    '<div id="culture-stories-grid" class="culture-stories-grid" data-active-filter="food">' +
    initialStories.map((s) => renderCultureCardHtml(s, false)).join('') +
    '</div>' +
    '</div>' +
    '</section>' +
    '</div>';

  let activeFilter = 'food';
  let fadeTimer = null;
  let fadeRaf1 = null;
  let fadeRaf2 = null;
  const gridEl = main.querySelector('#culture-stories-grid');
  const chipBtns = Array.prototype.slice.call(main.querySelectorAll('.culture-filter-chip'));

  function applyFilter(nextFilter) {
    if (!gridEl || nextFilter === activeFilter) return;
    activeFilter = nextFilter;
    chipBtns.forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-culture-filter') === nextFilter ? 'true' : 'false');
    });
    if (fadeTimer) {
      clearTimeout(fadeTimer);
      fadeTimer = null;
    }
    if (fadeRaf1 !== null) {
      cancelAnimationFrame(fadeRaf1);
      fadeRaf1 = null;
    }
    if (fadeRaf2 !== null) {
      cancelAnimationFrame(fadeRaf2);
      fadeRaf2 = null;
    }
    const nextStories = getFilteredCultureStories(nextFilter);
    const nextHtml = nextStories.map((s) => renderCultureCardHtml(s, true)).join('');
    if (isReducedMotion()) {
      gridEl.classList.remove('is-fading-out');
      gridEl.setAttribute('data-active-filter', nextFilter);
      gridEl.innerHTML = nextHtml;
      return;
    }
    gridEl.classList.add('is-fading-out');
    fadeTimer = setTimeout(() => {
      fadeTimer = null;
      gridEl.setAttribute('data-active-filter', nextFilter);
      gridEl.innerHTML = nextHtml;
      fadeRaf1 = requestAnimationFrame(() => {
        fadeRaf1 = null;
        fadeRaf2 = requestAnimationFrame(() => {
          fadeRaf2 = null;
          gridEl.classList.remove('is-fading-out');
        });
      });
    }, 200);
  }

  chipBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-culture-filter') || 'food';
      applyFilter(key);
    });
  });

  registerCleanup(() => {
    if (fadeTimer) {
      clearTimeout(fadeTimer);
      fadeTimer = null;
    }
    if (fadeRaf1 !== null) {
      cancelAnimationFrame(fadeRaf1);
      fadeRaf1 = null;
    }
    if (fadeRaf2 !== null) {
      cancelAnimationFrame(fadeRaf2);
      fadeRaf2 = null;
    }
  });

  activateAdSlots(main);
  initScrollReveals(main);
  return 'ثقافات وتجارب | سفريتي';
}
