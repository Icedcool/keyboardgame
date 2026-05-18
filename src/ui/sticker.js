// Sticker Book screen. Grid organized by world; tap an unlocked sticker to
// replay its name + SFX.

import * as state from '../engine/state.js';
import * as tts from '../audio/tts.js';
import * as sfx from '../audio/sfx.js';
import * as keys from '../engine/keys.js';
import * as beeps from '../audio/beeps.js';
import { CATALOG, WORLDS } from '../data/animals.js';

const WORLD_LABELS = { jungle: 'Jungle', ocean: 'Ocean', farm: 'Farm' };

export function render(navigate) {
  keys.setHandler(null);

  const allAnimals = WORLDS.flatMap((w) =>
    Object.values(CATALOG[w] || {}).flat().map((a) => ({ ...a, world: w })),
  );
  const totalCount = allAnimals.length;
  const seenCount = allAnimals.filter((a) => state.hasSeen(a.world, a.slug)).length;

  const root = document.createElement('div');
  root.className = 'screen sticker';
  root.innerHTML = `
    <div class="sticker__header">
      <a class="btn" href="#/home">🏠 Home</a>
      <h2 class="sticker__title">Sticker Book</h2>
      <div class="sticker__counter">You've found <strong>${seenCount}</strong> of ${totalCount} animals!</div>
    </div>
    ${WORLDS.map((world) => {
      const list = Object.entries(CATALOG[world] || {})
        .sort(([a], [b]) => a.localeCompare(b))
        .flatMap(([, animals]) => animals)
        .map((a) => {
          const unlocked = state.hasSeen(world, a.slug);
          return `
            <button class="sticker__cell sticker__cell--${unlocked ? 'unlocked' : 'locked'}"
                    data-world="${world}" data-slug="${a.slug}" data-name="${a.name}"
                    aria-label="${unlocked ? a.name : 'Locked sticker'}"
                    ${unlocked ? '' : 'aria-disabled="true"'}>
              <img src="./animals/${a.slug}.svg" alt="" />
              <div class="sticker__cell-name">${unlocked ? a.name : '???'}</div>
            </button>
          `;
        }).join('');
      return `
        <section class="sticker__world">
          <h3 class="sticker__world-title">${WORLD_LABELS[world]}</h3>
          <div class="sticker__grid">${list}</div>
        </section>
      `;
    }).join('')}
  `;

  root.querySelectorAll('.sticker__cell--unlocked').forEach((cell) => {
    cell.addEventListener('click', async () => {
      beeps.unlock();
      tts.cancelAll();
      sfx.stop();
      await tts.speak(cell.dataset.name, { pitch: 1.15 });
      sfx.playAnimalSfx(cell.dataset.slug);
    });
  });

  return {
    el: root,
    teardown() {
      tts.cancelAll();
      sfx.stop();
    },
  };
}
