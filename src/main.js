// Animal Keys — main entry.
// Hash router; bootstraps state, audio, and the initial route.

import './render/styles.css';
import * as state from './engine/state.js';
import * as keys from './engine/keys.js';
import * as tts from './audio/tts.js';
import * as beeps from './audio/beeps.js';
import { render as renderHome } from './ui/home.js';
import { render as renderWorld } from './ui/world.js';
import { render as renderSticker } from './ui/sticker.js';
import { renderFindLetter, renderFindAnimal } from './ui/minigame.js';
import { WORLDS } from './data/animals.js';

state.init();
tts.init();
keys.install();

const appEl = document.getElementById('app');
let current = null;

function navigate(hash) {
  if (location.hash === hash) {
    route();
  } else {
    location.hash = hash;
  }
}

function route() {
  // Reset/clear path support (works at both /reset and #/reset).
  const path = location.pathname || '';
  const hash = location.hash || '#/home';
  if (path.endsWith('/reset') || hash === '#/reset') {
    state.reset();
    location.replace('#/home');
    return;
  }

  // Teardown previous screen
  if (current?.teardown) {
    try { current.teardown(); } catch { /* ignore */ }
  }
  appEl.innerHTML = '';

  // Parse hash route
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  let screen;
  switch (parts[0]) {
    case '':
    case undefined:
    case 'home': {
      screen = renderHome(navigate);
      break;
    }
    case 'world': {
      const world = parts[1];
      if (!WORLDS.includes(world)) { navigate('#/home'); return; }
      screen = renderWorld(world, navigate);
      break;
    }
    case 'sticker': {
      screen = renderSticker(navigate);
      break;
    }
    case 'minigame': {
      const game = parts[1];
      const world = parts[2];
      if (game === 'find-letter') {
        screen = renderFindLetter(world, navigate);
      } else if (game === 'find-animal') {
        screen = renderFindAnimal(world, navigate);
      } else {
        navigate('#/home');
        return;
      }
      break;
    }
    default: {
      navigate('#/home');
      return;
    }
  }
  current = screen;
  appEl.appendChild(screen.el);
}

window.addEventListener('hashchange', route);

// Unlock audio context on the very first user gesture.
const unlockAudio = () => {
  beeps.unlock();
};
window.addEventListener('click', unlockAudio, { once: true });
window.addEventListener('keydown', unlockAudio, { once: true });

if (!location.hash) location.hash = '#/home';
route();

// Register service worker (vite-plugin-pwa injects the registration).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true });
  }).catch(() => { /* ignore in dev */ });
}
