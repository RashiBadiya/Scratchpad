import React from 'react';
import ReadingApp from './components/ReadingApp';
import './App.css';

function App() {
  return (
    <div className="App">
      <ReadingApp />
      <footer className="footer">
        <span>Made with ❤️ for accessible learning | <a href="https://dyslexiaida.org/dysgraphia/" target="_blank" rel="noopener noreferrer">Learn about Dysgraphia</a> | <a href="https://www.understood.org/en/articles/understanding-dyscalculia" target="_blank" rel="noopener noreferrer">Dyscalculia Info</a></span>
      </footer>
    </div>
  );
}

export default App;
