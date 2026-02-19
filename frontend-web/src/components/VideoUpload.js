import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import './VideoUpload.css';

function VideoUpload() {
  const [file, setFile]           = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState(null);

  // Handle file drop or select
  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    setFile(acceptedFiles[0]);
    setResult(null);   // clear old result
    setError(null);    // clear old error
    console.log('File selected:', acceptedFiles[0].name);
  };

  // Dropzone setup
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4':       ['.mp4'],
      'video/x-msvideo': ['.avi'],
      'video/quicktime': ['.mov'],
    },
    maxFiles: 1,
  });

  // Upload to backend
  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);
    setError(null);

    // ✅ THE FIX: Send as FormData with correct field name
    const formData = new FormData();
    formData.append('file', file, file.name);  // field name must be 'file'

    try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/detect/video',
        formData,
        {
          headers: {
            // ✅ Let browser set Content-Type automatically
            // DO NOT manually set 'Content-Type': 'multipart/form-data'
            // (axios does this correctly with the boundary)
          },
          // Show upload progress
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percent}%`);
          },
        }
      );

      setResult(response.data);
      console.log('✅ Result:', response.data);

    } catch (err) {
      console.error('❌ Error:', err);

      // Show detailed error message
      if (err.response) {
        // Server responded with error
        setError(`Server error ${err.response.status}: ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        // No response received
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

      {/* Upload Zone */}
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

      {/* File info */}
      {file && (
        <p className="file-info">
          Size: {(file.size / 1024 / 1024).toFixed(2)} MB &nbsp;|&nbsp;
          Type: {file.type}
        </p>
      )}

      {/* Analyze Button */}
      {file && !uploading && (
        <button onClick={handleUpload} className="upload-btn">
          🔍 Analyze Video
        </button>
      )}

      {/* Loading */}
      {uploading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Analyzing... Please wait</p>
        </div>
      )}

      {/* Error display - now shows full error */}
      {error && (
        <div className="error-box">
          <h3>❌ Error</h3>
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`result result-${result.verdict?.toLowerCase()}`}>
          <h2>
            {result.verdict === 'AUTHENTIC' && '✅'}
            {result.verdict === 'FAKE'      && '❌'}
            {result.verdict === 'SUSPICIOUS'&& '⚠️'}
            {result.verdict === 'NO_FACES'  && '👤'}
            &nbsp;{result.verdict}
          </h2>

          <div className="result-details">
            <div className="detail">
              <span>Confidence</span>
              <strong>{(result.confidence * 100).toFixed(1)}%</strong>
            </div>
            <div className="detail">
              <span>Fake Probability</span>
              <strong>{(result.fake_probability * 100).toFixed(1)}%</strong>
            </div>
            <div className="detail">
              <span>Frames Analyzed</span>
              <strong>{result.frames_analyzed}</strong>
            </div>
            <div className="detail">
              <span>Total Frames</span>
              <strong>{result.total_frames}</strong>
            </div>
          </div>

          <p className="filename">📁 {result.filename}</p>
        </div>
      )}
    </div>
  );
}

export default VideoUpload;