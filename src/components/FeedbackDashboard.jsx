import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from 'recharts';
import '../App.css';
import { translateData } from '../utils/dataTranslations';

const COLORS = {
  emerald: '#10b981',
  rose: '#e11d48'
};

export default function FeedbackDashboard({ language = 'km' }) {
  const [dataAdv, setDataAdv] = useState([]);
  const [dataDis, setDataDis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const t = {
    km: {
      loading: 'កំពុងផ្ទុកទិន្នន័យ...',
      title: 'មតិយោបល់៖ ផលវិជ្ជមាន និងអវិជ្ជមាន (Advantages & Disadvantages)',
      subtitle: 'ទិដ្ឋភាពទូទៅនៃការវាយតម្លៃរបស់លោកគ្រូអ្នកគ្រូលើផលជះនៃមជ្ឈមណ្ឌល',
      people: 'នាក់',
      count: 'ចំនួន (Count)',
      chart1Title: 'ចំណុចវិជ្ជមាន (Advantages)',
      chart1Desc: 'កត្តាវិជ្ជមានពីមជ្ឈមណ្ឌល',
      chart2Title: 'បញ្ហាប្រឈម (Challenges)',
      chart2Desc: 'បញ្ហា និងកត្តាអវិជ្ជមាន'
    },
    en: {
      loading: 'Loading Feedback...',
      title: 'Feedback: Advantages & Disadvantages',
      subtitle: 'Overview of teachers\' evaluation on the center\'s impact',
      people: 'people',
      count: 'Count',
      chart1Title: 'Advantages',
      chart1Desc: 'Positive factors from the center',
      chart2Title: 'Challenges',
      chart2Desc: 'Problems and negative factors'
    }
  };


  useEffect(() => {
    let loaded = 0;
    const checkLoaded = () => {
      loaded += 1;
      if (loaded === 2) setLoading(false);
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

    loadCSV('/Data/CTC_teacher/CTC_Advantages.csv', setDataAdv);
    loadCSV('/Data/CTC_teacher/CTC_Disadvantages.csv', setDataDis);
  }, []);

  const processData = (data, categoryKey, lang) => {
    const counts = {};
    let total = 0;
    data.forEach(row => {
      const rawCat = row[categoryKey]?.trim();
      if (!rawCat) return;
      const cat = translateData(rawCat, lang);
      if (!counts[cat]) counts[cat] = 0;
      counts[cat] += 1;
      total += 1;
    });
    return Object.entries(counts).map(([name, value]) => {
      const percent = total > 0 ? (value / total) * 100 : 0;
      return {
        name,
        value,
        percent,
        labelStr: `${value} (${percent.toFixed(1)}%)`
      };
    }).sort((a, b) => b.value - a.value);
  };

  const chartAdv = useMemo(() => processData(dataAdv, 'Structure ម.ប.ស. បានបង្កើតផលវិជ្ជមានអ្វីខ្លះដល់វិទ្យាល័យលោកគ្រូ/អ្នកគ្រូ?', language), [dataAdv, language]);
  const chartDis = useMemo(() => processData(dataDis, 'Structure ម.ប.ស. បានបង្កើតផលអវិជ្ជមានអ្វីខ្លះដល់វិទ្យាល័យលោកគ្រូ/អ្នកគ្រូ?', language), [dataDis, language]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)' }}>
        <h2 style={{ color: 'var(--accent-primary)' }}>{t[language].loading}</h2>
      </div>
    );
  }

  const renderChart = (data, title, desc, color) => (
    <div className="chart-card full-width-chart">
      <div className="chart-header-container">
        <h3 className="chart-title">{title}</h3>
        <p className="chart-desc">{desc}</p>
      </div>
      <div className="chart-body" style={{ height: 450 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 60, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
            <XAxis type="number" tick={{fill: 'var(--text-muted)', fontSize: 12}} axisLine={false} tickLine={false} />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={isMobile ? 130 : 280} 
              tick={({ x, y, payload }) => (
                <g transform={`translate(${x},${y})`}>
                  <foreignObject x={isMobile ? -120 : -270} y={-25} width={isMobile ? 120 : 270} height={50}>
                    <div xmlns="http://www.w3.org/1999/xhtml" style={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      fontSize: '11px', 
                      color: 'var(--text-main)', 
                      fontWeight: 500, 
                      lineHeight: '1.2',
                      textAlign: 'left' 
                    }}>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {payload.value}
                      </span>
                    </div>
                  </foreignObject>
                </g>
              )} 
              axisLine={false} 
              tickLine={false} 
            />
            <Tooltip cursor={{fill: 'var(--bg-color)'}} formatter={(val, name, props) => [`${val}  (${props.payload.percent.toFixed(1)}%)`, t[language].count]} />
            <Bar maxBarSize={45} dataKey="value" fill={color} radius={[0, 4, 4, 0]}>
              <LabelList dataKey="labelStr" position="right" formatter={(val) => `${val}`} style={{ fill: 'var(--text-main)', fontSize: 11, fontWeight: 'bold' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <main className="main-content">
        <header className="header">
          <h1>{t[language].title}</h1>
          <p>{t[language].subtitle}</p>
        </header>

        <div className="charts-grid">
          {renderChart(chartAdv, t[language].chart1Title, t[language].chart1Desc, COLORS.emerald)}
          {renderChart(chartDis, t[language].chart2Title, t[language].chart2Desc, COLORS.rose)}
        </div>
      </main>
    </div>
  );
}
