import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid, LabelList } from 'recharts';
import { Filter, Users, School, BookOpen, Sparkles, Activity, Target, MessageSquare } from 'lucide-react';
import '../App.css';

// Modern Color Palette
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

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedSchool, setSelectedSchool] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // Tabs State
  const [activeTab, setActiveTab] = useState('demographics'); // 'demographics' or 'tech'

  useEffect(() => {
    Papa.parse('/Demographical CTC Teacher.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data);
        setLoading(false);
      }
    });
  }, []);

  // Get unique options for slicers
  const schools = ['All', ...new Set(data.map(d => d['មកពីវិទ្យាល័យ']).filter(Boolean))].sort();
  const genders = ['All', 'ប្រុស', 'ស្រី', 'ផ្សេងៗ'];
  const subjects = ['All', ...new Set(data.map(d => d['Structure មុខវិជ្ជាបង្រៀន៖']).filter(Boolean))].sort();

  // Apply Filters
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

  // Global KPIs
  const totalRespondents = filteredData.length;
  const avgAge = useMemo(() => {
    const validAges = filteredData.map(d => parseFloat(d['អាយុ៖'])).filter(a => !isNaN(a));
    const sum = validAges.reduce((acc, val) => acc + val, 0);
    return validAges.length ? Math.round(sum / validAges.length) : 0;
  }, [filteredData]);

  // Tab 2 KPIs
  const topSubject = useMemo(() => {
    if (!filteredData.length) return 'N/A';
    const counts = {};
    filteredData.forEach(r => {
      const s = r['Structure មុខវិជ្ជាបង្រៀន៖'] || 'ផ្សេងៗ';
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, 'N/A');
  }, [filteredData]);

  const topAITool = useMemo(() => {
    if (!filteredData.length) return 'N/A';
    const counts = {};
    filteredData.forEach(r => {
      const tool = r['Structure សូមសរសេរឈ្មោះឧបករណ៍ AI ដែលលោកគ្រូ/អ្នកគ្រូ ប្រើប្រាស់ញឹកញាប់ជាងគេ'] || 'មិនប្រើប្រាស់';
      counts[tool] = (counts[tool] || 0) + 1;
    });
    const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return sorted[0] === 'ផ្សេងៗ / មិនមាន' && sorted.length > 1 ? sorted[1] : sorted[0];
  }, [filteredData]);

  // Chart Data
  const genderData = useMemo(() => {
    const counts = { 'ប្រុស': 0, 'ស្រី': 0, 'ផ្សេងៗ': 0 };
    filteredData.forEach(row => {
      const g = row['ភេទ']?.trim().replace(/\u200b/g, '');
      if (g === 'ប្រុស' || g === 'ស្រី') counts[g]++;
      else counts['ផ្សេងៗ']++;
    });
    return Object.entries(counts).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const ageData = useMemo(() => {
    const bins = { '20-25': 0, '26-30': 0, '31-35': 0, '36-40': 0, '41-45': 0, '46-50': 0, '51-55': 0, '56-60': 0, '60+': 0, 'មិនបានបំពេញ': 0 };
    filteredData.forEach(row => {
      const ageRaw = row['អាយុ៖'];
      if (!ageRaw || ageRaw.toString().trim() === '') bins['មិនបានបំពេញ']++;
      else {
        const age = parseFloat(ageRaw);
        if (isNaN(age)) bins['មិនបានបំពេញ']++;
        else {
          if (age <= 25) bins['20-25']++;
          else if (age <= 30) bins['26-30']++;
          else if (age <= 35) bins['31-35']++;
          else if (age <= 40) bins['36-40']++;
          else if (age <= 45) bins['41-45']++;
          else if (age <= 50) bins['46-50']++;
          else if (age <= 55) bins['51-55']++;
          else if (age <= 60) bins['56-60']++;
          else bins['60+']++;
        }
      }
    });
    return Object.entries(bins).filter(([_, value]) => value > 0).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const instData = useMemo(() => {
    const counts = {};
    filteredData.forEach(row => {
      let inst = row['Structure តើ ម.ប.ស. ជាកម្មសិទ្ធរបស់ស្ថាប័នណា?'];
      if (!inst || inst.trim() === '') inst = 'មិនដឹង';
      counts[inst] = (counts[inst] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.value - b.value);
  }, [filteredData]);

  const aiToolData = useMemo(() => {
    const counts = {};
    filteredData.forEach(row => {
      let tool = row['Structure សូមសរសេរឈ្មោះឧបករណ៍ AI ដែលលោកគ្រូ/អ្នកគ្រូ ប្រើប្រាស់ញឹកញាប់ជាងគេ'];
      if (!tool || tool.trim() === '') tool = 'មិនមាន';
      if (tool === 'ផ្សេងៗ / មិនមាន') tool = 'មិនមាន/ផ្សេងៗ';
      counts[tool] = (counts[tool] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [filteredData]);

  const subjectData = useMemo(() => {
    const counts = {};
    filteredData.forEach(row => {
      let subj = row['Structure មុខវិជ្ជាបង្រៀន៖'];
      if (!subj || subj.trim() === '') subj = 'ផ្សេងៗ';
      counts[subj] = (counts[subj] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 for readability
  }, [filteredData]);

  const devicesData = useMemo(() => {
    const counts = {};
    filteredData.forEach(row => {
      let devicesRaw = row['ឧបករណ៍ឌីជីថលដែលមានប្រើប្រាស់៖'];
      if (!devicesRaw || devicesRaw.trim() === '' || devicesRaw.includes('មិនមាន') || devicesRaw.includes('គ្មាន')) {
        counts['មិនមាន'] = (counts['មិនមាន'] || 0) + 1;
        return;
      }
      
      let devices = devicesRaw.split(';').map(d => d.trim()).filter(Boolean).sort();
      let label = devices.join(' និង ');
      if (devices.length >= 3) {
        const last = devices.pop();
        label = devices.join(', ') + ' និង ' + last;
      }
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  const desiredSubjectsData = useMemo(() => {
    const counts = {};
    filteredData.forEach(row => {
      let subj = row['Structure មុខវិជ្ជាឌីជីថលណាខ្លះដែលលោកគ្រូ/អ្នកគ្រូចង់សិក្សាបន្ថែម'];
      if (!subj || subj.trim() === '') subj = 'មិនបានបំពេញ';
      counts[subj] = (counts[subj] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8
  }, [filteredData]);

  const supportNeedsData = useMemo(() => {
    const counts = {};
    filteredData.forEach(row => {
      let need = row['Structure តើគួររៀបចំ ម.ប.ស. យ៉ាងដូចម្តេចខ្លះដើម្បីអាចជួយគាំទ្រដល់ការងារលោកគ្រូ/អ្នកគ្រូ?'];
      if (!need || need.trim() === '') need = 'គ្មានយោបល់';
      counts[need] = (counts[need] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .filter(item => item.name !== 'គ្មានយោបល់' && item.name !== 'មិនបានបំពេញ')
      .slice(0, 6);
  }, [filteredData]);

  const improvementsData = useMemo(() => {
    const counts = {};
    filteredData.forEach(row => {
      let imp = row['Structure តើលោកគ្រូ/អ្នកគ្រូ គិតថា ម.ប.ស. គួរកែលម្អលើចំណុចអ្វីខ្លះ?'];
      if (!imp || imp.trim() === '') imp = 'គ្មានយោបល់';
      counts[imp] = (counts[imp] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .filter(item => item.name !== 'គ្មានយោបល់' && item.name !== 'មិនបានបំពេញ')
      .slice(0, 6);
  }, [filteredData]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)' }}>
        <h2 style={{ color: 'var(--accent-primary)' }}>Loading Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar Filters */}
      <aside className="sidebar">
        <h2><Filter size={20} /> ជម្រើសចម្រាញ់</h2>
        
        <div className="filter-group">
          <label>សាលារៀន (School)</label>
          <select value={selectedSchool} onChange={e => setSelectedSchool(e.target.value)}>
            {schools.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>ភេទ (Gender)</label>
          <select value={selectedGender} onChange={e => setSelectedGender(e.target.value)}>
            {genders.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>មុខវិជ្ជា (Subject)</label>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h1>ផ្ទាំងគ្រប់គ្រងទិន្នន័យលោកគ្រូ អ្នកគ្រូ ម.ប.ស</h1>
          <p>ទិដ្ឋភាពទូទៅនៃប្រជាសាស្ត្រ និងការប្រើប្រាស់បច្ចេកវិទ្យារបស់លោកគ្រូ អ្នកគ្រូ</p>
        </header>

        {/* Tabs Navigation */}
        <div className="tabs-container">
          <button 
            className={`tab-btn ${activeTab === 'demographics' ? 'active' : ''}`}
            onClick={() => setActiveTab('demographics')}
          >
            ព័ត៌មានប្រជាសាស្ត្រ
          </button>
          <button 
            className={`tab-btn ${activeTab === 'tech' ? 'active' : ''}`}
            onClick={() => setActiveTab('tech')}
          >
            ការបង្រៀន និងបច្ចេកវិទ្យា
          </button>
          <button 
            className={`tab-btn ${activeTab === 'needs' ? 'active' : ''}`}
            onClick={() => setActiveTab('needs')}
          >
            តម្រូវការ និងសំណូមពរ
          </button>
        </div>

        {/* Tab 1: Demographics */}
        {activeTab === 'demographics' && (
          <>
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-header"><Users size={18} color="var(--accent-primary)" /> អ្នកចូលរួមសរុប</div>
                <div className="kpi-value">{totalRespondents}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-header"><Activity size={18} color="var(--accent-primary)" /> អាយុជាមធ្យម</div>
                <div className="kpi-value">{avgAge} <span style={{fontSize: '1rem', color: 'var(--text-muted)'}}>ឆ្នាំ</span></div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-header-container">
                  <h3 className="chart-title">សមាមាត្រភេទ</h3>
                  <p className="chart-desc">បង្ហាញពីចំនួនភាគរយនៃគ្រូបង្រៀនតាមភេទនីមួយៗ</p>
                </div>
                <div className="chart-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none"
                        labelLine={false}
                        label={({ cx, cy, midAngle, outerRadius, value, name, percent }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = outerRadius + 20;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          return (
                            <text x={x} y={y} fill="var(--text-muted)" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight={500}>
                              {`${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                            </text>
                          );
                        }}
                      >
                        {genderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={[COLORS.indigo, COLORS.coral, COLORS.amber][index % 3]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={val => `${val} នាក់ (${((val/totalRespondents)*100).toFixed(1)}%)`} />
                      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{fontSize: '1.5rem', fontWeight: 700, fill: 'var(--text-main)'}}>
                        {totalRespondents}
                      </text>
                      <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" style={{fontSize: '0.9rem', fill: 'var(--text-muted)'}}>
                        សរុប
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header-container">
                  <h3 className="chart-title">បែងចែកតាមអាយុ</h3>
                  <p className="chart-desc">បង្ហាញពីចំនួនគ្រូបង្រៀនដែលបានចូលរួមទៅតាមចន្លោះអាយុ</p>
                </div>
                <div className="chart-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageData} margin={{ top: 30, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                      <XAxis dataKey="name" tick={{fill: 'var(--text-muted)', fontSize: 12}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fill: 'var(--text-muted)', fontSize: 12}} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: 'var(--bg-color)'}} formatter={val => `${val} នាក់`} />
                      <Bar maxBarSize={45} dataKey="value" fill={COLORS.sky} radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="value" position="top" formatter={(val) => `${val} (${((val/totalRespondents)*100).toFixed(1)}%)`} style={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header-container">
                  <h3 className="chart-title">កម្មសិទ្ធិស្ថាប័ន</h3>
                  <p className="chart-desc">បង្ហាញពីចំនួនមជ្ឈមណ្ឌលដែលគ្រប់គ្រងដោយស្ថាប័ននីមួយៗ</p>
                </div>
                <div className="chart-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={instData} layout="vertical" margin={{ top: 0, right: 80, left: 60, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                      <XAxis type="number" tick={{fill: 'var(--text-muted)', fontSize: 12}} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={140} tick={{fill: 'var(--text-main)', fontSize: 11, fontWeight: 500}} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: 'var(--bg-color)'}} formatter={val => `${val} នាក់`} />
                      <Bar maxBarSize={45} dataKey="value" fill={COLORS.teal} radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="value" position="right" formatter={(val) => `${val} (${((val/totalRespondents)*100).toFixed(1)}%)`} style={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tab 2: Teaching & Technology */}
        {activeTab === 'tech' && (
          <>
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-header"><BookOpen size={18} color="var(--accent-primary)" /> មុខវិជ្ជាបង្រៀនច្រើនជាងគេ</div>
                <div className="kpi-value" style={{fontSize: '1.5rem'}}>{topSubject}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-header"><Sparkles size={18} color="var(--accent-primary)" /> AI ប្រើប្រាស់ច្រើនជាងគេ</div>
                <div className="kpi-value" style={{fontSize: '1.5rem'}}>{topAITool}</div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-header-container">
                  <h3 className="chart-title">មុខវិជ្ជាបង្រៀន</h3>
                  <p className="chart-desc">បង្ហាញពីមុខវិជ្ជាចម្បងទាំង ៨ ដែលគ្រូបង្រៀន</p>
                </div>
                <div className="chart-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectData} layout="vertical" margin={{ top: 0, right: 80, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                      <XAxis type="number" tick={{fill: 'var(--text-muted)', fontSize: 12}} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={140} tick={{fill: 'var(--text-main)', fontSize: 11, fontWeight: 500}} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: 'var(--bg-color)'}} formatter={val => `${val} នាក់`} />
                      <Bar maxBarSize={45} dataKey="value" fill={COLORS.amber} radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="value" position="right" formatter={(val) => `${val} (${((val/totalRespondents)*100).toFixed(1)}%)`} style={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header-container">
                  <h3 className="chart-title">ការប្រើប្រាស់ឧបករណ៍ AI</h3>
                  <p className="chart-desc">បង្ហាញពីឧបករណ៍ AI ពេញនិយមបំផុតដែលលោកគ្រូអ្នកគ្រូប្រើប្រាស់ញឹកញាប់</p>
                </div>
                <div className="chart-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aiToolData} layout="vertical" margin={{ top: 0, right: 80, left: 50, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                      <XAxis type="number" tick={{fill: 'var(--text-muted)', fontSize: 12}} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={100} tick={{fill: 'var(--text-main)', fontSize: 11, fontWeight: 500}} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: 'var(--bg-color)'}} formatter={val => `${val} នាក់ (${((val/totalRespondents)*100).toFixed(1)}%)`} />
                      <Bar maxBarSize={45} dataKey="value" fill={COLORS.violet} radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="value" position="right" formatter={(val) => `${val} (${((val/totalRespondents)*100).toFixed(1)}%)`} style={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header-container">
                  <h3 className="chart-title">ឧបករណ៍ឌីជីថលប្រើប្រាស់</h3>
                  <p className="chart-desc">បង្ហាញពីប្រភេទឧបករណ៍ឌីជីថលដែលលោកគ្រូអ្នកគ្រូកំពុងប្រើប្រាស់</p>
                </div>
                <div className="chart-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={devicesData} layout="vertical" margin={{ top: 0, right: 80, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                      <XAxis type="number" tick={{fill: 'var(--text-muted)', fontSize: 12}} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={220} tick={{fill: 'var(--text-main)', fontSize: 11, fontWeight: 500}} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: 'var(--bg-color)'}} formatter={val => `${val} នាក់`} />
                      <Bar maxBarSize={45} dataKey="value" fill={COLORS.sky} radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="value" position="right" formatter={(val) => `${val} (${((val/totalRespondents)*100).toFixed(1)}%)`} style={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tab 3: Needs & Suggestions */}
        {activeTab === 'needs' && (
          <>
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-header"><Target size={18} color="var(--accent-primary)" /> មុខវិជ្ជាចង់រៀនបំផុត</div>
                <div className="kpi-value" style={{fontSize: '1.5rem'}}>{desiredSubjectsData.length > 0 ? desiredSubjectsData[0].name : 'N/A'}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-header"><MessageSquare size={18} color="var(--accent-primary)" /> ចំណុចស្នើឱ្យគាំទ្របំផុត</div>
                <div className="kpi-value" style={{fontSize: '1.5rem'}}>{supportNeedsData.length > 0 ? supportNeedsData[0].name : 'N/A'}</div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-header-container">
                  <h3 className="chart-title">មុខវិជ្ជាឌីជីថលចង់សិក្សាបន្ថែម</h3>
                  <p className="chart-desc">បង្ហាញពីចំណង់ចំណូលចិត្តក្នុងការសិក្សាបន្ថែមរបស់លោកគ្រូអ្នកគ្រូ</p>
                </div>
                <div className="chart-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={desiredSubjectsData} layout="vertical" margin={{ top: 0, right: 80, left: 60, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                      <XAxis type="number" tick={{fill: 'var(--text-muted)', fontSize: 12}} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={140} tick={{fill: 'var(--text-main)', fontSize: 11, fontWeight: 500}} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: 'var(--bg-color)'}} formatter={val => `${val} នាក់`} />
                      <Bar maxBarSize={45} dataKey="value" fill={COLORS.emerald} radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="value" position="right" formatter={(val) => `${val} (${((val/totalRespondents)*100).toFixed(1)}%)`} style={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header-container">
                  <h3 className="chart-title">ការរៀបចំមជ្ឈមណ្ឌលគាំទ្រការងារ</h3>
                  <p className="chart-desc">សំណូមពរអំពីការរៀបចំ ម.ប.ស ដើម្បីគាំទ្រដល់ការបង្រៀន</p>
                </div>
                <div className="chart-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={supportNeedsData} layout="vertical" margin={{ top: 0, right: 80, left: 60, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                      <XAxis type="number" tick={{fill: 'var(--text-muted)', fontSize: 12}} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={140} tick={{fill: 'var(--text-main)', fontSize: 11, fontWeight: 500}} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: 'var(--bg-color)'}} formatter={val => `${val} នាក់`} />
                      <Bar maxBarSize={45} dataKey="value" fill={COLORS.teal} radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="value" position="right" formatter={(val) => `${val} (${((val/totalRespondents)*100).toFixed(1)}%)`} style={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header-container">
                  <h3 className="chart-title">ចំណុចគួរកែលម្អ</h3>
                  <p className="chart-desc">មតិយោបល់សម្រាប់ការកែលម្អមជ្ឈមណ្ឌលនាពេលអនាគត</p>
                </div>
                <div className="chart-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={improvementsData} layout="vertical" margin={{ top: 0, right: 80, left: 40, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                      <XAxis type="number" tick={{fill: 'var(--text-muted)', fontSize: 12}} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={200} tick={{fill: 'var(--text-main)', fontSize: 11, fontWeight: 500}} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: 'var(--bg-color)'}} formatter={val => `${val} នាក់`} />
                      <Bar maxBarSize={45} dataKey="value" fill={COLORS.rose} radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="value" position="right" formatter={(val) => `${val} (${((val/totalRespondents)*100).toFixed(1)}%)`} style={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
