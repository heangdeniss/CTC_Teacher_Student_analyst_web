import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList, Legend } from 'recharts';
import { Filter } from 'lucide-react';
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

export default function ImpactDashboard({ language = 'km' }) {
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
      title: 'ផ្ទាំងគ្រប់គ្រងផលជះ និងការចូលរួម (Impact & Engagement)',
      subtitle: 'ទិដ្ឋភាពទូទៅនៃផលជះលើសាលារៀន សហគមន៍ សមត្ថភាពគ្រូ និងសិស្ស',
      agree: 'យល់ស្រប (ពិត)',
      neutral: 'មិនប្រែប្រួល',
      disagree: 'មិនយល់ស្រប (មិនពិត)',
      people: 'នាក់',
      chart1Title: 'សាលារៀន និងសហគមន៍',
      chart1Desc: 'ការវាយតម្លៃលើការរីកចម្រើន',
      chart2Title: 'សមត្ថភាពគ្រូ និងសិស្ស',
      chart2Desc: 'ការវាយតម្លៃលើការអភិវឌ្ឍ',
      chart3Title: 'ការចូលរួមក្នុងសហគមន៍',
      chart3Desc: 'សកម្មភាពផ្សព្វផ្សាយ និងចូលរួម',
      chart4Title: 'ការបន្សាំខ្លួននឹងបច្ចេកវិទ្យា',
      chart4Desc: 'ការទទួលយកបច្ចេកវិទ្យាថ្មីៗ'
    },
    en: {
      loading: 'Loading Impact Dashboard...',
      filters: 'Filters',
      school: 'School',
      gender: 'Gender',
      subject: 'Subject',
      title: 'Impact & Engagement Dashboard',
      subtitle: 'Overview of impact on schools, community, and capacity',
      agree: 'Agree (True)',
      neutral: 'Neutral',
      disagree: 'Disagree (False)',
      people: 'people',
      chart1Title: 'School & Community',
      chart1Desc: 'Assessment of progress',
      chart2Title: 'Teacher & Student Capacity',
      chart2Desc: 'Assessment of development',
      chart3Title: 'Community Engagement',
      chart3Desc: 'Outreach and participation activities',
      chart4Title: 'Technology Adaptation',
      chart4Desc: 'Adoption of new technologies'
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
    "ពេលមាន ម.ប.ស. សិស្សានុសិស្សខិតខំរៀនជាងមុន",
    "ពេលមាន ម.ប.ស. អត្រាសិស្សបោះបង់ការសិក្សាធ្លាក់ចុះជាងមុន",
    "ពេលមាន ម.ប.ស. បរិស្ថានសាលាមានសភាពល្អប្រសើរជាងមុន (ភាពស្អាត សណ្ដាប់ធ្នាប់)",
    "ពេលមាន ម.ប.ស. អាណាព្យាបាល និងសហគមន៍ចូលរួមអភិវឌ្ឍសាលាបានច្រើនជាងមុន",
    "ពេលមាន ម.ប.ស. អាជ្ញាធរមូលដ្ឋានបានផ្តល់ការគាំទ្រដល់វិទ្យាល័យច្រើនជាងមុន"
  ], language), [filteredData, language]);

  const chartData2 = useMemo(() => processData(filteredData, [
    "ម.ប.ស. ជួយអភិវឌ្ឍចំណេះដឹងឌីជីថលរបស់សិស្សក្នុងវិទ្យាល័យដូចនៅទីក្រុងដែរ",
    "ពេលមាន ម.ប.ស. លោកគ្រូ/អ្នកគ្រូ ប្រឹងប្រែងបង្រៀនច្រើនជាងមុន",
    "ពេលមាន ម.ប.ស. លោកគ្រូ/អ្នកគ្រូ មានសាមគ្គីភាពល្អជាងមុន",
    "ពេលមាន ម.ប.ស. លោកគ្រូ/អ្នកគ្រូ មានកន្លែងស្រាវជ្រាវ រៀបចំមេរៀនបានល្អជាងមុន",
    "លោកគ្រូ/អ្នកគ្រូ ពេញចិត្តជាមួយការកសាង ម.ប.ស. នៅក្នុងវិទ្យាល័យ"
  ], language), [filteredData, language]);

  const chartData3 = useMemo(() => processData(filteredData, [
    "លោកគ្រូ/អ្នកគ្រូ ធ្លាប់បានប្រាប់ពី ម.ប.ស. ប្រជាពលរដ្ឋជុំវិញវិទ្យាល័យ",
    "លោកគ្រូ/អ្នកគ្រូ បានយល់ដឹងពីយន្តការគ្រប់គ្រង ម.ប.ស.",
    "លោកគ្រូ/អ្នកគ្រូត្រូវបានលើកទឹកចិត្តឱ្យចូលប្រើប្រាស់ ម.ប.ស.",
    "លោកគ្រូ/អ្នកគ្រូ បានដឹងពីគោលបំណងនៃការបង្កើត ម.ប.ស. នេះបានច្បាស់លាស់"
  ], language), [filteredData, language]);

  const chartData4 = useMemo(() => processData(filteredData, [
    "លោកគ្រូ/អ្នកគ្រូ មានទំនុកចិត្តថាអាចស្វែងរកជំនួយបច្ចេកទេសកុំព្យូទ័របានល្អជាងមុន",
    "លោកគ្រូ/អ្នកគ្រូ មានភាពងាយស្រួល ក្នុងការបង្រៀនមុខវិជ្ជាផ្ទាល់ខ្លួនដោយប្រើប្រាស់បច្ចេកវិទ្យា ជាជំនួយ",
    "បន្ទាប់ពីមាន ម.ប.ស. លោកគ្រូ/អ្នកគ្រូមានជំនឿចិត្តថាជំនាញឌីជីថល មានប្រយោជន៍ដល់ការងារប្រចាំថ្ងៃ"
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
