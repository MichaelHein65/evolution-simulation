import { useSimulationStore } from '../../store/simulationStore';

export default function ControlPanel() {
  const { running, speed, startSimulation, pauseSimulation, resetSimulation, setSpeed } =
    useSimulationStore();

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">Steuerung</h3>

      {/* Play/Pause/Reset Buttons */}
      <div className="flex gap-2 mb-3">
        {!running ? (
          <button
            onClick={startSimulation}
            className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium transition-colors"
          >
            ▶ Start
          </button>
        ) : (
          <button
            onClick={pauseSimulation}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded font-medium transition-colors"
          >
            ⏸ Pause
          </button>
        )}
        <button
          onClick={resetSimulation}
          className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium transition-colors"
        >
          ↻ Reset
        </button>
      </div>

      {/* Speed Control */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Geschwindigkeit: {speed.toFixed(1)}x
        </label>
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
