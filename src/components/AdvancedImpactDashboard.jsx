import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList, Legend } from 'recharts';
import { Filter } from 'lucide-react';
import '../App.css';
import { translateData } from '../utils/dataTranslations';

const COLORS = {
  teal: '#0d9488',
  amber: '#f59e0b',
  rose: '#e11d48'
};

export default function AdvancedImpactDashboard({ language = 'km' }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedSchool, setSelectedSchool] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const t = {
    km: {
      loading: 'កំពុងផ្ទុកទិន្នន័យ...',
      filters: 'ជម្រើសចម្រាញ់',
      school: 'សាលារៀន (School)',
      gender: 'ភេទ (Gender)',
      subject: 'មុខវិជ្ជា (Subject)',
      title: 'ផ្ទាំងគ្រប់គ្រងការអភិវឌ្ឍជំនាញ & សុវត្ថិភាពឌីជីថល (Skills & Safety)',
      subtitle: 'ទិដ្ឋភាពទូទៅនៃការអភិវឌ្ឍសមត្ថភាព ភាពច្នៃប្រឌិត និងសុវត្ថិភាពឌីជីថល',
      agree: 'យល់ស្រប (ពិត)',
      neutral: 'មិនប្រែប្រួល',
      disagree: 'មិនយល់ស្រប (មិនពិត)',
      people: 'នាក់',
      chart1Title: 'ជំនាញឌីជីថល',
      chart1Desc: 'ការអភិវឌ្ឍជំនាញថ្មីៗ',
      chart2Title: 'ការប្រើប្រាស់ធនធានរួម',
      chart2Desc: 'ការប្រើប្រាស់ទីតាំងមជ្ឈមណ្ឌល',
      chart3Title: 'ភាពច្នៃប្រឌិត និង AI',
      chart3Desc: 'បច្ចេកវិទ្យាក្នុងការបង្រៀន',
      chart4Title: 'សុវត្ថិភាព និងស្វ័យសិក្សា',
      chart4Desc: 'ការយល់ដឹងពីសុវត្ថិភាពអនឡាញ'
    },
    en: {
      loading: 'Loading Advanced Impact...',
      filters: 'Filters',
      school: 'School',
      gender: 'Gender',
      subject: 'Subject',
      title: 'Skills & Digital Safety Dashboard',
      subtitle: 'Overview of capacity development, creativity, and digital safety',
      agree: 'Agree (True)',
      neutral: 'Neutral',
      disagree: 'Disagree (False)',
      people: 'people',
      chart1Title: 'Digital Skills',
      chart1Desc: 'Development of new skills',
      chart2Title: 'Shared Resources',
      chart2Desc: 'Utilization of center facilities',
      chart3Title: 'Creativity and AI',
      chart3Desc: 'Technology in teaching',
      chart4Title: 'Safety and Self-Learning',
      chart4Desc: 'Awareness of online safety'
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

  const processData = (sourceData, questions, lang) => {
    const results = questions.map(q => {
      let trueCount = 0;
      let falseCount = 0;
      let neutralCount = 0;
      let total = 0;

      sourceData.forEach(row => {
        const val = row[q]?.trim();
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
    "លោកគ្រូ/អ្នកគ្រូបានចូលរៀនអភិវឌ្ឍជំនាញឌីជីថលរបស់ខ្លួន នៅ ម.ប.ស.",
    "ចាប់តាំងពីមានម.ប.ស. មក លោកគ្រូ/អ្នកគ្រូ មានឱកាសបានប្រើប្រាស់ កុំព្យូទ័រ ច្រើនជាងមុន និងមានប្រសិទ្ធភាពជាងមុន",
    "ចាប់តាំងពីមាន ម.ប.ស. មក លោកគ្រូ/អ្នកគ្រូ មានឱកាសប្រើប្រាស់អ៊ីនធឺណិតបានច្រើនជាងមុន និងមានប្រសិទ្ធភាពជាងមុន",
    "បន្ទាប់ពីមាន ម.ប.ស. លោកគ្រូ/អ្នកគ្រូយល់ដឹងពីកុំព្យូទ័រ អ៊ីនធឺណិត និងអាចប្រើប្រាស់ បានល្អប្រសើរជាងមុន",
    "បន្ទាប់ពីមាន ម.ប.ស. លោកគ្រូ/អ្នកគ្រូអាចបង្កើតប្រើប្រាស់អ៊ីម៉ែល Google docs បានល្អជាងមុន",
    "បន្ទាប់ពីមាន ម.ប.ស. លោកគ្រូ/អ្នកគ្រូអាចបង្កើតបទបង្ហាញបានល្អជាងមុន"
  ], language), [filteredData, language]);

  const chartData2 = useMemo(() => processData(filteredData, [
    "ម.ប.ស. ជួយផ្តល់ទីតាំងសម្រាកលម្ហែដល់ លោកគ្រូ/អ្នកគ្រូ ប្រសើរជាងមុន",
    "លោកគ្រូ/អ្នកគ្រូបានប្រើប្រាស់កុំព្យូទ័រ និងឧបករណ៍ឌីជីថលក្នុង ម.ប.ស. សម្រាប់រៀបចំការបង្រៀន និងស្រាវជ្រាវ",
    "លោកគ្រូ/អ្នកគ្រូ បានប្រើប្រាស់ទីតាំងសម្រាប់កិច្ចប្រជុំនានា",
    "លោកគ្រូ/អ្នកគ្រូបានប្រើប្រាស់ទីតាំងសម្រាប់សម្រាកក្រៅម៉ោងការងារ",
    "លោកគ្រូ/អ្នកគ្រូ បានប្រើប្រាស់សេវាប្រៃសណីយ៍",
    "លោកគ្រូ/អ្នកគ្រូអាចប្រើប្រាស់ ម.ប.ស. នេះបានតាមតម្រូវការ គ្រប់ពេលវេលាដើម្បីរៀបចំ ការបង្រៀនរបស់ខ្លួន"
  ], language), [filteredData, language]);

  const chartData3 = useMemo(() => processData(filteredData, [
    "លោកគ្រូ/អ្នកគ្រូអាចរចនារូបភាព និងមាតិកាឌីជីថលបានល្អជាងមុន",
    "លោកគ្រូ/អ្នកគ្រូអាចប្រើប្រាស់ឧបករណ៍ AI បាន",
    "បន្ទាប់ពីមាន ម.ប.ស. លោកគ្រូ/អ្នកគ្រូអាចស្វែងរកព័ត៌មានលើបណ្តាញអ៊ីនធឺណិត បានល្អប្រសើរជាងមុន"
  ], language), [filteredData, language]);

  const chartData4 = useMemo(() => processData(filteredData, [
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

  const renderChart = (data, title, desc) => (
    <div className="chart-card" style={{ gridColumn: 'span 1' }}>
      <div className="chart-header-container">
        <h3 className="chart-title">{title}</h3>
        <p className="chart-desc">{desc}</p>
      </div>
      <div className="chart-body" style={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
            <XAxis type="number" domain={[0, 100]} tickFormatter={val => `${val}%`} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
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

      <main className="main-content">
        <header className="header">
          <h1>{t[language].title}</h1>
          <p>{t[language].subtitle}</p>
        </header>

        <div className="charts-grid">
          {renderChart(chartData1, t[language].chart1Title, t[language].chart1Desc)}
          {renderChart(chartData2, t[language].chart2Title, t[language].chart2Desc)}
          {renderChart(chartData3, t[language].chart3Title, t[language].chart3Desc)}
          {renderChart(chartData4, t[language].chart4Title, t[language].chart4Desc)}
        </div>
      </main>
    </div>
  );
}
