import { OrganismClass } from './Organism';
import { Food, WorldConfig } from '../types';
import { SpatialHashGrid } from './SpatialHashGrid';

export class World {
  organisms: OrganismClass[];
  food: Food[];
  config: WorldConfig;
  tick: number;
  private spatialGrid: SpatialHashGrid;

  constructor(config: WorldConfig) {
    this.organisms = [];
    this.food = [];
    this.config = config;
    this.tick = 0;
    this.spatialGrid = new SpatialHashGrid(150); // 150px cells
  }

  // Update world state
  update(): void {
    this.tick++;

    // Build spatial hash grids for this frame (MUCH faster than nested loops)
    this.spatialGrid.clear();
    const foodGrid = new SpatialHashGrid(100);
    
    for (const organism of this.organisms) {
      if (organism.alive) {
        this.spatialGrid.insert(organism.x, organism.y, organism);
      }
    }
    
    for (const food of this.food) {
      if (!food.consumed) {
        foodGrid.insert(food.x, food.y, food);
      }
    }

    // Update all organisms
    for (const organism of this.organisms) {
      const needsNearby = organism.traits.aggression > 50 || organism.traits.socialBehavior > 30;
      
      if (needsNearby) {
        // Use spatial grid - O(1) instead of O(n)!
        const visionRadius = (organism.traits.visionRange / 100) * 200;
        const nearbyOrganisms = this.spatialGrid.queryRadius(organism.x, organism.y, visionRadius);
        
        organism.update(this.config.width, this.config.height, nearbyOrganisms);
      } else {
        organism.update(this.config.width, this.config.height);
      }
      
      // Food consumption using spatial grid
      const detectionRange = (organism.traits.foodDetection / 100) * 50;
      const nearbyFood = foodGrid.queryRadius(organism.x, organism.y, detectionRange);
      
      if (nearbyFood.length > 0) {
        // Find closest food
        let closestFood = null;
        let minDistance = Infinity;
        
        for (const food of nearbyFood) {
          if (food.consumed) continue;
          const distance = organism.distanceTo(food.x, food.y);
          if (distance < detectionRange && distance < minDistance) {
            minDistance = distance;
            closestFood = food;
          }
        }
        
        if (closestFood) {
          organism.eat(closestFood.energy);
          closestFood.consumed = true;
        }
      }
    }

    // Remove dead organisms and consumed food
    this.organisms = this.organisms.filter(o => o.alive);
    this.food = this.food.filter(f => !f.consumed);

    // Spawn new food
    this.spawnFood();

    // Handle reproduction
    this.handleReproduction();
  }

  // Spawn new food
  private spawnFood(): void {
    if (this.food.length < this.config.maxFoodCount) {
      if (Math.random() < this.config.foodSpawnRate) {
        const newFood: Food = {
          id: `food-${this.tick}-${Math.random()}`,
          x: Math.random() * this.config.width,
          y: Math.random() * this.config.height,
          energy: this.config.foodEnergyValue,
          consumed: false,
        };
        this.food.push(newFood);
      }
    }
  }

  // Handle organism reproduction
  private handleReproduction(): void {
    const newOrganisms: OrganismClass[] = [];

    // Much higher limit with spatial hashing - we can handle 5000+ now!
    if (this.organisms.length >= 5000) {
      return;
    }

    for (const organism of this.organisms) {
      if (organism.canReproduce()) {
        // MUCH lower reproduction chance - divide by 100000 instead of 10000
        // This means at reproductionRate=50, chance is 0.05% per frame = ~3% per second
        const reproductionChance = organism.traits.reproductionRate / 100000;
        
        if (Math.random() < reproductionChance) {
          const offspringCount = organism.traits.offspringCount;
          
          // Higher cost of reproduction - 50% of energy instead of 40%
          const reproductionCost = organism.energy * 0.5;
          organism.energy -= reproductionCost;

          // Create offspring
          for (let i = 0; i < offspringCount; i++) {
            // Stop if we're approaching the limit
            if (this.organisms.length + newOrganisms.length >= 5000) {
              break;
            }
            
            const offspring = new OrganismClass(
              `${organism.id}-child-${this.tick}-${i}`,
              organism.populationId,
              { ...organism.traits }, // Clone traits (mutation will be added later)
              organism.x + (Math.random() - 0.5) * 20,
              organism.y + (Math.random() - 0.5) * 20,
              organism.traits.maxEnergy * 0.5 // Start with half energy
            );
            newOrganisms.push(offspring);
          }
        }
      }
    }

    this.organisms.push(...newOrganisms);
  }

  // Add organism to world
  addOrganism(organism: OrganismClass): void {
    this.organisms.push(organism);
  }

  // Get statistics
  getStats() {
    const populationCounts: Record<string, number> = {};
    
    for (const organism of this.organisms) {
      if (!populationCounts[organism.populationId]) {
        populationCounts[organism.populationId] = 0;
      }
      populationCounts[organism.populationId]++;
    }

    return {
      tick: this.tick,
      totalOrganisms: this.organisms.length,
      totalFood: this.food.length,
      populationCounts,
    };
  }
}
