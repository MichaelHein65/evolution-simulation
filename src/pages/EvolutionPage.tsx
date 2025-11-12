import { useSimulationStore } from '../store/simulationStore';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
);

export default function EvolutionPage() {
  const { statsHistory, populations } = useSimulationStore();

  // Debug: Prüfe ob totalOrganisms mit Summe der Populationen übereinstimmt
  if (statsHistory.length > 0) {
    const lastStat = statsHistory[statsHistory.length - 1];
    const sumOfPops = Object.values(lastStat.populationCounts).reduce((a, b) => a + b, 0);
    if (sumOfPops !== lastStat.totalOrganisms) {
      console.warn(`⚠️ Diskrepanz gefunden! Total: ${lastStat.totalOrganisms}, Summe: ${sumOfPops}`, lastStat);
    }
  }

  // Prepare data for population chart
  const populationData = {
    labels: statsHistory.map((stat) => stat.tick.toString()),
    datasets: populations.map((pop) => ({
      label: pop.name,
      data: statsHistory.map((stat) => stat.populationCounts[pop.id] || 0),
      borderColor: pop.color,
      backgroundColor: pop.color + '33', // Add transparency
      borderWidth: 2,
      tension: 0.4,
      fill: false,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#fff',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Populations-Entwicklung über Zeit (Mausrad zum Zoomen, Ziehen zum Verschieben)',
        color: '#fff',
        font: {
          size: 18,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.1,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x' as const,
        },
        pan: {
          enabled: true,
          mode: 'x' as const,
        },
        limits: {
          x: {
            min: 'original' as const,
            max: 'original' as const,
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Tick',
          color: '#9ca3af',
        },
        ticks: {
          color: '#9ca3af',
          maxTicksLimit: 20,
        },
        grid: {
          color: '#374151',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Anzahl Organismen',
          color: '#9ca3af',
        },
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: '#374151',
        },
        beginAtZero: true,
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  // Total organisms over time
  const totalData = {
    labels: statsHistory.map((stat) => stat.tick.toString()),
    datasets: [
      {
        label: 'Gesamt Organismen (aus Stats)',
        data: statsHistory.map((stat) => stat.totalOrganisms),
        borderColor: '#60a5fa',
        backgroundColor: '#60a5fa33',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Summe aller Populationen (berechnet)',
        data: statsHistory.map((stat) => {
          // Berechne Summe aller Populationen
          let sum = 0;
          for (const popId in stat.populationCounts) {
            sum += stat.populationCounts[popId] || 0;
          }
          return sum;
        }),
        borderColor: '#f97316',
        backgroundColor: '#f9731633',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        borderDash: [5, 5], // Gestrichelte Linie zum Vergleich
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-screen-2xl">
      <h2 className="text-3xl font-bold mb-6">Evolution Grafiken</h2>

      {statsHistory.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-400 text-xl mb-4">Noch keine Daten vorhanden</p>
          <p className="text-gray-500">
            Starte die Simulation auf der Simulation-Seite, um Daten zu sammeln.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Population Chart */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div style={{ height: '400px' }}>
              <Line data={populationData} options={options} />
            </div>
          </div>

          {/* Total Organisms Chart */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div style={{ height: '300px' }}>
              <Line
                data={totalData}
                options={{
                  ...options,
                  plugins: {
                    ...options.plugins,
                    title: {
                      ...options.plugins.title,
                      text: 'Gesamtpopulation über Zeit',
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Statistics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Aktuelle Tick</h3>
              <p className="text-3xl font-bold text-blue-400">
                {statsHistory[statsHistory.length - 1]?.tick || 0}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Aktuelle Population</h3>
              <p className="text-3xl font-bold text-green-400">
                {statsHistory[statsHistory.length - 1]?.totalOrganisms || 0}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Datenpunkte</h3>
              <p className="text-3xl font-bold text-purple-400">{statsHistory.length}</p>
            </div>
          </div>

          {/* Population Details */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Aktuelle Populationsverteilung</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {populations.map((pop) => {
                const currentCount =
                  statsHistory[statsHistory.length - 1]?.populationCounts[pop.id] || 0;
                const total = statsHistory[statsHistory.length - 1]?.totalOrganisms || 1;
                const percentage = ((currentCount / total) * 100).toFixed(1);

                return (
                  <div key={pop.id} className="text-center">
                    <div
                      className="w-16 h-16 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: pop.color }}
                    />
                    <p className="font-semibold">{pop.name}</p>
                    <p className="text-2xl font-bold" style={{ color: pop.color }}>
                      {currentCount}
                    </p>
                    <p className="text-sm text-gray-400">{percentage}%</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
