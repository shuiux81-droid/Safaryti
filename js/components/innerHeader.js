import '../../css/routes/inner-shared.css';
import { resolveHashedAssetPath } from '../assetMap.js';
import { esc, getResponsiveImageInfo } from '../utils.js';
import { toBgImageSetCss } from '../utils/viewHelpers.js';
import { renderAdSlotHtml } from './adSlots.js';

function renderOptInHeroPicture(opts) {
  const info = getResponsiveImageInfo(opts.bgImage, { isHero: true });
  if (!info) return '';
  const mobUrl = opts.mobileSrc
    ? resolveHashedAssetPath(opts.mobileSrc)
    : info.mobileWebp
      ? info.mobileWebp.split(',').pop().trim().split(/\s+/)[0]
      : '';
  const mobW = opts.mobileWidth || 800;
  const mobH = opts.mobileHeight || info.height;
  const mobSrcset = opts.mobileSrc ? esc(mobUrl) + ' ' + mobW + 'w' : info.mobileWebp ? esc(info.mobileWebp) : '';
  const mobSource = mobSrcset
    ? '<source media="(max-width: 767px)" type="image/webp" srcset="' + mobSrcset + '" sizes="100vw">'
    : '';
  const deskSource =
    '<source media="(min-width: 768px)" type="image/webp" srcset="' + esc(info.srcset) + '" sizes="100vw">';
  const fallbackSrc = mobUrl || info.webp;
  return (
    '<picture>' +
    mobSource +
    deskSource +
    '<img src="' +
    esc(fallbackSrc) +
    '" alt="" class="inner-header-bg-img" width="' +
    esc(String(mobUrl ? mobW : info.width)) +
    '" height="' +
    esc(String(mobUrl ? mobH : info.height)) +
    '" fetchpriority="high" loading="eager" decoding="async">' +
    '</picture>'
  );
}

export function renderInnerHeaderHtml(opts) {
  const bgPictureHtml = opts.bgPictureHtml || (opts.heroAsImg && opts.bgImage ? renderOptInHeroPicture(opts) : '');
  const hasPic = Boolean(bgPictureHtml);
  const bgStyle = !hasPic && opts.bgImage ? ' style="background-image:' + toBgImageSetCss(opts.bgImage) + '"' : '';
  return (
    '<section class="inner-header no-auto-ads' +
    (hasPic ? ' is-img-hero' : '') +
    '"' +
    bgStyle +
    '>' +
    (hasPic ? bgPictureHtml : '') +
    '<div class="container inner-header-grid">' +
    '<div class="inner-header-main">' +
    opts.leftHtml +
    '</div>' +
    renderAdSlotHtml('AD-TB', { wrapCls: 'is-tb', frameCls: 'is-tb', immediate: true }) +
    '</div>' +
    '</section>'
  );
}
