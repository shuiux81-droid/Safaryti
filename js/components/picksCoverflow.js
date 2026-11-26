import { CONFIG } from '../config.js';
import { registerCleanup } from '../store.js';
import {
  esc,
  formatArabicDate,
  formatViews,
  arrowLeftSvg,
  arrowRightSvg,
  renderPictureHtml,
  isSmallPhoneViewport,
  isTabletOrLarger,
  getTabletMin768Query,
} from '../utils.js';
import { renderMediaBox, hydrateLazyMedia } from '../utils/viewHelpers.js';

export function formatPickRegionTag(raw) {
  return String(raw || '')
    .split('||')[0]
    .replace(/\s*\([^)]*\)\s*/g, '')
    .trim();
}

export function renderPicksCoverflowHtml(isCoverflow = true) {
  const picksList = isCoverflow ? CONFIG.picks.slice(0, 5) : CONFIG.picks;
  const nPicks = picksList.length;
  const halfPicks = Math.floor(nPicks / 2);
  return picksList
    .map((p, idx) => {
      const tagText = formatPickRegionTag(p.category);
      let extraAttrs = '';
      let extraClass = '';
      if (isCoverflow) {
        const d0 = ((idx - 0 + nPicks + halfPicks) % nPicks) - halfPicks;
        const posCls =
          d0 === 0
            ? 'is-pos-0'
            : d0 === 1
              ? 'is-pos-p1'
              : d0 === -1
                ? 'is-pos-m1'
                : d0 === 2
                  ? 'is-pos-p2'
                  : d0 === -2
                    ? 'is-pos-m2'
                    : d0 > 0
                      ? 'is-pos-hidden-p'
                      : 'is-pos-hidden-m';
        extraClass = ' ' + posCls;
        if (idx === 0) extraAttrs = ' aria-current="true"';
      }
      return (
        '<a href="' +
        esc(p.href) +
        '" class="picks-cf-card' +
        extraClass +
        '" data-pick-index="' +
        idx +
        '"' +
        extraAttrs +
        '>' +
        renderPictureHtml(p.image, {
          alt: p.title,
          cls: 'picks-cf-img',
          lazySrc: !isCoverflow && idx >= 2,
          loading: 'lazy',
          decoding: 'async',
          sizes: '(min-width: 1024px) 360px, 272px',
        }) +
        '<div class="picks-cf-scrim" aria-hidden="true"></div>' +
        '<div class="picks-cf-content">' +
        '<span class="picks-cf-tag">' +
        esc(tagText) +
        '</span>' +
        '<h3 class="picks-cf-title">' +
        esc(p.title) +
        '</h3>' +
        '<div class="picks-cf-meta"><span>' +
        esc(formatArabicDate(p.date)) +
        '</span><span aria-hidden="true">·</span><span class="tabular">' +
        esc(formatViews(p.views)) +
        '</span></div>' +
        '<span class="picks-cf-cta"><span>اقرأ القصة</span><span class="picks-cf-cta-icon" aria-hidden="true">' +
        arrowLeftSvg() +
        '</span></span>' +
        '</div>' +
        (isCoverflow ? '<div class="picks-cf-dim" aria-hidden="true"></div>' : '') +
        '</a>'
      );
    })
    .join('');
}

export function renderPicksControlsHtml(nPicks = CONFIG.picks.slice(0, 5).length) {
  return (
    '<div class="picks-cf-controls">' +
    '<button type="button" id="picks-cf-prev" class="picks-cf-arrow" aria-label="القصة السابقة">' +
    arrowRightSvg() +
    '</button>' +
    '<span id="picks-cf-counter" class="picks-cf-counter tabular" aria-live="polite" aria-atomic="true" aria-label="1 من ' +
    nPicks +
    '"><span class="picks-cf-counter-cur">1</span><span class="picks-cf-counter-sep" aria-hidden="true">/</span><span class="picks-cf-counter-total">' +
    nPicks +
    '</span></span>' +
    '<button type="button" id="picks-cf-next" class="picks-cf-arrow" aria-label="القصة التالية">' +
    arrowLeftSvg() +
    '</button>' +
    '</div>'
  );
}

export function renderPicksGridHtml() {
  return CONFIG.picks
    .slice(0, 8)
    .map((p) => {
      return (
        '<a href="' +
        esc(p.href) +
        '" class="pick-card" data-reveal>' +
        '<div class="pick-card-media">' +
        renderMediaBox(p.image, p.title, '', false, '(min-width: 1024px) 220px, (min-width: 640px) 45vw, 358px') +
        '<span class="pill-tag pick-card-tag">' +
        esc(formatPickRegionTag(p.category)) +
        '</span>' +
        '</div>' +
        '<div class="pick-card-body">' +
        '<h3 class="t-row-title"><span class="story-row-title-text">' +
        esc(p.title) +
        '</span></h3>' +
        '<div class="story-meta t-meta"><span>' +
        esc(formatArabicDate(p.date)) +
        '</span><span aria-hidden="true">·</span><span class="tabular">' +
        esc(formatViews(p.views)) +
        '</span></div>' +
        '</div>' +
        '</a>'
      );
    })
    .join('');
}

export function initPicksCoverflow() {
  const stage = document.getElementById('picks-cf-stage');
  if (!stage) return;
  const cfRoot = stage.parentElement || stage;
  const mqDesktop = getTabletMin768Query();
  let stopDesktop = null;
  let stopMobile = null;

  function mountDesktopCoverflow() {
    if (stopMobile) {
      stopMobile();
      stopMobile = null;
    }
    if (stopDesktop) return;

    stage.setAttribute('role', 'region');
    stage.setAttribute('aria-roledescription', 'carousel');
    stage.setAttribute('aria-label', 'من اختيارات المسافرين');
    stage.setAttribute('tabindex', '0');

    const expectedCount = CONFIG.picks.slice(0, 5).length;
    const hasDesktopMarkup =
      stage.querySelectorAll('.picks-cf-card').length === expectedCount &&
      Boolean(stage.querySelector('.picks-cf-dim'));
    if (!hasDesktopMarkup) {
      stage.innerHTML = renderPicksCoverflowHtml(true);
    }

    if (!cfRoot.querySelector('.picks-cf-controls')) {
      cfRoot.insertAdjacentHTML('beforeend', renderPicksControlsHtml(expectedCount));
    }

    const prevBtn = document.getElementById('picks-cf-prev');
    const nextBtn = document.getElementById('picks-cf-next');
    const counterEl = document.getElementById('picks-cf-counter');
    const counterCurEl = counterEl ? counterEl.querySelector('.picks-cf-counter-cur') : null;
    const cards = Array.prototype.slice.call(stage.querySelectorAll('.picks-cf-card'));
    const n = cards.length;
    if (!n) return;
    const half = Math.floor(n / 2);
    let active = 0;
    const prevDistances = new Array(n);
    const posClasses = ['is-pos-0', 'is-pos-p1', 'is-pos-m1', 'is-pos-p2', 'is-pos-m2', 'is-pos-hidden-p', 'is-pos-hidden-m'];

    let wrapRaf1 = null;
    let wrapRaf2 = null;
    let resizeRaf = null;

    function syncCoverflow() {
      const maxVis = isSmallPhoneViewport() ? 1 : 2;
      const wrappedCards = [];
      cards.forEach((card, idx) => {
        const d = ((idx - active + n + half) % n) - half;
        const prevD = prevDistances[idx];
        const isWrapJump = typeof prevD === 'number' && Math.abs(d - prevD) > half;
        if (isWrapJump) {
          card.classList.add('is-no-trans');
          wrappedCards.push(card);
        }

        posClasses.forEach((cls) => {
          card.classList.remove(cls);
        });
        let cls;
        if (d === 0) cls = 'is-pos-0';
        else if (d === 1) cls = 'is-pos-p1';
        else if (d === -1) cls = 'is-pos-m1';
        else if (d === 2) cls = 'is-pos-p2';
        else if (d === -2) cls = 'is-pos-m2';
        else cls = d > 0 ? 'is-pos-hidden-p' : 'is-pos-hidden-m';
        card.classList.add(cls);
        prevDistances[idx] = d;

        const isVisible = Math.abs(d) <= maxVis;
        card.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
        card.setAttribute('tabindex', isVisible ? '0' : '-1');
        if (isVisible) card.removeAttribute('inert');
        else card.setAttribute('inert', '');
        if (d === 0) card.setAttribute('aria-current', 'true');
        else card.removeAttribute('aria-current');
      });

      if (counterCurEl) counterCurEl.textContent = String(active + 1);
      if (counterEl) counterEl.setAttribute('aria-label', active + 1 + ' من ' + n);

      if (wrapRaf1 !== null) cancelAnimationFrame(wrapRaf1);
      if (wrapRaf2 !== null) cancelAnimationFrame(wrapRaf2);
      if (wrappedCards.length) {
        wrapRaf1 = requestAnimationFrame(() => {
          wrapRaf1 = null;
          wrapRaf2 = requestAnimationFrame(() => {
            wrapRaf2 = null;
            wrappedCards.forEach((c) => {
              c.classList.remove('is-no-trans');
            });
          });
        });
      }
    }

    function goTo(targetIdx) {
      const wrapped = ((targetIdx % n) + n) % n;
      if (wrapped === active) return;
      active = wrapped;
      syncCoverflow();
    }

    const onPrevClick = () => {
      goTo(active - 1);
    };
    const onNextClick = () => {
      goTo(active + 1);
    };
    if (prevBtn) prevBtn.addEventListener('click', onPrevClick);
    if (nextBtn) nextBtn.addEventListener('click', onNextClick);

    let didDrag = false;
    let dragTimer = null;
    const cardHandlers = cards.map((card, idx) => {
      const onCardClick = (e) => {
        if (didDrag) {
          e.preventDefault();
          didDrag = false;
          return;
        }
        if (idx !== active) {
          e.preventDefault();
          goTo(idx);
        }
      };
      card.addEventListener('click', onCardClick);
      return { card, onCardClick };
    });

    const onKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(active - 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(active + 1);
      }
    };
    cfRoot.addEventListener('keydown', onKeyDown);

    let pStartX = 0;
    let pStartY = 0;
    let pTracking = false;
    const onPointerDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pStartX = e.clientX;
      pStartY = e.clientY;
      pTracking = true;
      didDrag = false;
    };
    const onPointerUp = (e) => {
      if (!pTracking) return;
      pTracking = false;
      const dx = e.clientX - pStartX;
      const dy = e.clientY - pStartY;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
        didDrag = true;
        goTo(dx > 0 ? active + 1 : active - 1);
        clearTimeout(dragTimer);
        dragTimer = setTimeout(() => {
          didDrag = false;
        }, 120);
      }
    };
    const onPointerCancel = () => {
      pTracking = false;
      didDrag = false;
    };
    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointerup', onPointerUp);
    stage.addEventListener('pointercancel', onPointerCancel);

    const onResize = () => {
      if (resizeRaf === null) {
        resizeRaf = requestAnimationFrame(() => {
          resizeRaf = null;
          syncCoverflow();
        });
      }
    };
    window.addEventListener('resize', onResize, { passive: true });

    syncCoverflow();

    stopDesktop = () => {
      clearTimeout(dragTimer);
      if (wrapRaf1 !== null) cancelAnimationFrame(wrapRaf1);
      if (wrapRaf2 !== null) cancelAnimationFrame(wrapRaf2);
      if (resizeRaf !== null) cancelAnimationFrame(resizeRaf);
      if (prevBtn) prevBtn.removeEventListener('click', onPrevClick);
      if (nextBtn) nextBtn.removeEventListener('click', onNextClick);
      cardHandlers.forEach(({ card, onCardClick }) => {
        card.removeEventListener('click', onCardClick);
      });
      cfRoot.removeEventListener('keydown', onKeyDown);
      stage.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointerup', onPointerUp);
      stage.removeEventListener('pointercancel', onPointerCancel);
      window.removeEventListener('resize', onResize);
    };
  }

  function mountMobileRow() {
    if (stopDesktop) {
      stopDesktop();
      stopDesktop = null;
    }

    stage.setAttribute('role', 'region');
    stage.removeAttribute('aria-roledescription');
    stage.removeAttribute('tabindex');
    stage.setAttribute('aria-label', 'من اختيارات المسافرين');

    const controlsEl = cfRoot.querySelector('.picks-cf-controls');
    if (controlsEl) {
      controlsEl.remove();
    }

    const hasMobileMarkup =
      stage.querySelectorAll('.picks-cf-card').length === CONFIG.picks.length &&
      !stage.querySelector('.picks-cf-dim');
    if (!hasMobileMarkup) {
      stage.innerHTML = renderPicksCoverflowHtml(false);
      stage.scrollLeft = 0;
    }

    if (stopMobile) {
      stopMobile();
      stopMobile = null;
    }
    if ('IntersectionObserver' in window && stage.querySelector('[data-lazy-src],[data-lazy-srcset]')) {
      const rowIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              hydrateLazyMedia(entry.target);
              rowIo.unobserve(entry.target);
            }
          });
        },
        { root: stage, rootMargin: '0px 320px 0px 320px' }
      );
      stage.querySelectorAll('.picks-cf-card').forEach((card) => {
        if (card.querySelector('[data-lazy-src],[data-lazy-srcset]')) rowIo.observe(card);
      });
      stopMobile = () => rowIo.disconnect();
    } else {
      hydrateLazyMedia(stage);
    }
  }

  function applyMode(isDesktop) {
    if (isDesktop) mountDesktopCoverflow();
    else mountMobileRow();
  }

  applyMode(isTabletOrLarger());

  const onMediaChange = (e) => {
    applyMode(e.matches);
  };
  if (mqDesktop) {
    if (mqDesktop.addEventListener) mqDesktop.addEventListener('change', onMediaChange);
    else if (mqDesktop.addListener) mqDesktop.addListener(onMediaChange);
  }

  registerCleanup(() => {
    if (stopDesktop) {
      stopDesktop();
      stopDesktop = null;
    }
    if (stopMobile) {
      stopMobile();
      stopMobile = null;
    }
    if (mqDesktop) {
      if (mqDesktop.removeEventListener) mqDesktop.removeEventListener('change', onMediaChange);
      else if (mqDesktop.removeListener) mqDesktop.removeListener(onMediaChange);
    }
  });
}
