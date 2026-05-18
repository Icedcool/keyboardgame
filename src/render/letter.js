// Renders the big animated letter into a target element.

export function renderLetter(target, letter, theme) {
  const el = document.createElement('div');
  el.className = `letter letter--${theme}`;
  el.textContent = letter;
  el.setAttribute('aria-hidden', 'true');
  target.appendChild(el);
  return el;
}
