import re

with open('src/components/Dashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace instData chart
instData_old = """<ResponsiveContainer width="100%" height="100%">
                    <BarChart data={instData} layout="vertical" margin={{ top: 0, right: 80, left: 40, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                      <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={200} tick={{ fill: 'var(--text-main)', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'var(--bg-color)' }} formatter={val => `${val} ${t[language].people}`} />
                      <Bar maxBarSize={45} dataKey="value" fill={COLORS.amber} radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="value" position="right" formatter={(val) => `${val} (${((val / totalRespondents) * 100).toFixed(1)}%)`} style={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>"""
instData_new = """<HorizontalBarChart data={instData} color={COLORS.amber} yAxisWidth={200} margin={{ top: 0, right: 80, left: 40, bottom: 0 }} totalRespondents={totalRespondents} unit={t[language].people} />"""
content = content.replace(instData_old, instData_new)

# Replace schoolData chart
schoolData_old = """<ResponsiveContainer width="100%" height="100%">
                    <BarChart data={schoolData} layout="vertical" margin={{ top: 0, right: 80, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                      <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={140} tick={{ fill: 'var(--text-main)', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'var(--bg-color)' }} formatter={val => `${val} ${t[language].people}`} />
                      <Bar maxBarSize={45} dataKey="value" fill={COLORS.indigo} radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="value" position="right" formatter={(val) => `${val} (${((val / totalRespondents) * 100).toFixed(1)}%)`} style={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>"""
schoolData_new = """<HorizontalBarChart data={schoolData} color={COLORS.indigo} yAxisWidth={140} margin={{ top: 0, right: 80, left: 10, bottom: 0 }} totalRespondents={totalRespondents} unit={t[language].people} />"""
content = content.replace(schoolData_old, schoolData_new)

# Replace aiToolData chart
aiToolData_old = """<ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aiToolData} layout="vertical" margin={{ top: 0, right: 80, left: 50, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                      <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fill: 'var(--text-main)', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'var(--bg-color)' }} formatter={val => `${val}  (${((val / totalRespondents) * 100).toFixed(1)}%)`} />
                      <Bar maxBarSize={45} dataKey="value" fill={COLORS.violet} radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="value" position="right" formatter={(val) => `${val} (${((val / totalRespondents) * 100).toFixed(1)}%)`} style={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>"""
aiToolData_new = """<HorizontalBarChart data={aiToolData} color={COLORS.violet} yAxisWidth={100} margin={{ top: 0, right: 80, left: 50, bottom: 0 }} totalRespondents={totalRespondents} unit={t[language].people} />"""
content = content.replace(aiToolData_old, aiToolData_new)

# Replace devicesData chart
devicesData_old = """<ResponsiveContainer width="100%" height="100%">
                    <BarChart data={devicesData} layout="vertical" margin={{ top: 0, right: 80, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                      <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={220} tick={{ fill: 'var(--text-main)', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'var(--bg-color)' }} formatter={val => `${val} `} />
                      <Bar maxBarSize={45} dataKey="value" fill={COLORS.sky} radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="value" position="right" formatter={(val) => `${val} (${((val / totalRespondents) * 100).toFixed(1)}%)`} style={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>"""
devicesData_new = """<HorizontalBarChart data={devicesData} color={COLORS.sky} yAxisWidth={220} margin={{ top: 0, right: 80, left: 20, bottom: 0 }} totalRespondents={totalRespondents} unit={t[language].people} />"""
content = content.replace(devicesData_old, devicesData_new)

# Replace desiredSubjectsData chart
desiredSubjectsData_old = """<ResponsiveContainer width="100%" height="100%">
                    <BarChart data={desiredSubjectsData} layout="vertical" margin={{ top: 0, right: 80, left: 60, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                      <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={140} tick={{ fill: 'var(--text-main)', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'var(--bg-color)' }} formatter={val => `${val} `} />
                      <Bar maxBarSize={45} dataKey="value" fill={COLORS.emerald} radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="value" position="right" formatter={(val) => `${val} (${((val / totalRespondents) * 100).toFixed(1)}%)`} style={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>"""
desiredSubjectsData_new = """<HorizontalBarChart data={desiredSubjectsData} color={COLORS.emerald} yAxisWidth={140} margin={{ top: 0, right: 80, left: 60, bottom: 0 }} totalRespondents={totalRespondents} unit={t[language].people} />"""
content = content.replace(desiredSubjectsData_old, desiredSubjectsData_new)

# Replace supportNeedsData chart
supportNeedsData_old = """<ResponsiveContainer width="100%" height="100%">
                    <BarChart data={supportNeedsData} layout="vertical" margin={{ top: 0, right: 80, left: 60, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                      <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={140} tick={{ fill: 'var(--text-main)', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'var(--bg-color)' }} formatter={val => `${val} `} />
                      <Bar maxBarSize={45} dataKey="value" fill={COLORS.teal} radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="value" position="right" formatter={(val) => `${val} (${((val / totalRespondents) * 100).toFixed(1)}%)`} style={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>"""
supportNeedsData_new = """<HorizontalBarChart data={supportNeedsData} color={COLORS.teal} yAxisWidth={140} margin={{ top: 0, right: 80, left: 60, bottom: 0 }} totalRespondents={totalRespondents} unit={t[language].people} />"""
content = content.replace(supportNeedsData_old, supportNeedsData_new)

# Replace improvementsData chart
improvementsData_old = """<ResponsiveContainer width="100%" height="100%">
                    <BarChart data={improvementsData} layout="vertical" margin={{ top: 0, right: 80, left: 40, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                      <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={200} tick={{ fill: 'var(--text-main)', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'var(--bg-color)' }} formatter={val => `${val} `} />
                      <Bar maxBarSize={45} dataKey="value" fill={COLORS.rose} radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="value" position="right" formatter={(val) => `${val} (${((val / totalRespondents) * 100).toFixed(1)}%)`} style={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>"""
improvementsData_new = """<HorizontalBarChart data={improvementsData} color={COLORS.rose} yAxisWidth={200} margin={{ top: 0, right: 80, left: 40, bottom: 0 }} totalRespondents={totalRespondents} unit={t[language].people} />"""
content = content.replace(improvementsData_old, improvementsData_new)

# Handle empty state
empty_state_handler = """
  if (totalRespondents === 0 && !loading) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-content">
            <h1>{t[language].title}</h1>
            <p className="subtitle">{t[language].subtitle}</p>
          </div>
          <button 
            className="lang-toggle" 
            onClick={() => setLanguage(lang => lang === 'kh' ? 'en' : 'kh')}
            title="Toggle Language"
          >
            {language === 'kh' ? '🇬🇧 EN' : '🇰🇭 ខ្មែរ'}
          </button>
        </header>
        
        <div className="filters-container">
          <div className="filter-group">
            <label><School size={16} /> {t[language].school}</label>
            <select value={selectedSchool} onChange={e => setSelectedSchool(e.target.value)}>
              {schools.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label><Users size={16} /> {t[language].gender}</label>
            <select value={selectedGender} onChange={e => setSelectedGender(e.target.value)}>
              {genders.map(g => <option key={g} value={g}>{translateData(g, language)}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label><BookOpen size={16} /> {t[language].subject}</label>
            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
              {subjects.map(s => <option key={s} value={s}>{translateData(s, language)}</option>)}
            </select>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>No Data Available</h2>
          <p>Try selecting a different combination of filters.</p>
        </div>
      </div>
    );
  }
"""

loading_handler_old = """  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>{t[language].loading}</p>
      </div>
    );
  }"""
  
content = content.replace(loading_handler_old, loading_handler_old + empty_state_handler)

with open('src/components/Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Dashboard.jsx JSX replaced successfully!")
