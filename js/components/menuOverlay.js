import { CONFIG } from '../config.js';
import { esc, isReducedMotion, socialSvg, isTabletOrLarger } from '../utils.js';
import { parseHash, syncNavAriaCurrent } from '../router.js';

let menuOverlayEl = null;
let openMenuBtnEl = null;
let closeMenuBtnEl = null;

let menuPopulated = false;

function ensureMenuPopulated() {
  if (menuPopulated) return;
  menuPopulated = true;
  const socialsMeta = [
    { key: 'facebook', label: 'فيسبوك', href: CONFIG.social.facebook },
    { key: 'instagram', label: 'إنستجرام', href: CONFIG.social.instagram },
    { key: 'linkedin', label: 'لينكد ان', href: CONFIG.social.linkedin },
    { key: 'x', label: 'إكس (تويتر)', href: CONFIG.social.x },
  ];
  const mSocials = document.getElementById('menu-socials');
  const navItems = Array.isArray(CONFIG.nav) ? CONFIG.nav : [];
  if (mSocials) {
    mSocials.style.setProperty('--i', String(navItems.length));
    mSocials.innerHTML = socialsMeta
      .map(
        (s) =>
          '<a href="' +
          esc(s.href) +
          '" target="_blank" rel="noopener" class="menu-social-btn" aria-label="' +
          esc(s.label) +
          '">' +
          socialSvg(s.key) +
          '</a>'
      )
      .join('');
  }

  const mList = document.getElementById('menu-nav-list');
  if (mList) {
    mList.innerHTML = navItems
      .map((item, idx) => {
        const routeOverride = CONFIG.routes && CONFIG.routes[item.key];
        const href = routeOverride || item.href;
        const children = Array.isArray(item.children) ? item.children : [];
        if (children.length > 0) {
          const panelId = item.menuPanelId || 'menu-acc-' + item.key;
          const subLinks = children
            .map((child) => '<a href="' + esc(child.href) + '" class="menu-sub-link"><span>' + esc(child.label) + '</span></a>')
            .join('');
          return (
            '<li class="menu-stagger" style="--i:' +
            idx +
            '">' +
            '<div class="menu-acc-row">' +
            '<a href="' +
            esc(href) +
            '" class="menu-overlay-link menu-acc-link" data-nav="' +
            esc(item.key) +
            '">' +
            esc(item.label) +
            '</a>' +
            '<button type="button" class="menu-acc-toggle" aria-label="عرض القائمة — ' +
            esc(item.label) +
            '" aria-expanded="false" aria-controls="' +
            esc(panelId) +
            '"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>' +
            '</div>' +
            '<div id="' +
            esc(panelId) +
            '" class="menu-acc-panel"><div class="menu-acc-inner">' +
            subLinks +
            '</div></div>' +
            '</li>'
          );
        }
        return (
          '<li class="menu-stagger" style="--i:' +
          idx +
          '"><a href="' +
          esc(href) +
          '" class="menu-overlay-link" data-nav="' +
          esc(item.key) +
          '">' +
          esc(item.label) +
          '</a></li>'
        );
      })
      .join('');
    syncNavAriaCurrent(parseHash());
  }
}

export function openMenu() {
  if (!menuOverlayEl || !openMenuBtnEl) return;
  ensureMenuPopulated();
  const r = openMenuBtnEl.getBoundingClientRect();
  menuOverlayEl.style.setProperty('--x', r.left + r.width / 2 + 'px');
  menuOverlayEl.style.setProperty('--y', r.top + r.height / 2 + 'px');
  menuOverlayEl.removeAttribute('inert');
  menuOverlayEl.hidden = false;
  requestAnimationFrame(() => {
    menuOverlayEl.classList.add('is-open');
  });
  openMenuBtnEl.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    if (closeMenuBtnEl) closeMenuBtnEl.focus();
  }, 50);
}

export function closeMenu(returnFocus) {
  if (!menuOverlayEl) return;
  menuOverlayEl.classList.remove('is-open');
  menuOverlayEl.setAttribute('inert', '');
  if (openMenuBtnEl) openMenuBtnEl.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  setTimeout(
    () => {
      if (menuOverlayEl && !menuOverlayEl.classList.contains('is-open')) menuOverlayEl.hidden = true;
    },
    isReducedMotion() ? 160 : 460
  );
  if (returnFocus && openMenuBtnEl) openMenuBtnEl.focus();
}

export function isMenuOpen() {
  return Boolean(menuOverlayEl && menuOverlayEl.classList.contains('is-open'));
}

export function setupMenuOverlay() {
  menuOverlayEl = document.getElementById('menu-overlay');
  openMenuBtnEl = document.getElementById('open-menu-btn');
  closeMenuBtnEl = document.getElementById('close-menu-btn');

  if (isTabletOrLarger()) {
    ensureMenuPopulated();
  }

  if (openMenuBtnEl) openMenuBtnEl.addEventListener('click', openMenu);
  if (closeMenuBtnEl) closeMenuBtnEl.addEventListener('click', () => { closeMenu(true); });
  if (menuOverlayEl) {
    menuOverlayEl.addEventListener('click', (e) => {
      const accToggle = e.target.closest('.menu-acc-toggle');
      if (accToggle) {
        const row = accToggle.closest('.menu-acc-row');
        const panel = row ? row.nextElementSibling : null;
        if (panel) {
          const isOpen = panel.classList.toggle('is-open');
          accToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }
        return;
      }
      if (e.target.closest('a')) {
        closeMenu(true);
      }
    });
    menuOverlayEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMenu(true);
        return;
      }
      if (e.key === 'Tab') {
        const focusables = Array.prototype.slice
          .call(menuOverlayEl.querySelectorAll('a,button,input'))
          .filter((el) => !el.hidden && el.offsetParent !== null);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  const menuSearchForm = document.getElementById('menu-search-form');
  if (menuSearchForm) {
    menuSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const inp = document.getElementById('menu-search-input');
      const q = inp ? inp.value.trim() : '';
      closeMenu(false);
      window.location.hash = q ? '#search/' + encodeURIComponent(q) : '#search';
    });
  }
}
