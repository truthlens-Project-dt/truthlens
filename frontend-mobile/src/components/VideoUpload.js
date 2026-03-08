import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import ResultCard from './ResultCard';
import HistoryPanel from './HistoryPanel';
import StatsPage from './StatsPage';
import './VideoUpload.css';

function VideoUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [modelInfo, setModelInfo] = useState(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8000/api/v1/health')
      .then(r => setModelInfo(r.data))
      .catch(() => {});
  }, []);

  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const uploadFile = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/upload',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (event) => {
            const percent = Math.round((event.loaded * 100) / event.total);
            setProgress(percent);
          },
        }
      );
      setResults(response.data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="video-upload-container" style={{ position: 'relative' }}>

      {!showStats && (
        <button
          onClick={() => setShowStats(true)}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.85em'
          }}
        >
          📊 Stats
        </button>
      )}

      {showStats ? (
        <StatsPage onBack={() => setShowStats(false)} />
      ) : (
        <>
          <div {...getRootProps({ className: 'dropzone' })}>
            <input {...getInputProps()} />
            <p className="subtitle">
              Drag & drop a video file here, or click to select one
            </p>

            {modelInfo && (
              <div style={{
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '10px 20px',
                marginBottom: '10px',
                fontSize: '0.8em',
                color: 'rgba(255,255,255,0.65)',
                display: 'inline-block'
              }}>
                🤖 {modelInfo.components?.model_type || 'Model'} &nbsp;|&nbsp;
                {modelInfo.components?.checkpoint} &nbsp;|&nbsp;
                {modelInfo.session?.detections_this_session} detections this session
              </div>
            )}

            <HistoryPanel />
          </div>

          {file && (
            <div className="upload-controls">
              <button onClick={uploadFile} disabled={uploading}>
                {uploading ? `Uploading ${progress}%` : 'Upload'}
              </button>
            </div>
          )}

          {results.length > 0 && (
            <div className="results">
              {results.map((res, index) => (
                <ResultCard key={index} result={res} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default VideoUpload;