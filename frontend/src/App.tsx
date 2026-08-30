import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoginForm } from './components/LoginForm';
import { PrivateRoute } from './components/PrivateRoute';
import { Carousel } from './components/Carousel';
import { Panel1Logo } from './panels/meteoescuela/Panel1Logo';
import { Panel2 } from './panels/meteoescuela/Panel2';
import { Panel3Dashboard } from './panels/meteoescuela/Panel3Dashboard';
import { Panel4TempChart } from './panels/meteoescuela/Panel4TempChart';
import { Panel5PrecipChart } from './panels/meteoescuela/Panel5PrecipChart';
import { CentinelasImagePanel } from './panels/centinelas/CentinelasImagePanel';
import { Panel13Dashboard } from './panels/centinelas/Panel13Dashboard';
import { POMImagePanel } from './panels/pom/POMImagePanel';
import { Panel16SeaTemp } from './panels/pom/Panel16SeaTemp';
import { Panel17Logos } from './panels/rios/Panel17Logos';
import { Panel18Placeholder } from './panels/rios/Panel18Placeholder';
import { Panel19Dashboard } from './panels/rios/Panel19Dashboard';
import { Panel20Placeholder } from './panels/rios/Panel20Placeholder';
import { PublicDataProvider } from './context/PublicDataContext';
import './App.css';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLoginSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const autoPlay = import.meta.env.VITE_CAROUSEL_AUTOPLAY !== 'false';
  const panelNames = Array.from({ length: 20 }, (_, i) => `${i + 1}`);

  return (
    <Router>
      <Routes>
        {/* Public display - rotates every 10s, can be disabled via VITE_CAROUSEL_AUTOPLAY=false */}
        <Route
          path="/"
          element={
            <PublicDataProvider>
            <Carousel interval={10000} autoPlay={autoPlay} panelNames={panelNames}>
              <Panel1Logo key={refreshKey} />
              <Panel2 />
              <Panel3Dashboard />
              <Panel4TempChart />
              <Panel5PrecipChart />
              <CentinelasImagePanel panelNum={6} />
              <CentinelasImagePanel panelNum={7} />
              <CentinelasImagePanel panelNum={8} />
              <CentinelasImagePanel panelNum={9} />
              <CentinelasImagePanel panelNum={10} />
              <CentinelasImagePanel panelNum={11} />
              <CentinelasImagePanel panelNum={12} />
              <Panel13Dashboard />
              <POMImagePanel panelNum={14} />
              <POMImagePanel panelNum={15} />
              <Panel16SeaTemp />
              <Panel17Logos />
              <Panel18Placeholder />
              <Panel19Dashboard />
              <Panel20Placeholder />
            </Carousel>
            </PublicDataProvider>
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
