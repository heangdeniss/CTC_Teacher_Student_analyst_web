import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList, Legend } from 'recharts';
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
  emerald: '#10b981'
};

const IMPACT_QUESTIONS = {
  'q_want_study_more': 'ចង់សិក្សាបន្ថែម',
  'q_stem_interest': 'ចំណាប់អារម្មណ៍ STEM',
  'q_self_study': 'ការស្វ័យសិក្សា',
  'q_future_confidence': 'ទំនុកចិត្តអនាគត',
  'q_uni_aspiration': 'បំណងចូលសាកលវិទ្យាល័យ',
  'q_education_confidence': 'ទំនុកចិត្តការអប់រំ',
  'q_enjoy_digital': 'ចូលចិត្តឌីជីថល',
  'q_better_discipline': 'វិន័យល្អជាងមុន',
  'q_braver': 'មានភាពក្លាហាន',
  'q_better_computer_internet_skills': 'ជំនាញកុំព្យូទ័រ & អ៊ីនធឺណិត',
  'q_better_email_docs': 'ជំនាញ Email & ឯកសារ',
  'q_better_presentations': 'ជំនាញធ្វើបទបង្ហាញ',
  'q_better_design_content': 'ជំនាញរចនា',
  'q_can_use_ai': 'អាចប្រើប្រាស់ AI',
  'q_better_coding_skills': 'ជំនាញសរសេរកូដ'
};

export default function StudentImpact() {
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

  // Calculate % Agree for impact questions
  const impactStats = useMemo(() => {
    const stats = Object.keys(IMPACT_QUESTIONS).map(key => {
      let agree = 0;
      let total = 0;
      filteredDemographics.forEach(row => {
        if (row[key]) {
          total++;
          if (row[key] === 'Agree' || row[key] === 'យល់ព្រម') agree++;
        }
      });
      return {
        key,
        label: IMPACT_QUESTIONS[key],
        agreePercentage: total > 0 ? parseFloat(((agree / total) * 100).toFixed(1)) : 0
      };
    });
    return stats.sort((a, b) => b.agreePercentage - a.agreePercentage);
  }, [filteredDemographics]);

  const topImpacts = impactStats.slice(0, 5);
  const areasForImprovement = [...impactStats].sort((a, b) => a.agreePercentage - b.agreePercentage).slice(0, 5);

  const demographicChartData = useMemo(() => {
    const grades = {};
    filteredDemographics.forEach(row => {
      const g = row.gender?.trim();
      let rowGender = 'ផ្សេងៗ';
      if (g === 'Male' || g === 'ប្រុស') rowGender = 'ប្រុស';
      else if (g === 'Female' || g === 'ស្រី') rowGender = 'ស្រី';
      
      const gr = row.grade || 'មិនស្គាល់';
      
      if (!grades[gr]) {
        grades[gr] = { grade: gr, 'ប្រុស': { score: 0, count: 0 }, 'ស្រី': { score: 0, count: 0 }, 'ផ្សេងៗ': { score: 0, count: 0 } };
      }

      let rowScore = 0;
      let rowCount = 0;
      Object.keys(IMPACT_QUESTIONS).forEach(q => {
        if (row[q]) {
          rowCount++;
          if (row[q] === 'Agree' || row[q] === 'យល់ព្រម') rowScore += 3;
          else if (row[q] === 'Neutral' || row[q] === 'ធម្មតា') rowScore += 2;
          else if (row[q] === 'Disagree' || row[q] === 'មិនយល់ព្រម') rowScore += 1;
        }
      });

      if (rowCount > 0) {
        grades[gr][rowGender].score += (rowScore / rowCount);
        grades[gr][rowGender].count++;
      }
    });

    return Object.values(grades).map(g => ({
      name: g.grade,
      'ប្រុស': g['ប្រុស'].count > 0 ? parseFloat((g['ប្រុស'].score / g['ប្រុស'].count).toFixed(2)) : 0,
      'ស្រី': g['ស្រី'].count > 0 ? parseFloat((g['ស្រី'].score / g['ស្រី'].count).toFixed(2)) : 0,
      'ផ្សេងៗ': g['ផ្សេងៗ'].count > 0 ? parseFloat((g['ផ្សេងៗ'].score / g['ផ្សេងៗ'].count).toFixed(2)) : 0
    })).sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }, [filteredDemographics]);

  // Additional Analysis: Impact by School
  const schoolImpactData = useMemo(() => {
    const schools = {};
    filteredDemographics.forEach(row => {
      const sch = row.high_school || 'មិនស្គាល់';
      if (!schools[sch]) {
        schools[sch] = { score: 0, count: 0 };
      }
      let rowScore = 0;
      let rowCount = 0;
      Object.keys(IMPACT_QUESTIONS).forEach(q => {
        if (row[q]) {
          rowCount++;
          if (row[q] === 'Agree' || row[q] === 'យល់ព្រម') rowScore += 3;
          else if (row[q] === 'Neutral' || row[q] === 'ធម្មតា') rowScore += 2;
          else if (row[q] === 'Disagree' || row[q] === 'មិនយល់ព្រម') rowScore += 1;
        }
      });
      if (rowCount > 0) {
        schools[sch].score += (rowScore / rowCount);
        schools[sch].count++;
      }
    });
    return Object.keys(schools).map(sch => ({
      name: sch,
      score: schools[sch].count > 0 ? parseFloat((schools[sch].score / schools[sch].count).toFixed(2)) : 0
    })).sort((a, b) => b.score - a.score).slice(0, 5);
  }, [filteredDemographics]);

  // Qualitative Feedback Distribution by Theme
  const qualitativeFeedback = useMemo(() => {
    const counts = {};
    let totalFeedback = 0;
    filteredThemes.forEach(t => {
      const isExcludedType = t.Question_Type === 'AI Tools Used' || t.Question_Type === 'Favorite Subjects';
      const tName = t.Theme ? t.Theme.trim() : '';
      const isExcludedString = tName.toLowerCase().startsWith('no ') || tName.toLowerCase() === 'other / unclassified' || tName.toLowerCase() === 'unclassified / no meaningful response' || tName === 'Other' || tName.toLowerCase().includes('គ្មាន');
      
      if (tName && t.Question_Type && !isExcludedType && !isExcludedString) {
        totalFeedback++;
        const themeLabel = translateTheme(tName);
        if (!counts[themeLabel]) counts[themeLabel] = { name: themeLabel, Positive: 0, Suggestion: 0, Challenge: 0, Other: 0, total: 0 };
        
        if (t.Question_Type.includes('Positive') || t.Question_Type.includes('Outstanding')) {
          counts[themeLabel].Positive++;
        } else if (t.Question_Type.includes('Suggestion') || t.Question_Type.includes('Improvement')) {
          counts[themeLabel].Suggestion++;
        } else if (t.Question_Type.includes('Challenge') || t.Question_Type.includes('Negative')) {
          counts[themeLabel].Challenge++;
        } else {
          counts[themeLabel].Other++;
        }
        counts[themeLabel].total++;
      }
    });

    return Object.values(counts)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map(item => ({
        ...item,
        totalPercentage: totalFeedback > 0 ? ((item.total / totalFeedback) * 100).toFixed(1) : 0
      }));
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
          <h1>ការវិភាគផលជះលម្អិត</h1>
          <p>ការវាយតម្លៃស៊ីជម្រៅលើផលជះនៃមជ្ឈមណ្ឌលបច្ចេកវិទ្យាសហគមន៍</p>
        </header>

      <div className="charts-grid">
        {/* Chart 1 */}
        <div className="chart-card">
          <h3 className="chart-title">ផ្នែកដែលទទួលផលជះខ្ពស់បំផុត</h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topImpacts} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="label" type="category" width={150} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [`${value}% យល់ព្រម`, 'អត្រាភាគរយ']} />
                <Bar dataKey="agreePercentage" fill={COLORS.teal} radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="agreePercentage" position="center" formatter={(val) => `${val}%`} style={{ fill: '#ffffff', fontSize: 12, fontWeight: 'bold' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 */}
        <div className="chart-card">
          <h3 className="chart-title">ផ្នែកដែលគួរធ្វើឲ្យប្រសើរឡើង</h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areasForImprovement} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="label" type="category" width={150} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [`${value}% យល់ព្រម`, 'អត្រាភាគរយ']} />
                <Bar dataKey="agreePercentage" fill={COLORS.rose} radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="agreePercentage" position="center" formatter={(val) => `${val}%`} style={{ fill: '#ffffff', fontSize: 12, fontWeight: 'bold' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Chart 3 as a Bar Chart */}
        <div className="chart-card">
          <h3 className="chart-title">ពិន្ទុផលជះតាមកម្រិតថ្នាក់ និងភេទ</h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographicChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 3]} />
                <Tooltip formatter={(value) => [value, 'ពិន្ទុមធ្យម (Max 3.0)']} />
                <Legend verticalAlign="top" height={36}/>
                <Bar dataKey="ប្រុស" fill={COLORS.sky} radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="ប្រុស" position="top" style={{ fill: '#475569', fontSize: 11 }} formatter={(v) => v > 0 ? v : ''} />
                </Bar>
                <Bar dataKey="ស្រី" fill={COLORS.rose} radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="ស្រី" position="top" style={{ fill: '#475569', fontSize: 11 }} formatter={(v) => v > 0 ? v : ''} />
                </Bar>
                <Bar dataKey="ផ្សេងៗ" fill={COLORS.amber} radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="ផ្សេងៗ" position="top" style={{ fill: '#475569', fontSize: 11 }} formatter={(v) => v > 0 ? v : ''} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4 */}
        <div className="chart-card">
          <h3 className="chart-title">ការបែងចែកមតិយោបល់តាមប្រធានបទ</h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={qualitativeFeedback} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(value, name) => [`ចំនួន: ${value} នាក់`, name]} />
                <Legend verticalAlign="top" height={36}/>
                <Bar dataKey="Positive" stackId="a" fill={COLORS.teal} name="វិជ្ជមាន">
                  <LabelList dataKey="Positive" position="center" fill="#ffffff" style={{ fontSize: 11 }} formatter={(v) => v > 0 ? v : ''} />
                </Bar>
                <Bar dataKey="Suggestion" stackId="a" fill={COLORS.sky} name="សំណូមពរ">
                  <LabelList dataKey="Suggestion" position="center" fill="#ffffff" style={{ fontSize: 11 }} formatter={(v) => v > 0 ? v : ''} />
                </Bar>
                <Bar dataKey="Challenge" stackId="a" fill={COLORS.rose} name="បញ្ហាប្រឈម">
                  <LabelList dataKey="Challenge" position="center" fill="#ffffff" style={{ fontSize: 11 }} formatter={(v) => v > 0 ? v : ''} />
                </Bar>
                <Bar dataKey="Other" stackId="a" fill={COLORS.amber} name="ផ្សេងៗ">
                  <LabelList dataKey="Other" position="center" fill="#ffffff" style={{ fontSize: 11 }} formatter={(v) => v > 0 ? v : ''} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">ពិន្ទុផលជះតាមវិទ្យាល័យ (Top 5)</h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={schoolImpactData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" domain={[0, 3]} />
                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [value, 'ពិន្ទុមធ្យម (Max 3.0)']} />
                <Bar dataKey="score" fill={COLORS.teal} radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="score" position="right" style={{ fill: '#475569', fontWeight: 'bold' }} />
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
