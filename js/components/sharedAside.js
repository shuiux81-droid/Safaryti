import { CONFIG } from '../config.js';
import { registerCleanup } from '../store.js';
import { esc, formatArabicDate, isReducedMotion, socialSvg, arrowLeftSvg, renderPictureHtml } from '../utils.js';
import { buildCompactPaginationItems, formatEnNumber } from '../safarytiLogic.js';
import { renderAdSlotHtml } from './adSlots.js';
import { renderAsideFactsCardHtml, initFactsCarouselWidget } from './factsCarousel.js';

export function renderAsideSearchHtml(idSuffix) {
  return (
    '<form class="home-aside-search-form" data-aside-search-form role="search">' +
    '<label for="aside-search-' +
    esc(idSuffix) +
    '" class="skip-link">ابحث في القصص</label>' +
    '<input id="aside-search-' +
    esc(idSuffix) +
    '" class="home-aside-search-input" type="search" placeholder="ابحث....">' +
    '<button type="submit" class="home-aside-search-btn" aria-label="بحث">' +
    '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>' +
    '</button>' +
    '</form>'
  );
}

export function renderAsideCardsHtml(items) {
  return (
    '<div class="home-aside-cards">' +
    items
      .map((item) => {
        const formattedViews = formatEnNumber(item.views);
        const formattedDate = formatArabicDate(item.date);
        return (
          '<a href="' +
          esc(item.href) +
          '" class="home-aside-card">' +
          renderPictureHtml(item.image, {
            alt: '',
            cls: 'home-aside-card-img',
            loading: 'lazy',
            fetchpriority: 'low',
            decoding: 'async',
            sizes: '120px',
            onerror: "this.closest('.home-aside-card').classList.add('is-fallback')",
          }) +
          '<span class="home-aside-card-fallback" aria-hidden="true">' +
          '<img src="' +
          esc(CONFIG.assets.logoLight) +
          '" alt="" decoding="async" onerror="window.__safarytiLogoFallback&&window.__safarytiLogoFallback(this,true)">' +
          '</span>' +
          '<h3 class="home-aside-card-title">' +
          esc(item.title) +
          '</h3>' +
          '<div class="home-aside-card-meta">' +
          '<span class="home-aside-card-meta-item tabular">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
          '<span>' +
          esc(formattedDate) +
          '</span>' +
          '</span>' +
          '<span class="home-aside-card-meta-dot" aria-hidden="true">·</span>' +
          '<span class="home-aside-card-meta-item tabular">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' +
          '<span>' +
          esc(formattedViews) +
          '</span>' +
          '</span>' +
          '</div>' +
          '</a>'
        );
      })
      .join('') +
    '</div>'
  );
}

export function renderAsidePaginationHtml(page, totalPages) {
  const pageItems = buildCompactPaginationItems(page, totalPages);
  let btns = '';
  btns +=
    '<button type="button" class="home-aside-page-btn" data-home-aside-page="' +
    (page - 1) +
    '" aria-label="الصفحة السابقة"' +
    (page <= 1 ? ' disabled' : '') +
    '>' +
    '<span class="home-aside-page-circle" aria-hidden="true">' +
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>' +
    '</span>' +
    '</button>';
  for (let i = 0; i < pageItems.length; i++) {
    const item = pageItems[i];
    if (item === '...') {
      btns += '<span class="home-aside-page-ellipsis" aria-hidden="true">…</span>';
      continue;
    }
    const p = Number(item);
    btns +=
      '<button type="button" class="home-aside-page-btn tabular' +
      (p === page ? ' is-active' : '') +
      '" data-home-aside-page="' +
      p +
      '" aria-label="صفحة ' +
      p +
      '"' +
      (p === page ? ' aria-current="page"' : '') +
      '>' +
      '<span class="home-aside-page-circle">' +
      p +
      '</span>' +
      '</button>';
  }
  btns +=
    '<button type="button" class="home-aside-page-btn" data-home-aside-page="' +
    (page + 1) +
    '" aria-label="الصفحة التالية"' +
    (page >= totalPages ? ' disabled' : '') +
    '>' +
    '<span class="home-aside-page-circle" aria-hidden="true">' +
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>' +
    '</span>' +
    '</button>';
  return '<nav class="home-aside-pagination" aria-label="ترقيم القصص">' + btns + '</nav>';
}

export function renderAsidePopularTabsHtml(widgetId) {
  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(CONFIG.popular.length / perPage));
  const headingId = esc(widgetId) + '-heading';
  return (
    '<div id="' +
    esc(widgetId) +
    '" class="discover-more-widget" aria-labelledby="' +
    headingId +
    '">' +
    '<h2 id="' +
    headingId +
    '" class="aside-pop-heading no-auto-ads">اكتشف المزيد</h2>' +
    '<div class="tabs-bar" role="tablist" aria-label="اكتشف المزيد">' +
    '<button type="button" role="tab" class="tab-btn" aria-selected="true" tabindex="0" data-tab-key="popular">القصص الشائعة</button>' +
    '<button type="button" role="tab" class="tab-btn" aria-selected="false" tabindex="-1" data-tab-key="recommended">ننصح بقراءة</button>' +
    '</div>' +
    '<div role="tabpanel" class="tab-panel">' +
    renderAsideCardsHtml(CONFIG.popular.slice(0, perPage)) +
    renderAsidePaginationHtml(1, totalPages) +
    '</div>' +
    '</div>'
  );
}

export function renderAsideCategoriesHtml(activeSlug) {
  return (
    '<section class="aside-cats-section" aria-labelledby="aside-cats-heading">' +
    '<h2 id="aside-cats-heading" class="aside-cats-heading no-auto-ads">الفئات</h2>' +
    '<div class="aside-cats-grid">' +
    CONFIG.regions
      .map((r, idx) => {
        const label = r.shortName || r.name;
        const isCurrent = activeSlug && activeSlug === r.slug;
        return (
          '<a href="#category/' +
          esc(r.slug) +
          '" class="aside-cat-card" data-reveal style="--cat-delay:' +
          idx * 60 +
          'ms"' +
          (isCurrent ? ' aria-current="page"' : '') +
          '>' +
          renderPictureHtml(r.image, {
            alt: '',
            cls: 'aside-cat-img',
            loading: 'lazy',
            fetchpriority: 'low',
            decoding: 'async',
            sizes: '(min-width: 1024px) 340px, 160px',
            onerror: "this.style.display='none'",
          }) +
          '<span class="aside-cat-name">' +
          esc(label) +
          '</span>' +
          '<span class="aside-cat-spacer" aria-hidden="true"></span>' +
          '<span class="aside-cat-pill">' +
          '<span class="aside-cat-num">' +
          r.count +
          '</span>' +
          '<span class="aside-cat-unit">قصة</span>' +
          '</span>' +
          '<span class="aside-cat-arrow" aria-hidden="true">' +
          arrowLeftSvg() +
          '</span>' +
          '</a>'
        );
      })
      .join('') +
    '</div>' +
    '</section>'
  );
}

export function renderAsideFollowHtml(useAsideHeading) {
  const headingCls = useAsideHeading ? 'aside-follow-heading no-auto-ads' : 't-h3 no-auto-ads';
  return (
    '<div class="aside-panel">' +
    '<h2 class="' +
    headingCls +
    '">تابعونا على</h2>' +
    '<div class="aside-follow-grid">' +
    '<a href="' +
    esc(CONFIG.social.facebook) +
    '" target="_blank" rel="noopener" class="social-btn-row"><span class="social-orange-circle">' +
    socialSvg('facebook') +
    '</span><span>فيسبوك</span></a>' +
    '<a href="' +
    esc(CONFIG.social.instagram) +
    '" target="_blank" rel="noopener" class="social-btn-row"><span class="social-orange-circle">' +
    socialSvg('instagram') +
    '</span><span>إنستجرام</span></a>' +
    '<a href="' +
    esc(CONFIG.social.linkedin) +
    '" target="_blank" rel="noopener" class="social-btn-row"><span class="social-orange-circle">' +
    socialSvg('linkedin') +
    '</span><span>لينكد ان</span></a>' +
    '<a href="' +
    esc(CONFIG.social.x) +
    '" target="_blank" rel="noopener" class="social-btn-row"><span class="social-orange-circle">' +
    socialSvg('x') +
    '</span><span>إكس (تويتر)</span></a>' +
    '</div>' +
    '</div>'
  );
}

export function renderSharedInnerAside(variant, activeSlug) {
  let out =
    '<aside class="aside-stack">' +
    renderAsideSearchHtml(variant) +
    renderAdSlotHtml('AD-SB1', { wrapCls: 'is-aside' }) +
    renderAsideCategoriesHtml(activeSlug) +
    renderAsidePopularTabsHtml('aside-pop-tabs');
  if (variant === 'article') {
    out += renderAsideFactsCardHtml();
  }
  out += '</aside>';
  return out;
}

export function renderArticleAsideHtml(tocAsideHtml) {
  return (
    '<aside class="aside-stack is-article-aside">' +
    renderAsideSearchHtml('article') +
    renderAdSlotHtml('AD-SB1', { wrapCls: 'is-aside' }) +
    (tocAsideHtml || '') +
    renderAsideCategoriesHtml() +
    renderAsidePopularTabsHtml('aside-pop-tabs') +
    renderAsideFactsCardHtml() +
    '</aside>'
  );
}

export function initAsidePopTabsWidget(tabsEl) {
  if (!tabsEl) return;
  const tabBtns = Array.prototype.slice.call(tabsEl.querySelectorAll('[role="tab"]'));
  const panel = tabsEl.querySelector('[role="tabpanel"]');
  if (!tabBtns.length || !panel) return;
  const perPage = 5;
  let activeKey = 'popular';
  let page = 1;
  const recList = CONFIG.picks.concat(CONFIG.stories).slice(0, 15);
  let fadeOutTimer = null;
  let minHeightTimer = null;
  let raf1 = null;
  let raf2 = null;

  function clearPendingTimers() {
    clearTimeout(fadeOutTimer);
    clearTimeout(minHeightTimer);
    if (raf1 !== null) cancelAnimationFrame(raf1);
    if (raf2 !== null) cancelAnimationFrame(raf2);
    fadeOutTimer = null;
    minHeightTimer = null;
    raf1 = null;
    raf2 = null;
  }

  registerCleanup(clearPendingTimers);

  function restorePageFocus(focusPage) {
    if (!focusPage) return;
    const targetBtn = panel.querySelector('[data-home-aside-page="' + focusPage + '"]');
    if (targetBtn && !targetBtn.disabled) {
      targetBtn.focus();
    }
  }

  function renderPage(focusPage) {
    const source = activeKey === 'popular' ? CONFIG.popular : recList;
    const totalPages = Math.max(1, Math.ceil(source.length / perPage));
    page = Math.max(1, Math.min(totalPages, page));
    const start = (page - 1) * perPage;
    const slice = source.slice(start, start + perPage);
    const nextHtml = renderAsideCardsHtml(slice) + renderAsidePaginationHtml(page, totalPages);

    clearPendingTimers();
    if (isReducedMotion()) {
      panel.classList.remove('is-fading-out', 'is-entering');
      panel.style.minHeight = '';
      panel.innerHTML = nextHtml;
      restorePageFocus(focusPage);
      return;
    }

    const prevHeight = panel.offsetHeight;
    if (prevHeight > 0) {
      panel.style.minHeight = prevHeight + 'px';
    }
    panel.classList.remove('is-entering');
    panel.classList.add('is-fading-out');

    fadeOutTimer = setTimeout(() => {
      fadeOutTimer = null;
      panel.innerHTML = nextHtml;
      panel.classList.remove('is-fading-out');
      panel.classList.add('is-entering');
      restorePageFocus(focusPage);
      raf1 = requestAnimationFrame(() => {
        raf1 = null;
        raf2 = requestAnimationFrame(() => {
          raf2 = null;
          panel.classList.remove('is-entering');
          minHeightTimer = setTimeout(() => {
            minHeightTimer = null;
            panel.style.minHeight = '';
          }, 300);
        });
      });
    }, 200);
  }

  function switchTab(btn) {
    const nextKey = btn.getAttribute('data-tab-key');
    if (nextKey === activeKey && btn.getAttribute('aria-selected') === 'true') return;
    tabBtns.forEach((t) => {
      t.setAttribute('aria-selected', 'false');
      t.tabIndex = -1;
    });
    btn.setAttribute('aria-selected', 'true');
    btn.tabIndex = 0;
    if (typeof btn.scrollIntoView === 'function') {
      requestAnimationFrame(() => {
        btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      });
    }
    activeKey = nextKey;
    page = 1;
    renderPage(null);
  }

  tabBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => { switchTab(btn); });
    btn.addEventListener('keydown', (e) => {
      let nextIdx = idx;
      if (e.key === 'ArrowRight') nextIdx = (idx - 1 + tabBtns.length) % tabBtns.length;
      else if (e.key === 'ArrowLeft') nextIdx = (idx + 1) % tabBtns.length;
      else if (e.key === 'Home') nextIdx = 0;
      else if (e.key === 'End') nextIdx = tabBtns.length - 1;
      else return;
      e.preventDefault();
      tabBtns[nextIdx].focus();
      switchTab(tabBtns[nextIdx]);
    });
  });

  panel.addEventListener('click', (e) => {
    const pageBtn = e.target.closest('[data-home-aside-page]');
    if (!pageBtn || pageBtn.disabled) return;
    const nextPage = Number(pageBtn.getAttribute('data-home-aside-page'));
    if (!Number.isNaN(nextPage) && nextPage !== page) {
      let focusPage = null;
      try {
        if (pageBtn.matches(':focus-visible')) {
          focusPage = String(nextPage);
        }
      } catch (_err) {}
      page = nextPage;
      renderPage(focusPage);
    }
  });
}

export function wireSharedAsideWidgets(root, opts) {
  root.querySelectorAll('[data-aside-search-form]').forEach((form) => {
    const inp = form.querySelector('input');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = inp ? inp.value.trim() : '';
      window.location.hash = q ? '#search/' + encodeURIComponent(q) : '#search';
    });
  });
  if (!opts || !opts.deferTabs) {
    initAsidePopTabsWidget(document.getElementById('aside-pop-tabs'));
    initAsidePopTabsWidget(document.getElementById('home-aside-pop-tabs'));
    initAsidePopTabsWidget(document.getElementById('discover-tabs-widget'));
  }
  if (!opts || !opts.deferFacts) {
    initFactsCarouselWidget();
  }
  const catCards = Array.prototype.slice.call(root.querySelectorAll('.aside-cat-card[data-reveal]'));
  if (catCards.length) {
    if (isReducedMotion() || !('IntersectionObserver' in window)) {
      catCards.forEach((c) => { c.classList.add('is-revealed'); });
    } else {
      const catIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
              entry.target.classList.add('is-revealed');
              catIo.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.02 }
      );
      catCards.forEach((c) => { catIo.observe(c); });
      registerCleanup(() => { catIo.disconnect(); });
    }
  }
}
