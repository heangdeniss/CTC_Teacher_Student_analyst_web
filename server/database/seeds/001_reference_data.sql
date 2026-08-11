-- =====================================================================
-- Seed 001: reference data
--   * theme_exclusions  — no-content themes removed before any analysis
--   * answer_options    — raw Khmer answer -> code / label / score
-- Idempotent: safe to re-run.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- Theme exclusions.
-- The first block is what actually occurs in Unstructuerd.csv; the
-- second block is defensive cover for equivalent wordings that may
-- appear in future classification runs.
-- NOTE: 'Other / Unclassified' IS excluded — it is an explicit
-- unclassified bucket, not a substantive "Other" theme. A theme is only
-- excluded for containing "Other" when it is paired with Unclassified.
-- ---------------------------------------------------------------------
INSERT INTO theme_exclusions (theme, reason) VALUES
  ('Unclassified',            'Classifier could not assign a substantive theme'),
  ('Other / Unclassified',    'Explicit unclassified residual bucket'),
  ('No Improvement Needed',   'Respondent reported no improvement content'),
  ('No Challenge Reported',   'Respondent reported no challenge content'),
  ('No Subject Mentioned',    'Respondent named no subject'),
  ('No Negative Impact',      'Respondent reported no negative impact content'),
  ('No Comment Provided',     'Respondent left no comment'),
  ('No Outstanding Point',    'Respondent reported no outstanding point'),
  ('No Suggestion',           'Respondent made no suggestion'),
  ('No AI Tool Used',         'Respondent named no AI tool'),
  -- defensive equivalents
  ('No Improvement recorded', 'Equivalent no-content category'),
  ('No Challenge recorded',   'Equivalent no-content category'),
  ('No Strength recorded',    'Equivalent no-content category'),
  ('No Benefit recorded',     'Equivalent no-content category'),
  ('No Change recorded',      'Equivalent no-content category'),
  ('No Response',             'Equivalent no-content category'),
  ('No response',             'Equivalent no-content category'),
  ('None',                    'Equivalent no-content category'),
  ('N/A',                     'Equivalent no-content category'),
  ('NA',                      'Equivalent no-content category'),
  ('n/a',                     'Equivalent no-content category'),
  ('-',                       'Placeholder value')
ON CONFLICT (theme) DO UPDATE SET reason = EXCLUDED.reason;

-- ---------------------------------------------------------------------
-- Answer option mapping (documentation + ETL lookup).
-- ---------------------------------------------------------------------
INSERT INTO answer_options (raw_value, code, label_en, score) VALUES
  ('ពិត',                            'yes',       'True / Improved',      1.00),
  ('មិនពិត',                          'no',        'Not true / No gain',   0.00),
  ('ដូចមុនដដែល',                      'no_change', 'Same as before',       0.50),
  ('ដូចមុនដដែល ពុំមានការប្រែប្រួល',      'no_change', 'Same as before, no change', 0.50),
  ('យកចិត្តទុកដាក់ដូចគ្នា',              'no_change', 'Equally attentive',    0.50)
ON CONFLICT (raw_value) DO UPDATE
  SET code = EXCLUDED.code, label_en = EXCLUDED.label_en, score = EXCLUDED.score;

COMMIT;
