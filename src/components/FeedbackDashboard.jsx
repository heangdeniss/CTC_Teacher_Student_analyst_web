import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from 'recharts';
import '../App.css';

const COLORS = {
  emerald: '#10b981',
  rose: '#e11d48'
};

export default function FeedbackDashboard() {
  const [dataAdv, setDataAdv] = useState([]);
  const [dataDis, setDataDis] = useState([]);
  const [loading, setLoading] = useState(true);

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

    loadCSV('/CTC_Advantages.csv', setDataAdv);
    loadCSV('/CTC_Disadvantages.csv', setDataDis);
  }, []);

  const processData = (data, categoryKey) => {
    const counts = {};
    let total = 0;
    data.forEach(row => {
      const cat = row[categoryKey]?.trim();
      if (!cat) return;
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

  const chartAdv = useMemo(() => processData(dataAdv, 'Structure ម.ប.ស. បានបង្កើតផលវិជ្ជមានអ្វីខ្លះដល់វិទ្យាល័យលោកគ្រូ/អ្នកគ្រូ?'), [dataAdv]);
  const chartDis = useMemo(() => processData(dataDis, 'Structure ម.ប.ស. បានបង្កើតផលអវិជ្ជមានអ្វីខ្លះដល់វិទ្យាល័យលោកគ្រូ/អ្នកគ្រូ?'), [dataDis]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)' }}>
        <h2 style={{ color: 'var(--accent-primary)' }}>Loading Feedback...</h2>
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
            <YAxis type="category" dataKey="name" width={280} tick={{fill: 'var(--text-main)', fontSize: 11, fontWeight: 500}} axisLine={false} tickLine={false} />
            <Tooltip cursor={{fill: 'var(--bg-color)'}} formatter={(val, name, props) => [`${val} នាក់ (${props.payload.percent.toFixed(1)}%)`, 'ចំនួន (Count)']} />
            <Bar maxBarSize={45} dataKey="value" fill={color} radius={[0, 4, 4, 0]}>
              <LabelList dataKey="labelStr" position="right" formatter={(val) => `${val}`} style={{ fill: 'var(--text-main)', fontSize: 11, fontWeight: 'bold' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container" style={{ padding: '32px', background: 'var(--bg-color)', width: '100%', boxSizing: 'border-box' }}>
      <main className="main-content" style={{ padding: 0 }}>
        <header className="header">
          <h1>មតិយោបល់៖ ផលវិជ្ជមាន និងអវិជ្ជមាន (Advantages & Disadvantages)</h1>
          <p>ទិដ្ឋភាពទូទៅនៃការវាយតម្លៃរបស់លោកគ្រូអ្នកគ្រូលើផលជះនៃមជ្ឈមណ្ឌល</p>
        </header>

        <div className="charts-grid">
          {renderChart(chartAdv, 'ផលវិជ្ជមាននៃ ម.ប.ស (Advantages)', 'កត្តាវិជ្ជមានដែលទទួលបានពីមជ្ឈមណ្ឌល', COLORS.emerald)}
          {renderChart(chartDis, 'ផលអវិជ្ជមាននៃ ម.ប.ស (Disadvantages)', 'បញ្ហាប្រឈម ឬកត្តាអវិជ្ជមានដែលកើតមាន', COLORS.rose)}
        </div>
      </main>
    </div>
  );
}
