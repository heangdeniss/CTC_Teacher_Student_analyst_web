import re

with open('src/components/Dashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
content = content.replace(
    "import { translateData } from '../utils/dataTranslations';",
    "import { translateData } from '../utils/dataTranslations';\nimport { useTeacherData } from '../hooks/useTeacherData';\nimport { HorizontalBarChart } from './HorizontalBarChart';"
)

# 2. Replace data processing with hook
start_idx = content.find('const avgAge = useMemo(() => {')
end_idx = content.find('  if (loading) {')

if start_idx != -1 and end_idx != -1:
    hook_call = """
  const {
    totalRespondents,
    avgAge,
    topSubject,
    topAITool,
    genderData,
    ageData,
    instData,
    schoolData,
    aiToolData,
    subjectData,
    devicesData,
    desiredSubjectsData,
    supportNeedsData,
    improvementsData,
  } = useTeacherData(filteredData, language, translateData);

"""
    content = content[:start_idx] + hook_call + content[end_idx:]

with open('src/components/Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Dashboard.jsx updated successfully!")
