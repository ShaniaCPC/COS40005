import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import VideoUploader from './components/VideoUploader';
import Details from './components/Details';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<VideoUploader />} />
        <Route path="/details" element={<Details />} />
      </Routes>
    </Router>
  );
}

export default App
