import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList, Legend, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
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

const FACILITY_TEACHING_QUESTIONS = {
  'q_adequate_computers': 'កុំព្យូទ័រគ្រប់គ្រាន់',
  'q_good_internet': 'អ៊ីនធឺណិតល្អ',
  'q_enough_practice_time': 'ពេលអនុវត្តគ្រប់គ្រាន់',
  'q_engaging_lessons': 'មេរៀនទាក់ទាញ',
  'q_active_teaching_methods': 'វិធីសាស្ត្របង្រៀនសកម្ម',
  'q_presentation_opportunities': 'ឱកាសធ្វើបទបង្ហាញ',
  'q_teamwork_opportunities': 'ឱកាសធ្វើការក្រុម',
  'q_prepare_before_class': 'ត្រៀមខ្លួនមុនចូលរៀន',
  'q_teachers_explain_timely': 'គ្រូពន្យល់ទាន់ពេល',
  'q_teachers_more_attentive': 'គ្រូយកចិត្តទុកដាក់',
  'q_enough_access_for_self_study': 'អាចចូលប្រើប្រាស់ដើម្បីស្វ័យសិក្សា',
  'q_know_internal_rules': 'យល់ដឹងពីបទបញ្ជាផ្ទៃក្នុង'
};

const SENTIMENT_QUESTIONS = [
  'q_want_study_more', 'q_stem_interest', 'q_self_study', 'q_equal_opportunity',
  'q_future_confidence', 'q_uni_aspiration', 'q_education_confidence', 'q_enjoy_digital',
  'q_better_discipline', 'q_braver', 'q_join_competitions'
];

export default function StudentOperations() {
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

  // Chart 1: CTC Impact by Student Device Access
  const deviceImpactData = useMemo(() => {
    const devicesMap = {};
    filteredDemographics.forEach(row => {
      let rowScore = 0;
      let rowCount = 0;
      SENTIMENT_QUESTIONS.forEach(q => {
        if (row[q]) {
          rowCount++;
          if (row[q] === 'Agree' || row[q] === 'យល់ព្រម') rowScore += 3;
          else if (row[q] === 'Neutral' || row[q] === 'ធម្មតា') rowScore += 2;
          else if (row[q] === 'Disagree' || row[q] === 'មិនយល់ព្រម') rowScore += 1;
        }
      });
      const avgRowScore = rowCount > 0 ? rowScore / rowCount : 0;
      
      let sentimentGroup = 'អព្យាក្រឹត (Neutral)';
      if (avgRowScore > 2.5) sentimentGroup = 'វិជ្ជមាន (Positive)';
      else if (avgRowScore < 1.5 && avgRowScore > 0) sentimentGroup = 'អវិជ្ជមាន (Negative)';

      if (row.devices_owned) {
        const devices = row.devices_owned.split(';').map(d => d.trim()).filter(Boolean);
        devices.forEach(d => {
          if (!devicesMap[d]) devicesMap[d] = { name: d, Positive: 0, Neutral: 0, Negative: 0, total: 0 };
          if (sentimentGroup === 'វិជ្ជមាន (Positive)') devicesMap[d].Positive++;
          else if (sentimentGroup === 'អព្យាក្រឹត (Neutral)') devicesMap[d].Neutral++;
          else if (sentimentGroup === 'អវិជ្ជមាន (Negative)') devicesMap[d].Negative++;
          devicesMap[d].total++;
        });
      }
    });

    return Object.values(devicesMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filteredDemographics]);

  // Chart 2: CTC Facility & Teaching Quality Assessment (Radar)
  const facilityTeachingData = useMemo(() => {
    return Object.keys(FACILITY_TEACHING_QUESTIONS).map(key => {
      let agree = 0;
      let total = 0;
      filteredDemographics.forEach(row => {
        if (row[key]) {
          total++;
          if (row[key] === 'Agree' || row[key] === 'យល់ព្រម') agree++;
        }
      });
      return {
        subject: FACILITY_TEACHING_QUESTIONS[key],
        A: total > 0 ? parseFloat(((agree / total) * 100).toFixed(1)) : 0,
        fullMark: 100
      };
    });
  }, [filteredDemographics]);

  // Chart 3: Service Utilization Volume
  const serviceUtilization = useMemo(() => {
    const services = {};
    filteredDemographics.forEach(row => {
      let rowScore = 0;
      let rowCount = 0;
      SENTIMENT_QUESTIONS.forEach(q => {
        if (row[q]) {
          rowCount++;
          if (row[q] === 'Agree' || row[q] === 'យល់ព្រម') rowScore += 3;
          else if (row[q] === 'Neutral' || row[q] === 'ធម្មតា') rowScore += 2;
          else if (row[q] === 'Disagree' || row[q] === 'មិនយល់ព្រម') rowScore += 1;
        }
      });
      const avgRowScore = rowCount > 0 ? rowScore / rowCount : 0;

      if (row.services_used_at_ctc) {
        const svcs = row.services_used_at_ctc.split(';').map(s => s.trim()).filter(Boolean);
        svcs.forEach(s => {
          const translatedS = translateTheme(s);
          const serviceName = translatedS.length > 25 ? translatedS.substring(0, 25) + '...' : translatedS;
          if (!services[serviceName]) services[serviceName] = { name: serviceName, users: 0, totalScore: 0 };
          services[serviceName].users++;
          services[serviceName].totalScore += avgRowScore;
        });
      }
    });

    return Object.values(services)
      .map(s => ({
        ...s,
        avgScore: parseFloat((s.totalScore / s.users).toFixed(2))
      }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 7);
  }, [filteredDemographics]);

  // Chart 4: Top Operational Challenges Reported
  const topChallenges = useMemo(() => {
    const counts = {};
    let totalChallenges = 0;
    filteredThemes.forEach(t => {
      if (t.Theme && (t.Question_Type === 'Challenge' || t.Question_Type === 'Areas for Improvement' || t.Question_Type === 'Suggestion')) {
        const tName = t.Theme.trim();
        if (!tName.toLowerCase().startsWith('no ') && !tName.toLowerCase().includes('គ្មាន') && tName.toLowerCase() !== 'other / unclassified' && tName.toLowerCase() !== 'unclassified / no meaningful response' && tName !== 'Other') {
          counts[tName] = (counts[tName] || 0) + 1;
          totalChallenges++;
        }
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ 
        name: translateTheme(name), 
        count,
        percentage: totalChallenges > 0 ? ((count / totalChallenges) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
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
          <h1>ប្រតិបត្តិការ និងសមធម៌</h1>
          <p>ការវាយតម្លៃលើបរិក្ខារ ការបង្រៀន និងភាពងាយស្រួលទទួលបានសេវា</p>
        </header>

      <div className="charts-grid">
        {/* Chart 1 */}
        <div className="chart-card">
          <h3 className="chart-title">ផលជះដោយផ្អែកលើលទ្ធភាពមានឧបករណ៍ប្រើប្រាស់</h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deviceImpactData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, name === 'Positive' ? 'វិជ្ជមាន' : name === 'Neutral' ? 'អព្យាក្រឹត' : 'អវិជ្ជមាន']} />
                <Legend />
                <Bar dataKey="Positive" stackId="a" fill={COLORS.teal} name="វិជ្ជមាន" />
                <Bar dataKey="Neutral" stackId="a" fill={COLORS.amber} name="អព្យាក្រឹត" />
                <Bar dataKey="Negative" stackId="a" fill={COLORS.rose} name="អវិជ្ជមាន" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 */}
        <div className="chart-card">
          <h3 className="chart-title">ការវាយតម្លៃបរិក្ខារ និងគុណភាពបង្រៀន</h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={facilityTeachingData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#475569' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="អត្រាយល់ព្រម (%)" dataKey="A" stroke={COLORS.indigo} fill={COLORS.indigo} fillOpacity={0.5} />
                <Tooltip formatter={(value) => [`${value}% យល់ព្រម`, 'អត្រាភាគរយ']} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Chart 3 */}
        <div className="chart-card">
          <h3 className="chart-title">ការប្រើប្រាស់សេវាកម្ម និងផលជះ</h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={serviceUtilization} margin={{ top: 20, right: 30, left: 0, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-35} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" domain={[1, 3]} />
                <Tooltip />
                <Legend verticalAlign="top" height={36}/>
                <Area yAxisId="left" type="monotone" dataKey="users" name="ចំនួនអ្នកប្រើប្រាស់" stroke={COLORS.sky} fill={COLORS.sky} fillOpacity={0.3} />
                <Area yAxisId="right" type="monotone" dataKey="avgScore" name="ពិន្ទុផលជះ" stroke={COLORS.coral} fill={COLORS.coral} fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4 */}
        <div className="chart-card">
          <h3 className="chart-title">បញ្ហាប្រឈមនៃប្រតិបត្តិការសំខាន់ៗ</h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topChallenges} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, 'ចំនួនលើកឡើង']} />
                <Bar dataKey="count" fill={COLORS.rose} radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="percentage" position="center" formatter={(val) => `${val}%`} style={{ fill: '#ffffff', fontSize: 12, fontWeight: 'bold' }} />
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
