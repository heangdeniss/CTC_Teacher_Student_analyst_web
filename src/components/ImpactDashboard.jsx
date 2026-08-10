import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList, Legend } from 'recharts';
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
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [data3, setData3] = useState([]);
  const [data4, setData4] = useState([]);
  const [loading, setLoading] = useState(true);

  const t = {
    km: {
      loading: 'កំពុងផ្ទុកទិន្នន័យ...',
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
    let loaded = 0;
    const checkLoaded = () => {
      loaded += 1;
      if (loaded === 4) setLoading(false);
    };

    Papa.parse('/Data/CTC_teacher/1 Impact of CTC on School & Community.csv', {
      download: true, header: true, skipEmptyLines: true,
      complete: (results) => { setData1(results.data); checkLoaded(); }
    });
    Papa.parse('/Data/CTC_teacher/1 Impact on Teacher Capacity & Student Skills.csv', {
      download: true, header: true, skipEmptyLines: true,
      complete: (results) => { setData2(results.data); checkLoaded(); }
    });
    Papa.parse('/Data/CTC_teacher/2 Teacher Engagement & Community Outreach.csv', {
      download: true, header: true, skipEmptyLines: true,
      complete: (results) => { setData3(results.data); checkLoaded(); }
    });
    Papa.parse('/Data/CTC_teacher/2 Teacher Perception & Tech Readiness.csv', {
      download: true, header: true, skipEmptyLines: true,
      complete: (results) => { setData4(results.data); checkLoaded(); }
    });
  }, []);

  const processData = (data, categoryKey, valueKey, lang) => {
    const counts = {};
    const totals = {};
    data.forEach(row => {
      const catRaw = row[categoryKey];
      const val = row[valueKey]?.trim();
      if (!catRaw || !val) return;
      const cat = translateData(catRaw, lang);
      if (!counts[cat]) { counts[cat] = { trueCount: 0, falseCount: 0, neutralCount: 0 }; totals[cat] = 0; }
      totals[cat] += 1;
      if (val === 'ពិត') counts[cat].trueCount += 1;
      else if (val === 'មិនពិត') counts[cat].falseCount += 1;
      else counts[cat].neutralCount += 1;
    });
    return Object.entries(counts).map(([name, c]) => ({
      name,
      trueCount: c.trueCount,
      falseCount: c.falseCount,
      neutralCount: c.neutralCount,
      total: totals[name],
      percentTrue: totals[name] > 0 ? (c.trueCount / totals[name]) * 100 : 0,
      percentFalse: totals[name] > 0 ? (c.falseCount / totals[name]) * 100 : 0,
      percentNeutral: totals[name] > 0 ? (c.neutralCount / totals[name]) * 100 : 0
    })).sort((a, b) => b.percentTrue - a.percentTrue);
  };

  const chartData1 = useMemo(() => processData(data1, 'ផលជះនៃ ម.ប.ស. លើសាលារៀន និងសហគមន៍', 'Value ផលជះនៃ ម.ប.ស. លើសាលារៀន និងសហគមន៍', language), [data1, language]);
  const chartData2 = useMemo(() => processData(data2, 'ផលជះនៃ ម.ប.ស. លើការអភិវឌ្ឍសមត្ថភាពគ្រូ និងសិស្ស', 'Valueផលជះនៃ ម.ប.ស. លើការអភិវឌ្ឍសមត្ថភាពគ្រូ និងសិស្ស', language), [data2, language]);
  const chartData3 = useMemo(() => processData(data3, 'ការចូលរួម និងការផ្សព្វផ្សាយទៅកាន់សហគមន៍របស់គ្រូ', 'Valueការចូលរួម និងការផ្សព្វផ្សាយទៅកាន់សហគមន៍របស់គ្រូ', language), [data3, language]);
  const chartData4 = useMemo(() => processData(data4, 'ទស្សនៈ និងការបន្សាំខ្លួនផ្នែកបច្ចេកទេសរបស់គ្រូ', 'Valueទស្សនៈ និងការបន្សាំខ្លួនផ្នែកបច្ចេកទេសរបស់គ្រូ', language), [data4, language]);

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
