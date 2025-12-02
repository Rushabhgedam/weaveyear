import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../../services/firebase';
import './LandingPage.css';

interface LandingPageProps {
  user: User | null;
  hasCustomizations: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ user, hasCustomizations }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showContent, setShowContent] = useState<boolean>(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  // Initial loading animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Cursor following effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const currentUser = result.user;

      // Save user profile to Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.error('Error signing in:', err);
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Error signing out:', err);
      setError(err.message || 'Failed to sign out. Please try again.');
    }
  };

  const handleCreateCalendar = () => {
    navigate('/customize');
  };

  const handleViewCalendar = () => {
    navigate('/preview', { state: { viewOnly: true } });
  };

  return (
    <div className={`landing-page ${showContent ? 'show' : ''}`}>
      {/* Cursor following effect */}
      <div
        className="cursor-follower"
        style={{
          left: `${cursorPosition.x}px`,
          top: `${cursorPosition.y}px`,
        }}
      />

      {/* Animated background gradients */}
      <div className="gradient-bg">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
        <div className="gradient-orb gradient-orb-3"></div>
      </div>

      <div className="landing-content">
        <header className="hero">
          <div className="hero-inner">
            <h1 className="hero-title">
              <span className="title-line">Weave Your</span>
              <span className="title-line title-highlight">Perfect Year</span>
            </h1>
            <p className="hero-subtitle">
              Create personalized calendars with day, week, and month planners.
              Sync with Google Calendar, track moon phases, and celebrate holidays.
            </p>

            {error && <div className="error-message">{error}</div>}

            <div className="hero-actions">
              {user ? (
                <>
                  {hasCustomizations && (
                    <button
                      className="primary-btn"
                      onClick={handleViewCalendar}
                      style={{ marginRight: '1rem' }}
                    >
                      <span className="btn-icon">👁️</span>
                      <span>View Calendar</span>
                    </button>
                  )}
                  <button
                    className={hasCustomizations ? "secondary-btn" : "primary-btn"}
                    onClick={handleCreateCalendar}
                  >
                    <span className="btn-icon">📅</span>
                    <span>{hasCustomizations ? "Edit Calendar" : "Create Custom Calendar"}</span>
                  </button>
                  <button
                    className="secondary-btn"
                    onClick={handleLogout}
                  >
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button
                  className="primary-btn google-btn"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  {loading ? (
                    <span>Signing in...</span>
                  ) : (
                    <>
                      <svg className="google-icon" viewBox="0 0 24 24" aria-hidden>
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span>Sign in with Google</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {!user && (
              <p className="privacy-note">
                By signing in, you agree to sync your calendar with Google Calendar
              </p>
            )}
          </div>
        </header>

        <section className="features">
          <div className="features-inner">
            <h2 className="features-title">Powerful Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🗓️</div>
                <h3>Custom Week Start</h3>
                <p>Choose Sunday or Monday as the first day of the week</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📋</div>
                <h3>Day/Week/Month Planners</h3>
                <p>Set recurring tasks for days, weeks, and months</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎉</div>
                <h3>Holiday Integration</h3>
                <p>Automatically include government holidays based on your country</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🌙</div>
                <h3>Moon Phase Tracking</h3>
                <p>Highlight Poornima, Amavasya, and Ekadashi dates</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔄</div>
                <h3>Google Calendar Sync</h3>
                <p>Sync all tasks and events to Google Calendar</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📤</div>
                <h3>Export Options</h3>
                <p>PDF export, PNG/JPG for posters, and paperback ordering</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
