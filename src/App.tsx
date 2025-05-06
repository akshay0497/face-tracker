import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { db, seedDatabase } from './db/db';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import RegisterEmployee from './pages/RegisterEmployee';
import ViewEmployees from './pages/ViewEmployees';
import Attendance from './pages/Attendance';

function App() {
  // Initialize the database with sample data
  useEffect(() => {
    seedDatabase();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="register" element={<RegisterEmployee />} />
          <Route path="employees" element={<ViewEmployees />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;