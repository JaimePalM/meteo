import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PublicDisplay } from './pages/PublicDisplay';
import { RiverDisplay } from './pages/RiverDisplay';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoginForm } from './components/LoginForm';
import { PrivateRoute } from './components/PrivateRoute';
import { Carousel } from './components/Carousel';
import './App.css';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLoginSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Router>
      <Routes>
        {/* Public display - no auth needed, rotates every 10s */}
        <Route
          path="/"
          element={
            <Carousel interval={10000}>
              <PublicDisplay key={refreshKey} />
              <RiverDisplay />
            </Carousel>
          }
        />

        {/* Admin login */}
        <Route
          path="/admin"
          element={
            localStorage.getItem('token') ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <LoginForm onSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Admin dashboard - protected */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard key={refreshKey} />
            </PrivateRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
