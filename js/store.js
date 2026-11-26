/**
 * Tiny observable store and route cleanup registry.
 */

const state = {
  currentView: 'home',
  route: { view: 'home', param: '' },
  activeSceneIndex: -1,
  dropdownOpen: false,
  menuOpen: false,
  aboutTravelerMetrics: null,
};

const listeners = new Set();
const cleanups = [];

export function getState() {
  return state;
}

export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach((fn) => {
    try {
      fn(state);
    } catch (_e) {}
  });
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function registerCleanup(fn) {
  if (typeof fn === 'function') {
    cleanups.push(fn);
  }
}

export function runCleanups() {
  while (cleanups.length) {
    const fn = cleanups.pop();
    try {
      fn();
    } catch (_e) {}
  }
}
