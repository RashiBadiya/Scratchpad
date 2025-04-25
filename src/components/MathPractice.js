import React, { useState, useEffect } from 'react';
import './MathPractice.css';

const MathPractice = ({ onClose }) => {
  const [problem, setProblem] = useState({ question: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [problemType, setProblemType] = useState('readNumber');
  const [difficulty, setDifficulty] = useState('easy');

  const generateNumberInRange = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const generateProblem = () => {
    let newProblem = { question: '', answer: 0 };
    
    switch (problemType) {
      case 'readNumber':
        const num = generateNumberInRange(difficulty === 'easy' ? 1 : 100, difficulty === 'easy' ? 100 : 1000);
        newProblem = {
          question: `What number is this? ${num}`,
          answer: num
        };
        break;
      case 'addition':
        const num1 = generateNumberInRange(difficulty === 'easy' ? 1 : 10, difficulty === 'easy' ? 10 : 100);
        const num2 = generateNumberInRange(difficulty === 'easy' ? 1 : 10, difficulty === 'easy' ? 10 : 100);
        newProblem = {
          question: `${num1} + ${num2} = ?`,
          answer: num1 + num2
        };
        break;
      case 'subtraction':
        const minuend = generateNumberInRange(difficulty === 'easy' ? 10 : 20, difficulty === 'easy' ? 20 : 100);
        const subtrahend = generateNumberInRange(1, minuend - 1);
        newProblem = {
          question: `${minuend} - ${subtrahend} = ?`,
          answer: minuend - subtrahend
        };
        break;
      case 'multiplication':
        const factor1 = generateNumberInRange(difficulty === 'easy' ? 1 : 2, difficulty === 'easy' ? 10 : 12);
        const factor2 = generateNumberInRange(difficulty === 'easy' ? 1 : 2, difficulty === 'easy' ? 10 : 12);
        newProblem = {
          question: `${factor1} × ${factor2} = ?`,
          answer: factor1 * factor2
        };
        break;
      case 'division':
        const divisor = generateNumberInRange(difficulty === 'easy' ? 2 : 3, difficulty === 'easy' ? 10 : 12);
        const quotient = generateNumberInRange(difficulty === 'easy' ? 1 : 2, difficulty === 'easy' ? 10 : 12);
        const dividend = divisor * quotient;
        newProblem = {
          question: `${dividend} ÷ ${divisor} = ?`,
          answer: quotient
        };
        break;
      case 'sequence':
        const start = generateNumberInRange(difficulty === 'easy' ? 1 : 5, difficulty === 'easy' ? 10 : 20);
        const step = generateNumberInRange(difficulty === 'easy' ? 1 : 2, difficulty === 'easy' ? 3 : 5);
        const sequence = Array.from({length: 4}, (_, i) => start + (step * i));
        newProblem = {
          question: `What comes next? ${sequence.join(', ')}, ?`,
          answer: start + (step * 4)
        };
        break;
      case 'comparison':
        const num1Compare = generateNumberInRange(difficulty === 'easy' ? 1 : 10, difficulty === 'easy' ? 50 : 100);
        const num2Compare = generateNumberInRange(difficulty === 'easy' ? 1 : 10, difficulty === 'easy' ? 50 : 100);
        newProblem = {
          question: `Which number is bigger? ${num1Compare} or ${num2Compare}?`,
          answer: Math.max(num1Compare, num2Compare)
        };
        break;
      default:
        break;
    }
    setProblem(newProblem);
    setUserAnswer('');
    setFeedback('');
  };

  useEffect(() => {
    generateProblem();
  }, [problemType, difficulty]);

  const handleKeyPress = (value) => {
    if (value === 'clear') {
      setUserAnswer('');
    } else if (value === 'submit') {
      checkAnswer();
    } else {
      setUserAnswer(prev => prev + value);
    }
  };

  const checkAnswer = () => {
    if (!userAnswer) {
      setFeedback('⚠️ Please enter an answer first!');
      return;
    }

    const isCorrect = parseInt(userAnswer) === problem.answer;
    setTotalAttempts(prev => prev + 1);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      setFeedback('✅ Correct! Great job!' + (streak >= 2 ? ` ${streak + 1} in a row!` : ''));
    } else {
      setStreak(0);
      setFeedback(`❌ Not quite. The correct answer is ${problem.answer}. Try again!`);
    }
  };

  return (
    <div className="math-practice">
      <div className="practice-header">
        <h2>Math Practice</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="controls">
        <div className="control-group">
          <label>Practice Type:</label>
          <select 
            value={problemType} 
            onChange={(e) => setProblemType(e.target.value)}
          >
            <option value="readNumber">Number Reading</option>
            <option value="addition">Addition</option>
            <option value="subtraction">Subtraction</option>
            <option value="multiplication">Multiplication</option>
            <option value="division">Division</option>
            <option value="sequence">Number Sequences</option>
            <option value="comparison">Number Comparison</option>
          </select>
        </div>
        
        <div className="control-group">
          <label>Difficulty:</label>
          <select 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="easy">Easy</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="problem-area">
        <div className="stats">
          <div className="stat-item">
            <div className="stat-label">Score</div>
            <div className="stat-value">{score}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Accuracy</div>
            <div className="stat-value">
              {totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0}%
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Streak</div>
            <div className="stat-value">{streak}</div>
          </div>
        </div>

        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(score / 10) * 100}%` }}
            title="Progress to next level"
          />
        </div>

        <div className="problem">{problem.question}</div>
        
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Enter your answer"
          onFocus={() => setShowKeyboard(true)}
        />

        {showKeyboard && (
          <div className="virtual-keyboard">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button 
                key={num} 
                className="key"
                onClick={() => handleKeyPress(num.toString())}
              >
                {num}
              </button>
            ))}
            <button 
              className="key"
              onClick={() => handleKeyPress('0')}
            >
              0
            </button>
            <button 
              className="key"
              onClick={() => handleKeyPress('clear')}
            >
              ⌫
            </button>
            <button 
              className="key special"
              onClick={() => handleKeyPress('submit')}
            >
              Submit
            </button>
          </div>
        )}

        <div className="button-group">
          <button onClick={checkAnswer}>Check Answer</button>
          <button onClick={generateProblem}>Next Problem</button>
        </div>

        <div className={`feedback ${feedback.includes('✅') ? 'correct' : feedback.includes('⚠') ? 'warning' : 'incorrect'}`}>
          {feedback}
        </div>
      </div>
    </div>
  );
};

export default MathPractice;
