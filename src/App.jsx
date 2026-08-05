import React, { useState } from 'react'
import Dashboard from './components/Dashboard'
import ImpactDashboard from './components/ImpactDashboard'
import AdvancedImpactDashboard from './components/AdvancedImpactDashboard'
import FeedbackDashboard from './components/FeedbackDashboard'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('demographics');
  const [mounted, setMounted] = useState({ demographics: true });

  const switchTab = (tab) => {
    setCurrentView(tab);
    if (!mounted[tab]) {
      setMounted(prev => ({ ...prev, [tab]: true }));
    }
  };

  return (
    <>
      <div className="tabs-container">
        <button 
          className={`tab-btn ${currentView === 'demographics' ? 'active' : ''}`}
          onClick={() => switchTab('demographics')}
          style={{ fontSize: '1rem', padding: '10px 20px' }}
        >
          Demographics & Tech
        </button>
        <button 
          className={`tab-btn ${currentView === 'impact' ? 'active' : ''}`}
          onClick={() => switchTab('impact')}
          style={{ fontSize: '1rem', padding: '10px 20px' }}
        >
          Impact & Engagement
        </button>
        <button 
          className={`tab-btn ${currentView === 'advanced' ? 'active' : ''}`}
          onClick={() => switchTab('advanced')}
          style={{ fontSize: '1rem', padding: '10px 20px' }}
        >
          Skills & Safety
        </button>
        <button 
          className={`tab-btn ${currentView === 'feedback' ? 'active' : ''}`}
          onClick={() => switchTab('feedback')}
          style={{ fontSize: '1rem', padding: '10px 20px' }}
        >
          Feedback (Adv & Dis)
        </button>
      </div>
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
    </>
  )
}

export default App
