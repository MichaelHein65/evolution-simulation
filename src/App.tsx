import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SimulationPage from './pages/SimulationPage';
import EvolutionPage from './pages/EvolutionPage';
import SettingsPage2 from './pages/SettingsPage2';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Navigation */}
        <nav className="bg-gray-800 border-b border-gray-700">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-2xl font-bold text-blue-400">Evolution Simulation</h1>
              <div className="flex space-x-4">
                <Link
                  to="/"
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
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<SimulationPage />} />
          <Route path="/evolution" element={<EvolutionPage />} />
          <Route path="/settings" element={<SettingsPage2 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
