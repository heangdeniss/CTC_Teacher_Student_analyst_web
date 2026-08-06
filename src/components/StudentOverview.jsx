import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import { Filter, Users, Star, Trophy, Activity } from 'lucide-react';
import { useStudentData, translateTheme } from '../hooks/useStudentData';
import '../App.css';

const COLORS = {
  teal: '#0d9488',
  coral: '#f43f5e',
  violet: '#8b5cf6',
  sky: '#0ea5e9',
  amber: '#f59e0b',
  emerald: '#10b981',
  slate: '#64748b'
};

export default function StudentOverview() {
  const { data, loading } = useStudentData();
  const [selectedSchool, setSelectedSchool] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');

  const { demographics, themes } = data;

  const schools = ['All', ...new Set(demographics.map(d => d.high_school).filter(Boolean))].sort();
  const grades = ['All', ...new Set(demographics.map(d => d.grade).filter(Boolean))].sort();
  const genders = ['All', 'ប្រុស', 'ស្រី', 'ផ្សេងៗ'];

  const filteredDemographics = useMemo(() => {
    return demographics.filter(row => {
      const matchSchool = selectedSchool === 'All' || row.high_school === selectedSchool;
      const matchGrade = selectedGrade === 'All' || row.grade === selectedGrade;
      const g = row.gender?.trim();
      let rowGender = (g === 'ប្រុស' || g === 'ស្រី') ? g : 'ផ្សេងៗ';
      const matchGender = selectedGender === 'All' || rowGender === selectedGender;
      return matchSchool && matchGrade && matchGender;
    });
  }, [demographics, selectedSchool, selectedGrade, selectedGender]);

  const validRespondentIds = useMemo(() => new Set(filteredDemographics.map(d => d.respondent_id)), [filteredDemographics]);

  const filteredThemes = useMemo(() => {
    return themes.filter(row => validRespondentIds.has(row.respondent_id));
  }, [themes, validRespondentIds]);

  // KPIs
  const totalStudents = filteredDemographics.length;

  const sentimentQuestions = [
    'q_want_study_more', 'q_stem_interest', 'q_self_study', 'q_equal_opportunity',
    'q_future_confidence', 'q_uni_aspiration', 'q_education_confidence', 'q_enjoy_digital',
    'q_better_discipline', 'q_braver', 'q_join_competitions'
  ];

  const overallPositiveImpact = useMemo(() => {
    if (totalStudents === 0) return 0;
    let positiveCount = 0;
    let totalAnswers = 0;
    filteredDemographics.forEach(row => {
      sentimentQuestions.forEach(q => {
        if (row[q]) {
          totalAnswers++;
          if (row[q] === 'Agree' || row[q] === 'យល់ព្រម') positiveCount++;
        }
      });
    });
    return totalAnswers > 0 ? ((positiveCount / totalAnswers) * 100).toFixed(1) : 0;
  }, [filteredDemographics]);

  const averageSentimentScore = useMemo(() => {
    if (totalStudents === 0) return 0;
    let totalScore = 0;
    let totalAnswers = 0;
    filteredDemographics.forEach(row => {
      sentimentQuestions.forEach(q => {
        if (row[q]) {
          totalAnswers++;
          if (row[q] === 'Agree' || row[q] === 'យល់ព្រម') totalScore += 3;
          else if (row[q] === 'Neutral' || row[q] === 'ធម្មតា') totalScore += 2;
          else if (row[q] === 'Disagree' || row[q] === 'មិនយល់ព្រម') totalScore += 1;
        }
      });
    });
    return totalAnswers > 0 ? (totalScore / totalAnswers).toFixed(2) : 0;
  }, [filteredDemographics]);

  const topStudentOutcome = useMemo(() => {
    const outcomeCounts = {};
    filteredThemes.forEach(t => {
      if (t.Theme && t.Question_Type === 'Outstanding Points') {
        const theme = t.Theme.trim();
        if (theme.toLowerCase() !== 'other / unclassified' && theme.toLowerCase() !== 'unclassified / no meaningful response' && theme !== 'Other' && !theme.toLowerCase().startsWith('no ')) {
          outcomeCounts[theme] = (outcomeCounts[theme] || 0) + 1;
        }
      }
    });
    const sorted = Object.entries(outcomeCounts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? translateTheme(sorted[0][0]) : 'មិនមានទិន្នន័យ';
  }, [filteredThemes]);

  // Chart 1: Overall Sentiment Distribution
  const sentimentDistribution = useMemo(() => {
    let agree = 0, neutral = 0, disagree = 0;
    filteredDemographics.forEach(row => {
      sentimentQuestions.forEach(q => {
        if (row[q] === 'Agree' || row[q] === 'យល់ព្រម') agree++;
        else if (row[q] === 'Neutral' || row[q] === 'ធម្មតា') neutral++;
        else if (row[q] === 'Disagree' || row[q] === 'មិនយល់ព្រម') disagree++;
      });
    });
    const total = agree + neutral + disagree;
    if (total === 0) return [];
    return [
      { name: 'វិជ្ជមាន', value: agree, percentage: ((agree/total)*100).toFixed(1) },
      { name: 'អព្យាក្រឹត', value: neutral, percentage: ((neutral/total)*100).toFixed(1) },
      { name: 'អវិជ្ជមាន', value: disagree, percentage: ((disagree/total)*100).toFixed(1) }
    ];
  }, [filteredDemographics]);

  // Chart 2: Student Technology Access
  const techAccessData = useMemo(() => {
    const counts = {};
    let totalResponses = 0;
    filteredDemographics.forEach(row => {
      if (row.devices_owned) {
        const devices = row.devices_owned.split(';').map(d => d.trim()).filter(Boolean);
        devices.forEach(d => {
          counts[d] = (counts[d] || 0) + 1;
          totalResponses++;
        });
      }
    });
    const sorted = Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: ((count / filteredDemographics.length) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
    return sorted;
  }, [filteredDemographics]);

  // Chart 3: Top 5 Feedback Themes
  const topFeedbackThemes = useMemo(() => {
    const counts = {};
    let totalThemes = 0;
    filteredThemes.forEach(t => {
      if (t.Theme && t.Question_Type !== 'AI Tools Used' && t.Question_Type !== 'Favorite Subjects') {
        const tName = t.Theme.trim();
        if (!tName.toLowerCase().startsWith('no ') && tName.toLowerCase() !== 'other / unclassified' && tName.toLowerCase() !== 'unclassified / no meaningful response' && tName !== 'other') {
          counts[tName] = (counts[tName] || 0) + 1;
          totalThemes++;
        }
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ 
        name: translateTheme(name), 
        count,
        percentage: totalThemes > 0 ? ((count / totalThemes) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredThemes]);

  if (loading) return <div className="loading">កំពុងផ្ទុកទិន្នន័យ (Loading)...</div>;

  return (
    <div className="dashboard-container">
      {/* Sidebar Filters */}
      <aside className="sidebar">
        <h2><Filter size={20} /> ជម្រើសចម្រាញ់</h2>
        
        <div className="filter-group">
          <label>វិទ្យាល័យ</label>
          <select className="filter-select" value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}>
            {schools.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>កម្រិតថ្នាក់</label>
          <select className="filter-select" value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}>
            {grades.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>ភេទ</label>
          <select className="filter-select" value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)}>
            {genders.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h1>ទិដ្ឋភាពទូទៅ</h1>
          <p>ការសង្ខេបអំពីទិន្នន័យសិស្សានុសិស្ស និងផលជះជារួម</p>
        </header>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#ccfbf1', color: COLORS.teal }}>
            <Users size={24} />
          </div>
          <div className="kpi-info">
            <h3>សិស្សសរុប</h3>
            <div className="kpi-value">{totalStudents}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#e0e7ff', color: COLORS.indigo }}>
            <Activity size={24} />
          </div>
          <div className="kpi-info">
            <h3>ផលជះវិជ្ជមានសរុប</h3>
            <div className="kpi-value">{overallPositiveImpact}%</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#fef3c7', color: COLORS.amber }}>
            <Star size={24} />
          </div>
          <div className="kpi-info">
            <h3>ពិន្ទុអាកប្បកិរិយា</h3>
            <div className="kpi-value">{averageSentimentScore} <span style={{ fontSize: '1rem', color: '#64748b' }}>/ 3.0</span></div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>*ពិន្ទុខ្ពស់បំផុតគឺ 3.0</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#fee2e2', color: COLORS.rose }}>
            <Trophy size={24} />
          </div>
          <div className="kpi-info">
            <h3>លទ្ធផលលេចធ្លោ</h3>
            <div className="kpi-value" style={{ fontSize: '1.2rem', whiteSpace: 'normal', lineHeight: '1.4' }}>{topStudentOutcome}</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Chart 1 */}
        <div className="chart-card">
          <h3 className="chart-title">ការបែងចែកអាកប្បកិរិយា</h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentDistribution}
                  cx="50%" cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {sentimentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={[COLORS.teal, COLORS.amber, COLORS.rose][index % 3]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value} ចម្លើយ (${props.payload.percentage}%)`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 */}
        <div className="chart-card">
          <h3 className="chart-title">លទ្ធភាពប្រើប្រាស់បច្ចេកវិទ្យា</h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={techAccessData} layout="vertical" margin={{ top: 5, right: 40, left: 20, bottom: 5 }}>
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value, name, props) => [`${value} នាក់ (${props.payload.percentage}%)`, 'ចំនួនសិស្ស']} />
                <Bar dataKey="count" fill={COLORS.sky} radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="percentage" position="right" formatter={(val) => `${val}%`} style={{ fill: '#475569', fontSize: 12, fontWeight: 'bold' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3 Full Width */}
      <div className="chart-card" style={{ marginTop: '24px' }}>
        <h3 className="chart-title">ប្រធានបទមតិយោបល់សំខាន់ៗទាំង ៥</h3>
        <div style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topFeedbackThemes} margin={{ top: 30, right: 30, left: 20, bottom: 60 }}>
                <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(value, name, props) => [`${value} លើកឡើង (${props.payload.percentage}%)`, 'ចំនួនសរុប']} />
                <Bar dataKey="count" fill={COLORS.violet} radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="count" position="top" style={{ fill: '#475569', fontSize: 12, fontWeight: 'bold' }} />
                </Bar>
              </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      </main>
    </div>
  );
}
