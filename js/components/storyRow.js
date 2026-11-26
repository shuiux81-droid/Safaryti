import { esc, formatArabicDate, formatViews, arrowLeftSvg } from '../utils.js';
import { renderMediaBox } from '../utils/viewHelpers.js';

export function renderStoryRow(item, options) {
  const hideMeta = Boolean(options && options.hideMeta);
  const eager = Boolean(options && options.eager);
  return (
    '<a href="' +
    esc(item.href || '#article/' + item.id) +
    '" class="story-row">' +
    '<div class="story-row-media">' +
    renderMediaBox(item.image, item.title, 'story-row-thumb', eager, '(min-width: 640px) 220px, 96px') +
    '<span class="pill-tag story-row-tag">' +
    esc(item.category) +
    '</span>' +
    '</div>' +
    '<div class="story-row-body">' +
    '<h3 class="t-row-title"><span class="story-row-title-text">' +
    esc(item.title) +
    '</span></h3>' +
    (hideMeta
      ? ''
      : '<div class="story-meta t-meta">' +
        '<span>' +
        esc(formatArabicDate(item.date)) +
        '</span>' +
        '<span aria-hidden="true">·</span>' +
        '<span class="tabular">' +
        esc(formatViews(item.views)) +
        '</span>' +
        '</div>') +
    '<p class="story-row-excerpt">' +
    esc(item.excerpt || '') +
    '</p>' +
    '</div>' +
    '<span class="circle-arrow-btn story-row-arrow" aria-hidden="true">' +
    arrowLeftSvg() +
    '</span>' +
    '</a>'
  );
}
