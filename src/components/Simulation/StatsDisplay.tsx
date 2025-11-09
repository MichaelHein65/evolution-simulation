import { useSimulationStore } from '../../store/simulationStore';

export default function StatsDisplay() {
  const { tick, renderData, populations } = useSimulationStore();
  const totalOrganisms = renderData?.organisms.length || 0;
  const totalFood = renderData?.food.length || 0;
  
  // Calculate population counts from render data
  const populationCounts: Record<string, number> = {};
  renderData?.organisms.forEach((org) => {
    populationCounts[org.populationId] = (populationCounts[org.populationId] || 0) + 1;
  });

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">Statistiken</h3>

      <div className="space-y-2">
        {/* Tick Count */}
        <div className="flex justify-between">
          <span className="text-gray-400">Tick:</span>
          <span className="font-mono">{tick}</span>
        </div>

        {/* Total Organisms */}
        <div className="flex justify-between">
          <span className="text-gray-400">Gesamt Organismen:</span>
          <span className="font-mono">{totalOrganisms}</span>
        </div>

        {/* Total Food */}
        <div className="flex justify-between">
          <span className="text-gray-400">Nahrung:</span>
          <span className="font-mono">{totalFood}</span>
        </div>

        {/* Population Counts */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-semibold mb-2">Populationen:</h4>
          <div className="space-y-2">
            {populations.map((population) => {
              const count = populationCounts[population.id] || 0;
              return (
                <div key={population.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: population.color }}
                    />
                    <span className="text-sm">{population.name}</span>
                  </div>
                  <span className="font-mono text-sm">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual Indicators Legend */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-semibold mb-2">Visuelle Indikatoren:</h4>
          <div className="space-y-1 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-red-500"></div>
              <span>Rot: Wenig Energie (&lt;30%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-orange-500"></div>
              <span>Orange: Jagt (Aggression &gt;50)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-blue-400"></div>
              <span>Blau: In Gruppe (3+ Verbündete)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
