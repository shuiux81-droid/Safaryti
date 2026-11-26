import { CONFIG } from '../config.js';
import { esc, wireLogoFallback, getDesktopMin1024Query, isDesktopViewport } from '../utils.js';
import { parseHash, syncNavAriaCurrent } from '../router.js';

const dropdownControllers = [];

export function closeAllDropdowns(exceptItem) {
  dropdownControllers.forEach((ctrl) => {
    if (!exceptItem || ctrl.item !== exceptItem) ctrl.setOpen(false);
  });
}

function buildDesktopNavFromConfig(navEl) {
  const navItems = Array.isArray(CONFIG.nav) ? CONFIG.nav : [];
  if (!navEl || !navItems.length) return;
  const chevronSvg =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

  navEl.innerHTML = navItems
    .map((item) => {
      const routeOverride = CONFIG.routes && CONFIG.routes[item.key];
      const href = routeOverride || item.href;
      const children = Array.isArray(item.children) ? item.children : [];
      if (children.length > 0 && item.dropdownId) {
        const gridCls = children.length <= 2 ? 'dropdown-grid is-single' : 'dropdown-grid';
        const links = children
          .map((child) => '<a href="' + esc(child.href) + '" class="dropdown-link"><span>' + esc(child.label) + '</span></a>')
          .join('');
        return (
          '<div class="nav-item has-dropdown" data-dropdown>' +
          '<a href="' +
          esc(href) +
          '" class="nav-link" data-nav="' +
          esc(item.key) +
          '">' +
          esc(item.label) +
          '</a>' +
          '<button type="button" class="nav-chevron" aria-label="عرض القائمة — ' +
          esc(item.label) +
          '" aria-expanded="false" aria-haspopup="true" aria-controls="' +
          esc(item.dropdownId) +
          '">' +
          chevronSvg +
          '</button>' +
          '<div id="' +
          esc(item.dropdownId) +
          '" class="nav-dropdown" role="region" aria-label="' +
          esc(item.dropdownLabel || item.label) +
          '" inert>' +
          '<div class="' +
          gridCls +
          '">' +
          links +
          '</div>' +
          '</div>' +
          '</div>'
        );
      }
      return (
        '<div class="nav-item">' +
        '<a href="' +
        esc(href) +
        '" class="nav-link" data-nav="' +
        esc(item.key) +
        '">' +
        esc(item.label) +
        '</a>' +
        '</div>'
      );
    })
    .join('');

  syncNavAriaCurrent(parseHash());
}

export function setupHeader() {
  const logoImg = document.getElementById('header-logo-img');
  if (logoImg && logoImg.tagName === 'IMG') {
    wireLogoFallback(logoImg, false);
  }

  const hCta = document.getElementById('header-cta-pill');
  if (hCta) {
    if (hCta.getAttribute('href') !== '#contact') hCta.href = '#contact';
    if (hCta.hasAttribute('target')) hCta.removeAttribute('target');
    if (hCta.hasAttribute('rel')) hCta.removeAttribute('rel');
  }

  const navEl = document.querySelector('#site-header .header-nav-pill');
  buildDesktopNavFromConfig(navEl);

  // Dropdown wiring (desktop nav is hidden < 1024px)
  let dropdownsMounted = false;
  function mountDesktopDropdowns() {
    if (dropdownsMounted) return;
    dropdownsMounted = true;
    dropdownControllers.length = 0;

    // Dropdown hover / keyboard / click wiring
    const hoverCapableMq = window.matchMedia ? window.matchMedia('(hover: hover)') : null;
    document.querySelectorAll('[data-dropdown]').forEach((item) => {
      const parentLink = item.querySelector('.nav-link');
      const chev = item.querySelector('.nav-chevron');
      const ddPanel = item.querySelector('.nav-dropdown');
      let openT = null;
      let closeT = null;
      let pointerInteracting = false;
      let pointerResetT = null;
      let suppressFocusOpen = false;

      if (ddPanel) ddPanel.setAttribute('inert', '');

      function clampDropdownToViewport() {
        if (!ddPanel) return;
        ddPanel.style.transform = '';
        const rect = ddPanel.getBoundingClientRect();
        const pad = 8;
        let shiftX = 0;
        if (rect.left < pad) {
          shiftX = pad - rect.left;
        } else if (rect.right > window.innerWidth - pad) {
          shiftX = window.innerWidth - pad - rect.right;
        }
        if (shiftX !== 0) {
          ddPanel.style.transform = 'translateX(' + Math.round(shiftX) + 'px)';
        }
      }

      function setOpen(v) {
        if (v) closeAllDropdowns(item);
        item.classList.toggle('is-open', v);
        if (chev) chev.setAttribute('aria-expanded', v ? 'true' : 'false');
        if (ddPanel) {
          if (v) {
            ddPanel.removeAttribute('inert');
            clampDropdownToViewport();
          } else {
            ddPanel.setAttribute('inert', '');
            ddPanel.style.transform = '';
          }
        }
      }

      dropdownControllers.push({ item, setOpen });

      item.addEventListener('pointerdown', () => {
        pointerInteracting = true;
        clearTimeout(pointerResetT);
        pointerResetT = setTimeout(() => {
          pointerInteracting = false;
        }, 400);
      });
      item.addEventListener('mouseenter', () => {
        if (hoverCapableMq && !hoverCapableMq.matches) return;
        clearTimeout(closeT);
        clearTimeout(openT);
        openT = setTimeout(() => {
          setOpen(true);
        }, 120);
      });
      item.addEventListener('mouseleave', () => {
        if (hoverCapableMq && !hoverCapableMq.matches) return;
        clearTimeout(openT);
        clearTimeout(closeT);
        closeT = setTimeout(() => {
          setOpen(false);
        }, 200);
      });
      item.addEventListener('focusin', () => {
        if (suppressFocusOpen || pointerInteracting) return;
        clearTimeout(closeT);
        setOpen(true);
      });
      item.addEventListener('focusout', (e) => {
        if (!item.contains(e.relatedTarget)) {
          clearTimeout(openT);
          setOpen(false);
        }
      });
      if (parentLink) {
        parentLink.addEventListener('click', () => {
          clearTimeout(openT);
          clearTimeout(closeT);
          closeAllDropdowns();
        });
      }
      if (chev) {
        chev.addEventListener('click', () => {
          clearTimeout(openT);
          clearTimeout(closeT);
          setOpen(!item.classList.contains('is-open'));
        });
      }
      if (ddPanel) {
        ddPanel.addEventListener('click', (e) => {
          if (e.target.closest('a')) {
            clearTimeout(openT);
            clearTimeout(closeT);
            closeAllDropdowns();
          }
        });
      }
      item.addEventListener('keydown', (e) => {
        const childLinks = ddPanel ? Array.prototype.slice.call(ddPanel.querySelectorAll('.dropdown-link')) : [];
        if (e.key === 'Escape') {
          clearTimeout(openT);
          clearTimeout(closeT);
          suppressFocusOpen = true;
          setOpen(false);
          if (chev) chev.focus();
          setTimeout(() => {
            suppressFocusOpen = false;
          }, 0);
          return;
        }
        if (!childLinks.length) return;
        const activeIdx = childLinks.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          clearTimeout(openT);
          clearTimeout(closeT);
          if (!item.classList.contains('is-open')) {
            setOpen(true);
          }
          const nextIdx = activeIdx === -1 ? 0 : (activeIdx + 1) % childLinks.length;
          childLinks[nextIdx].focus();
        } else if (e.key === 'ArrowUp') {
          if (!item.classList.contains('is-open') && activeIdx === -1) return;
          e.preventDefault();
          const prevIdx = activeIdx <= 0 ? childLinks.length - 1 : activeIdx - 1;
          childLinks[prevIdx].focus();
        } else if (e.key === 'Home' && activeIdx !== -1) {
          e.preventDefault();
          childLinks[0].focus();
        } else if (e.key === 'End' && activeIdx !== -1) {
          e.preventDefault();
          childLinks[childLinks.length - 1].focus();
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('[data-dropdown]')) {
        closeAllDropdowns();
      }
    });
  }

  const mqDesktop = getDesktopMin1024Query();
  if (isDesktopViewport()) {
    mountDesktopDropdowns();
  } else if (mqDesktop && mqDesktop.addEventListener) {
    const onDesktopMq = (e) => {
      if (e.matches) {
        mountDesktopDropdowns();
        if (mqDesktop.removeEventListener) mqDesktop.removeEventListener('change', onDesktopMq);
      }
    };
    mqDesktop.addEventListener('change', onDesktopMq);
  }
}
