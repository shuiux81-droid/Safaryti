import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clamp,
  computeHeaderLogoScale,
  computeExpandClipInset,
  computeRegionSceneState,
  formatArabicDate,
  formatViews,
  validateContactForm,
  buildPaginationRange,
  buildCompactPaginationItems,
  paginateList,
  parseHashRoute,
  getSideRailWidth,
  shouldShowSideRails,
  getAdSlotDimensions,
  mulberry32,
  contourPath,
  buildHeroRoutePath,
  buildRulerPath,
  formatPickRegionTag,
  computeCoverflowCardState,
  stepCoverflowIndex,
  isCoverflowWrapJump,
  resolveCoverflowSwipeDelta,
  resolvePicksSectionMode,
  computeAboutScatterState,
  computeAboutClosingClip,
  easeInOutQuad,
  computeAboutFlightProgress,
  computeAboutTravelerFrame,
  REGION_GLOBE_TARGETS,
  isCountryInRegion,
  interpolateGlobeRotation,
  computeRevealDelayMs,
  resolveCategoryNavGroup,
  resolveCategoryChildSlug,
  selectTripPlanningStories,
  selectTravelSafetyStories,
  filterTipsStories,
  cubicBezierEase,
  findRegionForIsoId,
  computeRegionSharePercent,
  classifyGlobePointerAction,
  getDiscoverStoriesForRegion,
  DISCOVER_REGION_ORDER,
  stepDiscoverIndex,
  resolveDiscoverSwipeDelta,
  getDiscoverRealStories,
  filterCultureStories,
  getCultureMoreHref,
  getCultureThemeLabel,
  buildArticleShareUrls,
  buildArticleHeroMeta,
  slugifyArticleHeading,
  buildArticleTocModel,
  computeReadingProgressRatio,
  computeAsidePinnedHasMore,
  computeAsideNearestScrollTop,
  computeArticleStickyAsideTop,
  ARAB_PHONE_COUNTRIES,
  getMessageCounterState,
  normalizeArabicSearchText,
  findNormalizedMatchRange,
  splitHighlightSegments,
  searchStoriesPool,
  addRecentSearchQuery,
  formatSearchResultCountLabel,
} from './safarytiLogic.js';

test('header logo scale remains fixed at scrolled default size (1) across scroll positions', () => {
  assert.equal(computeHeaderLogoScale(0, true), 1);
  assert.equal(computeHeaderLogoScale(160, true), 1);
  assert.equal(computeHeaderLogoScale(300, true), 1);
  assert.equal(computeHeaderLogoScale(0, false), 1);
});

test('expanding image clip-path hits exact 14vh/30vw/40px at start and 0 at end on 1440x900', () => {
  const start = computeExpandClipInset(1000, 1000, 1980, 900, false);
  assert.equal(start.vInsetVh, 14);
  assert.equal(start.hInsetVw, 30);
  assert.equal(start.radiusPx, 40);
  assert.equal(start.marqueeOpacity, 1);
  assert.equal(start.overlayOpacity, 0);

  const end = computeExpandClipInset(2080, 1000, 1980, 900, false);
  assert.equal(end.vInsetVh, 0);
  assert.equal(end.hInsetVw, 0);
  assert.equal(end.radiusPx, 0);
  assert.equal(end.marqueeOpacity, 0);
  assert.equal(end.overlayOpacity, 1);
});

test('region scenes select Asia at 0.00 and North America (index 3) at 0.50', () => {
  const start = computeRegionSceneState(0, 0, 4680, 900, 6);
  assert.equal(start.activeIndex, 0);
  assert.equal(start.hideHint, false);

  const mid = computeRegionSceneState(1890, 0, 4680, 900, 6);
  assert.equal(mid.progress, 0.5);
  assert.equal(mid.activeIndex, 3);
  assert.equal(mid.hideHint, true);
  assert.deepEqual(mid.segmentFills, [100, 100, 100, 0, 0, 0]);
});

test('contact form validation requires name, phone, and message, and validates optional email when filled', () => {
  const emptyErrors = validateContactForm({ name: '', phone: '', email: '', message: '' });
  assert.equal(Object.keys(emptyErrors).length, 3);
  assert.equal(emptyErrors.name, 'هذا الحقل مطلوب');
  assert.equal(emptyErrors.phone, 'هذا الحقل مطلوب');
  assert.equal(emptyErrors.message, 'هذا الحقل مطلوب');
  assert.equal(emptyErrors.email, undefined);

  const badEmail = validateContactForm({
    name: 'أحمد',
    phone: '01012345678',
    email: 'invalid-email',
    message: 'مرحبا',
  });
  assert.equal(Object.keys(badEmail).length, 1);
  assert.equal(badEmail.email, 'أدخل بريدًا إلكترونيًا صحيحًا');

  const validWithoutEmail = validateContactForm({
    name: 'أحمد',
    phone: '01012345678',
    email: '',
    message: 'استفسار عن السفر',
  });
  assert.equal(Object.keys(validWithoutEmail).length, 0);

  const validWithEmail = validateContactForm({
    name: 'أحمد',
    phone: '01012345678',
    email: 'ahmed@example.com',
    message: 'استفسار عن السفر',
  });
  assert.equal(Object.keys(validWithEmail).length, 0);
});

test('hash router maps known views and falls back unknown to home', () => {
  assert.deepEqual(parseHashRoute(''), { view: 'home', param: '' });
  assert.deepEqual(parseHashRoute('#article'), { view: 'article', param: '' });
  assert.deepEqual(parseHashRoute('#category/إفريقيا'), { view: 'category', param: 'إفريقيا' });
  assert.deepEqual(parseHashRoute('#discover'), { view: 'discover', param: '' });
  assert.deepEqual(parseHashRoute('#culture'), { view: 'culture', param: '' });
  assert.deepEqual(parseHashRoute('#search'), { view: 'search', param: '' });
  assert.deepEqual(parseHashRoute('#search/اسيا'), { view: 'search', param: 'اسيا' });
  assert.deepEqual(parseHashRoute('#unknown-page'), { view: 'home', param: '' });
});

test('formatting and pagination helpers behave deterministically', () => {
  assert.equal(clamp(1.5, 0, 1), 1);
  assert.match(formatArabicDate('2026-11-16'), /2026/);
  assert.equal(formatViews(6348), '6,348 مشاهدة');
  assert.deepEqual(buildPaginationRange(1, 3), [1, 2, 3]);
  assert.deepEqual(buildPaginationRange(5, 10), [1, '...', 4, 5, 6, '...', 10]);

  const sample13 = Array.from({ length: 13 }, (_, i) => i + 1);
  assert.deepEqual(paginateList(sample13, 1, 5), { items: [1, 2, 3, 4, 5], page: 1, totalPages: 3 });
  assert.deepEqual(paginateList(sample13, 2, 5), { items: [6, 7, 8, 9, 10], page: 2, totalPages: 3 });
  assert.deepEqual(paginateList(sample13, 3, 5), { items: [11, 12, 13], page: 3, totalPages: 3 });
  assert.deepEqual(paginateList(sample13, 99, 5), { items: [11, 12, 13], page: 3, totalPages: 3 });
  assert.deepEqual(paginateList([], 1, 5), { items: [], page: 1, totalPages: 1 });
});

test('side rails and ad slot dimensions match updated §3 and §4 specs', () => {
  assert.equal(shouldShowSideRails(1440), true);
  assert.equal(shouldShowSideRails(1280), true);
  assert.equal(shouldShowSideRails(1024), true);
  assert.equal(shouldShowSideRails(768), true);
  assert.equal(shouldShowSideRails(767), false);

  assert.equal(getSideRailWidth(1440), 160);
  assert.equal(getSideRailWidth(1280), 140);
  assert.equal(getSideRailWidth(1024), 112);
  assert.equal(getSideRailWidth(768), 96);
  assert.equal(getSideRailWidth(390), 0);

  assert.deepEqual(getAdSlotDimensions('AD-SKY-L', 1440, 900), { width: 160, height: 900, hidden: false });
  assert.deepEqual(getAdSlotDimensions('AD-SKY-R', 1280, 900), { width: 140, height: 900, hidden: false });
  assert.deepEqual(getAdSlotDimensions('AD-SKY-R', 1024, 900), { width: 112, height: 900, hidden: false });
  assert.deepEqual(getAdSlotDimensions('AD-SKY-R', 768, 900), { width: 96, height: 900, hidden: false });
  assert.deepEqual(getAdSlotDimensions('AD-SKY-R', 390, 900), { width: 160, height: 900, hidden: true });
  assert.deepEqual(getAdSlotDimensions('AD-STICKY', 390), { width: 250, height: 208 });
  assert.deepEqual(getAdSlotDimensions('AD-H1', 1440), { width: 300, height: 150 });
  assert.deepEqual(getAdSlotDimensions('AD-H2', 1440), { width: 300, height: 250 });
  assert.deepEqual(getAdSlotDimensions('AD-H2', 390), { width: 300, height: 250 });
  assert.deepEqual(getAdSlotDimensions('AD-H3', 1024), { width: 728, height: 90, hidden: false });
  assert.deepEqual(getAdSlotDimensions('AD-H3', 1023), { width: 728, height: 90, hidden: true });
  assert.deepEqual(getAdSlotDimensions('AD-SB-HALF', 1440), { width: 300, height: 600 });
  assert.deepEqual(getAdSlotDimensions('AD-SB-HALF', 390), { width: 300, height: 250 });
  assert.deepEqual(getAdSlotDimensions('AD-TB', 1440), { width: 728, height: 90 });
  assert.deepEqual(getAdSlotDimensions('AD-TB', 390), { width: 320, height: 100 });
  assert.deepEqual(getAdSlotDimensions('AD-BB', 1440), { width: 970, height: 250 });
  assert.deepEqual(getAdSlotDimensions('AD-BB', 768), { width: 728, height: 90 });
  assert.deepEqual(getAdSlotDimensions('AD-BB', 390), { width: 336, height: 280 });
  assert.deepEqual(getAdSlotDimensions('AD-A1', 1440), { width: '100%', height: 280 });
  assert.deepEqual(getAdSlotDimensions('AD-A2', 1440), { width: '100%', height: 120 });
});

test('hero route and contour map math generates deterministic closed curves and rulers', () => {
  const r1 = mulberry32(7);
  const r2 = mulberry32(7);
  assert.equal(r1(), r2());
  assert.equal(r1(), r2());

  const dA = contourPath(1010, 70, 70, 42, -14, 0.08, 7);
  const dA2 = contourPath(1010, 70, 70, 42, -14, 0.08, 7);
  assert.equal(dA, dA2);
  assert.match(dA, /^M[\d.-]+,[\d.-]+/);
  assert.match(dA, /Z$/);
  assert.equal((dA.match(/ C/g) || []).length, 14);

  const route = buildHeroRoutePath(1120, 640);
  assert.match(route, /^M 1160\.0,604\.0 C /);
  assert.match(route, / -40,610\.0$/);

  const ruler = buildRulerPath(24, 96, 480, 12, -1);
  assert.match(ruler, /^M24\.0,96\.0 V576\.0/);
  assert.equal((ruler.match(/ h-13/g) || []).length, 5);
  assert.equal((ruler.match(/ h-9/g) || []).length, 4);
  assert.equal((ruler.match(/ h-5/g) || []).length, 32);
});

test('traveler picks cover-flow helpers compute circular ring distances, infinite wrap, and RTL swipe', () => {
  assert.equal(formatPickRegionTag('أمريكا الجنوبية || القارة اللاتينية'), 'أمريكا الجنوبية');
  assert.equal(formatPickRegionTag('أستراليا (أوقيانوسيا)'), 'أستراليا');
  assert.equal(formatPickRegionTag('إفريقيا'), 'إفريقيا');

  assert.deepEqual(computeCoverflowCardState(0, 0, 1440, 9), {
    distance: 0,
    posClass: 'is-pos-0',
    visible: true,
    focusable: true,
    dimOpacity: 0,
  });
  assert.deepEqual(computeCoverflowCardState(1, 0, 1440, 9), {
    distance: 1,
    posClass: 'is-pos-p1',
    visible: true,
    focusable: true,
    dimOpacity: 0.25,
  });
  assert.deepEqual(computeCoverflowCardState(8, 0, 1440, 9), {
    distance: -1,
    posClass: 'is-pos-m1',
    visible: true,
    focusable: true,
    dimOpacity: 0.25,
  });
  assert.deepEqual(computeCoverflowCardState(7, 0, 1440, 9), {
    distance: -2,
    posClass: 'is-pos-m2',
    visible: true,
    focusable: true,
    dimOpacity: 0.4,
  });
  assert.deepEqual(computeCoverflowCardState(4, 0, 1440, 9), {
    distance: 4,
    posClass: 'is-pos-hidden-p',
    visible: false,
    focusable: false,
    dimOpacity: 0.4,
  });
  assert.deepEqual(computeCoverflowCardState(5, 0, 1440, 9), {
    distance: -4,
    posClass: 'is-pos-hidden-m',
    visible: false,
    focusable: false,
    dimOpacity: 0.4,
  });

  assert.equal(computeCoverflowCardState(0, 0, 390, 9).visible, true);
  assert.equal(computeCoverflowCardState(1, 0, 390, 9).visible, true);
  assert.equal(computeCoverflowCardState(8, 0, 390, 9).visible, true);
  assert.equal(computeCoverflowCardState(2, 0, 390, 9).visible, false);
  assert.equal(computeCoverflowCardState(7, 0, 390, 9).focusable, false);

  assert.deepEqual(stepCoverflowIndex(0, -1, 9), { nextIndex: 8, prevDisabled: false, nextDisabled: false });
  assert.deepEqual(stepCoverflowIndex(8, 1, 9), { nextIndex: 0, prevDisabled: false, nextDisabled: false });
  assert.deepEqual(stepCoverflowIndex(0, 1, 9), { nextIndex: 1, prevDisabled: false, nextDisabled: false });

  assert.equal(isCoverflowWrapJump(-4, 4, 9), true);
  assert.equal(isCoverflowWrapJump(4, -4, 9), true);
  assert.equal(isCoverflowWrapJump(-2, 2, 5), true);
  assert.equal(isCoverflowWrapJump(2, -2, 5), true);
  assert.equal(isCoverflowWrapJump(2, 1, 5), false);
  assert.equal(isCoverflowWrapJump(null, -2, 5), false);
  assert.deepEqual(stepCoverflowIndex(4, 1, 5), { nextIndex: 0, prevDisabled: false, nextDisabled: false });
  assert.deepEqual(stepCoverflowIndex(0, -1, 5), { nextIndex: 4, prevDisabled: false, nextDisabled: false });

  assert.equal(resolveCoverflowSwipeDelta(64, 10), 1);
  assert.equal(resolveCoverflowSwipeDelta(-64, 10), -1);
  assert.equal(resolveCoverflowSwipeDelta(30, 5), 0);
  assert.equal(resolveCoverflowSwipeDelta(60, 80), 0);

  assert.deepEqual(resolvePicksSectionMode(390), {
    mode: 'row',
    cardCount: 9,
    listRole: 'region',
    cardRole: null,
    showControls: false,
  });
  assert.deepEqual(resolvePicksSectionMode(767), {
    mode: 'row',
    cardCount: 9,
    listRole: 'region',
    cardRole: null,
    showControls: false,
  });
  assert.deepEqual(resolvePicksSectionMode(768), {
    mode: 'coverflow',
    cardCount: 5,
    listRole: 'region',
    cardRole: null,
    showControls: true,
  });
  assert.deepEqual(resolvePicksSectionMode(1440), {
    mode: 'coverflow',
    cardCount: 5,
    listRole: 'region',
    cardRole: null,
    showControls: true,
  });
});

test('about scatter parallax and statement fade calculate exact bounds at p = 0, 0.15, 0.45, 0.5, and 1', () => {
  const s0 = computeAboutScatterState(200, 200, 1980, 900);
  assert.equal(s0.p, 0);
  assert.equal(s0.tileA.translateYVh, 17.5);
  assert.equal(s0.tileB.translateYVh, -22.5);
  assert.equal(s0.tileC.translateYVh, 10);
  assert.equal(s0.tileA.outwardRem, 0);
  assert.equal(s0.copyOpacity, 0);
  assert.equal(s0.copyTranslateYPx, 24);

  const sMid = computeAboutScatterState(740, 200, 1980, 900);
  assert.equal(sMid.p, 0.5);
  assert.equal(sMid.tileA.translateYVh, 0);
  assert.equal(sMid.tileB.translateYVh, 0);
  assert.equal(sMid.tileC.translateYVh, 0);
  assert.equal(sMid.tileA.outwardRem, 1.5);
  assert.equal(sMid.tileB.outwardRem, 1.5);
  assert.equal(sMid.copyOpacity, 1);
  assert.equal(sMid.copyTranslateYPx, 0);

  const sEnd = computeAboutScatterState(1280, 200, 1980, 900);
  assert.equal(sEnd.p, 1);
  assert.equal(sEnd.tileA.translateYVh, -17.5);
  assert.equal(sEnd.tileB.translateYVh, 22.5);
  assert.equal(sEnd.tileC.translateYVh, -10);
  assert.equal(sEnd.tileA.outwardRem, 3);
  assert.equal(sEnd.tileB.outwardRem, 3);
});

test('about closing clip-path expands from inset(10vh 8vw round 2.5rem) to inset(0) over first 60% entry', () => {
  assert.deepEqual(computeAboutClosingClip(900, 900), { vInsetVh: 10, hInsetVw: 8, radiusRem: 2.5 });
  assert.deepEqual(computeAboutClosingClip(630, 900), { vInsetVh: 5, hInsetVw: 4, radiusRem: 1.25 });
  assert.deepEqual(computeAboutClosingClip(360, 900), { vInsetVh: 0, hInsetVw: 0, radiusRem: 0 });
  assert.deepEqual(computeAboutClosingClip(0, 900), { vInsetVh: 0, hInsetVw: 0, radiusRem: 0 });
});

test('about scroll-linked flight progress, continuity at p=0.45, corridor routing, and exact landing at p=1', () => {
  assert.equal(computeAboutFlightProgress(0, 592, 1530, 900, 720, 0.65), 0);
  assert.equal(computeAboutFlightProgress(592, 592, 1530, 900, 720, 0.65), 0);
  assert.equal(computeAboutFlightProgress(592 + 1395, 592, 1530, 900, 720, 0.65), 1);

  assert.equal(easeInOutQuad(0), 0);
  assert.equal(easeInOutQuad(0.5), 0.5);
  assert.equal(easeInOutQuad(1), 1);

  const startRect = { left: 16, top: 210, width: 384, height: 480 };
  const targetRect = { left: 176, top: 334, width: 352, height: 440 };

  const f0 = computeAboutTravelerFrame({ p: 0, stageTop: 640, startRect, targetRect, driftYAt0: -90 });
  assert.equal(f0.x, 16);
  assert.equal(f0.y, 640 + 210 - 90);
  assert.equal(f0.s, 1);
  assert.equal(f0.handedOff, false);

  const fPhase1End = computeAboutTravelerFrame({ p: 0.45, stageTop: 0, startRect, targetRect, driftYAt0: -90 });
  assert.deepEqual(fPhase1End, { x: 16, y: 210, s: 1, t: 0, handedOff: false });

  const fMid = computeAboutTravelerFrame({ p: 0.725, stageTop: 0, startRect, targetRect });
  assert.equal(fMid.x, 16);
  assert.equal(fMid.t, 0.5);
  assert.equal(fMid.y, 272);
  assert.equal(fMid.handedOff, false);

  const fEnd = computeAboutTravelerFrame({ p: 1, stageTop: 0, startRect, targetRect });
  assert.equal(fEnd.x, targetRect.left);
  assert.equal(fEnd.y, targetRect.top);
  assert.equal(fEnd.s, Number((352 / 384).toFixed(6)));
  assert.equal(fEnd.t, 1);
  assert.equal(fEnd.handedOff, true);
});

test('discover globe region targets map countries accurately and interpolate shortest longitude', () => {
  assert.equal(Object.keys(REGION_GLOBE_TARGETS).length, 6);
  assert.equal(isCountryInRegion('818', 'africa'), true);
  assert.equal(isCountryInRegion(392, 'asia'), true);
  assert.equal(isCountryInRegion('250', 'europe'), true);
  assert.equal(isCountryInRegion(840, 'north-america'), true);
  assert.equal(isCountryInRegion('076', 'south-america'), true);
  assert.equal(isCountryInRegion(36, 'australia'), true);
  assert.equal(isCountryInRegion('818', 'asia'), false);

  const mid = interpolateGlobeRotation([170, 0, 0], [-170, 20, 0], 1);
  assert.deepEqual(mid, [190, 20, 0]);
  const start = interpolateGlobeRotation([-25, -18, 0], [-95, -34, 0], 0);
  assert.deepEqual(start, [-25, -18, 0]);
});

test('hub reveal stagger delay caps at 5 items (400ms max at 80ms step)', () => {
  assert.equal(computeRevealDelayMs(0), 0);
  assert.equal(computeRevealDelayMs(1), 80);
  assert.equal(computeRevealDelayMs(5), 400);
  assert.equal(computeRevealDelayMs(6), 400);
  assert.equal(computeRevealDelayMs(9), 400);
});

test('resolveCategoryNavGroup maps regions, themes, tips, trip-planning, and rejects unknown slugs', () => {
  assert.equal(resolveCategoryNavGroup('africa'), 'africa');
  assert.equal(resolveCategoryNavGroup('asia'), 'asia');
  assert.equal(resolveCategoryNavGroup('australia'), 'discover');
  assert.equal(resolveCategoryNavGroup('أستراليا'), 'discover');
  assert.equal(resolveCategoryNavGroup('europe'), 'discover');
  assert.equal(resolveCategoryNavGroup('north-america'), 'discover');
  assert.equal(resolveCategoryNavGroup('south-america'), 'discover');
  assert.equal(resolveCategoryNavGroup('إفريقيا'), 'africa');
  assert.equal(resolveCategoryNavGroup('آسيا'), 'asia');
  assert.equal(resolveCategoryNavGroup('food'), 'culture');
  assert.equal(resolveCategoryNavGroup('heritage'), 'culture');
  assert.equal(resolveCategoryNavGroup('المأكولات العالمية'), 'culture');
  assert.equal(resolveCategoryNavGroup('التراث والتقاليد'), 'culture');
  assert.equal(resolveCategoryNavGroup('tips'), 'tips');
  assert.equal(resolveCategoryNavGroup('نصائح السفر'), 'tips');
  assert.equal(resolveCategoryNavGroup('trip-planning'), 'tips');
  assert.equal(resolveCategoryNavGroup('تخطيط الرحلات والتنقل'), 'tips');
  assert.equal(resolveCategoryNavGroup('travel-safety'), 'tips');
  assert.equal(resolveCategoryNavGroup('الأمن والسلامة في السفر'), 'tips');
  assert.equal(resolveCategoryNavGroup('unknown-slug'), '');
  assert.equal(resolveCategoryNavGroup(''), '');

  assert.equal(resolveCategoryChildSlug('trip-planning'), 'trip-planning');
  assert.equal(resolveCategoryChildSlug('تخطيط الرحلات والتنقل'), 'trip-planning');
  assert.equal(resolveCategoryChildSlug('travel-safety'), 'travel-safety');
  assert.equal(resolveCategoryChildSlug('الأمن والسلامة في السفر'), 'travel-safety');
  assert.equal(resolveCategoryChildSlug('unknown-slug'), '');

  const fallbackResult = selectTripPlanningStories([
    { id: 'suez', category: 'إفريقيا' },
    { id: 'travel-safety', category: 'أمريكا الشمالية', isTip: true },
  ]);
  assert.deepEqual(fallbackResult.map((s) => s.id), ['travel-safety']);

  const subResult = selectTripPlanningStories([
    { id: 'travel-safety', category: 'أمريكا الشمالية', isTip: true, sub: 'travel-safety' },
    { id: 'flights-guide', category: 'نصائح السفر', isTip: true, sub: 'trip-planning' },
  ]);
  assert.deepEqual(subResult.map((s) => s.id), ['flights-guide']);

  const safetyResult = selectTravelSafetyStories([
    { id: 'travel-safety', category: 'أمريكا الشمالية', isTip: true, sub: 'travel-safety' },
    { id: 'flights-guide', category: 'نصائح السفر', isTip: true, sub: 'trip-planning' },
  ]);
  assert.deepEqual(safetyResult.map((s) => s.id), ['travel-safety']);

  const filteredTips = filterTipsStories([
    { id: 'suez', category: 'إفريقيا', date: '2026-11-16' },
    { id: 'plan-old', category: 'نصائح السفر', isTip: true, sub: 'trip-planning', date: '2024-08-01' },
    { id: 'plan-new', category: 'نصائح السفر', isTip: true, sub: 'trip-planning', date: '2024-10-18' },
    { id: 'safe-1', category: 'نصائح السفر', isTip: true, sub: 'travel-safety', date: '2024-10-05' },
  ], 'trip-planning', 6);
  assert.deepEqual(filteredTips.map((s) => s.id), ['plan-new', 'plan-old']);
});

test('discover helpers resolve region ISO hit-testing, share bars, pointer click vs drag, and cubic-bezier', () => {
  assert.equal(findRegionForIsoId(818), 'africa');
  assert.equal(findRegionForIsoId('392'), 'asia');
  assert.equal(findRegionForIsoId(999999), null);

  assert.equal(computeRegionSharePercent(265, 265), 100);
  assert.equal(computeRegionSharePercent(180, 265), 67.92);
  assert.equal(computeRegionSharePercent(12, 265), 4.53);

  assert.equal(classifyGlobePointerAction(0, 0), 'click');
  assert.equal(classifyGlobePointerAction(2, 3), 'click');
  assert.equal(classifyGlobePointerAction(3, 3), 'drag');
  assert.equal(classifyGlobePointerAction(4, 0), 'drag');

  assert.equal(cubicBezierEase(0), 0);
  assert.equal(cubicBezierEase(1), 1);
  assert.ok(cubicBezierEase(0.5) > 0.85);

  const africaStories = getDiscoverStoriesForRegion('africa', 'إفريقيا', [
    { id: 'older', title: 'قصة أقدم', category: 'إفريقيا', date: '2026-11-12', views: 100 },
    { id: 'newest-1', title: 'معالم السويس السياحية', category: 'إفريقيا', date: '2026-11-16', views: 6348 },
    { id: 'newest-2', title: 'السياحة العلاجية في مصر', category: 'إفريقيا', date: '2026-11-15', views: 5817 },
  ]);
  assert.equal(africaStories.length, 2);
  assert.equal(africaStories[0].title, 'معالم السويس السياحية');
  assert.equal(africaStories[0].isPlaceholder, false);

  const asiaStories = getDiscoverStoriesForRegion('asia', 'آسيا', [
    { id: 'newest-1', title: 'معالم السويس السياحية', category: 'إفريقيا', date: '2026-11-16', views: 6348 },
  ]);
  assert.equal(asiaStories.length, 2);
  assert.equal(asiaStories[0].isPlaceholder, true);
  assert.equal(asiaStories[1].isPlaceholder, true);
  assert.equal(asiaStories[0].href, '#category/asia');
});

test('discover carousel order, infinite loop wrap, RTL swipe, and real-only stories behave deterministically', () => {
  assert.deepEqual(DISCOVER_REGION_ORDER, [
    'asia',
    'africa',
    'europe',
    'north-america',
    'south-america',
    'australia',
  ]);

  assert.equal(stepDiscoverIndex(0, 1, 6), 1);
  assert.equal(stepDiscoverIndex(5, 1, 6), 0);
  assert.equal(stepDiscoverIndex(0, -1, 6), 5);
  assert.equal(stepDiscoverIndex(1, -1, 6), 0);

  assert.equal(resolveDiscoverSwipeDelta(60, 10), 1);
  assert.equal(resolveDiscoverSwipeDelta(-60, 10), -1);
  assert.equal(resolveDiscoverSwipeDelta(48, 0), 0);
  assert.equal(resolveDiscoverSwipeDelta(60, 65), 0);

  const africaReal = getDiscoverRealStories('إفريقيا', undefined, [
    { id: 's1', title: 'أقدم', category: 'إفريقيا', date: '2026-11-12', views: 10 },
    { id: 's2', title: 'أحدث ١', category: 'إفريقيا', date: '2026-11-16', views: 20 },
    { id: 's3', title: 'أحدث ٢', category: 'إفريقيا', date: '2026-11-15', views: 30 },
    { id: 's4', title: 'أحدث ٣', category: 'إفريقيا', date: '2026-11-14', views: 40 },
  ], 3);
  assert.equal(africaReal.length, 3);
  assert.deepEqual(africaReal.map((s) => s.title), ['أحدث ١', 'أحدث ٢', 'أحدث ٣']);
  assert.equal(africaReal.every((s) => s.isPlaceholder === false), true);

  const asiaReal = getDiscoverRealStories('آسيا', undefined, [
    { id: 's1', title: 'قصة إفريقيا', category: 'إفريقيا', date: '2026-11-16', views: 10 },
  ], 3);
  assert.equal(asiaReal.length, 0);

  const ausReal = getDiscoverRealStories('أستراليا (أوقيانوسيا)', 'أستراليا', [
    { id: 'a1', title: 'قصة أستراليا', category: 'أستراليا', date: '2026-11-16', views: 10 },
  ], 3);
  assert.equal(ausReal.length, 1);
});

test('culture latest stories merge, sort newest-first, filter by theme, exclude placeholders, and never pad', () => {
  /** @type {Array<{ id: string, title: string, category: string, theme?: 'food' | 'heritage', date: string, views: number, isCmsSlot?: boolean }>} */
  const seed = [
    { id: 'suez-landmarks', title: 'معالم السويس السياحية', category: 'إفريقيا', date: '2026-11-16', views: 6348 },
    { id: 'egyptian-food', title: 'تعرف على اشهر الاكلات الشعبية المصرية', category: 'المأكولات العالمية', theme: 'food', date: '2024-09-03', views: 28960 },
    { id: 'sudanese-food', title: 'اسماء أكلات سودانية مشهورة', category: 'المأكولات العالمية', theme: 'food', date: '2024-10-22', views: 33351 },
    { id: 'world-heritage', title: 'تعرف على الشعوب الغنية بالتراث والتقاليد حول العالم', category: 'التراث والتقاليد', theme: 'heritage', date: '2024-07-03', views: 14933 },
    { id: 'world-cuisines', title: 'اليك اشهر الماكولات في العالم', category: 'المأكولات العالمية', theme: 'food', date: '2024-09-19', views: 31965 },
    { id: 'fake-cms', title: 'قريبا', category: 'التراث والتقاليد', theme: 'heritage', date: '2025-01-01', views: 0, isCmsSlot: true },
  ];

  const merged = filterCultureStories(seed, 'all', 6);
  assert.equal(merged.length, 4);
  assert.deepEqual(
    merged.map((s) => s.id),
    ['sudanese-food', 'world-cuisines', 'egyptian-food', 'world-heritage']
  );

  const foodOnly = filterCultureStories(seed, 'food', 6);
  assert.equal(foodOnly.length, 3);
  assert.deepEqual(
    foodOnly.map((s) => s.id),
    ['sudanese-food', 'world-cuisines', 'egyptian-food']
  );

  const heritageOnly = filterCultureStories(seed, 'heritage', 6);
  assert.equal(heritageOnly.length, 1);
  assert.equal(heritageOnly[0].id, 'world-heritage');

  const capped = filterCultureStories(
    Array.from({ length: 8 }, (_, idx) => ({
      id: `f-${idx}`,
      theme: /** @type {'food'} */ ('food'),
      date: `2024-10-${String(10 + idx).padStart(2, '0')}`,
    })),
    'all',
    6
  );
  assert.equal(capped.length, 6);
  assert.equal(capped[0].id, 'f-7');

  assert.equal(getCultureMoreHref('all'), '#all-stories');
  assert.equal(getCultureMoreHref('food'), '#category/food');
  assert.equal(getCultureMoreHref('heritage'), '#category/heritage');
  assert.equal(getCultureThemeLabel('food'), 'المأكولات العالمية');
  assert.equal(getCultureThemeLabel('heritage'), 'التراث والتقاليد');
});

test('article hero meta orders published, optional updated, author, and formatted views; share URLs encode title and URL', () => {
  const withUpdate = buildArticleHeroMeta({
    date: '2026-11-16',
    updatedDate: '2026-11-20',
    author: { name: 'Toqa' },
    views: 14933,
  });
  assert.deepEqual(
    withUpdate.map((i) => i.kind),
    ['published', 'updated', 'author', 'views']
  );
  assert.equal(withUpdate[0].label, undefined);
  assert.equal(withUpdate[0].datetime, '2026-11-16');
  assert.ok(withUpdate[0].text.includes('2026'));
  assert.equal(withUpdate[0].srSuffix, 'تاريخ النشر');
  assert.equal(withUpdate[1].label, undefined);
  assert.equal(withUpdate[1].datetime, '2026-11-20');
  assert.equal(withUpdate[1].srSuffix, 'آخر تحديث');
  assert.equal(withUpdate[2].text, 'Toqa');
  assert.equal(withUpdate[3].text, '14,933');
  assert.equal(withUpdate[3].srSuffix, 'مشاهدة');

  const withoutUpdate = buildArticleHeroMeta({
    date: '2024-10-22',
    updatedDate: null,
    author: 'Toqa',
    views: 6348,
  });
  assert.deepEqual(
    withoutUpdate.map((i) => i.kind),
    ['published', 'author', 'views']
  );
  assert.equal(withoutUpdate[2].text, '6,348');

  const urls = buildArticleShareUrls('https://safaryti.com/#article/suez-landmarks', 'معالم السويس السياحية');
  assert.ok(urls.facebook.startsWith('https://www.facebook.com/sharer/sharer.php?u='));
  assert.ok(urls.x.includes('url=https%3A%2F%2Fsafaryti.com%2F%23article%2Fsuez-landmarks'));
  assert.ok(urls.x.includes('text=%D9%85%D8%B9%D8%A7%D9%84%D9%85'));
  assert.ok(urls.whatsapp.includes('%D9%85%D8%B9%D8%A7%D9%84%D9%85') && urls.whatsapp.includes('%20https%3A%2F%2F'));
});

test('article TOC builds stable heading slugs, 01-06 H2 indices with nested H3s, and hides when fewer than 3 headings', () => {
  const used = new Set();
  const s1 = slugifyArticleHeading('أين تقع محافظة السويس؟', used);
  const s2 = slugifyArticleHeading('أين تقع محافظة السويس؟', used);
  assert.equal(s1, 'sec-أين-تقع-محافظة-السويس');
  assert.equal(s2, 'sec-أين-تقع-محافظة-السويس-2');

  const suezToc = buildArticleTocModel({
    title: 'معالم السويس السياحية',
    sections: [
      { title: 'أين تقع محافظة السويس؟', subSections: [] },
      {
        title: 'أشهر المعالم السياحية في السويس',
        subSections: [
          { title: 'متحف السويس القومي' },
          { title: 'قناة السويس' },
          { title: 'الجزيرة الخضراء بخليج السويس' },
        ],
      },
      {
        title: 'أجمل المعالم الطبيعية والساحلية في محافظة السويس',
        subSections: [{ title: 'جبل عتاقة' }, { title: 'مدينة العين السخنة' }],
      },
      {
        title: 'أماكن قريبة من السويس تستحق الزيارة',
        subSections: [{ title: 'عيون موسى' }, { title: 'منطقة الزعفرانة' }],
      },
      { title: 'نصائح مهمة قبل زيارة السويس', subSections: [] },
    ],
    faqs: [{ q: 'سؤال', a: 'إجابة' }],
  });

  assert.equal(suezToc.shouldRender, true);
  assert.equal(suezToc.items.length, 6);
  assert.equal(suezToc.totalHeadings, 6);
  assert.equal(suezToc.visibleLimit, 4);
  assert.equal(suezToc.isScrollable, true);
  assert.deepEqual(
    suezToc.items.map((i) => i.indexLabel),
    ['01', '02', '03', '04', '05', '06']
  );
  assert.equal(suezToc.items[5].title, 'الأسئلة الشائعة حول معالم السويس السياحية');

  const shortToc = buildArticleTocModel({
    title: 'مقال قصير',
    sections: [
      { title: 'مقدمة', subSections: [{ title: 'فرعي' }] },
      { title: 'خاتمة', subSections: [] },
    ],
    faqs: [],
  });
  assert.equal(shortToc.totalHeadings, 2);
  assert.equal(shortToc.shouldRender, false);
  assert.equal(shortToc.isScrollable, false);

  assert.equal(computeReadingProgressRatio(0, 4000, 900), 0);
  assert.equal(computeReadingProgressRatio(1550, 4000, 900), 0.5);
  assert.equal(computeReadingProgressRatio(5000, 4000, 900), 1);
});

test('article aside-pinned fade mask and nearest-scroll respect bottom threshold and 3s manual lock', () => {
  assert.equal(computeAsidePinnedHasMore(0, 760, 2000), true);
  assert.equal(computeAsidePinnedHasMore(1237, 760, 2000), true);
  assert.equal(computeAsidePinnedHasMore(1238, 760, 2000), false);
  assert.equal(computeAsidePinnedHasMore(1240, 760, 2000), false);
  assert.equal(computeAsidePinnedHasMore(0, 760, 760), false);

  assert.equal(
    computeAsideNearestScrollTop({
      currentScrollTop: 100,
      itemTop: 200,
      itemBottom: 240,
      panelTop: 112,
      panelBottom: 876,
      nowMs: 10000,
      lastUserInteractionMs: 0,
    }),
    null
  );

  assert.equal(
    computeAsideNearestScrollTop({
      currentScrollTop: 300,
      itemTop: 40,
      itemBottom: 72,
      panelTop: 112,
      panelBottom: 876,
      nowMs: 10000,
      lastUserInteractionMs: 5000,
    }),
    220
  );

  assert.equal(
    computeAsideNearestScrollTop({
      currentScrollTop: 0,
      itemTop: 900,
      itemBottom: 940,
      panelTop: 112,
      panelBottom: 876,
      nowMs: 10000,
      lastUserInteractionMs: 0,
    }),
    72
  );

  assert.equal(
    computeAsideNearestScrollTop({
      currentScrollTop: 600,
      itemTop: 40,
      itemBottom: 72,
      panelTop: 112,
      panelBottom: 876,
      nowMs: 10000,
      lastUserInteractionMs: 7500,
    }),
    null
  );
});

test('article sticky aside pins at 112px (7rem), releases 1:1 at row-1 end, and falls back static on short/narrow viewports', () => {
  const before = computeArticleStickyAsideTop({
    viewportWidth: 1440,
    viewportHeight: 900,
    zoneTop: 420,
    zoneBottom: 3200,
    pinnedHeight: 788,
  });
  assert.deepEqual(before, { isStickyEnabled: true, top: 420, phase: 'before-pin' });

  const pinned = computeArticleStickyAsideTop({
    viewportWidth: 1440,
    viewportHeight: 900,
    zoneTop: -500,
    zoneBottom: 2280,
    pinnedHeight: 788,
  });
  assert.deepEqual(pinned, { isStickyEnabled: true, top: 112, phase: 'pinned' });

  const atEnd = computeArticleStickyAsideTop({
    viewportWidth: 1440,
    viewportHeight: 900,
    zoneTop: -1880,
    zoneBottom: 900,
    pinnedHeight: 788,
  });
  const after300 = computeArticleStickyAsideTop({
    viewportWidth: 1440,
    viewportHeight: 900,
    zoneTop: -2180,
    zoneBottom: 600,
    pinnedHeight: 788,
  });
  assert.equal(atEnd.top, 112);
  assert.equal(atEnd.top - after300.top, 300);
  assert.equal(after300.phase, 'released');

  assert.equal(
    computeArticleStickyAsideTop({
      viewportWidth: 1440,
      viewportHeight: 760,
      zoneTop: -200,
      zoneBottom: 1800,
      pinnedHeight: 788,
    }).phase,
    'static'
  );
  assert.equal(
    computeArticleStickyAsideTop({
      viewportWidth: 1023,
      viewportHeight: 900,
      zoneTop: -200,
      zoneBottom: 1800,
      pinnedHeight: 788,
    }).phase,
    'static'
  );
});

test('contact country selector defaults to Egypt (+20) with 15 Arab countries and message counter warns above 480 up to 500', () => {
  assert.equal(ARAB_PHONE_COUNTRIES.length, 15);
  assert.deepEqual(ARAB_PHONE_COUNTRIES[0], { iso: 'eg', name: 'مصر', dial: '+20' });
  assert.ok(ARAB_PHONE_COUNTRIES.some((c) => c.iso === 'sa' && c.dial === '+966'));
  assert.ok(ARAB_PHONE_COUNTRIES.some((c) => c.iso === 'sd' && c.dial === '+249'));

  assert.deepEqual(getMessageCounterState(''), { count: 0, max: 500, label: '0 / 500', isWarning: false });
  assert.deepEqual(getMessageCounterState('a'.repeat(480)), { count: 480, max: 500, label: '480 / 500', isWarning: false });
  assert.deepEqual(getMessageCounterState('a'.repeat(481)), { count: 481, max: 500, label: '481 / 500', isWarning: true });
  assert.deepEqual(getMessageCounterState('a'.repeat(550)), { count: 500, max: 500, label: '500 / 500', isWarning: true });
});

test('Arabic search normalization ignores diacritics, tatweel, and normalizes alef/yeh/teh-marbuta', () => {
  assert.equal(normalizeArabicSearchText('سوِيس'), 'سويس');
  assert.equal(normalizeArabicSearchText('سُـوَيْس'), 'سويس');
  assert.equal(normalizeArabicSearchText('أكلات إقليمية وآسيوية'), 'اكلات اقليميه واسيويه');
  assert.equal(normalizeArabicSearchText('مصرى'), 'مصري');

  const range = findNormalizedMatchRange('معالم السُويس السياحية', 'سويس');
  assert.ok(range !== null);
  assert.equal('معالم السُويس السياحية'.slice(range.start, range.end), 'سُويس');

  const segs = splitHighlightSegments('معالم السويس السياحية', 'السياحيه');
  assert.deepEqual(segs, [
    { text: 'معالم السويس ', highlighted: false },
    { text: 'السياحية', highlighted: true },
  ]);
});

test('searchStoriesPool deduplicates, matches title and category, sorts by match position then date, and caps at 8', () => {
  const stories = [
    { id: 'old-mid', title: 'رحلة إلى سويسرا', category: 'أوروبا', date: '2024-01-01', views: 100 },
    { id: 'new-start', title: 'سويس والبحر الأحمر', category: 'إفريقيا', date: '2026-11-16', views: 200 },
    { id: 'old-start', title: 'سويس القديمة', category: 'إفريقيا', date: '2025-01-01', views: 300 },
    { id: 'suez', title: 'معالم السويس السياحية', category: 'إفريقيا', date: '2026-11-16', views: 6348 },
    ...Array.from({ length: 8 }, (_, idx) => ({
      id: `af-${idx}`,
      title: `وجهة سياحية ${idx}`,
      category: 'إفريقيا',
      date: `2026-10-${String(10 + idx).padStart(2, '0')}`,
      views: 500 + idx,
    })),
  ];
  const popular = [
    { id: 'suez', title: 'معالم السويس السياحية', category: 'إفريقيا', date: '2026-11-16', views: 6348 },
    { id: 'pop-af', title: 'السياحة في الجزائر', category: 'إفريقيا', date: '2026-11-18', views: 9000 },
  ];

  const suezRes = searchStoriesPool(stories, popular, 'سوِيس', 8);
  assert.equal(suezRes.totalMatched, 4);
  assert.deepEqual(
    suezRes.results.map((r) => r.item.id),
    ['new-start', 'old-start', 'suez', 'old-mid']
  );

  const africaRes = searchStoriesPool(stories, popular, 'افريقيا', 8);
  assert.equal(africaRes.totalMatched, 12);
  assert.equal(africaRes.results.length, 8);
  assert.equal(africaRes.results[0].item.id, 'pop-af');

  assert.equal(formatSearchResultCountLabel(1), '1 نتيجة');
  assert.equal(formatSearchResultCountLabel(4), '4 نتائج');
  assert.equal(formatSearchResultCountLabel(12), '12 نتيجة');

  let hist = addRecentSearchQuery([], 'السويس');
  hist = addRecentSearchQuery(hist, 'آسيا');
  hist = addRecentSearchQuery(hist, 'اسيا');
  assert.deepEqual(hist, ['اسيا', 'السويس']);
  hist = addRecentSearchQuery(['1', '2', '3', '4', '5'], '6');
  assert.deepEqual(hist, ['6', '1', '2', '3', '4']);
});

test('compact discover pagination caps numeric buttons at 5 with ellipses around current ±1', () => {
  assert.deepEqual(buildCompactPaginationItems(1, 3), [1, 2, 3]);
  assert.deepEqual(buildCompactPaginationItems(2, 5), [1, 2, 3, 4, 5]);
  assert.deepEqual(buildCompactPaginationItems(1, 10), [1, 2, '...', 10]);
  assert.deepEqual(buildCompactPaginationItems(3, 10), [1, 2, 3, 4, '...', 10]);
  assert.deepEqual(buildCompactPaginationItems(5, 10), [1, '...', 4, 5, 6, '...', 10]);
  assert.deepEqual(buildCompactPaginationItems(8, 10), [1, '...', 7, 8, 9, 10]);
  assert.deepEqual(buildCompactPaginationItems(10, 10), [1, '...', 9, 10]);
  const numericOnly = buildCompactPaginationItems(6, 20).filter((item) => typeof item === 'number');
  assert.ok(numericOnly.length <= 5);
});
