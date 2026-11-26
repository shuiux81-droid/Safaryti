import { registerCleanup } from '../store.js';
import { esc, isReducedMotion } from '../utils.js';

export function renderArticleTocNavHtml(tocItems, options) {
  const showTrack = !options || options.showTrack !== false;
  const listItemsHtml = tocItems
    .map((item) => {
      return (
        '<li class="article-toc-item">' +
        '<a href="#" data-target="' +
        esc(item.id) +
        '" class="article-toc-link" data-toc-level="2">' +
        '<span class="article-toc-idx tabular">' +
        esc(item.indexLabel) +
        '</span>' +
        '<span class="article-toc-label">' +
        esc(item.title) +
        '</span>' +
        '</a>' +
        '</li>'
      );
    })
    .join('');

  const trackHtml = showTrack
    ? '<div class="article-toc-track" aria-hidden="true">' +
      '<span class="article-toc-track-fill"></span>' +
      '<span class="article-toc-marker"></span>' +
      '</div>'
    : '';

  return (
    '<nav class="article-toc-nav" aria-label="محتويات المقال">' +
    trackHtml +
    '<ol class="article-toc-ol">' +
    listItemsHtml +
    '</ol>' +
    '</nav>'
  );
}

export function initArticleToc(main) {
  const tocNavs = Array.prototype.slice.call(main.querySelectorAll('.article-toc-nav'));
  const tocLinks = Array.prototype.slice.call(main.querySelectorAll('.article-toc-link[data-target]'));
  const asideTocScroll = document.getElementById('article-toc-scroll');
  const mobileTocDetails = document.getElementById('article-toc-mobile');
  let activeHeadingId = null;

  function syncAsideTocMaxHeight() {
    if (!asideTocScroll) return;
    const items = asideTocScroll.querySelectorAll('.article-toc-item');
    if (items.length > 4) {
      const fourth = items[3];
      const h4 = Math.ceil(fourth.offsetTop + fourth.offsetHeight);
      if (h4 > 0) {
        asideTocScroll.style.maxHeight = h4 + 'px';
      }
    } else {
      asideTocScroll.style.maxHeight = '';
    }
  }

  function positionTocMarkers(id, scrollIntoAside) {
    const updates = [];
    tocNavs.forEach((nav) => {
      const marker = nav.querySelector('.article-toc-marker');
      if (!marker) return;
      let activeLink = null;
      const linksInNav = nav.querySelectorAll('.article-toc-link[data-target]');
      for (let i = 0; i < linksInNav.length; i++) {
        if (linksInNav[i].getAttribute('data-target') === id) {
          activeLink = linksInNav[i];
          break;
        }
      }
      if (!activeLink) return;
      const navRect = nav.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      if (navRect.height <= 0 || linkRect.height <= 0) return;
      const markerH = marker.offsetHeight || 24;
      const offsetY = linkRect.top - navRect.top + Math.max(0, (linkRect.height - markerH) / 2);

      let scrollTopTarget = null;
      if (
        scrollIntoAside &&
        asideTocScroll &&
        asideTocScroll.contains(activeLink) &&
        asideTocScroll.scrollHeight > asideTocScroll.clientHeight + 2
      ) {
        const boxRect = asideTocScroll.getBoundingClientRect();
        if (linkRect.top < boxRect.top + 8 || linkRect.bottom > boxRect.bottom - 8) {
          scrollTopTarget = Math.max(
            0,
            asideTocScroll.scrollTop + (linkRect.top - boxRect.top) - asideTocScroll.clientHeight / 2 + linkRect.height / 2
          );
        }
      }
      updates.push({ marker, offsetY, scrollTopTarget });
    });

    updates.forEach((u) => {
      u.marker.style.transform = 'translateY(' + u.offsetY.toFixed(1) + 'px)';
      u.marker.classList.add('is-ready');
      if (u.scrollTopTarget !== null && asideTocScroll) {
        asideTocScroll.scrollTo({
          top: u.scrollTopTarget,
          behavior: isReducedMotion() ? 'auto' : 'smooth',
        });
      }
    });
  }

  function setActiveTocHeading(id, scrollIntoAside) {
    if (!id) return;
    activeHeadingId = id;
    tocLinks.forEach((l) => {
      const isMatch = l.getAttribute('data-target') === id;
      l.classList.toggle('is-active', isMatch);
      if (isMatch) {
        l.setAttribute('aria-current', 'location');
      } else {
        l.removeAttribute('aria-current');
      }
    });
    positionTocMarkers(id, scrollIntoAside);
  }

  tocLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.getAttribute('data-target');
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      setActiveTocHeading(id, true);
      if (mobileTocDetails && mobileTocDetails.contains(link)) {
        mobileTocDetails.open = false;
      }
      const reduced = isReducedMotion();
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      if (typeof target.focus === 'function') {
        try {
          target.focus({ preventScroll: true });
        } catch (_err) {
          target.focus();
        }
      }
    });
  });

  if (mobileTocDetails) {
    const onMobileTocToggle = () => {
      if (mobileTocDetails.open && activeHeadingId) {
        positionTocMarkers(activeHeadingId, false);
      }
    };
    mobileTocDetails.addEventListener('toggle', onMobileTocToggle);
    registerCleanup(() => {
      mobileTocDetails.removeEventListener('toggle', onMobileTocToggle);
    });
  }

  const uniqueIds = [];
  const seenIds = {};
  tocLinks.forEach((l) => {
    const tid = l.getAttribute('data-target');
    if (tid && !seenIds[tid]) {
      seenIds[tid] = true;
      uniqueIds.push(tid);
    }
  });
  const headings = uniqueIds.map((id) => document.getElementById(id)).filter(Boolean);

  if (headings.length) {
    syncAsideTocMaxHeight();
    setActiveTocHeading(headings[0].id, false);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        syncAsideTocMaxHeight();
        if (activeHeadingId) positionTocMarkers(activeHeadingId, false);
      });
    }

    if ('IntersectionObserver' in window) {
      const spyIo = new IntersectionObserver(
        (entries) => {
          const visible = entries.filter((en) => en.isIntersecting);
          if (visible.length) {
            visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
            setActiveTocHeading(visible[0].target.id, true);
          }
        },
        { rootMargin: '-20% 0px -70% 0px' }
      );
      headings.forEach((h) => {
        spyIo.observe(h);
      });
      registerCleanup(() => {
        spyIo.disconnect();
      });
    }

    let tocResizeRaf = null;
    const onTocResize = () => {
      if (tocResizeRaf === null) {
        tocResizeRaf = requestAnimationFrame(() => {
          tocResizeRaf = null;
          syncAsideTocMaxHeight();
          if (activeHeadingId) positionTocMarkers(activeHeadingId, false);
        });
      }
    };
    window.addEventListener('resize', onTocResize, { passive: true });
    registerCleanup(() => {
      if (tocResizeRaf !== null) cancelAnimationFrame(tocResizeRaf);
      window.removeEventListener('resize', onTocResize);
    });
  }
}
