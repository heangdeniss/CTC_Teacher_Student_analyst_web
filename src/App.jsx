import React, { useState } from 'react'
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
  const [currentView, setCurrentView] = useState('welcome');
  const [analystType, setAnalystType] = useState(null); // 'teacher' or 'student'
  const [mounted, setMounted] = useState({ welcome: true });

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
            ទំព័រដើម
          </button>
          
          {analystType === 'teacher' && (
            <>
              <button 
                className={`tab-btn ${currentView === 'demographics' ? 'active' : ''}`}
                onClick={() => switchTab('demographics')}
                style={{ fontSize: '1rem', padding: '10px 20px' }}
              >
                ព័ត៌មានទូទៅ
              </button>
              <button 
                className={`tab-btn ${currentView === 'impact' ? 'active' : ''}`}
                onClick={() => switchTab('impact')}
                style={{ fontSize: '1rem', padding: '10px 20px' }}
              >
                ផលជះ & ការចូលរួម
              </button>
              <button 
                className={`tab-btn ${currentView === 'advanced' ? 'active' : ''}`}
                onClick={() => switchTab('advanced')}
                style={{ fontSize: '1rem', padding: '10px 20px' }}
              >
                ការអភិវឌ្ឍជំនាញ & សុវត្ថិភាព
              </button>
              <button 
                className={`tab-btn ${currentView === 'feedback' ? 'active' : ''}`}
                onClick={() => switchTab('feedback')}
                style={{ fontSize: '1rem', padding: '10px 20px' }}
              >
                មតិយោបល់
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
        {mounted.welcome && <Welcome onStart={handleStart} />}
      </div>
      
      {/* Teacher Tabs */}
      <div style={{ display: currentView === 'demographics' ? 'block' : 'none' }}>
        {mounted.demographics && <Dashboard />}
      </div>
      <div style={{ display: currentView === 'impact' ? 'block' : 'none' }}>
        {mounted.impact && <ImpactDashboard />}
      </div>
      <div style={{ display: currentView === 'advanced' ? 'block' : 'none' }}>
        {mounted.advanced && <AdvancedImpactDashboard />}
      </div>
      <div style={{ display: currentView === 'feedback' ? 'block' : 'none' }}>
        {mounted.feedback && <FeedbackDashboard />}
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
