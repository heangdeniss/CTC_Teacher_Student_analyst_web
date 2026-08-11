# Data Dictionary

Source of truth: `data/raw/Structured.csv` and `data/raw/Unstructuerd.csv`.
Both files are read-only and are never modified by the import.

All figures below were produced by the import run recorded in `import_runs`.

## 1. Volumes

| Measure | Value |
| --- | --- |
| Structured rows read | 3,729 |
| Structured rows loaded | 3,729 |
| Distinct respondents | 3,729 |
| Distinct schools | 17 |
| Theme rows read | 34,878 |
| Theme rows loaded | 34,322 |
| Exact duplicate theme rows dropped | 556 |
| Distinct themes | 70 |
| Distinct question types | 9 |
| Meaningful theme rows (after exclusions) | 17,862 |
| Distinct meaningful themes | 60 |

## 2. Referential integrity

Validated before analytics are built (`etl/import.ts`, persisted to `import_runs.report`):

| Check | Result |
| --- | --- |
| Respondent IDs in `Structured.csv` | 3,729 |
| Distinct respondent IDs in `Unstructuerd.csv` | 3,729 |
| Theme respondent IDs with no structured row | 0 |
| Structured respondents with no theme row | 0 |
| Duplicate respondent IDs | 0 |
| Invalid / non-numeric respondent IDs | 0 |
| Unmapped answer values | 0 |
| Unmapped age bands | 0 |

The relationship is one-to-many and complete in both directions.
`response_themes.respondent_id` carries a foreign key to `student_responses`.

## 3. `student_responses`

One row per student. Primary key `respondent_id`. School name is stored
directly on this table — there is no separate school dimension.

### Identity and submission

| Column | Type | Notes |
| --- | --- | --- |
| `respondent_id` | integer | PK, from the survey export |
| `response_id` | text | Original platform response ID |
| `submitted_at` | timestamp | Submission time |

### Demographics and access

| Column | Type | Values |
| --- | --- | --- |
| `gender` | text | `Female` (2,246), `Male` (1,454), `Other` (29) |
| `gender_en` | text | English label, same values |
| `grade` | text | `Grade 10` (1,180), `Grade 11` (1,344), `Grade 12` (1,205) |
| `grade_number` | smallint | 10 / 11 / 12 — sort key |
| `age_band` | text | Khmer band as collected |
| `age_band_en` | text | `13–15 years` (758), `16–18 years` (2,623), `18–20 years` (317), `Other` (31) |
| `age_band_order` | smallint | Sort key |
| `high_school` | text | 17 Khmer school names, prefix-normalised |
| `devices_owned_raw` | text | `;`-separated multi-select, cleaned |
| `has_computer` / `has_smartphone` / `has_tablet` | boolean | Derived flags |
| `has_no_device` | boolean | True only when no real device is ticked |
| `device_count` | smallint | 0–3 |
| `services_used_raw` | text | `;`-separated multi-select |
| `used_short_courses` / `used_coffee_shop` / `used_post_office` | boolean | Derived flags |
| `used_no_service` | boolean | True only when no real service is ticked |

### Survey items

39 Likert-style items are stored as the `answer_code` enum
(`yes` / `no_change` / `no`). They are grouped by `indicator_catalog`:

| Group | `index_code` | Columns |
| --- | --- | --- |
| Student impact | `SII` | `want_study_more`, `stem_interest`, `self_study`, `equal_opportunity`, `future_confidence`, `uni_aspiration`, `education_confidence`, `better_discipline`, `braver`, `join_competitions` |
| Digital skills | `DSI` | `better_computer_internet_skills`, `better_email_docs`, `better_presentations`, `better_design_content`, `better_internet_research`, `can_use_ai`, `understand_cyber_risks`, `better_password_management`, `better_coding_skills`, `better_self_learning`, `skills_useful_future`*, `share_skills_with_community`* |
| Learning experience | `LEI` | `adequate_computers`, `good_internet`, `enough_practice_time`, `enough_access_for_self_study`, `teachers_explain_timely`, `teachers_more_attentive`, `active_teaching_methods`, `engaging_lessons`, `enjoy_digital`, `different_method`, `presentation_opportunities`, `teamwork_opportunities`, `prepare_before_class`, `know_internal_rules`* |
| Risk | `RISK` | `study_pressure`, `drop_other_subjects`, `use_phone_more`* |
| Household support | `SUPPORT` | `told_parents`*, `parents_satisfied`*, `told_others`* |

`*` = tracked and displayed, but excluded from its index (`in_index = false`).
Reasons are given in `metric_dictionary.md`.

### Open-text columns

Retained verbatim for traceability; the classified themes are the analytical
source. `open_positive_impacts`, `open_negative_impacts`, `open_ai_tools_used`,
`open_favorite_subjects`, `open_suggestions`, `open_outstanding_points`,
`open_areas_for_improvement`, `open_challenges`, `open_other_comments`.
These are the only nullable columns in the table.

## 4. `response_themes`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | bigserial | PK |
| `respondent_id` | integer | FK → `student_responses` |
| `theme` | text | Classifier output, whitespace-normalised |
| `question_type` | text | Which open question the theme came from |

Indexes: `respondent_id`, `theme`, `question_type`, and a composite
`(question_type, theme)` for ranking queries.

One respondent can hold several themes for the same question type, so
student-level measures always use `COUNT(DISTINCT respondent_id)`.

### Question types

| `question_type` | Meaningful theme rows |
| --- | --- |
| Positive Impact | 4,941 |
| Favorite Subjects | 2,855 |
| AI Tools Used | 2,632 |
| Negative Impact | 1,851 |
| Outstanding Points | 1,508 |
| Areas for Improvement | 1,306 |
| Challenge | 1,188 |
| Suggestion | 1,135 |
| Other Comments | 446 |

## 5. Reference tables

| Table | Purpose |
| --- | --- |
| `answer_options` | Raw Khmer answer string → `answer_code` → numeric score |
| `indicator_catalog` | Indicator key, English label, dimension, index membership, direction, display order |
| `theme_exclusions` | Registry of no-content theme values (see `theme_filter_rules.md`) |
| `import_runs` | One row per import: row counts, integrity checks, normalisation counts |

## 6. Derived views

| View | Grain | Purpose |
| --- | --- | --- |
| `student_indicator_scores` | student × indicator | Unpivots the 42 answer columns and applies `answer_score()` |
| `student_metrics` | student | Three indexes plus risk and adoption flags, with filter columns |
| `meaningful_response_themes` | theme row | `response_themes` minus every value in `theme_exclusions` and minus blanks |

Views carry `high_school`, `grade`, `gender` and `age_band`, so the same
global filter clause applies identically to every query.

## 7. Cleaning rules applied at import

Implemented in `backend/src/etl/normalize.ts`.

| Issue found in the raw data | Rule |
| --- | --- |
| Zero-width characters, non-breaking spaces, inconsistent Unicode forms | NFC normalise, strip invisible characters, collapse whitespace |
| School prefix spacing (`វិទ្យាល័យហ៊ុន សែន` vs `វិទ្យាល័យ ហ៊ុន សែន`) | Canonical single space after the `វិទ្យាល័យ` prefix — 621 values corrected, resolving to 17 schools |
| Age band mixes Khmer and Arabic digits (`18 – 2០ ឆ្នាំ`), en dashes, and the misspelling `ផេង្សៗ` | Digits transliterated, dashes unified, misspelling mapped to `ផ្សេងៗ` |
| Grade written in Khmer numerals | Parsed to an integer, stored as `Grade N` plus `grade_number` |
| Gender in mixed Khmer and English | Mapped to `Female` / `Male` / `Other` |
| Multi-select fields tick both a real device and "none" | Real selections win; `has_no_device` recomputed from the flags |
| Four distinct Khmer phrasings of "no change" (one item uses "equally attentive") | All mapped to `no_change` via `answer_options` |
| AI tool spellings (`chatgtp`, `gimini`, `Gemeni`, `bard`, …) | Regex rules to canonical tool names |
| 556 exact duplicate theme rows | Deduplicated on `(respondent_id, theme, question_type)` |
| No-content theme categories | Excluded in the analytics layer — see `theme_filter_rules.md` |

Duplicate detection on the structured file was run on `respondent_id` and on
the full row hash; no duplicate student responses were present.
