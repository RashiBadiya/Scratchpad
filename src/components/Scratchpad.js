import React, { useRef, useEffect, useState } from 'react';
import './Scratchpad.css';

const LETTER_PATTERNS = {
  'a': [[0.2, 0.5], [0.4, 0.3], [0.6, 0.5], [0.4, 0.7], [0.2, 0.5]],
  'b': [[0.2, 0.3], [0.2, 0.7], [0.4, 0.7], [0.6, 0.6], [0.4, 0.5], [0.2, 0.5]],
  'c': [[0.6, 0.4], [0.4, 0.3], [0.2, 0.5], [0.4, 0.7], [0.6, 0.6]],
  'd': [[0.6, 0.3], [0.6, 0.7], [0.4, 0.7], [0.2, 0.5], [0.4, 0.3], [0.6, 0.3]],
  'e': [[0.6, 0.5], [0.4, 0.5], [0.2, 0.5], [0.4, 0.7], [0.6, 0.6]],
};

const EXERCISES = {
  letters: {
    title: 'Letter Practice',
    content: ['a', 'b', 'c', 'd', 'e'],
    description: 'Practice writing individual letters. Focus on proper letter formation and consistent size.'
  },
  capitals: {
    title: 'Capital Letters',
    content: ['A', 'B', 'C', 'D', 'E'],
    description: 'Practice capital letters. Pay attention to proper proportions and starting points.'
  },
  numbers: {
    title: 'Number Writing',
    content: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    description: 'Practice writing numbers clearly. Focus on proper formation and alignment.'
  },
  words: {
    title: 'Common Words',
    content: ['the', 'and', 'was', 'for', 'that'],
    description: 'Practice writing common words. Focus on letter spacing and word shape.'
  },
  shapes: {
    title: 'Basic Shapes',
    content: ['circle', 'square', 'triangle', 'line', 'curve'],
    description: 'Practice drawing basic shapes to improve hand control and spatial awareness.'
  },
  sentences: {
    title: 'Simple Sentences',
    content: [
      'The cat sat.',
      'I can run.',
      'She is happy.'
    ],
    description: 'Practice writing complete sentences. Focus on spacing between words and punctuation.'
  }
};

const Scratchpad = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [exerciseType, setExerciseType] = useState('letters');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [strokeData, setStrokeData] = useState([]);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
  }, []);

  const getCurrentContent = () => EXERCISES[exerciseType].content[currentIndex];

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    
    setStrokeData(prev => [...prev, { x, y }]);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const checkWriting = () => {
    if (strokeData.length === 0) {
      setFeedback('❌ Please write something before checking.');
      return;
    }

    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;

    // Normalize stroke data to 0-1 range
    const normalizedStrokes = strokeData.map(point => ({
      x: point.x / width,
      y: point.y / height
    }));

    // Analyze basic writing characteristics
    const analysis = analyzeWriting(normalizedStrokes);
    
    // Get current content and determine exercise type
    const content = getCurrentContent().toLowerCase();
    const pattern = LETTER_PATTERNS[content];
    
    // Initialize feedback messages
    const issues = [];
    
    // Check size
    if (!analysis.hasGoodSize) {
      issues.push('Your writing size needs adjustment - not too big or too small');
    }
    
    // Check spacing
    if (!analysis.hasGoodSpacing) {
      issues.push('Mind the spacing between strokes');
    }
    
    // Check stroke count
    if (!analysis.hasEnoughStrokes) {
      issues.push('Use more strokes to form the shape properly');
    }

    // Pattern matching for single letters
    if (pattern && content.length === 1) {
      const matchesPattern = checkPatternMatch(normalizedStrokes, pattern);
      if (!matchesPattern) {
        issues.push('The letter shape doesn\'t match the expected pattern');
      }
      
      // Only mark as correct if all checks pass
      if (matchesPattern && analysis.hasGoodSize && analysis.hasGoodSpacing && analysis.hasEnoughStrokes) {
        setFeedback('✅ Excellent writing! Move on to the next exercise.');
      } else {
        setFeedback('❌ Keep practicing! ' + issues.join('. '));
      }
    } else {
      // For words and sentences
      const wordLength = content.length;
      const expectedStrokes = wordLength * 5; // Rough estimate of strokes needed
      
      if (strokeData.length < expectedStrokes) {
        issues.push(`Use more strokes - aim for about ${expectedStrokes} for this word`);
      }
      
      if (issues.length === 0 && analysis.hasGoodSize && analysis.hasGoodSpacing) {
        setFeedback('✅ Good job! Your writing looks neat.');
      } else {
        setFeedback('❌ Keep practicing! ' + issues.join('. '));
      }
    }
  };

  const checkPatternMatch = (strokes, pattern) => {
    if (strokes.length < pattern.length * 3) return false;

    let matchCount = 0;
    let lastMatchIndex = -1;

    // Check each point in the pattern in sequence
    for (const targetPoint of pattern) {
      const [targetX, targetY] = targetPoint;
      let matched = false;
      
      // Look for a matching stroke point after the last match
      for (let i = lastMatchIndex + 1; i < strokes.length; i++) {
        const point = strokes[i];
        const dx = Math.abs(point.x - targetX);
        const dy = Math.abs(point.y - targetY);
        
        if (dx < 0.12 && dy < 0.12) { // 12% tolerance
          matched = true;
          lastMatchIndex = i;
          break;
        }
      }
      
      if (matched) matchCount++;
    }

    // Require 80% match and proper sequence
    return matchCount >= pattern.length * 0.8 && lastMatchIndex > -1
  };

  const analyzeWriting = (strokes) => {
    // Calculate various metrics
    const xCoords = strokes.map(p => p.x);
    const yCoords = strokes.map(p => p.y);
    const width = Math.max(...xCoords) - Math.min(...xCoords);
    const height = Math.max(...yCoords) - Math.min(...yCoords);

    // Check number of strokes
    const minStrokes = {
      letters: 5,
      capitals: 6,
      numbers: 4,
      words: 10,
      shapes: 8,
      sentences: 20
    }[exerciseType] || 5;

    return {
      hasEnoughStrokes: strokes.length >= minStrokes,
      hasGoodSize: width > 0.2 && width < 0.8 && height > 0.2 && height < 0.8,
      hasGoodSpacing: checkSpacing(strokes)
    };
  };

  const checkSpacing = (strokes) => {
    // Simple spacing check - ensure strokes aren't too clustered
    const clusters = [];
    let currentCluster = [strokes[0]];

    for (let i = 1; i < strokes.length; i++) {
      const prev = strokes[i - 1];
      const curr = strokes[i];
      const distance = Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
      );

      if (distance < 0.05) { // 5% of canvas size
        currentCluster.push(curr);
      } else if (currentCluster.length > 0) {
        clusters.push(currentCluster);
        currentCluster = [curr];
      }
    }

    // Check if any clusters are too large (indicating poor spacing)
    return !clusters.some(cluster => cluster.length > strokes.length * 0.3);
  };

  const nextExercise = () => {
    const nextIndex = (currentIndex + 1) % EXERCISES[exerciseType].content.length;
    setCurrentIndex(nextIndex);
    clearCanvas();
    setStrokeData([]);
    setFeedback('');
  };

  const changeExerciseType = (type) => {
    setExerciseType(type);
    setCurrentIndex(0);
    clearCanvas();
    setStrokeData([]);
    setFeedback('');
  };

  return (
    <div className="scratchpad">
      <div className="scratchpad-header">
        <h2>Writing Practice</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="exercise-controls">
        <select 
          value={exerciseType} 
          onChange={(e) => changeExerciseType(e.target.value)}
          className="exercise-select"
        >
          {Object.entries(EXERCISES).map(([key, { title }]) => (
            <option key={key} value={key}>{title}</option>
          ))}
        </select>
        <div className="exercise-description">
          {EXERCISES[exerciseType].description}
        </div>
      </div>

      <div className="practice-area">
        <div className="target-content" style={{ fontFamily: 'cursive' }}>
          Practice writing:<br/>
          <span className="content">{getCurrentContent()}</span>
        </div>
        
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
        />
        
        <div className="button-container">
          <button onClick={clearCanvas}>Clear</button>
          <button onClick={checkWriting}>Check Writing</button>
          <button onClick={nextExercise}>Next Exercise</button>
        </div>

        {feedback && (
          <div className={`feedback ${feedback.includes('✅') ? 'correct' : 'incorrect'}`}>
            {feedback}
          </div>
        )}

        <div className="tips">
          <h3>Tips for Good Writing:</h3>
          <ul>
            <li>Keep your letters consistent in size</li>
            <li>Write slowly and carefully</li>
            <li>Leave proper spacing between letters</li>
            <li>Practice the proper stroke order</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Scratchpad;
