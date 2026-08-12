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

export default function ImpactDashboardPart1({ language = 'km' }) {
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
      school: 'សាលារៀន',
      gender: 'ភេទ',
      subject: 'មុខវិជ្ជា',
      title: 'ផលជះនៃ ម.ប.ស. លើសាលារៀន និងសហគមន៍',
      subtitle: 'ទិដ្ឋភាពទូទៅនៃផលជះលើសិស្ស ការបង្រៀន និងការគាំទ្រពីសហគមន៍',
      agree: 'យល់ស្រប (ពិត)',
      neutral: 'មិនប្រែប្រួល',
      disagree: 'មិនយល់ស្រប (មិនពិត)',
      people: 'នាក់',
      chart1Title: 'ផលជះនៃ ម.ប.ស. លើសិស្ស និងបរិស្ថានសាលា',
      chart1Desc: 'ការវាយតម្លៃលើការខិតខំប្រឹងប្រែងរបស់សិស្ស និងបរិស្ថានសាលារៀន',
      chart2Title: 'ផលជះនៃ ម.ប.ស. លើការបង្រៀន និងការគាំទ្រ',
      chart2Desc: 'ការអភិវឌ្ឍសមត្ថភាពគ្រូ និងការគាំទ្រពីអាជ្ញាធរ',
      chart3Title: 'ការយល់ដឹងពី ម.ប.ស. និងភាពពេញចិត្តរបស់គ្រូ',
      chart3Desc: 'ភាពពេញចិត្ត និងការយល់ដឹងលម្អិតអំពី ម.ប.ស.'
    },
    en: {
      loading: 'Loading Dashboard...',
      filters: 'Filters',
      school: 'School',
      gender: 'Gender',
      subject: 'Subject',
      title: 'CTC Impact on School & Community',
      subtitle: 'Overview of CTC impact on students, teaching, and community support',
      agree: 'Agree (True)',
      neutral: 'Neutral',
      disagree: 'Disagree (False)',
      people: 'people',
      chart1Title: 'CTC Impact on Students & School Environment',
      chart1Desc: 'Assessment of student effort and school atmosphere',
      chart2Title: 'CTC Impact on Teaching & Authority Support',
      chart2Desc: 'Teacher capacity development and local authority support',
      chart3Title: 'Teacher Satisfaction & CTC Understanding',
      chart3Desc: 'Teacher satisfaction and deep understanding of CTC'
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
    "ពេលមាន ម.ប.ស. សិស្សានុសិស្សខិតខំរៀនជាងមុន",
    "ពេលមាន ម.ប.ស. អត្រាសិស្សបោះបង់ការសិក្សាធ្លាក់ចុះជាងមុន",
    "ពេលមាន ម.ប.ស. បរិស្ថានសាលាមានសភាពល្អប្រសើរជាងមុន (ភាពស្អាត សណ្ដាប់ធ្នាប់)",
    "ពេលមាន ម.ប.ស. អាណាព្យាបាល និងសហគមន៍ចូលរួមអភិវឌ្ឍសាលាបានច្រើនជាងមុន"
  ], language), [filteredData, language]);

  const chartData2 = useMemo(() => processData(filteredData, [
    "ពេលមាន ម.ប.ស. អាជ្ញាធរមូលដ្ឋានបានផ្តល់ការគាំទ្រដល់វិទ្យាល័យច្រើនជាងមុន",
    "ម.ប.ស. ជួយអភិវឌ្ឍចំណេះដឹងឌីជីថលរបស់សិស្សក្នុងវិទ្យាល័យដូចនៅទីក្រុងដែរ",
    "ពេលមាន ម.ប.ស. លោកគ្រូ/អ្នកគ្រូ ប្រឹងប្រែងបង្រៀនច្រើនជាងមុន",
    "ពេលមាន ម.ប.ស. លោកគ្រូ/អ្នកគ្រូ មានសាមគ្គីភាពល្អជាងមុន"
  ], language), [filteredData, language]);

  const chartData3 = useMemo(() => processData(filteredData, [
    "ពេលមាន ម.ប.ស. លោកគ្រូ/អ្នកគ្រូ មានកន្លែងស្រាវជ្រាវ រៀបចំមេរៀនបានល្អជាងមុន",
    "លោកគ្រូ/អ្នកគ្រូ ពេញចិត្តជាមួយការកសាង ម.ប.ស. នៅក្នុងវិទ្យាល័យ",
    "លោកគ្រូ/អ្នកគ្រូ ធ្លាប់បានប្រាប់ពី ម.ប.ស. ប្រជាពលរដ្ឋជុំវិញវិទ្យាល័យ",
    "លោកគ្រូ/អ្នកគ្រូ បានយល់ដឹងពីយន្តការគ្រប់គ្រង ម.ប.ស."
  ], language), [filteredData, language]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)' }}>
        <h2 style={{ color: 'var(--accent-primary)' }}>{t[language].loading}</h2>
      </div>
    );
  }

  const renderChart = (data, title, desc) => {
    const chartHeight = Math.max(data.length * 65 + 60, 250);
    return (
    <div className="chart-card" style={{ gridColumn: 'span 1', justifyContent: 'flex-start' }}>
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
        <div className="charts-grid">
          {renderChart(chartData1, t[language].chart1Title, t[language].chart1Desc)}
          {renderChart(chartData2, t[language].chart2Title, t[language].chart2Desc)}
          {renderChart(chartData3, t[language].chart3Title, t[language].chart3Desc)}
        </div>
      </main>
    </div>
  );
}
