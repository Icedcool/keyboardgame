// Mini-game shell. Handles Find-the-Letter and Find-the-Animal.

import * as state from '../engine/state.js';
import * as keys from '../engine/keys.js';
import * as tts from '../audio/tts.js';
import * as sfx from '../audio/sfx.js';
import * as beeps from '../audio/beeps.js';
import { createFindLetter, createFindAnimal } from '../engine/minigames.js';
import { PHONETICS } from '../engine/phonetics.js';
import { mount as mountKeyboard } from './keyboard.js';
import { WORLDS } from '../data/animals.js';

const WORLD_LABELS = { jungle: 'JUNGLE', ocean: 'OCEAN', farm: 'FARM' };

function confetti(parent) {
  const layer = document.createElement('div');
  layer.className = 'confetti';
  const COLORS = ['#ff5252', '#ffd84d', '#42a5f5', '#66bb6a', '#ab47bc', '#ffa726'];
  for (let i = 0; i < 36; i++) {
    const p = document.createElement('div');
    p.className = 'confetti__piece';
    p.style.left = `${Math.random() * 100}%`;
    p.style.background = COLORS[i % COLORS.length];
    p.style.animationDelay = `${Math.random() * 0.4}s`;
    p.style.animationDuration = `${1.2 + Math.random() * 0.8}s`;
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    layer.appendChild(p);
  }
  parent.appendChild(layer);
  setTimeout(() => layer.remove(), 2200);
}

function wrongFlash(parent) {
  const f = document.createElement('div');
  f.className = 'wrong-flash';
  parent.appendChild(f);
  setTimeout(() => f.remove(), 380);
}

export function renderFindLetter(world, navigate) {
  if (!WORLDS.includes(world)) {
    navigate('#/home');
    return { el: document.createElement('div'), teardown() {} };
  }
  const game = createFindLetter(world);
  if (!game.target) {
    navigate(`#/world/${world}`);
    return { el: document.createElement('div'), teardown() {} };
  }

  const root = document.createElement('div');
  root.className = `screen world minigame`;
  root.dataset.world = world;
  root.innerHTML = `
    <a class="btn world__home" href="#/world/${world}">🏠 ${WORLD_LABELS[world]}</a>
    <div class="minigame__prompt">🔤 Find the Letter!</div>
    <div class="world__stage"></div>
    <div class="minigame__streak">Streak: <span class="streak-num">0</span></div>
  `;
  const stage = root.querySelector('.world__stage');
  const streakEl = root.querySelector('.streak-num');

  function paintTarget() {
    stage.innerHTML = `<div class="minigame__hint-letter">${game.target}</div>`;
  }

  async function speakPrompt() {
    tts.cancelAll();
    await tts.speak('Find the letter');
    await tts.speakLetter(game.target, { pitch: 1.2 });
  }

  paintTarget();
  speakPrompt();

  let gen = 0;
  async function onKey(key) {
    beeps.unlock();
    const myGen = ++gen;
    const before = game.target;
    const res = game.onKey(key);
    if (res.correct) {
      // Full reaction: speak the letter + phonetic, then advance.
      tts.cancelAll();
      stage.innerHTML = `<div class="letter letter--${world}">${before}</div>`;
      await tts.speakLetter(before, { pitch: 1.2 });
      if (myGen !== gen) return;
      await tts.speak(PHONETICS[before] || '', { pitch: 1.1, rate: 0.85 });
      if (myGen !== gen) return;
      if (res.celebration) {
        beeps.fanfare();
        confetti(root);
        await tts.speak('Yay!', { pitch: 1.3 });
      } else {
        beeps.ding();
      }
      streakEl.textContent = String(game.streak);
      paintTarget();
      speakPrompt();
    } else {
      beeps.buzz();
      wrongFlash(root);
      // Re-prompt
      tts.cancelAll();
      await tts.speak('Try again!');
      await tts.speakLetter(game.target, { pitch: 1.2 });
    }
  }
  keys.setHandler(onKey);
  const keyboard = mountKeyboard(root);

  return {
    el: root,
    teardown() {
      gen++;
      tts.cancelAll();
      sfx.stop();
      keys.setHandler(null);
      keyboard.teardown();
    },
  };
}

export function renderFindAnimal(world, navigate) {
  if (!WORLDS.includes(world)) {
    navigate('#/home');
    return { el: document.createElement('div'), teardown() {} };
  }
  const game = createFindAnimal(world);
  if (!game.animal) {
    navigate(`#/world/${world}`);
    return { el: document.createElement('div'), teardown() {} };
  }

  const root = document.createElement('div');
  root.className = `screen world minigame`;
  root.dataset.world = world;
  root.innerHTML = `
    <a class="btn world__home" href="#/world/${world}">🏠 ${WORLD_LABELS[world]}</a>
    <div class="minigame__prompt">🐾 Find the Animal!</div>
    <div class="world__stage"></div>
    <div class="minigame__streak">Streak: <span class="streak-num">0</span></div>
  `;
  const stage = root.querySelector('.world__stage');
  const streakEl = root.querySelector('.streak-num');

  function paintTarget() {
    stage.innerHTML = `
      <div class="minigame__hint-animal">
        <img src="./animals/${game.animal.slug}.svg" alt="${game.animal.name}" />
      </div>`;
  }

  async function speakPrompt() {
    tts.cancelAll();
    await tts.speak('Find the');
    await tts.speak(game.animal.name, { pitch: 1.15 });
  }

  paintTarget();
  speakPrompt();

  let gen = 0;
  async function onKey(key) {
    beeps.unlock();
    const myGen = ++gen;
    const beforeAnimal = game.animal;
    const beforeLetter = game.targetLetter();
    const res = game.onKey(key);
    if (res.correct) {
      tts.cancelAll();
      stage.innerHTML = `
        <div class="letter letter--${world}">${beforeLetter}</div>
        <div class="minigame__hint-animal"><img src="./animals/${beforeAnimal.slug}.svg" alt="${beforeAnimal.name}" /></div>`;
      await tts.speakLetter(beforeLetter, { pitch: 1.2 });
      if (myGen !== gen) return;
      await tts.speak(beforeAnimal.name, { pitch: 1.15 });
      if (myGen !== gen) return;
      // Unlock as a side benefit
      const isNew = state.markSeen(world, beforeAnimal.slug);
      if (res.celebration) {
        beeps.fanfare();
        confetti(root);
        await tts.speak('Great job!', { pitch: 1.3 });
      } else {
        beeps.ding();
      }
      streakEl.textContent = String(game.streak);
      paintTarget();
      speakPrompt();
    } else {
      beeps.buzz();
      wrongFlash(root);
      tts.cancelAll();
      await tts.speak('Try again!');
      await tts.speak(game.animal.name, { pitch: 1.15 });
    }
  }
  keys.setHandler(onKey);
  const keyboard = mountKeyboard(root);

  return {
    el: root,
    teardown() {
      gen++;
      tts.cancelAll();
      sfx.stop();
      keys.setHandler(null);
      keyboard.teardown();
    },
  };
}
