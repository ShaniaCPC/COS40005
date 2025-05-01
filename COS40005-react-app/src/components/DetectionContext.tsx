import { createContext, useContext, useState } from 'react';

type Detection = {
  frame: string;
  detections: number[][];
  url: string;
};

type DetectionContextType = {
  detections: Detection[];
  setDetections: React.Dispatch<React.SetStateAction<Detection[]>>;
};

const DetectionContext = createContext<DetectionContextType | undefined>(undefined);

export const DetectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [detections, setDetections] = useState<Detection[]>([]);
  return (
    <DetectionContext.Provider value={{ detections, setDetections }}>
      {children}
    </DetectionContext.Provider>
  );
};

export const useDetections = () => {
  const context = useContext(DetectionContext);
  if (!context) throw new Error('useDetections must be used within a DetectionProvider');
  return context;
};

