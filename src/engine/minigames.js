// Mini-game state machines. Pure logic; UI lives in src/ui/minigame.js.

import * as picker from './picker.js';

/** Find-the-Letter — voice prompt is a target letter; press any key to match. */
export function createFindLetter(world) {
  let target = picker.randomLetterInWorld(world);
  let streak = 0;
  let history = new Set([target]);

  function pickNextTarget() {
    // Try a few times to avoid immediate repeats.
    for (let i = 0; i < 10; i++) {
      const next = picker.randomLetterInWorld(world);
      if (!next) return null;
      if (next !== target || history.size >= 5) {
        target = next;
        history.add(target);
        if (history.size > 5) history = new Set([target]);
        return target;
      }
    }
    target = picker.randomLetterInWorld(world);
    return target;
  }

  return {
    get target() {
      return target;
    },
    get streak() {
      return streak;
    },
    /** Returns { correct: bool, celebration: bool } */
    onKey(key) {
      if (key === target) {
        streak++;
        const celebration = streak % 3 === 0;
        pickNextTarget();
        return { correct: true, celebration };
      }
      return { correct: false, celebration: false };
    },
  };
}

/** Find-the-Animal — show an animal, press its first letter. */
export function createFindAnimal(world) {
  let animal = picker.randomAnimalInWorld(world);
  let streak = 0;

  function pickNext() {
    let next = picker.randomAnimalInWorld(world);
    // Avoid immediate repeat
    if (next && animal && next.slug === animal.slug) {
      const alt = picker.randomAnimalInWorld(world);
      if (alt) next = alt;
    }
    animal = next;
    return animal;
  }

  return {
    get animal() {
      return animal;
    },
    get streak() {
      return streak;
    },
    targetLetter() {
      return animal?.name?.[0]?.toUpperCase();
    },
    onKey(key) {
      const target = this.targetLetter();
      if (!target) return { correct: false, celebration: false };
      if (key === target) {
        streak++;
        const celebration = streak % 3 === 0;
        pickNext();
        return { correct: true, celebration };
      }
      return { correct: false, celebration: false };
    },
  };
}
