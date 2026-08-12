import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid, LabelList, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, RadialBarChart, RadialBar, Treemap, FunnelChart, Funnel, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Filter, Users, School, BookOpen, Sparkles, Activity, Target, MessageSquare, Building, User, Calendar, MonitorSmartphone } from 'lucide-react';
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

const PIE_COLORS = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316'];

const LollipopBar = (props) => {
  const { fill, x, y, width, height } = props;
  const radius = 6;
  return (
    <g>
      <rect x={x} y={y + height / 2 - 2} width={width} height={4} fill={fill} rx={2} />
      <circle cx={x + width} cy={y + height / 2} r={radius} fill={fill} />
    </g>
  );
};

const CustomizedTreemapContent = (props) => {
  const { x, y, width, height, index, name, value } = props;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} style={{ fill: PIE_COLORS[index % PIE_COLORS.length], stroke: '#fff', strokeWidth: 2 }} />
      {width > 60 && height > 30 && (
        <text x={x + width / 2} y={y + height / 2 - 2} textAnchor="middle" fill="#fff" fontSize={13} fontWeight={600}>
          {name.length > 20 ? name.substring(0, 20) + '...' : name}
        </text>
      )}
      {width > 60 && height > 50 && (
        <text x={x + width / 2} y={y + height / 2 + 15} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize={11}>
          {value}
        </text>
      )}
    </g>
  );
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
      filters: 'ចម្រុះ',
      school: 'សាលារៀន',
      gender: 'ភេទ',
      subject: 'មុខវិជ្ជា',
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
      kpiTopGender: 'ភេទភាគច្រើន',
      kpiTopAge: 'ចន្លោះអាយុភាគច្រើន',
      kpiTopSchool: 'សាលារៀនច្រើនជាងគេ',
      kpiTopInst: 'ស្ថាប័នគ្រប់គ្រងច្រើនជាងគេ',
      keyInsightsTitle: 'ចំណុចសំខាន់ៗ (Key Insights)',
      demoInsight1Title: 'ប្រជាសាស្ត្រ',
      demoInsight1Desc: 'ភេទ និងអាយុភាគច្រើន',
      demoInsight2Title: 'សាលារៀន',
      demoInsight2Desc: 'សាលាដែលមានអ្នកចូលរួមច្រើន',
      demoInsight3Title: 'មុខវិជ្ជា',
      demoInsight3Desc: 'មុខវិជ្ជាបង្រៀនច្រើនជាងគេ',
      topAI: 'AI ប្រើប្រាស់ច្រើនជាងគេ',
      topDevice: 'ឧបករណ៍ប្រើប្រាស់ច្រើនជាងគេ',
      techInsight1Title: 'ឧបករណ៍ AI',
      techInsight1Desc: 'ការប្រើប្រាស់ AI ច្រើនជាងគេ',
      techInsight2Title: 'ឧបករណ៍ឌីជីថល',
      techInsight2Desc: 'ឧបករណ៍ឌីជីថលប្រើច្រើនជាងគេ',
      aiTitle: 'ការប្រើប្រាស់ AI',
      aiDesc: 'ឧបករណ៍ AI ពេញនិយមដែលគ្រូប្រើញឹកញាប់',
      devTitle: 'ឧបករណ៍ឌីជីថល',
      devDesc: 'ឧបករណ៍បច្ចេកវិទ្យាដែលគ្រូកំពុងប្រើប្រាស់',
      topDesired: 'មុខវិជ្ជាចង់រៀនបំផុត',
      topSupport: 'ចំណុចស្នើឱ្យគាំទ្របំផុត',
      topImprovement: 'ចំណុចត្រូវកែលម្អធំបំផុត',
      needsInsight1Title: 'មុខវិជ្ជាចង់រៀន',
      needsInsight1Desc: 'មុខវិជ្ជាចង់រៀនបន្ថែមច្រើនជាងគេ',
      needsInsight2Title: 'ការគាំទ្រ',
      needsInsight2Desc: 'ការគាំទ្រដែលស្នើសុំច្រើនជាងគេ',
      needsInsight3Title: 'ការកែលម្អ',
      needsInsight3Desc: 'ចំណុចត្រូវកែលម្អច្រើនជាងគេ',
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
      kpiTopGender: 'Most Common Gender',
      kpiTopAge: 'Most Common Age',
      kpiTopSchool: 'Top School',
      kpiTopInst: 'Top Institution',
      keyInsightsTitle: 'Key Insights',
      demoInsight1Title: 'Demographics',
      demoInsight1Desc: 'Top gender and age group',
      demoInsight2Title: 'Schools',
      demoInsight2Desc: 'School with most participants',
      demoInsight3Title: 'Subjects',
      demoInsight3Desc: 'Most taught subject',
      topAI: 'Most Used AI Tool',
      topDevice: 'Most Used Device',
      techInsight1Title: 'AI Tools',
      techInsight1Desc: 'Most popular AI tool',
      techInsight2Title: 'Digital Devices',
      techInsight2Desc: 'Most popular digital device',
      aiTitle: 'AI Tool Usage',
      aiDesc: 'Popular AI tools frequently used by teachers',
      devTitle: 'Digital Devices',
      devDesc: 'Technology devices currently used by teachers',
      topDesired: 'Most Desired Subject',
      topSupport: 'Most Requested Support',
      topImprovement: 'Top Area for Improvement',
      needsInsight1Title: 'Desired Subjects',
      needsInsight1Desc: 'Most requested subject to learn',
      needsInsight2Title: 'Support Needs',
      needsInsight2Desc: 'Most requested support',
      needsInsight3Title: 'Improvements',
      needsInsight3Desc: 'Top area for improvement',
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
        const normalizedData = results.data.map(row => {
          const newRow = {};
          for (let key in row) {
            if (Object.prototype.hasOwnProperty.call(row, key)) {
              const normalizedKey = key.replace(/\s+/g, ' ').trim();
              newRow[normalizedKey] = row[key];
            }
          }
          return newRow;
        });
        setData(normalizedData);
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

  const getTopObj = (arr) => (arr && arr.length > 0) ? arr.reduce((prev, current) => (prev.value > current.value) ? prev : current) : { name: 'N/A', value: 0 };
  const topGender = getTopObj(genderData);
  const topAgeGroup = getTopObj(ageData);
  const topSchoolName = getTopObj(schoolData);
  const topInstitution = getTopObj(instData);
  const topSubjectObj = getTopObj(subjectData);
  
  const topAIToolObj = aiToolData[0] || { name: 'N/A', value: 0 };
  const topAITool2 = aiToolData[1] || { name: 'N/A', value: 0 };
  const topAITool3 = aiToolData[2] || { name: 'N/A', value: 0 };

  const topDeviceObj = getTopObj(devicesData);
  
  const topDesiredObj = getTopObj(desiredSubjectsData);
  const topSupportObj = getTopObj(supportNeedsData);
  const topImprovementObj = getTopObj(improvementsData);

  const formatPct = (val) => totalRespondents ? ((val / totalRespondents) * 100).toFixed(1) : 0;


  return (
    <div className="page-container">
      {/* Top Filters */}
      <div className="top-filter-bar">
        <h2><Filter size={20} />{t[language].filters}</h2>

        <div className="filter-group">
          <label>{t[language].school}</label>
          <select value={selectedSchool} onChange={e => setSelectedSchool(e.target.value)}>
            {schools.map(s => <option key={s} value={s}>{s === 'All' ? (language === 'en' ? 'All' : 'ទាំងអស់') : translateData(s, language)}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>{t[language].gender}</label>
          <select value={selectedGender} onChange={e => setSelectedGender(e.target.value)}>
            {genders.map(g => <option key={g} value={g}>{g === 'All' ? (language === 'en' ? 'All' : 'ទាំងអស់') : translateData(g, language)}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>{t[language].subject}</label>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
            {subjects.map(s => <option key={s} value={s}>{s === 'All' ? (language === 'en' ? 'All' : 'ទាំងអស់') : translateData(s, language)}</option>)}
          </select>
        </div>
      </div>

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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ height: '3px', background: COLORS.sky }}></div>
                 <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                   <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Users size={15} color={COLORS.sky} />{t[language].totalParticipants}</div>
                   <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)' }}>{totalRespondents}</div>
                 </div>
              </div>
              <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ height: '3px', background: COLORS.indigo }}></div>
                 <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                   <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><User size={15} color={COLORS.indigo} />{t[language].kpiTopGender}</div>
                   <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)' }}>{topGender.name}</div>
                   <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{topGender.value} {t[language].people} ({formatPct(topGender.value)}%)</div>
                 </div>
              </div>
              <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ height: '3px', background: COLORS.amber }}></div>
                 <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                   <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Calendar size={15} color={COLORS.amber} />{t[language].kpiTopAge}</div>
                   <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)' }}>{topAgeGroup.name}</div>
                   <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{topAgeGroup.value} {t[language].people} ({formatPct(topAgeGroup.value)}%)</div>
                 </div>
              </div>
              <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ height: '3px', background: COLORS.rose }}></div>
                 <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                   <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><School size={15} color={COLORS.rose} />{t[language].kpiTopSchool}</div>
                   <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>{topSchoolName.name}</div>
                   <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{topSchoolName.value} {t[language].people} ({formatPct(topSchoolName.value)}%)</div>
                 </div>
              </div>
              <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ height: '3px', background: COLORS.teal }}></div>
                 <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                   <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Building size={15} color={COLORS.teal} />{t[language].kpiTopInst}</div>
                   <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>{topInstitution.name}</div>
                   <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{topInstitution.value} {t[language].people} ({formatPct(topInstitution.value)}%)</div>
                 </div>
              </div>
              <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ height: '3px', background: COLORS.emerald }}></div>
                 <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                   <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><BookOpen size={15} color={COLORS.emerald} />{t[language].topSubj}</div>
                   <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>{topSubjectObj.name}</div>
                   <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{topSubjectObj.value} {t[language].people} ({formatPct(topSubjectObj.value)}%)</div>
                 </div>
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
                    {(() => {
                      const sortedInstData = [...instData].sort((a, b) => b.value - a.value);
                      return (
                        <FunnelChart margin={{ top: 20, right: 180, left: 20, bottom: 20 }}>
                          <Tooltip formatter={val => `${val} (${((val / totalRespondents) * 100).toFixed(1)}%)`} cursor={{fill: 'transparent'}} />
                          <Funnel
                            dataKey="value"
                            data={sortedInstData}
                            isAnimationActive
                          >
                            <LabelList 
                              position="right"
                              dataKey="name"
                              content={(props) => {
                                try {
                                  if (!props) return null;
                                  const { x, y, width, height, payload, value } = props;
                                  
                                  const currentX = (typeof x === 'number' && !isNaN(x)) ? x : 0;
                                  const currentY = (typeof y === 'number' && !isNaN(y)) ? y : 0;
                                  const currentWidth = (typeof width === 'number' && !isNaN(width)) ? width : 0;
                                  const currentHeight = (typeof height === 'number' && !isNaN(height)) ? height : 0;

                                  const actualName = (payload && payload.name) ? String(payload.name) : (typeof value === 'string' ? value : '');
                                  const actualValue = (payload && typeof payload.value === 'number') ? payload.value : 0;
                                  const pct = totalRespondents > 0 ? ((actualValue / totalRespondents) * 100).toFixed(1) : '0.0';
                                  
                                  return (
                                    <text x={currentX + currentWidth + 15} y={currentY + currentHeight / 2 + 4} fill="var(--text-main)" fontSize={11} textAnchor="start">
                                      {actualName} {actualValue > 0 ? `(${pct}%)` : ''}
                                    </text>
                                  );
                                } catch (e) {
                                  return null;
                                }
                              }}
                            />
                            <LabelList position="center" fill="#fff" stroke="none" dataKey="value" fontSize={13} fontWeight="bold" />
                            {sortedInstData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Funnel>
                        </FunnelChart>
                      );
                    })()}
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header-container">
                  <h3 className="chart-title">{t[language].hsTitle}</h3>
                  <p className="chart-desc">{t[language].hsDesc}</p>
                </div>
                <div className="chart-body">
                  <div style={{ maxHeight: '380px', overflowY: 'auto', paddingRight: '14px', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                    {schoolData.map((item, index) => {
                      const maxVal = schoolData[0]?.value || 1;
                      const percentage = ((item.value / totalRespondents) * 100).toFixed(1);
                      const barWidth = `${(item.value / maxVal) * 100}%`;
                      return (
                        <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-main)', fontSize: '13px', fontWeight: 500 }}>
                              {index + 1}. {item.name}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>
                              {item.value} <span style={{ fontWeight: 400, opacity: 0.7 }}>({percentage}%)</span>
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ 
                              width: barWidth, 
                              height: '100%', 
                              background: `linear-gradient(90deg, ${COLORS.coral}, ${COLORS.rose})`,
                              borderRadius: '4px',
                              transition: 'width 1s ease-in-out'
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ height: '3px', background: COLORS.sky }}></div>
                 <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                   <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Users size={15} color={COLORS.sky} />{t[language].totalParticipants}</div>
                   <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)' }}>{totalRespondents}</div>
                 </div>
              </div>
              <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ height: '3px', background: COLORS.violet }}></div>
                 <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                   <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Sparkles size={15} color={COLORS.violet} />{t[language].topAI} #1</div>
                   <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)' }}>{topAIToolObj.name}</div>
                   <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{topAIToolObj.value} {t[language].people} ({formatPct(topAIToolObj.value)}%)</div>
                 </div>
              </div>
              <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ height: '3px', background: COLORS.indigo }}></div>
                 <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                   <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Sparkles size={15} color={COLORS.indigo} />{t[language].topAI} #2</div>
                   <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)' }}>{topAITool2.name}</div>
                   <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{topAITool2.value} {t[language].people} ({formatPct(topAITool2.value)}%)</div>
                 </div>
              </div>
              <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ height: '3px', background: COLORS.teal }}></div>
                 <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                   <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Sparkles size={15} color={COLORS.teal} />{t[language].topAI} #3</div>
                   <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)' }}>{topAITool3.name}</div>
                   <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{topAITool3.value} {t[language].people} ({formatPct(topAITool3.value)}%)</div>
                 </div>
              </div>
              <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ height: '3px', background: COLORS.sky }}></div>
                 <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                   <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><MonitorSmartphone size={15} color={COLORS.sky} />{t[language].topDevice}</div>
                   <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>{topDeviceObj.name}</div>
                   <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{topDeviceObj.value} {t[language].people} ({formatPct(topDeviceObj.value)}%)</div>
                 </div>
              </div>
            </div>

            <div className="chart-card" style={{ minHeight: 'auto', marginBottom: '24px', padding: '24px', background: 'var(--card-bg)' }}>
              <h3 style={{ marginTop: 0, color: 'var(--text-main)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                <Sparkles size={20} color="var(--amber)" />
                {t[language].keyInsightsTitle}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                   <div style={{ color: COLORS.violet, fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>{t[language].techInsight1Title}</div>
                   <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{t[language].techInsight1Desc}</div>
                   <div style={{ color: COLORS.violet, fontWeight: 'bold', fontSize: '18px' }}>{topAIToolObj.name}</div>
                </div>
                <div style={{ background: 'rgba(14, 165, 233, 0.05)', border: '1px solid rgba(14, 165, 233, 0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                   <div style={{ color: COLORS.sky, fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>{t[language].techInsight2Title}</div>
                   <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{t[language].techInsight2Desc}</div>
                   <div style={{ color: COLORS.sky, fontWeight: 'bold', fontSize: '16px' }}>{topDeviceObj.name}</div>
                </div>
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
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 130, bottom: 20, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                      <XAxis type="number" dataKey="value" name="Users" hide />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        name="Device" 
                        width={200} 
                        tick={{ fontSize: 11, fill: 'var(--text-main)', fontWeight: 500 }} 
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <ZAxis type="number" dataKey="value" range={[100, 2500]} name="Users" />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }} 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const pct = totalRespondents > 0 ? ((data.value / totalRespondents) * 100).toFixed(1) : '0.0';
                            return (
                              <div style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                <p style={{ color: 'var(--text-main)', margin: 0, fontWeight: 600 }}>{data.name}</p>
                                <p style={{ color: 'var(--text-muted)', margin: 0, marginTop: '4px', fontSize: '13px' }}>
                                  <span style={{ color: data.fill || COLORS.sky, fontWeight: 'bold' }}>{data.value}</span> {t[language].people} ({pct}%)
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter data={[...devicesData].reverse()}>
                        <LabelList 
                          dataKey="value" 
                          position="right"
                          formatter={(val) => {
                            const pct = totalRespondents > 0 ? ((val / totalRespondents) * 100).toFixed(1) : '0.0';
                            return `${val} (${pct}%)`;
                          }}
                          fill="var(--text-main)"
                          fontSize={12}
                          fontWeight={600}
                          offset={10}
                        />
                        {[...devicesData].reverse().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} fillOpacity={0.85} stroke={PIE_COLORS[index % PIE_COLORS.length]} strokeWidth={2} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tab 3: Needs & Suggestions */}
        {activeTab === 'needs' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ height: '3px', background: COLORS.sky }}></div>
                 <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                   <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Users size={15} color={COLORS.sky} />{t[language].totalParticipants}</div>
                   <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)' }}>{totalRespondents}</div>
                 </div>
              </div>
              <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ height: '3px', background: COLORS.emerald }}></div>
                 <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                   <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Target size={15} color={COLORS.emerald} />{t[language].topDesired}</div>
                   <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)' }}>{topDesiredObj.name}</div>
                   <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{topDesiredObj.value} {t[language].people} ({formatPct(topDesiredObj.value)}%)</div>
                 </div>
              </div>
              <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ height: '3px', background: COLORS.teal }}></div>
                 <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                   <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><MessageSquare size={15} color={COLORS.teal} />{t[language].topSupport}</div>
                   <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>{topSupportObj.name}</div>
                   <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{topSupportObj.value} {t[language].people} ({formatPct(topSupportObj.value)}%)</div>
                 </div>
              </div>
              <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ height: '3px', background: COLORS.rose }}></div>
                 <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                   <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Activity size={15} color={COLORS.rose} />{t[language].topImprovement}</div>
                   <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>{topImprovementObj.name}</div>
                   <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{topImprovementObj.value} {t[language].people} ({formatPct(topImprovementObj.value)}%)</div>
                 </div>
              </div>
            </div>

            <div className="chart-card" style={{ minHeight: 'auto', marginBottom: '24px', padding: '24px', background: 'var(--card-bg)' }}>
              <h3 style={{ marginTop: 0, color: 'var(--text-main)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                <Sparkles size={20} color="var(--amber)" />
                {t[language].keyInsightsTitle}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                   <div style={{ color: COLORS.emerald, fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>{t[language].needsInsight1Title}</div>
                   <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{t[language].needsInsight1Desc}</div>
                   <div style={{ color: COLORS.emerald, fontWeight: 'bold', fontSize: '18px' }}>{topDesiredObj.name}</div>
                </div>
                <div style={{ background: 'rgba(13, 148, 136, 0.05)', border: '1px solid rgba(13, 148, 136, 0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                   <div style={{ color: COLORS.teal, fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>{t[language].needsInsight2Title}</div>
                   <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{t[language].needsInsight2Desc}</div>
                   <div style={{ color: COLORS.teal, fontWeight: 'bold', fontSize: '16px' }}>{topSupportObj.name}</div>
                </div>
                <div style={{ background: 'rgba(225, 29, 72, 0.05)', border: '1px solid rgba(225, 29, 72, 0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                   <div style={{ color: COLORS.rose, fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>{t[language].needsInsight3Title}</div>
                   <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{t[language].needsInsight3Desc}</div>
                   <div style={{ color: COLORS.rose, fontWeight: 'bold', fontSize: '18px' }}>{topImprovementObj.name}</div>
                </div>
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

              <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
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
