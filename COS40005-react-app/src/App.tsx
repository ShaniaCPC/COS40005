import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import VideoUploader from './components/VideoUploader';
import Details from './components/Details';
import { DetectionProvider } from './components/DetectionContext';


function App() {

  return (
    <DetectionProvider>
    <Router>
      <Routes>
        <Route path="/" element={<VideoUploader />} />
        <Route path="/details" element={<Details />} />
      </Routes>
    </Router>
    </DetectionProvider>  
  );
}

export default App
