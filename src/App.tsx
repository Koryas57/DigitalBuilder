import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ExperienceShell } from './components/experience/ExperienceShell';
import { MapBuilder } from './components/mapBuilder/MapBuilder';
import { Home } from './pages/Home';
import { ProjectsList } from './pages/ProjectList/ProjectsList';
import { Skills } from './pages/Skills/Skills';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';


export const App: React.FC = () => {


  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<ExperienceShell />} />
        <Route path="/legacy" element={<Home />} />
        <Route path="/map-builder" element={<MapBuilder />} />
        <Route path="/projects" element={<ProjectsList />} />
        <Route path="/skills" element={<Skills />} />
      </Routes>
    </Router>
  );
};
