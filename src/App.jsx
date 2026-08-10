import React, { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import ImpactDashboard from './components/ImpactDashboard'
import AdvancedImpactDashboard from './components/AdvancedImpactDashboard'
import FeedbackDashboard from './components/FeedbackDashboard'

import StudentOverview from './components/StudentOverview'
import StudentImpact from './components/StudentImpact'
import StudentOperations from './components/StudentOperations'
import StudentCommunity from './components/StudentCommunity'

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
      switchTab('student_overview');
    }
  };

  const handleHome = () => {
    setAnalystType(null);
    switchTab('welcome');
  };

  return (
    <>
      {currentView !== 'welcome' && (
        <div className="tabs-container">
          <button 
            className={`tab-btn ${currentView === 'welcome' ? 'active' : ''}`}
            onClick={handleHome}
            style={{ fontSize: '1rem', padding: '10px 20px' }}
          >
            {analystType === 'teacher' && language === 'en' ? 'Home' : 'ទំព័រដើម'}
          </button>
          
          {analystType === 'teacher' && (
            <>
              <button 
                className={`tab-btn ${currentView === 'demographics' ? 'active' : ''}`}
                onClick={() => switchTab('demographics')}
                style={{ fontSize: '1rem', padding: '10px 20px' }}
              >
                {language === 'en' ? 'General Info' : 'ព័ត៌មានទូទៅ'}
              </button>
              <button 
                className={`tab-btn ${currentView === 'impact' ? 'active' : ''}`}
                onClick={() => switchTab('impact')}
                style={{ fontSize: '1rem', padding: '10px 20px' }}
              >
                {language === 'en' ? 'Participation & Impact' : 'ការចូលរួម & ផលជះ'}
              </button>
              <button 
                className={`tab-btn ${currentView === 'advanced' ? 'active' : ''}`}
                onClick={() => switchTab('advanced')}
                style={{ fontSize: '1rem', padding: '10px 20px' }}
              >
                {language === 'en' ? 'Digital Skills & Safety' : 'ជំនាញ & សុវត្ថិភាពឌីជីថល'}
              </button>
              <button 
                className={`tab-btn ${currentView === 'feedback' ? 'active' : ''}`}
                onClick={() => switchTab('feedback')}
                style={{ fontSize: '1rem', padding: '10px 20px' }}
              >
                {language === 'en' ? 'Advantages & Disadvantages' : 'គុណសម្បត្តិ និងគុណវិបត្តិ'}
              </button>
              
              <div style={{ flexGrow: 1 }}></div>
              <button 
                className="tab-btn lang-toggle"
                onClick={() => setLanguage(l => l === 'km' ? 'en' : 'km')}
                style={{ fontSize: '0.9rem', padding: '8px 15px', marginLeft: 'auto', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {language === 'en' ? '🇰🇭 ខ្មែរ' : '🇬🇧 EN'}
              </button>
            </>
          )}

          {analystType === 'student' && (
            <>
              <button 
                className={`tab-btn ${currentView === 'student_overview' ? 'active' : ''}`}
                onClick={() => switchTab('student_overview')}
                style={{ fontSize: '1rem', padding: '10px 20px' }}
              >
                ទិដ្ឋភាពទូទៅ
              </button>
              <button 
                className={`tab-btn ${currentView === 'student_impact' ? 'active' : ''}`}
                onClick={() => switchTab('student_impact')}
                style={{ fontSize: '1rem', padding: '10px 20px' }}
              >
                ការវិភាគផលជះ
              </button>
              <button 
                className={`tab-btn ${currentView === 'student_operations' ? 'active' : ''}`}
                onClick={() => switchTab('student_operations')}
                style={{ fontSize: '1rem', padding: '10px 20px' }}
              >
                ប្រតិបត្តិការ & សមធម៌
              </button>
              <button 
                className={`tab-btn ${currentView === 'student_community' ? 'active' : ''}`}
                onClick={() => switchTab('student_community')}
                style={{ fontSize: '1rem', padding: '10px 20px' }}
              >
                ផលជះរយៈពេលវែង
              </button>
            </>
          )}
        </div>
      )}
      
      <div style={{ display: currentView === 'welcome' ? 'block' : 'none', height: '100%' }}>
          {mounted.welcome && <Welcome onStart={handleStart} language={language} />}
      </div>
      
      {/* Teacher Tabs */}
      <div style={{ display: currentView === 'demographics' ? 'block' : 'none' }}>
        {mounted.demographics && <Dashboard language={language} />}
      </div>
      <div style={{ display: currentView === 'impact' ? 'block' : 'none' }}>
        {mounted.impact && <ImpactDashboard language={language} />}
      </div>
      <div style={{ display: currentView === 'advanced' ? 'block' : 'none' }}>
        {mounted.advanced && <AdvancedImpactDashboard language={language} />}
      </div>
      <div style={{ display: currentView === 'feedback' ? 'block' : 'none' }}>
        {mounted.feedback && <FeedbackDashboard language={language} />}
      </div>

      {/* Student Tabs */}
      <div style={{ display: currentView === 'student_overview' ? 'block' : 'none' }}>
        {mounted.student_overview && <StudentOverview />}
      </div>
      <div style={{ display: currentView === 'student_impact' ? 'block' : 'none' }}>
        {mounted.student_impact && <StudentImpact />}
      </div>
      <div style={{ display: currentView === 'student_operations' ? 'block' : 'none' }}>
        {mounted.student_operations && <StudentOperations />}
      </div>
      <div style={{ display: currentView === 'student_community' ? 'block' : 'none' }}>
        {mounted.student_community && <StudentCommunity />}
      </div>
    </>
  )
}

export default App
