// Web Worker for running simulation in separate thread
import { OrganismClass } from '../engine/Organism';
import { World } from '../engine/World';
import type { Population, WorldConfig } from '../types';

// Worker state
let world: World | null = null;
let isRunning = false;
let intervalId: number | null = null;
let speedMultiplier = 1;
let tickCounter = 0;
let renderFrameCounter = 0;

// Event tracking for audio
interface SimulationEvents {
  foodEaten: Array<{ populationId: string; x: number }>;
  births: Array<{ populationId: string; x: number }>;
  deaths: Array<{ populationId: string; x: number }>;
  kills: Array<{ attackerId: string; victimId: string; x: number }>;
}

let currentTickEvents: SimulationEvents = {
  foodEaten: [],
  births: [],
  deaths: [],
  kills: []
};

// Message types
export interface WorkerMessage {
  type: 'INIT' | 'START' | 'STOP' | 'RESET' | 'SET_SPEED' | 'UPDATE_POPULATIONS' | 'UPDATE_WORLD_CONFIG';
  payload?: any;
}

export interface WorkerResponse {
  type: 'STATS' | 'RENDER_DATA' | 'INITIALIZED' | 'ERROR' | 'EVENTS';
  payload?: any;
}

// Initialize simulation
function initializeSimulation(populations: Population[], worldConfig: WorldConfig) {
  try {
    world = new World(worldConfig);

    // Create initial organisms
    populations.forEach((population) => {
      for (let i = 0; i < 5; i++) {
        const organism = new OrganismClass(
          `${population.id}-${i}`,
          population.id,
          population.defaultTraits,
          Math.random() * worldConfig.width,
          Math.random() * worldConfig.height,
          population.defaultTraits.maxEnergy * 0.8
        );
        world!.organisms.push(organism);
      }
    });

    self.postMessage({
      type: 'INITIALIZED',
      payload: { success: true }
    } as WorkerResponse);
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      payload: { message: String(error) }
    } as WorkerResponse);
  }
}

// Main simulation loop
function simulationLoop() {
  if (!isRunning || !world) return;

  try {
    const startTime = performance.now();
    
    // Reset events for this tick
    currentTickEvents = {
      foodEaten: [],
      births: [],
      deaths: [],
      kills: []
    };
    
    // Track organisms before update for death detection
    const organismsBeforeUpdate = new Set(world.organisms.filter(o => o.alive).map(o => o.id));
    const organismCountBefore = world.organisms.length;
    
    // Update simulation
    const updateStart = performance.now();
    world.update();
    const updateTime = performance.now() - updateStart;
    tickCounter++;
    
    // Detect deaths (organisms that were alive before but not after)
    for (const org of world.organisms) {
      if (!org.alive && organismsBeforeUpdate.has(org.id)) {
        currentTickEvents.deaths.push({
          populationId: org.populationId,
          x: org.x
        });
      }
    }
    
    // Detect births (new organisms)
    if (world.organisms.length > organismCountBefore) {
      const newCount = world.organisms.length - organismCountBefore;
      // Get the last N organisms (the new ones)
      const newOrganisms = world.organisms.slice(-newCount);
      for (const org of newOrganisms) {
        currentTickEvents.births.push({
          populationId: org.populationId,
          x: org.x
        });
      }
    }
    
    // Get events from World (food eaten, kills)
    const worldEvents = world.getAndClearEvents();
    currentTickEvents.foodEaten = worldEvents.foodEaten;
    currentTickEvents.kills = worldEvents.kills;

    const stats = world.getStats();

    // Send render data only every 2nd frame to reduce overhead
    renderFrameCounter++;
    if (renderFrameCounter % 2 === 0) {
      const mapStart = performance.now();
      const renderData = {
        organisms: world.organisms.map(org => ({
          id: org.id,
          x: org.x,
          y: org.y,
          populationId: org.populationId,
          size: org.traits.size,
          energy: org.energy,
          maxEnergy: org.traits.maxEnergy,
          isHunting: org.isHunting,
          nearbyAlliesCount: org.nearbyAllies.length
        })),
        food: world.food.map(f => ({
          x: f.x,
          y: f.y,
          energy: f.energy
        }))
      };
      const mapTime = performance.now() - mapStart;

      const postStart = performance.now();
      self.postMessage({
        type: 'RENDER_DATA',
        payload: renderData
      } as WorkerResponse);
      const postTime = performance.now() - postStart;

      const totalTime = performance.now() - startTime;

      // Log performance every 60 ticks (~1 second)
      if (tickCounter % 60 === 0) {
        console.log(`[Worker] Tick ${tickCounter}: Total=${totalTime.toFixed(2)}ms (update=${updateTime.toFixed(2)}ms, map=${mapTime.toFixed(2)}ms, post=${postTime.toFixed(2)}ms) | Organisms=${world.organisms.length}, Food=${world.food.length}`);
      }
    }
    
    // Send events for audio (every frame for responsiveness)
    if (currentTickEvents.foodEaten.length > 0 || 
        currentTickEvents.births.length > 0 || 
        currentTickEvents.deaths.length > 0 || 
        currentTickEvents.kills.length > 0) {
      self.postMessage({
        type: 'EVENTS',
        payload: currentTickEvents
      } as WorkerResponse);
    }

    // Send stats every 10 ticks for more dynamic charts
    if (stats.tick % 10 === 0) {
      self.postMessage({
        type: 'STATS',
        payload: {
          tick: stats.tick,
          populationCounts: stats.populationCounts,
          totalOrganisms: stats.totalOrganisms
        }
      } as WorkerResponse);
    }
  } catch (error) {
    console.error('Worker simulation error:', error);
    stopSimulation();
  }
}

// Start simulation
function startSimulation() {
  if (!world) return;
  
  // Stop any existing interval
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
  
  isRunning = true;
  
  // Run at 60 FPS divided by speed multiplier
  const interval = (1000 / 60) / speedMultiplier;
  intervalId = self.setInterval(simulationLoop, interval);
}

// Stop simulation
function stopSimulation() {
  isRunning = false;
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

// Reset simulation
function resetSimulation(populations: Population[], worldConfig: WorldConfig) {
  stopSimulation();
  initializeSimulation(populations, worldConfig);
}

// Set speed multiplier
function setSpeed(speed: number) {
  speedMultiplier = speed;
  
  // Restart interval with new speed if running
  if (isRunning && world) {
    stopSimulation();
    startSimulation();
  }
}

// Update populations (for settings changes)
function updatePopulations(populations: Population[]) {
  if (!world) return;
  
  // Update existing organisms with new traits
  world.organisms.forEach(organism => {
    const population = populations.find(p => p.id === organism.populationId);
    if (population) {
      organism.traits = { ...population.defaultTraits };
    }
  });
}

// Update world config
function updateWorldConfig(config: WorldConfig) {
  if (!world) return;
  world.config = config;
}

// Message handler
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'INIT':
      initializeSimulation(payload.populations, payload.worldConfig);
      break;
    case 'START':
      startSimulation();
      break;
    case 'STOP':
      stopSimulation();
      break;
    case 'RESET':
      resetSimulation(payload.populations, payload.worldConfig);
      break;
    case 'SET_SPEED':
      setSpeed(payload.speed);
      break;
    case 'UPDATE_POPULATIONS':
      updatePopulations(payload.populations);
      break;
    case 'UPDATE_WORLD_CONFIG':
      updateWorldConfig(payload.config);
      break;
  }
};

// Export empty object to make this a module
export {};
