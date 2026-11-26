const HASHED_MAP_JSON = '__SAFARYTI_ASSET_MAP_JSON__';
const HASHED_MAP = HASHED_MAP_JSON.charAt(0) === '{' ? JSON.parse(HASHED_MAP_JSON) : null;
const PREFIXES = [
  ['src/assets/images/', '0/'],
  ['mobile/m/', '1/'],
  ['mobile/', '2/'],
  ['partners/', '3/'],
  ['assets/aistudio/', '4/'],
];

function decodeAssetVal(val, fullKey) {
  if (!val) return null;
  const c = val.charAt(0);
  if (c === '@') return val.slice(1);
  if (c === '=') return './assets/' + val.slice(1);
  const slash = fullKey.lastIndexOf('/');
  const origName = slash === -1 ? fullKey : fullKey.slice(slash + 1);
  const dot = origName.lastIndexOf('.');
  if (dot <= 0) return './assets/' + origName + '-' + val;
  return './assets/' + origName.slice(0, dot) + '-' + val + origName.slice(dot);
}

function lookupCompactKey(key) {
  if (HASHED_MAP[key]) return decodeAssetVal(HASHED_MAP[key], key);
  for (let i = 0; i < PREFIXES.length; i++) {
    const p = PREFIXES[i][0];
    if (key.indexOf(p) === 0) {
      const val = HASHED_MAP[PREFIXES[i][1] + key.slice(p.length)];
      if (val) return decodeAssetVal(val, key);
    }
  }
  return null;
}

export function resolveHashedAssetPath(relPath) {
  if (!HASHED_MAP || !relPath) return relPath;
  const s = String(relPath);
  const noQuery = s.split('?')[0].split('#')[0];
  const key = noQuery.replace(/^\.\//, '');
  const direct = lookupCompactKey(key);
  if (direct) return direct;
  const idx = key.search(/(?:src\/assets\/images|mobile|partners|assets\/aistudio|fonts)\//);
  if (idx > 0) {
    const subDirect = lookupCompactKey(key.slice(idx));
    if (subDirect) return subDirect;
  }
  return relPath;
}
