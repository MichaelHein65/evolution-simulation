// Organism Traits Interface
export interface OrganismTraits {
  // Movement
  speed: number;              // 0-100: Movement speed
  agility: number;            // 0-100: Maneuverability
  
  // Energy & Life
  maxEnergy: number;          // 0-100: Energy capacity
  energyEfficiency: number;   // 0-100: Lower consumption
  maxAge: number;             // 0-100: Maximum age in ticks
  
  // Perception
  visionRange: number;        // 0-100: Vision range
  foodDetection: number;      // 0-100: Food detection ability
  
  // Reproduction
  reproductionRate: number;   // 0-100: How fast/often
  offspringCount: number;     // 1-5: Number of offspring
  
  // Interaction
  aggression: number;         // 0-100: Attack vs. flee
  size: number;               // 0-100: Size (visible & influence)
  
  // Social (for later)
  socialBehavior: number;     // 0-100: Pack vs. solitary
}

// Organism State
export interface Organism {
  id: string;
  populationId: string;
  traits: OrganismTraits;
  
  // Current state
  x: number;
  y: number;
  energy: number;
  age: number;
  alive: boolean;
  
  // Direction & movement
  direction: number;  // Angle in radians
  velocityX: number;
  velocityY: number;
}

// Population Configuration
export interface Population {
  id: string;
  name: string;
  color: string;  // Hex color
  initialCount: number;
  defaultTraits: OrganismTraits;
  mutationRate: number;  // For later
}

// Food
export interface Food {
  id: string;
  x: number;
  y: number;
  energy: number;
  consumed: boolean;
}

// World Configuration
export interface WorldConfig {
  width: number;
  height: number;
  foodSpawnRate: number;
  maxFoodCount: number;
  foodEnergyValue: number;
}

// Simulation State
export interface SimulationState {
  running: boolean;
  speed: number;  // Simulation speed multiplier
  tick: number;   // Current simulation tick
  populations: Population[];
  organisms: Organism[];
  food: Food[];
  worldConfig: WorldConfig;
}

// Statistics for charts
export interface PopulationStats {
  tick: number;
  populationCounts: Record<string, number>;  // populationId -> count
  averageTraits: Record<string, Partial<OrganismTraits>>;  // populationId -> traits
  totalOrganisms: number;
}
