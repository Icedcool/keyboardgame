// Persistent game state. localStorage-backed with an in-memory fallback
// for private browsing or disabled storage.

const KEY = 'animalkeys/v1';

const defaults = () => ({
  seen: {},        // "<world>:<slug>" -> true
  lastWorld: null, // "jungle" | "ocean" | "farm" | null
});

let cache = defaults();
let storageAvailable = true;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw);
    return {
      seen: (parsed && typeof parsed.seen === 'object' && parsed.seen) || {},
      lastWorld: (parsed && parsed.lastWorld) || null,
    };
  } catch {
    storageAvailable = false;
    return defaults();
  }
}

function persist() {
  if (!storageAvailable) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    storageAvailable = false;
  }
}

export function init() {
  cache = load();
}

export function hasSeen(world, slug) {
  return !!cache.seen[`${world}:${slug}`];
}

/** Returns true if this was the first time seeing the animal in this world. */
export function markSeen(world, slug) {
  const key = `${world}:${slug}`;
  if (cache.seen[key]) return false;
  cache.seen[key] = true;
  persist();
  return true;
}

export function getLastWorld() {
  return cache.lastWorld;
}

export function setLastWorld(world) {
  if (cache.lastWorld === world) return;
  cache.lastWorld = world;
  persist();
}

export function countSeen() {
  return Object.keys(cache.seen).length;
}

export function reset() {
  cache = defaults();
  if (storageAvailable) {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }
}
