import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './assets/css/App.css';
import Home from './Home';
import Assessment from './Assessment';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import StartAssessment from './components/StartAssessment';
import Recommendations from './components/Dashboard/Recommendations';
import Submission from './components/Submission';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/assessment/start" element={<StartAssessment />} />
        <Route path="/dashboard/recommendations" element={<Recommendations />} />
        <Route path="/assessments/submission" element={<Submission />} />
      </Routes>
    </Router>
  );
}

export default App;
