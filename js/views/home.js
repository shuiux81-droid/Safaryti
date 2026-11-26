import { CONFIG } from '../config.js';
import { registerCleanup } from '../store.js';
import {
  esc,
  formatArabicDate,
  formatViews,
  isReducedMotion,
  isMobileViewport,
  diagArrowSvg,
  renderPictureHtml,
} from '../utils.js';
import { activateAdSlots } from '../components/adSlots.js';

const preloadedBelowFold =
  typeof window !== 'undefined' &&
  ((window.matchMedia && window.matchMedia('(min-width: 768px)').matches) ||
    !document.querySelector('#hero-band[data-ssr-hero="1"]'))
    ? import('./homeBelowFold.js')
    : null;

function hydrateHeroLazyMedia(root) {
  if (!root) return;
  root.querySelectorAll('source[data-lazy-srcset]').forEach((srcEl) => {
    const val = srcEl.getAttribute('data-lazy-srcset');
    if (val) srcEl.setAttribute('srcset', val);
    srcEl.removeAttribute('data-lazy-srcset');
  });
  root.querySelectorAll('img[data-lazy-src]').forEach((imgEl) => {
    const val = imgEl.getAttribute('data-lazy-src');
    if (val) imgEl.setAttribute('src', val);
    imgEl.removeAttribute('data-lazy-src');
  });
}

function initHeroAndTicker() {
  const hero = document.getElementById('hero-section');
  if (hero) {
    const slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    const dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    const pauseBtn = document.getElementById('hero-pause');
    let cur = 0;
    let userPaused = false;
    let hovered = false;
    let focused = false;
    let timer = null;
    let dotRaf1 = null;
    let dotRaf2 = null;
    let idleHydrateTimer = null;
    let idleCallbackId = null;
    let preheatTimer = null;
    let decodeSeq = 0;
    let destroyed = false;
    const decodedSlides = typeof WeakSet === 'function' ? new WeakSet() : null;

    function hydrateHeroSlide(slideEl) {
      if (!slideEl) return;
      hydrateHeroLazyMedia(slideEl);
    }

    function decodeSlide(slideEl) {
      if (!slideEl) return Promise.resolve();
      if (decodedSlides && decodedSlides.has(slideEl)) return Promise.resolve();
      hydrateHeroSlide(slideEl);
      const img = slideEl.querySelector('.hero-slide-media img');
      if (!img) {
        if (decodedSlides) decodedSlides.add(slideEl);
        return Promise.resolve();
      }
      const markDone = () => {
        if (decodedSlides) decodedSlides.add(slideEl);
      };
      if (img.complete) {
        if (img.naturalWidth > 0 && typeof img.decode === 'function') {
          return img.decode().catch(() => {}).then(markDone);
        }
        markDone();
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        const onDone = () => {
          img.removeEventListener('load', onDone);
          img.removeEventListener('error', onDone);
          if (img.naturalWidth > 0 && typeof img.decode === 'function') {
            img.decode().catch(() => {}).then(() => {
              markDone();
              resolve();
            });
          } else {
            markDone();
            resolve();
          }
        };
        img.addEventListener('load', onDone, { once: true });
        img.addEventListener('error', onDone, { once: true });
      });
    }

    function applySlideActivation(nextIdx) {
      if (destroyed) return;
      cur = nextIdx;
      slides.forEach((s, i) => {
        const active = i === cur;
        s.removeAttribute('data-hero-init');
        s.classList.toggle('is-active', active);
        s.classList.toggle('is-decoded', active);
        s.setAttribute('aria-hidden', active ? 'false' : 'true');
        if (active) s.removeAttribute('inert');
        else s.setAttribute('inert', '');
        const cta = s.querySelector('.hero-read-pill');
        if (cta) {
          if (active) cta.removeAttribute('tabindex');
          else cta.setAttribute('tabindex', '-1');
        }
      });
      if (dotRaf1 !== null) cancelAnimationFrame(dotRaf1);
      if (dotRaf2 !== null) cancelAnimationFrame(dotRaf2);
      dots.forEach((d) => {
        d.classList.remove('is-active');
      });
      const targetDot = dots[cur];
      if (targetDot) {
        dotRaf1 = requestAnimationFrame(() => {
          dotRaf1 = null;
          dotRaf2 = requestAnimationFrame(() => {
            dotRaf2 = null;
            targetDot.classList.add('is-active');
          });
        });
      }
      scheduleNextSlidePreheat();
    }

    function scheduleNextSlidePreheat() {
      clearTimeout(preheatTimer);
      if (!slides.length || slides.length < 2) return;
      const nextIdx = (cur + 1) % slides.length;
      const nextSlide = slides[nextIdx];
      if (!nextSlide || !nextSlide.querySelector('[data-lazy-src],[data-lazy-srcset]')) return;
      if (cur === 0 && isMobileViewport()) return;
      preheatTimer = setTimeout(() => {
        if (!destroyed) decodeSlide(nextSlide);
      }, 4200);
    }

    function hydrateAllHeroSlides() {
      slides.forEach(hydrateHeroSlide);
    }

    function goSlide(idx) {
      const nextIdx = (idx + slides.length) % slides.length;
      const seq = ++decodeSeq;
      const targetSlide = slides[nextIdx];
      decodeSlide(targetSlide).then(() => {
        if (destroyed || seq !== decodeSeq) return;
        applySlideActivation(nextIdx);
      });
    }

    function isPaused() {
      return isReducedMotion() || userPaused || hovered || focused || document.hidden;
    }
    function syncTimer() {
      clearInterval(timer);
      hero.classList.toggle('is-paused', isPaused());
      if (!isPaused()) {
        timer = setInterval(() => {
          goSlide(cur + 1);
        }, 6000);
      }
    }

    const s0Seq = decodeSeq;
    decodeSlide(slides[0]).then(() => {
      if (!destroyed && cur === 0 && decodeSeq === s0Seq && slides[0]) {
        slides[0].classList.add('is-decoded');
      }
    });

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        userPaused = !userPaused;
        pauseBtn.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
        pauseBtn.setAttribute('aria-label', userPaused ? 'تشغيل' : 'إيقاف مؤقت');
        pauseBtn.innerHTML = userPaused
          ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6,4 20,12 6,20"/></svg>'
          : '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
        syncTimer();
      });
    }
    const prevEl = document.getElementById('hero-prev');
    const nextEl = document.getElementById('hero-next');
    if (prevEl) prevEl.addEventListener('click', () => { goSlide(cur - 1); syncTimer(); });
    if (nextEl) nextEl.addEventListener('click', () => { goSlide(cur + 1); syncTimer(); });
    dots.forEach((d, i) => {
      d.addEventListener('click', () => {
        goSlide(i);
        syncTimer();
      });
    });

    hero.addEventListener('mouseenter', () => { hovered = true; hydrateAllHeroSlides(); syncTimer(); });
    hero.addEventListener('mouseleave', () => { hovered = false; syncTimer(); });
    hero.addEventListener('focusin', () => { focused = true; hydrateAllHeroSlides(); syncTimer(); });
    hero.addEventListener('focusout', () => { focused = false; syncTimer(); });
    hero.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        goSlide(cur - 1);
        syncTimer();
      } else if (e.key === 'ArrowLeft') {
        goSlide(cur + 1);
        syncTimer();
      }
    });
    let startX = 0;
    hero.addEventListener('pointerdown', (e) => {
      startX = e.clientX;
      hydrateHeroSlide(slides[(cur + 1) % slides.length]);
      hydrateHeroSlide(slides[(cur - 1 + slides.length) % slides.length]);
    });
    hero.addEventListener('pointerup', (e) => {
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 48) {
        goSlide(dx > 0 ? cur + 1 : cur - 1);
        syncTimer();
      }
    });
    const onVis = () => {
      syncTimer();
    };
    document.addEventListener('visibilitychange', onVis);
    syncTimer();

    let onWindowLoad = null;
    if (slides.length > 1 && hero.querySelector('[data-lazy-src],[data-lazy-srcset]')) {
      const scheduleSlide1AfterIdle = () => {
        if (destroyed) return;
        const loadSecondSlide = () => {
          if (destroyed) return;
          if (slides[1]) decodeSlide(slides[1]);
        };
        const queueIdle = () => {
          if (destroyed) return;
          if ('requestIdleCallback' in window) {
            idleCallbackId = window.requestIdleCallback(loadSecondSlide, { timeout: isMobileViewport() ? 1000 : 2000 });
          } else {
            idleHydrateTimer = setTimeout(loadSecondSlide, 400);
          }
        };
        if (isMobileViewport()) {
          idleHydrateTimer = setTimeout(queueIdle, 3200);
        } else {
          queueIdle();
        }
      };
      if (document.readyState === 'complete') {
        scheduleSlide1AfterIdle();
      } else {
        onWindowLoad = () => {
          window.removeEventListener('load', onWindowLoad);
          onWindowLoad = null;
          scheduleSlide1AfterIdle();
        };
        window.addEventListener('load', onWindowLoad, { once: true });
      }
    }
    registerCleanup(() => {
      destroyed = true;
      clearInterval(timer);
      clearTimeout(idleHydrateTimer);
      clearTimeout(preheatTimer);
      if (onWindowLoad) window.removeEventListener('load', onWindowLoad);
      if ('cancelIdleCallback' in window && idleCallbackId !== null) {
        try {
          window.cancelIdleCallback(idleCallbackId);
        } catch (_e) {}
      }
      if (dotRaf1 !== null) cancelAnimationFrame(dotRaf1);
      if (dotRaf2 !== null) cancelAnimationFrame(dotRaf2);
      document.removeEventListener('visibilitychange', onVis);
    });
  }

  const tickerItems = Array.prototype.slice.call(document.querySelectorAll('.ticker-item'));
  const tickerBox = document.querySelector('.hero-ticker');
  if (tickerItems.length > 1 && tickerBox && !isReducedMotion()) {
    let tIdx = 0;
    let tPaused = false;
    let tLeaveTimer = null;
    const tTimer = setInterval(() => {
      if (tPaused || document.hidden) return;
      const prev = tickerItems[tIdx];
      tIdx = (tIdx + 1) % tickerItems.length;
      const next = tickerItems[tIdx];
      prev.classList.remove('is-active');
      prev.classList.add('is-leaving');
      clearTimeout(tLeaveTimer);
      tLeaveTimer = setTimeout(() => {
        prev.classList.remove('is-leaving');
      }, 260);
      next.classList.add('is-active');
    }, 4000);
    tickerBox.addEventListener('mouseenter', () => { tPaused = true; });
    tickerBox.addEventListener('mouseleave', () => { tPaused = false; });
    tickerBox.addEventListener('focusin', () => { tPaused = true; });
    tickerBox.addEventListener('focusout', () => { tPaused = false; });
    registerCleanup(() => {
      clearInterval(tTimer);
      clearTimeout(tLeaveTimer);
    });
  }
}

const HOME_DAY_FMT = new Intl.DateTimeFormat('en-US', { day: 'numeric' });
const HOME_MY_FMT = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { month: 'long', year: 'numeric' });

export function renderHome(main, opts) {
  opts = opts || {};
  const isMobile = isMobileViewport();
  const sortedStories = CONFIG.stories.slice().sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
  const heroSlides = sortedStories.slice(0, 3);
  const tickerStories = sortedStories.slice(0, 5);
  const now = new Date();
  const dayNum = HOME_DAY_FMT.format(now);
  const monthYear = HOME_MY_FMT.format(now);

  const ssrHeroBand = main.querySelector('#hero-band[data-ssr-hero="1"]');
  const shouldChunkMobileInitial = Boolean(opts.isInitial && isMobile && ssrHeroBand);

  function renderHeroSlideHtml(s, i) {
    return (
      '<article class="hero-slide' +
      (i === 0 ? ' is-active' : '') +
      '" data-slide-idx="' +
      i +
      '" aria-hidden="' +
      (i === 0 ? 'false' : 'true') +
      '"' +
      (i === 0 ? '' : ' inert') +
      '>' +
      '<div class="hero-slide-media">' +
      renderPictureHtml(s.image, {
        alt: s.title,
        isHero: true,
        lazySrc: isMobile && i > 0,
        loading: i === 0 ? 'eager' : 'lazy',
        fetchpriority: i === 0 ? 'high' : '',
        decoding: 'async',
        referrerpolicy: 'no-referrer',
        sizes: '(min-width: 1024px) 755px, 100vw',
        onerror: "this.style.display='none'",
      }) +
      '</div>' +
      '<div class="hero-scrim" aria-hidden="true"></div>' +
      '<div class="hero-content">' +
      '<div class="hero-text-block">' +
      '<div class="hero-line-mask"><div class="hero-line-inner" style="--line-i:0"><span class="hero-tag">' +
      esc(s.category) +
      '</span></div></div>' +
      '<div class="hero-line-mask"><' +
      (i === 0 ? 'h1' : 'h2') +
      ' class="hero-title hero-line-inner no-auto-ads" style="--line-i:1">' +
      esc(s.title) +
      '</' +
      (i === 0 ? 'h1' : 'h2') +
      '></div>' +
      '<div class="hero-line-mask"><p class="hero-excerpt hero-line-inner" style="--line-i:2">' +
      esc(s.excerpt) +
      '</p></div>' +
      '<div class="hero-line-mask"><div class="hero-meta hero-line-inner" style="--line-i:3"><span>' +
      esc(formatArabicDate(s.date)) +
      '</span><span aria-hidden="true">·</span><span class="tabular">' +
      esc(formatViews(s.views)) +
      '</span></div></div>' +
      '</div>' +
      '<div class="hero-read-wrap">' +
      '<div class="hero-line-mask"><div class="hero-line-inner" style="--line-i:4"><a href="' +
      esc(s.href) +
      '" class="hero-read-pill"' +
      (i === 0 ? '' : ' tabindex="-1"') +
      '><span>اقرأ القصة</span><span class="cta-circle" aria-hidden="true">' +
      diagArrowSvg() +
      '</span></a></div></div>' +
      '</div>' +
      '</div>' +
      '</article>'
    );
  }

  function renderTickerItemHtml(s, i) {
    return (
      '<a href="' +
      esc(s.href) +
      '" class="ticker-item' +
      (i === 0 ? ' is-active' : '') +
      '" data-ticker-idx="' +
      i +
      '">' +
      esc(s.title) +
      '</a>'
    );
  }

  if (shouldChunkMobileInitial) {
    const ssrDayEl = document.getElementById('ssr-ticker-day');
    const ssrMyEl = document.getElementById('ssr-ticker-my');
    if (ssrDayEl) ssrDayEl.textContent = dayNum;
    if (ssrMyEl) ssrMyEl.textContent = monthYear;

    let cancelled = false;
    let started = false;
    let idleId = null;
    let fallbackTimer = null;
    let onWinLoad = null;
    let footerIo = null;
    const timers = [];

    const ssrHydrateTimer = setTimeout(() => {
      if (cancelled) return;
      const nsEl = main.querySelector('noscript');
      if (nsEl) nsEl.remove();
      const slidesEl = ssrHeroBand.querySelector('.hero-slides');
      if (slidesEl && heroSlides.length > 1) {
        slidesEl.insertAdjacentHTML(
          'beforeend',
          heroSlides.slice(1).map((s, idx) => renderHeroSlideHtml(s, idx + 1)).join('')
        );
      }
      const tickerTrack = ssrHeroBand.querySelector('.ticker-track');
      if (tickerTrack && tickerStories.length > 1) {
        tickerTrack.insertAdjacentHTML(
          'beforeend',
          tickerStories.slice(1).map((s, idx) => renderTickerItemHtml(s, idx + 1)).join('')
        );
      }
      activateAdSlots(ssrHeroBand);
      initHeroAndTicker();
    }, 0);
    timers.push(ssrHydrateTimer);

    const clearDeferredTriggers = () => {
      ['scroll', 'pointerdown', 'touchstart', 'keydown'].forEach((ev) => {
        window.removeEventListener(ev, startBelowFold, { capture: true });
      });
      if (onWinLoad) {
        window.removeEventListener('load', onWinLoad);
        onWinLoad = null;
      }
      if (footerIo) {
        footerIo.disconnect();
        footerIo = null;
      }
      if (fallbackTimer !== null) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
      if (idleId !== null && 'cancelIdleCallback' in window) {
        try {
          window.cancelIdleCallback(idleId);
        } catch (_e) {}
        idleId = null;
      }
    };

    const startBelowFold = () => {
      if (cancelled || started) return;
      started = true;
      clearDeferredTriggers();
      import('./homeBelowFold.js').then((bf) => {
        if (!cancelled) {
          bf.mountMobileChunkedBelowFold(main, ssrHeroBand, sortedStories, () => cancelled, (id) => timers.push(id));
        }
      });
    };

    if (window.scrollY > 5) {
      startBelowFold();
    } else {
      ['scroll', 'pointerdown', 'touchstart', 'keydown'].forEach((ev) => {
        window.addEventListener(ev, startBelowFold, { once: true, passive: true, capture: true });
      });
      const footerEl = document.getElementById('site-footer');
      if (footerEl && 'IntersectionObserver' in window) {
        footerIo = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
              startBelowFold();
            }
          },
          { rootMargin: '600px 0px' }
        );
        footerIo.observe(footerEl);
      }
      const queueIdleMount = () => {
        if (cancelled || started) return;
        if ('requestIdleCallback' in window) {
          idleId = window.requestIdleCallback(startBelowFold, { timeout: 1200 });
        } else {
          fallbackTimer = setTimeout(startBelowFold, 250);
        }
      };
      if (document.readyState === 'complete') {
        queueIdleMount();
      } else {
        onWinLoad = () => {
          onWinLoad = null;
          queueIdleMount();
        };
        window.addEventListener('load', onWinLoad, { once: true });
      }
    }

    registerCleanup(() => {
      cancelled = true;
      clearDeferredTriggers();
      timers.forEach((id) => clearTimeout(id));
    });
    return;
  }

  const belowModPromise = preloadedBelowFold || import('./homeBelowFold.js');
  return belowModPromise.then((bf) => {
    bf.renderFullHome(main, {
      ssrHeroBand,
      sortedStories,
      heroSlides,
      tickerStories,
      dayNum,
      monthYear,
      renderHeroSlideHtml,
      renderTickerItemHtml,
      initHeroAndTicker,
    });
  });
}
