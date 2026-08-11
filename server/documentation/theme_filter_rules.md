# Theme Filter Rules

The classifier assigns a theme to every open response, including the ones that
contained no content. Those placeholder categories are large — 16,460 of the
34,322 theme rows — and would dominate every ranking if left in.

## Where filtering happens

In the **data layer**, not the frontend:

```sql
CREATE VIEW meaningful_response_themes AS
SELECT id, respondent_id, theme, question_type
  FROM response_themes rt
 WHERE theme IS NOT NULL
   AND btrim(theme) <> ''
   AND NOT EXISTS (SELECT 1 FROM theme_exclusions te WHERE te.theme = rt.theme);
```

Every theme query in the API reads this view. `response_themes` keeps the raw
classifier output so the exclusion is auditable and reversible, but no
dashboard visual can reach it. The registry is served read-only at
`GET /api/themes/exclusions`.

## Result

| | Rows | Distinct themes |
| --- | --- | --- |
| `response_themes` | 34,322 | 70 |
| Excluded | 16,460 | 10 |
| `meaningful_response_themes` | 17,862 | 60 |

## Excluded values present in this dataset

| Theme | Rows | Reason |
| --- | --- | --- |
| Unclassified | 6,699 | Classifier could not assign a substantive theme |
| No Challenge Reported | 1,805 | No challenge content |
| No Comment Provided | 1,689 | No comment |
| No Improvement Needed | 1,514 | No improvement content |
| No Suggestion | 1,458 | No suggestion made |
| Other / Unclassified | 1,130 | Explicit unclassified residual bucket |
| No Outstanding Point | 890 | No outstanding point named |
| No Negative Impact | 645 | No negative impact content |
| No Subject Mentioned | 519 | No subject named |
| No AI Tool Used | 111 | No tool named |

## Also registered, not present in this extract

Kept in `theme_exclusions` so a future extract is filtered on arrival:
`No Improvement recorded`, `No Challenge recorded`, `No Strength recorded`,
`No Benefit recorded`, `No Change recorded`, `No response`, `No Response`,
`None`, `N/A`, `NA`, `n/a`, `-`.

## How the list was derived

All 70 distinct theme values were reviewed individually against their raw open
responses. A value is excluded only when it reports the *absence* of content —
never because it is small, negative, or awkward. Adding an exclusion is a one
row insert:

```sql
INSERT INTO theme_exclusions (theme, reason) VALUES ('<value>', '<why>');
```

No code change, no redeploy; the view and every endpoint pick it up
immediately.

## "Other" is not a reason to exclude

`Other / Unclassified` is excluded because it is the classifier's explicit
residual bucket — it names no content. Themes that merely contain a general
word are legitimate findings and are retained:

* `General Academic Subjects`
* `General IT`
* `Google (General Search/Suite)`

The test is whether the value carries information about what the student said,
not whether its label sounds vague.

## Where the filter applies

Every theme surface in the dashboard reads the filtered view: theme charts,
theme rankings, improvement priorities, impact themes, challenge themes,
AI tools, favourite subjects, theme KPI cards, and the Key Insights panel on
the Overview page.

Because "no content" rows are removed rather than counted as zero, the
denominator for *responder share* is students who said something meaningful
for that question — stated explicitly on each chart so the base is never
ambiguous.
