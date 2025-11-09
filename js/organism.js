// Organism class representing individual entities in the simulation
class Organism {
    constructor(x, y, populationId, traits = null) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.x = x;
        this.y = y;
        this.populationId = populationId;
        this.vx = 0;
        this.vy = 0;
        this.energy = CONFIG.BASE_ENERGY;
        this.age = 0;
        this.alive = true;
        
        // Initialize traits
        this.traits = traits || this.initializeTraits();
        
        // Derived properties
        this.updateDerivedProperties();
    }

    initializeTraits() {
        const traits = {};
        for (const [key, config] of Object.entries(CONFIG.TRAITS)) {
            traits[key] = config.default;
        }
        return traits;
    }

    updateDerivedProperties() {
        this.size = this.traits.size;
        this.maxSpeed = this.traits.speed;
        this.visionRange = this.traits.vision;
        this.maxLifespan = this.traits.lifespan;
        this.energyConsumption = CONFIG.ENERGY_CONSUMPTION_RATE * this.traits.metabolism;
    }

    update(deltaTime, spatialGrid, organisms, food) {
        if (!this.alive) return;

        this.age += deltaTime;
        this.energy -= this.energyConsumption * deltaTime;

        // Die if no energy or too old
        if (this.energy <= 0 || this.age >= this.maxLifespan) {
            this.alive = false;
            return;
        }

        // Find nearby entities
        const nearby = spatialGrid.getNearby(this.x, this.y, this.visionRange);
        
        // Behavior decision making
        this.decideBehavior(nearby, organisms, food);

        // Apply movement
        this.move(deltaTime);

        // Attempt reproduction
        if (this.canReproduce()) {
            return this.reproduce();
        }

        return null;
    }

    decideBehavior(nearby, organisms, food) {
        // Reset velocity
        this.vx = 0;
        this.vy = 0;

        // Find nearest food
        let nearestFood = null;
        let nearestFoodDist = Infinity;
        
        for (const item of nearby) {
            if (item.type === 'food') {
                const dist = this.distanceTo(item.x, item.y);
                if (dist < nearestFoodDist && dist < this.visionRange) {
                    nearestFood = item;
                    nearestFoodDist = dist;
                }
            }
        }

        // Find potential prey or threats
        let nearestPrey = null;
        let nearestThreat = null;
        let nearestPreyDist = Infinity;
        let nearestThreatDist = Infinity;

        for (const other of nearby) {
            if (other.type === 'organism' && other.id !== this.id && other.alive) {
                const dist = this.distanceTo(other.x, other.y);
                
                if (dist < this.visionRange) {
                    // Determine if prey or threat based on size and aggression
                    if (this.traits.aggression > 0.5 && this.traits.strength > other.traits.strength) {
                        if (dist < nearestPreyDist) {
                            nearestPrey = other;
                            nearestPreyDist = dist;
                        }
                    } else if (other.traits.aggression > 0.5 && other.traits.strength > this.traits.strength) {
                        if (dist < nearestThreatDist) {
                            nearestThreat = other;
                            nearestThreatDist = dist;
                        }
                    }
                }
            }
        }

        // Priority: Flee from threats > Hunt prey > Seek food > Wander
        if (nearestThreat && nearestThreatDist < this.visionRange * 0.5) {
            this.fleeFrom(nearestThreat.x, nearestThreat.y);
        } else if (nearestPrey && this.energy > 50) {
            this.moveTowards(nearestPrey.x, nearestPrey.y);
            // Attack if close enough
            if (nearestPreyDist < this.size + nearestPrey.size) {
                this.attack(nearestPrey);
            }
        } else if (nearestFood) {
            this.moveTowards(nearestFood.x, nearestFood.y);
            // Eat if close enough
            if (nearestFoodDist < this.size + 3) {
                this.eat(nearestFood);
            }
        } else {
            this.wander();
        }
    }

    moveTowards(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            this.vx = (dx / dist) * this.maxSpeed;
            this.vy = (dy / dist) * this.maxSpeed;
        }
    }

    fleeFrom(targetX, targetY) {
        const dx = this.x - targetX;
        const dy = this.y - targetY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            this.vx = (dx / dist) * this.maxSpeed;
            this.vy = (dy / dist) * this.maxSpeed;
        }
    }

    wander() {
        // Random walk behavior
        this.vx = (Math.random() - 0.5) * this.maxSpeed * 0.5;
        this.vy = (Math.random() - 0.5) * this.maxSpeed * 0.5;
    }

    move(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Wrap around world boundaries
        if (this.x < 0) this.x = CONFIG.WORLD_WIDTH;
        if (this.x > CONFIG.WORLD_WIDTH) this.x = 0;
        if (this.y < 0) this.y = CONFIG.WORLD_HEIGHT;
        if (this.y > CONFIG.WORLD_HEIGHT) this.y = 0;
    }

    eat(food) {
        if (food.available) {
            this.energy += CONFIG.FOOD_ENERGY;
            food.available = false;
        }
    }

    attack(prey) {
        if (Math.random() < this.traits.aggression) {
            const damage = this.traits.strength * 10;
            prey.energy -= damage;
            this.energy += damage * 0.5; // Gain energy from successful hunt
        }
    }

    canReproduce() {
        return this.energy >= CONFIG.REPRODUCTION_ENERGY_THRESHOLD &&
               Math.random() < this.traits.reproductionRate * 0.01;
    }

    reproduce() {
        this.energy -= CONFIG.REPRODUCTION_ENERGY_COST;
        
        // Create offspring with mutated traits
        const childTraits = {};
        for (const [key, value] of Object.entries(this.traits)) {
            let newValue = value;
            
            // Apply mutation
            if (Math.random() < CONFIG.MUTATION_RATE) {
                const traitConfig = CONFIG.TRAITS[key];
                const mutation = (Math.random() - 0.5) * CONFIG.MUTATION_STRENGTH * (traitConfig.max - traitConfig.min);
                newValue = Math.max(traitConfig.min, Math.min(traitConfig.max, value + mutation));
            }
            
            childTraits[key] = newValue;
        }

        // Spawn near parent
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        
        return new Organism(this.x + offsetX, this.y + offsetY, this.populationId, childTraits);
    }

    distanceTo(x, y) {
        const dx = this.x - x;
        const dy = this.y - y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Serialize for web worker or storage
    serialize() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            vx: this.vx,
            vy: this.vy,
            populationId: this.populationId,
            energy: this.energy,
            age: this.age,
            alive: this.alive,
            traits: this.traits,
            size: this.size
        };
    }

    // Deserialize from data
    static deserialize(data) {
        const organism = new Organism(data.x, data.y, data.populationId, data.traits);
        organism.id = data.id;
        organism.vx = data.vx;
        organism.vy = data.vy;
        organism.energy = data.energy;
        organism.age = data.age;
        organism.alive = data.alive;
        organism.updateDerivedProperties();
        return organism;
    }
}

// Mark as organism type for spatial grid
Organism.prototype.type = 'organism';
