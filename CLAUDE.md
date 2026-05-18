# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Animal Keys** — Vite-built static PWA. A kid presses A–Z; the page plays letter → phonetic → animal name → optional MP3, and a cartoon animal (OpenMoji SVG) slides in. Three "worlds" (Jungle / Ocean / Farm) each have their own animal pool. Two mini-games and a Sticker Book persist via `localStorage`. No backend.

The full spec lives in [`animal-keys-prd.md`](./animal-keys-prd.md) — defer to it when scope is ambiguous.

## Commands

```bash
npm run dev        # vite dev server at http://localhost:5173 (runs catalog build first)
npm run build      # production build → ./dist (runs catalog build first)
npm run preview    # serve ./dist at http://localhost:4173
npm run catalog    # regenerate src/data/animals.js + download missing OpenMoji SVGs
npm test           # node --test tests/   (whole suite)
node --test tests/picker.test.js   # single test file
```

`predev` / `prebuild` hooks always re-run `scripts/build-catalog.js`, so editing `public/animals/world-map.json` is enough — never edit `src/data/animals.js` by hand.

`#/reset` (or `/reset`) in the URL clears `localStorage` and returns Home.

## Architecture

**Catalog pipeline.** `public/animals/world-map.json` is the source of truth for animals. `scripts/build-catalog.js` reads it, downloads any missing OpenMoji SVG by `codepoint` into `public/animals/<slug>.svg` (skips if present), then emits `src/data/animals.js` exporting `WORLDS`, `CATALOG[world][LETTER] = [{slug, name}, …]`, and `ALL_ANIMALS`. Failed downloads are logged and silently omitted from the catalog — they don't fail the build. The runtime imports only the generated module.

**Routing.** `src/main.js` is a hash router (`#/home`, `#/world/<id>`, `#/sticker`, `#/minigame/<game>/<world>`). Each `ui/*.js` module exports `render(...)` returning `{ el, teardown }`. The router calls `teardown` before swapping screens — every screen MUST cancel its in-flight TTS / SFX / key handler in `teardown` or audio will leak between routes.

**The keypress reaction sequence** (`src/ui/world.js`). Each A–Z press runs an async pipeline: clear stage → render letter → TTS letter name → TTS phonetic → render animal → mark seen (and `beeps.ding()` if newly unlocked) → TTS animal name → MP3 sfx. A **generation counter** captured at entry is checked after every `await` — if a new keypress (or a tap-to-dismiss) increments it, the rest of the sequence aborts. This is the only thing preventing overlapping audio on rapid keypresses; preserve it when modifying.

**Key dispatch.** `src/engine/keys.js` installs a single `keydown` listener. It filters to A–Z and forwards to a swappable `handler` registered by the active screen via `keys.setHandler(fn)`. Modifier-key combos (Ctrl/Cmd/Alt) are passed through so browser shortcuts still work.

**Animal picker** (`src/engine/picker.js`). Shuffle-cycling per `(world, letter)`: returns each animal in a randomized order without repeats inside a cycle, then reshuffles. Across cycle boundaries, the first item of the new cycle is swapped with the second if it would equal the last item of the previous cycle — so two consecutive presses never show the same animal when the pool size > 1. The picker test re-implements the algorithm inline (ESM module mocking is awkward) — if you change `picker.js`, also update the inline copy in `tests/picker.test.js`.

**Audio layers.**
- `audio/tts.js` — Web Speech, with a preferred-voice allowlist (Samantha, Google US English, Microsoft Aria, …) and an en-* fallback. Voices load async — `voiceschanged` triggers re-pick. `cancelAll()` aborts in-flight utterances; every screen calls it on new keypress and teardown. Includes a 6s safety timeout because some browsers swallow `onend` on interrupted utterances.
- `audio/sfx.js` — `HTMLAudio` loader for `public/sounds/<slug>.mp3`. Silent on missing file (404 just doesn't play). Drop MP3s here to enable animal sounds; no code change needed.
- `audio/beeps.js` — synthesized Web Audio ding / fanfare / buzz for UI feedback. The `AudioContext` must be unlocked by a user gesture; `main.js` registers one-shot `click` + `keydown` unlock listeners.

**State** (`src/engine/state.js`). Single `localStorage` key `animalkeys/v1` holds `{ seen: {"<world>:<slug>": true}, lastWorld }`. Wrapped in try/catch with an in-memory fallback so private browsing doesn't crash. `markSeen` returns `true` only the first time, which is what drives the "new sticker" ding.

**PWA.** `vite-plugin-pwa` autogenerates the service worker; manifest is inline in `vite.config.js`. `base: './'` makes the build deployable to any static-host subdirectory. Service worker registration is gated on `import.meta.env.PROD` so dev reloads stay clean.

## Conventions

- ES modules everywhere (`"type": "module"`). Target `es2020`. No TypeScript.
- No framework — vanilla DOM, per-screen `render()` returning `{ el, teardown }`. Don't introduce React/Vue/etc. without an explicit ask.
- `src/data/animals.js` is generated. Never edit by hand; edit `public/animals/world-map.json` and run `npm run catalog`.
- Letters with no animal in the current world render alone — do not synthesize a fallback (a "false reward" would mislead the kid).
- All A–Z handling assumes uppercase; `engine/keys.js` upcases before dispatch.
- Static-host friendly: no env vars, no server, no secrets. `base: './'` is intentional.
