import {
  Activity, BarChart3, Cpu, GraduationCap, LayoutDashboard, ShieldAlert, Users,
} from 'lucide-react';
import { useLanguage } from '../lib/i18n';

const NAV = [
  { id: 'overview', labelKey: 'navOverview', icon: LayoutDashboard },
  { id: 'profile', labelKey: 'navProfile', icon: Users },
  { id: 'impact', labelKey: 'navImpact', icon: Activity },
  { id: 'digital-skills', labelKey: 'navDigitalSkills', icon: Cpu },
  { id: 'learning-experience', labelKey: 'navLearningExperience', icon: GraduationCap },
  { id: 'risk', labelKey: 'navRisk', icon: ShieldAlert },
];

export function Sidebar({ page, onNavigate }) {
  const { t } = useLanguage();

  return (
    <nav aria-label="Dashboard sections" className="flex h-full w-full flex-col bg-navy text-white">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <BarChart3 className="h-5 w-5 text-brand" aria-hidden />
        <div>
          <p className="km text-[15px] font-semibold leading-tight">ម.ប.ស.</p>
          <p className="text-small text-white/55">{t('sidebarSubtitle')}</p>
        </div>
      </div>

      <ul className="flex-1 space-y-0.5 px-3">
        {NAV.map(({ id, labelKey, icon: Icon }) => {
          const isActive = page === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onNavigate(id)}
                aria-current={isActive ? 'page' : undefined}
                className={`focus-ring flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-small transition-colors ${
                  isActive ? 'bg-brand text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">{t(labelKey)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
