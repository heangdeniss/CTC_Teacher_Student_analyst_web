-- =====================================================================
-- Migration 002: analytical layer
--   * answer_score() scoring function
--   * indicator_catalog (which question belongs to which index)
--   * student_indicator_scores (long format, one row per student/indicator)
--   * student_metrics (wide format, three indexes per student)
--   * meaningful_response_themes (theme filtering enforced in the data layer)
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- Response mapping. Equal-interval 3-point scale:
--   yes = 1.0, no_change = 0.5, no = 0.0
-- An index is the mean of its member indicator scores x 100 (0-100).
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION answer_score(code TEXT)
RETURNS NUMERIC
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT CASE code
           WHEN 'yes'       THEN 1.0
           WHEN 'no_change' THEN 0.5
           WHEN 'no'        THEN 0.0
         END::NUMERIC;
$$;

COMMENT ON FUNCTION answer_score(TEXT) IS
  'Maps a survey answer code to a 0-1 score. NULL answers return NULL and are excluded pairwise from every mean.';

-- ---------------------------------------------------------------------
-- indicator_catalog — the single source of truth for index membership.
-- Changing an index composition means changing data here, not code.
-- ---------------------------------------------------------------------
CREATE TABLE indicator_catalog (
  indicator_key  TEXT PRIMARY KEY,
  index_code     TEXT NOT NULL CHECK (index_code IN ('SII', 'DSI', 'LEI', 'RISK', 'SUPPORT')),
  dimension      TEXT NOT NULL,
  label_en       TEXT NOT NULL,
  in_index       BOOLEAN NOT NULL DEFAULT TRUE,
  higher_is_better BOOLEAN NOT NULL DEFAULT TRUE,
  display_order  SMALLINT NOT NULL
);

INSERT INTO indicator_catalog
  (indicator_key, index_code, dimension, label_en, in_index, higher_is_better, display_order) VALUES
-- Student Impact Index (10 indicators, equal weight)
 ('want_study_more',    'SII', 'Learning Motivation',    'Wants to study more',                       TRUE, TRUE,  1),
 ('stem_interest',      'SII', 'STEM Interest',          'More interested in STEM',                   TRUE, TRUE,  2),
 ('self_study',         'SII', 'Independent Learning',   'Studies independently',                     TRUE, TRUE,  3),
 ('equal_opportunity',  'SII', 'Educational Opportunity','Has equal educational opportunity',         TRUE, TRUE,  4),
 ('future_confidence',  'SII', 'Future Confidence',      'Confident about the future',                TRUE, TRUE,  5),
 ('uni_aspiration',     'SII', 'University Aspiration',  'Aspires to university',                     TRUE, TRUE,  6),
 ('education_confidence','SII','Educational Confidence', 'Confident in own education',                TRUE, TRUE,  7),
 ('better_discipline',  'SII', 'Personal Development',   'Improved discipline',                       TRUE, TRUE,  8),
 ('braver',             'SII', 'Personal Development',   'Braver / more self-assured',                TRUE, TRUE,  9),
 ('join_competitions',  'SII', 'Personal Development',   'Willing to join competitions',              TRUE, TRUE, 10),
-- Digital Skills Index (10 indicators, equal weight)
 ('better_computer_internet_skills','DSI','Foundational','Computer & internet knowledge',             TRUE, TRUE,  1),
 ('better_email_docs',             'DSI','Productivity', 'Google Docs & email',                       TRUE, TRUE,  2),
 ('better_presentations',          'DSI','Productivity', 'Presentation skills',                       TRUE, TRUE,  3),
 ('better_design_content',         'DSI','Creative',     'Digital design & content',                  TRUE, TRUE,  4),
 ('better_internet_research',      'DSI','Research',     'Internet research',                         TRUE, TRUE,  5),
 ('can_use_ai',                    'DSI','AI',           'Can use AI tools',                          TRUE, TRUE,  6),
 ('understand_cyber_risks',        'DSI','Safety',       'Understands internet safety risks',         TRUE, TRUE,  7),
 ('better_password_management',    'DSI','Safety',       'Password security',                         TRUE, TRUE,  8),
 ('better_coding_skills',          'DSI','Advanced',     'Coding skills',                             TRUE, TRUE,  9),
 ('better_self_learning',          'DSI','Autonomy',     'Independent online learning',               TRUE, TRUE, 10),
 ('skills_useful_future',          'DSI','Perceived Value','Skills useful for the future',            FALSE, TRUE, 11),
 ('share_skills_with_community',   'DSI','Perceived Value','Shares skills with the community',        FALSE, TRUE, 12),
-- Learning Experience Index (13 indicators, equal weight)
 ('adequate_computers',           'LEI','Infrastructure','Enough computers & equipment',              TRUE, TRUE,  1),
 ('good_internet',                'LEI','Infrastructure','Good internet connection',                  TRUE, TRUE,  2),
 ('enough_practice_time',         'LEI','Infrastructure','Enough practice time',                      TRUE, TRUE,  3),
 ('enough_access_for_self_study', 'LEI','Infrastructure','Enough access for self-study',              TRUE, TRUE,  4),
 ('teachers_explain_timely',      'LEI','Teacher Support','Teachers explain in time',                 TRUE, TRUE,  5),
 ('teachers_more_attentive',      'LEI','Teacher Support','Teachers are more attentive',              TRUE, TRUE,  6),
 ('active_teaching_methods',      'LEI','Teacher Support','Active teaching methods used',             TRUE, TRUE,  7),
 ('engaging_lessons',             'LEI','Engagement',    'Lessons are engaging',                      TRUE, TRUE,  8),
 ('enjoy_digital',                'LEI','Engagement',    'Enjoys digital learning',                   TRUE, TRUE,  9),
 ('different_method',             'LEI','Engagement',    'Learns differently than before',            TRUE, TRUE, 10),
 ('presentation_opportunities',   'LEI','Practical Learning','Gets to present',                       TRUE, TRUE, 11),
 ('teamwork_opportunities',       'LEI','Practical Learning','Gets to work in groups',                TRUE, TRUE, 12),
 ('prepare_before_class',         'LEI','Practical Learning','Researches / prepares before class',    TRUE, TRUE, 13),
 ('know_internal_rules',          'LEI','Awareness',     'Knows the internal rules',                  FALSE, TRUE, 14),
-- Risk indicators (never part of a positive index)
 ('study_pressure',       'RISK','Academic Pressure',   'Feels more academic pressure',               TRUE, FALSE, 1),
 ('drop_other_subjects',  'RISK','Subject Trade-off',   'Gave up other subjects',                     TRUE, FALSE, 2),
 ('use_phone_more',       'RISK','Screen Time',         'Uses phone more than before',                FALSE, FALSE, 3),
-- Supporting / advocacy indicators
 ('told_parents',      'SUPPORT','Advocacy','Told parents about the programme',                       FALSE, TRUE, 1),
 ('parents_satisfied', 'SUPPORT','Advocacy','Parents are satisfied',                                  FALSE, TRUE, 2),
 ('told_others',       'SUPPORT','Advocacy','Told friends / others',                                  FALSE, TRUE, 3);

-- ---------------------------------------------------------------------
-- student_indicator_scores — long format. One row per student per
-- indicator. Powers every ranking, gap and breakdown query.
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW student_indicator_scores AS
SELECT
  s.respondent_id,
  s.high_school,
  s.grade,
  s.gender,
  s.age_band,
  v.indicator_key,
  v.answer,
  answer_score(v.answer) AS score
FROM student_responses s
CROSS JOIN LATERAL (VALUES
  ('want_study_more', s.want_study_more), ('stem_interest', s.stem_interest),
  ('self_study', s.self_study), ('equal_opportunity', s.equal_opportunity),
  ('future_confidence', s.future_confidence), ('uni_aspiration', s.uni_aspiration),
  ('education_confidence', s.education_confidence), ('better_discipline', s.better_discipline),
  ('braver', s.braver), ('join_competitions', s.join_competitions),
  ('better_computer_internet_skills', s.better_computer_internet_skills),
  ('better_email_docs', s.better_email_docs), ('better_presentations', s.better_presentations),
  ('better_design_content', s.better_design_content), ('better_internet_research', s.better_internet_research),
  ('can_use_ai', s.can_use_ai), ('understand_cyber_risks', s.understand_cyber_risks),
  ('better_password_management', s.better_password_management), ('better_coding_skills', s.better_coding_skills),
  ('better_self_learning', s.better_self_learning), ('skills_useful_future', s.skills_useful_future),
  ('share_skills_with_community', s.share_skills_with_community),
  ('adequate_computers', s.adequate_computers), ('good_internet', s.good_internet),
  ('enough_practice_time', s.enough_practice_time), ('enough_access_for_self_study', s.enough_access_for_self_study),
  ('teachers_explain_timely', s.teachers_explain_timely), ('teachers_more_attentive', s.teachers_more_attentive),
  ('active_teaching_methods', s.active_teaching_methods), ('engaging_lessons', s.engaging_lessons),
  ('enjoy_digital', s.enjoy_digital), ('different_method', s.different_method),
  ('presentation_opportunities', s.presentation_opportunities), ('teamwork_opportunities', s.teamwork_opportunities),
  ('prepare_before_class', s.prepare_before_class), ('know_internal_rules', s.know_internal_rules),
  ('study_pressure', s.study_pressure), ('drop_other_subjects', s.drop_other_subjects),
  ('use_phone_more', s.use_phone_more),
  ('told_parents', s.told_parents), ('parents_satisfied', s.parents_satisfied), ('told_others', s.told_others)
) AS v(indicator_key, answer);

-- ---------------------------------------------------------------------
-- student_metrics — one row per student with the three indexes.
-- Each index = mean of its in-index member scores (equal weighting),
-- expressed 0-100. Missing answers are excluded pairwise (AVG ignores NULL).
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW student_metrics AS
WITH idx AS (
  SELECT
    sis.respondent_id,
    ic.index_code,
    AVG(sis.score) * 100 AS value
  FROM student_indicator_scores sis
  JOIN indicator_catalog ic
    ON ic.indicator_key = sis.indicator_key AND ic.in_index
  WHERE ic.index_code IN ('SII', 'DSI', 'LEI')
  GROUP BY sis.respondent_id, ic.index_code
)
SELECT
  s.respondent_id,
  s.high_school,
  s.grade,
  s.grade_number,
  s.gender,
  s.gender_en,
  s.age_band,
  s.age_band_en,
  s.age_band_order,
  s.has_computer,
  s.has_smartphone,
  s.has_tablet,
  s.has_no_device,
  MAX(CASE WHEN idx.index_code = 'SII' THEN idx.value END)::NUMERIC(5,2) AS student_impact_index,
  MAX(CASE WHEN idx.index_code = 'DSI' THEN idx.value END)::NUMERIC(5,2) AS digital_skills_index,
  MAX(CASE WHEN idx.index_code = 'LEI' THEN idx.value END)::NUMERIC(5,2) AS learning_experience_index,
  (s.can_use_ai = 'yes')                  AS ai_adopter,
  (s.better_coding_skills = 'yes')        AS coding_improved,
  (s.understand_cyber_risks = 'yes')      AS cyber_aware,
  (s.better_self_learning = 'yes')        AS self_learner,
  (s.study_pressure = 'yes')              AS reports_pressure,
  (s.drop_other_subjects = 'yes')         AS reports_subject_tradeoff,
  (s.use_phone_more = 'yes')              AS reports_more_phone_use,
  (s.study_pressure = 'yes' OR s.drop_other_subjects = 'yes') AS reports_negative_impact
FROM student_responses s
LEFT JOIN idx ON idx.respondent_id = s.respondent_id
GROUP BY s.respondent_id;

COMMENT ON VIEW student_metrics IS
  'Per-student indexes and flags. reports_negative_impact = academic pressure OR gave up other subjects; increased phone use is tracked separately because it is not unambiguously adverse.';

-- ---------------------------------------------------------------------
-- meaningful_response_themes — THE theme source for all analytics.
-- Every theme metric must read from this view, never response_themes.
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW meaningful_response_themes AS
SELECT rt.id, rt.respondent_id, rt.theme, rt.question_type
FROM response_themes rt
WHERE rt.theme IS NOT NULL
  AND btrim(rt.theme) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM theme_exclusions te WHERE te.theme = rt.theme
  );

COMMENT ON VIEW meaningful_response_themes IS
  'response_themes with all no-content / unclassified themes removed. Analytics and API layers must query this view only.';

COMMIT;
