// Speech-synthesis wrapper. Promise-based, preferred-voice selection,
// cancel-all-on-new-keypress.
//
// Browsers vary wildly. We pick the warmest English voice we can find and
// fall back to the system default. Voices may load asynchronously, so we
// listen for `voiceschanged` and re-pick.

const PREFERRED_VOICES = [
  // macOS Safari
  'Samantha', 'Karen', 'Moira', 'Tessa', 'Allison',
  // Chrome (Google)
  'Google US English', 'Google UK English Female',
  // Windows
  'Microsoft Aria Online (Natural)', 'Microsoft Jenny Online (Natural)',
  'Microsoft Zira', 'Microsoft Hazel',
];

let chosenVoice = null;
let voicesReady = false;
let synth = null;

function refreshVoice() {
  if (!synth) return;
  const voices = synth.getVoices() || [];
  if (voices.length === 0) return;
  voicesReady = true;
  for (const name of PREFERRED_VOICES) {
    const v = voices.find((v) => v.name === name);
    if (v) {
      chosenVoice = v;
      console.log(`[tts] using preferred voice: ${v.name} (${v.lang})`);
      return;
    }
  }
  // Fallback: any en-* voice.
  const en = voices.find((v) => /^en[-_]/i.test(v.lang));
  if (en) {
    chosenVoice = en;
    console.log(`[tts] using fallback voice: ${en.name} (${en.lang})`);
    return;
  }
  // Last resort: whatever's first.
  chosenVoice = voices[0];
  console.log(`[tts] using default voice: ${chosenVoice.name} (${chosenVoice.lang})`);
}

export function init() {
  if (typeof window === 'undefined') return;
  if (!('speechSynthesis' in window)) {
    console.warn('[tts] SpeechSynthesis not supported in this browser');
    return;
  }
  synth = window.speechSynthesis;
  refreshVoice();
  synth.addEventListener?.('voiceschanged', refreshVoice);
  // Some Chrome builds need a re-poke.
  setTimeout(refreshVoice, 250);
}

export function cancelAll() {
  if (!synth) return;
  try {
    synth.cancel();
  } catch {
    /* ignore */
  }
}

/**
 * Speak `text`. Returns a promise that resolves when speech ends (or is
 * cancelled). Options: { rate, pitch, volume }.
 */
export function speak(text, opts = {}) {
  return new Promise((resolve) => {
    if (!synth) return resolve();
    if (!text) return resolve();
    const u = new SpeechSynthesisUtterance(String(text));
    if (chosenVoice) u.voice = chosenVoice;
    u.lang = chosenVoice?.lang || 'en-US';
    u.rate = opts.rate ?? 0.95;
    u.pitch = opts.pitch ?? 1.1;
    u.volume = opts.volume ?? 1.0;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    u.onend = finish;
    u.onerror = finish;
    try {
      synth.speak(u);
    } catch {
      finish();
    }
    // Safety: some browsers swallow onend if interrupted before start.
    setTimeout(finish, 6000);
  });
}

export function isReady() {
  return voicesReady;
}

// Some voices (macOS Samantha, certain Microsoft voices) announce uppercase
// single letters as "capital K". Lowercasing produces the plain letter-name
// pronunciation everywhere.
export function speakLetter(letter, opts) {
  return speak(String(letter || '').toLowerCase(), opts);
}
