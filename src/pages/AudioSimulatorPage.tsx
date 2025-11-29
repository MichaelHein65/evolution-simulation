import { Link } from 'react-router-dom';

export default function AudioSimulatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            🎵 Audio Simulator
          </h1>
          <p className="text-gray-400">
            Teste und optimiere die Sounds für die Evolution-Simulation
          </p>
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/simulation"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
          >
            ← Zurück zur Simulation
          </Link>
        </div>

        {/* Embedded Audio Simulator */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 overflow-hidden">
          <iframe
            src="/evolution-simulation/audio-simulator/"
            className="w-full h-[80vh] border-0"
            title="Audio Simulator"
          />
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
          <h3 className="text-lg font-semibold text-purple-400 mb-2">💡 Tipps</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• <strong>Populationen:</strong> Klicke auf eine Population, um ihren charakteristischen Sound zu hören</li>
            <li>• <strong>Events:</strong> Teste die verschiedenen Ereignis-Sounds (Essen, Geburt, Tod, Kill)</li>
            <li>• <strong>Musik-Mix:</strong> Bewege die Slider, um zu hören wie sich die Musik bei unterschiedlichen Populationsverteilungen anhört</li>
            <li>• <strong>Simulations-Modus:</strong> Simuliert zufällige Events um das Gesamterlebnis zu testen</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
