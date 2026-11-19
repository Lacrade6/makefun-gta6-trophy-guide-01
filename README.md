# Vice City Trophy Guide — Leonida Platinum Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Lacrade6/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Lacrade6/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

The best offline guide and tracker for the 55 PlayStation 5 trophies of
Grand Theft Auto VI: every trophy with its official name, description and
grade, a detailed guide in our own words with a cited source for every fact,
a platinum roadmap with chapter order, hour estimates and inline missable
warnings, and a tracker that saves progress in the browser with export,
import, filters and a spoiler setting. Static files only — it opens in
desktop Chrome and works with the network off.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Or serve `app/` with any static server.

To hand it in (the grader's entrypoint):

```sh
node main.ts
```

`main.ts` copies `app/` and `screenshots/` to `/output` (or
`$MAKEFUN_OUTPUT_DIR`) and writes `/output/dossier.json` with the vendored
make.fun library.

## What is inside

- `app/index.html` — the guide: dashboard, filters, checklist, roadmap.
- `app/app.js` — tracker logic: progress in localStorage, export/import,
  filters, search, spoiler setting, deep links (`#/trophy/28`, `#/roadmap`).
- `app/style.css` — Vice City sunset/neon look, our own design.
- `app/data/trophies.json` — all 55 trophies: official name, description,
  grade, kind, missable flag, chapter, and a guide with cited sources.
- `app/data/roadmap.json` — the platinum roadmap in three stages with hour
  estimates and point-of-no-return warnings.
- `screenshots/` — four captures of the running guide.

## Sources

Every guide cites its sources beside the trophy. The trophy list and the
roadmap facts come from the PowerPyx GTA 6 Trophy Guide & Roadmap and the
GTA Zone trophy list, cross-checked against the Exophase and PSNProfiles
lists as published on 18 November 2026. Guide text is written in our own
words; sources are cited, never copied. Four trophies had no confirmed
unlock method at launch — the guide says so honestly and points the reader
to the source page for updates instead of inventing one.

---

<sub>Entered in the make.fun gta6-trophy-guide-01 bounty. GTA VI, Vice City
and Leonida are properties of their owners; this is an unofficial fan-made
guide with no Rockstar Games logo, artwork or fonts.</sub>
