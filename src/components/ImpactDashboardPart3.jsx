import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList, Legend } from 'recharts';
import { Filter, Users, Building, Cpu, ShieldCheck, Sparkles } from 'lucide-react';
import '../App.css';
import { translateData } from '../utils/dataTranslations';

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

export default function ImpactDashboardPart3({ language = 'km' }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedSchool, setSelectedSchool] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const t = {
    km: {
      loading: 'កំពុងផ្ទុកទិន្នន័យ...',
      filters: 'ចម្រុះ',
      school: 'សាលារៀន',
      gender: 'ភេទ',
      subject: 'មុខវិជ្ជា',
      title: 'ការប្រើប្រាស់ធនធាន ម.ប.ស. និងសុវត្ថិភាពឌីជីថល',
      subtitle: 'ការប្រើប្រាស់ទីតាំង ឧបករណ៍ និងការយល់ដឹងពីសុវត្ថិភាព',
      agree: 'យល់ស្រប (ពិត)',
      neutral: 'មិនប្រែប្រួល',
      disagree: 'មិនយល់ស្រប (មិនពិត)',
      people: 'នាក់',
      chart1Title: 'ការប្រើប្រាស់ទីតាំង និងឧបករណ៍ ម.ប.ស.',
      chart1Desc: 'ការប្រើប្រាស់បន្ទប់សម្រាប់ប្រជុំ សម្រាក និងការងារ',
      chart2Title: 'ភាពបត់បែន និងការប្រើប្រាស់ ម.ប.ស. កម្រិតខ្ពស់',
      chart2Desc: 'ការប្រើប្រាស់បញ្ញាសិប្បនិម្មិត (AI) និងឧបករណ៍ស្រាវជ្រាវ',
      chart3Title: 'សុវត្ថិភាពឌីជីថល និងស្វ័យសិក្សាជាមួយ ម.ប.ស.',
      chart3Desc: 'ការការពារខ្លួនពីហានិភ័យ និងការចែករំលែកចំណេះដឹង',
      keyInsightsTitle: 'ចំណុចសំខាន់ៗ (Key Insights)',
      kpiTotal: 'អ្នកចូលរួមសរុប',
      kpi1: 'ធនធាន ម.ប.ស.',
      kpi2: 'ភាពបត់បែន',
      kpi3: 'សុវត្ថិភាពឌីជីថល',
      insight1Title: 'ការប្រើប្រាស់ធនធាន',
      insight1Desc: 'ទទួលបានការវាយតម្លៃវិជ្ជមានបំផុត',
      insight2Title: 'ភាពបត់បែន',
      insight2Desc: 'ទទួលបានការវាយតម្លៃវិជ្ជមានបំផុត',
      insight3Title: 'សុវត្ថិភាពឌីជីថល',
      insight3Desc: 'ទទួលបានការវាយតម្លៃវិជ្ជមានបំផុត'
    },
    en: {
      loading: 'Loading Dashboard...',
      filters: 'Filters',
      school: 'School',
      gender: 'Gender',
      subject: 'Subject',
      title: 'CTC Resource Usage & Digital Safety',
      subtitle: 'Usage of facilities, equipment, and security awareness',
      agree: 'Agree (True)',
      neutral: 'Neutral',
      disagree: 'Disagree (False)',
      people: 'people',
      chart1Title: 'Utilization of CTC Facilities & Equipment',
      chart1Desc: 'Usage of rooms for meetings, resting, and work',
      chart2Title: 'CTC Flexibility & Advanced Usage',
      chart2Desc: 'Usage of Artificial Intelligence (AI) and research tools',
      chart3Title: 'Digital Safety & Continuous Learning with CTC',
      chart3Desc: 'Protecting against risks and sharing knowledge',
      keyInsightsTitle: 'Key Insights',
      kpiTotal: 'Total Participants',
      kpi1: 'CTC Resources',
      kpi2: 'Flexibility',
      kpi3: 'Digital Safety',
      insight1Title: 'Resource Usage',
      insight1Desc: 'Received the most positive feedback',
      insight2Title: 'Flexibility',
      insight2Desc: 'Received the most positive feedback',
      insight3Title: 'Digital Safety',
      insight3Desc: 'Received the most positive feedback'
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

  const schools = ['All', ...new Set(data.map(d => d['មកពីវិទ្យាល័យ']).filter(Boolean))].sort();
  const genders = ['All', 'ប្រុស', 'ស្រី', 'ផ្សេងៗ'];
  const subjects = ['All', ...new Set(data.map(d => d['Structure មុខវិជ្ជាបង្រៀន៖']).filter(Boolean))].sort();

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

  const processData = (sourceData, questions, lang) => {
    const results = questions.map(q => {
      let trueCount = 0;
      let falseCount = 0;
      let neutralCount = 0;
      let total = 0;

      const normalizedQ = q.replace(/\s+/g, ' ').trim();
      sourceData.forEach(row => {
        const val = row[normalizedQ]?.trim();
        if (val) {
          total += 1;
          if (val === 'ពិត') trueCount += 1;
          else if (val === 'មិនពិត') falseCount += 1;
          else neutralCount += 1;
        }
      });

      return {
        name: translateData(q, lang),
        trueCount,
        falseCount,
        neutralCount,
        total,
        percentTrue: total > 0 ? (trueCount / total) * 100 : 0,
        percentFalse: total > 0 ? (falseCount / total) * 100 : 0,
        percentNeutral: total > 0 ? (neutralCount / total) * 100 : 0
      };
    });
    
    return results.sort((a, b) => b.percentTrue - a.percentTrue);
  };

  const chartData1 = useMemo(() => processData(filteredData, [
    "ម.ប.ស. ជួយផ្តល់ទីតាំងសម្រាកលម្ហែដល់ លោកគ្រូ/អ្នកគ្រូ ប្រសើរជាងមុន",
    "លោកគ្រូ/អ្នកគ្រូបានប្រើប្រាស់កុំព្យូទ័រ និងឧបករណ៍ឌីជីថលក្នុង ម.ប.ស. សម្រាប់រៀបចំការបង្រៀន និងស្រាវជ្រាវ",
    "លោកគ្រូ/អ្នកគ្រូ បានប្រើប្រាស់ទីតាំងសម្រាប់កិច្ចប្រជុំនានា",
    "លោកគ្រូ/អ្នកគ្រូបានប្រើប្រាស់ទីតាំងសម្រាប់សម្រាកក្រៅម៉ោងការងារ"
  ], language), [filteredData, language]);

  const chartData2 = useMemo(() => processData(filteredData, [
    "លោកគ្រូ/អ្នកគ្រូ បានប្រើប្រាស់សេវាប្រៃសណីយ៍",
    "លោកគ្រូ/អ្នកគ្រូអាចប្រើប្រាស់ ម.ប.ស. នេះបានតាមតម្រូវការ គ្រប់ពេលវេលាដើម្បីរៀបចំ ការបង្រៀនរបស់ខ្លួន",
    "លោកគ្រូ/អ្នកគ្រូអាចប្រើប្រាស់ឧបករណ៍ AI បាន",
    "បន្ទាប់ពីមាន ម.ប.ស. លោកគ្រូ/អ្នកគ្រូអាចស្វែងរកព័ត៌មានលើបណ្តាញអ៊ីនធឺណិត បានល្អប្រសើរជាងមុន"
  ], language), [filteredData, language]);

  const chartData3 = useMemo(() => processData(filteredData, [
    "បន្ទាប់ពីមាន ម.ប.ស. លោកគ្រូ/អ្នកគ្រូយល់ដឹងពីហានិភ័យ នៅលើអ៊ីនធឺណិត និងរបៀបការពារខ្លួនច្រើនជាងមុន",
    "បន្ទាប់ពីមាន ម.ប.ស. លោកគ្រូ/អ្នកគ្រូដឹងអំពីសារៈសំខាន់ និងរបៀបដាក់ពាក្យសម្ងាត់ និងការពារឧបករណ៍ឌីជីថលរបស់ខ្លួន បានល្អជាងមុន",
    "បន្ទាប់ពីមាន ម.ប.ស. លោកគ្រូ/អ្នកគ្រូយល់ដឹង អំពីអំពើឆបោកតាមអនឡាញ",
    "បន្ទាប់ពីមាន ម.ប.ស. លោកគ្រូ/អ្នកគ្រូអាចរៀនសូត្របន្ថែមដោយខ្លួនឯងតាមរយៈការស្រាវជ្រាវ តាមបណ្តាញអ៊ីនធឺណិតបានល្អប្រសើរជាងមុន",
    "បន្ទាប់ពីមាន ម.ប.ស. លោកគ្រូ/អ្នកគ្រូអាចយកចណេះដឹងឌីជីថលទៅចែករំលែក ឬជួយសមាជិកគ្រួសារ និងសហគមន៍"
  ], language), [filteredData, language]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)' }}>
        <h2 style={{ color: 'var(--accent-primary)' }}>{t[language].loading}</h2>
      </div>
    );
  }

  const totalRespondents = filteredData.length;
  const topResources = chartData1[0] || { name: 'N/A', percentTrue: 0, total: 0 };
  const topFlexibility = chartData2[0] || { name: 'N/A', percentTrue: 0, total: 0 };
  const topSafety = chartData3[0] || { name: 'N/A', percentTrue: 0, total: 0 };

  const renderChart = (data, title, desc, fullWidth = false) => {
    const chartHeight = Math.max(data.length * 65 + 60, 250);
    return (
    <div className="chart-card" style={{ gridColumn: fullWidth ? '1 / -1' : 'span 1', justifyContent: 'flex-start' }}>
      <div className="chart-header-container">
        <h3 className="chart-title">{title}</h3>
        <p className="chart-desc">{desc}</p>
      </div>
      <div className="chart-body" style={{ height: chartHeight, flex: 'none' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
            <XAxis type="number" domain={[0, 100]} tickFormatter={val => `${Math.round(val)}%`} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={220} tick={{ fill: 'var(--text-main)', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: 'var(--bg-color)' }} formatter={(val, name, props) => {
              let count = 0;
              if (name === t[language].agree) count = props.payload.trueCount;
              if (name === t[language].neutral) count = props.payload.neutralCount;
              if (name === t[language].disagree) count = props.payload.falseCount;
              return [`${val.toFixed(1)}% (${count} )`, name];
            }} />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Bar maxBarSize={45} dataKey="percentTrue" name={t[language].agree} stackId="a" fill={COLORS.teal} radius={[0, 0, 0, 0]}>
              <LabelList dataKey="percentTrue" position="center" formatter={(val) => val > 0 ? `${val.toFixed(1)}%` : ''} style={{ fill: '#fff', fontSize: 11, fontWeight: 'bold' }} />
            </Bar>
            <Bar maxBarSize={45} dataKey="percentNeutral" name={t[language].neutral} stackId="a" fill={COLORS.amber} radius={[0, 0, 0, 0]}>
              <LabelList dataKey="percentNeutral" position="center" formatter={(val) => val > 0 ? `${val.toFixed(1)}%` : ''} style={{ fill: '#fff', fontSize: 11, fontWeight: 'bold' }} />
            </Bar>
            <Bar maxBarSize={45} dataKey="percentFalse" name={t[language].disagree} stackId="a" fill={COLORS.rose} radius={[0, 4, 4, 0]}>
              <LabelList dataKey="percentFalse" position="center" formatter={(val) => val > 0 ? `${val.toFixed(1)}%` : ''} style={{ fill: '#fff', fontSize: 11, fontWeight: 'bold' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
  }

  return (
    <div className="page-container">
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

      <main className="main-content">
        <header className="header">
          <h1>{t[language].title}</h1>
          <p>{t[language].subtitle}</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
             <div style={{ height: '3px', background: COLORS.sky }}></div>
             <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
               <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Users size={15} color={COLORS.sky} />{t[language].kpiTotal}</div>
               <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)' }}>{totalRespondents}</div>
             </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
             <div style={{ height: '3px', background: COLORS.violet }}></div>
             <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
               <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Building size={15} color={COLORS.violet} />{t[language].kpi1}</div>
               <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={topResources.name}>{topResources.name}</div>
               <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{topResources.percentTrue.toFixed(1)}% ({topResources.trueCount} {t[language].people}) {t[language].agree}</div>
             </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
             <div style={{ height: '3px', background: COLORS.emerald }}></div>
             <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
               <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Cpu size={15} color={COLORS.emerald} />{t[language].kpi2}</div>
               <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={topFlexibility.name}>{topFlexibility.name}</div>
               <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{topFlexibility.percentTrue.toFixed(1)}% ({topFlexibility.trueCount} {t[language].people}) {t[language].agree}</div>
             </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
             <div style={{ height: '3px', background: COLORS.amber }}></div>
             <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
               <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><ShieldCheck size={15} color={COLORS.amber} />{t[language].kpi3}</div>
               <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={topSafety.name}>{topSafety.name}</div>
               <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{topSafety.percentTrue.toFixed(1)}% ({topSafety.trueCount} {t[language].people}) {t[language].agree}</div>
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
               <div style={{ color: COLORS.violet, fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>{t[language].insight1Title}</div>
               <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{t[language].insight1Desc}</div>
               <div style={{ color: COLORS.violet, fontWeight: 'bold', fontSize: '16px' }}>{topResources.name}</div>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
               <div style={{ color: COLORS.emerald, fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>{t[language].insight2Title}</div>
               <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{t[language].insight2Desc}</div>
               <div style={{ color: COLORS.emerald, fontWeight: 'bold', fontSize: '16px' }}>{topFlexibility.name}</div>
            </div>
            <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
               <div style={{ color: COLORS.amber, fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>{t[language].insight3Title}</div>
               <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{t[language].insight3Desc}</div>
               <div style={{ color: COLORS.amber, fontWeight: 'bold', fontSize: '16px' }}>{topSafety.name}</div>
            </div>
          </div>
        </div>

        <div className="charts-grid">
          {renderChart(chartData1, t[language].chart1Title, t[language].chart1Desc)}
          {renderChart(chartData2, t[language].chart2Title, t[language].chart2Desc)}
          {renderChart(chartData3, t[language].chart3Title, t[language].chart3Desc, true)}
        </div>
      </main>
    </div>
  );
}
