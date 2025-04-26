import React, { useState } from 'react';
import Scratchpad from './Scratchpad';
import MathPractice from './MathPractice';
import './ReadingApp.css';

const ReadingApp = () => {
  const [practiceType, setPracticeType] = useState(null); // null, 'writing', or 'math'

  const sampleText = `
    Once upon a time, there was a little girl who loved to read. She would spend 
    hours exploring magical worlds through the pages of her books. Every story was 
    a new adventure waiting to be discovered.
  `;

  return (
    <div className="reading-app">
      <div className="hero-bg" />
      <div className="reading-container">
        <h1 className="main-title">Reading Practice</h1>
        <p className="subtitle">Empowering kids with fun, accessible learning for Dysgraphia & Dyscalculia.</p>
        <div className="text-content">
          <p>{sampleText}</p>
        </div>
        <div className="practice-buttons">
          <button 
            className="practice-button writing"
            onClick={() => setPracticeType('writing')}
            aria-label="Practice Writing"
          >
            <span role="img" aria-label="pencil">✍️</span> Practice Writing
            <span className="button-description">For Dysgraphia</span>
          </button>
          <button 
            className="practice-button math"
            onClick={() => setPracticeType('math')}
            aria-label="Practice Math"
          >
            <span role="img" aria-label="abacus">🧮</span> Practice Math
            <span className="button-description">For Dyscalculia</span>
          </button>
        </div>
      </div>
      {/* Overlay and Modal Animation */}
      {practiceType && <div className="modal-overlay" onClick={() => setPracticeType(null)} aria-label="Close overlay" />}
      {practiceType === 'writing' && (
        <div className="modal-animate"><Scratchpad onClose={() => setPracticeType(null)} /></div>
      )}
      {practiceType === 'math' && (
        <div className="modal-animate"><MathPractice onClose={() => setPracticeType(null)} /></div>
      )}
    </div>
  );
};

export default ReadingApp;
