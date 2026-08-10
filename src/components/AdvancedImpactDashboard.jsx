import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList, Legend } from 'recharts';
import '../App.css';
import { translateData } from '../utils/dataTranslations';

const COLORS = {
  teal: '#0d9488',
  amber: '#f59e0b',
  rose: '#e11d48'
};

export default function AdvancedImpactDashboard({ language = 'km' }) {
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [data3, setData3] = useState([]);
  const [data4, setData4] = useState([]);
  const [loading, setLoading] = useState(true);

  const t = {
    km: {
      loading: 'កំពុងផ្ទុកទិន្នន័យ...',
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
    let loaded = 0;
    const checkLoaded = () => {
      loaded += 1;
      if (loaded === 4) setLoading(false);
    };

    const loadCSV = async (url, setter) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const text = await response.text();
        Papa.parse(text, {
          header: true, skipEmptyLines: true,
          complete: (results) => { setter(results.data); checkLoaded(); },
          error: (err) => { console.error("Parse Error:", err); checkLoaded(); }
        });
      } catch (error) {
        console.error("Fetch Error for", url, error);
        checkLoaded();
      }
    };

    loadCSV('/Data/CTC_teacher/3 Digital Growth.csv', setData1);
    loadCSV('/Data/CTC_teacher/3 Resource Usage & Facility Utilization.csv', setData2);
    loadCSV('/Data/CTC_teacher/4 Digital Creativity, AI Adoption & Online Safety.csv', setData3);
    loadCSV('/Data/CTC_teacher/5 Digital Safety, Autonomy & Community Impact.csv', setData4);
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

  const chartData1 = useMemo(() => processData(data1, 'ការអភិវឌ្ឍសមត្ថភាព និងជំនាញឌីជីថលរបស់គ្រូ', 'Valueការអភិវឌ្ឍសមត្ថភាព និងជំនាញឌីជីថលរបស់គ្រូ', language), [data1, language]);
  const chartData2 = useMemo(() => processData(data2, 'ការប្រើប្រាស់ធនធាន និងទីតាំងរួមរបស់គ្រូ', 'Valueការប្រើប្រាស់ធនធាន និងទីតាំងរួមរបស់គ្រូ', language), [data2, language]);
  const chartData3 = useMemo(() => processData(data3, 'ការបង្កើតមាតិកាឌីជីថល បញ្ញាសិប្បនិម្មិត (AI) និងសុវត្ថិភាព', 'Valueការបង្កើតមាតិកាឌីជីថល បញ្ញាសិប្បនិម្មិត (AI) និងសុវត្ថិភាព', language), [data3, language]);
  const chartData4 = useMemo(() => processData(data4, 'សុវត្ថិភាពឌីជីថល ការស្វ័យសិក្សា និងការរួមចំណែកដល់សហគមន៍', 'Valueសុវត្ថិភាពឌីជីថល ការស្វ័យសិក្សា និងការរួមចំណែកដល់សហគមន៍', language), [data4, language]);

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
