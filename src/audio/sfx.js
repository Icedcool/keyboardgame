// Animal sound-effect player. Loads /sounds/<slug>.mp3 on demand; if the
// file is missing (404), fails silently — the catalog ships without SFX in
// v1 and the user drops in MP3s later when ready.

const cache = new Map(); // slug -> { audio, missing }
let current = null;

function load(slug) {
  if (cache.has(slug)) return cache.get(slug);
  const audio = new Audio(`./sounds/${slug}.mp3`);
  audio.preload = 'auto';
  const entry = { audio, missing: false };
  audio.addEventListener('error', () => {
    entry.missing = true;
  });
  cache.set(slug, entry);
  return entry;
}

export function stop() {
  if (current) {
    try {
      current.pause();
      current.currentTime = 0;
    } catch {
      /* ignore */
    }
    current = null;
  }
}

export function playAnimalSfx(slug) {
  const entry = load(slug);
  if (entry.missing) return;
  stop();
  try {
    entry.audio.currentTime = 0;
    const p = entry.audio.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
    current = entry.audio;
  } catch {
    /* ignore */
  }
}
