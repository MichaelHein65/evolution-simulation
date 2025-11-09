// Simulation Store using Zustand with Web Worker
import { create } from 'zustand';
import type { Population, WorldConfig, PopulationStats } from '../types';
import { DEFAULT_POPULATIONS, DEFAULT_WORLD_CONFIG } from '../utils/constants';

// Import worker - Vite will handle this special syntax
// @ts-ignore
import SimulationWorkerUrl from '../workers/simulationWorker?worker&url';

// LocalStorage keys
const STORAGE_KEY_POPULATIONS = 'evolution-sim-populations';
const STORAGE_KEY_WORLD_CONFIG = 'evolution-sim-world-config';

// Load from localStorage
const loadPopulations = (): Population[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_POPULATIONS);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('✅ Loaded populations from localStorage');
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to load populations from localStorage:', error);
  }
  return DEFAULT_POPULATIONS;
};

const loadWorldConfig = (): WorldConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_WORLD_CONFIG);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('✅ Loaded world config from localStorage');
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to load world config from localStorage:', error);
  }
  return DEFAULT_WORLD_CONFIG;
};

// Save to localStorage
const savePopulations = (populations: Population[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_POPULATIONS, JSON.stringify(populations));
  } catch (error) {
    console.warn('Failed to save populations to localStorage:', error);
  }
};

const saveWorldConfig = (config: WorldConfig) => {
  try {
    localStorage.setItem(STORAGE_KEY_WORLD_CONFIG, JSON.stringify(config));
  } catch (error) {
    console.warn('Failed to save world config to localStorage:', error);
  }
};

interface SimulationStore {
  // Worker
  worker: Worker | null;
  
  // Simulation state
  running: boolean;
  speed: number;
  tick: number;
  populations: Population[];
  worldConfig: WorldConfig;
  statsHistory: PopulationStats[];
  
  // Render data received from worker
  renderData: {
    organisms: Array<{
      id: string;
      x: number;
      y: number;
      populationId: string;
      size: number;
      energy: number;
      maxEnergy: number;
      isHunting: boolean;
      nearbyAlliesCount: number;
    }>;
    food: Array<{
      x: number;
      y: number;
      energy: number;
    }>;
  } | null;

  // Actions
  initializeSimulation: () => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  setSpeed: (speed: number) => void;
  updatePopulation: (populationId: string, updates: Partial<Population>) => void;
  updateWorldConfig: (updates: Partial<WorldConfig>) => void;
  resetToDefaults: () => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  // Initial state - load from localStorage
  worker: null,
  running: false,
  speed: 1,
  tick: 0,
  populations: loadPopulations(),
  worldConfig: loadWorldConfig(),
  statsHistory: [],
  renderData: null,

  // Initialize simulation and worker
  initializeSimulation: () => {
    const { worker: existingWorker } = get();
    
    // Terminate existing worker if any
    if (existingWorker) {
      existingWorker.terminate();
    }

    // Create new worker
    const worker = new Worker(
      new URL('../workers/simulationWorker.ts', import.meta.url),
      { type: 'module' }
    );
    
    // Set up message handler
    worker.onmessage = (event: MessageEvent) => {
      const { type, payload } = event.data;
      
      switch (type) {
        case 'INITIALIZED':
          console.log('✅ Worker initialized successfully');
          break;
          
        case 'RENDER_DATA':
          set({ renderData: payload });
          break;
          
        case 'STATS':
          const { statsHistory } = get();
          
          // Ignore stats from tick 0 if we just reset (prevents stale stats after reset)
          if (statsHistory.length === 0 && payload.tick === 0) {
            console.log('🔄 Ignoring tick 0 stats after reset');
            break;
          }
          
          const newStats: PopulationStats = {
            tick: payload.tick,
            populationCounts: payload.populationCounts,
            averageTraits: {},
            totalOrganisms: payload.totalOrganisms,
          };
          set({
            tick: payload.tick,
            statsHistory: [...statsHistory.slice(-200), newStats],
          });
          break;
          
        case 'ERROR':
          console.error('❌ Worker error:', payload.message);
          break;
      }
    };

    // Initialize worker with populations and config
    worker.postMessage({
      type: 'INIT',
      payload: {
        populations: get().populations,
        worldConfig: get().worldConfig,
      },
    });

    set({
      worker,
      tick: 0,
      statsHistory: [],
      renderData: null,
      running: false,
    });
  },

  // Start simulation
  startSimulation: () => {
    const { worker } = get();
    if (!worker) {
      console.warn('Worker not initialized, initializing now...');
      get().initializeSimulation();
      return;
    }
    
    worker.postMessage({ type: 'START' });
    set({ running: true });
  },

  // Pause simulation
  pauseSimulation: () => {
    const { worker } = get();
    if (!worker) return;
    
    worker.postMessage({ type: 'STOP' });
    set({ running: false });
  },

  // Reset simulation
  resetSimulation: () => {
    const { worker } = get();
    if (!worker) return;
    
    worker.postMessage({
      type: 'RESET',
      payload: {
        populations: get().populations,
        worldConfig: get().worldConfig,
      },
    });
    
    set({
      running: false,
      tick: 0,
      statsHistory: [],
      renderData: null,
    });
  },

  // Set simulation speed
  setSpeed: (speed: number) => {
    const { worker } = get();
    
    set({ speed });
    
    if (worker) {
      worker.postMessage({
        type: 'SET_SPEED',
        payload: { speed },
      });
    }
  },

  // Update population (from settings)
  updatePopulation: (populationId: string, updates: Partial<Population>) => {
    const { populations, worker } = get();
    const updatedPopulations = populations.map((pop) =>
      pop.id === populationId ? { ...pop, ...updates } : pop
    );
    
    set({ populations: updatedPopulations });
    savePopulations(updatedPopulations); // Save to localStorage
    
    if (worker) {
      worker.postMessage({
        type: 'UPDATE_POPULATIONS',
        payload: { populations: updatedPopulations },
      });
    }
  },

  // Update world config (from settings)
  updateWorldConfig: (updates: Partial<WorldConfig>) => {
    const { worldConfig, worker } = get();
    const newConfig = { ...worldConfig, ...updates };
    
    set({ worldConfig: newConfig });
    saveWorldConfig(newConfig); // Save to localStorage
    
    if (worker) {
      worker.postMessage({
        type: 'UPDATE_WORLD_CONFIG',
        payload: { config: newConfig },
      });
    }
  },

  // Reset to default values
  resetToDefaults: () => {
    set({
      populations: DEFAULT_POPULATIONS,
      worldConfig: DEFAULT_WORLD_CONFIG,
    });
    savePopulations(DEFAULT_POPULATIONS);
    saveWorldConfig(DEFAULT_WORLD_CONFIG);
    
    const { worker } = get();
    if (worker) {
      worker.postMessage({
        type: 'UPDATE_POPULATIONS',
        payload: { populations: DEFAULT_POPULATIONS },
      });
      worker.postMessage({
        type: 'UPDATE_WORLD_CONFIG',
        payload: { config: DEFAULT_WORLD_CONFIG },
      });
    }
  },
}));
