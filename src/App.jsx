import React, { useState } from 'react'
import Dashboard from './components/Dashboard'
import ImpactDashboard from './components/ImpactDashboard'
import AdvancedImpactDashboard from './components/AdvancedImpactDashboard'
import FeedbackDashboard from './components/FeedbackDashboard'
import Welcome from './components/Welcome'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('welcome');
  const [mounted, setMounted] = useState({ welcome: true });

  const switchTab = (tab) => {
    setCurrentView(tab);
    if (!mounted[tab]) {
      setMounted(prev => ({ ...prev, [tab]: true }));
    }
  };

  return (
    <>
      {currentView !== 'welcome' && (
        <div className="tabs-container">
        <button 
          className={`tab-btn ${currentView === 'welcome' ? 'active' : ''}`}
          onClick={() => switchTab('welcome')}
          style={{ fontSize: '1rem', padding: '10px 20px' }}
        >
          ទំព័រដើម
        </button>
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
          <MessageSquare size={20} />
          ផលវិជ្ជមាន និងអវិជ្ជមាន
        </button>
      </div>
      )}
      <div style={{ display: currentView === 'welcome' ? 'block' : 'none', height: '100%' }}>
        {mounted.welcome && <Welcome onStart={() => switchTab('demographics')} />}
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
