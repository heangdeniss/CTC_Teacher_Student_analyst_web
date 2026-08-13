import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from 'recharts';
import { Users, Trophy, Medal, Award, Sparkles, MessageSquare } from 'lucide-react';
import '../App.css';
import { translateData } from '../utils/dataTranslations';

const COLORS = {
  emerald: '#10b981'
};

export default function FeedbackAdvantage({ language = 'km' }) {
  const [dataAdv, setDataAdv] = useState([]);
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
      title: 'ចំណុចវិជ្ជមានពី ម.ប.ស.',
      subtitle: 'កត្តាវិជ្ជមាន និងអត្ថប្រយោជន៍ដែលទទួលបានពីមជ្ឈមណ្ឌល',
      count: 'ចំនួន',
      chartTitle: 'ចំណុចវិជ្ជមាន',
      chartDesc: 'កត្តាវិជ្ជមានពីមជ្ឈមណ្ឌល',
      kpiTotal: 'មតិយោបល់វិជ្ជមានសរុប',
      kpi1: 'ចំណុចវិជ្ជមានទី១',
      kpi2: 'ចំណុចវិជ្ជមានទី២',
      kpi3: 'ចំណុចវិជ្ជមានទី៣',
      keyInsightsTitle: 'ចំណុចសំខាន់ៗ (Key Insights)',
      insight1Title: 'អត្ថប្រយោជន៍ចម្បង',
      insight1Desc: 'ទទួលបានការលើកឡើងច្រើនជាងគេ',
      insight2Title: 'អត្ថប្រយោជន៍ទី២',
      insight2Desc: 'ទទួលបានការលើកឡើងច្រើនបន្ទាប់',
      insight3Title: 'អត្ថប្រយោជន៍ទី៣',
      insight3Desc: 'ទទួលបានការលើកឡើងច្រើនបន្ទាប់'
    },
    en: {
      loading: 'Loading Data...',
      title: 'Advantages from CTC',
      subtitle: 'Positive factors and benefits received from the center',
      count: 'Count',
      chartTitle: 'Advantages',
      chartDesc: 'Positive factors from the center',
      kpiTotal: 'Total Positive Points',
      kpi1: 'Top Advantage',
      kpi2: '2nd Advantage',
      kpi3: '3rd Advantage',
      keyInsightsTitle: 'Key Insights',
      insight1Title: 'Primary Benefit',
      insight1Desc: 'Most frequently mentioned',
      insight2Title: 'Secondary Benefit',
      insight2Desc: 'Second most frequently mentioned',
      insight3Title: 'Tertiary Benefit',
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

  const chartAdv = useMemo(() => processData(dataAdv, 'Structure ម.ប.ស. បានបង្កើតផលវិជ្ជមានអ្វីខ្លះដល់វិទ្យាល័យលោកគ្រូ/អ្នកគ្រូ?', language), [dataAdv, language]);

  const totalPoints = dataAdv.length;
  const top1 = chartAdv[0] || { name: 'N/A', value: 0, percent: 0 };
  const top2 = chartAdv[1] || { name: 'N/A', value: 0, percent: 0 };
  const top3 = chartAdv[2] || { name: 'N/A', value: 0, percent: 0 };

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
             <div style={{ height: '3px', background: '#10b981' }}></div>
             <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
               <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Trophy size={15} color="#10b981" />{t[language].kpi1}</div>
               <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={top1.name}>{top1.name}</div>
               <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{top1.percent.toFixed(1)}% ({top1.value} {t[language].count})</div>
             </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
             <div style={{ height: '3px', background: '#3b82f6' }}></div>
             <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
               <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Medal size={15} color="#3b82f6" />{t[language].kpi2}</div>
               <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={top2.name}>{top2.name}</div>
               <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{top2.percent.toFixed(1)}% ({top2.value} {t[language].count})</div>
             </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
             <div style={{ height: '3px', background: '#8b5cf6' }}></div>
             <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
               <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Award size={15} color="#8b5cf6" />{t[language].kpi3}</div>
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
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
               <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>{t[language].insight1Title}</div>
               <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{t[language].insight1Desc}</div>
               <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '16px' }}>{top1.name}</div>
            </div>
            <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
               <div style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>{t[language].insight2Title}</div>
               <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{t[language].insight2Desc}</div>
               <div style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '16px' }}>{top2.name}</div>
            </div>
            <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
               <div style={{ color: '#8b5cf6', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>{t[language].insight3Title}</div>
               <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{t[language].insight3Desc}</div>
               <div style={{ color: '#8b5cf6', fontWeight: 'bold', fontSize: '16px' }}>{top3.name}</div>
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
                <BarChart data={chartAdv} layout="vertical" margin={{ top: 0, right: 60, left: 0, bottom: 0 }}>
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
