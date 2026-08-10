import React from 'react';
import '../App.css';

export default function Welcome({ onStart, language = 'km' }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'inherit' }}>
      
      {/* Header Bar */}
      <header style={{ 
        padding: 'clamp(10px, 3vw, 16px) 5%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        backgroundColor: '#ffffff', 
        borderBottom: '1px solid #eaeaea',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/Image/CTC_Logo.webp" alt="CTC Logo" style={{ height: 'clamp(40px, 12vw, 60px)', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/Image/Logo_MPTC.png" alt="MPTC Logo" style={{ height: 'clamp(40px, 12vw, 60px)', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#334155',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'url("/Image/image.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.6,
          zIndex: 0
        }} />

        <div style={{ padding: '0 5%', maxWidth: '900px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', fontWeight: '900', marginBottom: '16px', lineHeight: '1.2', color: '#ffffff', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
            Community Tech Center
          </h1>
          <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: '700', marginBottom: '24px', color: '#38bdf8', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            {language === 'en' ? 'CTC Data Analysis System' : 'ប្រព័ន្ធវិភាគទិន្នន័យ ម.ប.ស.'}
          </h2>
          <p style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', marginBottom: '40px', color: '#f1f5f9', lineHeight: '1.6', maxWidth: '700px', margin: '0 auto 40px auto', fontWeight: '500', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            Empowering communities through technology and innovation.<br/>
            {language === 'en' ? 'This dashboard is designed to present and analyze evaluation data from teachers and students regarding digital capacity impact and development.' : 'ផ្ទាំងទិន្នន័យនេះត្រូវបានរចនាឡើងដើម្បីបង្ហាញ និងវិភាគទិន្នន័យវាយតម្លៃពីលោកគ្រូអ្នកគ្រូ និងសិស្សានុសិស្សអំពីផលជះ និងការអភិវឌ្ឍសមត្ថភាពឌីជីថល។'}
          </p>
          
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => onStart('teacher')} 
              style={{ 
                padding: '14px 36px', 
                fontSize: '1.1rem', 
                backgroundColor: '#005baa', 
                color: '#ffffff', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: '600', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 0.2s',
                boxShadow: '0 4px 6px -1px rgba(0, 91, 170, 0.2)',
                flex: '1 1 200px'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#004785'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#005baa'}
            >
              Teacher Analyst <span style={{fontSize: '1.2rem'}}>→</span>
            </button>
            <button 
              onClick={() => onStart('student')} 
              style={{ 
                padding: '14px 36px', 
                fontSize: '1.1rem', 
                backgroundColor: '#0d9488', 
                color: '#ffffff', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: '600', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 0.2s',
                boxShadow: '0 4px 6px -1px rgba(13, 148, 136, 0.2)',
                flex: '1 1 200px'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0f766e'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#0d9488'}
            >
              Student Analyst <span style={{fontSize: '1.2rem'}}>→</span>
            </button>
          </div>
        </div>
      </main>

    </div>
  );
}
