import { getState, setState, runCleanups } from './store.js';
import { resolveCategoryNavGroup, resolveCategoryChildSlug } from './safarytiLogic.js';

export { resolveCategoryNavGroup };

function isReducedMotionLocal() {
  return (
    (typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) ||
    document.documentElement.classList.contains('no-motion')
  );
}

function isTabletOrLargerLocal() {
  return typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(min-width: 768px)').matches
    : typeof window !== 'undefined'
      ? window.innerWidth >= 768
      : true;
}

let routeTimer = null;
let activeRouteSeq = 0;

const ROUTE_LOADERS = {
  home: () => import('./views/home.js'),
  'all-stories': () => import('./views/archive.js'),
  category: () => import('./views/archive.js'),
  article: () => import('./views/article.js'),
  about: () => import('./views/about.js'),
  contact: () => import('./views/contact.js'),
  privacy: () => import('./views/privacy.js'),
  discover: () => import('./views/discover.js'),
  culture: () => import('./views/culture.js'),
  tips: () => import('./views/tips.js'),
  search: () => import('./views/search.js'),
};

function isTipsHubRoute(route) {
  return route.view === 'category' && resolveCategoryChildSlug(route.param) === 'tips';
}

export function parseHash(rawHash) {
  const src = rawHash !== undefined ? rawHash : window.location.hash || '';
  const h = String(src).replace(/^#/, '').trim();
  if (!h) return { view: 'home', param: '' };
  const parts = h.split('/');
  const view = parts[0];
  let param = '';
  try {
    param = decodeURIComponent(parts.slice(1).join('/'));
  } catch (_e) {
    param = parts.slice(1).join('/');
  }
  const valid = {
    home: 1,
    'all-stories': 1,
    category: 1,
    article: 1,
    about: 1,
    contact: 1,
    privacy: 1,
    discover: 1,
    culture: 1,
    search: 1,
  };
  if (!valid[view]) return { view: 'home', param: '' };
  return { view, param };
}

function preloadContactMedia(includeCardPhoto) {
  if (typeof document === 'undefined' || !document.head) return;
  const cm = window.__SAFARYTI_CONTACT_MEDIA__;
  if (!cm) return;
  const isMob = !isTabletOrLargerLocal();
  const ensure = (key, attrs) => {
    if (document.head.querySelector('link[data-c-pre="' + key + '"]')) return;
    const link = document.createElement('link');
    link.setAttribute('data-c-pre', key);
    for (const k of Object.keys(attrs)) {
      if (attrs[k] != null) link.setAttribute(k, attrs[k]);
    }
    document.head.appendChild(link);
  };
  ensure(
    'hero',
    isMob
      ? {
          rel: 'preload',
          as: 'image',
          type: 'image/webp',
          href: cm.hmHref,
          imagesrcset: cm.hm,
          imagesizes: '100vw',
          fetchpriority: 'high',
        }
      : {
          rel: 'preload',
          as: 'image',
          type: 'image/webp',
          href: cm.hdHref,
          imagesrcset: cm.hd,
          imagesizes: '100vw',
          fetchpriority: 'high',
        }
  );
  if (includeCardPhoto) {
    ensure(
      'photo',
      isMob
        ? {
            rel: 'preload',
            as: 'image',
            type: 'image/webp',
            href: cm.pmHref,
            imagesrcset: cm.pm,
            imagesizes: '(min-width: 1024px) 480px, 92vw',
          }
        : {
            rel: 'preload',
            as: 'image',
            type: 'image/webp',
            href: cm.pdHref,
            imagesrcset: cm.pd,
            imagesizes: '(min-width: 1024px) 480px, 92vw',
          }
    );
  }
}

function preloadSearchMedia() {
  if (typeof document === 'undefined' || !document.head) return;
  const sm = window.__SAFARYTI_SEARCH_MEDIA__;
  if (!sm || document.head.querySelector('link[data-s-pre="fbg"]')) return;
  const href = !isTabletOrLargerLocal() ? sm.fm : sm.fd;
  if (!href) return;
  const link = document.createElement('link');
  link.setAttribute('data-s-pre', 'fbg');
  link.rel = 'preload';
  link.as = 'image';
  link.type = 'image/webp';
  link.href = href;
  link.setAttribute('fetchpriority', 'high');
  document.head.appendChild(link);
}

function preloadHubMedia(view) {
  if (typeof document === 'undefined' || !document.head) return;
  const hm = window.__SAFARYTI_HUB_MEDIA__;
  if (!hm) return;
  const key = view === 'culture' ? 'c' : view === 'discover' ? 'd' : '';
  if (!key) return;
  if (!document.head.querySelector('link[data-h-pre="' + key + '"]')) {
    const isMob = !isTabletOrLargerLocal();
    const href = key === 'c' ? (isMob ? hm.cmHref : hm.cdHref) : isMob ? hm.dmHref : hm.ddHref;
    const srcset = key === 'c' ? (isMob ? hm.cm : hm.cd) : isMob ? hm.dm : hm.dd;
    if (href) {
      const link = document.createElement('link');
      link.setAttribute('data-h-pre', key);
      link.rel = 'preload';
      link.as = 'image';
      link.type = 'image/webp';
      link.href = href;
      if (srcset) link.setAttribute('imagesrcset', srcset);
      link.setAttribute('imagesizes', '100vw');
      link.setAttribute('media', isMob ? '(max-width: 767px)' : '(min-width: 768px)');
      link.setAttribute('fetchpriority', 'high');
      document.head.appendChild(link);
    }
  }
  const hb = key === 'c' ? window.__SAFARYTI_HUB_BOOT__ : null;
  if (hb && hb.js && !document.head.querySelector('link[data-h-mod="c"]')) {
    for (let i = 0; i < hb.js.length; i++) {
      const mLink = document.createElement('link');
      mLink.setAttribute('data-h-mod', 'c');
      mLink.rel = 'modulepreload';
      mLink.crossOrigin = '';
      mLink.href = hb.js[i];
      document.head.appendChild(mLink);
    }
  }
  if (hb && hb.css && !document.head.querySelector('link[data-h-css="c"]')) {
    for (let i = 0; i < hb.css.length; i++) {
      const cLink = document.createElement('link');
      cLink.setAttribute('data-h-css', 'c');
      cLink.rel = 'preload';
      cLink.as = 'style';
      cLink.crossOrigin = '';
      cLink.href = hb.css[i];
      document.head.appendChild(cLink);
    }
  }
}

function preloadArchiveMedia() {
  if (typeof document === 'undefined' || !document.head) return;
  const am = window.__SAFARYTI_ARCHIVE_MEDIA__;
  if (am && !document.head.querySelector('link[data-a-pre="hero"]')) {
    const isMob = !isTabletOrLargerLocal();
    const href = isMob ? am.hmHref : am.hdHref;
    const srcset = isMob ? am.hm : am.hd;
    if (href) {
      const link = document.createElement('link');
      link.setAttribute('data-a-pre', 'hero');
      link.rel = 'preload';
      link.as = 'image';
      link.type = 'image/webp';
      link.href = href;
      if (srcset) link.setAttribute('imagesrcset', srcset);
      link.setAttribute('imagesizes', '100vw');
      link.setAttribute('media', isMob ? '(max-width: 767px)' : '(min-width: 768px)');
      link.setAttribute('fetchpriority', 'high');
      document.head.appendChild(link);
    }
  }
  const ab = window.__SAFARYTI_ARCHIVE_BOOT__;
  if (ab && ab.js && !document.head.querySelector('link[data-a-mod="a"]')) {
    for (let i = 0; i < ab.js.length; i++) {
      const mLink = document.createElement('link');
      mLink.setAttribute('data-a-mod', 'a');
      mLink.rel = 'modulepreload';
      mLink.crossOrigin = '';
      mLink.href = ab.js[i];
      document.head.appendChild(mLink);
    }
  }
  if (ab && ab.css && !document.head.querySelector('link[data-a-css="a"]')) {
    for (let i = 0; i < ab.css.length; i++) {
      const cLink = document.createElement('link');
      cLink.setAttribute('data-a-css', 'a');
      cLink.rel = 'preload';
      cLink.as = 'style';
      cLink.crossOrigin = '';
      cLink.href = ab.css[i];
      document.head.appendChild(cLink);
    }
  }
}

export function prefetchContactChunkIdle() {
  ROUTE_LOADERS.contact().catch(() => {});
}

function ensureSectionsBelowCss() {
  if (typeof document === 'undefined' || !document.head) return;
  const href = window.__SAFARYTI_BELOW_CSS__;
  if (!href || document.head.querySelector('link[data-sections-below-link]')) return;
  const link = document.createElement('link');
  link.setAttribute('data-sections-below-link', '1');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

export function prefetchRouteByHash(href) {
  if (!href) return;
  const route = parseHash(href);
  if (route.view === 'contact') preloadContactMedia(false);
  else if (route.view === 'search') preloadSearchMedia();
  else if (route.view === 'culture' || route.view === 'discover') preloadHubMedia(route.view);
  else if (route.view === 'all-stories') preloadArchiveMedia();
  if (route.view !== 'search' && route.view !== 'culture') ensureSectionsBelowCss();
  const loader = isTipsHubRoute(route) ? ROUTE_LOADERS.tips : ROUTE_LOADERS[route.view];
  if (loader) {
    loader().catch(() => {});
  }
}

export function resolveActiveChildCategorySlug(route) {
  if (route.view !== 'category') return '';
  return resolveCategoryChildSlug(route.param);
}

export function syncNavAriaCurrent(route) {
  const catGroup = route.view === 'category' ? resolveCategoryNavGroup(route.param) : '';
  document.querySelectorAll('.nav-link, .menu-overlay-link').forEach((nl) => {
    const key = nl.getAttribute('data-nav');
    const active =
      (route.view === 'home' && key === 'home') ||
      (route.view === 'all-stories' && key === 'all-stories') ||
      ((route.view === 'discover' || catGroup === 'discover') && key === 'discover') ||
      (catGroup === 'africa' && key === 'africa') ||
      (catGroup === 'asia' && key === 'asia') ||
      ((route.view === 'culture' || catGroup === 'culture') && key === 'culture') ||
      (catGroup === 'tips' && key === 'tips');
    if (active) {
      if (nl.getAttribute('aria-current') !== 'page') nl.setAttribute('aria-current', 'page');
    } else if (nl.hasAttribute('aria-current')) {
      nl.removeAttribute('aria-current');
    }
  });

  const openSearchBtn = document.getElementById('open-search-btn');
  if (openSearchBtn) {
    if (route.view === 'search') {
      if (openSearchBtn.getAttribute('aria-current') !== 'page') openSearchBtn.setAttribute('aria-current', 'page');
    } else if (openSearchBtn.hasAttribute('aria-current')) {
      openSearchBtn.removeAttribute('aria-current');
    }
  }

  const activeSlug = resolveActiveChildCategorySlug(route);
  const childHref = activeSlug ? '#category/' + activeSlug : '';
  document.querySelectorAll('.dropdown-link, .menu-sub-link').forEach((cl) => {
    const href = cl.getAttribute('href') || '';
    if (childHref && href === childHref) {
      if (cl.getAttribute('aria-current') !== 'page') cl.setAttribute('aria-current', 'page');
    } else if (cl.hasAttribute('aria-current')) {
      cl.removeAttribute('aria-current');
    }
  });
}

export function focusViewHeading() {
  const mainEl = document.getElementById('main-content');
  if (!mainEl) return;
  const { currentView } = getState();
  const searchInp = currentView === 'search' ? document.getElementById('search-page-input') : null;
  if (searchInp) {
    searchInp.focus({ preventScroll: true });
    const len = searchInp.value.length;
    if (len && searchInp.setSelectionRange) {
      try {
        searchInp.setSelectionRange(len, len);
      } catch (_e) {}
    }
    return;
  }
  const h1 = mainEl.querySelector('h1');
  if (h1) {
    if (!h1.hasAttribute('tabindex')) h1.setAttribute('tabindex', '-1');
    h1.focus({ preventScroll: true });
  } else {
    mainEl.focus({ preventScroll: true });
  }
}

export function renderRoute(isInitial) {
  const mainEl = document.getElementById('main-content');
  if (!mainEl) return;
  const seq = ++activeRouteSeq;
  const route = parseHash();
  if (route.view === 'contact') preloadContactMedia(true);
  else if (route.view === 'search') preloadSearchMedia();
  else if (route.view === 'culture' || route.view === 'discover') preloadHubMedia(route.view);
  else if (route.view === 'all-stories') preloadArchiveMedia();
  if (route.view !== 'search' && route.view !== 'culture') ensureSectionsBelowCss();
  setState({ currentView: route.view, route, activeSceneIndex: -1 });
  clearTimeout(routeTimer);

  function finalizeCommit(title) {
    if (document.title !== title) document.title = title;
    syncNavAriaCurrent(route);

    if (mainEl.classList.contains('is-leaving')) mainEl.classList.remove('is-leaving');
    if (document.documentElement.classList.contains('is-nonhome-init')) {
      document.documentElement.classList.remove('is-nonhome-init');
    }
    const skipMobileScrollRead = isInitial && route.view === 'home' && !isTabletOrLargerLocal();
    requestAnimationFrame(() => {
      if (seq !== activeRouteSeq) return;
      if (skipMobileScrollRead) {
        const promo = document.getElementById('floating-callout');
        if (promo) {
          let dismissed = false;
          try {
            dismissed = sessionStorage.getItem('safaryti_promo_closed') === '1';
          } catch (_e) {}
          if (promo.classList.contains('is-visible') !== !dismissed) {
            promo.classList.toggle('is-visible', !dismissed);
          }
        }
      } else {
        import('./scrollController.js').then((m) => {
          if (seq === activeRouteSeq) m.updateScrollEffects();
        });
      }
    });

    if (!isInitial || route.view === 'search') {
      focusViewHeading();
    }
  }

  if (route.view === 'home') {
    const loadHomeMod = ROUTE_LOADERS.home();
    const waitHomeDelay = isInitial || isReducedMotionLocal()
      ? Promise.resolve()
      : new Promise((resolve) => {
          mainEl.classList.add('is-leaving');
          routeTimer = setTimeout(resolve, 150);
        });
    return Promise.all([loadHomeMod, waitHomeDelay]).then(([mod]) => {
      if (seq !== activeRouteSeq) return;
      runCleanups();
      if (!isInitial) window.scrollTo(0, 0);
      const r = mod.renderHome(mainEl, { isInitial });
      if (r && typeof r.then === 'function') {
        return r.then(() => {
          if (seq === activeRouteSeq) finalizeCommit('سفريتي | دليلك الشامل للسفر حول العالم');
        });
      }
      finalizeCommit('سفريتي | دليلك الشامل للسفر حول العالم');
    });
  }

  const useTipsHub = isTipsHubRoute(route);
  const loader = useTipsHub ? ROUTE_LOADERS.tips : ROUTE_LOADERS[route.view];
  const modPromise = loader();

  const waitDelay = isInitial || isReducedMotionLocal()
    ? Promise.resolve()
    : new Promise((resolve) => {
        mainEl.classList.add('is-leaving');
        routeTimer = setTimeout(resolve, 150);
      });

  return Promise.all([modPromise, waitDelay]).then(([mod]) => {
    if (seq !== activeRouteSeq) return;
    runCleanups();
    if (!isInitial) window.scrollTo(0, 0);
    let title = 'سفريتي | دليلك الشامل للسفر حول العالم';
    if (useTipsHub) {
      title = mod.renderTips(mainEl);
    } else if (route.view === 'all-stories') {
      title = mod.renderArchive(mainEl, 'all-stories', route.param);
    } else if (route.view === 'category') {
      title = mod.renderArchive(mainEl, 'category', route.param);
    } else if (route.view === 'article') {
      title = mod.renderArticle(mainEl, route.param);
    } else if (route.view === 'about') {
      title = mod.renderAbout(mainEl);
    } else if (route.view === 'contact') {
      title = mod.renderContact(mainEl);
    } else if (route.view === 'privacy') {
      title = mod.renderPrivacy(mainEl);
    } else if (route.view === 'discover') {
      title = mod.renderDiscover(mainEl);
    } else if (route.view === 'culture') {
      title = mod.renderCulture(mainEl);
    } else if (route.view === 'search') {
      title = mod.renderSearchPage(mainEl, route.param);
    }
    finalizeCommit(title);
  });
}
