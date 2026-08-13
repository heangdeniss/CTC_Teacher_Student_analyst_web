import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'language';

/**
 * Static UI copy — every fixed label, heading, tooltip and helper string in
 * the dashboard chrome. Chart/KPI data values (numbers, percentages, school
 * names) are never part of this dictionary; only the words around them are.
 *
 * Khmer entries are contextual translations for a Cambodian education
 * analytics audience (MoEYS-style register), not literal dictionary
 * translations — see DATA_LABELS below for the same principle applied to
 * data-driven category/theme/indicator names.
 */
const UI = {
  en: {
    // App chrome
    appTitle: 'CTC Student Analytics',
    sidebarSubtitle: 'Student Analytics',
    // Nav / page titles
    navOverview: 'Overview',
    navProfile: 'Student Profile & Access',
    navImpact: 'Positive Student Outcomes',
    navDigitalSkills: 'Digital Skills & AI',
    navLearningExperience: 'Learning Experience',
    navRisk: 'Risk & Improvement',
    pageOverview: 'Executive Overview',
    pageProfile: 'Student Profile & Access',
    pageImpact: 'Positive Student Outcomes',
    pageDigitalSkills: 'Digital Skills & AI',
    pageLearningExperience: 'Learning Experience',
    pageRisk: 'Risk & Improvement',

    // PageHeader
    students: 'students',
    school: 'school',
    schoolsPlural: 'schools',
    inCurrentSelection: 'in current selection',

    // Filters
    filters: 'Filters',
    filterSchool: 'School',
    filterGrade: 'Grade',
    filterGender: 'Gender',
    filterAge: 'Age',
    all: 'All',
    selected: 'selected',
    search: 'Search',
    noMatches: 'No matches',
    clear: 'Clear',
    resetAllFilters: 'Reset all filters',

    // States
    loading: 'Loading',
    loadingDashboard: 'Loading dashboard',
    couldNotLoad: 'Could not load this view',
    checkApiRunning: 'Check that the API is running and the database has been imported',
    noDataMatches: 'No data matches the current filters.',
    methodology: 'Methodology',

    // Key insights
    keyInsights: 'Key Insights',
    strongestOutcome: 'Strongest Outcome',
    needsAttention: 'Needs Attention',
    majorRisk: 'Major Risk',
    topImprovementPriority: 'Top Improvement Priority',

    // KPI labels — shared across pages
    totalStudents: 'Total Students',
    schools: 'Schools',
    studentOutcomeIndex: 'Student Outcome Index',
    digitalSkillsIndex: 'Digital Skills Index',
    learningExperienceIndex: 'Learning Experience Index',
    aiAdoptionRate: 'AI Adoption Rate',
    largestGradeGroup: 'Largest Grade Group',
    largestGenderGroup: 'Largest Gender Group',
    personalDeviceAccess: 'Personal Device Access',
    studentsWithoutDevice: 'Students Without Personal Device',
    learningMotivation: 'Learning Motivation',
    stemInterest: 'STEM Interest',
    independentLearning: 'Independent Learning',
    futureConfidence: 'Future Confidence',
    universityAspiration: 'University Aspiration',
    codingSkillsImprovement: 'Coding Skills Improvement',
    internetSafety: 'Internet Safety',
    independentOnlineLearning: 'Independent Online Learning',
    widestSkillGap: 'Widest Skill Gap',
    infrastructure: 'Infrastructure',
    teacherSupport: 'Teacher Support',
    studentEngagement: 'Student Engagement',
    practicalLearning: 'Practical Learning',
    weakestIndicator: 'Weakest Indicator',
    negativeImpactRate: 'Negative Impact Rate',
    academicPressure: 'Academic Pressure',
    subjectTradeoff: 'Subject Trade-off',
    studentsReportingChallenges: 'Students Reporting Challenges',
    topChallenge: 'Top Challenge',
    topImprovementRequest: 'Top Improvement Request',

    // KPI tooltips
    tooltipStudentOutcomeIndex: 'Mean of 10 outcome indicators, each scored 0–100. 50 marks no change; higher is better.',
    tooltipDigitalSkillsIndex: 'Mean of 10 digital-skill indicators, each scored 0–100. 50 marks no change; higher is better.',
    tooltipLearningExperienceIndex: 'Mean of 13 experience indicators, each scored 0–100. 50 marks no change; higher is better.',
    tooltipAiAdoptionRate: 'Share of students who report being able to use AI tools.',
    tooltipPersonalDeviceAccess: 'Owns at least one personal device — computer, smartphone or tablet.',
    tooltipStudentsWithoutDevice: 'Reports no personal device — relies on school equipment.',

    // Chart / section titles
    topImprovementPriorities: 'Top Improvement Priorities',
    aiAdoption: 'AI Adoption',
    studentsByGrade: 'Students by Grade',
    studentsByGender: 'Students by Gender',
    studentsByAge: 'Students by Age',
    studentsBySchool: 'Students by School',
    centreServiceUse: 'Centre Service Use',
    deviceAccessBySchool: 'Device Access by School',
    positiveOutcomeIndicators: 'Positive Outcome Indicators',
    responseDistribution: 'Response Distribution',
    positiveImpactThemes: 'Positive Impact Themes',
    digitalSkillsChart: 'Digital Skills',
    skillResponseDistribution: 'Skill Response Distribution',
    mostUsedAiTools: 'Most-used AI Tools',
    preferredDigitalSubjects: 'Preferred Digital Subjects',
    experienceDimensions: 'Experience Dimensions',
    learningIndicators: 'Learning Indicators',
    reportedNegativeImpacts: 'Reported Negative Impacts',
    riskResponseDistribution: 'Risk Response Distribution',
    challenges: 'Challenges',
    improvementPriorities: 'Improvement Priorities',

    // Distribution legends
    improvedAgree: 'Improved / agree',
    noChange: 'No change',
    noDisagree: 'No / disagree',
    noNegativeEffect: 'No negative effect',
    sameAsBefore: 'Same as before',
    reportsThisEffect: 'Reports this effect',

    // Table headers
    tableStudents: 'Students',
    tablePercentOfStudents: '% of Students',
    tableComputer: 'Computer',
    tableSmartphone: 'Smartphone',
    tableTablet: 'Tablet',
    tableNoDevice: 'No Device',

    // Small connective text
    ofStudents: 'of students',
    ofAiUsers: 'of AI users',
    agreeShort: 'agree',
    canUseAiTools: 'Can use AI tools',
    cannotUseAiTools: 'Cannot use AI tools',
    ofStudentsSuffix: 'of students',
    score: 'Score',
    studentsSeries: 'Students',
    shareOfStudents: 'Share of students',
  },
  kh: {
    appTitle: 'CTC ការវិភាគទិន្នន័យសិស្ស',
    sidebarSubtitle: 'ការវិភាគទិន្នន័យសិស្ស',
    navOverview: 'ទិដ្ឋភាពទូទៅ',
    navProfile: 'ប្រវត្តិរូបសិស្ស និងលទ្ធភាពប្រើប្រាស់',
    navImpact: 'លទ្ធផលវិជ្ជមានរបស់សិស្ស',
    navDigitalSkills: 'ជំនាញឌីជីថល និង AI',
    navLearningExperience: 'បទពិសោធន៍ការសិក្សា',
    navRisk: 'ហានិភ័យ និងចំណុចត្រូវកែលម្អ',
    pageOverview: 'ទិដ្ឋភាពទូទៅសង្ខេប',
    pageProfile: 'ប្រវត្តិរូបសិស្ស និងលទ្ធភាពប្រើប្រាស់',
    pageImpact: 'លទ្ធផលវិជ្ជមានរបស់សិស្ស',
    pageDigitalSkills: 'ជំនាញឌីជីថល និង AI',
    pageLearningExperience: 'បទពិសោធន៍ការសិក្សា',
    pageRisk: 'ហានិភ័យ និងចំណុចត្រូវកែលម្អ',

    students: 'សិស្ស',
    school: 'សាលារៀន',
    schoolsPlural: 'សាលារៀន',
    inCurrentSelection: 'ក្នុងការជ្រើសរើសបច្ចុប្បន្ន',

    filters: 'តម្រង',
    filterSchool: 'សាលារៀន',
    filterGrade: 'ថ្នាក់',
    filterGender: 'ភេទ',
    filterAge: 'អាយុ',
    all: 'ទាំងអស់',
    selected: 'បានជ្រើសរើស',
    search: 'ស្វែងរក',
    noMatches: 'រកមិនឃើញ',
    clear: 'សម្អាត',
    resetAllFilters: 'កំណត់តម្រងទាំងអស់ឡើងវិញ',

    loading: 'កំពុងផ្ទុក',
    loadingDashboard: 'កំពុងផ្ទុកទិន្នន័យផ្ទាំងគ្រប់គ្រង',
    couldNotLoad: 'មិនអាចផ្ទុកទិន្នន័យនេះបានទេ',
    checkApiRunning: 'សូមពិនិត្យមើលថាតើប្រព័ន្ធ API កំពុងដំណើរការ ហើយទិន្នន័យត្រូវបាននាំចូលរួចហើយឬនៅ',
    noDataMatches: 'គ្មានទិន្នន័យត្រូវនឹងតម្រងបច្ចុប្បន្នទេ។',
    methodology: 'វិធីសាស្ត្រគណនា',

    keyInsights: 'ចំណុចវិភាគសំខាន់ៗ',
    strongestOutcome: 'លទ្ធផលល្អបំផុត',
    needsAttention: 'ត្រូវការការយកចិត្តទុកដាក់',
    majorRisk: 'ហានិភ័យសំខាន់',
    topImprovementPriority: 'ចំណុចដែលត្រូវកែលម្អជាចម្បង',

    totalStudents: 'សិស្សសរុប',
    schools: 'សាលារៀន',
    studentOutcomeIndex: 'សន្ទស្សន៍លទ្ធផលសិស្ស',
    digitalSkillsIndex: 'សន្ទស្សន៍ជំនាញឌីជីថល',
    learningExperienceIndex: 'សន្ទស្សន៍បទពិសោធន៍ការសិក្សា',
    aiAdoptionRate: 'អត្រាការប្រើប្រាស់ AI',
    largestGradeGroup: 'ថ្នាក់ដែលមានសិស្សច្រើនជាងគេ',
    largestGenderGroup: 'ភេទដែលមានសិស្សច្រើនជាងគេ',
    personalDeviceAccess: 'លទ្ធភាពប្រើប្រាស់ឧបករណ៍ផ្ទាល់ខ្លួន',
    studentsWithoutDevice: 'សិស្សគ្មានឧបករណ៍ផ្ទាល់ខ្លួន',
    learningMotivation: 'ការជម្រុញទឹកចិត្តក្នុងការសិក្សា',
    stemInterest: 'ចំណាប់អារម្មណ៍លើ STEM',
    independentLearning: 'ការសិក្សាដោយខ្លួនឯង',
    futureConfidence: 'ទំនុកចិត្តលើអនាគត',
    universityAspiration: 'បំណងចូលរៀនសាកលវិទ្យាល័យ',
    codingSkillsImprovement: 'ការរីកចម្រើនជំនាញសរសេរកូដ',
    internetSafety: 'សុវត្ថិភាពអ៊ីនធឺណិត',
    independentOnlineLearning: 'ការសិក្សាតាមអនឡាញដោយខ្លួនឯង',
    widestSkillGap: 'គម្លាតជំនាញធំបំផុត',
    infrastructure: 'ហេដ្ឋារចនាសម្ព័ន្ធ',
    teacherSupport: 'ការគាំទ្រពីគ្រូបង្រៀន',
    studentEngagement: 'ការចូលរួមរបស់សិស្ស',
    practicalLearning: 'ការសិក្សាអនុវត្តន៍ជាក់ស្តែង',
    weakestIndicator: 'សូចនាករខ្សោយបំផុត',
    negativeImpactRate: 'អត្រាផលប៉ះពាល់អវិជ្ជមាន',
    academicPressure: 'សម្ពាធការសិក្សា',
    subjectTradeoff: 'ការលះបង់មុខវិជ្ជា',
    studentsReportingChallenges: 'សិស្សដែលជួបការលំបាក',
    topChallenge: 'បញ្ហាប្រឈមចម្បង',
    topImprovementRequest: 'តម្រូវការកែលម្អចម្បង',

    tooltipStudentOutcomeIndex: 'តម្លៃមធ្យមនៃសូចនាករលទ្ធផល ១០ ប្រភេទ គិតជាពិន្ទុ ០–១០០។ ពិន្ទុ ៥០ មានន័យថាគ្មានការផ្លាស់ប្តូរ រីឯពិន្ទុខ្ពស់មានន័យល្អជាង។',
    tooltipDigitalSkillsIndex: 'តម្លៃមធ្យមនៃសូចនាករជំនាញឌីជីថល ១០ ប្រភេទ គិតជាពិន្ទុ ០–១០០។ ពិន្ទុ ៥០ មានន័យថាគ្មានការផ្លាស់ប្តូរ រីឯពិន្ទុខ្ពស់មានន័យល្អជាង។',
    tooltipLearningExperienceIndex: 'តម្លៃមធ្យមនៃសូចនាករបទពិសោធន៍ការសិក្សា ១៣ ប្រភេទ គិតជាពិន្ទុ ០–១០០។ ពិន្ទុ ៥០ មានន័យថាគ្មានការផ្លាស់ប្តូរ រីឯពិន្ទុខ្ពស់មានន័យល្អជាង។',
    tooltipAiAdoptionRate: 'ភាគរយសិស្សដែលរាយការណ៍ថាអាចប្រើប្រាស់ឧបករណ៍ AI បាន។',
    tooltipPersonalDeviceAccess: 'មានឧបករណ៍ផ្ទាល់ខ្លួនយ៉ាងតិចមួយ — កុំព្យូទ័រ ស្មាតហ្វូន ឬថេប្លេត។',
    tooltipStudentsWithoutDevice: 'រាយការណ៍ថាគ្មានឧបករណ៍ផ្ទាល់ខ្លួន — ពឹងផ្អែកលើឧបករណ៍សាលារៀន។',

    topImprovementPriorities: 'ចំណុចដែលត្រូវកែលម្អ',
    aiAdoption: 'ការប្រើប្រាស់ AI',
    studentsByGrade: 'សិស្សតាមថ្នាក់',
    studentsByGender: 'សិស្សតាមភេទ',
    studentsByAge: 'សិស្សតាមអាយុ',
    studentsBySchool: 'សិស្សតាមសាលារៀន',
    centreServiceUse: 'ការប្រើប្រាស់សេវាកម្មមជ្ឈមណ្ឌល',
    deviceAccessBySchool: 'លទ្ធភាពប្រើប្រាស់ឧបករណ៍តាមសាលារៀន',
    positiveOutcomeIndicators: 'សូចនាករលទ្ធផលវិជ្ជមាន',
    responseDistribution: 'ការចែកចាយចម្លើយឆ្លើយតប',
    positiveImpactThemes: 'ប្រធានបទឥទ្ធិពលវិជ្ជមាន',
    digitalSkillsChart: 'ជំនាញឌីជីថល',
    skillResponseDistribution: 'ការចែកចាយចម្លើយអំពីជំនាញ',
    mostUsedAiTools: 'ឧបករណ៍ AI ដែលប្រើប្រាស់ច្រើនជាងគេ',
    preferredDigitalSubjects: 'មុខវិជ្ជាឌីជីថលដែលពេញចិត្ត',
    experienceDimensions: 'វិមាត្របទពិសោធន៍ការសិក្សា',
    learningIndicators: 'សូចនាករការសិក្សា',
    reportedNegativeImpacts: 'ផលប៉ះពាល់អវិជ្ជមានដែលបានរាយការណ៍',
    riskResponseDistribution: 'ការចែកចាយចម្លើយអំពីហានិភ័យ',
    challenges: 'បញ្ហាប្រឈម',
    improvementPriorities: 'អាទិភាពដែលត្រូវកែលម្អ',

    improvedAgree: 'ប្រសើរឡើង / យល់ព្រម',
    noChange: 'គ្មានការផ្លាស់ប្តូរ',
    noDisagree: 'ទេ / មិនយល់ព្រម',
    noNegativeEffect: 'គ្មានផលប៉ះពាល់អវិជ្ជមាន',
    sameAsBefore: 'ដដែលដូចមុន',
    reportsThisEffect: 'រាយការណ៍ថាមានផលប៉ះពាល់នេះ',

    tableStudents: 'សិស្ស',
    tablePercentOfStudents: '% នៃសិស្ស',
    tableComputer: 'កុំព្យូទ័រ',
    tableSmartphone: 'ស្មាតហ្វូន',
    tableTablet: 'ថេប្លេត',
    tableNoDevice: 'គ្មានឧបករណ៍',

    ofStudents: 'នៃសិស្ស',
    ofAiUsers: 'នៃអ្នកប្រើប្រាស់ AI',
    agreeShort: 'យល់ព្រម',
    canUseAiTools: 'អាចប្រើប្រាស់ AI',
    cannotUseAiTools: 'មិនអាចប្រើប្រាស់ AI',
    ofStudentsSuffix: 'នៃសិស្ស',
    score: 'ពិន្ទុ',
    studentsSeries: 'សិស្ស',
    shareOfStudents: 'ភាគរយសិស្ស',
  },
};

/**
 * Data-driven labels — theme names, survey indicators, category names, etc.
 * that come back from the API as English strings. Keyed by the exact English
 * value; anything not listed here (product/brand names like "ChatGPT",
 * "Canva", already-Khmer school names) is deliberately left untranslated and
 * falls back to the original string.
 */
const DATA_LABELS = {
  // Gender
  Female: 'ស្រី',
  Male: 'ប្រុស',
  Other: 'ផ្សេងទៀត',
  // Age bands
  '13–15 years': '១៣–១៥ ឆ្នាំ',
  '16–18 years': '១៦–១៨ ឆ្នាំ',
  '18–20 years': '១៨–២០ ឆ្នាំ',
  // Grades
  'Grade 10': 'ថ្នាក់ទី១០',
  'Grade 11': 'ថ្នាក់ទី១១',
  'Grade 12': 'ថ្នាក់ទី១២',
  // Devices
  Smartphone: 'ស្មាតហ្វូន',
  Computer: 'កុំព្យូទ័រ',
  Tablet: 'ថេប្លេត',
  'No personal device': 'គ្មានឧបករណ៍ផ្ទាល់ខ្លួន',
  // Centre services
  'Short courses': 'វគ្គសិក្សាខ្លីៗ',
  'Coffee shop': 'ហាងកាហ្វេ',
  'Post office': 'ការិយាល័យប្រៃសណីយ៍',
  'No service used': 'មិនប្រើប្រាស់សេវាកម្មណាមួយ',
  // Favourite digital subjects
  'General IT': 'បច្ចេកវិទ្យាព័ត៌មានទូទៅ',
  'Graphic Design': 'ការរចនាក្រាហ្វិក',
  Research: 'ការស្រាវជ្រាវ',
  'General Academic Subjects': 'មុខវិជ្ជាសិក្សាទូទៅ',
  'Digital Marketing': 'ទីផ្សារឌីជីថល',
  // Digital skills indicators
  'Computer & internet knowledge': 'ចំណេះដឹងកុំព្យូទ័រ និងអ៊ីនធឺណិត',
  'Google Docs & email': 'Google Docs និងអ៊ីមែល',
  'Independent online learning': 'ការសិក្សាតាមអនឡាញដោយខ្លួនឯង',
  'Internet research': 'ការស្រាវជ្រាវលើអ៊ីនធឺណិត',
  'Password security': 'សុវត្ថិភាពពាក្យសម្ងាត់',
  'Presentation skills': 'ជំនាញធ្វើបទបង្ហាញ',
  'Understands internet safety risks': 'យល់ដឹងពីហានិភ័យសុវត្ថិភាពអ៊ីនធឺណិត',
  'Digital design & content': 'ការរចនា និងផលិតមាតិកាឌីជីថល',
  'Can use AI tools': 'អាចប្រើប្រាស់ឧបករណ៍ AI',
  'Coding skills': 'ជំនាញសរសេរកូដ',
  // Learning experience dimensions
  Infrastructure: 'ហេដ្ឋារចនាសម្ព័ន្ធ',
  'Practical Learning': 'ការសិក្សាអនុវត្តន៍ជាក់ស្តែង',
  Engagement: 'ការចូលរួម',
  'Teacher Support': 'ការគាំទ្រពីគ្រូបង្រៀន',
  // Learning indicators
  'Teachers explain in time': 'គ្រូបង្រៀនពន្យល់បានទាន់ពេលវេលា',
  'Lessons are engaging': 'មេរៀនទាក់ទាញចំណាប់អារម្មណ៍',
  'Enough computers & equipment': 'មានកុំព្យូទ័រ និងឧបករណ៍គ្រប់គ្រាន់',
  'Active teaching methods used': 'ការប្រើវិធីបង្រៀនសកម្ម',
  'Gets to work in groups': 'បានធ្វើការងារជាក្រុម',
  'Good internet connection': 'ការតភ្ជាប់អ៊ីនធឺណិតល្អ',
  'Enough access for self-study': 'មានលទ្ធភាពគ្រប់គ្រាន់សម្រាប់សិក្សាដោយខ្លួនឯង',
  'Learns differently than before': 'សិក្សាតាមរបៀបថ្មីខុសពីមុន',
  'Researches / prepares before class': 'ស្រាវជ្រាវ/រៀបចំមុនចូលថ្នាក់',
  'Enough practice time': 'មានពេលវេលាអនុវត្តគ្រប់គ្រាន់',
  'Gets to present': 'បានធ្វើបទបង្ហាញ',
  'Enjoys digital learning': 'ចូលចិត្តការសិក្សាតាមប្រព័ន្ធឌីជីថល',
  'Teachers are more attentive': 'គ្រូបង្រៀនយកចិត្តទុកដាក់ជាងមុន',
  // Positive outcome indicators (impact.indicators)
  'Aspires to university': 'មានបំណងចូលរៀនសាកលវិទ្យាល័យ',
  'Has equal educational opportunity': 'មានឱកាសសិក្សាស្មើភាពគ្នា',
  'Confident about the future': 'មានទំនុកចិត្តលើអនាគត',
  'Studies independently': 'សិក្សាដោយខ្លួនឯង',
  'Confident in own education': 'មានទំនុកចិត្តលើការសិក្សារបស់ខ្លួន',
  'Wants to study more': 'ចង់សិក្សាបន្ថែមទៀត',
  'More interested in STEM': 'មានចំណាប់អារម្មណ៍ខ្លាំងឡើងចំពោះ STEM',
  'Improved discipline': 'វិន័យប្រសើរឡើង',
  'Willing to join competitions': 'មានឆន្ទៈចូលរួមការប្រកួតប្រជែង',
  'Braver / more self-assured': 'ក្លាហាន និងមានទំនុកចិត្តលើខ្លួនឯងជាងមុន',
  // Positive impact themes
  'New Knowledge & Learning Gains': 'ចំណេះដឹងថ្មី និងការរីកចម្រើនក្នុងការសិក្សា',
  'Digital Skills': 'ជំនាញឌីជីថល',
  'Research & Information Literacy': 'ជំនាញស្រាវជ្រាវ និងចំណេះដឹងព័ត៌មាន',
  'Academic Motivation & Engagement': 'ការលើកទឹកចិត្ត និងការចូលរួមក្នុងការសិក្សា',
  'Confidence & Courage': 'ទំនុកចិត្ត និងភាពក្លាហាន',
  'Career Readiness': 'ការត្រៀមខ្លួនសម្រាប់អាជីព',
  'Facility & Environment Satisfaction': 'ការពេញចិត្តលើទីតាំង និងបរិយាកាសសិក្សា',
  'Discipline & Order': 'វិន័យ និងសណ្តាប់ធ្នាប់',
  Creativity: 'ភាពច្នៃប្រឌិត',
  'Social Connection': 'ទំនាក់ទំនងសង្គម',
  'Time-Saving': 'សន្សំសំចៃពេលវេលា',
  'Personal Growth': 'ការរីកចម្រើនផ្ទាល់ខ្លួន',
  // Risk indicators
  'Uses phone more than before': 'ប្រើទូរស័ព្ទច្រើនជាងមុន',
  'Feels more academic pressure': 'មានអារម្មណ៍សម្ពាធការសិក្សាកាន់តែខ្លាំង',
  'Gave up other subjects': 'បោះបង់មុខវិជ្ជាផ្សេងទៀត',
  // Negative impact / challenge themes
  'Physical Strain': 'ភាពហត់នឿយផ្នែករាងកាយ',
  Complexity: 'ភាពស្មុគស្មាញ',
  'Facility & Environment Issues': 'បញ្ហាទីតាំង និងបរិយាកាស',
  'Technical & Internet Issues': 'បញ្ហាបច្ចេកទេស និងអ៊ីនធឺណិត',
  'Insufficient Learning Time': 'ពេលវេលាសិក្សាមិនគ្រប់គ្រាន់',
  'Time Consumption': 'ចំណាយពេលច្រើន',
  'Cost Issues': 'បញ្ហាចំណាយថវិកា',
  'Language Barrier': 'ឧបសគ្គភាសា',
  'Equipment Deficits': 'កង្វះឧបករណ៍',
  'Time Constraints': 'កម្រិតកំណត់ពេលវេលា',
  // Improvement themes
  'Teaching Methods & Curriculum': 'វិធីសាស្ត្របង្រៀន និងកម្មវិធីសិក្សា',
  'Discipline, Environment & Space': 'វិន័យ បរិយាកាស និងទីតាំង',
  'Equipment Upgrades': 'ការធ្វើឱ្យប្រសើរឡើងនូវឧបករណ៍',
  'Practice Time': 'ពេលវេលាអនុវត្ត',
  'Internet & Network': 'អ៊ីនធឺណិត និងបណ្តាញ',
  // Overview key-insight labels
  'Increased academic pressure': 'សម្ពាធការសិក្សាកើនឡើង',
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children, parentLang, setParentLang }) {
  // Map parent language ('km' or 'en') to internal language key ('kh' or 'en')
  const lang = parentLang === 'en' ? 'en' : 'kh';

  useEffect(() => {
    document.documentElement.lang = lang === 'kh' ? 'km' : 'en';
  }, [lang]);

  const setLang = useCallback((next) => {
    // next is 'kh' or 'en'
    if (setParentLang) {
      setParentLang(next === 'kh' ? 'km' : next);
    }
  }, [setParentLang]);

  const t = useCallback((key) => UI[lang][key], [lang]);
  const td = useCallback((label) => (lang === 'kh' ? DATA_LABELS[label] ?? label : label), [lang]);

  const value = useMemo(() => ({ lang, setLang, t, td }), [lang, setLang, t, td]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside a LanguageProvider');
  return context;
}
