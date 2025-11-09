// Main application controller
class EvolutionSimulationApp {
    constructor() {
        this.renderer = null;
        this.charts = null;
        this.storage = null;
        this.ui = null;
        this.worker = null;
        this.simulation = null;
        
        this.running = false;
        this.lastFrameTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.fpsUpdateTime = 0;

        this.initialize();
    }

    initialize() {
        // Initialize components
        const canvasContainer = document.getElementById('canvas-container');
        this.renderer = new Renderer(canvasContainer);
        this.charts = new Charts();
        this.storage = new Storage();
        this.ui = new UI((populationId, traits) => {
            this.updatePopulationTraits(populationId, traits);
        });

        // Initialize simulation (Web Worker or main thread)
        if (CONFIG.USE_WEB_WORKER && typeof Worker !== 'undefined') {
            this.initializeWorker();
        } else {
            this.initializeMainThread();
        }

        // Setup controls
        this.setupControls();

        // Start animation loop
        this.animate();
    }

    initializeWorker() {
        this.worker = new Worker('js/simulationWorker.js');
        
        this.worker.onmessage = (e) => {
            const { type, state } = e.data;
            
            switch (type) {
                case 'ready':
                    console.log('Web Worker ready');
                    this.worker.postMessage({ action: 'init' });
                    break;
                    
                case 'initialized':
                case 'update':
                    if (state) {
                        this.handleSimulationUpdate(state);
                    }
                    break;
                    
                case 'started':
                    this.running = true;
                    break;
                    
                case 'paused':
                    this.running = false;
                    break;
                    
                case 'stateSet':
                    if (state) {
                        this.handleSimulationUpdate(state);
                    }
                    break;
            }
        };

        this.worker.onerror = (error) => {
            console.error('Worker error:', error);
            // Fallback to main thread
            this.initializeMainThread();
        };
    }

    initializeMainThread() {
        console.log('Using main thread simulation');
        this.simulation = new Simulation();
        this.simulation.initialize();
        this.handleSimulationUpdate(this.simulation.getState());
    }

    handleSimulationUpdate(state) {
        // Update renderer
        this.renderer.render(state);
        
        // Update charts
        if (state.stats) {
            this.charts.update(state.stats);
        }
        
        // Update UI stats
        const organismCount = state.organisms ? state.organisms.filter(o => o.alive).length : 0;
        this.ui.updateStats(state.generation || 0, organismCount, this.fps);
    }

    setupControls() {
        document.getElementById('startBtn').addEventListener('click', () => {
            this.start();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pause();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.reset();
        });

        document.getElementById('saveBtn').addEventListener('click', () => {
            this.save();
        });

        document.getElementById('loadBtn').addEventListener('click', () => {
            this.load();
        });
    }

    start() {
        if (this.worker) {
            this.worker.postMessage({ action: 'start' });
        } else if (this.simulation) {
            this.simulation.start();
            this.running = true;
        }
    }

    pause() {
        if (this.worker) {
            this.worker.postMessage({ action: 'pause' });
        } else if (this.simulation) {
            this.simulation.pause();
            this.running = false;
        }
    }

    reset() {
        if (this.worker) {
            this.worker.postMessage({ action: 'reset' });
        } else if (this.simulation) {
            this.simulation.reset();
            this.handleSimulationUpdate(this.simulation.getState());
        }
        this.charts.reset();
        this.running = false;
    }

    save() {
        let state;
        if (this.worker) {
            // For web worker, we need to get the current rendered state
            // This is a limitation - in production, you'd want to request state from worker
            alert('Save functionality with Web Worker requires additional implementation');
            return;
        } else if (this.simulation) {
            state = this.simulation.getState();
        }

        if (state && this.storage.save(state)) {
            alert('Simulation saved successfully!');
        } else {
            alert('Failed to save simulation');
        }
    }

    load() {
        const state = this.storage.load();
        if (state) {
            if (this.worker) {
                this.worker.postMessage({ 
                    action: 'setState', 
                    data: { state } 
                });
            } else if (this.simulation) {
                this.simulation.setState(state);
                this.handleSimulationUpdate(this.simulation.getState());
            }
            alert('Simulation loaded successfully!');
        } else {
            alert('No saved simulation found');
        }
    }

    updatePopulationTraits(populationId, traits) {
        if (this.worker) {
            this.worker.postMessage({
                action: 'updateTraits',
                data: { populationId, traits }
            });
        } else if (this.simulation) {
            this.simulation.updatePopulationTraits(populationId, traits);
        }
    }

    animate(timestamp = 0) {
        requestAnimationFrame((ts) => this.animate(ts));

        // Calculate FPS
        this.frameCount++;
        if (timestamp - this.fpsUpdateTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsUpdateTime = timestamp;
        }

        // Update simulation
        if (this.worker && this.running) {
            this.worker.postMessage({ action: 'step' });
        } else if (this.simulation && this.running) {
            const deltaTime = (timestamp - this.lastFrameTime) / 1000;
            if (deltaTime > 0) {
                this.simulation.update(Math.min(deltaTime, 0.1));
                this.handleSimulationUpdate(this.simulation.getState());
            }
        }

        this.lastFrameTime = timestamp;
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new EvolutionSimulationApp();
});
