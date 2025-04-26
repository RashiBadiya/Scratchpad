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
  const [score, setScore] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set up canvas context
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    
    // Add touch event listeners with passive: false
    const options = { passive: false };
    
    canvas.addEventListener('touchstart', startDrawing, options);
    canvas.addEventListener('touchmove', draw, options);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);
    
    // Cleanup
    return () => {
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
      canvas.removeEventListener('touchcancel', stopDrawing);
    };
  }, []);

  const getCurrentContent = () => EXERCISES[exerciseType].content[currentIndex];

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Handle both mouse and touch events
    let clientX, clientY;
    
    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches[0]) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Apply scaling to maintain proper drawing coordinates
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault(); // Prevent scrolling on touch devices
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault(); // Prevent scrolling on touch devices
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);
    
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    
    setStrokeData(prev => [...prev, { x: coords.x, y: coords.y }]);
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
      setScore(null);
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
    const content = getCurrentContent().toLowerCase();
    let issues = [];
    let correctness = 0;

    // For single letters, use pattern matching
    if (exerciseType === 'letters' && LETTER_PATTERNS[content]) {
      const resampled = getResampledStroke(normalizedStrokes, LETTER_PATTERNS[content].length);
      const { avg, max } = getPatternDistance(resampled, LETTER_PATTERNS[content]);
      const patternScore = Math.max(0, 1 - avg / 0.09); // Stricter average threshold
      const maxScore = Math.max(0, 1 - max / 0.18); // Stricter max threshold
      const sizeScore = analysis.hasGoodSize ? 1 : 0.5;
      const spacingScore = analysis.hasGoodSpacing ? 1 : 0.5;
      const strokeScore = analysis.hasEnoughStrokes ? 1 : 0.5;
      // Weighted average, pattern must be strong to get high score
      correctness = Math.round((patternScore * 0.5 + maxScore * 0.15 + sizeScore * 0.15 + spacingScore * 0.1 + strokeScore * 0.1) * 100);
      setScore(correctness);

      if (!(avg < 0.09 && max < 0.18)) {
        issues.push("The letter shape doesn't closely match the expected pattern");
      }
      if (!analysis.hasGoodSize) {
        issues.push('Try to fill most of the box, but not too much');
      }
      if (!analysis.hasGoodSpacing) {
        issues.push('Keep your strokes evenly spaced');
      }
      if (!analysis.hasEnoughStrokes) {
        issues.push('Try using a few more strokes');
      }
      if (correctness >= 85) {
        setFeedback('✅ Excellent writing! Move on to the next exercise.');
      } else {
        setFeedback('❌ Keep practicing! ' + issues.join('. '));
      }
    } else {
      // For words and sentences, use a basic scoring
      const wordLength = content.length;
      const expectedStrokes = wordLength * 4;
      const sizeScore = analysis.hasGoodSize ? 1 : 0.5;
      const spacingScore = analysis.hasGoodSpacing ? 1 : 0.5;
      const strokeScore = strokeData.length >= expectedStrokes ? 1 : 0.5;
      correctness = Math.round((sizeScore * 0.4 + spacingScore * 0.4 + strokeScore * 0.2) * 100);
      setScore(correctness);

      if (strokeData.length < expectedStrokes) {
        issues.push(`Use more strokes - aim for about ${expectedStrokes} for this word`);
      }
      if (!analysis.hasGoodSize) {
        issues.push('Try to fill most of the box, but not too much');
      }
      if (!analysis.hasGoodSpacing) {
        issues.push('Keep your strokes evenly spaced');
      }
      if (correctness >= 85) {
        setFeedback('✅ Good job! Your writing looks neat.');
      } else {
        setFeedback('❌ Keep practicing! ' + issues.join('. '));
      }
    }
  };

  function getResampledStroke(strokes, numPoints = 32) {
    // Resample stroke points to a fixed number for better comparison
    if (strokes.length <= 2) return strokes;
    const resampled = [strokes[0]];
    let totalDist = 0;
    for (let i = 1; i < strokes.length; i++) {
      totalDist += Math.hypot(
        strokes[i].x - strokes[i - 1].x,
        strokes[i].y - strokes[i - 1].y
      );
    }
    const interval = totalDist / (numPoints - 1);
    let D = 0;
    for (let i = 1, prev = strokes[0]; i < strokes.length && resampled.length < numPoints; ) {
      const d = Math.hypot(strokes[i].x - prev.x, strokes[i].y - prev.y);
      if ((D + d) >= interval) {
        const t = (interval - D) / d;
        const nx = prev.x + t * (strokes[i].x - prev.x);
        const ny = prev.y + t * (strokes[i].y - prev.y);
        resampled.push({ x: nx, y: ny });
        prev = { x: nx, y: ny };
        D = 0;
      } else {
        D += d;
        prev = strokes[i];
        i++;
      }
    }
    while (resampled.length < numPoints) resampled.push(strokes[strokes.length - 1]);
    return resampled;
  }

  function getPatternDistance(strokes, pattern) {
    // Calculate average Euclidean distance between two point arrays
    if (strokes.length !== pattern.length) return Infinity;
    let sum = 0;
    let maxDist = 0;
    for (let i = 0; i < strokes.length; i++) {
      const d = Math.hypot(strokes[i].x - pattern[i][0], strokes[i].y - pattern[i][1]);
      sum += d;
      if (d > maxDist) maxDist = d;
    }
    // Return both average and maximum distance
    return { avg: sum / strokes.length, max: maxDist };
  }

  function isShapeSimilar(strokes, pattern, toleranceAvg = 0.09, toleranceMax = 0.18) {
    // Stricter: require both average and max distance to be within threshold
    const resampled = getResampledStroke(strokes, pattern.length);
    const { avg, max } = getPatternDistance(resampled, pattern);
    return avg < toleranceAvg && max < toleranceMax;
  }

  const checkPatternMatch = (strokes, pattern) => {
    if (!strokes || !pattern || strokes.length < pattern.length * 0.7) return false;
    return isShapeSimilar(strokes, pattern);
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
    setScore(null);
  };

  const changeExerciseType = (type) => {
    setExerciseType(type);
    setCurrentIndex(0);
    clearCanvas();
    setStrokeData([]);
    setFeedback('');
    setScore(null);
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
        {score !== null && (
          <div className="writing-score" style={{marginBottom: '8px', fontWeight: 'bold', color: score >= 85 ? '#388E3C' : '#F57C00'}}>
            Score: {score} / 100
          </div>
        )}
        
        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            style={{
              touchAction: 'none',
              width: '100%',
              maxWidth: '400px',
              height: 'auto',
              aspectRatio: '4/3',
              border: '2px solid #ccc',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9',
              WebkitUserSelect: 'none',
              userSelect: 'none',
            }}
          />
        </div>
        
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
