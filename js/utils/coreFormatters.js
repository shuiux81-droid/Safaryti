export function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

export function easeInOutQuad(p) {
  const t = clamp(p, 0, 1);
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function easeOutCubic(t) {
  const c = clamp(t, 0, 1);
  return 1 - Math.pow(1 - c, 3);
}

const ARABIC_DATE_FMT = new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const EN_NUMBER_FMT = new Intl.NumberFormat('en-US');
const ARABIC_DATE_CACHE = new Map();

export function formatArabicDate(isoDate) {
  const cached = ARABIC_DATE_CACHE.get(isoDate);
  if (cached !== undefined) return cached;
  const date = new Date(isoDate + 'T00:00:00');
  const out = Number.isNaN(date.getTime()) ? isoDate : ARABIC_DATE_FMT.format(date);
  if (ARABIC_DATE_CACHE.size < 256) ARABIC_DATE_CACHE.set(isoDate, out);
  return out;
}

export function formatViews(views) {
  return `${EN_NUMBER_FMT.format(views)} مشاهدة`;
}

export function formatEnNumber(n) {
  return EN_NUMBER_FMT.format(Number(n) || 0);
}
