# ម.ប.ស. Student Survey Analytics — data provenance

This folder is a **read-only historical record** of where the Student
Analyst dashboard's numbers came from. It is not runnable code — the
NestJS API and PostgreSQL database that originally computed these figures
have been removed from this repo (see "Why there's no backend here" below).

```
Structured.csv ─┐
                ├─→ ETL (validate → clean → load) ─→ PostgreSQL ─→ NestJS API ─→ React dashboard
Unstructuerd.csv┘        (removed)                     (removed)     (removed)
```

## Where the dashboard actually lives now

The live app is fully static — no backend, no database, nothing to run or
host beyond the website itself:

- **`src/student/data/`** (repo root) — a one-time JSON export of the
  cleaned PostgreSQL data this folder's pipeline used to produce:
  `students.json`, `themes.json` (already filtered to meaningful, non-blank
  themes), `indicators.json` (the indicator catalog).
- **`src/student/localData/`** (repo root) — `engine.js` and `pages.js`,
  a line-for-line JavaScript re-implementation of every formula that used to
  run as SQL, operating on that static export instead. Filtering, the three
  indexes, theme rankings — same logic, same numbers, just computed in the
  browser instead of a server.

Every page, chart, and component reads from that local engine exactly as it
would read from a live API — nothing about the dashboard's behavior changed
when the backend was removed.

## Why there's no backend here

This app is hosted on Vercel as a static site, which can't run a persistent
Node server or a database. Rather than pay for and maintain separate hosting
just for Student Analyst's data layer, the decision was to compute
everything once, export it, and ship it as part of the static site.

## What's still here, and why

- **`data/raw/`** — `Structured.csv` and `Unstructuerd.csv`, the original,
  untouched survey exports. Kept so the ultimate source of the numbers is
  traceable, even though nothing in this repo reads them anymore.
- **`documentation/`** — `data_dictionary.md`, `metric_dictionary.md`,
  `theme_filter_rules.md`. These describe the exact formulas
  `src/student/localData/engine.js` implements (the three index formulas,
  which themes get excluded as "no content" and why, filter semantics,
  rounding rules). Still the reference for *why* a number is what it is.

## If the survey data ever changes

The backend + PostgreSQL schema that turned the raw CSVs into
`src/student/data/*.json` were removed from this repo but are recoverable
from git history (they were committed before removal). Regenerating the
export means restoring that tooling, re-running the import against the new
raw CSVs, and re-running the same export queries — at which point
`src/student/localData/` keeps working unchanged, since it only depends on
the JSON shape, not on how it was produced.

## Pages

| Page | Question it answers |
| --- | --- |
| Overview | How successful is ម.ប.ស. overall? |
| Student Profile & Access | Who was surveyed and what can they access? |
| Student Impact | What changed for students? |
| Digital Skills & AI | Which skills are developing, and where are the gaps? |
| Learning Experience | How good is the day-to-day experience? |
| Risk & Improvement | What is going wrong, and what should be fixed first? |

School comparison lives inside the relevant pages — there is no separate
benchmark page.

## Filters

School, grade, gender and age band are global and apply to every KPI, chart
and theme query on the page. Values within a filter are OR-ed; filters are
AND-ed. **Reset all filters** clears everything.

## Two things worth knowing before reading the numbers

**Theme filtering.** 16,460 of 34,322 classified theme rows are no-content
placeholders (`Unclassified`, `No Suggestion`, and similar). They're excluded
from `src/student/data/themes.json` at export time, so they can never reach
a chart. The exclusion list is in `documentation/theme_filter_rules.md`.

**Index interpretation.** The three indexes score 0–100 with "no change"
scored 50, so values cluster high. The signal is in the ranking of
indicators, dimensions and schools, not the absolute level. Full formulas,
weighting and missing-value handling are in `documentation/metric_dictionary.md`.
