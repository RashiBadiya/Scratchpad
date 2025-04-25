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
      <div className="reading-container">
        <h1>Reading Practice</h1>
        <div className="text-content">
          <p>{sampleText}</p>
        </div>
        <div className="practice-buttons">
          <button 
            className="practice-button writing"
            onClick={() => setPracticeType('writing')}
          >
            Practice Writing
            <span className="button-description">For Dysgraphia</span>
          </button>
          <button 
            className="practice-button math"
            onClick={() => setPracticeType('math')}
          >
            Practice Math
            <span className="button-description">For Dyscalculia</span>
          </button>
        </div>
      </div>

      {practiceType === 'writing' && (
        <Scratchpad onClose={() => setPracticeType(null)} />
      )}
      {practiceType === 'math' && (
        <MathPractice onClose={() => setPracticeType(null)} />
      )}
    </div>
  );
};

export default ReadingApp;
