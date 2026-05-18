// World play screen — the heart of the game. Pressing A–Z runs the full
// reaction sequence.

import * as state from '../engine/state.js';
import * as picker from '../engine/picker.js';
import * as keys from '../engine/keys.js';
import * as tts from '../audio/tts.js';
import * as sfx from '../audio/sfx.js';
import * as beeps from '../audio/beeps.js';
import { renderLetter } from '../render/letter.js';
import { renderAnimal } from '../render/animal.js';
import { mount as mountKeyboard } from './keyboard.js';
import { WORLDS } from '../data/animals.js';

const WORLD_LABELS = { jungle: 'JUNGLE', ocean: 'OCEAN', farm: 'FARM' };

export function render(world, navigate) {
  if (!WORLDS.includes(world)) {
    navigate('#/home');
    return { el: document.createElement('div'), teardown() {} };
  }

  state.setLastWorld(world);

  const root = document.createElement('div');
  root.className = `screen world`;
  root.dataset.world = world;
  root.innerHTML = `
    <a class="btn world__home" href="#/home" aria-label="Home">🏠 Home</a>
    <a class="btn world__sticker" href="#/sticker" aria-label="Sticker Book">📔 <span class="sticker-count">${state.countSeen()}</span></a>
    <h2 class="world__title">${WORLD_LABELS[world]}</h2>
    <div class="world__stage" aria-live="polite">
      <div class="world__hint">Press any letter!</div>
    </div>
    <div class="world__minigames">
      <a class="btn btn--ghost" href="#/minigame/find-letter/${world}">🔤 Find the Letter</a>
      <a class="btn btn--ghost" href="#/minigame/find-animal/${world}">🐾 Find the Animal</a>
    </div>
  `;

  const stage = root.querySelector('.world__stage');
  const hint = root.querySelector('.world__hint');
  const stickerCount = root.querySelector('.sticker-count');

  let generation = 0;
  let hintHidden = false;

  function clearStage() {
    // Remove letter + animal, keep hint structure
    stage.querySelectorAll('.letter, .animal').forEach((n) => n.remove());
    stage.classList.remove('has-animal');
  }

  function hideHintOnce() {
    if (hintHidden) return;
    hintHidden = true;
    hint.style.transition = 'opacity 300ms ease-out';
    hint.style.opacity = '0';
    setTimeout(() => hint.remove(), 320);
  }

  async function play(letter) {
    generation++;
    const gen = generation;

    tts.cancelAll();
    sfx.stop();
    clearStage();
    hideHintOnce();
    beeps.unlock();

    const animal = picker.next(world, letter);
    renderLetter(stage, letter, world);

    await tts.speakLetter(letter, { pitch: 1.2, rate: 0.9 });
    if (gen !== generation) return;

    if (animal) {
      stage.classList.add('has-animal');
      renderAnimal(stage, animal, () => {
        // Tap-to-dismiss
        generation++;
        tts.cancelAll();
        sfx.stop();
        clearStage();
      });

      const isNew = state.markSeen(world, animal.slug);
      if (isNew) {
        beeps.ding();
        stickerCount.textContent = String(state.countSeen());
      }

      await tts.speak(animal.name, { pitch: 1.15, rate: 0.95 });
      if (gen !== generation) return;

      sfx.playAnimalSfx(animal.slug);
    }
  }

  keys.setHandler(play);
  const keyboard = mountKeyboard(root);

  // Tap on stage (not on animal) also dismisses the letter
  stage.addEventListener('click', (e) => {
    if (e.target === stage) {
      generation++;
      tts.cancelAll();
      sfx.stop();
      clearStage();
    }
  });

  return {
    el: root,
    teardown() {
      generation++;
      tts.cancelAll();
      sfx.stop();
      keys.setHandler(null);
      keyboard.teardown();
    },
  };
}
