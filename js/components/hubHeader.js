import { IMG } from '../config.js';
import { resolveHashedAssetPath } from '../assetMap.js';
import { esc, getResponsiveImageInfo } from '../utils.js';

const HUB_MOBILE_HERO = {
  [IMG.pillars]: { path: './mobile/hub-culture-m.webp', w: 640, h: 857 },
  [IMG.asia]: { path: './src/assets/images/region_asia_landscape_1794996469512-800w.webp', w: 800, h: 446 },
  [IMG.expand]: { path: './src/assets/images/expand_horizon_road_1794996468234-800w.webp', w: 800, h: 446 },
};

function renderHubHeroPictureHtml(bgSrc) {
  const info = getResponsiveImageInfo(bgSrc, { isHero: true });
  if (!info) return '';
  const mobEntry = HUB_MOBILE_HERO[bgSrc];
  const mobUrl = mobEntry ? resolveHashedAssetPath(mobEntry.path) : '';
  const mobSrcset = mobUrl
    ? esc(mobUrl) + ' ' + mobEntry.w + 'w'
    : info.mobileWebp
      ? esc(info.mobileWebp)
      : '';
  const mobSource = mobSrcset
    ? '<source media="(max-width: 767px)" type="image/webp" srcset="' + mobSrcset + '" sizes="100vw">'
    : '';
  const fallbackSrc = mobUrl || (info.mobileWebp ? info.mobileWebp.split(',').pop().trim().split(/\s+/)[0] : '') || info.webp;
  const wAttr = mobEntry ? mobEntry.w : info.width;
  const hAttr = mobEntry ? mobEntry.h : info.height;
  return (
    '<picture>' +
    mobSource +
    '<source media="(min-width: 768px)" type="image/webp" srcset="' +
    esc(info.srcset) +
    '" sizes="100vw">' +
    '<img src="' +
    esc(fallbackSrc) +
    '" alt="" class="inner-header-bg-img" width="' +
    esc(String(wAttr)) +
    '" height="' +
    esc(String(hAttr)) +
    '" loading="eager" decoding="async" fetchpriority="high">' +
    '</picture>'
  );
}

export function renderHubHeaderHtml(pageTitle, subText, bgImage) {
  const bg = bgImage || IMG.heroBackdrop;
  return (
    '<section class="inner-header no-auto-ads is-img-hero">' +
    renderHubHeroPictureHtml(bg) +
    '<div class="container inner-header-grid">' +
    '<div class="inner-header-main">' +
    '<h1 class="t-h1 no-auto-ads" tabindex="-1">' +
    esc(pageTitle) +
    '</h1>' +
    '<nav class="breadcrumb" aria-label="مسار التنقل"><a href="#home">الرئيسية</a><span aria-hidden="true">›</span><span>' +
    esc(pageTitle) +
    '</span></nav>' +
    '</div>' +
    '<div class="partner-slot-wrap is-tb" data-partner-slot="AD-TB" data-partner-eager="1" data-hub-deferred-tb="1">' +
    '<span class="partner-caption">إعلان</span>' +
    '<div class="partner-frame is-tb"></div>' +
    '</div>' +
    '</div>' +
    '</section>'
  );
}
