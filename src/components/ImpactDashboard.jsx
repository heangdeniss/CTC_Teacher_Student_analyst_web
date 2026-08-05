import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from 'recharts';
import '../App.css';

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

export default function ImpactDashboard() {
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [data3, setData3] = useState([]);
  const [data4, setData4] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const processData = (data, categoryKey, valueKey) => {
    const counts = {};
    const totals = {};
    data.forEach(row => {
      const cat = row[categoryKey];
      const val = row[valueKey]?.trim();
      if (!cat || !val) return;
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

  const chartData1 = useMemo(() => processData(data1, 'ផលជះនៃ ម.ប.ស. លើសាលារៀន និងសហគមន៍', 'Value ផលជះនៃ ម.ប.ស. លើសាលារៀន និងសហគមន៍'), [data1]);
  const chartData2 = useMemo(() => processData(data2, 'ផលជះនៃ ម.ប.ស. លើការអភិវឌ្ឍសមត្ថភាពគ្រូ និងសិស្ស', 'Valueផលជះនៃ ម.ប.ស. លើការអភិវឌ្ឍសមត្ថភាពគ្រូ និងសិស្ស'), [data2]);
  const chartData3 = useMemo(() => processData(data3, 'ការចូលរួម និងការផ្សព្វផ្សាយទៅកាន់សហគមន៍របស់គ្រូ', 'Valueការចូលរួម និងការផ្សព្វផ្សាយទៅកាន់សហគមន៍របស់គ្រូ'), [data3]);
  const chartData4 = useMemo(() => processData(data4, 'ទស្សនៈ និងការបន្សាំខ្លួនផ្នែកបច្ចេកទេសរបស់គ្រូ', 'Valueទស្សនៈ និងការបន្សាំខ្លួនផ្នែកបច្ចេកទេសរបស់គ្រូ'), [data4]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)' }}>
        <h2 style={{ color: 'var(--accent-primary)' }}>Loading Impact Dashboard...</h2>
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
            <XAxis type="number" domain={[0, 100]} tickFormatter={val => `${val}%`} tick={{fill: 'var(--text-muted)', fontSize: 12}} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={220} tick={{fill: 'var(--text-main)', fontSize: 11, fontWeight: 500}} axisLine={false} tickLine={false} />
            <Tooltip cursor={{fill: 'var(--bg-color)'}} formatter={(val, name, props) => {
               let count = 0;
               if (name === 'យល់ស្រប (ពិត)') count = props.payload.trueCount;
               if (name === 'មិនប្រែប្រួល') count = props.payload.neutralCount;
               if (name === 'មិនយល់ស្រប (មិនពិត)') count = props.payload.falseCount;
               return [`${val.toFixed(1)}% (${count} នាក់)`, name];
            }} />
            <Bar maxBarSize={45} dataKey="percentTrue" name="យល់ស្រប (ពិត)" stackId="a" fill={COLORS.teal} radius={[0, 0, 0, 0]}>
              <LabelList dataKey="percentTrue" position="center" formatter={(val) => val >= 10 ? `${val.toFixed(1)}%` : ''} style={{ fill: '#fff', fontSize: 11, fontWeight: 'bold' }} />
            </Bar>
            <Bar maxBarSize={45} dataKey="percentNeutral" name="មិនប្រែប្រួល" stackId="a" fill={COLORS.amber} radius={[0, 0, 0, 0]}>
              <LabelList dataKey="percentNeutral" position="center" formatter={(val) => val >= 10 ? `${val.toFixed(1)}%` : ''} style={{ fill: '#fff', fontSize: 11, fontWeight: 'bold' }} />
            </Bar>
            <Bar maxBarSize={45} dataKey="percentFalse" name="មិនយល់ស្រប (មិនពិត)" stackId="a" fill={COLORS.rose} radius={[0, 4, 4, 0]}>
              <LabelList dataKey="percentFalse" position="center" formatter={(val) => val >= 10 ? `${val.toFixed(1)}%` : ''} style={{ fill: '#fff', fontSize: 11, fontWeight: 'bold' }} />
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
          <h1>ផ្ទាំងគ្រប់គ្រងផលជះ និងការចូលរួម (Impact & Engagement)</h1>
          <p>ទិដ្ឋភាពទូទៅនៃផលជះលើសាលារៀន សហគមន៍ សមត្ថភាពគ្រូ និងសិស្ស</p>
        </header>

        <div className="charts-grid">
          {renderChart(chartData1, 'ផលជះលើសាលារៀន និងសហគមន៍ (1)', 'ការវាយតម្លៃរបស់លោកគ្រូអ្នកគ្រូលើផលជះនេះ')}
          {renderChart(chartData2, 'ផលជះលើការអភិវឌ្ឍសមត្ថភាពគ្រូ និងសិស្ស (1)', 'ការវាយតម្លៃពីការរីកចម្រើននៃសមត្ថភាព')}
          {renderChart(chartData3, 'ការចូលរួម និងផ្សព្វផ្សាយទៅកាន់សហគមន៍ (2)', 'ទិដ្ឋភាពនៃការចូលរួមរបស់គ្រូ')}
          {renderChart(chartData4, 'ទស្សនៈ និងការបន្សាំខ្លួនផ្នែកបច្ចេកទេស (2)', 'ការបន្សាំខ្លួនរបស់គ្រូជាមួយបច្ចេកវិទ្យាថ្មីៗ')}
        </div>
      </main>
    </div>
  );
}
