import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  const location = useLocation();
  return (
    <>
      {/* Global animated background */}
      <div className="kb-bg">
        <div className="kb-bg-grid" />
        <div className="kb-orb kb-orb-1" />
        <div className="kb-orb kb-orb-2" />
        <div className="kb-orb kb-orb-3" />
      </div>

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/register" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
