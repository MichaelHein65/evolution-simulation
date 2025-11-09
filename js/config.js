// Configuration for the Evolution Simulation
const CONFIG = {
    // Canvas settings
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    
    // Simulation settings
    INITIAL_ORGANISMS_PER_POPULATION: 20,
    MAX_ORGANISMS: 1000,
    WORLD_WIDTH: 2000,
    WORLD_HEIGHT: 1500,
    
    // Spatial Hash Grid settings
    GRID_CELL_SIZE: 100,
    
    // Organism settings
    BASE_SIZE: 5,
    BASE_SPEED: 2,
    BASE_ENERGY: 100,
    ENERGY_CONSUMPTION_RATE: 0.1,
    REPRODUCTION_ENERGY_THRESHOLD: 150,
    REPRODUCTION_ENERGY_COST: 50,
    FOOD_ENERGY: 30,
    
    // Food settings
    FOOD_COUNT: 100,
    FOOD_RESPAWN_RATE: 0.02,
    
    // Trait definitions (12 editable traits)
    TRAITS: {
        speed: { min: 0.5, max: 5, default: 2, label: 'Speed' },
        size: { min: 3, max: 15, default: 5, label: 'Size' },
        vision: { min: 20, max: 200, default: 80, label: 'Vision Range' },
        strength: { min: 1, max: 10, default: 5, label: 'Strength' },
        aggression: { min: 0, max: 1, default: 0.3, label: 'Aggression' },
        cooperation: { min: 0, max: 1, default: 0.5, label: 'Cooperation' },
        metabolism: { min: 0.5, max: 2, default: 1, label: 'Metabolism' },
        intelligence: { min: 0, max: 1, default: 0.5, label: 'Intelligence' },
        camouflage: { min: 0, max: 1, default: 0.3, label: 'Camouflage' },
        lifespan: { min: 50, max: 500, default: 200, label: 'Lifespan' },
        reproductionRate: { min: 0.1, max: 0.9, default: 0.5, label: 'Reproduction Rate' },
        socialBehavior: { min: 0, max: 1, default: 0.5, label: 'Social Behavior' }
    },
    
    // Population colors
    POPULATION_COLORS: [
        0x3498db, // Blue
        0xe74c3c, // Red
        0x2ecc71, // Green
        0xf39c12, // Orange
        0x9b59b6  // Purple
    ],
    
    // Performance settings
    USE_WEB_WORKER: true,
    OBJECT_POOL_SIZE: 1500,
    
    // Mutation settings
    MUTATION_RATE: 0.1,
    MUTATION_STRENGTH: 0.2
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
