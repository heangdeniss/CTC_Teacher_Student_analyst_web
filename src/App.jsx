import React, { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import ImpactDashboardPart1 from './components/ImpactDashboardPart1'
import ImpactDashboardPart2 from './components/ImpactDashboardPart2'
import ImpactDashboardPart3 from './components/ImpactDashboardPart3'
import FeedbackAdvantage from './components/FeedbackAdvantage'
import FeedbackDisadvantage from './components/FeedbackDisadvantage'

import StudentAnalyticsApp from './student/StudentAnalyticsApp'

import Welcome from './components/Welcome'
import './App.css'

function App() {
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
  };

  return (
    <>
      <div style={{ display: currentView === 'welcome' ? 'block' : 'none', height: '100%' }}>
          {mounted.welcome && <Welcome onStart={handleStart} language={language} />}
      </div>
      
      {/* Student Analyst dashboard */}
      <div style={{ display: currentView === 'student' ? 'block' : 'none' }}>
        {mounted.student && <StudentAnalyticsApp onHome={handleHome} />}
      </div>

      {currentView !== 'welcome' && currentView !== 'student' && (
        <div className="app-layout">
          <aside className="app-sidebar">
            <div className="logo-area">
              <h1>{language === 'en' ? 'CTC Analytics' : 'ម.ប.ស.'}</h1>
              <p>{language === 'en' ? 'Teacher Data' : 'ការវិភាគទិន្នន័យលោកគ្រូអ្នកគ្រូ'}</p>
            </div>
            <nav className="nav-menu">
              <button 
                className={`tab-btn`}
                onClick={handleHome}
              >
                {language === 'en' ? 'Home' : 'ទំព័រដើម'}
              </button>
              <button 
                className={`tab-btn ${currentView === 'demographics' ? 'active' : ''}`}
                onClick={() => switchTab('demographics')}
              >
                {language === 'en' ? 'General Info' : 'ព័ត៌មានទូទៅ'}
              </button>
              <button 
                className={`tab-btn ${currentView === 'impact1' ? 'active' : ''}`}
                onClick={() => switchTab('impact1')}
              >
                {language === 'en' ? 'CTC Impact on School' : 'ផលជះ ម.ប.ស. លើសាលារៀន'}
              </button>
              <button 
                className={`tab-btn ${currentView === 'impact2' ? 'active' : ''}`}
                onClick={() => switchTab('impact2')}
              >
                {language === 'en' ? 'CTC Tech Adaptation' : 'ការបន្សាំបច្ចេកវិទ្យា ម.ប.ស.'}
              </button>
              <button 
                className={`tab-btn ${currentView === 'impact3' ? 'active' : ''}`}
                onClick={() => switchTab('impact3')}
              >
                {language === 'en' ? 'CTC Resources & Safety' : 'ធនធាន ម.ប.ស. & សុវត្ថិភាព'}
              </button>
              <button 
                className={`tab-btn ${currentView === 'feedbackAdv' ? 'active' : ''}`}
                onClick={() => switchTab('feedbackAdv')}
              >
                {language === 'en' ? 'CTC Advantages' : 'ចំណុចវិជ្ជមានពី ម.ប.ស.'}
              </button>
              <button 
                className={`tab-btn ${currentView === 'feedbackDis' ? 'active' : ''}`}
                onClick={() => switchTab('feedbackDis')}
              >
                {language === 'en' ? 'CTC Challenges' : 'បញ្ហាប្រឈមជាមួយ ម.ប.ស.'}
              </button>
            </nav>
          </aside>

          <div className="app-main" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '16px', right: '32px', zIndex: 100 }}>
              <div className="lang-pill-container">
                {language === 'en' ? (
                  <>
                    <button className="active">EN</button>
                    <button onClick={() => setLanguage('km')}>KH</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setLanguage('en')}>អង់គ្លេស</button>
                    <button className="active">ខ្មែរ</button>
                  </>
                )}
              </div>
            </div>

            {/* Teacher Tabs */}
            <div style={{ display: currentView === 'demographics' ? 'block' : 'none', height: '100%' }}>
              {mounted.demographics && <Dashboard language={language} />}
            </div>
            <div style={{ display: currentView === 'impact1' ? 'block' : 'none', height: '100%' }}>
              {mounted.impact1 && <ImpactDashboardPart1 language={language} />}
            </div>
            <div style={{ display: currentView === 'impact2' ? 'block' : 'none', height: '100%' }}>
              {mounted.impact2 && <ImpactDashboardPart2 language={language} />}
            </div>
            <div style={{ display: currentView === 'impact3' ? 'block' : 'none', height: '100%' }}>
              {mounted.impact3 && <ImpactDashboardPart3 language={language} />}
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
