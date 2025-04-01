import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import HomePage from './pages/HomePage';
import NeighborhoodList from './pages/NeighborhoodList';
import BuildingsPage from './pages/BuildingsPage';
import RoomsPage from './pages/RoomsPage';
import PanoramaPage from './pages/PanoramaPage';
import AdminPage from './pages/AdminPage';
import ConsultationPage from './pages/ConsultationPage';

const App: React.FC = () => {
  return (
    <DataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/neighborhoods" element={<NeighborhoodList />} />
          <Route path="/neighborhoods/:neighborhoodId/buildings" element={<BuildingsPage />} />
          <Route path="/neighborhoods/:neighborhoodId/buildings/:buildingId/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:roomId/panorama" element={<PanoramaPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/consultation" element={<ConsultationPage />} />
        </Routes>
      </Router>
    </DataProvider>
  );
};

export default App; 