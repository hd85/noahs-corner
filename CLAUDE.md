# Noah's Corner — Claude Code Brief

## What this is

A web app for my son Noah (5) to practice expressing his thoughts and build genuine confidence. This is NOT a reward/gamification app. It's a calm, simple practice tool built around a specific insight about how Noah works.

## The insight that drives everything

Noah doesn't have a confidence problem with audiences — he has a confidence problem with his *own thoughts*. He needs to learn that what he thinks is worth saying. Every design decision flows from this.

The real confidence exercise is not in the app. It's the closing moment where he's asked to tell a real human one thing he picked.

---

## The rung system

Invisible to Noah. Automatic. Based on session count.

### Rung 1 (Sessions 0–11): React questions
"Which would you pick?" — two vivid, concrete options. Tap A or B. No words required. Nothing to get wrong.

### Rung 2 (Sessions 12–27): Pick + one reason
Same A/B choice, then one reason. One thing only. Doesn't need to be clever.

### Rung 3 (Sessions 28+): Open prompts
Imaginative, specific, no-wrong-answer questions. *"If you could add one secret rule to football, what would it be?"* — contained and silly enough that there's nothing to get wrong.

**Important:** Every session starts at Rung 1 (a warm-up react question) regardless of level, then advances to his current rung. The first question is always safe.

Rung labels shown on home screen: `Exploring` / `Sharing` / `Storytelling`. Never framed as levels or progress.

---

## Topic system — evolves over time

Every session generates **fresh questions via the Anthropic API** (never repeat).

**Comfort zone (always include some):**
- Arsenal FC and football
- Formula 1 racing
- Mario (video games, characters, worlds)
- Stillwater the tiger cartoon
- World maps and countries
- Big numbers and counting
- Lions, tigers, animals
- Bluey cartoon
- **The Prophets of the Quran** (Ibrahim, Musa, Isa, Yusuf, Nuh, Dawud, Sulaiman, Yunus, Adam — stories he knows from Ramadan reading with dad)

**Expanding (gradually introduce — ratio increases with sessions):**
Outer space and planets · the deep ocean and sea creatures · ancient Egypt and pyramids · weather and storms · cooking and food from different countries · musical instruments · volcanoes · trains and railways · rainforests · birds of prey · the Arctic and penguins · dinosaurs · robots and inventions · how things are made · different languages and scripts · mountains and rivers · knights and castles · the human body

Comfort:expanding ratio starts at ~90:10 and drifts toward ~60:40 by session 30.

---

## Two modes

### Together Mode (Dad + Noah)
- Dad always goes first — answers the question out loud before Noah
- Noah sees Dad answer, then it's his turn
- Dad is never the questioner — he's a co-participant
- For Rung 2, after Noah picks, Dad types a quick note of Noah's reason
- Kitchen cabinet pattern: side by side, equal roles

### Solo Mode (Noah alone)
- Simpler UI — no "Dad goes first" step
- Same prompts, same rungs
- Rung 2: app says "tell someone your reason!" — doesn't require input
- Rung 3: big friendly prompt, tap "I answered it!" when done

---

## Session shape

1. Home screen → pick mode
2. 3 prompts (always start with one Rung 1 warm-up, then current rung)
3. Recap screen: shows what Noah picked/said
4. Closing moment: **"Can you tell someone what you picked today? Just one thing."**

Sessions should take 3–5 minutes. No more.

---

## Reading layer (v2 — build after core loop works)

Noah is reading Bob Books and enjoying them. Add an optional reading moment, not a separate app.

- One short decodable sentence per session, generated to match Bob Books phonics level (CVC words, short vowels, high-frequency sight words).
- Appears between prompt 2 and prompt 3, framed as "read this one out loud."
- Tap-to-hear-the-word support: tapping a word reveals it broken into sounds (`c-a-t`), never speaks it for him.
- Never scored. Never corrected. If he skips it, the session continues.
- Sentences should reuse the session's topic words where phonically possible (`the cat is in the van` beats generic filler).
- Store a simple `nc-reading-level` (1–5) in localStorage, advanced manually by Dad, not by the app.

This is the monetization seam if it ever becomes one — a calm, non-gamified reading companion for parents who hate gamified reading apps. Build it right, don't build it to sell.

---

## Design direction

**Feel:** Warm picture book. Calm. A cozy corner of the house, not a game.

**NOT:** Loud, flashy, gamified, stars-exploding, countdown timers, league tables, streaks that feel like pressure.

**Typography:** Baloo 2 (Google Font) — rounded, friendly, not baby-ish

**Palette:**
| Token | Hex | Use |
|---|---|---|
| Background | `#FAF6EE` | warm cream |
| Paper | `#FFFDF7` | cards |
| Brown | `#2C1810` | headings |
| Brown mid | `#5C3D2E` | body |
| Amber | `#E8832A` | primary action |
| Amber light | `#FDF3E3` | amber fills |
| Amber border | `#F2C484` | amber outlines |
| Sage | `#4A7C59` | Noah's selections, positive states |
| Sage bg | `#EDF4EF` | sage fills |
| Sage border | `#A8D4B4` | sage outlines |
| Muted | `#9E8B7B` | secondary text |
| Muted light | `#C4B5A5` | tertiary text |
| Sky | `#4D7FA8` | Dad's answers |
| Sky bg | `#EBF3FA` | Dad's answer fills |

**When Noah picks something:** quiet visual acknowledgment — card highlights in sage green. No explosion. Just: received.

**When session ends:** small warm summary. No scores. No stars. Just what he said.

---

## Technical spec

- **Framework:** React + Vite
- **Styling:** Inline styles (no Tailwind, no CSS modules — keep it portable)
- **API:** Anthropic API for question generation. Use `claude-sonnet-4-6`.
- **Storage:** localStorage — keys `nc-sessions`, `nc-history`, `nc-reading-level`
- **No backend** — purely client-side
- **Mobile-first** — used on a phone/tablet

### Prompt template (Rung 1)

```
Create 3 "which would you pick" questions for a 5-year-old named Noah.
Each has two vivid, concrete options. Topics this session: ${topics}.
At least one should gently introduce something new (not just his usual favourites).
For Prophet questions: frame as "which story would you want to hear again" or
"which Prophet's adventure sounds more exciting" — reverent but age-appropriate.
Options: 2–4 words + emoji. Return ONLY valid JSON:
{"prompts":[{"question":"...","a":{"label":"...","emoji":"..."},"b":{"label":"...","emoji":"..."}}]}
```

Rung 2 and Rung 3 use the same shape with an added `reason_prompt` and an open `question` field respectively.

Always validate the JSON. If parsing fails, fall back to a small hardcoded prompt bank rather than showing an error. Noah should never see a loading failure.

---

## File structure

```
noahs-corner/
├── index.html
├── package.json
├── vite.config.js
├── .env.example              ← VITE_ANTHROPIC_API_KEY=your_key_here
├── CLAUDE.md                 ← this file
└── src/
    ├── main.jsx
    ├── App.jsx               ← root, screen routing, session state
    ├── api.js                ← Anthropic calls, prompt templates, JSON validation
    ├── fallback.js           ← hardcoded prompt bank for API failure
    ├── topics.js             ← topic lists, session-based mixing logic
    ├── rungs.js              ← rung calculation, session shape logic
    ├── reading.js            ← v2: decodable sentence generation
    ├── screens/
    │   ├── Home.jsx
    │   ├── Session.jsx
    │   ├── Reading.jsx       ← v2
    │   └── Recap.jsx
    └── components/
        ├── ChoiceCard.jsx
        ├── ActionBtn.jsx
        └── ModeBtn.jsx
```

---

## Build order

1. Scaffold Vite + React, palette and typography as constants
2. `rungs.js` and `topics.js` — pure logic, no UI
3. `api.js` + `fallback.js` — get JSON generation reliable before any screens
4. Home → Session → Recap with hardcoded prompts
5. Wire in live API
6. localStorage persistence
7. Ship. Use it with Noah for two weeks.
8. Only then: reading layer

---

## The north star

Every design decision should ask: *does this make Noah feel like his thoughts are worth saying?*

Not: does this make him feel like a winner.
