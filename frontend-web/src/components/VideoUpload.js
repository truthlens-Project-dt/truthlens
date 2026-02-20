import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import './VideoUpload.css';

function VideoUpload() {
  const [file, setFile]           = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState(null);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    setFile(acceptedFiles[0]);
    setResult(null);
    setError(null);
    console.log('File selected:', acceptedFiles[0].name);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4':       ['.mp4'],
      'video/x-msvideo': ['.avi'],
      'video/quicktime': ['.mov'],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) return;

    const MAX_MB = 100;
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${MAX_MB} MB.`);
      return;
    }

    setUploading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('file', file, file.name);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/detect/video',
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percent}%`);
          },
        }
      );

      setResult(response.data);
      console.log('Result:', response.data);

    } catch (err) {
      console.error('Error:', err);

      if (err.response) {
        setError(
          `Server error ${err.response.status}: ${JSON.stringify(err.response.data)}`
        );
      } else if (err.request) {
        setError('No response from server. Is backend running?');
      } else {
        setError(err.message);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container">
      <h1>🔍 TruthLens</h1>
      <p className="subtitle">AI-Powered Deepfake Detection</p>

      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        {file ? (
          <p>📹 Selected: {file.name}</p>
        ) : isDragActive ? (
          <p>📂 Drop it here...</p>
        ) : (
          <p>📤 Drag video here or click to select</p>
        )}
      </div>

      <p
        style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: '0.8em',
          marginTop: '8px',
        }}
      >
        Supports: MP4, AVI, MOV — Max 100 MB
      </p>

      {file && (
        <p className="file-info">
          Size: {(file.size / 1024 / 1024).toFixed(2)} MB | Type: {file.type}
        </p>
      )}

      {file && !uploading && (
        <button onClick={handleUpload} className="upload-btn">
          🔍 Analyze Video
        </button>
      )}

      {uploading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Analyzing... Please wait</p>
        </div>
      )}

      {error && (
        <div className="error-box">
          <h3>❌ Error</h3>
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {result && (
        <>
          <div
            className={`result result-${result.verdict?.toLowerCase()}`}
          >
            <h2>
              {result.verdict === 'AUTHENTIC' && '✅'}
              {result.verdict === 'FAKE' && '❌'}
              {result.verdict === 'SUSPICIOUS' && '⚠️'}
              {result.verdict === 'NO_FACES' && '👤'}
              &nbsp;{result.verdict}
            </h2>

            <div className="result-details">
              <div className="detail">
                <span>Confidence</span>
                <strong>
                  {(result.confidence * 100).toFixed(1)}%
                </strong>
              </div>

              <div className="detail">
                <span>Fake Probability</span>
                <strong>
                  {(result.fake_probability * 100).toFixed(1)}%
                </strong>
              </div>

              <div className="detail">
                <span>Frames Analyzed</span>
                <strong>{result.frames_analyzed}</strong>
              </div>

              <div className="detail">
                <span>Total Frames</span>
                <strong>{result.total_frames}</strong>
              </div>

              {result.processing_time_sec !== undefined && (
                <div className="detail">
                  <span>Processing Time</span>
                  <strong>
                    {result.processing_time_sec}s
                  </strong>
                </div>
              )}
            </div>

            <p className="filename">📁 {result.filename}</p>
          </div>

          <button
            onClick={() => {
              setFile(null);
              setResult(null);
            }}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'rgba(255,255,255,0.7)',
              padding: '10px 30px',
              borderRadius: '25px',
              cursor: 'pointer',
              marginTop: '10px',
              fontSize: '0.9em',
            }}
          >
            🔄 Try Another Video
          </button>
        </>
      )}
    </div>
  );
}

export default VideoUpload;