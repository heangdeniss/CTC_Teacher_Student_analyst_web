import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList, Legend } from 'recharts';
import { Filter, Users, Laptop, Lightbulb, PenTool } from 'lucide-react';
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

export default function ImpactDashboardPart2({ 
  language = 'km',
  selectedSchool = 'All', setSelectedSchool = () => {},
  selectedGender = 'All', setSelectedGender = () => {},
  selectedSubject = 'All', setSelectedSubject = () => {}
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filters State (now passed as props)

  const t = {
    km: {
      loading: 'កំពុងផ្ទុកទិន្នន័យ...',
      filters: 'ចម្រុះ',
      school: 'សាលារៀន',
      gender: 'ភេទ',
      subject: 'មុខវិជ្ជា',
      title: 'ការបន្សាំបច្ចេកវិទ្យា និងជំនាញឌីជីថលពី ម.ប.ស.',
      subtitle: 'ការទទួលយកបច្ចេកវិទ្យា និងការអភិវឌ្ឍជំនាញឌីជីថលរបស់គ្រូ',
      agree: 'យល់ស្រប (ពិត)',
      neutral: 'មិនប្រែប្រួល',
      disagree: 'មិនយល់ស្រប (មិនពិត)',
      people: 'នាក់',
      chart1Title: 'ការចូលរួមក្នុង ម.ប.ស. និងជំនួយបច្ចេកទេស',
      chart1Desc: 'ការលើកទឹកចិត្ត និងភាពងាយស្រួលក្នុងការទទួលបានជំនួយបច្ចេកទេស',
      chart2Title: 'ការអភិវឌ្ឍជំនាញឌីជីថលតាមរយៈ ម.ប.ស.',
      chart2Desc: 'ការយល់ដឹងពីអត្ថប្រយោជន៍ និងការប្រើប្រាស់កុំព្យូទ័រ/អ៊ីនធឺណិត',
      chart2Desc: 'ការយល់ដឹងពីអត្ថប្រយោជន៍ និងការប្រើប្រាស់កុំព្យូទ័រ/អ៊ីនធឺណិត',
      chart3Title: 'ការបង្កើតមាតិកាឌីជីថលកម្រិតខ្ពស់ដោយ ម.ប.ស.',
      chart3Desc: 'ការប្រើប្រាស់អ៊ីមែល ឯកសារ (Docs) និងការរចនាមាតិកា',
      totalParticipants: 'អ្នកចូលរួមសរុប',
      kpi1: 'ការគាំទ្របច្ចេកទេស',
      kpi2: 'ការលូតលាស់ជំនាញឌីជីថល',
      kpi3: 'ការបង្កើតមាតិកា',
      keyInsightsTitle: 'ចំណុចសំខាន់ៗ (Key Insights)',
      keyInsight1Title: 'ការចូលរួមយ៉ាងសកម្ម',
      keyInsight1Desc: 'ទទួលបានការវាយតម្លៃវិជ្ជមានបំផុត',
      keyInsight2Title: 'ជំនាញឌីជីថល',
      keyInsight2Desc: 'ទទួលបានការវាយតម្លៃវិជ្ជមានបំផុត',
      keyInsight3Title: 'មាតិកាឌីជីថល',
      keyInsight3Desc: 'ទទួលបានការវាយតម្លៃវិជ្ជមានបំផុត'
    },
    en: {
      loading: 'Loading Dashboard...',
      filters: 'Filters',
      school: 'School',
      gender: 'Gender',
      subject: 'Subject',
      title: 'CTC Technology & Digital Skills',
      subtitle: 'Technology adoption and development of digital skills by teachers',
      agree: 'Agree (True)',
      neutral: 'Neutral',
      disagree: 'Disagree (False)',
      people: 'people',
      chart1Title: 'CTC Engagement & Tech Support',
      chart1Desc: 'Encouragement and ease of accessing technical support',
      chart2Title: 'Digital Skills Growth via CTC',
      chart2Desc: 'Understanding benefits and usage of computers/internet',
      chart2Desc: 'Understanding benefits and usage of computers/internet',
      chart3Title: 'Advanced Digital Content Creation at CTC',
      chart3Desc: 'Using email, docs, and designing content',
      totalParticipants: 'Total Participants',
      kpi1: 'Tech Support',
      kpi2: 'Digital Skills Growth',
      kpi3: 'Content Creation',
      keyInsightsTitle: 'Key Insights',
      keyInsight1Title: 'Active Engagement',
      keyInsight1Desc: 'Received the most positive feedback',
      keyInsight2Title: 'Digital Skills',
      keyInsight2Desc: 'Received the most positive feedback',
      keyInsight3Title: 'Content Creation',
      keyInsight3Desc: 'Received the most positive feedback'
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
    "លោកគ្រូ/អ្នកគ្រូត្រូវបានលើកទឹកចិត្តឱ្យចូលប្រើប្រាស់ ម.ប.ស.",
    "លោកគ្រូ/អ្នកគ្រូ បានដឹងពីគោលបំណងនៃការបង្កើត ម.ប.ស. នេះបានច្បាស់លាស់",
    "លោកគ្រូ/អ្នកគ្រូ មានទំនុកចិត្តថាអាចស្វែងរកជំនួយបច្ចេកទេសកុំព្យូទ័របានល្អជាងមុន",
    "លោកគ្រូ/អ្នកគ្រូ មានភាពងាយស្រួល ក្នុងការបង្រៀនមុខវិជ្ជាផ្ទាល់ខ្លួនដោយប្រើប្រាស់បច្ចេកវិទ្យា ជាជំនួយ"
  ], language), [filteredData, language]);

  const chartData2 = useMemo(() => processData(filteredData, [
    "បន្ទាប់ពីមាន ម.ប.ស. លោកគ្រូ/អ្នកគ្រូមានជំនឿចិត្តថាជំនាញឌីជីថល មានប្រយោជន៍ដល់ការងារប្រចាំថ្ងៃ",
    "លោកគ្រូ/អ្នកគ្រូបានចូលរៀនអភិវឌ្ឍជំនាញឌីជីថលរបស់ខ្លួន នៅ ម.ប.ស.",
    "ចាប់តាំងពីមានម.ប.ស. មក លោកគ្រូ/អ្នកគ្រូ មានឱកាសបានប្រើប្រាស់ កុំព្យូទ័រ ច្រើនជាងមុន និងមានប្រសិទ្ធភាពជាងមុន",
    "ចាប់តាំងពីមាន ម.ប.ស. មក លោកគ្រូ/អ្នកគ្រូ មានឱកាសប្រើប្រាស់អ៊ីនធឺណិតបានច្រើនជាងមុន និងមានប្រសិទ្ធភាពជាងមុន"
  ], language), [filteredData, language]);

  const chartData3 = useMemo(() => processData(filteredData, [
    "បន្ទាប់ពីមាន ម.ប.ស. លោកគ្រូ/អ្នកគ្រូយល់ដឹងពីកុំព្យូទ័រ អ៊ីនធឺណិត និងអាចប្រើប្រាស់ បានល្អប្រសើរជាងមុន",
    "បន្ទាប់ពីមាន ម.ប.ស. លោកគ្រូ/អ្នកគ្រូអាចបង្កើតប្រើប្រាស់អ៊ីម៉ែល Google docs បានល្អជាងមុន",
    "បន្ទាប់ពីមាន ម.ប.ស. លោកគ្រូ/អ្នកគ្រូអាចបង្កើតបទបង្ហាញបានល្អជាងមុន",
    "លោកគ្រូ/អ្នកគ្រូអាចរចនារូបភាព និងមាតិកាឌីជីថលបានល្អជាងមុន"
  ], language), [filteredData, language]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)' }}>
        <h2 style={{ color: 'var(--accent-primary)' }}>{t[language].loading}</h2>
      </div>
    );
  }

  const totalRespondents = filteredData.length;
  
  const topTechSupport = chartData1[0] || { name: 'N/A', percentTrue: 0, total: 0 };
  const topDigitalSkills = chartData2[0] || { name: 'N/A', percentTrue: 0, total: 0 };
  const topContentCreation = chartData3[0] || { name: 'N/A', percentTrue: 0, total: 0 };
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
          {(() => {
            const renderCustomBarLabel = (props) => {
              const { x, y, width, height, value } = props;
              if (typeof width !== 'number' || width < 35 || typeof value !== 'number' || value <= 0) return null;
              return (
                <text x={x + width / 2} y={y + height / 2} fill="#fff" fontSize={11} fontWeight="bold" textAnchor="middle" dominantBaseline="central">
                  {value.toFixed(1)}%
                </text>
              );
            };

            const CustomYAxisTick = ({ x, y, payload }) => {
              const width = isMobile ? 110 : 210;
              const xOffset = isMobile ? -110 : -210;
              return (
                <g transform={`translate(${x},${y})`}>
                  <foreignObject x={xOffset} y={-25} width={width} height={50}>
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
              );
            };

            return (
              <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
            <XAxis type="number" domain={[0, 100]} tickFormatter={val => `${Math.round(val)}%`} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={isMobile ? 120 : 220} tick={<CustomYAxisTick />} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: 'var(--bg-color)' }} formatter={(val, name, props) => {
              let count = 0;
              if (name === t[language].agree) count = props.payload.trueCount;
              if (name === t[language].neutral) count = props.payload.neutralCount;
              if (name === t[language].disagree) count = props.payload.falseCount;
              return [`${val.toFixed(1)}% (${count} )`, name];
            }} />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Bar maxBarSize={45} dataKey="percentTrue" name={t[language].agree} stackId="a" fill={COLORS.teal} radius={[0, 0, 0, 0]}>
              <LabelList dataKey="percentTrue" position="center" content={renderCustomBarLabel} />
            </Bar>
            <Bar maxBarSize={45} dataKey="percentNeutral" name={t[language].neutral} stackId="a" fill={COLORS.amber} radius={[0, 0, 0, 0]}>
              <LabelList dataKey="percentNeutral" position="center" content={renderCustomBarLabel} />
            </Bar>
            <Bar maxBarSize={45} dataKey="percentFalse" name={t[language].disagree} stackId="a" fill={COLORS.rose} radius={[0, 4, 4, 0]}>
              <LabelList dataKey="percentFalse" position="center" content={renderCustomBarLabel} />
            </Bar>
          </BarChart>
            );
          })()}
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
               <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Users size={15} color={COLORS.sky} />{t[language].totalParticipants}</div>
               <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)' }}>{totalRespondents}</div>
             </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
             <div style={{ height: '3px', background: COLORS.teal }}></div>
             <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
               <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Laptop size={15} color={COLORS.teal} />{t[language].kpi1}</div>
               <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={topTechSupport.name}>{topTechSupport.name}</div>
               <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{topTechSupport.percentTrue.toFixed(1)}% ({topTechSupport.trueCount} {t[language].people}) {t[language].agree}</div>
             </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
             <div style={{ height: '3px', background: COLORS.violet }}></div>
             <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
               <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Lightbulb size={15} color={COLORS.violet} />{t[language].kpi2}</div>
               <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={topDigitalSkills.name}>{topDigitalSkills.name}</div>
               <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{topDigitalSkills.percentTrue.toFixed(1)}% ({topDigitalSkills.trueCount} {t[language].people}) {t[language].agree}</div>
             </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
             <div style={{ height: '3px', background: COLORS.amber }}></div>
             <div style={{ padding: '16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
               <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><PenTool size={15} color={COLORS.amber} />{t[language].kpi3}</div>
               <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={topContentCreation.name}>{topContentCreation.name}</div>
               <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{topContentCreation.percentTrue.toFixed(1)}% ({topContentCreation.trueCount} {t[language].people}) {t[language].agree}</div>
             </div>
          </div>

        </div>

        <div className="chart-card" style={{ minHeight: 'auto', marginBottom: '24px', padding: '24px', background: 'var(--card-bg)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--text-main)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
            <Lightbulb size={20} color="var(--amber)" />
            {t[language].keyInsightsTitle}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            
            <div style={{ background: 'rgba(13, 148, 136, 0.05)', border: '1px solid rgba(13, 148, 136, 0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
               <div style={{ color: COLORS.teal, fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>{t[language].keyInsight1Title}</div>
               <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{t[language].keyInsight1Desc}</div>
               <div style={{ color: COLORS.teal, fontWeight: 'bold', fontSize: '16px' }}>{topTechSupport.name}</div>
            </div>

            <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
               <div style={{ color: COLORS.violet, fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>{t[language].keyInsight2Title}</div>
               <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{t[language].keyInsight2Desc}</div>
               <div style={{ color: COLORS.violet, fontWeight: 'bold', fontSize: '16px' }}>{topDigitalSkills.name}</div>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
               <div style={{ color: COLORS.amber, fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>{t[language].keyInsight3Title}</div>
               <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{t[language].keyInsight3Desc}</div>
               <div style={{ color: COLORS.amber, fontWeight: 'bold', fontSize: '16px' }}>{topContentCreation.name}</div>
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
