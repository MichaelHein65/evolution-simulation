// Main simulation engine (can run in main thread or web worker)
class Simulation {
    constructor() {
        this.organisms = [];
        this.food = [];
        this.generation = 0;
        this.running = false;
        this.spatialGrid = new SpatialHashGrid(
            CONFIG.GRID_CELL_SIZE,
            CONFIG.WORLD_WIDTH,
            CONFIG.WORLD_HEIGHT
        );
        
        // Statistics tracking
        this.stats = {
            populationCounts: new Array(5).fill(0),
            averageTraits: {},
            totalBorn: 0,
            totalDied: 0
        };
    }

    initialize() {
        this.organisms = [];
        this.food = [];
        this.generation = 0;
        
        // Create initial populations
        for (let popId = 0; popId < 5; popId++) {
            for (let i = 0; i < CONFIG.INITIAL_ORGANISMS_PER_POPULATION; i++) {
                const x = Math.random() * CONFIG.WORLD_WIDTH;
                const y = Math.random() * CONFIG.WORLD_HEIGHT;
                this.organisms.push(new Organism(x, y, popId));
            }
        }

        // Create initial food
        this.spawnFood(CONFIG.FOOD_COUNT);
    }

    spawnFood(count) {
        for (let i = 0; i < count; i++) {
            this.food.push({
                id: Math.random().toString(36).substr(2, 9),
                x: Math.random() * CONFIG.WORLD_WIDTH,
                y: Math.random() * CONFIG.WORLD_HEIGHT,
                available: true,
                type: 'food'
            });
        }
    }

    update(deltaTime = 1) {
        if (!this.running) return;

        // Rebuild spatial grid
        this.spatialGrid.clear();
        
        // Add organisms to grid
        for (const organism of this.organisms) {
            if (organism.alive) {
                this.spatialGrid.insert(organism);
            }
        }
        
        // Add food to grid
        for (const foodItem of this.food) {
            if (foodItem.available) {
                this.spatialGrid.insert(foodItem);
            }
        }

        // Update organisms
        const newborns = [];
        for (const organism of this.organisms) {
            if (organism.alive) {
                const offspring = organism.update(deltaTime, this.spatialGrid, this.organisms, this.food);
                if (offspring) {
                    newborns.push(offspring);
                    this.stats.totalBorn++;
                }
            }
        }

        // Add newborns
        for (const newborn of newborns) {
            if (this.organisms.length < CONFIG.MAX_ORGANISMS) {
                this.organisms.push(newborn);
            }
        }

        // Remove dead organisms
        const deadCount = this.organisms.filter(o => !o.alive).length;
        this.organisms = this.organisms.filter(o => o.alive);
        this.stats.totalDied += deadCount;

        // Food respawn
        for (const foodItem of this.food) {
            if (!foodItem.available && Math.random() < CONFIG.FOOD_RESPAWN_RATE) {
                foodItem.available = true;
            }
        }

        // Spawn new food if needed
        const availableFood = this.food.filter(f => f.available).length;
        if (availableFood < CONFIG.FOOD_COUNT * 0.5) {
            this.spawnFood(CONFIG.FOOD_COUNT - availableFood);
        }

        // Update statistics
        this.updateStats();

        // Increment generation periodically
        if (this.organisms.length > 0 && Math.random() < 0.001) {
            this.generation++;
        }
    }

    updateStats() {
        // Reset population counts
        this.stats.populationCounts = new Array(5).fill(0);
        
        // Count organisms per population
        for (const organism of this.organisms) {
            if (organism.alive) {
                this.stats.populationCounts[organism.populationId]++;
            }
        }

        // Calculate average traits per population
        const traitSums = {};
        const traitCounts = {};
        
        for (let popId = 0; popId < 5; popId++) {
            traitSums[popId] = {};
            traitCounts[popId] = {};
            
            for (const traitName of Object.keys(CONFIG.TRAITS)) {
                traitSums[popId][traitName] = 0;
                traitCounts[popId][traitName] = 0;
            }
        }

        for (const organism of this.organisms) {
            if (organism.alive) {
                for (const [traitName, value] of Object.entries(organism.traits)) {
                    traitSums[organism.populationId][traitName] += value;
                    traitCounts[organism.populationId][traitName]++;
                }
            }
        }

        this.stats.averageTraits = {};
        for (let popId = 0; popId < 5; popId++) {
            this.stats.averageTraits[popId] = {};
            for (const traitName of Object.keys(CONFIG.TRAITS)) {
                const count = traitCounts[popId][traitName];
                this.stats.averageTraits[popId][traitName] = count > 0 
                    ? traitSums[popId][traitName] / count 
                    : 0;
            }
        }
    }

    start() {
        this.running = true;
    }

    pause() {
        this.running = false;
    }

    reset() {
        this.running = false;
        this.initialize();
    }

    getState() {
        return {
            organisms: this.organisms.map(o => o.serialize()),
            food: this.food,
            generation: this.generation,
            stats: this.stats,
            running: this.running
        };
    }

    setState(state) {
        this.organisms = state.organisms.map(data => Organism.deserialize(data));
        this.food = state.food;
        this.generation = state.generation;
        this.stats = state.stats;
        this.running = state.running;
    }

    // Update traits for a specific population
    updatePopulationTraits(populationId, traits) {
        for (const organism of this.organisms) {
            if (organism.populationId === populationId && organism.alive) {
                organism.traits = { ...traits };
                organism.updateDerivedProperties();
            }
        }
    }
}
