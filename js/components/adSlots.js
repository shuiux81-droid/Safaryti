import { CONFIG } from '../config.js';
import { esc, renderPictureHtml, isDesktopViewport, isSmallPhoneViewport } from '../utils.js';

let adSenseScriptRequested = false;

export function ensureAdSenseScript() {
  const client = CONFIG.ads.adsenseClient;
  if (!client || adSenseScriptRequested) return;
  adSenseScriptRequested = true;
  function inject() {
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(client);
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject, { once: true });
  } else {
    inject();
  }
}

export function getAdFrameSpec(slotId, isMobileInline) {
  const isDesk = isDesktopViewport();
  const isSmall = isSmallPhoneViewport();
  if (slotId === 'AD-H1') return { cls: 'is-h1', w: 300, h: 150 };
  if (slotId === 'AD-H2') return { cls: 'is-h2', w: 300, h: 250 };
  if (slotId === 'AD-H3') return { cls: 'is-h3', w: 728, h: 90 };
  if (slotId === 'AD-SB-HALF') {
    return isMobileInline ? { cls: 'is-sb-half-mobile', w: 300, h: 250 } : { cls: 'is-sb-half-desktop', w: 300, h: 600 };
  }
  if (slotId === 'AD-TB') return isDesk ? { cls: 'is-tb', w: 728, h: 90 } : { cls: 'is-tb', w: 320, h: 100 };
  if (slotId === 'AD-BB') {
    return isDesk
      ? { cls: 'is-bb', w: 970, h: 250 }
      : !isSmall
        ? { cls: 'is-bb', w: 728, h: 90 }
        : { cls: 'is-bb', w: 336, h: 280 };
  }
  if (slotId === 'AD-SB1') return { cls: 'is-sb1', w: 300, h: 250 };
  if (slotId === 'AD-A1') return { cls: 'is-a1', w: 336, h: 280 };
  if (slotId === 'AD-A2') return { cls: 'is-a2', w: 590, h: 120 };
  if (slotId === 'AD-SKY-L' || slotId === 'AD-SKY-R') return { cls: 'is-rail', w: 160, h: 600 };
  if (slotId === 'AD-STICKY') return { cls: 'is-sticky', w: 250, h: 208 };
  return isSmall ? { cls: '', w: 300, h: 250 } : { cls: '', w: 336, h: 280 };
}

export function renderAdSlotHtml(slotId, opts) {
  opts = opts || {};
  const ad = CONFIG.ads[slotId] || { type: 'direct', src: './partners/fourseasons-card.svg', href: '#contact', alt: 'مساحة إعلانية', slot: '' };
  const isRail = opts.isRail === true;
  const isMobileInline = opts.isMobileInline === true;
  const spec = getAdFrameSpec(slotId, isMobileInline);
  const wrapCls = (isRail ? 'side-rail-slot' : 'partner-slot-wrap') + (opts.wrapCls ? ' ' + opts.wrapCls : '');
  const frameCls = 'partner-frame' + (spec.cls ? ' ' + spec.cls : '');
  const immediate = opts.immediate || slotId === 'AD-TB' || slotId === 'AD-H1' || slotId === 'AD-H2' || slotId === 'AD-H3';
  const href = ad.href || '#contact';
  const isExternal = /^https?:\/\//i.test(href);
  const targetAttr = isExternal ? ' target="_blank"' : '';
  let innerHtml = '';
  if (ad.type === 'direct' && ad.src) {
    innerHtml =
      '<a href="' +
      esc(href) +
      '" rel="sponsored noopener"' +
      targetAttr +
      ' style="display:block;width:100%;height:100%;">' +
      renderPictureHtml(ad.src, {
        alt: ad.alt || 'إعلان',
        width: spec.w,
        height: spec.h,
        loading: immediate ? '' : 'lazy',
        decoding: 'async',
      }) +
      '</a>';
  } else {
    innerHtml = '<div class="partner-placeholder"><p class="partner-placeholder-title">مساحة إعلانية</p><a href="#contact" class="partner-placeholder-link">أعلن معنا</a></div>';
  }
  return (
    '<div class="' +
    wrapCls +
    '" data-partner-slot="' +
    esc(slotId) +
    '"' +
    (immediate ? ' data-partner-eager="1"' : '') +
    '>' +
    '<span class="partner-caption">إعلان</span>' +
    '<div class="' +
    frameCls +
    '">' +
    innerHtml +
    '</div>' +
    '</div>'
  );
}

export function activateAdSlots(root) {
  ensureAdSenseScript();
  const slots = (root || document).querySelectorAll('[data-partner-slot]');

  slots.forEach((slot) => {
    if (slot.dataset.partnerReady === '1') return;
    slot.dataset.partnerReady = '1';
    const slotId = slot.getAttribute('data-partner-slot');
    const ad = CONFIG.ads[slotId] || {};
    const frame = slot.querySelector('.partner-frame');
    if (!frame) return;
    const img = frame.querySelector('img');

    function markFilled() {
      slot.setAttribute('data-filled', 'true');
      if (img) img.style.display = '';
      const existingFb = frame.querySelector('.partner-placeholder');
      if (existingFb) existingFb.remove();
    }

    function showFallback() {
      if (slot.getAttribute('data-filled') === 'true') return;
      if (frame.querySelector('.partner-placeholder')) return;
      const fb = document.createElement('div');
      fb.className = 'partner-placeholder';
      fb.innerHTML = '<p class="partner-placeholder-title">مساحة إعلانية</p><a href="#contact" class="partner-placeholder-link">أعلن معنا</a>';
      frame.appendChild(fb);
    }

    if (ad.type === 'direct' && img && img.getAttribute('src')) {
      if (img.complete && img.naturalWidth > 0) {
        markFilled();
      } else {
        img.addEventListener('load', () => {
          if (img.naturalWidth > 0) markFilled();
        });
        img.addEventListener('error', () => {
          img.style.display = 'none';
          showFallback();
        });
      }
    } else {
      showFallback();
    }
  });
}
