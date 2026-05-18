// Animal picker with shuffle-cycling: within a (world, letter) pool, returns
// animals in a randomized order without repeating until the pool is exhausted,
// then reshuffles.

import { CATALOG } from '../data/animals.js';

const queues = new Map(); // "world:LETTER" -> shuffled queue of animals

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function refill(world, letter) {
  const pool = CATALOG[world]?.[letter] || [];
  if (pool.length === 0) return [];
  // Avoid starting a fresh cycle with the same animal as the previous one
  // (so repeated presses don't ever land on the same animal twice in a row,
  // unless the pool has size 1).
  const last = queues.get(`${world}:${letter}:last`);
  let next = shuffle(pool);
  if (pool.length > 1 && last && next[0].slug === last) {
    // swap first two
    [next[0], next[1]] = [next[1], next[0]];
  }
  return next;
}

/** Returns { slug, name } or null if the (world, letter) pool is empty. */
export function next(world, letter) {
  const key = `${world}:${letter}`;
  let queue = queues.get(key);
  if (!queue || queue.length === 0) {
    queue = refill(world, letter);
    if (queue.length === 0) return null;
    queues.set(key, queue);
  }
  const animal = queue.shift();
  queues.set(`${key}:last`, animal.slug);
  return animal;
}

/** For Find-the-Animal mini-game: pick a random animal from the world. */
export function randomAnimalInWorld(world) {
  const letters = Object.keys(CATALOG[world] || {});
  if (letters.length === 0) return null;
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const pool = CATALOG[world][letter];
  return pool[Math.floor(Math.random() * pool.length)];
}

/** For Find-the-Letter mini-game: pick a random letter that has animals. */
export function randomLetterInWorld(world) {
  const letters = Object.keys(CATALOG[world] || {});
  if (letters.length === 0) return null;
  return letters[Math.floor(Math.random() * letters.length)];
}

/** Reset all cycling state — used for tests. */
export function _reset() {
  queues.clear();
}
