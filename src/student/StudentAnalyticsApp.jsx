import { useEffect, useState } from 'react';
import { LanguageProvider } from './lib/i18n';
import { FilterProvider } from './hooks/useFilters';
import { AppLayout } from './components/AppLayout';
import { OverviewPage } from './pages/Overview';
import { StudentProfilePage } from './pages/StudentProfile';
import { StudentImpactPage } from './pages/StudentImpact';
import { DigitalSkillsPage } from './pages/DigitalSkills';
import { LearningExperiencePage } from './pages/LearningExperience';
import { RiskImprovementPage } from './pages/RiskImprovement';
import './student.css';

const PAGES = {
  overview: OverviewPage,
  profile: StudentProfilePage,
  impact: StudentImpactPage,
  'digital-skills': DigitalSkillsPage,
  'learning-experience': LearningExperiencePage,
  risk: RiskImprovementPage,
};

/**
 * Root of the ported ម.ប.ស. Student Survey Analytics Dashboard, running
 * fully static over src/student/data/ (see server/README.md for why). Six
 * pages, one shared filter state — the same shape as the original
 * standalone app, minus react-router (this app already owns top-level
 * navigation via tab state, so pages switch the same way).
 */
export default function StudentAnalyticsApp({ onHome }) {
  const [page, setPage] = useState('overview');

  // index.css constrains #root to a centered 1126px column for the rest of
  // this app (Welcome / Teacher Analyst). The ported dashboard's own fixed
  // sidebar expects the full viewport, so widen #root only while this view
  // is mounted — reverted on unmount, so other tabs are unaffected.
  useEffect(() => {
    const root = document.getElementById('root');
    root?.classList.add('student-analyst-active');
    return () => root?.classList.remove('student-analyst-active');
  }, []);

  const Page = PAGES[page] ?? OverviewPage;

  return (
    <div className="student-analyst-root">
      <LanguageProvider>
        <FilterProvider>
          <AppLayout page={page} onNavigate={setPage} onHome={onHome}>
            <Page />
          </AppLayout>
        </FilterProvider>
      </LanguageProvider>
    </div>
  );
}
