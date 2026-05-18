# Animal Keys — Product Requirements Document

**Project codename:** Animal Keys
**Primary user:** Eli (age 4)
**Author:** John
**Version:** 0.1 (Draft)
**Last updated:** May 17, 2026
**Status:** Pre-build PRD

---

## 1. Summary

Animal Keys is a desktop-first, browser-based learning game that teaches a 4-year-old child to recognize letters on a physical keyboard while building familiarity with animals from three themed worlds (Jungle, Ocean, Farm). Each keypress is rewarded with a delightful, multi-sensory response: the uppercase letter on screen, a spoken letter name and phonetic sound, a cartoon-illustrated animal whose name begins with that letter, the animal's name spoken aloud, and a real animal sound effect. Free play is the core mode; two simple mini-games provide light structure for when the child wants a goal.

The product ships as a Vercel-hosted progressive web app that can be added to a Safari home screen for tablet use later, but the v1 target is keyboard-first play on a laptop or desktop.

---

## 2. Goals & non-goals

### Goals
- Help Eli form a positive, playful association with the keyboard.
- Reinforce letter recognition (uppercase) and phonemic awareness.
- Build a vocabulary of animals across three habitat themes.
- Deliver an experience that is joyful in the first 5 seconds with no instructions required.
- Be runnable as a static PWA on Vercel with zero backend dependencies in v1.

### Non-goals (v1)
- Teaching typing (multi-key sequences, words, spelling).
- Lowercase letters, numbers, punctuation, or modifier keys.
- Multiple user profiles or cloud-synced progress.
- Parental controls, PIN gating, or settings UI.
- Accessibility for screen readers (worth revisiting in v2).
- Monetization, accounts, analytics dashboards.

---

## 3. Target user

**Eli, age 4.** Pre-reader. Can recognize some uppercase letters. Comfortable on a laptop with adult nearby. Attention span: 5–15 minute sessions. Motor skills: can press individual keys reliably but is not yet typing words. Strong response to bright visuals, animal sounds, and immediate feedback.

---

## 4. User journey

### First-time experience
1. Eli opens the app (a parent loads the URL or taps the home-screen icon).
2. Within 2 seconds, the **Home Base map** appears showing three illustrated worlds: Jungle, Ocean, Farm.
3. A friendly voice says *"Pick a world!"* with each world gently pulsing.
4. Eli clicks a world (or presses 1, 2, 3 — discoverable, not required).
5. The world loads with its themed background. A voice says *"Press any letter!"*
6. Eli presses a key. The full reaction sequence plays.
7. Eli keeps pressing. The sticker book icon in the corner gains a new sticker.

### Returning experience
1. App opens directly to the Home Base map.
2. Worlds previously visited show a small count of stickers collected.
3. A "Sticker Book" button is visible from Home Base.
4. Mini-game entry points are visible from each world.

### Core free-play loop (per keypress)
1. Eli presses a letter key (A–Z).
2. Big uppercase letter animates onto the center of the screen.
3. Voice says the **letter name** (*"B"*).
4. Voice says the **phonetic sound** (*"buh"*).
5. A cartoon animal for that letter slides/bounces in (e.g., Bear in Jungle).
6. Voice says the **animal name** (*"Bear!"*).
7. The **real animal sound effect** plays (bear growl).
8. Animal stays on screen until Eli clicks/taps it to dismiss, or presses another letter.
9. If this animal hasn't been seen before, a soft "ding" plays and a sticker is added to the sticker book.

---

## 5. Functional requirements

### 5.1 Home Base map
- Single screen showing three world tiles: Jungle, Ocean, Farm.
- Each tile uses themed illustration and is large, tappable, and visually distinct.
- Sticker Book icon visible at all times.
- Mini-game launchers accessible from within each world (not Home Base) to keep Home Base simple.
- A persistent "Home" button in the corner of every world to return.

### 5.2 Themed worlds
- Three worlds: **Jungle**, **Ocean**, **Farm**.
- Each world has a unique background scene, ambient looped sound (at low volume), and a curated pool of animals.
- The pool of animals per world for each letter cycles on repeat presses (see 5.4).
- World ambient sound ducks automatically when the letter/animal audio sequence plays.

### 5.3 Key handling
- Only A–Z are valid input.
- Any other key (numbers, space, shift, escape, arrows, modifiers, etc.) is ignored silently — no sound, no visual, no feedback.
- Rapid keypresses interrupt the current sequence and immediately start a new one (no queue, no delay).
- Click/tap on the displayed animal dismisses it and clears the stage.
- Click/tap also works as the dismiss for the letter if no animal has appeared yet.

### 5.4 Animal cycling
- Each letter has a pool of multiple animals across worlds.
- In a given world, only that world's animals appear for that letter.
- Within a world, if a letter has multiple animals (e.g., Farm 'C' = Cow, Cat, Chicken), they rotate on repeated presses in randomized order without repeating until the pool is exhausted.
- An animal that has been "seen" is recorded in the sticker book the first time it appears.

### 5.5 Audio sequence
For each valid keypress, the audio plays in this order with no overlap:
1. Letter name (TTS) — e.g., *"A"*
2. Phonetic sound (TTS) — e.g., *"ah"*
3. Animal name (TTS) — e.g., *"Alligator"*
4. Real animal sound effect (pre-recorded SFX) — e.g., alligator hiss

Total sequence duration target: **1.5–2.5 seconds**.

If a new key is pressed mid-sequence, the current sequence is cancelled and the new one starts.

### 5.6 Sticker Book
- Accessible from Home Base and from within each world.
- Shows a grid of all animals in the game, organized by world.
- "Unlocked" animals appear in full color; "locked" animals show as silhouettes.
- Tapping an unlocked sticker replays its animal name + sound effect.
- Counter at the top: *"You've found 14 of 60 animals!"*
- Progress persists in `localStorage`.

### 5.7 Mini-game: Find the Letter
- Voice says *"Find the letter B!"* (visual prompt: large letter shown faintly as a fallback, dismissible via parent toggle later — for v1, just show it).
- Eli presses any key. If correct, full reaction sequence plays + a celebratory animation. If wrong, gentle "try again" tone, voice repeats the prompt.
- After 3 correct in a row, a short celebration plays and a new round starts.
- No fail state, no scoring, no time pressure.

### 5.8 Mini-game: Find the Animal
- An animal image is shown center-screen with the voice prompt *"Find the [animal name]!"*
- Eli must press the first letter of the animal's name.
- Correct → full reaction sequence + celebration.
- Wrong → gentle "try again" tone, animal stays on screen, prompt repeats.
- Same no-fail philosophy as 5.7.

### 5.9 Persistence
- All progress (animals unlocked, last world visited) stored in browser `localStorage`.
- No accounts, no cloud sync, no server.
- A hidden URL (`/reset`) clears progress for development convenience (not exposed in UI).

---

## 6. Content scope

### 6.1 Animal catalog (target ~60 animals across 26 letters, 3 worlds)

Goal: every letter has at least one animal in at least one world. Some letters (X, Q, Z) will be rare and may map to creative choices.

**Jungle examples:** Ant, Bear, Cheetah, Dragonfly, Elephant, Frog, Gorilla, Hippo, Iguana, Jaguar, Koala, Lion, Monkey, Newt, Orangutan, Panther, Quetzal, Rhino, Snake, Tiger, Umbrellabird, Viper, Wolf, X-ray fish (cheat), Yak, Zebra.

**Ocean examples:** Anglerfish, Blue whale, Crab, Dolphin, Eel, Flounder, Goldfish, Hermit crab, Inkfish (squid), Jellyfish, Killer whale (orca), Lobster, Manta ray, Narwhal, Octopus, Pufferfish, Quahog (clam), Ray, Shark, Turtle, Urchin, Viperfish, Walrus, X-ray fish, Yellowtail, Zebrafish.

**Farm examples:** Alpaca, Bull, Cow, Duck, Egg-laying hen, Fox, Goat, Horse, Insect (ladybug), Jersey cow, Kid (baby goat), Lamb, Mouse, Nanny goat, Ox, Pig, Quail, Rooster, Sheep, Turkey, Udder cow (cheat), Vulture, Wolfhound (dog), X-?, Yak, Zonkey (cheat).

> The catalog above is illustrative. The final list should be curated for visual distinctiveness and pronounceability. X and Q will require creative choices — flagged as open question 11.1.

### 6.2 Asset list per animal
- Single cartoon illustration (PNG, transparent background, ~1024×1024).
- Animal sound effect (MP3 or OGG, < 100 KB, 1–2 seconds).
- Display name (string, used by TTS).

---

## 7. Design & visual direction

### 7.1 Style
- Cartoon, illustrated, friendly. Think Sandra Boynton meets early Pixar shorts.
- Bright, saturated, but not garish.
- Thick outlines, expressive faces, simple shapes.
- Anti-realism: no scary teeth, no photo-real fur, no menacing eyes.

### 7.2 Worlds palette (suggested)
- **Jungle:** deep greens, warm browns, sunlight beams, parrot accents.
- **Ocean:** layered blues, coral pinks, sandy bottom, bubble particles.
- **Farm:** golden grass, red barn, baby-blue sky, fluffy clouds.

### 7.3 Letter display
- The uppercase letter appears huge and centered, in a chunky, rounded display font.
- Letter is colored to match the world theme.
- Letter slides or bounces in, holds for ~600ms, then the animal enters and overlaps slightly.

### 7.4 ASCII mockup — World screen during keypress

```
+-------------------------------------------------------+
| [Home]                              [Sticker Book 14] |
|                                                       |
|             ~ ~ ~  JUNGLE  ~ ~ ~                      |
|                                                       |
|                                                       |
|                  +-----------+                        |
|                  |           |                        |
|                  |     B     |                        |
|                  |           |        🐻              |
|                  +-----------+    (Bear bounces in)   |
|                                                       |
|                                                       |
|   [Mini-games: Find Letter | Find Animal]             |
+-------------------------------------------------------+
```

### 7.5 ASCII mockup — Home Base

```
+-------------------------------------------------------+
|                                     [Sticker Book 14] |
|                                                       |
|               ✨  ANIMAL KEYS  ✨                    |
|                                                       |
|     +---------+    +---------+    +---------+         |
|     |         |    |         |    |         |         |
|     | JUNGLE  |    |  OCEAN  |    |  FARM   |         |
|     |   🌴    |    |   🌊    |    |   🚜    |         |
|     |         |    |         |    |         |         |
|     +---------+    +---------+    +---------+         |
|                                                       |
|                                                       |
|              "Pick a world!"                          |
+-------------------------------------------------------+
```

---

## 8. Technical architecture

### 8.1 Stack
- **Framework:** Vanilla JavaScript + Vite (per John's preference for game/WebGL-style projects). React is overkill for this scope and adds bundle weight; vanilla keeps it snappy on lower-end devices.
- **Architecture pattern:** Event-driven with clear separation of concerns:
  - **Game Engine** — keypress handling, state, animal selection, mini-game logic.
  - **Renderer** — DOM/CSS animations for letters and animals (no canvas/WebGL needed in v1).
  - **Audio Manager** — Web Speech API for TTS, HTMLAudioElement for SFX, queue management to prevent overlap.
  - **UI Controller** — Home Base, world navigation, Sticker Book, mini-game shells.
- **Persistence:** `localStorage` for sticker book and last-visited world.
- **PWA:** Manifest + service worker for offline play and "Add to Home Screen" on iOS Safari.
- **Hosting:** Vercel (static deploy).
- **Build tool:** Vite.

### 8.2 File layout (proposed)

```
animal-keys/
├── public/
│   ├── animals/         # cartoon illustrations (PNG)
│   ├── sounds/          # animal SFX (MP3)
│   ├── ambient/         # world ambient loops
│   ├── icons/           # PWA icons
│   └── manifest.json
├── src/
│   ├── main.js
│   ├── engine/
│   │   ├── gameState.js
│   │   ├── keyHandler.js
│   │   ├── animalPicker.js
│   │   └── minigames.js
│   ├── render/
│   │   ├── letter.js
│   │   ├── animal.js
│   │   ├── worldScene.js
│   │   └── animations.css
│   ├── audio/
│   │   ├── tts.js
│   │   └── sfxPlayer.js
│   ├── ui/
│   │   ├── homeBase.js
│   │   ├── stickerBook.js
│   │   └── mineGameUI.js
│   └── data/
│       └── animals.json
├── index.html
├── vite.config.js
└── package.json
```

### 8.3 Audio strategy
- **TTS:** Use `SpeechSynthesisUtterance` with a preferred voice (English, child-friendly if available). Cache `speechSynthesis.getVoices()` once.
- **Voice selection:** Prefer voices containing "Samantha", "Google US English", or similar warm voices. Fallback to system default.
- **SFX:** Preload all animal sounds for the current world on world entry to avoid lag on first press.
- **Queue:** New keypress immediately calls `speechSynthesis.cancel()` and stops any playing SFX before starting the new sequence.

### 8.4 Performance targets
- First paint: < 1 second on desktop.
- Time from keypress to letter visible: < 100ms.
- Time from keypress to first audio: < 200ms.
- World transition: < 500ms.

---

## 9. Implementation roadmap

### Phase 1 — Core loop (Week 1)
- Vite project scaffold + Vercel deploy pipeline.
- Single hardcoded world (Jungle), one animal per letter.
- Key handler + letter render + TTS sequence (letter, sound, name).
- Animal render + click-to-dismiss.
- Basic SFX playback.

### Phase 2 — Worlds & sticker book (Week 2)
- Home Base map.
- All three worlds with themed backgrounds.
- Multiple animals per letter with cycling.
- Sticker book screen + `localStorage` persistence.

### Phase 3 — Mini-games (Week 3)
- Find the Letter.
- Find the Animal.
- Celebration animations.

### Phase 4 — Polish & PWA (Week 4)
- Asset replacement with final illustrations.
- Service worker + manifest + iOS Safari home-screen testing.
- Ambient world sounds.
- Cross-browser testing (Chrome, Safari desktop).
- Soft launch: Eli plays. Observe and iterate.

---

## 10. Success metrics

For a personal project, formal analytics are overkill. Success will be measured qualitatively:

- **Engagement:** Eli asks to play it again unprompted.
- **Recognition:** Eli can correctly point to 5+ letters on a printed keyboard after 2 weeks of play.
- **Vocabulary:** Eli names 10+ new animals he didn't know before.
- **Independence:** Eli can open the app, pick a world, and play without adult help.
- **Reliability:** Zero crashes across 20 sessions of play.

---

## 11. Open questions

### 11.1 X, Q, Z handling
Few real animals start with X or Q in a way a 4-year-old will recognize. Options:
- Use creative choices ("X-ray fish", "Quail", "Zebra") and accept that some letters have only one animal.
- Allow "made up" friendly creatures with explicit naming.
- Decision needed before content production starts.

### 11.2 Letter case
v1 shows uppercase only. Should the home-screen icon and world labels also be uppercase for consistency, or use title case? Lean: uppercase everywhere a child sees a letter.

### 11.3 TTS voice consistency across browsers
Web Speech API voices vary significantly between Chrome and Safari, and even between OS versions. May produce inconsistent experiences. Consider upgrading to pre-recorded audio in v1.1 if Web Speech proves unreliable.

### 11.4 Mini-game entry visibility
Should mini-game buttons be visible in the world (risking distraction from free play), or hidden behind a small menu icon? Lean: small, friendly buttons at the bottom corner.

### 11.5 Animation library
Hand-rolled CSS keyframes versus a lightweight library like Motion One. Lean: CSS for v1, revisit if more complex animations are needed.

### 11.6 Asset sourcing
Final illustrations need to come from somewhere — commissioned, AI-generated (Midjourney/DALL·E), or sourced from a stock library. Decision affects timeline significantly. Open-source asset packs (Kenney, OpenGameArt) could fill the gap for an MVP.

---

## 12. Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Web Speech API quality varies across browsers | High | Medium | Test early on target device. Pre-record audio if unacceptable. |
| 4-year-old smashes keyboard, sequences overlap | High | Low | Robust cancel-on-new-keypress logic; test with rapid input. |
| Sticker book becomes overwhelming with 60+ animals | Medium | Low | Group by world; keep visual density low. |
| Asset production blocks launch | Medium | High | Use placeholder open-source assets for Phase 1–3; swap in final art at Phase 4. |
| iOS Safari PWA quirks (audio autoplay, home-screen behavior) | Medium | Medium | Defer PWA polish to Phase 4 after core experience is locked. |
| Eli gets bored after a week | Low | Medium | Sticker book and mini-games add depth; can add new worlds in v2. |

---

## 13. Future enhancements (post-v1)

- Lowercase letter mode (toggle).
- Spelling mode: type the animal's name.
- New worlds: Arctic, Desert, Backyard, Dinosaurs.
- Multiple kid profiles.
- Parent dashboard with progress stats.
- Tablet-optimized on-screen keyboard.
- Achievements / badges beyond stickers.
- Animal facts ("Bears can run 35 mph!") for older siblings.
- Localization (Spanish, French letter names and animal names).

---

*End of PRD.*
