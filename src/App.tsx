import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/firebase';
import LandingPage from './components/LandingPage/LandingPage';
import CustomizationForm from './components/CustomizationForm';
import CalendarPreview from './components/CalendarPreview';
import ExportOptions from './components/ExportOptions';
import { CalendarCustomizations } from './services/calendarGenerator';
import './App.css';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [customizations, setCustomizations] = useState<CalendarCustomizations | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Load customizations from localStorage
    const savedCustomizations = localStorage.getItem('calendarCustomizations');
    if (savedCustomizations) {
      try {
        setCustomizations(JSON.parse(savedCustomizations));
      } catch (error) {
        console.error('Error loading customizations:', error);
      }
    }

    return () => unsubscribe();
  }, []);

  // Cursor following effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleCustomizationsChange = (newCustomizations: CalendarCustomizations) => {
    setCustomizations(newCustomizations);
    localStorage.setItem('calendarCustomizations', JSON.stringify(newCustomizations));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router basename="/weaveyear">
      <div className="App">
        {/* Cursor following effect */}
        <div
          className="app-cursor-follower"
          style={{
            left: `${cursorPosition.x}px`,
            top: `${cursorPosition.y}px`,
          }}
        />

        {/* Animated background gradients */}
        <div className="app-gradient-bg">
          <div className="app-gradient-orb app-gradient-orb-1"></div>
          <div className="app-gradient-orb app-gradient-orb-2"></div>
          <div className="app-gradient-orb app-gradient-orb-3"></div>
        </div>

        <div className="app-content">
          <Routes>
            <Route
              path="/"
              element={<LandingPage user={user} hasCustomizations={!!customizations} />}
            />
            <Route
              path="/customize"
              element={
                user ? (
                  <CustomizationForm
                    customizations={customizations}
                    onCustomizationsChange={handleCustomizationsChange}
                  />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/preview"
              element={
                user && customizations ? (
                  <CalendarPreview
                    customizations={customizations}
                    deferredPrompt={deferredPrompt}
                  />
                ) : (
                  <Navigate to="/customize" />
                )
              }
            />
            <Route
              path="/export"
              element={
                user && customizations ? (
                  <ExportOptions customizations={customizations} />
                ) : (
                  <Navigate to="/customize" />
                )
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;

