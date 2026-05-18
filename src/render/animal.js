// Renders the animal sprite into a target element. SVG file under
// /animals/<slug>.svg (copied from public/animals/ at build time).

export function renderAnimal(target, animal, onClick) {
  const wrap = document.createElement('button');
  wrap.className = 'animal';
  wrap.type = 'button';
  wrap.setAttribute('aria-label', `${animal.name} — tap to dismiss`);
  const img = document.createElement('img');
  img.src = `./animals/${animal.slug}.svg`;
  img.alt = animal.name;
  img.draggable = false;
  wrap.appendChild(img);
  if (onClick) wrap.addEventListener('click', () => onClick(animal));
  target.appendChild(wrap);
  return wrap;
}
