import axios from 'axios';
import { ChangeEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDetections } from '../components/DetectionContext';
import './VideoUploader.css';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function VideoUploader() {
  const [video, setVideo] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [result, setResult] = useState('');

  const [accuracy, setAccuracy] = useState<number>(0);
  const [falsePositives, setFalsePositives] = useState<number | null>(null);
  const [accuracyGain, setAccuracyGain] = useState<number | null>(null);

  const navigate = useNavigate();
  const { setDetections } = useDetections();

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (preview) URL.revokeObjectURL(preview);

    setVideo(file);
    setPreview(URL.createObjectURL(file));
    setResult('');
    setStatus('idle');
    setUploadProgress(0);
  }

  function handleViewDetails() {
    navigate('/details');
  }

  async function handleFileUpload() {
    if (!video) return alert('Please select a video first.');

    const formData = new FormData();
    formData.append('video', video);

    try {
      setStatus('uploading');
      setUploadProgress(0);

      const response = await axios.post('http://localhost:5000/detect', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const progress = e.total ? Math.round((e.loaded * 100) / e.total) : 0;
          setUploadProgress(progress);
        },
      });

      setStatus('success');
      setUploadProgress(100);
      
      setResult(`Detected ${response.data.results.length} frame(s).`);
      setDetections(response.data.results);
      setAccuracy(response.data.accuracy);
      setFalsePositives(response.data.false_positives);
      setAccuracyGain(response.data.accuracy_gain);


    } catch (err) {
      console.error('Upload error:', err);
      setStatus('error');
      setResult('Error processing video.');
      setUploadProgress(0);
    }
  }

  return (
    <div className="video-uploader-container">
      <h2 className="upload-title">Upload Your Video for Detection</h2>

      <div className="video-input-container">
        <label htmlFor="video-upload" className="custom-upload-label">
          📁 Upload Video
        </label>
        <input
          type="file"
          id="video-upload"
          className="video-input"
          accept="video/*"
          onChange={handleFileChange}
        />
        <p className="supported-formats">Supported formats: mp4, avi, mov</p>
      </div>

      {video && (
        <div className="video-info">
          <p><strong>Video name:</strong> {video.name}</p>
          <p><strong>Size:</strong> {(video.size / (1024 * 1024)).toFixed(2)} MB</p>
          <p><strong>Type:</strong> {video.type}</p>
        </div>
      )}

      {preview && (
        <video key={preview} controls className="video-preview">
          <source src={preview} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {status === 'uploading' && (
        <div className="progress-container">
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
          </div>
          <p className="progess-text">{uploadProgress}% uploaded</p>
        </div>
      )}

      <button
        onClick={handleFileUpload}
        disabled={status === 'uploading' || !video}
        className="upload-button"
      >
        Detect Train
      </button>

      <div className="result-section">
        <h2 className="result-title">Detected Train Result</h2>
        <div className="result-content">
          {status === 'success' && <p className="success-message">{result}</p>}
          {status === 'error' && <p className="error-message">{result}</p>}
        </div>

        <section className="model-preformance">
          <button type="button" className="btn" onClick={handleViewDetails}>
            View Details
          </button>

          <div className="metrics">
            <div className="metric-card">
              <div className="metric-value">
                {typeof accuracy === 'number' ? `${accuracy.toFixed(1)}%` : 'N/A'}
              </div>
              <div className="metric-label">Detection Accuracy</div>
            </div>

            <div className="metric-card">
              <div className="metric-value">{falsePositives ?? 'N/A'}</div>
              <div className="metric-label">False Positives</div>
            </div>

            <div className="metric-card">
              <div className="metric-value">
                {accuracyGain !== null ? `${accuracyGain.toFixed(1)}%` : 'N/A'}
              </div>
              <div className="metric-label">Accuracy Gain</div>
            </div>
          </div>
        </section>
      </div>

      <section className="upload-progress">
        <div className="progress-bar-container">
          <div id="progressBar" className="progress-bar"></div>
        </div>
      </section>
    </div>
  );
}