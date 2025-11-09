import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useSimulationStore } from './store/simulationStore';
import SimulationCanvas2 from './components/Simulation/SimulationCanvas2';
import LandingPage from './pages/LandingPage';
import SimulationPage from './pages/SimulationPage';
import EvolutionPage from './pages/EvolutionPage';
import SettingsPage2 from './pages/SettingsPage2';
import HelpPage from './pages/HelpPage';
import './index.css';

function AppContent() {
  const location = useLocation();
  const { initializeSimulation, worker } = useSimulationStore();
  const initializedRef = useRef<boolean>(false);

  // Initialize simulation once when entering simulation page
  useEffect(() => {
    if (location.pathname === '/simulation' && !initializedRef.current && !worker) {
      console.log('🚀 Initialisiere Simulation mit Web Worker...');
      initializeSimulation();
      initializedRef.current = true;
    }
  }, [location.pathname, initializeSimulation, worker]);

  // Show navigation only on simulation/evolution/settings pages, not on landing
  const showNavigation = location.pathname !== '/';

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation - nur auf internen Seiten */}
      {showNavigation && (
        <nav className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700 shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
                Evolution Simulation
              </Link>
              <div className="flex space-x-4">
                <Link
                  to="/simulation"
                  className="px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Simulation
                </Link>
                <Link
                  to="/evolution"
                  className="px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Evolution
                </Link>
                <Link
                  to="/settings"
                  className="px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Einstellungen
                </Link>
                <Link
                  to="/help"
                  className="px-4 py-2 rounded hover:bg-gray-700 transition-colors flex items-center gap-1"
                >
                  <span>🤖</span> Hilfe
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Routes */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/simulation" element={
          <>
            <div className="container mx-auto px-4 py-4 max-w-screen-2xl">
              <SimulationCanvas2 />
            </div>
            <SimulationPage />
          </>
        } />
        <Route path="/evolution" element={<EvolutionPage />} />
        <Route path="/settings" element={<SettingsPage2 />} />
        <Route path="/help" element={<HelpPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router basename="/evolution-simulation">
      <AppContent />
    </Router>
  );
}

export default App;
