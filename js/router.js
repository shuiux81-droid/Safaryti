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

export function prefetchRouteByHash(href) {
  if (!href) return;
  const route = parseHash(href);
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
