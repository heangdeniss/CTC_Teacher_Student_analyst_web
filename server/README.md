# ម.ប.ស. Student Survey Analytics Dashboard

A six-page decision-support dashboard over 3,729 student survey responses from
17 high schools, answering: what impact is ម.ប.ស. having, how are digital
skills developing, how good is the learning experience, what risks exist, and
what should be improved.

```
Structured.csv ─┐
                ├─→ ETL (validate → clean → load) ─→ PostgreSQL ─→ NestJS API ─→ React dashboard
Unstructuerd.csv┘
```

The raw CSVs are read-only inputs. The frontend never reads them; it only
calls the API, which computes every figure in SQL at request time.

## Requirements

PostgreSQL 14+, Node.js 20+.

## Setup

```bash
createdb mbs_survey

cd backend
cp .env.example .env          # adjust DATABASE_URL if needed
npm install
npm run db:setup              # migrate schema, then validate + clean + load both CSVs
npm run start:dev             # API on :3000
```

The dashboard itself isn't a separate app in this folder anymore — it's the
"Student Analyst" view inside the main app, at `src/student/` in the repo
root. Run it from there:

```bash
cd ..                         # back to the repo root
npm install
npm run dev                   # whole app on :5173 (or next free port), /api proxied to :3000
```

`npm run db:setup` is idempotent — rerun it any time to rebuild the database
from the raw files. Each run writes its row counts, integrity checks and
normalisation counts to the `import_runs` table.

## Verifying the import

```sql
SELECT report FROM import_runs ORDER BY id DESC LIMIT 1;
```

Expected for this extract: 3,729 structured rows read and kept, 34,878 theme
rows read and 34,322 kept (556 exact duplicates), 0 orphan respondent IDs, 0
unmapped answer values, 17 schools.

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
and theme query on the page, evaluated in SQL rather than in the browser.
Values within a filter are OR-ed; filters are AND-ed. **Reset all filters**
clears everything.

## API

| Endpoint | Returns |
| --- | --- |
| `GET /api/headline` | Counts, three indexes, adoption and risk rates |
| `GET /api/overview` | Page 1 payload including Key Insights |
| `GET /api/profile` | Page 2 payload |
| `GET /api/impact` | Page 3 payload |
| `GET /api/digital-skills` | Page 4 payload |
| `GET /api/learning-experience` | Page 5 payload |
| `GET /api/risk` | Page 6 payload |
| `GET /api/themes?questionType=&limit=` | Ranked meaningful themes |
| `GET /api/themes/question-types` | Available question types |
| `GET /api/themes/exclusions` | The theme exclusion registry, with reasons |
| `GET /api/filters/options` | Filter values with student counts |
| `GET /api/students` | Paged student rows |
| `GET /api/students/data-quality` | Import counts and integrity checks |

All analytics endpoints accept the same filter parameters:
`?schools=&grades=&genders=&ages=` (repeatable or comma-separated).

## Structure

```
server/
├── data/raw/                Structured.csv, Unstructuerd.csv (read-only)
├── database/
│   ├── migrations/          001 schema, 002 analytics views
│   └── seeds/               answer options, indicator catalog, theme exclusions
├── backend/src/
│   ├── etl/                 validate, normalise, load, integrity report
│   ├── common/filters.ts    the one shared SQL filter clause
│   └── modules/             analytics, themes, students, filters
└── documentation/
    ├── data_dictionary.md
    ├── metric_dictionary.md
    └── theme_filter_rules.md
```

The frontend that used to live here now lives in the main app instead, at
`src/student/` in the repo root:

```
src/student/
├── charts/                  ranked bars, stacked bars, donut, grouped bars, heatmap
├── components/              layout, KPI card, chart card, filters, table
└── pages/                   the six pages
```

Analytical logic lives in SQL and the analytics service. Components receive
computed values and render them; they never recalculate or re-sort.

## Two things worth knowing before reading the numbers

**Theme filtering.** 16,460 of 34,322 classified theme rows are no-content
placeholders (`Unclassified`, `No Suggestion`, and similar). They are excluded
in the database view every theme query reads, so they cannot reach a chart.
The registry is a table, not code — see `documentation/theme_filter_rules.md`.

**Index interpretation.** The three indexes score 0–100 with "no change"
scored 50, so values cluster high. The signal is in the ranking of indicators,
dimensions and schools, not the absolute level. Full formulas, weighting and
missing-value handling are in `documentation/metric_dictionary.md`.

## Production build

```bash
cd backend && npm run build && npm run start:prod
```

The frontend builds as part of the main app now — from the repo root:

```bash
npm run build      # static output in dist/, Student Analyst included
```

Set `CORS_ORIGIN` on the API and `VITE_STUDENT_API_URL` on the frontend when
the two are served from different origins (locally, the dev proxy in the
main app's `vite.config.js` avoids needing either).
