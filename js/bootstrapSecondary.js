import { CONFIG } from './config.js';
import { getState } from './store.js';
import { isTabletOrLarger } from './utils.js';
import { setupHeader, closeAllDropdowns } from './components/header.js';
import { setupMenuOverlay, closeMenu, isMenuOpen } from './components/menuOverlay.js';
import { setupFooterAndRails } from './components/footer.js';
import { initScrollController } from './scrollController.js';
import { parseHash, syncNavAriaCurrent, focusViewHeading, renderRoute, prefetchRouteByHash } from './router.js';

let initialized = false;

export function initSecondaryShell() {
  if (initialized) return;
  initialized = true;

  setupHeader();
  initScrollController();
  setupMenuOverlay();
  const footerEl = document.getElementById('site-footer');
  const footerNearViewport =
    footerEl && footerEl.getBoundingClientRect().top < (window.innerHeight || 900) + 100;
  if (isTabletOrLarger() || footerNearViewport) {
    setupFooterAndRails();
  } else {
    setTimeout(setupFooterAndRails, 0);
  }

  const onPrefetchLink = (e) => {
    const link = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (link) prefetchRouteByHash(link.getAttribute('href'));
  };
  document.addEventListener('pointerenter', onPrefetchLink, true);
  document.addEventListener('touchstart', onPrefetchLink, { capture: true, passive: true });
  document.addEventListener('focusin', onPrefetchLink, true);

  const runContactIdlePrefetch = () => {
    const view = getState().currentView;
    if (view !== 'contact' && view !== 'search' && view !== 'culture') {
      prefetchRouteByHash('#contact');
    }
  };
  const queueContactPrefetch = () => {
    const view = getState().currentView;
    if (view === 'search' || view === 'culture') return;
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(runContactIdlePrefetch, { timeout: 2500 });
    } else {
      setTimeout(runContactIdlePrefetch, 1200);
    }
  };
  if (getState().currentView !== 'search' && getState().currentView !== 'culture') {
    if (document.readyState === 'complete') {
      queueContactPrefetch();
    } else {
      window.addEventListener('load', queueContactPrefetch, { once: true });
    }
  }

  // Handle same-hash re-clicks on #discover, #culture, and #search (scroll to top & focus)
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = (link.getAttribute('href') || '').trim();
    const discoverHash = (CONFIG.routes && CONFIG.routes.discover) || '#discover';
    const cultureHash = (CONFIG.routes && CONFIG.routes.culture) || '#culture';
    if (
      href !== '#discover' &&
      href !== '#culture' &&
      href !== '#search' &&
      href !== discoverHash &&
      href !== cultureHash
    ) {
      return;
    }
    const currentHash = window.location.hash || '#home';
    if (currentHash === href) {
      closeAllDropdowns();
      if (isMenuOpen()) closeMenu(false);
      window.scrollTo(0, 0);
      syncNavAriaCurrent(parseHash());
      focusViewHeading();
    }
  });

  const mq1024 = window.matchMedia ? window.matchMedia('(min-width: 1024px)') : null;
  if (mq1024 && mq1024.addEventListener) {
    mq1024.addEventListener('change', () => {
      const { currentView } = getState();
      if (currentView === 'home' || currentView === 'privacy') {
        renderRoute(true);
      }
    });
  }
}
