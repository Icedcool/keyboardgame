// Web Audio synthesized tones. Used for celebration "ding" (sticker unlock,
// mini-game success) and the gentle "try again" buzz.

let ctx = null;

function getCtx() {
  if (ctx) return ctx;
  const C = window.AudioContext || window.webkitAudioContext;
  if (!C) return null;
  try {
    ctx = new C();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq, duration, opts = {}) {
  const audio = getCtx();
  if (!audio) return;
  if (audio.state === 'suspended') {
    audio.resume?.().catch(() => {});
  }
  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = opts.type || 'sine';
  osc.frequency.setValueAtTime(freq, now);
  if (opts.freqTo) {
    osc.frequency.exponentialRampToValueAtTime(opts.freqTo, now + duration);
  }
  const vol = opts.volume ?? 0.25;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(vol, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain).connect(audio.destination);
  osc.start(now);
  osc.stop(now + duration + 0.05);
}

/** Celebration: happy two-note chime. Used on sticker unlock + mini-game wins. */
export function ding() {
  tone(880, 0.18, { type: 'triangle', volume: 0.22 });
  setTimeout(() => tone(1320, 0.22, { type: 'triangle', volume: 0.2 }), 90);
}

/** Bigger celebration: arpeggio for mini-game streak. */
export function fanfare() {
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, C
  notes.forEach((f, i) => setTimeout(() => tone(f, 0.18, { type: 'triangle', volume: 0.2 }), i * 90));
}

/** Gentle "try again" — soft descending blip, not punishing. */
export function buzz() {
  tone(440, 0.18, { type: 'sine', freqTo: 280, volume: 0.16 });
}

/** Resume the audio context — call on first user gesture. */
export function unlock() {
  const audio = getCtx();
  if (!audio) return;
  if (audio.state === 'suspended') {
    audio.resume?.().catch(() => {});
  }
}
