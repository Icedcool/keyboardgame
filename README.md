# Animal Keys

A keyboard learning game for kids — press A–Z, meet animals from three worlds (Jungle, Ocean, Farm).

Built per [`animal-keys-prd.md`](./animal-keys-prd.md).

![screenshot](https://via.placeholder.com/800x500/2d8a4e/fff8e1?text=Animal+Keys)

## What it does

Every keypress (A–Z) triggers:
1. Big animated **letter** in the world's theme color.
2. Voice says the **letter name** ("B").
3. Voice says the **phonetic sound** ("buh").
4. **Cartoon animal** slides in (e.g., Bat in Jungle).
5. Voice says the **animal name** ("Bat!").
6. Optional **animal sound effect** plays (if you've dropped MP3s into `public/sounds/` — see below).

Three worlds (Jungle / Ocean / Farm), each with its own animal pool. Letters with no animal in the current world render alone (no false reward). Two mini-games: **Find the Letter** and **Find the Animal**. A **Sticker Book** tracks unlocked animals and persists in `localStorage`.

## Quick start

```bash
npm install        # installs deps + downloads 75 OpenMoji animal SVGs
npm run dev        # local dev server at http://localhost:5173
npm run build      # production build to ./dist
npm run preview    # serve the built site at http://localhost:4173
npm test           # picker shuffle-cycling unit tests
```

## Deploy to Vercel

1. Push this repo to GitHub:
   ```bash
   git push -u origin main
   ```
2. In Vercel: **New Project → Import from GitHub → keyboardgame → Deploy**.
   Vercel auto-detects Vite. No env vars, no build customization needed.

That's it. Static site, no backend, no secrets.

## Adding real animal sounds (post-MVP)

The TTS narrates the animal name out loud. For the *actual* animal SFX (bear growl, cow moo, etc.) drop MP3 files into `public/sounds/`, named by the animal slug:

```
public/sounds/bear.mp3
public/sounds/cow.mp3
public/sounds/dolphin.mp3
...
```

Slugs are listed in `public/animals/world-map.json`. No code change needed — the player loads them on demand and stays silent if missing.

Recommended source: [freesound.org](https://freesound.org/) (filter by Creative Commons 0). Aim for 1–2 second clips, < 100 KB.

## Adding or swapping animals

Edit `public/animals/world-map.json`. Each entry:

```json
{
  "slug": "alligator",
  "name": "Alligator",
  "codepoint": "1F40A",
  "worlds": ["jungle"]
}
```

- `slug`: filename (no extension) under `public/animals/`.
- `name`: spoken aloud by TTS; first letter determines which key shows this animal.
- `codepoint`: [OpenMoji](https://openmoji.org/) unicode hex (uppercase, no `U+`).
- `worlds`: subset of `["jungle", "ocean", "farm"]`.

Then run `npm run catalog` — it'll download missing SVGs from the OpenMoji CDN and regenerate `src/data/animals.js`. (`npm run dev` and `npm run build` do this automatically.)

To use your own art instead of OpenMoji: drop a `<slug>.svg` (or PNG, adjust `src/render/animal.js`) into `public/animals/` before running the catalog script — it skips download if the file already exists.

## Project structure

```
src/
├── main.js                # bootstrap, hash router
├── engine/
│   ├── state.js           # localStorage with in-memory fallback
│   ├── keys.js            # A–Z keydown dispatcher
│   ├── picker.js          # shuffle-cycling animal picker
│   ├── phonetics.js       # letter → "buh"/"kuh"/... map
│   └── minigames.js       # Find-the-Letter, Find-the-Animal state machines
├── audio/
│   ├── tts.js             # Web Speech wrapper, voice selection
│   ├── sfx.js             # HTMLAudio loader, silent on missing
│   └── beeps.js           # Web Audio synthesized ding / fanfare / buzz
├── ui/
│   ├── home.js            # Home Base screen
│   ├── world.js           # World play screen
│   ├── sticker.js         # Sticker Book grid
│   └── minigame.js        # mini-game shells (both games)
├── render/
│   ├── letter.js          # big animated letter
│   ├── animal.js          # animal sprite renderer
│   └── styles.css         # all styles, per-world themes
└── data/
    └── animals.js         # AUTO-GENERATED catalog
public/
├── animals/               # OpenMoji SVGs + world-map.json
├── sounds/                # drop your MP3s here (empty in v1)
└── icons/icon.svg         # app icon
scripts/
└── build-catalog.js       # SVG downloader + catalog generator
tests/
└── picker.test.js
```

## Reset progress

For development, append `#/reset` to the URL (e.g. `http://localhost:5173/#/reset`) — it clears `localStorage` and returns to Home Base.

## Acceptance criteria

See [`animal-keys-prd.md`](./animal-keys-prd.md) for the full spec. Build verified against:

- ✅ Home Base loads with 3 world tiles
- ✅ Pressing A–Z in a world plays the full letter → phonetic → animal-name → SFX sequence
- ✅ Rapid keypresses cancel in-flight sequences (no overlapping audio)
- ✅ Animal cycling: repeated presses show different animals without repeating within a cycle
- ✅ Letters with no animal in a world render alone (e.g., Q in Jungle)
- ✅ Sticker book grid organized by world, locked/unlocked states, replays on tap
- ✅ Progress persists across reloads via `localStorage`
- ✅ Both mini-games run with streak counters and confetti celebrations
- ✅ PWA installable (manifest + service worker)
- ✅ Total bundle: ~550 KB including 75 animal SVGs

## Credits

- Animal art: [OpenMoji](https://openmoji.org/) (CC-BY-SA 4.0). Each SVG is fetched on demand and cached in `public/animals/`.
- Built per the PRD authored by John.

## License

[MIT](./LICENSE) for code. Animal art is OpenMoji and remains CC-BY-SA 4.0 — see `LICENSE` for attribution notice.
