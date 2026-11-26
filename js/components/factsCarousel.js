import { CONFIG } from '../config.js';
import { registerCleanup } from '../store.js';
import { esc, isReducedMotion, isMobileViewport, arrowLeftSvg, arrowRightSvg, renderPictureHtml } from '../utils.js';
import { hydrateLazyMedia } from '../utils/viewHelpers.js';

export function renderAsideFactsCardHtml() {
  const total = CONFIG.facts.length;
  const deferSlides = isMobileViewport();
  return (
    '<section class="aside-facts-section" aria-labelledby="aside-facts-heading">' +
    '<h2 id="aside-facts-heading" class="aside-facts-heading no-auto-ads">مواضيع مقترحة</h2>' +
    '<div id="aside-facts-card" class="aside-facts-card" role="region" aria-roledescription="carousel" aria-label="هل تعلم؟" tabindex="0">' +
    '<div class="aside-facts-stage">' +
    CONFIG.facts
      .map((f, idx) => {
        const active = idx === 0;
        return (
          '<div class="aside-fact-slide' +
          (active ? ' is-active' : '') +
          '" role="group" aria-roledescription="slide" aria-label="' +
          (idx + 1) +
          ' من ' +
          total +
          '" aria-hidden="' +
          (active ? 'false' : 'true') +
          '"' +
          (active ? '' : ' inert') +
          ' data-fact-idx="' +
          idx +
          '">' +
          renderPictureHtml(f.image, {
            alt: f.heading,
            cls: 'aside-fact-img',
            lazySrc: deferSlides && idx >= 1,
            loading: 'lazy',
            decoding: 'async',
            sizes: '(min-width: 1024px) 348px, 358px',
            onerror: "this.style.display='none'",
          }) +
          '<div class="aside-fact-content">' +
          '<div class="aside-fact-glass">' +
          '<span class="aside-fact-chip">هل تعلم؟</span>' +
          '<h3 class="aside-fact-title no-auto-ads">' +
          esc(f.heading) +
          '</h3>' +
          '<p class="aside-fact-text">' +
          esc(f.text) +
          '</p>' +
          '<button type="button" class="aside-fact-more-btn" aria-expanded="false"' +
          (active ? '' : ' tabindex="-1"') +
          ' hidden>اقرأ المزيد</button>' +
          '</div>' +
          '</div>' +
          '</div>'
        );
      })
      .join('') +
    '</div>' +
    '<div class="aside-facts-controls">' +
    '<div class="aside-facts-dots" id="aside-facts-dots">' +
    CONFIG.facts
      .map((_, idx) => {
        return (
          '<button type="button" class="aside-fact-dot' +
          (idx === 0 ? ' is-active' : '') +
          '" data-aside-fact-dot="' +
          idx +
          '" aria-label="عرض الشريحة ' +
          (idx + 1) +
          ' من ' +
          total +
          '"' +
          (idx === 0 ? ' aria-current="true"' : '') +
          '></button>'
        );
      })
      .join('') +
    '</div>' +
    '<div class="aside-facts-actions">' +
    '<button type="button" id="aside-facts-pause" class="aside-facts-ctrl-btn" aria-pressed="false" aria-label="إيقاف العرض التلقائي مؤقتًا">' +
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>' +
    '</button>' +
    '<button type="button" id="aside-facts-prev" class="aside-facts-ctrl-btn" aria-label="السابق">' +
    arrowRightSvg() +
    '</button>' +
    '<button type="button" id="aside-facts-next" class="aside-facts-ctrl-btn" aria-label="التالي">' +
    arrowLeftSvg() +
    '</button>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</section>'
  );
}

export function initFactsCarouselWidget() {
  const asideCard = document.getElementById('aside-facts-card');
  if (asideCard) {
    const aSlides = Array.prototype.slice.call(asideCard.querySelectorAll('.aside-fact-slide'));
    const aDots = Array.prototype.slice.call(asideCard.querySelectorAll('.aside-fact-dot'));
    const aPause = document.getElementById('aside-facts-pause');
    const aPrev = document.getElementById('aside-facts-prev');
    const aNext = document.getElementById('aside-facts-next');
    if (aSlides.length) {
      let aIdx = 0;
      let aUserPaused = false;
      let aHover = false;
      let aFocused = false;
      let aTimer = null;

      function isAsideFactsPaused() {
        return isReducedMotion() || aUserPaused || aHover || aFocused || document.hidden;
      }

      function syncAsideFactsTimer() {
        clearInterval(aTimer);
        asideCard.classList.toggle('is-paused', isAsideFactsPaused());
        if (!isAsideFactsPaused() && aSlides.length > 1) {
          aTimer = setInterval(() => {
            goAsideFact(aIdx + 1);
          }, 5000);
        }
      }

      let factImgRaf1 = null;
      let factImgRaf2 = null;

      function syncAsideClampToggles() {
        if (!asideCard.isConnected || asideCard.offsetParent === null) return;
        const items = [];
        aSlides.forEach((slide) => {
          const textEl = slide.querySelector('.aside-fact-text');
          const moreBtn = slide.querySelector('.aside-fact-more-btn');
          if (!textEl || !moreBtn) return;
          const wasExpanded = slide.classList.contains('is-expanded');
          if (wasExpanded) slide.classList.remove('is-expanded');
          items.push({ slide, textEl, moreBtn, wasExpanded });
        });
        const clamps = items.map((it) => it.textEl.scrollHeight > it.textEl.clientHeight + 2);
        items.forEach((it, idx) => {
          const needsClamp = clamps[idx];
          if (it.wasExpanded && needsClamp) it.slide.classList.add('is-expanded');
          it.moreBtn.hidden = !needsClamp;
          if (!needsClamp) {
            it.moreBtn.setAttribute('aria-expanded', 'false');
            it.moreBtn.textContent = 'اقرأ المزيد';
          }
        });
      }

      function hydrateFactWindow(centerIdx) {
        if (!aSlides.length) return;
        hydrateLazyMedia(aSlides[centerIdx]);
        hydrateLazyMedia(aSlides[(centerIdx + 1) % aSlides.length]);
      }

      function goAsideFact(idx) {
        aIdx = ((idx % aSlides.length) + aSlides.length) % aSlides.length;
        hydrateFactWindow(aIdx);
        if (factImgRaf1 !== null) cancelAnimationFrame(factImgRaf1);
        if (factImgRaf2 !== null) cancelAnimationFrame(factImgRaf2);
        aSlides.forEach((s, i) => {
          const active = i === aIdx;
          s.classList.toggle('is-active', active);
          s.setAttribute('aria-hidden', active ? 'false' : 'true');
          if (active) s.removeAttribute('inert');
          else s.setAttribute('inert', '');
          const moreBtn = s.querySelector('.aside-fact-more-btn');
          if (moreBtn) {
            moreBtn.setAttribute('tabindex', active ? '0' : '-1');
          }
          if (active && !isReducedMotion()) {
            const img = s.querySelector('.aside-fact-img');
            if (img) {
              img.style.animation = 'none';
              factImgRaf1 = requestAnimationFrame(() => {
                factImgRaf1 = null;
                factImgRaf2 = requestAnimationFrame(() => {
                  factImgRaf2 = null;
                  img.style.animation = '';
                });
              });
            }
          }
        });
        aDots.forEach((d, i) => {
          const active = i === aIdx;
          d.classList.toggle('is-active', active);
          if (active) d.setAttribute('aria-current', 'true');
          else d.removeAttribute('aria-current');
        });
      }

      if (aPrev) aPrev.addEventListener('click', () => { goAsideFact(aIdx - 1); syncAsideFactsTimer(); });
      if (aNext) aNext.addEventListener('click', () => { goAsideFact(aIdx + 1); syncAsideFactsTimer(); });
      aDots.forEach((d, i) => {
        d.addEventListener('click', () => { goAsideFact(i); syncAsideFactsTimer(); });
      });

      aSlides.forEach((slide) => {
        const moreBtn = slide.querySelector('.aside-fact-more-btn');
        if (!moreBtn) return;
        moreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const expanded = slide.classList.toggle('is-expanded');
          moreBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
          moreBtn.textContent = expanded ? 'عرض أقل' : 'اقرأ المزيد';
        });
      });

      if (aPause) {
        aPause.addEventListener('click', () => {
          aUserPaused = !aUserPaused;
          aPause.setAttribute('aria-pressed', aUserPaused ? 'true' : 'false');
          aPause.setAttribute('aria-label', aUserPaused ? 'تشغيل العرض التلقائي' : 'إيقاف العرض التلقائي مؤقتًا');
          aPause.innerHTML = aUserPaused
            ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6,4 20,12 6,20"/></svg>'
            : '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
          syncAsideFactsTimer();
        });
      }

      asideCard.addEventListener('mouseenter', () => { aHover = true; syncAsideFactsTimer(); });
      asideCard.addEventListener('mouseleave', () => { aHover = false; syncAsideFactsTimer(); });
      asideCard.addEventListener('focusin', () => { aFocused = true; syncAsideFactsTimer(); });
      asideCard.addEventListener('focusout', (e) => {
        if (!asideCard.contains(e.relatedTarget)) {
          aFocused = false;
          syncAsideFactsTimer();
        }
      });
      asideCard.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          goAsideFact(aIdx - 1);
          syncAsideFactsTimer();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goAsideFact(aIdx + 1);
          syncAsideFactsTimer();
        }
      });

      let pStartX = 0;
      let pStartY = 0;
      let pTracking = false;
      asideCard.addEventListener('pointerdown', (e) => {
        if (e.target.closest('button')) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        pStartX = e.clientX;
        pStartY = e.clientY;
        pTracking = true;
      });
      asideCard.addEventListener('pointerup', (e) => {
        if (!pTracking) return;
        pTracking = false;
        const dx = e.clientX - pStartX;
        const dy = e.clientY - pStartY;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
          goAsideFact(dx > 0 ? aIdx + 1 : aIdx - 1);
          syncAsideFactsTimer();
        }
      });
      asideCard.addEventListener('pointercancel', () => { pTracking = false; });

      const onAsideVis = () => { syncAsideFactsTimer(); };
      let asideResizeRaf = null;
      const onAsideResize = () => {
        if (asideResizeRaf === null) {
          asideResizeRaf = requestAnimationFrame(() => {
            asideResizeRaf = null;
            syncAsideClampToggles();
          });
        }
      };
      document.addEventListener('visibilitychange', onAsideVis);
      window.addEventListener('resize', onAsideResize, { passive: true });
      let clampInitRaf = requestAnimationFrame(() => {
        clampInitRaf = null;
        syncAsideClampToggles();
      });
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          if (asideCard.isConnected) requestAnimationFrame(syncAsideClampToggles);
        });
      }
      hydrateFactWindow(aIdx);
      syncAsideFactsTimer();
      registerCleanup(() => {
        clearInterval(aTimer);
        if (clampInitRaf !== null) cancelAnimationFrame(clampInitRaf);
        if (factImgRaf1 !== null) cancelAnimationFrame(factImgRaf1);
        if (factImgRaf2 !== null) cancelAnimationFrame(factImgRaf2);
        if (asideResizeRaf !== null) cancelAnimationFrame(asideResizeRaf);
        document.removeEventListener('visibilitychange', onAsideVis);
        window.removeEventListener('resize', onAsideResize);
      });
    }
  }
}
