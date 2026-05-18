// On-screen ABC keyboard. Mounted on screens that consume A-Z input
// (world play + both minigames). Each tap synthesizes a dispatch through
// keys.dispatch(), which routes through the same handler as a physical
// keydown — so the existing generation-counter / cancellation pipeline
// just works.
//
// Visibility is handled in CSS: hidden on devices whose primary pointer
// is a mouse (hover + fine-pointer), shown elsewhere.

import * as keys from '../engine/keys.js';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function mount(parent) {
  const el = document.createElement('div');
  el.className = 'keyboard';
  el.setAttribute('role', 'group');
  el.setAttribute('aria-label', 'On-screen alphabet keyboard');

  for (const letter of LETTERS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'keyboard__key';
    btn.dataset.letter = letter;
    btn.textContent = letter;
    btn.setAttribute('aria-label', `Letter ${letter}`);
    el.appendChild(btn);
  }

  function onPointerDown(e) {
    const target = e.target.closest('.keyboard__key');
    if (!target) return;
    e.preventDefault();
    keys.dispatch(target.dataset.letter);
  }

  el.addEventListener('pointerdown', onPointerDown);

  parent.appendChild(el);

  return {
    el,
    teardown() {
      el.removeEventListener('pointerdown', onPointerDown);
      el.remove();
    },
  };
}
