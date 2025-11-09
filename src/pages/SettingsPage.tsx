import { useSimulationStore } from '../store/simulationStore';

export default function SettingsPage() {
  const { populations, worldConfig, updatePopulation, updateWorldConfig, resetToDefaults } = useSimulationStore();

  const handleResetAll = () => {
    if (confirm('Alle Einstellungen auf Standard-Werte zurücksetzen?\n\nDie gespeicherten Änderungen gehen verloren!')) {
      resetToDefaults();
      alert('✅ Alle Einstellungen wurden zurückgesetzt!');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Einstellungen</h2>
        <button
          onClick={handleResetAll}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
        >
          🔄 Alle auf Standard zurücksetzen
        </button>
      </div>
      
      {/* Info about auto-save */}
      <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-200">
          💾 <strong>Auto-Speicherung aktiv:</strong> Alle Änderungen werden automatisch gespeichert und bleiben nach einem Neustart erhalten.
        </p>
      </div>
      
      {/* World Settings */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Welt Einstellungen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nahrung Spawn Rate</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={worldConfig.foodSpawnRate}
              onChange={(e) => updateWorldConfig({ foodSpawnRate: parseFloat(e.target.value) })}
              className="w-full"
            />
            <span className="text-sm text-gray-400">{worldConfig.foodSpawnRate.toFixed(1)}</span>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Nahrung</label>
            <input
              type="range"
              min="50"
              max="500"
              step="10"
              value={worldConfig.maxFoodCount}
              onChange={(e) => updateWorldConfig({ maxFoodCount: parseInt(e.target.value) })}
              className="w-full"
            />
            <span className="text-sm text-gray-400">{worldConfig.maxFoodCount}</span>
          </div>
        </div>
      </div>

      {/* Population Settings */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Populationen</h3>
        {populations.map((population) => (
          <div key={population.id} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div
                className="w-6 h-6 rounded-full mr-3"
                style={{ backgroundColor: population.color }}
              />
              <h4 className="text-lg font-semibold">{population.name}</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Anzahl</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={population.initialCount}
                  onChange={(e) =>
                    updatePopulation(population.id, { initialCount: parseInt(e.target.value) })
                  }
                  className="w-full bg-gray-700 rounded px-3 py-2"
                />
              </div>
              {/* More trait sliders will be added */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
