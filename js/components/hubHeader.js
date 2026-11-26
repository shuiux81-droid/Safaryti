import { IMG } from '../config.js';
import { esc } from '../utils.js';
import { renderInnerHeaderHtml } from './innerHeader.js';

export function renderHubHeaderHtml(pageTitle, subText, bgImage) {
  return renderInnerHeaderHtml({
    bgImage: bgImage || IMG.heroBackdrop,
    leftHtml:
      '<h1 class="t-h1 no-auto-ads" tabindex="-1">' +
      esc(pageTitle) +
      '</h1>' +
      '<nav class="breadcrumb" aria-label="مسار التنقل"><a href="#home">الرئيسية</a><span aria-hidden="true">›</span><span>' +
      esc(pageTitle) +
      '</span></nav>',
  });
}
