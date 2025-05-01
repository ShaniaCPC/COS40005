import React from 'react';
import { useDetections } from '../components/DetectionContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, ResponsiveContainer
} from 'recharts';

const CLASS_NAMES = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
  'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench',
  'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear'
];

const Details: React.FC = () => {
  const { detections } = useDetections();

  if (detections.length === 0) {
    return <p>No detection data available. Try uploading a video first.</p>;
  }

  // === Process detection data ===
  const classFrequency: Record<string, number> = {};
  const confidenceScores: number[] = [];
  const detectionsPerFrame: { frame: string; count: number }[] = [];

  detections.forEach((frame) => {
    const count = frame.detections.length;
    detectionsPerFrame.push({ frame: frame.frame, count });

    frame.detections.forEach((det: number[]) => {
      const clsIdx = Math.round(det[5]);
      const label = CLASS_NAMES[clsIdx] || `class-${clsIdx}`;
      classFrequency[label] = (classFrequency[label] || 0) + 1;
      confidenceScores.push(det[4]);
    });
  });

  const barData = Object.entries(classFrequency).map(([label, count]) => ({ label, count }));
  const lineData = detectionsPerFrame;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Detection Stats Dashboard</h2>

      {/* Class frequency bar chart */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Detection Frequency by Class</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per-frame detection line chart */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Objects Detected per Frame</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <XAxis dataKey="frame" />
            <YAxis />
            <Tooltip />
            <CartesianGrid stroke="#ccc" />
            <Line type="monotone" dataKey="count" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div style={{ marginTop: '2rem' }}>
        <h3>Summary</h3>
        <p><strong>Total Detections:</strong> {confidenceScores.length}</p>
        <p><strong>Average Confidence:</strong> {(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length).toFixed(2)}</p>
        <p><strong>Frames Analyzed:</strong> {detections.length}</p>
      </div>
    </div>
  );
};

export default Details;

