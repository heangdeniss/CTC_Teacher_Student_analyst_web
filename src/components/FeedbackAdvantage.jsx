import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from 'recharts';
import '../App.css';
import { translateData } from '../utils/dataTranslations';

const COLORS = {
  emerald: '#10b981'
};

export default function FeedbackAdvantage({ language = 'km' }) {
  const [dataAdv, setDataAdv] = useState([]);
  const [loading, setLoading] = useState(true);

  const t = {
    km: {
      loading: 'កំពុងផ្ទុកទិន្នន័យ...',
      title: 'ចំណុចវិជ្ជមានពី ម.ប.ស.',
      subtitle: 'កត្តាវិជ្ជមាន និងអត្ថប្រយោជន៍ដែលទទួលបានពីមជ្ឈមណ្ឌល',
      count: 'ចំនួន',
      chartTitle: 'ចំណុចវិជ្ជមាន',
      chartDesc: 'កត្តាវិជ្ជមានពីមជ្ឈមណ្ឌល'
    },
    en: {
      loading: 'Loading Data...',
      title: 'Advantages from CTC',
      subtitle: 'Positive factors and benefits received from the center',
      count: 'Count',
      chartTitle: 'Advantages',
      chartDesc: 'Positive factors from the center'
    }
  };

  useEffect(() => {
    const loadCSV = async (url, setter) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const text = await response.text();
        Papa.parse(text, {
          header: true, skipEmptyLines: true,
          complete: (results) => { setter(results.data); setLoading(false); },
          error: (err) => { console.error("Parse Error:", err); setLoading(false); }
        });
      } catch (error) {
        console.error("Fetch Error for", url, error);
        setLoading(false);
      }
    };
    loadCSV('/Data/CTC_teacher/CTC_Advantages.csv', setDataAdv);
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)' }}>
        <h2 style={{ color: 'var(--accent-primary)' }}>{t[language].loading}</h2>
      </div>
    );
  }

  return (
    <div className="page-container">
      <main className="main-content">
        <header className="header">
          <h1>{t[language].title}</h1>
          <p>{t[language].subtitle}</p>
        </header>

        <div className="charts-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="chart-card full-width-chart">
            <div className="chart-header-container">
              <h3 className="chart-title">{t[language].chartTitle}</h3>
              <p className="chart-desc">{t[language].chartDesc}</p>
            </div>
            <div className="chart-body" style={{ height: 450 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartAdv} layout="vertical" margin={{ top: 0, right: 60, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                  <XAxis type="number" tick={{fill: 'var(--text-muted)', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={280} tick={{fill: 'var(--text-main)', fontSize: 11, fontWeight: 500}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'var(--bg-color)'}} formatter={(val, name, props) => [`${val}  (${props.payload.percent.toFixed(1)}%)`, t[language].count]} />
                  <Bar maxBarSize={45} dataKey="value" fill={COLORS.emerald} radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="labelStr" position="right" formatter={(val) => `${val}`} style={{ fill: 'var(--text-main)', fontSize: 11, fontWeight: 'bold' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
