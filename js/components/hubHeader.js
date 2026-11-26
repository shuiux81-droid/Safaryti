import { IMG } from '../config.js';
import { resolveHashedAssetPath } from '../assetMap.js';
import { esc, getResponsiveImageInfo } from '../utils.js';
import { renderInnerHeaderHtml } from './innerHeader.js';

const HUB_MOBILE_HERO = {
  [IMG.pillars]: './mobile/hub-culture-m.webp',
  [IMG.asia]: './src/assets/images/region_asia_landscape_1794996469512-800w.webp',
  [IMG.expand]: './src/assets/images/expand_horizon_road_1794996468234-800w.webp',
};

function renderHubHeroPictureHtml(bgSrc) {
  const info = getResponsiveImageInfo(bgSrc, { isHero: true });
  if (!info) return '';
  const mobRel = HUB_MOBILE_HERO[bgSrc];
  const mobSrcset = mobRel
    ? esc(resolveHashedAssetPath(mobRel)) + ' 800w'
    : info.mobileWebp
      ? esc(info.mobileWebp)
      : '';
  const mobSource = mobSrcset
    ? '<source media="(max-width: 767px)" type="image/webp" srcset="' + mobSrcset + '" sizes="100vw">'
    : '';
  return (
    '<picture>' +
    mobSource +
    '<source type="image/webp" srcset="' +
    esc(info.srcset) +
    '" sizes="100vw">' +
    '<img src="' +
    esc(info.webp) +
    '" alt="" class="inner-header-bg-img" width="' +
    esc(String(info.width)) +
    '" height="' +
    esc(String(info.height)) +
    '" loading="eager" decoding="async" fetchpriority="high">' +
    '</picture>'
  );
}

export function renderHubHeaderHtml(pageTitle, subText, bgImage) {
  const bg = bgImage || IMG.heroBackdrop;
  return renderInnerHeaderHtml({
    bgPictureHtml: renderHubHeroPictureHtml(bg),
    leftHtml:
      '<h1 class="t-h1 no-auto-ads" tabindex="-1">' +
      esc(pageTitle) +
      '</h1>' +
      '<nav class="breadcrumb" aria-label="مسار التنقل"><a href="#home">الرئيسية</a><span aria-hidden="true">›</span><span>' +
      esc(pageTitle) +
      '</span></nav>',
  });
}
