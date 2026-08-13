import React, { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import ImpactDashboardPart1 from './components/ImpactDashboardPart1'
import ImpactDashboardPart2 from './components/ImpactDashboardPart2'
import ImpactDashboardPart3 from './components/ImpactDashboardPart3'
import FeedbackAdvantage from './components/FeedbackAdvantage'
import FeedbackDisadvantage from './components/FeedbackDisadvantage'

import StudentAnalyticsApp from './student/StudentAnalyticsApp'

import Welcome from './components/Welcome'
import { Home, PieChart, Activity, MonitorPlay, ShieldCheck, Sparkles, AlertTriangle, Menu, X } from 'lucide-react'
import './App.css'
import './mobile.css'

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('currentView') || 'welcome';
  });
  const [analystType, setAnalystType] = useState(() => {
    return localStorage.getItem('analystType') || null;
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'km';
  });
  const [mounted, setMounted] = useState(() => {
    try {
      const saved = localStorage.getItem('mountedTabs');
      return saved ? JSON.parse(saved) : { welcome: true };
    } catch (e) {
      return { welcome: true };
    }
  });

  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  useEffect(() => {
    if (analystType) {
      localStorage.setItem('analystType', analystType);
    } else {
      localStorage.removeItem('analystType');
    }
  }, [analystType]);

  useEffect(() => {
    localStorage.setItem('mountedTabs', JSON.stringify(mounted));
  }, [mounted]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const switchTab = (tab) => {
    setCurrentView(tab);
    if (!mounted[tab]) {
      setMounted(prev => ({ ...prev, [tab]: true }));
    }
    setIsMobileMenuOpen(false);
  };

  const handleStart = (type) => {
    setAnalystType(type);
    if (type === 'teacher') {
      switchTab('demographics');
    } else {
      switchTab('student');
    }
  };

  const handleHome = () => {
    setAnalystType(null);
    switchTab('welcome');
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <div style={{ display: currentView === 'welcome' ? 'block' : 'none', height: '100%' }}>
          {mounted.welcome && <Welcome onStart={handleStart} language={language} setLanguage={setLanguage} />}
      </div>
      
      {/* Student Analyst dashboard */}
      <div style={{ display: currentView === 'student' ? 'block' : 'none' }}>
        {mounted.student && <StudentAnalyticsApp onHome={handleHome} language={language} setLanguage={setLanguage} />}
      </div>

      {currentView !== 'welcome' && currentView !== 'student' && (
        <div className="app-layout">
          <div 
            className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <aside className={`app-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <div className="logo-area" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px' }}>
              <img src="/Image/MPS_Logo.png" alt="MPS Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
              <div>
                <h1 style={{ margin: '0 0 4px 0', fontSize: '1.25rem' }}>{language === 'en' ? 'CTC Analytics' : 'ម.ប.ស.'}</h1>
                <p style={{ margin: 0, opacity: 0.8, fontSize: '0.875rem' }}>{language === 'en' ? 'Teacher Data' : 'ការវិភាគទិន្នន័យលោកគ្រូអ្នកគ្រូ'}</p>
              </div>
            </div>
            <nav className="nav-menu">
              <button 
                className={`tab-btn`}
                onClick={handleHome}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Home size={18} color="#0ea5e9" />
                {language === 'en' ? 'Home' : 'ទំព័រដើម'}
              </button>
              <button 
                className={`tab-btn ${currentView === 'demographics' ? 'active' : ''}`}
                onClick={() => switchTab('demographics')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <PieChart size={18} color="#10b981" />
                {language === 'en' ? 'General Info' : 'ព័ត៌មានទូទៅ'}
              </button>
              <button 
                className={`tab-btn ${currentView === 'impact1' ? 'active' : ''}`}
                onClick={() => switchTab('impact1')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Activity size={18} color="#3b82f6" />
                {language === 'en' ? 'CTC Impact on School' : 'ផលជះ ម.ប.ស. លើសាលារៀន'}
              </button>
              <button 
                className={`tab-btn ${currentView === 'impact2' ? 'active' : ''}`}
                onClick={() => switchTab('impact2')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <MonitorPlay size={18} color="#8b5cf6" />
                {language === 'en' ? 'CTC Tech Adaptation' : 'ការបន្សាំបច្ចេកវិទ្យា ម.ប.ស.'}
              </button>
              <button 
                className={`tab-btn ${currentView === 'impact3' ? 'active' : ''}`}
                onClick={() => switchTab('impact3')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <ShieldCheck size={18} color="#e11d48" />
                {language === 'en' ? 'CTC Resources & Safety' : 'ធនធាន ម.ប.ស. & សុវត្ថិភាព'}
              </button>
              <button 
                className={`tab-btn ${currentView === 'feedbackAdv' ? 'active' : ''}`}
                onClick={() => switchTab('feedbackAdv')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Sparkles size={18} color="#f97316" />
                {language === 'en' ? 'CTC Advantages' : 'ចំណុចវិជ្ជមានពី ម.ប.ស.'}
              </button>
              <button 
                className={`tab-btn ${currentView === 'feedbackDis' ? 'active' : ''}`}
                onClick={() => switchTab('feedbackDis')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <AlertTriangle size={18} color="#f59e0b" />
                {language === 'en' ? 'CTC Challenges' : 'បញ្ហាប្រឈមជាមួយ ម.ប.ស.'}
              </button>
            </nav>
          </aside>

          <div className="app-main" style={{ position: 'relative' }}>
            <div className="mobile-header">
              <div className="mobile-header-title">
                <button className="menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
                  <Menu size={24} />
                </button>
                <img src="/Image/CTC_Logo.webp" alt="CTC Logo" />
                <span>{language === 'en' ? 'CTC' : 'ម.ប.ស.'}</span>
              </div>
              <div className="mobile-lang-pill-container">
                {language === 'en' ? (
                  <>
                    <button className="active"><img src="https://flagcdn.com/w20/gb.png" srcSet="https://flagcdn.com/w40/gb.png 2x" width="16" alt="UK" style={{ marginRight: '4px', borderRadius: '2px' }} /> EN</button>
                    <button onClick={() => setLanguage('km')}><img src="https://flagcdn.com/w20/kh.png" srcSet="https://flagcdn.com/w40/kh.png 2x" width="16" alt="KH" style={{ marginRight: '4px', borderRadius: '2px' }} /> KH</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setLanguage('en')}><img src="https://flagcdn.com/w20/gb.png" srcSet="https://flagcdn.com/w40/gb.png 2x" width="16" alt="UK" style={{ marginRight: '4px', borderRadius: '2px' }} /> EN</button>
                    <button className="active"><img src="https://flagcdn.com/w20/kh.png" srcSet="https://flagcdn.com/w40/kh.png 2x" width="16" alt="KH" style={{ marginRight: '4px', borderRadius: '2px' }} /> KH</button>
                  </>
                )}
              </div>
            </div>

            <div className="desktop-lang-pill" style={{ position: 'fixed', top: '16px', right: '32px', zIndex: 100 }}>
              <div className="lang-pill-container">
                {language === 'en' ? (
                  <>
                    <button className="active"><img src="https://flagcdn.com/w20/gb.png" srcSet="https://flagcdn.com/w40/gb.png 2x" width="20" alt="UK" style={{ marginRight: '6px', display: 'inline-block', borderRadius: '2px' }} /> EN</button>
                    <button onClick={() => setLanguage('km')}><img src="https://flagcdn.com/w20/kh.png" srcSet="https://flagcdn.com/w40/kh.png 2x" width="20" alt="KH" style={{ marginRight: '6px', display: 'inline-block', borderRadius: '2px' }} /> KH</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setLanguage('en')}><img src="https://flagcdn.com/w20/gb.png" srcSet="https://flagcdn.com/w40/gb.png 2x" width="20" alt="UK" style={{ marginRight: '6px', display: 'inline-block', borderRadius: '2px' }} /> អង់គ្លេស</button>
                    <button className="active"><img src="https://flagcdn.com/w20/kh.png" srcSet="https://flagcdn.com/w40/kh.png 2x" width="20" alt="KH" style={{ marginRight: '6px', display: 'inline-block', borderRadius: '2px' }} /> ខ្មែរ</button>
                  </>
                )}
              </div>
            </div>

            {/* Teacher Tabs */}
            <div style={{ display: currentView === 'demographics' ? 'block' : 'none', height: '100%' }}>
              {mounted.demographics && <Dashboard language={language} selectedSchool={selectedSchool} setSelectedSchool={setSelectedSchool} selectedGender={selectedGender} setSelectedGender={setSelectedGender} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} />}
            </div>
            <div style={{ display: currentView === 'impact1' ? 'block' : 'none', height: '100%' }}>
              {mounted.impact1 && <ImpactDashboardPart1 language={language} selectedSchool={selectedSchool} setSelectedSchool={setSelectedSchool} selectedGender={selectedGender} setSelectedGender={setSelectedGender} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} />}
            </div>
            <div style={{ display: currentView === 'impact2' ? 'block' : 'none', height: '100%' }}>
              {mounted.impact2 && <ImpactDashboardPart2 language={language} selectedSchool={selectedSchool} setSelectedSchool={setSelectedSchool} selectedGender={selectedGender} setSelectedGender={setSelectedGender} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} />}
            </div>
            <div style={{ display: currentView === 'impact3' ? 'block' : 'none', height: '100%' }}>
              {mounted.impact3 && <ImpactDashboardPart3 language={language} selectedSchool={selectedSchool} setSelectedSchool={setSelectedSchool} selectedGender={selectedGender} setSelectedGender={setSelectedGender} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} />}
            </div>
            <div style={{ display: currentView === 'feedbackAdv' ? 'block' : 'none', height: '100%' }}>
              {mounted.feedbackAdv && <FeedbackAdvantage language={language} />}
            </div>
            <div style={{ display: currentView === 'feedbackDis' ? 'block' : 'none', height: '100%' }}>
              {mounted.feedbackDis && <FeedbackDisadvantage language={language} />}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App
