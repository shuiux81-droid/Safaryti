import { renderRoute } from './router.js';

function bootstrap() {
  const initialTask = renderRoute(true);
  if (initialTask && typeof initialTask.then === 'function') {
    initialTask.then(() => {
      document.documentElement.classList.add('js-ready');
    });
  } else {
    document.documentElement.classList.add('js-ready');
  }

  window.addEventListener('hashchange', () => {
    renderRoute(false);
  });

  let secondaryPromise = null;
  let secondaryReady = false;
  const loadSecondary = () => {
    if (!secondaryPromise) {
      secondaryPromise = import('./bootstrapSecondary.js').then((m) => {
        m.initSecondaryShell();
        secondaryReady = true;
      });
    }
    return secondaryPromise;
  };
  const isTab =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(min-width: 768px)').matches
      : window.innerWidth >= 768;
  const isNonHomeInit = document.documentElement.classList.contains('is-nonhome-init');

  if (isTab || isNonHomeInit) {
    if (isTab) loadSecondary();
    else setTimeout(loadSecondary, 0);
  } else {
    let scheduled = false;
    const triggerSecondary = () => {
      if (scheduled) return;
      scheduled = true;
      ['pointerdown', 'touchstart', 'keydown', 'scroll'].forEach((ev) => {
        window.removeEventListener(ev, triggerSecondary, true);
      });
      window.removeEventListener('hashchange', triggerSecondary);
      loadSecondary();
    };
    ['pointerdown', 'touchstart', 'keydown', 'scroll'].forEach((ev) => {
      window.addEventListener(ev, triggerSecondary, { once: true, passive: true, capture: true });
    });
    window.addEventListener('hashchange', triggerSecondary, { once: true });

    const promoCloseBtn = document.getElementById('floating-callout-close');
    if (promoCloseBtn) {
      promoCloseBtn.addEventListener(
        'click',
        () => {
          try {
            sessionStorage.setItem('safaryti_promo_closed', '1');
          } catch (_e) {}
          const fc = document.getElementById('floating-callout');
          if (fc) fc.classList.remove('is-visible');
        },
        { once: true }
      );
    }

    const menuBtn = document.getElementById('open-menu-btn');
    if (menuBtn) {
      const onEarlyMenuTap = () => {
        if (!secondaryReady) {
          loadSecondary().then(() => {
            if (!document.getElementById('menu-overlay')?.classList.contains('is-open')) {
              menuBtn.click();
            }
          });
        }
      };
      menuBtn.addEventListener('click', onEarlyMenuTap, { once: true });
    }

    const queueIdleSecondary = () => {
      if (scheduled) return;
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(triggerSecondary, { timeout: 1400 });
      } else {
        setTimeout(triggerSecondary, 300);
      }
    };
    if (document.readyState === 'complete') {
      queueIdleSecondary();
    } else {
      window.addEventListener('load', queueIdleSecondary, { once: true });
    }
  }
}

bootstrap();
