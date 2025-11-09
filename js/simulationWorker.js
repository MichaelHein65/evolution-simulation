// Web Worker for running simulation in separate thread
// This file must be self-contained and cannot use external scripts directly

// Import configuration and classes via importScripts
importScripts('config.js', 'spatialHashGrid.js', 'organism.js', 'simulation.js');

let simulation = null;
let lastUpdateTime = Date.now();

// Initialize the simulation
function initialize() {
    simulation = new Simulation();
    simulation.initialize();
    return {
        type: 'initialized',
        state: simulation.getState()
    };
}

// Run simulation step
function step() {
    if (!simulation) return;
    
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastUpdateTime) / 1000; // Convert to seconds
    lastUpdateTime = currentTime;
    
    simulation.update(Math.min(deltaTime, 0.1)); // Cap deltaTime to prevent huge jumps
    
    return {
        type: 'update',
        state: simulation.getState()
    };
}

// Handle messages from main thread
self.onmessage = function(e) {
    const { action, data } = e.data;
    
    let response;
    
    switch (action) {
        case 'init':
            response = initialize();
            break;
            
        case 'step':
            response = step();
            break;
            
        case 'start':
            if (simulation) {
                simulation.start();
                response = { type: 'started' };
            }
            break;
            
        case 'pause':
            if (simulation) {
                simulation.pause();
                response = { type: 'paused' };
            }
            break;
            
        case 'reset':
            response = initialize();
            break;
            
        case 'setState':
            if (simulation) {
                simulation.setState(data.state);
                response = { type: 'stateSet', state: simulation.getState() };
            }
            break;
            
        case 'updateTraits':
            if (simulation) {
                simulation.updatePopulationTraits(data.populationId, data.traits);
                response = { type: 'traitsUpdated' };
            }
            break;
            
        default:
            response = { type: 'error', message: 'Unknown action: ' + action };
    }
    
    if (response) {
        self.postMessage(response);
    }
};

// Send ready message
self.postMessage({ type: 'ready' });
