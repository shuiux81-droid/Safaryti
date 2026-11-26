import { CONFIG } from '../config.js';
import { esc } from '../utils.js';
import {
  normalizeArabicSearchText,
  findNormalizedMatchRange,
  formatSearchResultCountLabel,
} from '../safarytiLogic.js';

export const SEARCH_HISTORY_KEY = 'safaryti_recent_searches';
export const SEARCH_REGIONS = CONFIG.regions.map((r) => r.shortName || r.name);

export function getAllCatalog() {
  const map = Object.create(null);
  const merged = [];
  CONFIG.stories.concat(CONFIG.picks, CONFIG.popular).forEach((item) => {
    if (!map[item.title]) {
      map[item.title] = true;
      merged.push(item);
    }
  });
  merged.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return merged;
}

export function normalizeSearchText(str) {
  return normalizeArabicSearchText(str);
}

export function findSearchMatchRange(text, rawQuery) {
  return findNormalizedMatchRange(text, String(rawQuery || ''));
}

export function highlightSearchTitle(title, rawQuery) {
  const str = String(title || '');
  const match = findSearchMatchRange(str, rawQuery);
  if (!match) return esc(str);
  return (
    esc(str.slice(0, match.start)) +
    '<mark>' +
    esc(str.slice(match.start, match.end)) +
    '</mark>' +
    esc(str.slice(match.end))
  );
}

export function loadRecentSearches() {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => typeof x === 'string' && x.trim()).slice(0, 5);
  } catch (_e) {
    return [];
  }
}

export function saveRecentSearch(rawQuery) {
  const q = String(rawQuery || '').trim();
  if (!q) return;
  try {
    const existing = loadRecentSearches();
    const normQ = normalizeSearchText(q);
    const next = [q];
    for (let i = 0; i < existing.length; i++) {
      const item = existing[i].trim();
      if (!item) continue;
      if (item === q || normalizeSearchText(item) === normQ) continue;
      next.push(item);
      if (next.length >= 5) break;
    }
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
  } catch (_e) {}
}

export function clearRecentSearches() {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (_e) {}
}

export function getSearchPool() {
  const pool = CONFIG.stories.concat(CONFIG.popular);
  const seen = Object.create(null);
  const deduped = [];
  for (let i = 0; i < pool.length; i++) {
    const item = pool[i];
    const key = item.id || item.title;
    if (seen[key] || seen[item.title]) continue;
    seen[key] = true;
    seen[item.title] = true;
    deduped.push(item);
  }
  return deduped;
}

export function formatSearchCountText(count) {
  return formatSearchResultCountLabel(count);
}
