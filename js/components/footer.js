import { CONFIG } from '../config.js';
import { resolveHashedAssetPath } from '../assetMap.js';
import { esc, socialSvg, wireLogoFallback, isMobileViewport, getTabletMin768Query, isTabletOrLarger } from '../utils.js';
import { activateAdSlots } from './adSlots.js';

export function setupFooterAndRails(opts) {
  function hydrateFooter() {
    const fLogo = document.getElementById('footer-logo-img');
    if (fLogo && fLogo.tagName === 'IMG') {
      wireLogoFallback(fLogo, false);
    }

    const fEmail = document.getElementById('footer-email-link');
    if (fEmail) {
      fEmail.href = 'mailto:' + CONFIG.email;
      fEmail.textContent = CONFIG.email;
    }
    const fPhone = document.getElementById('footer-phone-link');
    const fPhoneText = document.getElementById('footer-phone-text');
    if (fPhone && fPhoneText) {
      fPhone.href = 'tel:' + CONFIG.phone;
      fPhoneText.textContent = CONFIG.phone;
    }
    const fBlurb = document.getElementById('footer-blurb');
    if (fBlurb) {
      fBlurb.textContent =
        'هنا ستبدأ مغامراتكم وتنتهي بذكريات لا تُنسى. نحن فريق من عشاق السفر والمغامرات، نهدف إلى تقديم محتوى ثري وملهم لكل من يسعى لاكتشاف جمال هذا العالم الواسع.';
    }
    const fYear = document.getElementById('footer-year');
    if (fYear) fYear.textContent = String(new Date().getFullYear());

    const fCats = document.getElementById('footer-cats');
    if (fCats) {
      const catOrder = ['africa', 'asia', 'europe', 'north-america', 'south-america', 'australia'];
      const orderedRegions = catOrder
        .map((slug) => CONFIG.regions.filter((r) => r.slug === slug)[0])
        .filter(Boolean);
      fCats.innerHTML = orderedRegions
        .map((r) => '<li><a href="#category/' + esc(r.slug) + '">' + esc(r.shortName || r.name) + '</a></li>')
        .join('');
    }

    const fShortcuts = document.getElementById('footer-shortcuts');
    if (fShortcuts) {
      const navByKey = Object.create(null);
      (CONFIG.nav || []).forEach((item) => {
        navByKey[item.key] = item;
      });
      const siteByKey = Object.create(null);
      (CONFIG.footerSiteLinks || []).forEach((item) => {
        siteByKey[item.key] = item;
      });
      const shortcutItems = [
        navByKey.home,
        siteByKey.about,
        navByKey.discover,
        navByKey.culture,
        navByKey.tips,
        navByKey['all-stories'],
        siteByKey.contact,
        siteByKey.privacy,
      ].filter(Boolean);
      fShortcuts.innerHTML = shortcutItems
        .map((item) => {
          const routeOverride = CONFIG.routes && CONFIG.routes[item.key];
          const href = routeOverride || item.href;
          return '<li><a href="' + esc(href) + '">' + esc(item.label) + '</a></li>';
        })
        .join('');
    }

    const socialsMeta = [
      { key: 'facebook', label: 'فيسبوك', href: CONFIG.social.facebook },
      { key: 'instagram', label: 'إنستجرام', href: CONFIG.social.instagram },
      { key: 'linkedin', label: 'لينكد ان', href: CONFIG.social.linkedin },
      { key: 'x', label: 'إكس (تويتر)', href: CONFIG.social.x },
    ];
    const fSocials = document.getElementById('footer-socials');
    if (fSocials) {
      fSocials.innerHTML = socialsMeta
        .map(
          (s) =>
            '<a href="' +
            esc(s.href) +
            '" target="_blank" rel="noopener" class="footer-social-btn" aria-label="' +
            esc(s.label) +
            '">' +
            socialSvg(s.key) +
            '</a>'
        )
        .join('');
    }
  }
  const footerEl = document.getElementById('site-footer');
  const isFooterInView =
    opts && typeof opts.isFooterInView === 'boolean'
      ? opts.isFooterInView
      : footerEl && footerEl.getBoundingClientRect().top < (window.innerHeight || 900) + 100;
  if (isFooterInView) {
    const fLogoEl = document.getElementById('footer-logo-img');
    const dbLogoEl = document.getElementById('db-logo-img');
    if (fLogoEl) fLogoEl.loading = 'eager';
    if (dbLogoEl) dbLogoEl.loading = 'eager';
  }
  if (isMobileViewport() && footerEl && !isFooterInView && 'IntersectionObserver' in window) {
    let footerHydrated = false;
    const fIo = new IntersectionObserver(
      (entries) => {
        if (!footerHydrated && entries.some((e) => e.isIntersecting)) {
          footerHydrated = true;
          fIo.disconnect();
          footerEl.classList.add('is-bg-ready');
          hydrateFooter();
        }
      },
      { rootMargin: '600px 0px' }
    );
    fIo.observe(footerEl);
  } else {
    if (footerEl) footerEl.classList.add('is-bg-ready');
    hydrateFooter();
  }

  // Side rails (AD-SKY-R, AD-SKY-L) — only visible at >= 768px
  const rRight = document.getElementById('rail-right-slot');
  const rLeft = document.getElementById('rail-left-slot');
  const adR = CONFIG.ads['AD-SKY-R'];
  const adL = CONFIG.ads['AD-SKY-L'];
  function mountRails() {
    if (rRight && adR && !rRight.dataset.railMounted) {
      rRight.dataset.railMounted = '1';
      rRight.innerHTML =
        '<span class="partner-caption">إعلان</span><div class="partner-frame is-rail"><a href="' +
        esc(adR.href) +
        '" rel="sponsored noopener" style="display:block;width:100%;height:100%;"><img src="' +
        esc(resolveHashedAssetPath(adR.src)) +
        '" alt="' +
        esc(adR.alt) +
        '" width="160" height="600"></a></div>';
    }
    if (rLeft && adL && !rLeft.dataset.railMounted) {
      rLeft.dataset.railMounted = '1';
      rLeft.innerHTML =
        '<span class="partner-caption">إعلان</span><div class="partner-frame is-rail"><a href="' +
        esc(adL.href) +
        '" rel="sponsored noopener" style="display:block;width:100%;height:100%;"><img src="' +
        esc(resolveHashedAssetPath(adL.src)) +
        '" alt="' +
        esc(adL.alt) +
        '" width="160" height="600"></a></div>';
    }
  }
  const mqRail = getTabletMin768Query();
  if (isTabletOrLarger()) {
    mountRails();
  } else if (mqRail) {
    const onRailMq = (e) => {
      if (e.matches) {
        mountRails();
        activateAdSlots(document);
        if (mqRail.removeEventListener) mqRail.removeEventListener('change', onRailMq);
      }
    };
    if (mqRail.addEventListener) mqRail.addEventListener('change', onRailMq);
  }

  // Floating callout (AD-STICKY)
  const spImg = document.getElementById('floating-callout-img');
  const spLink = document.getElementById('floating-callout-link');
  const adSticky = CONFIG.ads['AD-STICKY'];
  if (spImg && adSticky) {
    const nextStickySrc = resolveHashedAssetPath(adSticky.src);
    const curStickySrc = spImg.getAttribute('src') || '';
    const keepHashedStickyOnMobile =
      isMobileViewport() &&
      /digitalbond-card/i.test(curStickySrc) &&
      !/^(\.\/)?partners\//.test(curStickySrc);
    if (!keepHashedStickyOnMobile && curStickySrc !== nextStickySrc) {
      spImg.src = nextStickySrc;
    }
    if (spImg.alt !== adSticky.alt) {
      spImg.alt = adSticky.alt;
    }
  }
  if (spLink && adSticky) {
    const nextStickyHref = adSticky.href || '#contact';
    if (spLink.getAttribute('href') !== nextStickyHref) {
      spLink.href = nextStickyHref;
    }
  }

  const promoCloseBtn = document.getElementById('floating-callout-close');
  if (promoCloseBtn) {
    promoCloseBtn.addEventListener('click', () => {
      try {
        sessionStorage.setItem('safaryti_promo_closed', '1');
      } catch (_e) {}
      const fc = document.getElementById('floating-callout');
      if (fc) fc.classList.remove('is-visible');
    });
  }

  activateAdSlots(document);
}
