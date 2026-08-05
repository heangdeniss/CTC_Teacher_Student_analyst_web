import React from 'react';
import { BarChart3, Users, LineChart, MessageSquare } from 'lucide-react';
import '../App.css';

export default function Welcome({ onStart }) {
  return (
    <div className="dashboard-container" style={{ justifyContent: 'center', alignItems: 'center', background: 'var(--bg-color)', width: '100%' }}>
      <div style={{ maxWidth: '800px', padding: '40px', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '24px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)', margin: '20px' }}>
        
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', marginBottom: '16px' }}>
            {/* The user can drop their logo into the public folder as logo.png */}
            <img src="/logo.png" alt="Logo" style={{ height: '80px', objectFit: 'contain' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
          </div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '16px', lineHeight: '1.4' }}>
            សូមស្វាគមន៍មកកាន់ <br/>
            <span style={{ color: 'var(--accent-primary)' }}>ប្រព័ន្ធវិភាគទិន្នន័យលោកគ្រូអ្នកគ្រូ ម.ប.ស.</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '32px' }}>
            ផ្ទាំងទិន្នន័យនេះត្រូវបានរចនាឡើងដើម្បីបង្ហាញ និងវិភាគទិន្នន័យវាយតម្លៃពីលោកគ្រូអ្នកគ្រូអំពីផលជះ ការចូលរួម និងការអភិវឌ្ឍសមត្ថភាពឌីជីថលតាមរយៈមជ្ឈមណ្ឌលបច្ចេកវិទ្យាសហគមន៍។
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '40px', textAlign: 'left' }}>
          <div style={{ padding: '20px', background: 'var(--bg-color)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <Users size={24} color="#0ea5e9" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1rem', margin: '0 0 8px 0' }}>ព័ត៌មានទូទៅ</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>ស្ថិតិទូទៅ និងការប្រើប្រាស់បច្ចេកវិទ្យា</p>
          </div>
          <div style={{ padding: '20px', background: 'var(--bg-color)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <LineChart size={24} color="#8b5cf6" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1rem', margin: '0 0 8px 0' }}>ផលជះ</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>ការវាយតម្លៃលើផលជះរបស់ ម.ប.ស.</p>
          </div>
          <div style={{ padding: '20px', background: 'var(--bg-color)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <MessageSquare size={24} color="#10b981" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1rem', margin: '0 0 8px 0' }}>មតិយោបល់</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>ចំណុចវិជ្ជមាន និងអវិជ្ជមាន</p>
          </div>
        </div>

        <button 
          onClick={onStart}
          style={{ 
            background: 'var(--accent-primary)', 
            color: 'white', 
            border: 'none', 
            padding: '16px 40px', 
            fontSize: '1.2rem', 
            fontWeight: 'bold', 
            borderRadius: '12px', 
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background 0.2s',
            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)'
          }}
          onMouseOver={(e) => e.target.style.background = 'var(--accent-hover)'}
          onMouseOut={(e) => e.target.style.background = 'var(--accent-primary)'}
        >
          ចាប់ផ្តើមមើលទិន្នន័យ (Start)
        </button>

      </div>
    </div>
  );
}
