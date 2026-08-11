-- =====================================================================
-- ម.ប.ស. Student Survey Analytics — Core schema
-- Migration 001: tables, domains, reference data
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- Domain for the three-point survey answer scale.
-- Raw Khmer answers are mapped to stable codes during ETL:
--   ពិត                            -> 'yes'        (true / improved)
--   មិនពិត                          -> 'no'         (not true / no improvement)
--   ដូចមុនដដែល                      -> 'no_change'  (same as before)
--   ដូចមុនដដែល ពុំមានការប្រែប្រួល      -> 'no_change'  (same as before, no change)
--   យកចិត្តទុកដាក់ដូចគ្នា              -> 'no_change'  (attentive equally — teachers_more_attentive only)
-- Binary questions only ever produce 'yes' / 'no'.
-- ---------------------------------------------------------------------
CREATE DOMAIN answer_code AS TEXT
  CHECK (VALUE IN ('yes', 'no', 'no_change'));

-- ---------------------------------------------------------------------
-- student_responses — one row per student response.
-- School name is kept directly on this table (no school dimension).
-- ---------------------------------------------------------------------
CREATE TABLE student_responses (
  respondent_id            INTEGER      PRIMARY KEY,
  response_id              TEXT         NOT NULL UNIQUE,
  submitted_at             TIMESTAMP    NOT NULL,

  -- ---- demographics & access -------------------------------------
  gender                   TEXT         NOT NULL,
  gender_en                TEXT         NOT NULL,
  grade                    TEXT         NOT NULL,
  grade_number             SMALLINT     NOT NULL,
  age_band                 TEXT         NOT NULL,   -- normalised Khmer label
  age_band_en              TEXT         NOT NULL,   -- English label for charts
  age_band_order           SMALLINT     NOT NULL,
  high_school              TEXT         NOT NULL,   -- school name kept here by design

  devices_owned_raw        TEXT         NOT NULL,
  has_computer             BOOLEAN      NOT NULL,
  has_smartphone           BOOLEAN      NOT NULL,
  has_tablet               BOOLEAN      NOT NULL,
  has_no_device            BOOLEAN      NOT NULL,
  device_count             SMALLINT     NOT NULL,

  services_used_raw        TEXT         NOT NULL,
  used_short_courses       BOOLEAN      NOT NULL,
  used_coffee_shop         BOOLEAN      NOT NULL,
  used_post_office         BOOLEAN      NOT NULL,
  used_no_service          BOOLEAN      NOT NULL,

  -- ---- objective 2: student impact -------------------------------
  want_study_more                  answer_code NOT NULL,
  stem_interest                    answer_code NOT NULL,
  self_study                       answer_code NOT NULL,
  equal_opportunity                answer_code NOT NULL,
  future_confidence                answer_code NOT NULL,
  uni_aspiration                   answer_code NOT NULL,
  education_confidence             answer_code NOT NULL,
  better_discipline                answer_code NOT NULL,
  braver                           answer_code NOT NULL,
  join_competitions                answer_code NOT NULL,

  -- ---- objective 3: digital skills & AI --------------------------
  better_computer_internet_skills  answer_code NOT NULL,
  better_email_docs                answer_code NOT NULL,
  better_presentations             answer_code NOT NULL,
  better_design_content            answer_code NOT NULL,
  better_internet_research         answer_code NOT NULL,
  can_use_ai                       answer_code NOT NULL,
  understand_cyber_risks           answer_code NOT NULL,
  better_password_management       answer_code NOT NULL,
  better_coding_skills             answer_code NOT NULL,
  better_self_learning             answer_code NOT NULL,
  skills_useful_future             answer_code NOT NULL,
  share_skills_with_community      answer_code NOT NULL,

  -- ---- objective 4: learning experience --------------------------
  adequate_computers               answer_code NOT NULL,
  good_internet                    answer_code NOT NULL,
  enough_practice_time             answer_code NOT NULL,
  enough_access_for_self_study     answer_code NOT NULL,
  teachers_explain_timely          answer_code NOT NULL,
  teachers_more_attentive          answer_code NOT NULL,
  active_teaching_methods          answer_code NOT NULL,
  engaging_lessons                 answer_code NOT NULL,
  enjoy_digital                    answer_code NOT NULL,
  different_method                 answer_code NOT NULL,
  presentation_opportunities       answer_code NOT NULL,
  teamwork_opportunities           answer_code NOT NULL,
  prepare_before_class             answer_code NOT NULL,
  know_internal_rules              answer_code NOT NULL,

  -- ---- objective 5: risk -----------------------------------------
  study_pressure                   answer_code NOT NULL,
  drop_other_subjects              answer_code NOT NULL,
  use_phone_more                   answer_code NOT NULL,

  -- ---- advocacy / satisfaction -----------------------------------
  told_parents                     answer_code NOT NULL,
  parents_satisfied                answer_code NOT NULL,
  told_others                      answer_code NOT NULL,

  -- ---- open-ended source text (kept for drill-down / traceability)
  open_positive_impacts        TEXT,
  open_negative_impacts        TEXT,
  open_ai_tools_used           TEXT,
  open_favorite_subjects       TEXT,
  open_suggestions             TEXT,
  open_outstanding_points      TEXT,
  open_areas_for_improvement   TEXT,
  open_challenges              TEXT,
  open_other_comments          TEXT
);

COMMENT ON TABLE  student_responses IS 'One row per student survey response. School name is stored inline by design — no school dimension table.';
COMMENT ON COLUMN student_responses.high_school IS 'Normalised school name (whitespace collapsed, canonical prefix spacing).';

CREATE INDEX idx_sr_high_school ON student_responses (high_school);
CREATE INDEX idx_sr_grade       ON student_responses (grade);
CREATE INDEX idx_sr_gender      ON student_responses (gender);
CREATE INDEX idx_sr_age_band    ON student_responses (age_band);
CREATE INDEX idx_sr_filters     ON student_responses (high_school, grade, gender, age_band);

-- ---------------------------------------------------------------------
-- response_themes — classified qualitative responses (long format).
-- One respondent may have many themes across many question types.
-- ---------------------------------------------------------------------
CREATE TABLE response_themes (
  id             BIGSERIAL PRIMARY KEY,
  respondent_id  INTEGER NOT NULL REFERENCES student_responses (respondent_id) ON DELETE CASCADE,
  theme          TEXT    NOT NULL,
  question_type  TEXT    NOT NULL,
  CONSTRAINT uq_response_theme UNIQUE (respondent_id, theme, question_type)
);

CREATE INDEX idx_rt_respondent    ON response_themes (respondent_id);
CREATE INDEX idx_rt_theme         ON response_themes (theme);
CREATE INDEX idx_rt_question_type ON response_themes (question_type);
CREATE INDEX idx_rt_qt_theme      ON response_themes (question_type, theme);

-- ---------------------------------------------------------------------
-- theme_exclusions — the "no content / not classified" registry.
-- Filtering meaningless themes is a DATA-LAYER concern; the frontend
-- never has to know these values exist.
-- ---------------------------------------------------------------------
CREATE TABLE theme_exclusions (
  theme   TEXT PRIMARY KEY,
  reason  TEXT NOT NULL
);

COMMENT ON TABLE theme_exclusions IS 'Themes that carry no analytical content. Excluded from every theme metric via the meaningful_response_themes view.';

-- ---------------------------------------------------------------------
-- answer_options — documentation / lookup of the raw response mapping.
-- ---------------------------------------------------------------------
CREATE TABLE answer_options (
  raw_value   TEXT PRIMARY KEY,
  code        TEXT NOT NULL,
  label_en    TEXT NOT NULL,
  score       NUMERIC(3,2) NOT NULL
);

-- ---------------------------------------------------------------------
-- import_runs — reproducibility log for the ETL process.
-- ---------------------------------------------------------------------
CREATE TABLE import_runs (
  id                   BIGSERIAL PRIMARY KEY,
  started_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at          TIMESTAMPTZ,
  structured_file      TEXT NOT NULL,
  unstructured_file    TEXT NOT NULL,
  structured_rows_read INTEGER,
  structured_rows_kept INTEGER,
  theme_rows_read      INTEGER,
  theme_rows_kept      INTEGER,
  report               JSONB
);

COMMIT;
