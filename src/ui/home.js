// Home Base screen. Three world tiles + Sticker Book link.

import * as state from '../engine/state.js';
import { CATALOG, WORLDS } from '../data/animals.js';
import * as keys from '../engine/keys.js';
import * as tts from '../audio/tts.js';
import * as beeps from '../audio/beeps.js';

const WORLD_LABELS = { jungle: 'JUNGLE', ocean: 'OCEAN', farm: 'FARM' };
const WORLD_EMOJI  = { jungle: '🌴',     ocean: '🌊',     farm: '🚜'   };

function countWorld(world) {
  const animals = Object.values(CATALOG[world] || {}).flat();
  let seen = 0;
  for (const a of animals) {
    if (state.hasSeen(world, a.slug)) seen++;
  }
  return { seen, total: animals.length };
}

export function render(navigate) {
  const root = document.createElement('div');
  root.className = 'screen home';
  root.innerHTML = `
    <h1 class="home__title">Animal Keys</h1>
    <p class="home__sub">Pick a world!</p>
    <div class="home__worlds">
      ${WORLDS.map((w) => {
        const { seen, total } = countWorld(w);
        return `
          <button class="world-tile" data-world="${w}" aria-label="Play in ${WORLD_LABELS[w]}">
            <div class="world-tile__art">${WORLD_EMOJI[w]}</div>
            <div class="world-tile__label">${WORLD_LABELS[w]}</div>
            <div class="world-tile__count">${seen} / ${total} found</div>
          </button>
        `;
      }).join('')}
    </div>
    <div class="home__nav">
      <a class="btn btn--big" href="#/sticker">📔 Sticker Book</a>
    </div>
  `;

  // Click tiles -> navigate to world
  root.querySelectorAll('.world-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      beeps.unlock();
      navigate(`#/world/${tile.dataset.world}`);
    });
  });

  // Number keys 1/2/3 as shortcut
  keys.setHandler(null);
  const onKey = (e) => {
    if (e.key === '1') navigate('#/world/jungle');
    else if (e.key === '2') navigate('#/world/ocean');
    else if (e.key === '3') navigate('#/world/farm');
    else if (e.key === 's' || e.key === 'S') navigate('#/sticker');
  };
  window.addEventListener('keydown', onKey);

  // Speak greeting on first user gesture (TTS needs gesture in some browsers).
  // We attach a one-shot listener that fires on the *next* click or keypress.
  const greet = () => {
    beeps.unlock();
    if (!greetedOnce) {
      greetedOnce = true;
      tts.speak('Pick a world!', { rate: 0.9 });
    }
    window.removeEventListener('click', greet);
    window.removeEventListener('keydown', greet);
  };
  window.addEventListener('click', greet, { once: true });
  window.addEventListener('keydown', greet, { once: true });

  return {
    el: root,
    teardown() {
      window.removeEventListener('keydown', onKey);
    },
  };
}

let greetedOnce = false;
