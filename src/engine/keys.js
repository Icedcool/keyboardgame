// Key handler. A–Z only; ignores everything else silently. Each handler
// callback receives the uppercase letter. Generation tokens (managed by the
// caller) are used to cancel in-flight sequences when a new key arrives.

const A_Z = /^[A-Z]$/;

let handler = null;

function onKeyDown(e) {
  // Ignore modified keys (Ctrl-A, Cmd-V, etc.) so the browser keeps its
  // shortcuts and we don't accidentally consume Save / Refresh.
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const key = (e.key || '').toUpperCase();
  if (!A_Z.test(key)) return;
  if (handler) handler(key);
}

export function setHandler(fn) {
  handler = fn;
}

export function install() {
  window.addEventListener('keydown', onKeyDown);
}

export function uninstall() {
  window.removeEventListener('keydown', onKeyDown);
  handler = null;
}
