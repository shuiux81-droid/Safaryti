// @ts-check

/**
 * @typedef {Object} StoryItem
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string} category
 * @property {string} date
 * @property {number} views
 * @property {string} excerpt
 */

/**
 * @typedef {'is-pos-0' | 'is-pos-p1' | 'is-pos-m1' | 'is-pos-p2' | 'is-pos-m2' | 'is-pos-hidden-p' | 'is-pos-hidden-m'} CoverflowPosClass
 */

/**
 * @typedef {Object} RectBox
 * @property {number} left
 * @property {number} top
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {'asia' | 'africa' | 'europe' | 'north-america' | 'south-america' | 'australia'} RegionSlug
 */

/**
 * @typedef {Object} RegionGlobeTarget
 * @property {RegionSlug} slug
 * @property {[number, number]} center
 * @property {[number, number, number]} rotate
 * @property {number[]} isoIds
 */

/**
 * @typedef {Object} DiscoverDetailStoryItem
 * @property {string} title
 * @property {string} href
 * @property {string} date
 * @property {number} views
 * @property {boolean} isPlaceholder
 */

/**
 * @typedef {'food' | 'heritage'} CultureTheme
 */

/**
 * @typedef {'all' | CultureTheme} CultureFilter
 */

/**
 * @typedef {StoryItem & { theme?: CultureTheme, image?: string, href?: string, isCmsSlot?: boolean }} CultureStoryItem
 */

/**
 * @typedef {Object} ArticleShareUrls
 * @property {string} facebook
 * @property {string} x
 * @property {string} whatsapp
 */

/**
 * @typedef {Object} ArticleHeroMetaItem
 * @property {'published' | 'updated' | 'author' | 'views'} kind
 * @property {string} [label]
 * @property {string} text
 * @property {string} [datetime]
 * @property {string} [srSuffix]
 */

/**
 * @typedef {Object} ArticleTocItem
 * @property {string} id
 * @property {string} indexLabel
 * @property {string} title
 * @property {2} level
 */

/**
 * @typedef {Object} ArticleTocModel
 * @property {ArticleTocItem[]} items
 * @property {number} totalHeadings
 * @property {boolean} shouldRender
 * @property {number} visibleLimit
 * @property {boolean} isScrollable
 */

/**
 * @typedef {Object} ArabPhoneCountry
 * @property {string} iso
 * @property {string} name
 * @property {string} dial
 */

import {
  clamp,
  easeInOutQuad,
  easeOutCubic,
  formatArabicDate,
  formatViews,
  formatEnNumber,
} from './utils/coreFormatters.js';

export {
  clamp,
  easeInOutQuad,
  easeOutCubic,
  formatArabicDate,
  formatViews,
  formatEnNumber,
};

/**
 * @param {number} _scrollY
 * @param {boolean} _isHome
 * @returns {number}
 */
export function computeHeaderLogoScale(_scrollY, _isHome) {
  return 1;
}

/**
 * @param {number} scrollY
 * @param {number} wrapperTop
 * @param {number} wrapperHeight
 * @param {number} innerHeight
 * @param {boolean} isPhone
 * @returns {{ vInsetVh: number, hInsetVw: number, radiusPx: number, marqueeOpacity: number, overlayOpacity: number }}
 */
export function computeExpandClipInset(scrollY, wrapperTop, wrapperHeight, innerHeight, isPhone) {
  const denom = Math.max(1, wrapperHeight - innerHeight);
  const p = clamp((scrollY - wrapperTop) / denom, 0, 1);
  const e = easeInOutQuad(p);
  const vMax = isPhone ? 18 : 14;
  const hMax = isPhone ? 12 : 30;
  const rMax = isPhone ? 28 : 40;
  return {
    vInsetVh: Number((vMax * (1 - e)).toFixed(4)),
    hInsetVw: Number((hMax * (1 - e)).toFixed(4)),
    radiusPx: Number((rMax * (1 - e)).toFixed(4)),
    marqueeOpacity: Number((1 - clamp((p - 0.55) / 0.35, 0, 1)).toFixed(4)),
    overlayOpacity: Number(clamp((p - 0.62) / 0.25, 0, 1).toFixed(4)),
  };
}

/**
 * @param {number} scrollY
 * @param {number} wrapTop
 * @param {number} wrapHeight
 * @param {number} innerHeight
 * @param {number} [sceneCount]
 * @returns {{ progress: number, activeIndex: number, segmentFills: number[], hideHint: boolean }}
 */
export function computeRegionSceneState(scrollY, wrapTop, wrapHeight, innerHeight, sceneCount = 6) {
  const denom = Math.max(1, wrapHeight - innerHeight);
  const p = clamp((scrollY - wrapTop) / denom, 0, 1);
  const activeIndex = Math.min(sceneCount - 1, Math.floor(p * sceneCount));
  /** @type {number[]} */
  const segmentFills = [];
  for (let i = 0; i < sceneCount; i++) {
    segmentFills.push(Number((clamp(p * sceneCount - i, 0, 1) * 100).toFixed(2)));
  }
  return {
    progress: p,
    activeIndex,
    segmentFills,
    hideHint: p > 0.02,
  };
}

/**
 * @param {{ name: string, phone: string, email: string, message: string }} fields
 * @returns {Record<string, string>}
 */
export function validateContactForm(fields) {
  /** @type {Record<string, string>} */
  const errors = {};
  if (!fields.name.trim()) errors.name = 'هذا الحقل مطلوب';
  if (!fields.phone.trim()) errors.phone = 'هذا الحقل مطلوب';
  const emailVal = fields.email.trim();
  if (emailVal && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailVal)) {
    errors.email = 'أدخل بريدًا إلكترونيًا صحيحًا';
  }
  if (!fields.message.trim()) errors.message = 'هذا الحقل مطلوب';
  return errors;
}

/**
 * @param {number} current
 * @param {number} totalPages
 * @returns {Array<number | '...'>}
 */
export function buildPaginationRange(current, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  /** @type {Array<number | '...'>} */
  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  if (start > 2) pages.push('...');
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages - 1) pages.push('...');
  pages.push(totalPages);
  return pages;
}

/**
 * Compact pagination items with at most 5 numeric page buttons (first, current ±1, last, and ellipses).
 * @param {number} current
 * @param {number} totalPages
 * @returns {Array<number | '...'>}
 */
export function buildCompactPaginationItems(current, totalPages) {
  const safeTotal = Math.max(1, Math.floor(totalPages) || 1);
  if (safeTotal <= 5) {
    return Array.from({ length: safeTotal }, (_, i) => i + 1);
  }
  const safeCurrent = clamp(Math.floor(current) || 1, 1, safeTotal);
  /** @type {Array<number | '...'>} */
  const items = [1];
  const start = Math.max(2, safeCurrent - 1);
  const end = Math.min(safeTotal - 1, safeCurrent + 1);
  if (start > 2) items.push('...');
  for (let p = start; p <= end; p++) items.push(p);
  if (end < safeTotal - 1) items.push('...');
  items.push(safeTotal);
  return items;
}

/**
 * @template T
 * @param {T[]} items
 * @param {number} page
 * @param {number} [perPage]
 * @returns {{ items: T[], page: number, totalPages: number }}
 */
export function paginateList(items, page, perPage = 5) {
  const safePerPage = Math.max(1, Math.floor(perPage));
  const totalPages = Math.max(1, Math.ceil(items.length / safePerPage));
  const safePage = clamp(Math.floor(page) || 1, 1, totalPages);
  const start = (safePage - 1) * safePerPage;
  return {
    items: items.slice(start, start + safePerPage),
    page: safePage,
    totalPages,
  };
}

/**
 * @param {string} hash
 * @returns {{ view: string, param: string }}
 */
export function parseHashRoute(hash) {
  const cleaned = (hash || '').replace(/^#/, '').trim();
  if (!cleaned) return { view: 'home', param: '' };
  const [rawView, ...rest] = cleaned.split('/');
  const param = decodeURIComponent(rest.join('/'));
  const validViews = new Set(['home', 'all-stories', 'category', 'article', 'about', 'contact', 'privacy', 'discover', 'culture', 'search']);
  if (!validViews.has(rawView)) {
    return { view: 'home', param: '' };
  }
  return { view: rawView, param };
}

/**
 * @param {number} viewportWidth
 * @returns {number}
 */
export function getSideRailWidth(viewportWidth) {
  if (viewportWidth >= 1440) return 160;
  if (viewportWidth >= 1200) return 140;
  if (viewportWidth >= 1024) return 112;
  if (viewportWidth >= 768) return 96;
  return 0;
}

/**
 * @param {number} viewportWidth
 * @returns {boolean}
 */
export function shouldShowSideRails(viewportWidth) {
  return viewportWidth >= 768;
}

/**
 * @param {string} slotId
 * @param {number} viewportWidth
 * @param {number} [viewportHeight]
 * @returns {{ width: number | '100%', height: number, hidden?: boolean }}
 */
export function getAdSlotDimensions(slotId, viewportWidth, viewportHeight = 900) {
  const isDesktop = viewportWidth >= 1024;
  const isTablet = viewportWidth >= 640 && viewportWidth < 1024;
  switch (slotId) {
    case 'AD-SKY-L':
    case 'AD-SKY-R': {
      const railWidth = getSideRailWidth(viewportWidth);
      return { width: railWidth || 160, height: viewportHeight, hidden: railWidth === 0 };
    }
    case 'AD-STICKY':
      return { width: 250, height: 208 };
    case 'AD-H1':
      return { width: 300, height: 150 };
    case 'AD-H2':
      return { width: 300, height: 250 };
    case 'AD-H4':
    case 'AD-H5':
      return isDesktop || isTablet ? { width: 336, height: 280 } : { width: 300, height: 250 };
    case 'AD-H3':
      return { width: 728, height: 90, hidden: !isDesktop };
    case 'AD-SB-HALF':
      return isDesktop ? { width: 300, height: 600 } : { width: 300, height: 250 };
    case 'AD-TB':
      return isDesktop ? { width: 728, height: 90 } : { width: 320, height: 100 };
    case 'AD-BB':
      if (isDesktop) return { width: 970, height: 250 };
      if (isTablet) return { width: 728, height: 90 };
      return { width: 336, height: 280 };
    case 'AD-SB1':
      return { width: 300, height: 250 };
    case 'AD-A1':
      return { width: '100%', height: 280 };
    case 'AD-A2':
      return { width: '100%', height: 120 };
    default:
      return { width: 300, height: 250 };
  }
}

/**
 * @param {number} seed
 * @returns {() => number}
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @param {number} cx
 * @param {number} cy
 * @param {number} rx
 * @param {number} ry
 * @param {number} rotDeg
 * @param {number} wobble
 * @param {number} seed
 * @returns {string}
 */
export function contourPath(cx, cy, rx, ry, rotDeg, wobble, seed) {
  const rand = mulberry32(seed);
  const n = 14;
  const rad = (rotDeg * Math.PI) / 180;
  const cosR = Math.cos(rad);
  const sinR = Math.sin(rad);
  /** @type {Array<{ x: number, y: number }>} */
  const pts = [];

  for (let k = 0; k < n; k++) {
    const theta = (2 * Math.PI * k) / n;
    const fk = 1 + wobble * (2 * rand() - 1);
    const dx = rx * fk * Math.cos(theta);
    const dy = ry * fk * Math.sin(theta);
    pts.push({
      x: cx + dx * cosR - dy * sinR,
      y: cy + dx * sinR + dy * cosR,
    });
  }

  /** @param {number} v */
  const fmt = (v) => v.toFixed(1);
  let d = `M${fmt(pts[0].x)},${fmt(pts[0].y)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${fmt(c1x)},${fmt(c1y)} ${fmt(c2x)},${fmt(c2y)} ${fmt(p2.x)},${fmt(p2.y)}`;
  }
  return `${d} Z`;
}

/**
 * @param {number} w
 * @param {number} h
 * @returns {string}
 */
export function buildHeroRoutePath(w, h) {
  /** @param {number} v */
  const fmt = (v) => v.toFixed(1);
  return (
    `M ${fmt(w + 40)},${fmt(h - 36)} ` +
    `C ${fmt(0.86 * w)},${fmt(h - 62)} ${fmt(0.64 * w)},${fmt(h - 14)} ${fmt(0.46 * w)},${fmt(h - 38)} ` +
    `S ${fmt(0.16 * w)},${fmt(h - 60)} -40,${fmt(h - 30)}`
  );
}

/**
 * @param {number} x
 * @param {number} yStart
 * @param {number} height
 * @param {number} [step]
 * @param {1 | -1} [dir]
 * @returns {string}
 */
export function buildRulerPath(x, yStart, height, step = 12, dir = 1) {
  /** @param {number} v */
  const fmt = (v) => v.toFixed(1);
  const count = Math.floor(height / step);
  let d = `M${fmt(x)},${fmt(yStart)} V${fmt(yStart + height)}`;
  for (let k = 0; k <= count; k++) {
    const y = yStart + k * step;
    const len = k % 10 === 0 ? 13 : k % 5 === 0 ? 9 : 5;
    d += ` M${fmt(x)},${fmt(y)} h${dir * len}`;
  }
  return d;
}

/**
 * @param {string} rawCategory
 * @returns {string}
 */
export function formatPickRegionTag(rawCategory) {
  return (rawCategory || '')
    .split('||')[0]
    .replace(/\s*\([^)]*\)\s*/g, '')
    .trim();
}

/**
 * @param {number} cardIndex
 * @param {number} activeIndex
 * @param {number} viewportWidth
 * @param {number} [total]
 * @returns {{ distance: number, posClass: CoverflowPosClass, visible: boolean, focusable: boolean, dimOpacity: number }}
 */
export function computeCoverflowCardState(cardIndex, activeIndex, viewportWidth, total = 9) {
  const half = Math.floor(total / 2);
  const distance = ((cardIndex - activeIndex + total + half) % total) - half;
  const maxVisibleDistance = viewportWidth < 640 ? 1 : 2;
  const visible = Math.abs(distance) <= maxVisibleDistance;
  /** @type {CoverflowPosClass} */
  let posClass;
  if (distance === 0) posClass = 'is-pos-0';
  else if (distance === 1) posClass = 'is-pos-p1';
  else if (distance === -1) posClass = 'is-pos-m1';
  else if (distance === 2) posClass = 'is-pos-p2';
  else if (distance === -2) posClass = 'is-pos-m2';
  else posClass = distance > 0 ? 'is-pos-hidden-p' : 'is-pos-hidden-m';

  const dimOpacity = distance === 0 ? 0 : Math.abs(distance) === 1 ? 0.25 : 0.4;
  return { distance, posClass, visible, focusable: visible, dimOpacity };
}

/**
 * @param {number} activeIndex
 * @param {number} delta
 * @param {number} total
 * @returns {{ nextIndex: number, prevDisabled: boolean, nextDisabled: boolean }}
 */
export function stepCoverflowIndex(activeIndex, delta, total) {
  const safeTotal = Math.max(1, total);
  const nextIndex = (((activeIndex + delta) % safeTotal) + safeTotal) % safeTotal;
  return {
    nextIndex,
    prevDisabled: false,
    nextDisabled: false,
  };
}

/**
 * @param {number | null} prevDistance
 * @param {number} nextDistance
 * @param {number} [total]
 * @returns {boolean}
 */
export function isCoverflowWrapJump(prevDistance, nextDistance, total = 9) {
  return prevDistance !== null && Math.abs(nextDistance - prevDistance) > Math.floor(total / 2);
}

/**
 * @param {number} dx
 * @param {number} dy
 * @param {number} [threshold]
 * @returns {-1 | 0 | 1}
 */
export function resolveCoverflowSwipeDelta(dx, dy, threshold = 48) {
  if (Math.abs(dx) <= threshold || Math.abs(dy) >= Math.abs(dx)) {
    return 0;
  }
  return dx > 0 ? 1 : -1;
}

/**
 * @param {number} viewportWidth
 * @returns {{ mode: 'row' | 'coverflow', cardCount: number, listRole: 'region', cardRole: null, showControls: boolean }}
 */
export function resolvePicksSectionMode(viewportWidth) {
  const isCoverflow = viewportWidth >= 768;
  return {
    mode: isCoverflow ? 'coverflow' : 'row',
    cardCount: isCoverflow ? 5 : 9,
    listRole: 'region',
    cardRole: null,
    showControls: isCoverflow,
  };
}

/**
 * @param {number} scrollY
 * @param {number} wrapperTop
 * @param {number} wrapperHeight
 * @param {number} innerHeight
 * @returns {{ p: number, tileA: { translateYVh: number, outwardRem: number }, tileB: { translateYVh: number, outwardRem: number }, tileC: { translateYVh: number, outwardRem: number }, copyOpacity: number, copyTranslateYPx: number }}
 */
export function computeAboutScatterState(scrollY, wrapperTop, wrapperHeight, innerHeight) {
  const denom = Math.max(1, wrapperHeight - innerHeight);
  const p = clamp((scrollY - wrapperTop) / denom, 0, 1);
  const copyProgress = clamp((p - 0.15) / 0.3, 0, 1);
  return {
    p: Number(p.toFixed(4)),
    tileA: {
      translateYVh: Number(((p - 0.5) * -0.35 * 100).toFixed(4)),
      outwardRem: Number((3 * p).toFixed(4)),
    },
    tileB: {
      translateYVh: Number(((p - 0.5) * 0.45 * 100).toFixed(4)),
      outwardRem: Number((3 * p).toFixed(4)),
    },
    tileC: {
      translateYVh: Number(((p - 0.5) * -0.2 * 100).toFixed(4)),
      outwardRem: 0,
    },
    copyOpacity: Number(copyProgress.toFixed(4)),
    copyTranslateYPx: Number((24 * (1 - copyProgress)).toFixed(4)),
  };
}

/**
 * @param {number} rectTop
 * @param {number} innerHeight
 * @returns {{ vInsetVh: number, hInsetVw: number, radiusRem: number }}
 */
export function computeAboutClosingClip(rectTop, innerHeight) {
  const t = clamp((innerHeight - rectTop) / Math.max(1, innerHeight * 0.6), 0, 1);
  return {
    vInsetVh: Number((10 * (1 - t)).toFixed(4)),
    hInsetVw: Number((8 * (1 - t)).toFixed(4)),
    radiusRem: Number((2.5 * (1 - t)).toFixed(4)),
  };
}

/**
 * @param {number} scrollY
 * @param {number} wrapperTop
 * @param {number} wrapperHeight
 * @param {number} innerHeight
 * @param {number} [stageHeight]
 * @param {number} [postStickyRatio]
 * @returns {number}
 */
export function computeAboutFlightProgress(
  scrollY,
  wrapperTop,
  wrapperHeight,
  innerHeight,
  stageHeight = innerHeight,
  postStickyRatio = 0.65
) {
  const denom = Math.max(1, wrapperHeight - stageHeight + postStickyRatio * innerHeight);
  return Number(clamp((scrollY - wrapperTop) / denom, 0, 1).toFixed(6));
}

/**
 * @param {{ p: number, stageTop: number, startRect: RectBox, targetRect: RectBox, driftXAt0?: number, driftYAt0?: number }} params
 * @returns {{ x: number, y: number, s: number, t: number, handedOff: boolean }}
 */
export function computeAboutTravelerFrame(params) {
  const { p, stageTop, startRect, targetRect, driftXAt0 = 0, driftYAt0 = 0 } = params;
  if (p <= 0.45) {
    const k = 1 - p / 0.45;
    return {
      x: startRect.left + driftXAt0 * k,
      y: stageTop + startRect.top + driftYAt0 * k,
      s: 1,
      t: 0,
      handedOff: false,
    };
  }
  const rawT = clamp((p - 0.45) / 0.55, 0, 1);
  const t = easeInOutQuad(rawT);
  const tx = t <= 0.5 ? 0 : easeInOutQuad((t - 0.5) * 2);
  const x = startRect.left + (targetRect.left - startRect.left) * tx;
  const y = startRect.top + (targetRect.top - startRect.top) * t;
  const s = (startRect.width + (targetRect.width - startRect.width) * t) / Math.max(1, startRect.width);
  return {
    x: Number(x.toFixed(3)),
    y: Number(y.toFixed(3)),
    s: Number(s.toFixed(6)),
    t: Number(t.toFixed(6)),
    handedOff: t >= 1,
  };
}

/** @type {Record<RegionSlug, RegionGlobeTarget>} */
export const REGION_GLOBE_TARGETS = {
  asia: {
    slug: 'asia',
    center: [95, 34],
    rotate: [-95, -34, 0],
    isoIds: [4, 31, 48, 50, 51, 64, 96, 104, 116, 144, 156, 158, 268, 275, 356, 360, 364, 368, 376, 392, 398, 400, 408, 410, 414, 417, 418, 422, 458, 462, 496, 512, 524, 586, 608, 626, 634, 682, 702, 704, 760, 762, 764, 784, 792, 795, 860, 887],
  },
  africa: {
    slug: 'africa',
    center: [20, 4],
    rotate: [-20, -4, 0],
    isoIds: [12, 24, 72, 108, 120, 132, 140, 148, 174, 178, 180, 204, 226, 231, 232, 262, 266, 270, 288, 324, 384, 404, 426, 430, 434, 450, 454, 466, 478, 480, 504, 508, 516, 562, 566, 646, 678, 686, 690, 694, 706, 710, 716, 728, 729, 732, 748, 768, 788, 800, 818, 834, 854, 894],
  },
  europe: {
    slug: 'europe',
    center: [15, 50],
    rotate: [-15, -50, 0],
    isoIds: [8, 20, 40, 56, 70, 100, 112, 191, 196, 203, 208, 233, 246, 250, 276, 300, 348, 352, 372, 380, 412, 428, 438, 440, 442, 470, 492, 498, 499, 528, 578, 616, 620, 642, 643, 674, 688, 703, 705, 724, 752, 756, 804, 807, 826],
  },
  'north-america': {
    slug: 'north-america',
    center: [-98, 42],
    rotate: [98, -42, 0],
    isoIds: [28, 44, 52, 84, 124, 188, 192, 212, 214, 222, 304, 308, 320, 332, 340, 388, 484, 558, 591, 630, 659, 662, 670, 780, 840],
  },
  'south-america': {
    slug: 'south-america',
    center: [-60, -18],
    rotate: [60, 18, 0],
    isoIds: [32, 68, 76, 152, 170, 218, 238, 254, 328, 600, 604, 740, 858, 862],
  },
  australia: {
    slug: 'australia',
    center: [136, -24],
    rotate: [-136, 24, 0],
    isoIds: [36, 90, 242, 296, 540, 548, 554, 583, 584, 585, 598, 776, 798, 882],
  },
};

/**
 * @param {number | string} isoId
 * @param {string} slug
 * @returns {boolean}
 */
export function isCountryInRegion(isoId, slug) {
  const target = REGION_GLOBE_TARGETS[/** @type {RegionSlug} */ (slug)];
  if (!target) return false;
  const num = Number(isoId);
  if (!Number.isFinite(num)) return false;
  return target.isoIds.includes(num);
}

/**
 * @param {[number, number, number]} from
 * @param {[number, number, number]} to
 * @param {number} t
 * @returns {[number, number, number]}
 */
export function interpolateGlobeRotation(from, to, t) {
  const k = easeOutCubic(t);
  const dLon = ((((to[0] - from[0]) % 360) + 540) % 360) - 180;
  const dLat = to[1] - from[1];
  const dRoll = to[2] - from[2];
  return [
    Number((from[0] + dLon * k).toFixed(4)),
    Number((from[1] + dLat * k).toFixed(4)),
    Number((from[2] + dRoll * k).toFixed(4)),
  ];
}

/**
 * @param {number} index
 * @param {number} [stepMs]
 * @param {number} [maxIndex]
 * @returns {number}
 */
export function computeRevealDelayMs(index, stepMs = 80, maxIndex = 5) {
  const safeIdx = Math.max(0, Math.min(Math.floor(index), maxIndex));
  return safeIdx * stepMs;
}

/**
 * @param {string} param
 * @returns {'discover' | 'africa' | 'asia' | 'culture' | 'tips' | ''}
 */
export function resolveCategoryNavGroup(param) {
  const normalized = (param || '').trim();
  if (normalized === 'africa' || normalized === 'إفريقيا') {
    return 'africa';
  }
  if (normalized === 'asia' || normalized === 'آسيا') {
    return 'asia';
  }
  if (
    normalized === 'tips' ||
    normalized === 'نصائح السفر' ||
    normalized === 'trip-planning' ||
    normalized === 'تخطيط الرحلات والتنقل' ||
    normalized === 'travel-safety' ||
    normalized === 'الأمن والسلامة في السفر'
  ) {
    return 'tips';
  }
  if (
    normalized === 'food' ||
    normalized === 'heritage' ||
    normalized === 'المأكولات العالمية' ||
    normalized === 'التراث والتقاليد'
  ) {
    return 'culture';
  }
  if (
    normalized === 'europe' ||
    normalized === 'أوروبا' ||
    normalized === 'north-america' ||
    normalized === 'أمريكا الشمالية' ||
    normalized === 'south-america' ||
    normalized === 'أمريكا الجنوبية' ||
    normalized === 'australia' ||
    normalized === 'أستراليا' ||
    normalized === 'أستراليا (أوقيانوسيا)'
  ) {
    return 'discover';
  }
  return '';
}

/** @type {Record<string, string>} */
const CATEGORY_CANONICAL_SLUGS = {
  asia: 'asia',
  'آسيا': 'asia',
  africa: 'africa',
  'إفريقيا': 'africa',
  europe: 'europe',
  'أوروبا': 'europe',
  'north-america': 'north-america',
  'أمريكا الشمالية': 'north-america',
  'south-america': 'south-america',
  'أمريكا الجنوبية': 'south-america',
  australia: 'australia',
  'أستراليا': 'australia',
  'أستراليا (أوقيانوسيا)': 'australia',
  food: 'food',
  'المأكولات العالمية': 'food',
  heritage: 'heritage',
  'التراث والتقاليد': 'heritage',
  tips: 'tips',
  'نصائح السفر': 'tips',
  'trip-planning': 'trip-planning',
  'تخطيط الرحلات والتنقل': 'trip-planning',
  'travel-safety': 'travel-safety',
  'الأمن والسلامة في السفر': 'travel-safety',
};

/**
 * @param {string} param
 * @returns {string}
 */
export function resolveCategoryChildSlug(param) {
  const normalized = (param || '').trim();
  return CATEGORY_CANONICAL_SLUGS[normalized] || '';
}

/**
 * @template {{ isTip?: boolean, category?: string, theme?: string, sub?: string }} T
 * @param {T[]} catalog
 * @returns {T[]}
 */
export function selectTripPlanningStories(catalog) {
  const tipsStories = (catalog || []).filter(
    (item) => Boolean(item && (item.isTip || item.category === 'نصائح السفر' || item.theme === 'tips'))
  );
  const subMatches = tipsStories.filter((item) => item.sub === 'trip-planning');
  return subMatches.length > 0 ? subMatches : tipsStories;
}

/**
 * @template {{ isTip?: boolean, category?: string, theme?: string, sub?: string }} T
 * @param {T[]} catalog
 * @returns {T[]}
 */
export function selectTravelSafetyStories(catalog) {
  const tipsStories = (catalog || []).filter(
    (item) => Boolean(item && (item.isTip || item.category === 'نصائح السفر' || item.theme === 'tips'))
  );
  const subMatches = tipsStories.filter((item) => item.sub === 'travel-safety');
  return subMatches.length > 0 ? subMatches : tipsStories;
}

/**
 * @template {{ isTip?: boolean, category?: string, theme?: string, sub?: string, date?: string, isCmsSlot?: boolean }} T
 * @param {T[]} stories
 * @param {'all' | 'trip-planning' | 'travel-safety'} [filter]
 * @param {number} [maxCount]
 * @returns {T[]}
 */
export function filterTipsStories(stories, filter = 'all', maxCount = 6) {
  const limit = Math.max(0, Math.floor(maxCount));
  return (stories || [])
    .filter((s) => {
      if (!s || s.isCmsSlot) return false;
      const isTipStory = Boolean(s.isTip || s.category === 'نصائح السفر' || s.theme === 'tips');
      if (!isTipStory) return false;
      if (filter === 'all') return true;
      return s.sub === filter;
    })
    .slice()
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, limit);
}

/**
 * @param {number} t
 * @param {number} [x1]
 * @param {number} [y1]
 * @param {number} [x2]
 * @param {number} [y2]
 * @returns {number}
 */
export function cubicBezierEase(t, x1 = 0.22, y1 = 1, x2 = 0.36, y2 = 1) {
  const clamped = clamp(t, 0, 1);
  if (clamped <= 0) return 0;
  if (clamped >= 1) return 1;
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  /** @param {number} u */
  const sampleX = (u) => ((ax * u + bx) * u + cx) * u;
  /** @param {number} u */
  const sampleDX = (u) => (3 * ax * u + 2 * bx) * u + cx;
  /** @param {number} u */
  const sampleY = (u) => ((ay * u + by) * u + cy) * u;

  let u = clamped;
  for (let i = 0; i < 6; i++) {
    const err = sampleX(u) - clamped;
    const dx = sampleDX(u);
    if (Math.abs(err) < 1e-5) break;
    if (Math.abs(dx) < 1e-6) break;
    u = clamp(u - err / dx, 0, 1);
  }
  return Number(clamp(sampleY(u), 0, 1).toFixed(6));
}

/**
 * @param {number | string} isoId
 * @returns {RegionSlug | null}
 */
export function findRegionForIsoId(isoId) {
  const num = Number(isoId);
  if (!Number.isFinite(num)) return null;
  const keys = /** @type {RegionSlug[]} */ (Object.keys(REGION_GLOBE_TARGETS));
  for (let i = 0; i < keys.length; i++) {
    const slug = keys[i];
    if (REGION_GLOBE_TARGETS[slug].isoIds.includes(num)) {
      return slug;
    }
  }
  return null;
}

/**
 * @param {number} count
 * @param {number} maxCount
 * @returns {number}
 */
export function computeRegionSharePercent(count, maxCount) {
  if (!Number.isFinite(count) || !Number.isFinite(maxCount) || maxCount <= 0) return 0;
  return Number(clamp((count / maxCount) * 100, 0, 100).toFixed(2));
}

/**
 * @param {number} dx
 * @param {number} dy
 * @param {number} [threshold]
 * @returns {'click' | 'drag'}
 */
export function classifyGlobePointerAction(dx, dy, threshold = 4) {
  return Math.hypot(dx, dy) < threshold ? 'click' : 'drag';
}

/**
 * @param {RegionSlug} slug
 * @param {string} regionDisplayName
 * @param {Array<Pick<StoryItem, 'id' | 'title' | 'category' | 'date' | 'views'> & { href?: string }>} seededStories
 * @returns {DiscoverDetailStoryItem[]}
 */
export function getDiscoverStoriesForRegion(slug, regionDisplayName, seededStories) {
  /** @type {DiscoverDetailStoryItem[]} */
  const matching = seededStories
    .filter((s) => s.category === regionDisplayName)
    .slice()
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 2)
    .map((s) => ({
      title: s.title,
      href: s.href || `#article/${s.id}`,
      date: s.date,
      views: s.views,
      isPlaceholder: false,
    }));

  const fallbackHref = `#category/${slug}`;
  /** @type {DiscoverDetailStoryItem[]} */
  const placeholders = [
    {
      title: `أدلة وقصص ${regionDisplayName} القادمة`,
      href: fallbackHref,
      date: '',
      views: 0,
      isPlaceholder: true,
    },
    {
      title: `أبرز الوجهات والمعالم في ${regionDisplayName}`,
      href: fallbackHref,
      date: '',
      views: 0,
      isPlaceholder: true,
    },
  ];

  while (matching.length < 2) {
    matching.push(placeholders[matching.length]);
  }
  return matching;
}

/** @type {RegionSlug[]} */
export const DISCOVER_REGION_ORDER = [
  'asia',
  'africa',
  'europe',
  'north-america',
  'south-america',
  'australia',
];

/**
 * @param {number} currentIndex
 * @param {number} delta
 * @param {number} [total]
 * @returns {number}
 */
export function stepDiscoverIndex(currentIndex, delta, total = 6) {
  const safeTotal = Math.max(1, Math.floor(total));
  return (((Math.floor(currentIndex) + Math.floor(delta)) % safeTotal) + safeTotal) % safeTotal;
}

/**
 * @param {number} dx
 * @param {number} dy
 * @param {number} [threshold]
 * @returns {-1 | 0 | 1}
 */
export function resolveDiscoverSwipeDelta(dx, dy, threshold = 48) {
  if (Math.abs(dx) <= threshold || Math.abs(dy) >= Math.abs(dx)) {
    return 0;
  }
  return dx > 0 ? 1 : -1;
}

/**
 * @param {string} regionName
 * @param {string | undefined} regionShortName
 * @param {Array<Pick<StoryItem, 'id' | 'title' | 'category' | 'date' | 'views'> & { href?: string }>} stories
 * @param {number} [maxCount]
 * @returns {DiscoverDetailStoryItem[]}
 */
export function getDiscoverRealStories(regionName, regionShortName, stories, maxCount = 3) {
  const limit = Math.max(0, Math.floor(maxCount));
  return stories
    .filter((s) => s.category === regionName || (regionShortName ? s.category === regionShortName : false))
    .slice()
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, limit)
    .map((s) => ({
      title: s.title,
      href: s.href || `#article/${s.id}`,
      date: s.date,
      views: s.views,
      isPlaceholder: false,
    }));
}

/**
 * @param {CultureTheme} theme
 * @returns {string}
 */
export function getCultureThemeLabel(theme) {
  return theme === 'food' ? 'المأكولات العالمية' : 'التراث والتقاليد';
}

/**
 * @param {CultureFilter} filter
 * @returns {string}
 */
export function getCultureMoreHref(filter) {
  if (filter === 'food') return '#category/food';
  if (filter === 'heritage') return '#category/heritage';
  return '#all-stories';
}

/**
 * @template {Pick<CultureStoryItem, 'theme' | 'date' | 'isCmsSlot'>} T
 * @param {T[]} stories
 * @param {CultureFilter} [filter]
 * @param {number} [maxCount]
 * @returns {T[]}
 */
export function filterCultureStories(stories, filter = 'all', maxCount = 6) {
  const limit = Math.max(0, Math.floor(maxCount));
  return stories
    .filter((s) => {
      if (s.isCmsSlot) return false;
      if (s.theme !== 'food' && s.theme !== 'heritage') return false;
      if (filter === 'all') return true;
      return s.theme === filter;
    })
    .slice()
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, limit);
}

/**
 * @param {string} url
 * @param {string} title
 * @returns {ArticleShareUrls}
 */
export function buildArticleShareUrls(url, title) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };
}

/**
 * @param {{ date: string, updatedDate?: string | null, author: string | { name: string }, views: number }} input
 * @returns {ArticleHeroMetaItem[]}
 */
export function buildArticleHeroMeta(input) {
  const authorName = typeof input.author === 'string' ? input.author : input.author.name;
  /** @type {ArticleHeroMetaItem[]} */
  const items = [
    {
      kind: 'published',
      text: formatArabicDate(input.date),
      datetime: input.date,
      srSuffix: 'تاريخ النشر',
    },
  ];
  if (input.updatedDate) {
    items.push({
      kind: 'updated',
      text: formatArabicDate(input.updatedDate),
      datetime: input.updatedDate,
      srSuffix: 'آخر تحديث',
    });
  }
  items.push(
    {
      kind: 'author',
      text: authorName,
    },
    {
      kind: 'views',
      text: formatEnNumber(input.views),
      srSuffix: 'مشاهدة',
    }
  );
  return items;
}

/**
 * @param {string} text
 * @param {Set<string>} [usedIds]
 * @returns {string}
 */
export function slugifyArticleHeading(text, usedIds) {
  const cleaned = (text || '')
    .trim()
    .toLowerCase()
    .replace(/[^\u0621-\u064A\u0660-\u0669\u0671-\u06D3a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const base = cleaned ? `sec-${cleaned}` : 'sec-heading';
  if (!usedIds) return base;
  let candidate = base;
  let suffix = 2;
  while (usedIds.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  usedIds.add(candidate);
  return candidate;
}

/**
 * @param {{ title: string, sections?: Array<{ title: string, subSections?: Array<{ title: string }> }>, faqs?: Array<{ q: string, a: string }> }} input
 * @param {number} [visibleLimit]
 * @returns {ArticleTocModel}
 */
export function buildArticleTocModel(input, visibleLimit = 4) {
  const usedIds = new Set();
  /** @type {ArticleTocItem[]} */
  const items = [];

  (input.sections || []).forEach((sec) => {
    const id = slugifyArticleHeading(sec.title, usedIds);
    items.push({
      id,
      indexLabel: String(items.length + 1).padStart(2, '0'),
      title: sec.title,
      level: 2,
    });
  });

  if (input.faqs && input.faqs.length > 0) {
    const faqTitle = `الأسئلة الشائعة حول ${input.title}`;
    items.push({
      id: slugifyArticleHeading(faqTitle, usedIds),
      indexLabel: String(items.length + 1).padStart(2, '0'),
      title: faqTitle,
      level: 2,
    });
  }

  return {
    items,
    totalHeadings: items.length,
    shouldRender: items.length >= 3,
    visibleLimit,
    isScrollable: items.length > visibleLimit,
  };
}

/**
 * @param {number} scrollY
 * @param {number} scrollHeight
 * @param {number} innerHeight
 * @returns {number}
 */
export function computeReadingProgressRatio(scrollY, scrollHeight, innerHeight) {
  const docH = Math.max(1, scrollHeight - innerHeight);
  return Number(clamp(scrollY / docH, 0, 1).toFixed(4));
}

/**
 * @param {number} scrollTop
 * @param {number} clientHeight
 * @param {number} scrollHeight
 * @param {number} [thresholdPx]
 * @returns {boolean}
 */
export function computeAsidePinnedHasMore(scrollTop, clientHeight, scrollHeight, thresholdPx = 2) {
  if (!Number.isFinite(scrollHeight) || !Number.isFinite(clientHeight) || clientHeight <= 0) {
    return false;
  }
  const remaining = scrollHeight - clientHeight - Math.max(0, scrollTop);
  return remaining > thresholdPx;
}

/**
 * @param {{ currentScrollTop: number, itemTop: number, itemBottom: number, panelTop: number, panelBottom: number, padding?: number, nowMs: number, lastUserInteractionMs: number, userLockMs?: number }} params
 * @returns {number | null}
 */
export function computeAsideNearestScrollTop(params) {
  const {
    currentScrollTop,
    itemTop,
    itemBottom,
    panelTop,
    panelBottom,
    padding = 8,
    nowMs,
    lastUserInteractionMs,
    userLockMs = 3000,
  } = params;
  if (lastUserInteractionMs > 0 && nowMs - lastUserInteractionMs < userLockMs) {
    return null;
  }
  const topBound = panelTop + padding;
  const bottomBound = panelBottom - padding;
  if (itemTop < topBound) {
    return Math.max(0, Math.round(currentScrollTop + (itemTop - topBound)));
  }
  if (itemBottom > bottomBound) {
    return Math.max(0, Math.round(currentScrollTop + (itemBottom - bottomBound)));
  }
  return null;
}

/**
 * @param {{ viewportWidth: number, viewportHeight: number, zoneTop: number, zoneBottom: number, pinnedHeight: number, pinOffsetPx?: number }} params
 * @returns {{ isStickyEnabled: boolean, top: number, phase: 'static' | 'before-pin' | 'pinned' | 'released' }}
 */
export function computeArticleStickyAsideTop(params) {
  const {
    viewportWidth,
    viewportHeight,
    zoneTop,
    zoneBottom,
    pinnedHeight,
    pinOffsetPx = 112,
  } = params;
  if (viewportWidth < 1024 || viewportHeight <= 760) {
    return { isStickyEnabled: false, top: zoneTop, phase: 'static' };
  }
  if (zoneTop >= pinOffsetPx) {
    return { isStickyEnabled: true, top: zoneTop, phase: 'before-pin' };
  }
  const maxTopAtEnd = zoneBottom - pinnedHeight;
  if (maxTopAtEnd <= pinOffsetPx) {
    return { isStickyEnabled: true, top: maxTopAtEnd, phase: 'released' };
  }
  return { isStickyEnabled: true, top: pinOffsetPx, phase: 'pinned' };
}

/** @type {ReadonlyArray<ArabPhoneCountry>} */
export const ARAB_PHONE_COUNTRIES = [
  { iso: 'eg', name: 'مصر', dial: '+20' },
  { iso: 'sa', name: 'السعودية', dial: '+966' },
  { iso: 'ae', name: 'الإمارات', dial: '+971' },
  { iso: 'kw', name: 'الكويت', dial: '+965' },
  { iso: 'qa', name: 'قطر', dial: '+974' },
  { iso: 'bh', name: 'البحرين', dial: '+973' },
  { iso: 'om', name: 'عُمان', dial: '+968' },
  { iso: 'jo', name: 'الأردن', dial: '+962' },
  { iso: 'lb', name: 'لبنان', dial: '+961' },
  { iso: 'iq', name: 'العراق', dial: '+964' },
  { iso: 'ma', name: 'المغرب', dial: '+212' },
  { iso: 'dz', name: 'الجزائر', dial: '+213' },
  { iso: 'tn', name: 'تونس', dial: '+216' },
  { iso: 'ly', name: 'ليبيا', dial: '+218' },
  { iso: 'sd', name: 'السودان', dial: '+249' },
];

/**
 * @param {string} text
 * @param {number} [maxLength]
 * @param {number} [warnOver]
 * @returns {{ count: number, max: number, label: string, isWarning: boolean }}
 */
export function getMessageCounterState(text, maxLength = 500, warnOver = 480) {
  const count = Math.min(maxLength, (text || '').length);
  return {
    count,
    max: maxLength,
    label: `${count} / ${maxLength}`,
    isWarning: count > warnOver,
  };
}

const ARABIC_DIACRITICS_RE = /[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/;

/**
 * @param {string} ch
 * @returns {string}
 */
function normalizeArabicChar(ch) {
  if (ch === 'أ' || ch === 'إ' || ch === 'آ' || ch === 'ٱ') return 'ا';
  if (ch === 'ى') return 'ي';
  if (ch === 'ة') return 'ه';
  return ch.toLowerCase();
}

/**
 * @param {string} text
 * @returns {string}
 */
export function normalizeArabicSearchText(text) {
  const str = String(text || '');
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ARABIC_DIACRITICS_RE.test(ch)) continue;
    out += normalizeArabicChar(ch);
  }
  return out;
}

/**
 * @param {string} text
 * @param {string} rawQuery
 * @returns {{ start: number, end: number, normIndex: number } | null}
 */
export function findNormalizedMatchRange(text, rawQuery) {
  const normQuery = normalizeArabicSearchText(rawQuery.trim());
  if (!normQuery) return null;
  const str = String(text || '');
  /** @type {number[]} */
  const normToOrig = [];
  let normText = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ARABIC_DIACRITICS_RE.test(ch)) continue;
    normToOrig.push(i);
    normText += normalizeArabicChar(ch);
  }
  const idx = normText.indexOf(normQuery);
  if (idx === -1) return null;
  const start = normToOrig[idx];
  const end = idx + normQuery.length < normToOrig.length
    ? normToOrig[idx + normQuery.length]
    : str.length;
  return { start, end, normIndex: idx };
}

/**
 * @param {string} text
 * @param {string} rawQuery
 * @returns {Array<{ text: string, highlighted: boolean }>}
 */
export function splitHighlightSegments(text, rawQuery) {
  const str = String(text || '');
  const match = findNormalizedMatchRange(str, rawQuery);
  if (!match) {
    return str ? [{ text: str, highlighted: false }] : [];
  }
  /** @type {Array<{ text: string, highlighted: boolean }>} */
  const parts = [];
  if (match.start > 0) {
    parts.push({ text: str.slice(0, match.start), highlighted: false });
  }
  parts.push({ text: str.slice(match.start, match.end), highlighted: true });
  if (match.end < str.length) {
    parts.push({ text: str.slice(match.end), highlighted: false });
  }
  return parts;
}

/**
 * @template {Pick<StoryItem, 'id' | 'title' | 'category' | 'date' | 'views'>} T
 * @param {T[]} stories
 * @param {T[]} popular
 * @param {string} rawQuery
 * @param {number} [maxResults]
 * @returns {{ results: Array<{ item: T, matchPos: number }>, totalMatched: number }}
 */
export function searchStoriesPool(stories, popular, rawQuery, maxResults = 8) {
  const normQuery = normalizeArabicSearchText((rawQuery || '').trim());
  const seen = new Set();
  /** @type {T[]} */
  const pool = [];
  for (const item of stories.concat(popular)) {
    const key = item.id || item.title;
    if (seen.has(key) || seen.has(item.title)) continue;
    seen.add(key);
    seen.add(item.title);
    pool.push(item);
  }

  if (!normQuery) {
    return { results: [], totalMatched: 0 };
  }

  /** @type {Array<{ item: T, matchPos: number }>} */
  const matched = [];
  for (const item of pool) {
    const titleMatch = findNormalizedMatchRange(item.title, normQuery);
    const catMatch = findNormalizedMatchRange(item.category, normQuery);
    if (!titleMatch && !catMatch) continue;
    const matchPos = titleMatch ? titleMatch.normIndex : 10000 + (catMatch ? catMatch.normIndex : 0);
    matched.push({ item, matchPos });
  }

  matched.sort((a, b) => {
    if (a.matchPos !== b.matchPos) return a.matchPos - b.matchPos;
    return (b.item.date || '').localeCompare(a.item.date || '');
  });

  return {
    results: matched.slice(0, maxResults),
    totalMatched: matched.length,
  };
}

/**
 * @param {string[]} history
 * @param {string} rawQuery
 * @param {number} [maxItems]
 * @returns {string[]}
 */
export function addRecentSearchQuery(history, rawQuery, maxItems = 5) {
  const q = (rawQuery || '').trim();
  if (!q) return history.slice(0, maxItems);
  const normQ = normalizeArabicSearchText(q);
  const next = [q];
  for (const item of history) {
    const trimmed = (item || '').trim();
    if (!trimmed) continue;
    if (trimmed === q || normalizeArabicSearchText(trimmed) === normQ) continue;
    next.push(trimmed);
    if (next.length >= maxItems) break;
  }
  return next;
}

/**
 * @param {number} count
 * @returns {string}
 */
export function formatSearchResultCountLabel(count) {
  if (count === 1) return '1 نتيجة';
  if (count >= 2 && count <= 10) return `${count} نتائج`;
  return `${count} نتيجة`;
}
