import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from 'recharts';
import { Users, AlertTriangle, AlertCircle, Info, Sparkles, MessageSquare } from 'lucide-react';
import '../App.css';
import { translateData } from '../utils/dataTranslations';

const COLORS = {
  rose: '#e11d48'
};

export default function FeedbackDisadvantage({ language = 'km' }) {
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
      title: 'បញ្ហាប្រឈមជាមួយ ម.ប.ស.',
      subtitle: 'បញ្ហា និងកត្តាអវិជ្ជមានដែលត្រូវបានលើកឡើងដោយលោកគ្រូអ្នកគ្រូ',
      count: 'ចំនួន',
      chartTitle: 'បញ្ហាប្រឈម',
      chartDesc: 'បញ្ហា និងកត្តាអវិជ្ជមាន',
      kpiTotal: 'បញ្ហាប្រឈមដែលបានលើកឡើងសរុប',
      kpi1: 'បញ្ហាប្រឈមទី១',
      kpi2: 'បញ្ហាប្រឈមទី២',
      kpi3: 'បញ្ហាប្រឈមទី៣',
      keyInsightsTitle: 'ចំណុចសំខាន់ៗ (Key Insights)',
      insight1Title: 'បញ្ហាចម្បង',
      insight1Desc: 'ទទួលបានការលើកឡើងច្រើនជាងគេ',
      insight2Title: 'បញ្ហាទី២',
      insight2Desc: 'ទទួលបានការលើកឡើងច្រើនបន្ទាប់',
      insight3Title: 'បញ្ហាទី៣',
      insight3Desc: 'ទទួលបានការលើកឡើងច្រើនបន្ទាប់'
    },
    en: {
      loading: 'Loading Data...',
      title: 'Challenges with CTC',
      subtitle: 'Problems and negative factors raised by teachers',
      count: 'Count',
      chartTitle: 'Challenges',
      chartDesc: 'Problems and negative factors',
      kpiTotal: 'Total Challenges Raised',
      kpi1: 'Top Challenge',
      kpi2: '2nd Challenge',
      kpi3: '3rd Challenge',
      keyInsightsTitle: 'Key Insights',
      insight1Title: 'Primary Issue',
      insight1Desc: 'Most frequently mentioned',
      insight2Title: 'Secondary Issue',
      insight2Desc: 'Second most frequently mentioned',
      insight3Title: 'Tertiary Issue',
      insight3Desc: 'Third most frequently mentioned'
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
    const uniqueRespondents = 369;
    return Object.entries(counts).map(([name, value]) => {
      const percent = uniqueRespondents > 0 ? (value / uniqueRespondents) * 100 : 0;
      return {
        name,
        value,
        percent,
        labelStr: `${value} (${percent.toFixed(1)}%)`
      };
    }).sort((a, b) => b.value - a.value);
  };

  const chartDis = useMemo(() => processData(dataDis, 'Structure ម.ប.ស. បានបង្កើតផលអវិជ្ជមានអ្វីខ្លះដល់វិទ្យាល័យលោកគ្រូ/អ្នកគ្រូ?', language), [dataDis, language]);

  const totalPoints = dataDis.length;
  const top1 = chartDis[0] || { name: 'N/A', value: 0, percent: 0 };
  const top2 = chartDis[1] || { name: 'N/A', value: 0, percent: 0 };
  const top3 = chartDis[2] || { name: 'N/A', value: 0, percent: 0 };

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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
             <div style={{ height: '3px', background: '#0ea5e9' }}></div>
             <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
               <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><MessageSquare size={15} color="#0ea5e9" />{t[language].kpiTotal}</div>
               <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)' }}>{totalPoints}</div>
             </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
             <div style={{ height: '3px', background: '#e11d48' }}></div>
             <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
               <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><AlertTriangle size={15} color="#e11d48" />{t[language].kpi1}</div>
               <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={top1.name}>{top1.name}</div>
               <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{top1.percent.toFixed(1)}% ({top1.value} {t[language].count})</div>
             </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
             <div style={{ height: '3px', background: '#f97316' }}></div>
             <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
               <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><AlertCircle size={15} color="#f97316" />{t[language].kpi2}</div>
               <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={top2.name}>{top2.name}</div>
               <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{top2.percent.toFixed(1)}% ({top2.value} {t[language].count})</div>
             </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
             <div style={{ height: '3px', background: '#f59e0b' }}></div>
             <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
               <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Info size={15} color="#f59e0b" />{t[language].kpi3}</div>
               <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={top3.name}>{top3.name}</div>
               <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{top3.percent.toFixed(1)}% ({top3.value} {t[language].count})</div>
             </div>
          </div>
        </div>

        <div className="chart-card" style={{ minHeight: 'auto', marginBottom: '24px', padding: '24px', background: 'var(--card-bg)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--text-main)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
            <Sparkles size={20} color="var(--amber)" />
            {t[language].keyInsightsTitle}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'rgba(225, 29, 72, 0.05)', border: '1px solid rgba(225, 29, 72, 0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
               <div style={{ color: '#e11d48', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>{t[language].insight1Title}</div>
               <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{t[language].insight1Desc}</div>
               <div style={{ color: '#e11d48', fontWeight: 'bold', fontSize: '16px' }}>{top1.name}</div>
            </div>
            <div style={{ background: 'rgba(249, 115, 22, 0.05)', border: '1px solid rgba(249, 115, 22, 0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
               <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>{t[language].insight2Title}</div>
               <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{t[language].insight2Desc}</div>
               <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '16px' }}>{top2.name}</div>
            </div>
            <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
               <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>{t[language].insight3Title}</div>
               <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{t[language].insight3Desc}</div>
               <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '16px' }}>{top3.name}</div>
            </div>
          </div>
        </div>

        <div className="charts-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="chart-card full-width-chart">
            <div className="chart-header-container">
              <h3 className="chart-title">{t[language].chartTitle}</h3>
              <p className="chart-desc">{t[language].chartDesc}</p>
            </div>
            <div className="chart-body" style={{ height: 450 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDis} layout="vertical" margin={{ top: 0, right: 60, left: 0, bottom: 0 }}>
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
                  <Bar maxBarSize={45} dataKey="value" fill={COLORS.rose} radius={[0, 4, 4, 0]}>
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
