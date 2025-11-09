import { useSimulationStore } from '../store/simulationStore';
import { DEFAULT_POPULATIONS } from '../utils/constants';
import { OrganismTraits } from '../types';
import Tooltip from '../components/Tooltip';

export default function SettingsPage() {
  const { populations, worldConfig, updatePopulation, updateWorldConfig } = useSimulationStore();

  const resetPopulation = (populationId: string) => {
    const defaultPop = DEFAULT_POPULATIONS.find(p => p.id === populationId);
    if (defaultPop) {
      updatePopulation(populationId, {
        initialCount: defaultPop.initialCount,
        defaultTraits: { ...defaultPop.defaultTraits }
      });
    }
  };

  const resetAllSettings = () => {
    DEFAULT_POPULATIONS.forEach(defaultPop => {
      updatePopulation(defaultPop.id, {
        initialCount: defaultPop.initialCount,
        defaultTraits: { ...defaultPop.defaultTraits }
      });
    });
  };

  const updateTrait = (populationId: string, traitName: keyof OrganismTraits, value: number) => {
    const population = populations.find(p => p.id === populationId);
    if (population) {
      updatePopulation(populationId, {
        defaultTraits: {
          ...population.defaultTraits,
          [traitName]: value
        }
      });
    }
  };

  const traitDefinitions = [
    { 
      key: 'speed', 
      label: 'Geschwindigkeit', 
      min: 0, max: 100, step: 1,
      description: 'Bestimmt wie schnell sich der Organismus bewegt. Höhere Werte ermöglichen schnellere Bewegung, verbrauchen aber mehr Energie pro Tick.'
    },
    { 
      key: 'agility', 
      label: 'Wendigkeit', 
      min: 0, max: 100, step: 1,
      description: 'Beeinflusst wie schnell und präzise der Organismus die Richtung ändern kann. Wichtig für Ausweichmanöver und Jagd.'
    },
    { 
      key: 'maxEnergy', 
      label: 'Max Energie', 
      min: 0, max: 100, step: 1,
      description: 'Maximale Energiemenge die der Organismus speichern kann. Mehr Energie = längeres Überleben ohne Nahrung, aber auch größerer Körper.'
    },
    { 
      key: 'energyEfficiency', 
      label: 'Energie-Effizienz', 
      min: 0, max: 100, step: 1,
      description: 'Reduziert den Energieverbrauch bei Bewegung. Höhere Werte bedeuten sparsamer Energieverbrauch und längeres Überleben.'
    },
    { 
      key: 'maxAge', 
      label: 'Maximales Alter', 
      min: 0, max: 100, step: 1,
      description: 'Bestimmt wie viele Ticks ein Organismus maximal leben kann bevor er an Altersschwäche stirbt. Höheres Alter = mehr Reproduktionschancen.'
    },
    { 
      key: 'visionRange', 
      label: 'Sichtweite', 
      min: 0, max: 100, step: 1,
      description: 'Radius in dem der Organismus andere Organismen und Objekte wahrnehmen kann. Größere Sichtweite hilft bei Nahrungssuche und Gefahrenerkennung.'
    },
    { 
      key: 'foodDetection', 
      label: 'Nahrungserkennung', 
      min: 0, max: 100, step: 1,
      description: 'Fähigkeit Nahrung aus der Distanz zu erkennen und anzusteuern. Höhere Werte = bessere Nahrungssuche und schnelleres Wachstum der Population.'
    },
    { 
      key: 'reproductionRate', 
      label: 'Reproduktionsrate', 
      min: 0, max: 100, step: 1,
      description: 'Wahrscheinlichkeit pro Tick einen Reproduktionsversuch zu starten (wenn genug Energie vorhanden). Höher = schnelleres Populationswachstum.'
    },
    { 
      key: 'offspringCount', 
      label: 'Nachkommen-Anzahl', 
      min: 1, max: 5, step: 1,
      description: 'Anzahl der Nachkommen die bei einer erfolgreichen Reproduktion geboren werden. Mehr Nachkommen = schnelleres Wachstum aber höhere Energiekosten.'
    },
    { 
      key: 'aggression', 
      label: 'Aggression', 
      min: 0, max: 100, step: 1,
      description: 'Jägerverhalten: >50 = Organismus jagt schwächere Gegner bei niedrigem Energielevel. Höher = aggressivere Jagd, größerer Schaden. Jäger werden orange markiert. Erfolgreiche Angriffe geben Energie.'
    },
    { 
      key: 'size', 
      label: 'Größe', 
      min: 0, max: 100, step: 1,
      description: 'Visuelle und physische Größe des Organismus. Beeinflusst Sichtbarkeit, Kampfstärke (größer = mehr Schaden & Verteidigung) und Energieverbrauch (größer = mehr Verbrauch).'
    },
    { 
      key: 'socialBehavior', 
      label: 'Sozialverhalten', 
      min: 0, max: 100, step: 1,
      description: 'Schwarmverhalten: >30 = Organismus bewegt sich zu Verbündeten. >50 = starke Gruppenbildung. Gruppen mit 3+ Mitgliedern werden blau markiert. Hilft bei Verteidigung gegen Jäger.'
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-screen-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Einstellungen</h2>
        <button
          onClick={resetAllSettings}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-medium transition-colors"
        >
          ↻ Alle zurücksetzen
        </button>
      </div>
      
      {/* World Settings */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Welt Einstellungen</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div>
            <label className="block text-sm font-medium mb-2">Nahrung Energiewert</label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={worldConfig.foodEnergyValue}
              onChange={(e) => updateWorldConfig({ foodEnergyValue: parseInt(e.target.value) })}
              className="w-full"
            />
            <span className="text-sm text-gray-400">{worldConfig.foodEnergyValue}</span>
          </div>
        </div>
      </div>

      {/* Population Settings */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Populationen</h3>
        {populations.map((population) => (
          <div key={population.id} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div
                  className="w-6 h-6 rounded-full mr-3"
                  style={{ backgroundColor: population.color }}
                />
                <h4 className="text-lg font-semibold">{population.name}</h4>
              </div>
              <button
                onClick={() => resetPopulation(population.id)}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded text-sm transition-colors"
              >
                ↻ Reset
              </button>
            </div>

            {/* Initial Count */}
            <div className="mb-4 pb-4 border-b border-gray-700">
              <label className="block text-sm font-medium mb-2">Start Anzahl</label>
              <input
                type="number"
                min="0"
                max="50"
                value={population.initialCount}
                onChange={(e) =>
                  updatePopulation(population.id, { initialCount: parseInt(e.target.value) || 0 })
                }
                className="w-32 bg-gray-700 rounded px-3 py-2"
              />
            </div>

            {/* All Traits */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {traitDefinitions.map((trait) => (
                <div key={trait.key}>
                  <Tooltip content={trait.description}>
                    <label className="block text-sm font-medium mb-2 cursor-help">
                      {trait.label} ℹ️
                    </label>
                  </Tooltip>
                  <input
                    type="range"
                    min={trait.min}
                    max={trait.max}
                    step={trait.step}
                    value={population.defaultTraits[trait.key as keyof OrganismTraits]}
                    onChange={(e) =>
                      updateTrait(population.id, trait.key as keyof OrganismTraits, parseFloat(e.target.value))
                    }
                    className="w-full"
                  />
                  <span className="text-xs text-gray-400">
                    {population.defaultTraits[trait.key as keyof OrganismTraits]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
