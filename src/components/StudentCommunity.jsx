import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList, PieChart, Pie, Cell, Legend } from 'recharts';
import { Filter } from 'lucide-react';
import { useStudentData, translateTheme } from '../hooks/useStudentData';
import '../App.css';

const COLORS = {
  teal: '#0d9488',
  coral: '#f43f5e',
  violet: '#8b5cf6',
  sky: '#0ea5e9',
  amber: '#f59e0b',
  rose: '#e11d48',
  emerald: '#10b981',
  indigo: '#4f46e5'
};

const ASPIRATION_QUESTIONS = {
  'q_uni_aspiration': 'បំណងបន្តការសិក្សានៅសាកលវិទ្យាល័យ',
  'q_future_confidence': 'មានទំនុកចិត្តលើអនាគត',
  'q_education_confidence': 'មានទំនុកចិត្តលើការអប់រំ',
  'q_skills_useful_future': 'ជំនាញមានប្រយោជន៍សម្រាប់អនាគត'
};

const RIPPLE_EFFECT_QUESTIONS = {
  'q_share_skills_with_community': 'ចែករំលែកជំនាញជាមួយសហគមន៍',
  'q_told_parents': 'បានប្រាប់មាតាបិតាពីការសិក្សា',
  'q_told_others': 'បានប្រាប់អ្នកដទៃពីការសិក្សា',
  'q_parents_satisfied': 'មាតាបិតាពេញចិត្តនឹងការសិក្សា'
};

export default function StudentCommunity() {
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

  // Chart 1: Impact on Student Aspirations & Future Readiness
  const aspirationData = useMemo(() => {
    return Object.keys(ASPIRATION_QUESTIONS).map(key => {
      let agree = 0;
      let total = 0;
      filteredDemographics.forEach(row => {
        if (row[key]) {
          total++;
          if (row[key] === 'Agree' || row[key] === 'យល់ព្រម') agree++;
        }
      });
      return {
        label: ASPIRATION_QUESTIONS[key],
        percentage: total > 0 ? parseFloat(((agree / total) * 100).toFixed(1)) : 0
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [filteredDemographics]);

  // Chart 2: The Community Ripple Effect
  const rippleEffectData = useMemo(() => {
    return Object.keys(RIPPLE_EFFECT_QUESTIONS).map(key => {
      let agree = 0;
      let total = 0;
      filteredDemographics.forEach(row => {
        if (row[key]) {
          total++;
          if (row[key] === 'Agree' || row[key] === 'យល់ព្រម' || row[key] === 'Yes') agree++;
        }
      });
      return {
        label: RIPPLE_EFFECT_QUESTIONS[key],
        percentage: total > 0 ? parseFloat(((agree / total) * 100).toFixed(1)) : 0
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [filteredDemographics]);

  // Chart 3: Adoption of Emerging Technology (AI Tools)
  const aiAdoptionData = useMemo(() => {
    const counts = {};
    filteredThemes.forEach(t => {
      if (t.Theme && t.Question_Type === 'AI Tools Used') {
        let toolName = t.Theme.trim();
        if (toolName === 'Google (General Search/Suite)') toolName = 'Google Gemini';
        if (toolName.toLowerCase() !== 'no' && !toolName.toLowerCase().startsWith('no ') && toolName.toLowerCase() !== 'other / unclassified' && toolName.toLowerCase() !== 'unclassified / no meaningful response' && toolName.toLowerCase() !== 'other') {
          counts[toolName] = (counts[toolName] || 0) + 1;
        }
      }
    });
    
    // Fallback to open_ai_tools_used from demographics if themes are missing
    if (Object.keys(counts).length === 0) {
      filteredDemographics.forEach(row => {
        if (row.open_ai_tools_used && row.open_ai_tools_used !== 'No' && row.open_ai_tools_used.toLowerCase() !== 'none' && row.open_ai_tools_used.toLowerCase() !== 'other / unclassified') {
          const tools = row.open_ai_tools_used.split(/[,;]/).map(s => s.trim()).filter(Boolean);
          tools.forEach(tool => {
            let tName = tool;
            if (tName === 'Google (General Search/Suite)') tName = 'Google Gemini';
            if (tName.toLowerCase() !== 'other / unclassified' && tName.toLowerCase() !== 'unclassified / no meaningful response' && tName.toLowerCase() !== 'other') {
              counts[tName] = (counts[tName] || 0) + 1;
            }
          });
        }
      });
    }

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [filteredThemes, filteredDemographics]);

  // Chart 4: Transformative Outcomes
  const outcomesData = useMemo(() => {
    const counts = {};
    let totalOutcomes = 0;
    filteredThemes.forEach(t => {
      if (t.Theme && t.Question_Type === 'Outstanding Points') {
        const tName = t.Theme.trim();
        if (!tName.toLowerCase().startsWith('no ') && !tName.toLowerCase().includes('គ្មាន') && tName.toLowerCase() !== 'other / unclassified' && tName.toLowerCase() !== 'unclassified / no meaningful response' && tName !== 'Other') {
          counts[tName] = (counts[tName] || 0) + 1;
          totalOutcomes++;
        }
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ 
        name: translateTheme(name), 
        count,
        percentage: totalOutcomes > 0 ? ((count / totalOutcomes) * 100).toFixed(1) : 0
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
          <h1>ផលជះរយៈពេលវែង & សហគមន៍</h1>
          <p>ឥទ្ធិពលលើសហគមន៍ ការត្រៀមខ្លួនសម្រាប់អនាគត និងការប្រើប្រាស់បច្ចេកវិទ្យា</p>
        </header>

      <div className="charts-grid">
        {/* Chart 1 */}
        <div className="chart-card">
          <h3 className="chart-title">ផលជះលើគោលដៅអនាគត</h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aspirationData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" interval={0} angle={-25} textAnchor="end" height={70} tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}% យល់ព្រម`, 'អត្រាភាគរយ']} />
                <Bar dataKey="percentage" fill={COLORS.indigo} radius={[4, 4, 0, 0]} barSize={40}>
                  <LabelList dataKey="percentage" position="top" formatter={(val) => `${val}%`} style={{ fill: '#475569' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 */}
        <div className="chart-card">
          <h3 className="chart-title">ឥទ្ធិពលវិជ្ជមានទៅកាន់សហគមន៍</h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rippleEffectData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="label" type="category" width={160} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [`${value}% យល់ព្រម`, 'អត្រាភាគរយ']} />
                <Bar dataKey="percentage" fill={COLORS.emerald} radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="percentage" position="center" formatter={(val) => `${val}%`} style={{ fill: '#ffffff', fontSize: 12, fontWeight: 'bold' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Chart 3 */}
        <div className="chart-card">
          <h3 className="chart-title">ការប្រើប្រាស់ឧបករណ៍ AI</h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiAdoptionData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'ចំនួនសិស្ស']} />
                <Bar dataKey="count" fill={COLORS.violet} radius={[4, 4, 0, 0]} barSize={50}>
                  <LabelList dataKey="count" position="top" style={{ fill: '#475569' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4 */}
        <div className="chart-card">
          <h3 className="chart-title">លទ្ធផលលេចធ្លោ</h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={outcomesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="count"
                  label={({ count, percentage }) => `${count} (${percentage}%)`}
                  labelLine={true}
                >
                  {outcomesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, name]} />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
