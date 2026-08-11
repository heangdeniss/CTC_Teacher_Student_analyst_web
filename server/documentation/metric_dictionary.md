# Metric Dictionary

Every figure in the dashboard is computed from PostgreSQL at request time.
No KPI value is hard-coded anywhere in the frontend.

## 1. The answer scale

All index items share one three-point scale, mapped in `answer_options`:

| Raw Khmer value | Code | Score |
| --- | --- | --- |
| ពិត | `yes` | 1.00 |
| ដូចមុនដដែល | `no_change` | 0.50 |
| ដូចមុនដដែល ពុំមានការប្រែប្រួល | `no_change` | 0.50 |
| យកចិត្តទុកដាក់ដូចគ្នា | `no_change` | 0.50 |
| មិនពិត | `no` | 0.00 |

`no_change` sits at the midpoint because it reports *no deterioration and no
gain* — treating it as 0 would understate the programme, treating it as 1
would overstate it.

## 2. Index formula

All three indexes use the same shape and **equal weighting**. The survey
supplies no importance weights, so no other weighting is justifiable.

```
indicator_score(student, item) = answer_score(answer)          -- 0, 0.5 or 1

student_index(student, index)  = 100 × mean(indicator_score)   -- over items where in_index
                                 for that index

index(cohort)                  = mean(student_index)           -- over students in the
                                 current filter selection
```

Two properties follow, and both are intentional:

* The index is a **mean of student means**, so every student counts once
  regardless of how many items they answered.
* Filtering changes the cohort, not the formula, so an index is always
  comparable across slices.

**Missing values.** The survey has no missing Likert answers — all 39 items
are `NOT NULL` and every raw value mapped to a known code (`unknownAnswerValues`
is empty in `import_runs`). The formula nevertheless handles them correctly:
`avg()` ignores NULLs, so a student is scored on the items they answered and
is never imputed to zero. If a future extract contains gaps, the index stays
valid and `responses` (`n`) on each indicator shows the base.

**Interpretation.** 0–100, higher is better. 50 is the "no change" line: a
score of 50 means the average student reported no movement at all. Because
`no_change` is scored 0.5, scores cluster well above 50 — the useful signal is
the *ranking* of indicators, dimensions and schools rather than the absolute
level. The KPI cards band scores as ≥90 strong, 80–89 solid, 70–79 watch,
<70 weak.

## 3. Student Impact Index (SII)

Source: 10 items, all `in_index`, equally weighted.

| Dimension | Item |
| --- | --- |
| Learning Motivation | Wants to study more |
| STEM Interest | More interested in STEM |
| Independent Learning | Studies independently |
| Educational Opportunity | Has equal educational opportunity |
| Future Confidence | Confident about the future |
| University Aspiration | Aspires to university |
| Educational Confidence | Confident in own education |
| Personal Development | Improved discipline |
| Personal Development | Braver / more self-assured |
| Personal Development | Willing to join competitions |

Covers all eight impact objectives; Personal Development is measured by three
items rather than one, which is why the dimension view is reported alongside
the indicator view.

## 4. Digital Skills Index (DSI)

Source: 10 capability items, equally weighted — computer/internet knowledge,
Google Docs & email, presentation, digital design, internet research, AI,
internet safety, password security, coding, independent online learning.

Excluded from the index (`in_index = false`) but shown on Page 4:
*Skills useful for the future* and *Shares skills with the community*. These
measure **perceived value**, not capability; mixing them in would inflate a
capability index with attitude.

Related rates, each `100 × share answering yes`:

| KPI | Item |
| --- | --- |
| AI adoption rate | `can_use_ai` |
| Coding rate | `better_coding_skills` |
| Internet safety rate | `understand_cyber_risks` |
| Independent online learning rate | `better_self_learning` |

**Skill gap** = indicator score − DSI, reported for indicators below the
average. It identifies the training priorities *within* the current selection,
so it moves when filters change.

## 5. Learning Experience Index (LEI)

Source: 13 items across four dimensions, equally weighted.

| Dimension | Items |
| --- | --- |
| Infrastructure | Enough computers, good internet, enough practice time, enough access for self-study |
| Teacher Support | Explain in time, more attentive, active teaching methods |
| Engagement | Engaging lessons, enjoys digital learning, learns differently than before |
| Practical Learning | Gets to present, gets to work in groups, researches/prepares before class |

*Knows the internal rules* is excluded from the index — it measures
awareness of policy, not the quality of the learning experience.

Dimension scores are the mean of the dimension's indicator scores (equal
weighting again), which is what the KPI cards and the school heatmap show.

## 6. Risk metrics

Risk items are **reverse-coded**: a higher share agreeing is a worse result.
They are reported as `yes` shares rather than index scores, and every risk
chart and KPI card uses inverted banding.

| Metric | Definition |
| --- | --- |
| Academic pressure rate | `100 × share(study_pressure = yes)` |
| Subject trade-off rate | `100 × share(drop_other_subjects = yes)` |
| Negative impact rate | `100 × share(study_pressure = yes OR drop_other_subjects = yes)` |
| Increased phone use | `100 × share(use_phone_more = yes)` — tracked, not counted as harm |
| Students reporting challenges | `COUNT(DISTINCT respondent_id)` with ≥1 meaningful `Challenge` theme |
| Challenge reporting rate | Students reporting challenges ÷ students in selection |

Negative impact deliberately combines only the two items that describe harm
to the student's education. Increased phone use is excluded from the harm
definition because the survey does not establish whether the extra use is
educational; folding it in would roughly triple the headline risk figure on
an ambiguous signal.

## 7. Access metrics

| Metric | Definition |
| --- | --- |
| Device access rate | `100 × share(NOT has_no_device)` |
| Computer / smartphone / tablet access | `100 × share(has_* )` |
| Device access by school | Same rates grouped by `high_school` |

Multi-select, so device shares sum to more than 100%.

## 8. Theme metrics

Computed only over `meaningful_response_themes` (see `theme_filter_rules.md`).

| Measure | Definition |
| --- | --- |
| Students | `COUNT(DISTINCT respondent_id)` holding the theme |
| Occurrences | `COUNT(*)` theme rows |
| Student share | Students ÷ students in the current selection |
| Responder share | Students ÷ students who gave any meaningful theme for that question type |

Both denominators are published because they answer different questions.
*Student share* says how widespread an issue is across the cohort;
*responder share* says how dominant it is among students who raised anything
at all. Rankings use distinct students, never occurrences, so a theme repeated
by a few students never outranks one raised by many.

## 9. Filter semantics

Global filters are school, grade, gender and age band. Within one filter,
values are OR-ed; across filters they are AND-ed. Filters are applied inside
SQL to every KPI, chart and theme query on the requested page, so the numbers
on a page always describe the same cohort. Every page header states the
student and school count for the current selection.

## 10. Rounding

Percentages and index scores are rounded to one decimal at the API boundary.
Counts are exact integers. Rounding is applied once, on output, so displayed
components can differ from a displayed total by up to 0.1.
