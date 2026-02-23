import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import ResultCard from './ResultCard';
import { useTheme } from '../theme/ThemeContext';
import './VideoUpload.css';

function VideoUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const { theme, mode, toggle } = useTheme();

  const onDrop = (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    setFile(acceptedFiles[0]);
    setResult(null);
    setError(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/x-msvideo': ['.avi'],
      'video/quicktime': ['.mov'],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) return;

    const MAX_MB = 100;
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File too large. Maximum is ${MAX_MB} MB.`);
      return;
    }

    setUploading(true);
    setUploadPct(0);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('file', file, file.name);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/detect/video',
        formData,
        {
          onUploadProgress: (e) => {
            const pct = Math.round((e.loaded * 100) / e.total);
            setUploadPct(pct);
          },
        }
      );

      setResult(response.data);

    } catch (err) {
      if (err.response) {
        setError(`Server error ${err.response.status}: ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        setError('No response from server. Is the backend running on port 8000?');
      } else {
        setError(err.message);
      }
    } finally {
      setUploading(false);
      setUploadPct(0);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.background,
        padding: '40px 20px',
        color: theme.text,
        textAlign: 'center',
        position: 'relative'
      }}
    >
      <h1>🔍 TruthLens</h1>

      <button
        onClick={toggle}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          color: theme.text,
          padding: '8px 16px',
          borderRadius: '20px',
          cursor: 'pointer',
          fontSize: '0.85em'
        }}
      >
        {mode === 'dark' ? '☀️ Light' : '🌙 Dark'}
      </button>

      <p className="subtitle">AI-Powered Deepfake Detection</p>

      {!result && (
        <>
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''}`}
          >
            <input {...getInputProps()} />
            {file ? (
              <p>📹 {file.name}</p>
            ) : isDragActive ? (
              <p>📂 Drop it here...</p>
            ) : (
              <p>📤 Drag video here or click to select</p>
            )}
          </div>

          <p className="file-info">
            Supports: MP4, AVI, MOV | Max 100 MB
          </p>

          {file && !uploading && (
            <>
              <p style={{ opacity: 0.6, fontSize: '0.85em', marginBottom: '12px' }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button onClick={handleUpload} className="upload-btn">
                🔍 Analyze Video
              </button>
            </>
          )}

          {uploading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>
                {uploadPct < 100
                  ? `Uploading... ${uploadPct}%`
                  : 'Analyzing frames... Please wait'}
              </p>

              <div
                style={{
                  width: '300px',
                  height: '6px',
                  background: theme.border,
                  borderRadius: '10px',
                  margin: '12px auto 0',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${uploadPct}%`,
                    height: '100%',
                    background: theme.primary,
                    borderRadius: '10px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}

      {error && (
        <div className="error-box">
          <h3>❌ Error</h3>
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {result && (
        <ResultCard result={result} onReset={handleReset} />
      )}
    </div>
  );
}

export default VideoUpload;