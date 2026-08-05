import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from 'recharts';
import '../App.css';

const COLORS = {
  teal: '#0d9488',
  amber: '#f59e0b',
  rose: '#e11d48'
};

export default function AdvancedImpactDashboard() {
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

    loadCSV('/3 Digital Growth.csv', setData1);
    loadCSV('/3 Resource Usage & Facility Utilization.csv', setData2);
    loadCSV('/4 Digital Creativity, AI Adoption & Online Safety.csv', setData3);
    loadCSV('/5 Digital Safety, Autonomy & Community Impact.csv', setData4);
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

  const chartData1 = useMemo(() => processData(data1, 'ការអភិវឌ្ឍសមត្ថភាព និងជំនាញឌីជីថលរបស់គ្រូ', 'Valueការអភិវឌ្ឍសមត្ថភាព និងជំនាញឌីជីថលរបស់គ្រូ'), [data1]);
  const chartData2 = useMemo(() => processData(data2, 'ការប្រើប្រាស់ធនធាន និងទីតាំងរួមរបស់គ្រូ', 'Valueការប្រើប្រាស់ធនធាន និងទីតាំងរួមរបស់គ្រូ'), [data2]);
  const chartData3 = useMemo(() => processData(data3, 'ការបង្កើតមាតិកាឌីជីថល បញ្ញាសិប្បនិម្មិត (AI) និងសុវត្ថិភាព', 'Valueការបង្កើតមាតិកាឌីជីថល បញ្ញាសិប្បនិម្មិត (AI) និងសុវត្ថិភាព'), [data3]);
  const chartData4 = useMemo(() => processData(data4, 'សុវត្ថិភាពឌីជីថល ការស្វ័យសិក្សា និងការរួមចំណែកដល់សហគមន៍', 'Valueសុវត្ថិភាពឌីជីថល ការស្វ័យសិក្សា និងការរួមចំណែកដល់សហគមន៍'), [data4]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)' }}>
        <h2 style={{ color: 'var(--accent-primary)' }}>Loading Advanced Impact...</h2>
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
          <h1>ផ្ទាំងគ្រប់គ្រងការអភិវឌ្ឍជំនាញ & សុវត្ថិភាពឌីជីថល (Skills & Safety)</h1>
          <p>ទិដ្ឋភាពទូទៅនៃការអភិវឌ្ឍសមត្ថភាព ភាពច្នៃប្រឌិត និងសុវត្ថិភាពឌីជីថល</p>
        </header>

        <div className="charts-grid">
          {renderChart(chartData1, 'ការអភិវឌ្ឍសមត្ថភាព និងជំនាញឌីជីថល ', 'ការវាយតម្លៃលើជំនាញថ្មីៗ')}
          {renderChart(chartData2, 'ការប្រើប្រាស់ធនធាន និងទីតាំងរួម ', 'របៀបប្រើប្រាស់មជ្ឈមណ្ឌល')}
          {renderChart(chartData3, 'ភាពច្នៃប្រឌិត និងការប្រើប្រាស់ AI ', 'ការប្រើប្រាស់បច្ចេកវិទ្យាក្នុងការបង្រៀន')}
          {renderChart(chartData4, 'សុវត្ថិភាពឌីជីថល និងស្វ័យសិក្សា ', 'ការយល់ដឹងពីសុវត្ថិភាព និងការរៀនដោយខ្លួនឯង')}
        </div>
      </main>
    </div>
  );
}
