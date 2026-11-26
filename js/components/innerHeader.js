import '../../css/routes/inner-shared.css';
import { toBgImageSetCss } from '../utils/viewHelpers.js';
import { renderAdSlotHtml } from './adSlots.js';

export function renderInnerHeaderHtml(opts) {
  const hasPic = Boolean(opts.bgPictureHtml);
  const bgStyle = !hasPic && opts.bgImage ? ' style="background-image:' + toBgImageSetCss(opts.bgImage) + '"' : '';
  return (
    '<section class="inner-header no-auto-ads' +
    (hasPic ? ' is-img-hero' : '') +
    '"' +
    bgStyle +
    '>' +
    (hasPic ? opts.bgPictureHtml : '') +
    '<div class="container inner-header-grid">' +
    '<div class="inner-header-main">' +
    opts.leftHtml +
    '</div>' +
    renderAdSlotHtml('AD-TB', { wrapCls: 'is-tb', frameCls: 'is-tb', immediate: true }) +
    '</div>' +
    '</section>'
  );
}
