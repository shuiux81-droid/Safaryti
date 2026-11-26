import '../../css/routes/inner-shared.css';
import { CONFIG, IMG } from '../config.js';
import { registerCleanup } from '../store.js';
import { esc } from '../utils.js';
import { selectTripPlanningStories, selectTravelSafetyStories } from '../safarytiLogic.js';
import { getAllCatalog, normalizeSearchText } from '../utils/searchHelpers.js';
import { activateAdSlots } from '../components/adSlots.js';
import { renderInnerHeaderHtml } from '../components/innerHeader.js';
import { renderStoryRow } from '../components/storyRow.js';
import { renderSharedInnerAside, wireSharedAsideWidgets } from '../components/sharedAside.js';

export function renderArchive(main, mode, slug) {
  const catalog = getAllCatalog();
  let region = null;
  let theme = null;
  let isUnknownCategory = false;
  if (mode === 'category') {
    const targetSlug = (slug || '').trim();
    region = CONFIG.regions.filter((r) => r.slug === targetSlug || r.name === targetSlug || r.shortName === targetSlug)[0];
    theme = CONFIG.themes.filter((t) => t.slug === targetSlug || t.name === targetSlug)[0];
    if (!region && !theme) {
      isUnknownCategory = true;
    }
  }

  if (isUnknownCategory) {
    const notFoundTitle = 'القسم غير موجود';
    main.innerHTML =
      renderInnerHeaderHtml({
        bgImage: IMG.heroBackdrop,
        leftHtml:
          '<h1 class="t-h1 no-auto-ads" tabindex="-1">' +
          esc(notFoundTitle) +
          '</h1>' +
          '<nav class="breadcrumb" aria-label="مسار التنقل"><a href="#home">الرئيسية</a><span aria-hidden="true">›</span><span>' +
          esc(notFoundTitle) +
          '</span></nav>',
      }) +
      '<div class="container split-layout is-archive">' +
      '<div>' +
      '<div class="archive-section-head">' +
      '<h2 class="archive-section-title no-auto-ads">' +
      esc(notFoundTitle) +
      '</h2>' +
      '<p class="archive-section-sub">عذرًا، لم نعثر على القسم المطلوب. يمكنك استعراض جميع القصص والمقالات من الأرشيف الكامل.</p>' +
      '</div>' +
      '<p style="margin-top:1.5rem;"><a href="#all-stories" class="btn-outline-pill" style="display:inline-flex;align-items:center;gap:.5rem;">عرض كل القصص</a></p>' +
      '</div>' +
      renderSharedInnerAside('archive', null) +
      '</div>';

    activateAdSlots(main);
    wireSharedAsideWidgets(main);
    return notFoundTitle + ' | سفريتي';
  }

  const title = mode === 'all-stories' ? 'كل القصص' : region ? region.name : theme.name;
  const isTipsFamily = Boolean(
    theme && (theme.slug === 'tips' || theme.slug === 'trip-planning' || theme.slug === 'travel-safety')
  );
  const isNoMetaRegion = Boolean(region && (region.slug === 'africa' || region.slug === 'asia'));
  const hideCardMeta = mode === 'all-stories' || isTipsFamily || isNoMetaRegion;

  let activeFilter = 'الكل';
  if (mode === 'category') {
    activeFilter = region ? region.shortName || region.name : theme.name;
  }

  let searchQuery = mode === 'all-stories' && slug ? slug : '';
  let currentPage = 1;
  const perPage = 8;

  const headerBg = region
    ? region.image
    : theme && theme.slug === 'heritage'
      ? IMG.pyramids
      : theme && theme.slug === 'food'
        ? IMG.heroAd2
        : theme && theme.image
          ? theme.image
          : IMG.heroBackdrop;

  const breadcrumbHtml =
    theme && theme.parentSlug && theme.parentName
      ? '<a href="#home">الرئيسية</a><span aria-hidden="true">›</span><a href="#category/' +
        esc(theme.parentSlug) +
        '">' +
        esc(theme.parentName) +
        '</a><span aria-hidden="true">›</span><span>' +
        esc(title) +
        '</span>'
      : '<a href="#home">الرئيسية</a><span aria-hidden="true">›</span><span>' + esc(title) + '</span>';

  main.innerHTML =
    renderInnerHeaderHtml({
      bgImage: headerBg,
      heroAsImg: mode === 'all-stories',
      mobileSrc: mode === 'all-stories' ? './mobile/hero-backdrop-m.webp' : '',
      mobileWidth: 800,
      mobileHeight: 447,
      leftHtml:
        '<h1 class="t-h1 no-auto-ads" tabindex="-1">' +
        esc(title) +
        '</h1>' +
        '<nav class="breadcrumb" aria-label="مسار التنقل">' +
        breadcrumbHtml +
        '</nav>',
    }) +
    '<div class="container split-layout is-archive">' +
    '<div>' +
    (mode === 'all-stories'
      ? '<div class="archive-section-head">' +
        '<h2 class="archive-section-title no-auto-ads">' +
        (searchQuery ? 'نتائج البحث عن «' + esc(searchQuery) + '»' : 'آخر أخبار العالم') +
        '</h2>' +
        '<p class="archive-section-sub">' +
        (searchQuery
          ? '<a href="#all-stories" style="color:var(--orange-700);font-weight:600;">عرض جميع القصص</a>'
          : 'لا تفوت الأخبار اليومية') +
        '</p>' +
        '</div>'
      : '<h2 class="sr-only">المقالات</h2>') +
    '<div id="archive-list-container"></div>' +
    '<nav id="archive-pagination" class="pagination" aria-label="ترقيم الصفحات"></nav>' +
    '</div>' +
    renderSharedInnerAside('archive', mode === 'category' && region ? region.slug : null) +
    '</div>';

  activateAdSlots(main);
  wireSharedAsideWidgets(main);

  const listEl = document.getElementById('archive-list-container');
  const pagEl = document.getElementById('archive-pagination');

  function matchesFilter(item, filterName) {
    if (filterName === 'الكل') return true;
    if (filterName === 'أستراليا' || filterName === 'أستراليا (أوقيانوسيا)') {
      return item.category.indexOf('أستراليا') !== -1;
    }
    if (filterName === 'نصائح السفر') {
      return item.isTip || item.category === 'نصائح السفر';
    }
    return item.category === filterName;
  }

  function renderPage() {
    const normArchiveQ = searchQuery ? normalizeSearchText(searchQuery) : '';
    const isTipsSubTheme = Boolean(theme && (theme.slug === 'trip-planning' || theme.slug === 'travel-safety'));
    const baseList =
      theme && theme.slug === 'trip-planning'
        ? selectTripPlanningStories(catalog)
        : theme && theme.slug === 'travel-safety'
          ? selectTravelSafetyStories(catalog)
          : catalog;
    let filtered = baseList.filter((item) => {
      const okFilter = isTipsSubTheme ? true : matchesFilter(item, activeFilter);
      const okQuery =
        !normArchiveQ ||
        normalizeSearchText(item.title).indexOf(normArchiveQ) !== -1 ||
        normalizeSearchText(item.category).indexOf(normArchiveQ) !== -1;
      return okFilter && okQuery;
    });

    if (mode === 'category' && activeFilter === 'إفريقيا' && !searchQuery) {
      const africaSeed = CONFIG.stories.filter((s) => s.category === 'إفريقيا');
      const seedIds = africaSeed.map((s) => s.id);
      const rest = filtered.filter((x) => seedIds.indexOf(x.id) === -1);
      filtered = africaSeed.concat(rest);
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    if (currentPage > totalPages) currentPage = totalPages;
    const slice = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

    if (!slice.length) {
      listEl.innerHTML = '<p class="search-empty">لا توجد نتائج مطابقة لبحثك.</p>';
    } else {
      listEl.innerHTML =
        '<div class="story-rows">' +
        slice
          .map((item, idx) =>
            renderStoryRow(
              item,
              mode === 'all-stories'
                ? { hideMeta: hideCardMeta, eager: idx < 3, fetchpriority: idx >= 3 ? 'low' : '' }
                : { hideMeta: hideCardMeta, eager: idx < 3 }
            )
          )
          .join('') +
        '</div>';
    }

    if (totalPages <= 1) {
      pagEl.innerHTML = '';
    } else {
      let range = [];
      if (totalPages <= 7) {
        for (let p = 1; p <= totalPages; p++) range.push(p);
      } else {
        range = [1];
        const st = Math.max(2, currentPage - 1);
        const en = Math.min(totalPages - 1, currentPage + 1);
        if (st > 2) range.push('...');
        for (let q = st; q <= en; q++) range.push(q);
        if (en < totalPages - 1) range.push('...');
        range.push(totalPages);
      }
      const prevChevron =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
      const nextChevron =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
      let htmlOut =
        '<button type="button" class="page-btn" data-page="' +
        (currentPage - 1) +
        '" ' +
        (currentPage === 1 ? 'disabled' : '') +
        ' aria-label="الصفحة السابقة">' +
        prevChevron +
        '</button>';
      range.forEach((item) => {
        if (item === '...') {
          htmlOut += '<span class="t-meta" style="padding-inline:.35rem;">…</span>';
        } else {
          htmlOut +=
            '<button type="button" class="page-btn" data-page="' +
            item +
            '" ' +
            (item === currentPage ? 'aria-current="page"' : '') +
            '>' +
            item +
            '</button>';
        }
      });
      htmlOut +=
        '<button type="button" class="page-btn" data-page="' +
        (currentPage + 1) +
        '" ' +
        (currentPage === totalPages ? 'disabled' : '') +
        ' aria-label="الصفحة التالية">' +
        nextChevron +
        '</button>';
      pagEl.innerHTML = htmlOut;
      pagEl.querySelectorAll('[data-page]').forEach((b) => {
        b.addEventListener('click', () => {
          const np = Number(b.getAttribute('data-page'));
          if (np >= 1 && np <= totalPages) {
            currentPage = np;
            renderPage();
            window.scrollTo({ top: 0, behavior: 'auto' });
          }
        });
      });
    }
  }

  if (mode === 'all-stories') {
    const searchInput = document.getElementById('archive-search');
    if (searchInput) {
      let deb = null;
      searchInput.addEventListener('input', () => {
        clearTimeout(deb);
        deb = setTimeout(() => {
          searchQuery = searchInput.value.trim();
          currentPage = 1;
          renderPage();
        }, 150);
      });
      registerCleanup(() => clearTimeout(deb));
    }
    main.querySelectorAll('[data-chip]').forEach((chip) => {
      chip.addEventListener('click', () => {
        activeFilter = chip.getAttribute('data-chip');
        main.querySelectorAll('[data-chip]').forEach((c) => {
          c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
        });
        currentPage = 1;
        renderPage();
      });
    });
  }

  renderPage();
  return title + ' | سفريتي';
}
