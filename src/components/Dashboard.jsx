import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid, LabelList, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Filter, Users, School, BookOpen, Sparkles, Activity, Target, MessageSquare } from 'lucide-react';
import '../App.css';
import { translateData } from '../utils/dataTranslations';
import { useTeacherData } from '../hooks/useTeacherData';
import { HorizontalBarChart } from './HorizontalBarChart';

// Modern Color Palette
const COLORS = {
  teal: '#0d9488',
  coral: '#f43f5e',
  violet: '#8b5cf6',
  sky: '#0ea5e9',
  amber: '#f59e0b',
  rose: '#e11d48',
  indigo: '#4f46e5',
  emerald: '#10b981'
};

export default function Dashboard({ language = 'km' }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedSchool, setSelectedSchool] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // Tabs State
  const [activeTab, setActiveTab] = useState('demographics'); // 'demographics' or 'tech'

  const t = {
    km: {
      loading: 'កំពុងផ្ទុកទិន្នន័យ...',
      filters: 'ជម្រើសចម្រាញ់',
      school: 'សាលារៀន (School)',
      gender: 'ភេទ (Gender)',
      subject: 'មុខវិជ្ជា (Subject)',
      title: 'ផ្ទាំងគ្រប់គ្រងទិន្នន័យលោកគ្រូ អ្នកគ្រូ ម.ប.ស',
      subtitle: 'ទិដ្ឋភាពទូទៅនៃប្រជាសាស្ត្រ និងការប្រើប្រាស់បច្ចេកវិទ្យារបស់លោកគ្រូ អ្នកគ្រូ',
      tabDemo: 'ព័ត៌មានប្រជាសាស្ត្រ',
      tabTech: 'ការបង្រៀន និងបច្ចេកវិទ្យា',
      tabNeeds: 'តម្រូវការ និងសំណូមពរ',
      totalParticipants: 'អ្នកចូលរួមសរុប',
      avgAge: 'អាយុជាមធ្យម',
      years: 'ឆ្នាំ',
      genderTitle: 'ភេទគ្រូបង្រៀន',
      genderDesc: 'ភាគរយគ្រូបង្រៀន (ប្រុស/ស្រី)',
      total: 'សរុប',
      people: 'នាក់',
      ageTitle: 'កម្រិតអាយុ',
      ageDesc: 'ចំនួនគ្រូបង្រៀនតាមចន្លោះអាយុ',
      instTitle: 'ស្ថាប័នគ្រប់គ្រងមជ្ឈមណ្ឌល',
      instDesc: 'ចំនួនមជ្ឈមណ្ឌលបែងចែកតាមស្ថាប័នគ្រប់គ្រង',
      hsTitle: 'វិទ្យាល័យ',
      hsDesc: 'វិទ្យាល័យដែលមានគ្រូបង្រៀនចូលរួមច្រើនជាងគេ',
      subjTitle: 'មុខវិជ្ជាកំពុងបង្រៀន',
      subjDesc: 'មុខវិជ្ជាចម្បងដែលគ្រូបង្រៀន',
      topSubj: 'មុខវិជ្ជាបង្រៀនច្រើនជាងគេ',
      topAI: 'AI ប្រើប្រាស់ច្រើនជាងគេ',
      aiTitle: 'ការប្រើប្រាស់ AI',
      aiDesc: 'ឧបករណ៍ AI ពេញនិយមដែលគ្រូប្រើញឹកញាប់',
      devTitle: 'ឧបករណ៍ឌីជីថល',
      devDesc: 'ឧបករណ៍បច្ចេកវិទ្យាដែលគ្រូកំពុងប្រើប្រាស់',
      topDesired: 'មុខវិជ្ជាចង់រៀនបំផុត',
      topSupport: 'ចំណុចស្នើឱ្យគាំទ្របំផុត',
      desiredTitle: 'មុខវិជ្ជាចង់រៀនបន្ថែម',
      desiredDesc: 'ជំនាញឌីជីថលដែលគ្រូចង់សិក្សាបន្ថែម',
      supportTitle: 'ការគាំទ្រពីមជ្ឈមណ្ឌល',
      supportDesc: 'ការរៀបចំដើម្បីជួយគាំទ្រដល់ការបង្រៀន',
      improveTitle: 'ចំណុចត្រូវកែលម្អ',
      improveDesc: 'មតិយោបល់ដើម្បីអភិវឌ្ឍមជ្ឈមណ្ឌលឱ្យកាន់តែប្រសើរ'
    },
    en: {
      loading: 'Loading Dashboard...',
      filters: 'Filters',
      school: 'School',
      gender: 'Gender',
      subject: 'Subject',
      title: 'CTC Teacher Data Dashboard',
      subtitle: 'Overview of demographics and technology usage among teachers',
      tabDemo: 'Demographics',
      tabTech: 'Teaching & Technology',
      tabNeeds: 'Needs & Suggestions',
      totalParticipants: 'Total Participants',
      avgAge: 'Average Age',
      years: 'Years',
      genderTitle: 'Teacher Gender',
      genderDesc: 'Percentage of teachers by gender',
      total: 'Total',
      people: 'people',
      ageTitle: 'Age Distribution',
      ageDesc: 'Number of teachers by age group',
      instTitle: 'Managing Institutions',
      instDesc: 'Number of centers distributed by managing institution',
      hsTitle: 'High Schools',
      hsDesc: 'High schools with the most participating teachers',
      subjTitle: 'Teaching Subjects',
      subjDesc: 'Main subjects taught by teachers',
      topSubj: 'Most Taught Subject',
      topAI: 'Most Used AI Tool',
      aiTitle: 'AI Tool Usage',
      aiDesc: 'Popular AI tools frequently used by teachers',
      devTitle: 'Digital Devices',
      devDesc: 'Technology devices currently used by teachers',
      topDesired: 'Most Desired Subject',
      topSupport: 'Most Requested Support',
      desiredTitle: 'Desired Subjects',
      desiredDesc: 'Digital skills teachers want to learn more about',
      supportTitle: 'Center Support',
      supportDesc: 'Arrangements to support teaching',
      improveTitle: 'Areas for Improvement',
      improveDesc: 'Feedback to improve the center'
    }
  };


  useEffect(() => {
    Papa.parse('/Data/CTC_teacher/Demographical CTC Teacher.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data);
        setLoading(false);
      }
    });
  }, []);

  // Get unique options for slicers
  const schools = ['All', ...new Set(data.map(d => d['មកពីវិទ្យាល័យ']).filter(Boolean))].sort();
  const genders = ['All', 'ប្រុស', 'ស្រី', 'ផ្សេងៗ'];
  const subjects = ['All', ...new Set(data.map(d => d['Structure មុខវិជ្ជាបង្រៀន៖']).filter(Boolean))].sort();

  // Apply Filters
  const filteredData = useMemo(() => {
    return data.filter(row => {
      const matchSchool = selectedSchool === 'All' || row['មកពីវិទ្យាល័យ'] === selectedSchool;
      const g = row['ភេទ']?.trim().replace(/\u200b/g, '');
      let rowGender = (g === 'ប្រុស' || g === 'ស្រី') ? g : 'ផ្សេងៗ';
      const matchGender = selectedGender === 'All' || rowGender === selectedGender;
      const matchSubject = selectedSubject === 'All' || row['Structure មុខវិជ្ជាបង្រៀន៖'] === selectedSubject;
      return matchSchool && matchGender && matchSubject;
    });
  }, [data, selectedSchool, selectedGender, selectedSubject]);

  // Global KPIs
  
  
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)' }}>
        <h2 style={{ color: 'var(--accent-primary)' }}>{t[language].loading}</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar Filters */}
      <aside className="sidebar">
        <h2><Filter size={20} />{t[language].filters}</h2>

        <div className="filter-group">
          <label>{t[language].school}</label>
          <select value={selectedSchool} onChange={e => setSelectedSchool(e.target.value)}>
            {schools.map(s => <option key={s} value={s}>{s === 'All' ? 'All' : translateData(s, language)}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>{t[language].gender}</label>
          <select value={selectedGender} onChange={e => setSelectedGender(e.target.value)}>
            {genders.map(g => <option key={g} value={g}>{g === 'All' ? 'All' : translateData(g, language)}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>{t[language].subject}</label>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
            {subjects.map(s => <option key={s} value={s}>{s === 'All' ? 'All' : translateData(s, language)}</option>)}
          </select>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h1>{t[language].title}</h1>
          <p>{t[language].subtitle}</p>
        </header>

        {/* Tabs Navigation */}
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'demographics' ? 'active' : ''}`}
            onClick={() => setActiveTab('demographics')}
          >{t[language].tabDemo}</button>
          <button
            className={`tab-btn ${activeTab === 'tech' ? 'active' : ''}`}
            onClick={() => setActiveTab('tech')}
          >{t[language].tabTech}</button>
          <button
            className={`tab-btn ${activeTab === 'needs' ? 'active' : ''}`}
            onClick={() => setActiveTab('needs')}
          >{t[language].tabNeeds}</button>
        </div>

        {/* Tab 1: Demographics */}
        {activeTab === 'demographics' && (
          <>
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-header"><Users size={18} color="var(--accent-primary)" />{t[language].totalParticipants}</div>
                <div className="kpi-value">{totalRespondents}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-header"><Activity size={18} color="var(--accent-primary)" />{t[language].avgAge}</div>
                <div className="kpi-value">{avgAge} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{t[language].years}</span></div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-header-container">
                  <h3 className="chart-title">{t[language].genderTitle}</h3>
                  <p className="chart-desc">{t[language].genderDesc}</p>
                </div>
                <div className="chart-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none"
                        labelLine={false}
                        label={({ cx, cy, midAngle, outerRadius, value, name, percent }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = outerRadius + 20;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          return (
                            <text x={x} y={y} fill="var(--text-muted)" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight={500}>
                              {`${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                            </text>
                          );
                        }}
                      >
                        {genderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={[COLORS.indigo, COLORS.coral, COLORS.amber][index % 3]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={val => `${val}  (${((val / totalRespondents) * 100).toFixed(1)}%)`} />
                      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '1.5rem', fontWeight: 700, fill: 'var(--text-main)' }}>
                        {totalRespondents}
                      </text>
                      <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '0.9rem', fill: 'var(--text-muted)' }}>{t[language].total}</text>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header-container">
                  <h3 className="chart-title">{t[language].ageTitle}</h3>
                  <p className="chart-desc">{t[language].ageDesc}</p>
                </div>
                <div className="chart-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageData} margin={{ top: 30, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                      <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'var(--bg-color)' }} formatter={val => `${val} `} />
                      <Bar maxBarSize={45} dataKey="value" fill={COLORS.sky} radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="value" position="top" formatter={(val) => `${val} (${((val / totalRespondents) * 100).toFixed(1)}%)`} style={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header-container">
                  <h3 className="chart-title">{t[language].instTitle}</h3>
                  <p className="chart-desc">{t[language].instDesc}</p>
                </div>
                <div className="chart-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={instData} layout="vertical" margin={{ top: 0, right: 80, left: 60, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                      <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={140} tick={{ fill: 'var(--text-main)', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'var(--bg-color)' }} formatter={val => `${val} `} />
                      <Bar maxBarSize={45} dataKey="value" fill={COLORS.teal} radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="value" position="right" formatter={(val) => `${val} (${((val / totalRespondents) * 100).toFixed(1)}%)`} style={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header-container">
                  <h3 className="chart-title">{t[language].hsTitle}</h3>
                  <p className="chart-desc">{t[language].hsDesc}</p>
                </div>
                <div className="chart-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={schoolData} layout="vertical" margin={{ top: 0, right: 80, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                      <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={180} tick={{ fill: 'var(--text-main)', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'var(--bg-color)' }} formatter={val => `${val} `} />
                      <Bar maxBarSize={45} dataKey="value" fill={COLORS.rose} radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="value" position="right" formatter={(val) => `${val} (${((val / totalRespondents) * 100).toFixed(1)}%)`} style={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header-container">
                  <h3 className="chart-title">{t[language].subjTitle}</h3>
                  <p className="chart-desc">{t[language].subjDesc}</p>
                </div>
                <div className="chart-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={subjectData}>
                      <PolarGrid stroke="var(--border-color)" />
                      <PolarAngleAxis dataKey="name" tick={{ fill: 'var(--text-main)', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      <Radar name={t[language].subjTitle} dataKey="value" stroke={COLORS.amber} fill={COLORS.amber} fillOpacity={0.6} />
                      <Tooltip cursor={{ fill: 'var(--bg-color)' }} formatter={val => `${val} ${t[language].people}`} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tab 2: Teaching & Technology */}
        {activeTab === 'tech' && (
          <>
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-header"><BookOpen size={18} color="var(--accent-primary)" />{t[language].topSubj}</div>
                <div className="kpi-value" style={{ fontSize: '1.5rem' }}>{topSubject}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-header"><Sparkles size={18} color="var(--accent-primary)" />{t[language].topAI}</div>
                <div className="kpi-value" style={{ fontSize: '1.5rem' }}>{topAITool}</div>
              </div>
            </div>

            <div className="charts-grid">

              <div className="chart-card">
                <div className="chart-header-container">
                  <h3 className="chart-title">{t[language].aiTitle}</h3>
                  <p className="chart-desc">{t[language].aiDesc}</p>
                </div>
                <div className="chart-body">
                  <HorizontalBarChart data={aiToolData} color={COLORS.violet} yAxisWidth={100} margin={{ top: 0, right: 80, left: 50, bottom: 0 }} totalRespondents={totalRespondents} unit={t[language].people} />
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header-container">
                  <h3 className="chart-title">{t[language].devTitle}</h3>
                  <p className="chart-desc">{t[language].devDesc}</p>
                </div>
                <div className="chart-body">
                  <HorizontalBarChart data={devicesData} color={COLORS.sky} yAxisWidth={220} margin={{ top: 0, right: 80, left: 20, bottom: 0 }} totalRespondents={totalRespondents} unit={t[language].people} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tab 3: Needs & Suggestions */}
        {activeTab === 'needs' && (
          <>
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-header"><Target size={18} color="var(--accent-primary)" />{t[language].topDesired}</div>
                <div className="kpi-value" style={{ fontSize: '1.5rem' }}>{desiredSubjectsData.length > 0 ? desiredSubjectsData[0].name : 'N/A'}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-header"><MessageSquare size={18} color="var(--accent-primary)" />{t[language].topSupport}</div>
                <div className="kpi-value" style={{ fontSize: '1.5rem' }}>{supportNeedsData.length > 0 ? supportNeedsData[0].name : 'N/A'}</div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-header-container">
                  <h3 className="chart-title">{t[language].desiredTitle}</h3>
                  <p className="chart-desc">{t[language].desiredDesc}</p>
                </div>
                <div className="chart-body">
                  <HorizontalBarChart data={desiredSubjectsData} color={COLORS.emerald} yAxisWidth={140} margin={{ top: 0, right: 80, left: 60, bottom: 0 }} totalRespondents={totalRespondents} unit={t[language].people} />
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header-container">
                  <h3 className="chart-title">{t[language].supportTitle}</h3>
                  <p className="chart-desc">{t[language].supportDesc}</p>
                </div>
                <div className="chart-body">
                  <HorizontalBarChart data={supportNeedsData} color={COLORS.teal} yAxisWidth={140} margin={{ top: 0, right: 80, left: 60, bottom: 0 }} totalRespondents={totalRespondents} unit={t[language].people} />
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header-container">
                  <h3 className="chart-title">{t[language].improveTitle}</h3>
                  <p className="chart-desc">{t[language].improveDesc}</p>
                </div>
                <div className="chart-body">
                  <HorizontalBarChart data={improvementsData} color={COLORS.rose} yAxisWidth={200} margin={{ top: 0, right: 80, left: 40, bottom: 0 }} totalRespondents={totalRespondents} unit={t[language].people} />
                </div>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
