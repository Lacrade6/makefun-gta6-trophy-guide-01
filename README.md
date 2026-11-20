# Vice City Trophy Guide — Leonida Platinum Tracker

[![Competition](https://make.fun/badge/gta6-trophy-guide-01.svg?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/Lacrade6/makefun-gta6-trophy-guide-01/rank.svg?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/Lacrade6/makefun-gta6-trophy-guide-01/reward.svg?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI, built for the [make.fun gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01). Every trophy shows its official name, description and grade, a guide in our own words with a cited source beside it, and the one missable trophy is flagged everywhere it matters. A three-stage roadmap takes you from the story to 100% completion to the clean-up, and your progress is saved in your browser with export/import, filters, search and a spoiler-safe mode that hides story trophies until you earn them.

## Run it

```bash
node serve.ts        # serves app/ at http://localhost:8080
node main.ts         # hand-in: copies app/ + screenshots/ to /output (or $MAKEFUN_OUTPUT_DIR) and writes dossier.json
```

The app is plain static files — any static file server with `app/` at its root works, and it runs with the network off. Add `?demo=1` to the URL to see it with sample progress.

## What is inside

- `app/index.html` — page structure: hero, progress strip, filters, four views
- `app/style.css` — original sunset/neon theme
- `app/app.js` — tracker logic: localStorage progress, hash routing, export/import
- `app/data/trophies.json` — the 55 trophies with guides, steps and sources
- `app/data/roadmap.json` — the three-stage platinum roadmap
- `main.ts` — hand-in program (copies the app, builds the dossier)
- `serve.ts` — local static server for trying the app
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged
- `screenshots/` — four screenshots of the running app

## Sources

Guide text is written in our own words from [PowerPyx's GTA 6 Trophy Guide & Roadmap](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/) and [GTA Zone's GTA 6 Trophy List](https://gta-zone.com/news/gta-6-trophies-achievements/), cross-checked against the official PlayStation trophy lists published by Exophase and PSNProfiles on 18 Nov 2026. Every trophy in the app cites its source. Four trophies had no confirmed unlock method at launch — Bad Luck, I Guess and The Truth Is Out There are still unconfirmed, while In The Beginning… and Ten Pin are confirmed by their official descriptions — and their guides say so honestly instead of inventing a method.

---

Unofficial fan-made guide. Not affiliated with Rockstar Games or PlayStation. No game artwork, logos or fonts are used; the design is original.
