import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🔍 TruthLens</h1>
        <p>AI-Powered Deepfake Detection</p>
        
        <div className="upload-section">
          <button className="upload-btn">
            📤 Upload Video
          </button>
          <p className="info-text">
            Supported: MP4, AVI, MOV (Max 5 min)
          </p>
        </div>

        <div className="features">
          <div className="feature">
            <h3>🎯 90% Accuracy</h3>
            <p>State-of-the-art AI models</p>
          </div>
          <div className="feature">
            <h3>⚡ Fast</h3>
            <p>&lt;5 seconds processing</p>
          </div>
          <div className="feature">
            <h3>🔒 Secure</h3>
            <p>Videos deleted after analysis</p>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
