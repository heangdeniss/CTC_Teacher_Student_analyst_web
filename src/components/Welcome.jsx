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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/Image/CTC_Logo.webp" alt="CTC Logo" style={{ height: '60px', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/Image/Logo_MPTC.png" alt="MPTC Logo" style={{ height: '60px', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#ffffff',
      }}>
        
        <div style={{ padding: '0 5%', maxWidth: '900px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '16px', lineHeight: '1.2', color: '#0f172a' }}>
            Community Tech Center
          </h1>
          <h2 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '24px', color: '#005baa', lineHeight: '1.4' }}>
            ប្រព័ន្ធវិភាគទិន្នន័យលោកគ្រូអ្នកគ្រូ ម.ប.ស.
          </h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '40px', color: '#475569', lineHeight: '1.6', maxWidth: '700px', margin: '0 auto 40px auto' }}>
            Empowering communities through technology and innovation.<br/>
            ផ្ទាំងទិន្នន័យនេះត្រូវបានរចនាឡើងដើម្បីបង្ហាញ និងវិភាគទិន្នន័យវាយតម្លៃពីលោកគ្រូអ្នកគ្រូអំពីផលជះ និងការអភិវឌ្ឍសមត្ថភាពឌីជីថល។
          </p>
          
          <button 
            onClick={onStart} 
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
              gap: '8px',
              transition: 'background-color 0.2s',
              boxShadow: '0 4px 6px -1px rgba(0, 91, 170, 0.2)'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#004785'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#005baa'}
          >
            ចូលទៅកាន់ផ្ទាំងទិន្នន័យ (Start) <span style={{fontSize: '1.2rem'}}>→</span>
          </button>
        </div>
      </main>

    </div>
  );
}
