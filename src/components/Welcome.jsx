import React from 'react';
import '../App.css';

export default function Welcome({ onStart }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'inherit' }}>
      
      {/* Header Bar */}
      <header style={{ 
        padding: '16px 5%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        backgroundColor: '#ffffff', 
        borderBottom: '1px solid #eaeaea',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src="/Image/Logo_MPTC.png" alt="MPTC Logo" style={{ height: '60px', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
          <img src="/Image/CTC_Logo.webp" alt="CTC Logo" style={{ height: '60px', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
          
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontWeight: 'bold', color: '#005baa', fontSize: '1.3rem', lineHeight: '1.2' }}>
              មជ្ឈមណ្ឌលបច្ចេកវិទ្យាសហគមន៍
            </div>
            <div style={{ fontWeight: 'bold', color: '#005baa', fontSize: '1rem', letterSpacing: '1px' }}>
              COMMUNITY TECH CENTER
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ 
        flex: 1, 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center', 
        backgroundColor: '#1e293b',
        backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.7))', // Fallback gradient
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        
        {/* We can add an actual background image here if provided later, for now the dark gradient serves as the hero overlay */}
        
        <div style={{ position: 'relative', zIndex: 1, padding: '0 5%', maxWidth: '900px', color: 'white' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '8px', lineHeight: '1.2' }}>
            Community Tech Center
          </h1>
          <h2 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '24px', color: '#e2e8f0', lineHeight: '1.4' }}>
            ប្រព័ន្ធវិភាគទិន្នន័យលោកគ្រូអ្នកគ្រូ ម.ប.ស.
          </h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '40px', color: '#cbd5e1', lineHeight: '1.6', maxWidth: '700px' }}>
            Empowering communities through technology and innovation.<br/>
            ផ្ទាំងទិន្នន័យនេះត្រូវបានរចនាឡើងដើម្បីបង្ហាញ និងវិភាគទិន្នន័យវាយតម្លៃពីលោកគ្រូអ្នកគ្រូអំពីផលជះ និងការអភិវឌ្ឍសមត្ថភាពឌីជីថល។
          </p>
          
          <button 
            onClick={onStart} 
            style={{ 
              padding: '12px 32px', 
              fontSize: '1.1rem', 
              backgroundColor: '#e2e8f0', 
              color: '#0f172a', 
              border: 'none', 
              borderRadius: '24px', 
              cursor: 'pointer', 
              fontWeight: '600', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#ffffff'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#e2e8f0'}
          >
            Learn More <span style={{fontSize: '1.2rem'}}>→</span>
          </button>
        </div>
      </main>

    </div>
  );
}
