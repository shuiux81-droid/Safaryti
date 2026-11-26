import '../../css/routes/inner-shared.css';
import '../../css/routes/article.css';
import { CONFIG, IMG } from '../config.js';
import { registerCleanup } from '../store.js';
import {
  esc,
  formatArabicDate,
  isReducedMotion,
  renderPictureHtml,
} from '../utils.js';
import { renderMediaBox } from '../utils/viewHelpers.js';
import { findArticleById, slugifyArticleHeading } from '../data/articleData.js';
import { renderAdSlotHtml, activateAdSlots } from '../components/adSlots.js';
import { renderInnerHeaderHtml } from '../components/innerHeader.js';
import { renderArticleAsideHtml, wireSharedAsideWidgets } from '../components/sharedAside.js';
import { renderArticleTocNavHtml, initArticleToc } from '../components/articleToc.js';

export function renderArticle(main, slug) {
  const art = findArticleById(slug);
  const related = CONFIG.stories.filter((s) => s.id !== art.id).slice(0, 4);
  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(art.title);

  let introHtml = '';
  if (art.intro && art.intro.length) {
    introHtml += '<p>' + esc(art.intro[0]) + '</p>';
    introHtml += renderAdSlotHtml('AD-A1', { wrapCls: 'is-article-card', immediate: true });
    art.intro.slice(1).forEach((p) => {
      introHtml += '<p>' + esc(p) + '</p>';
    });
  }

  const usedHeadingIds = {};
  const tocEntries = [];

  let sectionsHtml = '';
  (art.sections || []).forEach((sec) => {
    const h2Id = slugifyArticleHeading(sec.title, usedHeadingIds);
    const subEntries = [];
    sectionsHtml += '<h2 id="' + esc(h2Id) + '" class="t-h2 no-auto-ads" tabindex="-1">' + esc(sec.title) + '</h2>';
    (sec.paragraphs || []).forEach((p) => {
      sectionsHtml += '<p>' + esc(p) + '</p>';
    });
    if (sec.orderedList && sec.orderedList.length) {
      sectionsHtml += '<ol>' + sec.orderedList.map((li) => '<li>' + esc(li) + '</li>').join('') + '</ol>';
    }
    (sec.subSections || []).forEach((sub) => {
      const h3Id = slugifyArticleHeading(sub.title, usedHeadingIds);
      subEntries.push({ id: h3Id, title: sub.title, level: 3 });
      sectionsHtml +=
        '<h3 id="' +
        esc(h3Id) +
        '" class="t-h3" tabindex="-1">' +
        esc(sub.title) +
        '</h3>' +
        '<p>' +
        esc(sub.text) +
        '</p>' +
        (sub.image
          ? '<figure class="article-inline-figure">' +
            renderMediaBox(sub.image, sub.caption || sub.title, 'article-inline-img', false, '(min-width: 1024px) 680px, 95vw') +
            '<figcaption class="article-caption">' +
            esc(sub.caption || sub.title) +
            '</figcaption>' +
            '</figure>'
          : '');
    });
    tocEntries.push({
      id: h2Id,
      indexLabel: String(tocEntries.length + 1).padStart(2, '0'),
      title: sec.title,
      level: 2,
      children: subEntries,
    });
  });

  sectionsHtml += renderAdSlotHtml('AD-A2', { wrapCls: 'is-article-card', immediate: true });
  sectionsHtml +=
    '<p class="article-closing-p">كما يمكنك الاستعانة بموقع سفريتي لاستكشاف المزيد من الوجهات السياحية والأدلة المتكاملة، والتعرف على أفضل الأنشطة والتجارب التي تجعل من كل رحلة تجربة لا تُنسى.</p>';

  const relatedHtml =
    '<section style="margin-top:3rem;"><h2 class="t-h2 no-auto-ads" style="margin-bottom:1.25rem;">اقرأ أيضًا</h2>' +
    '<div class="picks-grid">' +
    related
      .map((r) => {
        return (
          '<a href="' +
          esc(r.href) +
          '" class="pick-card">' +
          '<div class="pick-card-media">' +
          renderMediaBox(r.image, r.title, '', false, '(min-width: 1024px) 220px, (min-width: 640px) 45vw, 90vw') +
          '<span class="pill-tag pick-card-tag">' +
          esc(r.category) +
          '</span></div>' +
          '<div class="pick-card-body"><h3 class="t-row-title"><span class="story-row-title-text">' +
          esc(r.title) +
          '</span></h3><div class="story-meta t-meta"><span>' +
          esc(formatArabicDate(r.date)) +
          '</span></div></div>' +
          '</a>'
        );
      })
      .join('') +
    '</div></section>';

  const catRegion = CONFIG.regions.filter((r) => r.name === art.category || r.shortName === art.category)[0];
  const catTheme = CONFIG.themes.filter((t) => t.name === art.category)[0];
  const catHref = catRegion ? '#category/' + catRegion.slug : catTheme ? '#category/' + catTheme.slug : '#all-stories';

  const authorName = typeof art.author === 'string' ? art.author : art.author && art.author.name ? art.author.name : '';
  const viewsCountFormatted = new Intl.NumberFormat('en-US').format(Number(art.views) || 0);
  const heroAlt = art.imageAlt || art.title;
  const heroFallbackHtml =
    '<div class="article-hero-fallback" aria-hidden="true">' +
    '<img src="' +
    esc(CONFIG.assets.logo) +
    '" alt="" decoding="async" onerror="window.__safarytiLogoFallback&&window.__safarytiLogoFallback(this,true)">' +
    '</div>';
  const heroPhotoHtml = art.image
    ? renderPictureHtml(art.image, {
        alt: heroAlt,
        cls: 'article-hero-photo',
        fetchpriority: 'high',
        decoding: 'async',
        sizes: '(min-width: 1024px) 755px, 100vw',
      })
    : heroFallbackHtml;

  const metaCalendarIcon =
    '<svg class="article-hero-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>';
  const metaRefreshIcon =
    '<svg class="article-hero-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.64-6.36L21 8"/><path d="M21 3v5h-5"/></svg>';
  const metaUserIcon =
    '<svg class="article-hero-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  const metaEyeIcon =
    '<svg class="article-hero-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';

  const heroMetaItemsHtml =
    '<span class="article-hero-meta-item">' +
    metaCalendarIcon +
    '<span><time datetime="' +
    esc(art.date) +
    '">' +
    esc(formatArabicDate(art.date)) +
    '</time></span><span class="sr-only"> تاريخ النشر</span>' +
    '</span>' +
    (art.updatedDate
      ? '<span class="article-hero-meta-item">' +
        metaRefreshIcon +
        '<span><time datetime="' +
        esc(art.updatedDate) +
        '">' +
        esc(formatArabicDate(art.updatedDate)) +
        '</time></span><span class="sr-only"> آخر تحديث</span>' +
        '</span>'
      : '') +
    '<span class="article-hero-meta-item">' +
    metaUserIcon +
    '<span>' +
    esc(authorName) +
    '</span>' +
    '</span>' +
    '<span class="article-hero-meta-item">' +
    metaEyeIcon +
    '<span class="tabular">' +
    esc(viewsCountFormatted) +
    '</span><span class="sr-only"> مشاهدة</span>' +
    '</span>';

  const shareRailHtml =
    '<aside class="article-share-rail no-auto-ads" aria-label="شارك هذه المقالة">' +
    '<span class="article-share-label">شارك هذه المقالة</span>' +
    '<span class="article-share-hairline" aria-hidden="true"></span>' +
    '<div class="article-share-buttons">' +
    '<a class="article-share-circle" href="https://www.facebook.com/sharer/sharer.php?u=' +
    shareUrl +
    '" target="_blank" rel="noopener" aria-label="مشاركة على فيسبوك">' +
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 9h3V5h-3c-2.76 0-5 2.24-5 5v2H6v4h3v7h4v-7h3.2l.8-4H13v-2c0-.55.45-1 1-1Z"/></svg>' +
    '</a>' +
    '<a class="article-share-circle" href="https://twitter.com/intent/tweet?url=' +
    shareUrl +
    '&text=' +
    shareTitle +
    '" target="_blank" rel="noopener" aria-label="مشاركة على إكس">' +
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg>' +
    '</a>' +
    '<a class="article-share-circle" href="https://wa.me/?text=' +
    shareTitle +
    '%20' +
    shareUrl +
    '" target="_blank" rel="noopener" aria-label="مشاركة على واتساب">' +
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.56 7.47L3 20.5l1.58-5.18A8.5 8.5 0 1 1 21 11.5Z"/><path d="M9.6 8.9c.2-.4.4-.4.6-.4h.5c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4 0 .6l-.4.5c-.1.2-.2.3-.1.5.3.6 1 1.4 1.9 1.9.2.1.4.1.5-.1l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.2.1.4.3.3.6-.1.8-.7 1.4-1.5 1.5-1 .1-2.5-.2-4.2-1.7-1.7-1.4-2.4-3.1-2.5-4.1-.1-.8.4-1.4.9-1.3Z"/></svg>' +
    '</a>' +
    '<span class="article-copy-wrap article-share-copy">' +
    '<button type="button" id="article-rail-copy" class="article-share-circle" aria-label="نسخ الرابط">' +
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>' +
    '</button>' +
    '<span id="article-rail-copy-tip" class="article-copy-tip" role="status" aria-live="polite"></span>' +
    '</span>' +
    '</div>' +
    '</aside>';

  const shouldRenderToc = tocEntries.length >= 3;
  let tocAsideHtml = '';
  let tocMobileHtml = '';
  if (shouldRenderToc) {
    const tocNavHtml = renderArticleTocNavHtml(tocEntries);
    const tocMobileNavHtml = renderArticleTocNavHtml(tocEntries, { showTrack: false });
    tocAsideHtml =
      '<div class="article-toc-aside" id="article-toc-aside">' +
      '<h2 class="article-toc-heading no-auto-ads">محتويات المقال</h2>' +
      '<div class="article-toc-scroll" id="article-toc-scroll">' +
      tocNavHtml +
      '</div>' +
      '</div>';
    tocMobileHtml =
      '<details class="toc-mobile" id="article-toc-mobile">' +
      '<summary>' +
      '<span>محتويات المقال</span>' +
      '<svg class="toc-mobile-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' +
      '</summary>' +
      tocMobileNavHtml +
      '</details>';
  }

  const heroEnteringCls = isReducedMotion() ? '' : ' is-entering';

  main.innerHTML =
    renderInnerHeaderHtml({
      bgImage: art.image || IMG.heroBackdrop,
      leftHtml:
        '<h1 class="t-h1 article-hero-title no-auto-ads" tabindex="-1">' +
        esc(art.title) +
        '</h1>' +
        '<nav class="breadcrumb" aria-label="مسار التنقل"><a href="#home">الرئيسية</a><span aria-hidden="true">›</span><a href="' +
        esc(catHref) +
        '">' +
        esc(art.category) +
        '</a></nav>',
    }) +
    '<div class="container split-layout is-article">' +
    '<article class="article-prose">' +
    '<header class="article-hero-card on-dark no-auto-ads' +
    heroEnteringCls +
    '" id="article-hero-card">' +
    heroPhotoHtml +
    '<div class="article-hero-scrim" aria-hidden="true"></div>' +
    '<h2 class="article-hero-heading no-auto-ads">' +
    esc(art.title) +
    '</h2>' +
    '<div class="article-hero-meta">' +
    heroMetaItemsHtml +
    '</div>' +
    '</header>' +
    '<div class="article-body-row">' +
    '<div class="article-body-content">' +
    introHtml +
    tocMobileHtml +
    sectionsHtml +
    '</div>' +
    shareRailHtml +
    '</div>' +
    relatedHtml +
    '</article>' +
    renderArticleAsideHtml(tocAsideHtml) +
    '</div>';

  activateAdSlots(main);
  wireSharedAsideWidgets(main);

  // Hero image error fallback & dynamic height guard
  const heroCardEl = document.getElementById('article-hero-card');
  if (heroCardEl) {
    const heroImgEl = heroCardEl.querySelector('.article-hero-photo');
    if (heroImgEl) {
      heroImgEl.addEventListener(
        'error',
        () => {
          const fb = document.createElement('div');
          fb.className = 'article-hero-fallback';
          fb.setAttribute('aria-hidden', 'true');
          fb.innerHTML =
            '<img src="' +
            esc(CONFIG.assets.logo) +
            '" alt="" decoding="async" onerror="window.__safarytiLogoFallback&&window.__safarytiLogoFallback(this,true)">';
          (heroImgEl.closest('picture') || heroImgEl).replaceWith(fb);
        },
        { once: true }
      );
    }
    let heroMinRaf = null;
    const adjustHeroMinHeight = () => {
      const h1El = heroCardEl.querySelector('.article-hero-heading');
      const metaEl = heroCardEl.querySelector('.article-hero-meta');
      if (!h1El || !metaEl) return;
      const hadCustomMin = Boolean(heroCardEl.style.minHeight);
      if (hadCustomMin) heroCardEl.style.minHeight = '';
      const needed = Math.ceil(h1El.offsetHeight + metaEl.offsetHeight + 84);
      const currentMin = heroCardEl.getBoundingClientRect().height;
      if (needed > currentMin) {
        heroCardEl.style.minHeight = needed + 'px';
      }
    };
    const scheduleHeroMinHeight = () => {
      if (heroMinRaf === null) {
        heroMinRaf = requestAnimationFrame(() => {
          heroMinRaf = null;
          adjustHeroMinHeight();
        });
      }
    };
    scheduleHeroMinHeight();
    window.addEventListener('resize', scheduleHeroMinHeight, { passive: true });
    registerCleanup(() => {
      if (heroMinRaf !== null) cancelAnimationFrame(heroMinRaf);
      window.removeEventListener('resize', scheduleHeroMinHeight);
    });
  }

  // FAQ accordion (preserved wiring if FAQ items exist)
  main.querySelectorAll('[data-faq-item]').forEach((item) => {
    const btn = item.querySelector('.faq-trigger');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  function copyCurrentUrl() {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    } else {
      try {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (_e) {}
    }
  }

  const railCopyBtn = document.getElementById('article-rail-copy');
  const railCopyTip = document.getElementById('article-rail-copy-tip');
  let railCopyTimer = null;
  if (railCopyBtn && railCopyTip) {
    railCopyBtn.addEventListener('click', () => {
      copyCurrentUrl();
      clearTimeout(railCopyTimer);
      railCopyTip.textContent = 'تم النسخ';
      railCopyTip.classList.add('is-visible');
      railCopyTimer = setTimeout(() => {
        railCopyTip.classList.remove('is-visible');
        railCopyTip.textContent = '';
      }, 2000);
    });
    registerCleanup(() => {
      clearTimeout(railCopyTimer);
    });
  }

  const copyBtn = document.getElementById('copy-article-link');
  let copyTimer = null;
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      copyCurrentUrl();
      copyBtn.textContent = 'تم النسخ';
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => {
        copyBtn.textContent = 'نسخ الرابط';
      }, 2000);
    });
    registerCleanup(() => {
      clearTimeout(copyTimer);
    });
  }

  initArticleToc(main);

  return art.title + ' | سفريتي';
}
