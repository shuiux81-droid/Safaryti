import '../../css/routes/inner-shared.css';
import '../../css/routes/search.css';
import { CONFIG, IMG } from '../config.js';
import { registerCleanup } from '../store.js';
import { esc, formatArabicDate, formatViews, arrowLeftSvg, renderPictureHtml } from '../utils.js';
import {
  SEARCH_REGIONS,
  normalizeSearchText,
  findSearchMatchRange,
  highlightSearchTitle,
  loadRecentSearches,
  saveRecentSearch,
  clearRecentSearches,
  getSearchPool,
  formatSearchCountText,
} from '../utils/searchHelpers.js';
import { activateAdSlots } from '../components/adSlots.js';
import { renderInnerHeaderHtml } from '../components/innerHeader.js';

function renderRegionChipsHtml() {
  return (
    '<section class="search-regions-block" aria-label="تصفح حسب المنطقة">' +
    '<div class="search-sec-head"><h2 class="search-sec-title">تصفح حسب المنطقة</h2></div>' +
    '<ul class="search-chips-row is-regions">' +
    SEARCH_REGIONS.map((name) => '<li><button type="button" class="search-chip" data-search-query="' + esc(name) + '">' + esc(name) + '</button></li>').join('') +
    '</ul>' +
    '</section>'
  );
}

function renderSearchCardHtml(item, idx, rawQuery) {
  const titleHtml = rawQuery ? highlightSearchTitle(item.title, rawQuery) : esc(item.title);
  const href = item.href || '#article/' + item.id;
  return (
    '<a href="' +
    esc(href) +
    '" role="option" id="search-opt-' +
    idx +
    '" aria-selected="false" class="search-result-card" style="--i:' +
    Math.min(idx, 7) +
    '">' +
    '<div class="search-card-thumb">' +
    renderPictureHtml(item.image || '', {
      alt: '',
      loading: 'lazy',
      decoding: 'async',
      sizes: '80px',
      onerror: "this.closest('.search-card-thumb').classList.add('is-fallback')",
    }) +
    '<div class="search-card-thumb-fallback" aria-hidden="true"><img src="' +
    esc(CONFIG.assets.logo) +
    '" alt="" width="272" height="112" decoding="async" onerror="window.__safarytiLogoFallback&&window.__safarytiLogoFallback(this,false)"></div>' +
    '</div>' +
    '<div class="search-card-body">' +
    '<span class="search-card-cat">' +
    esc(item.category) +
    '</span>' +
    '<div class="search-card-title">' +
    titleHtml +
    '</div>' +
    '<div class="search-card-meta">' +
    '<span>' +
    esc(formatArabicDate(item.date)) +
    '</span>' +
    '<span aria-hidden="true">·</span>' +
    '<span class="tabular">' +
    esc(formatViews(item.views)) +
    '</span>' +
    '</div>' +
    '</div>' +
    '<span class="search-card-arrow" aria-hidden="true">' +
    arrowLeftSvg() +
    '</span>' +
    '</a>'
  );
}

export function renderSearchPage(main, initialQuery) {
  const startQ = String(initialQuery || '').trim();
  main.innerHTML =
    renderInnerHeaderHtml({
      bgImage: IMG.heroBackdrop,
      leftHtml:
        '<h1 class="t-h1 no-auto-ads" tabindex="-1">البحث في سفريتي</h1>' +
        '<nav class="breadcrumb" aria-label="مسار التنقل"><a href="#home">الرئيسية</a><span aria-hidden="true">›</span><span>البحث</span></nav>',
    }) +
    '<section class="container search-page-section" aria-label="صفحة البحث">' +
    '<div class="search-page-inner">' +
    '<div class="search-field-sticky" role="search" aria-label="البحث في المقالات">' +
    '<div class="search-field-pill">' +
    '<span class="search-field-icon" aria-hidden="true">' +
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>' +
    '</span>' +
    '<label for="search-page-input" class="sr-only">ابحث عن وجهة أو قصة</label>' +
    '<input id="search-page-input" class="search-overlay-input" type="search" placeholder="ابحث عن وجهة أو قصة..." autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false">' +
    '<button type="button" id="search-clear-btn" class="search-clear-btn" aria-label="مسح البحث" hidden>' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
    '</button>' +
    '</div>' +
    '</div>' +
    '<div id="search-live-status" class="sr-only" aria-live="polite" aria-atomic="true"></div>' +
    '<div id="search-results" class="search-results"></div>' +
    '</div>' +
    '</section>';

  activateAdSlots(main);

  const searchInput = document.getElementById('search-page-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const searchResults = document.getElementById('search-results');
  const searchLiveStatus = document.getElementById('search-live-status');
  let activeSearchIdx = -1;
  let searchDeb = null;

  function syncClearBtnVisibility() {
    if (!searchClearBtn || !searchInput) return;
    searchClearBtn.hidden = searchInput.value.length === 0;
  }

  function syncActiveSearchOption(nextIdx) {
    const cards = searchResults ? Array.prototype.slice.call(searchResults.querySelectorAll('.search-result-card[role="option"]')) : [];
    if (!cards.length) {
      activeSearchIdx = -1;
      if (searchInput) searchInput.removeAttribute('aria-activedescendant');
      return;
    }
    activeSearchIdx = nextIdx;
    cards.forEach((card, idx) => {
      const active = idx === activeSearchIdx;
      card.classList.toggle('is-active', active);
      card.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    if (activeSearchIdx >= 0 && cards[activeSearchIdx]) {
      if (searchInput) searchInput.setAttribute('aria-activedescendant', cards[activeSearchIdx].id);
      cards[activeSearchIdx].scrollIntoView({ block: 'nearest' });
    } else if (searchInput) {
      searchInput.removeAttribute('aria-activedescendant');
    }
  }

  function runSearchFilter(q) {
    const query = String(q || '').trim();
    const normQuery = normalizeSearchText(query);
    activeSearchIdx = -1;
    if (searchInput) searchInput.removeAttribute('aria-activedescendant');
    syncClearBtnVisibility();

    if (!normQuery) {
      const recent = loadRecentSearches();
      const clockSvg =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
      const recentHtml = recent.length
        ? '<section aria-label="عمليات بحث سابقة">' +
          '<div class="search-sec-head">' +
          '<h2 class="search-sec-title">عمليات بحث سابقة</h2>' +
          '<button type="button" id="search-clear-history-btn" class="search-history-clear">مسح</button>' +
          '</div>' +
          '<ul class="search-chips-row">' +
          recent
            .map((item) => '<li><button type="button" class="search-chip" data-search-query="' + esc(item) + '">' + clockSvg + '<span>' + esc(item) + '</span></button></li>')
            .join('') +
          '</ul>' +
          '</section>'
        : '';
      searchResults.innerHTML = recentHtml + renderRegionChipsHtml();
      if (searchInput) {
        searchInput.setAttribute('aria-expanded', 'false');
        searchInput.removeAttribute('aria-controls');
      }
      if (searchLiveStatus) searchLiveStatus.textContent = '';
      return;
    }

    const pool = getSearchPool();
    const matched = [];
    for (let i = 0; i < pool.length; i++) {
      const item = pool[i];
      const titleMatch = findSearchMatchRange(item.title, query);
      const catMatch = findSearchMatchRange(item.category, query);
      if (!titleMatch && !catMatch) continue;
      const pos = titleMatch ? titleMatch.normIndex : 10000 + catMatch.normIndex;
      matched.push({ item, pos });
    }
    matched.sort((a, b) => {
      if (a.pos !== b.pos) return a.pos - b.pos;
      return (b.item.date || '').localeCompare(a.item.date || '');
    });

    if (!matched.length) {
      const noResIcon =
        '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>';
      searchResults.innerHTML =
        '<div class="search-no-results">' +
        '<div class="search-no-results-icon">' +
        noResIcon +
        '</div>' +
        '<p class="search-no-results-title">لم نجد نتائج لـ «' +
        esc(query) +
        '»</p>' +
        '<p class="search-no-results-sub">جرّب كلمة أبسط أو اختر منطقة من الأسفل.</p>' +
        '</div>' +
        renderRegionChipsHtml();
      if (searchInput) {
        searchInput.setAttribute('aria-expanded', 'false');
        searchInput.removeAttribute('aria-controls');
      }
      if (searchLiveStatus) {
        searchLiveStatus.textContent = 'لم نجد نتائج لـ «' + query + '»';
      }
      return;
    }

    const totalMatched = matched.length;
    const shown = matched.slice(0, 8);
    const countLabel = formatSearchCountText(totalMatched);
    const countLineHtml = '<p class="search-count-line">' + esc(countLabel) + ' لـ «<strong>' + esc(query) + '</strong>»</p>';
    const cardsHtml =
      '<div id="search-listbox" class="search-listbox" role="listbox" aria-label="نتائج البحث">' +
      shown.map((entry, idx) => renderSearchCardHtml(entry.item, idx, query)).join('') +
      '</div>';
    const allResultsHtml =
      totalMatched > 8
        ? '<div class="search-all-wrap">' +
          '<a href="#all-stories/' +
          encodeURIComponent(query) +
          '" class="btn-outline-pill search-all-btn">' +
          '<span>عرض كل النتائج</span>' +
          arrowLeftSvg() +
          '</a>' +
          '</div>'
        : '';

    searchResults.innerHTML = '<div>' + countLineHtml + cardsHtml + '</div>' + allResultsHtml;
    if (searchInput) {
      searchInput.setAttribute('aria-expanded', 'true');
      searchInput.setAttribute('aria-controls', 'search-listbox');
    }
    if (searchLiveStatus) {
      searchLiveStatus.textContent = countLabel + ' لـ «' + query + '»';
    }
  }

  function navigateFromSearch(href) {
    const q = searchInput ? searchInput.value.trim() : '';
    if (q) saveRecentSearch(q);
    if (!href) return;
    window.location.hash = href;
  }

  searchInput.value = startQ;
  runSearchFilter(startQ);

  searchClearBtn.addEventListener('click', () => {
    clearTimeout(searchDeb);
    searchInput.value = '';
    runSearchFilter('');
    searchInput.focus();
  });

  searchInput.addEventListener('input', () => {
    syncClearBtnVisibility();
    clearTimeout(searchDeb);
    searchDeb = setTimeout(() => {
      runSearchFilter(searchInput.value);
    }, 200);
  });

  searchInput.addEventListener('keydown', (e) => {
    const cards = searchResults ? Array.prototype.slice.call(searchResults.querySelectorAll('.search-result-card[role="option"]')) : [];
    if (e.key === 'ArrowDown') {
      if (!cards.length) return;
      e.preventDefault();
      syncActiveSearchOption((activeSearchIdx + 1) % cards.length);
    } else if (e.key === 'ArrowUp') {
      if (!cards.length) return;
      e.preventDefault();
      const prev = activeSearchIdx <= 0 ? cards.length - 1 : activeSearchIdx - 1;
      syncActiveSearchOption(prev);
    } else if (e.key === 'Enter') {
      if (!cards.length) return;
      e.preventDefault();
      const target = activeSearchIdx >= 0 && cards[activeSearchIdx] ? cards[activeSearchIdx] : cards[0];
      navigateFromSearch(target.getAttribute('href'));
    } else if (e.key === 'Escape' && searchInput.value.length > 0) {
      e.preventDefault();
      clearTimeout(searchDeb);
      searchInput.value = '';
      runSearchFilter('');
    }
  });

  searchResults.addEventListener('click', (e) => {
    const clearHistBtn = e.target.closest('#search-clear-history-btn');
    if (clearHistBtn) {
      clearRecentSearches();
      runSearchFilter(searchInput.value);
      searchInput.focus();
      return;
    }
    const chip = e.target.closest('[data-search-query]');
    if (chip) {
      clearTimeout(searchDeb);
      const q = chip.getAttribute('data-search-query') || '';
      searchInput.value = q;
      runSearchFilter(q);
      searchInput.focus();
      return;
    }
    const link = e.target.closest('a[href]');
    if (link) {
      e.preventDefault();
      navigateFromSearch(link.getAttribute('href'));
    }
  });

  registerCleanup(() => {
    clearTimeout(searchDeb);
  });
  return startQ ? 'البحث: ' + startQ + ' | سفريتي' : 'البحث | سفريتي';
}
