import { Organism, OrganismTraits } from '../types';

export class OrganismClass implements Organism {
  id: string;
  populationId: string;
  traits: OrganismTraits;
  x: number;
  y: number;
  energy: number;
  age: number;
  alive: boolean;
  direction: number;
  velocityX: number;
  velocityY: number;
  
  // New: Combat and social state
  target: OrganismClass | null = null;
  nearbyAllies: OrganismClass[] = [];
  isHunting: boolean = false;
  lastSocialUpdate: number = 0;
  lastHuntUpdate: number = 0;

  constructor(
    id: string,
    populationId: string,
    traits: OrganismTraits,
    x: number,
    y: number,
    initialEnergy: number
  ) {
    this.id = id;
    this.populationId = populationId;
    this.traits = traits;
    this.x = x;
    this.y = y;
    this.energy = initialEnergy;
    this.age = 0;
    this.alive = true;
    this.direction = Math.random() * Math.PI * 2;
    this.velocityX = 0;
    this.velocityY = 0;
  }

  // Update organism state each tick
  update(worldWidth: number, worldHeight: number, nearbyOrganisms?: OrganismClass[]): void {
    if (!this.alive) return;

    // Age
    this.age++;
    
    // Check death by age
    const maxAgeTicks = this.traits.maxAge * 100; // Convert to ticks
    if (this.age >= maxAgeTicks) {
      this.alive = false;
      return;
    }

    // Energy consumption based on speed and efficiency
    const baseConsumption = 0.1;
    const speedFactor = this.traits.speed / 100;
    const efficiencyFactor = 1 - (this.traits.energyEfficiency / 100);
    const sizeFactor = this.traits.size / 100;
    
    this.energy -= baseConsumption * (1 + speedFactor) * efficiencyFactor * (1 + sizeFactor * 0.5);

    // Check death by starvation
    if (this.energy <= 0) {
      this.alive = false;
      return;
    }

    // Social behavior: find nearby allies (only update every 5 ticks)
    if (nearbyOrganisms && this.traits.socialBehavior > 30) {
      if (this.age - this.lastSocialUpdate > 5) {
        this.updateSocialBehavior(nearbyOrganisms);
        this.lastSocialUpdate = this.age;
      }
    }

    // Aggression: hunt if aggressive and low on energy (only update every 3 ticks)
    if (nearbyOrganisms && this.traits.aggression > 50 && this.energy < this.traits.maxEnergy * 0.5) {
      if (this.age - this.lastHuntUpdate > 3) {
        this.huntBehavior(nearbyOrganisms);
        this.lastHuntUpdate = this.age;
      }
    } else {
      // Normal wandering
      this.wander();
    }
    
    // Apply velocity
    this.x += this.velocityX;
    this.y += this.velocityY;

    // Wrap around world edges
    if (this.x < 0) this.x = worldWidth;
    if (this.x > worldWidth) this.x = 0;
    if (this.y < 0) this.y = worldHeight;
    if (this.y > worldHeight) this.y = 0;
  }

  // Simple wandering behavior
  private wander(): void {
    // Occasionally change direction
    if (Math.random() < 0.02) {
      this.direction += (Math.random() - 0.5) * Math.PI / 2;
    }

    // Calculate speed based on traits
    const speed = (this.traits.speed / 100) * 2;
    const agility = this.traits.agility / 100;

    // Apply direction with some randomness
    this.direction += (Math.random() - 0.5) * 0.1 * agility;
    
    this.velocityX = Math.cos(this.direction) * speed;
    this.velocityY = Math.sin(this.direction) * speed;
  }

  // Eat food
  eat(energyValue: number): void {
    const maxEnergy = this.traits.maxEnergy;
    this.energy = Math.min(this.energy + energyValue, maxEnergy);
  }

  // Check if organism can reproduce
  canReproduce(): boolean {
    const energyThreshold = this.traits.maxEnergy * 0.8; // Higher threshold: 80% instead of 70%
    const ageThreshold = 50; // Higher age threshold: 50 ticks instead of 20
    return this.energy >= energyThreshold && this.age >= ageThreshold;
  }

  // Check distance to point
  distanceTo(x: number, y: number): number {
    const dx = this.x - x;
    const dy = this.y - y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Social behavior: move towards allies
  private updateSocialBehavior(nearbyOrganisms: OrganismClass[]): void {
    const socialRadius = (this.traits.visionRange / 100) * 150;
    const socialStrength = this.traits.socialBehavior / 100;

    // Filter allies (nearbyOrganisms already filtered by spatial grid)
    this.nearbyAllies = [];
    for (const other of nearbyOrganisms) {
      if (other.alive && 
          other.id !== this.id && 
          other.populationId === this.populationId) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distSq = dx * dx + dy * dy; // Skip sqrt - compare squared distance
        if (distSq < socialRadius * socialRadius) {
          this.nearbyAllies.push(other);
        }
      }
    }

    // Move towards center of nearby allies
    if (this.nearbyAllies.length > 0 && socialStrength > 0.5) {
      let sumX = 0;
      let sumY = 0;
      for (const ally of this.nearbyAllies) {
        sumX += ally.x;
        sumY += ally.y;
      }
      const centerX = sumX / this.nearbyAllies.length;
      const centerY = sumY / this.nearbyAllies.length;
      
      const dx = centerX - this.x;
      const dy = centerY - this.y;
      const angle = Math.atan2(dy, dx);
      
      // Blend social direction with current direction
      this.direction = this.direction * (1 - socialStrength * 0.3) + angle * socialStrength * 0.3;
    }
  }

  // Hunting behavior: chase and attack weaker organisms
  private huntBehavior(nearbyOrganisms: OrganismClass[]): void {
    const huntRadius = (this.traits.visionRange / 100) * 200;
    const huntRadiusSq = huntRadius * huntRadius;
    const aggressionStrength = this.traits.aggression / 100;

    // If already hunting a valid target, continue
    if (this.target && this.target.alive) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const distSq = dx * dx + dy * dy;
      
      if (distSq < huntRadiusSq * 2.25) { // 1.5x radius squared
        const angle = Math.atan2(dy, dx);
        this.direction = angle;
        
        // Faster when hunting
        const speed = (this.traits.speed / 100) * 2.5 * aggressionStrength;
        this.velocityX = Math.cos(this.direction) * speed;
        this.velocityY = Math.sin(this.direction) * speed;

        // Attack if close enough (20px = 400 squared)
        if (distSq < 400) {
          this.attack(this.target);
        }
        return;
      }
    }

    // Find potential prey (spatial grid already filtered by distance)
    let closestPrey: OrganismClass | null = null;
    let minDistSq = huntRadiusSq;
    
    for (const other of nearbyOrganisms) {
      if (!other.alive || 
          other.populationId === this.populationId ||
          other.traits.size > this.traits.size * 1.2 ||
          other.energy > other.traits.maxEnergy * 0.6) {
        continue;
      }
      
      const dx = this.x - other.x;
      const dy = this.y - other.y;
      const distSq = dx * dx + dy * dy;
      
      if (distSq < minDistSq) {
        minDistSq = distSq;
        closestPrey = other;
      }
    }

    if (closestPrey) {
      this.target = closestPrey;
      this.isHunting = true;
    } else {
      this.isHunting = false;
      this.target = null;
      this.wander();
    }
  }

  // Attack another organism
  attack(target: OrganismClass): void {
    if (!target.alive) return;

    const attackPower = (this.traits.aggression / 100) * (this.traits.size / 100) * 10;
    const defensePower = (target.traits.size / 100) * 5;

    const damage = Math.max(0, attackPower - defensePower);
    
    target.energy -= damage;

    // Gain energy from successful attack
    if (target.energy <= 0) {
      target.alive = false;
      // Absorb 30% of target's max energy
      this.energy = Math.min(
        this.energy + target.traits.maxEnergy * 0.3,
        this.traits.maxEnergy
      );
    }
  }
}
