import { Population } from '../types';

// Default trait values for each population archetype
export const DEFAULT_POPULATIONS: Population[] = [
  {
    id: 'sprinter',
    name: 'Sprinter',
    color: '#EF4444',  // Red
    initialCount: 5,
    mutationRate: 0.1,
    defaultTraits: {
      speed: 90,
      agility: 85,
      maxEnergy: 40,
      energyEfficiency: 30,
      maxAge: 50,
      visionRange: 60,
      foodDetection: 50,
      reproductionRate: 70,
      offspringCount: 2,
      aggression: 60,
      size: 40,
      socialBehavior: 50,
    },
  },
  {
    id: 'tank',
    name: 'Tank',
    color: '#3B82F6',  // Blue
    initialCount: 5,
    mutationRate: 0.1,
    defaultTraits: {
      speed: 20,
      agility: 25,
      maxEnergy: 95,
      energyEfficiency: 85,
      maxAge: 90,
      visionRange: 40,
      foodDetection: 45,
      reproductionRate: 30,
      offspringCount: 1,
      aggression: 30,
      size: 85,
      socialBehavior: 50,
    },
  },
  {
    id: 'hunter',
    name: 'Jäger',
    color: '#F97316',  // Orange
    initialCount: 5,
    mutationRate: 0.1,
    defaultTraits: {
      speed: 70,
      agility: 75,
      maxEnergy: 60,
      energyEfficiency: 50,
      maxAge: 65,
      visionRange: 90,
      foodDetection: 80,
      reproductionRate: 50,
      offspringCount: 2,
      aggression: 85,
      size: 55,
      socialBehavior: 50,
    },
  },
  {
    id: 'gatherer',
    name: 'Sammler',
    color: '#10B981',  // Green
    initialCount: 5,
    mutationRate: 0.1,
    defaultTraits: {
      speed: 50,
      agility: 60,
      maxEnergy: 70,
      energyEfficiency: 90,
      maxAge: 70,
      visionRange: 65,
      foodDetection: 95,
      reproductionRate: 60,
      offspringCount: 3,
      aggression: 20,
      size: 45,
      socialBehavior: 50,
    },
  },
  {
    id: 'allrounder',
    name: 'Allrounder',
    color: '#A855F7',  // Purple
    initialCount: 5,
    mutationRate: 0.1,
    defaultTraits: {
      speed: 55,
      agility: 55,
      maxEnergy: 60,
      energyEfficiency: 60,
      maxAge: 65,
      visionRange: 60,
      foodDetection: 60,
      reproductionRate: 55,
      offspringCount: 2,
      aggression: 50,
      size: 55,
      socialBehavior: 50,
    },
  },
];

export const DEFAULT_WORLD_CONFIG = {
  width: 1400,
  height: 700,
  foodSpawnRate: 0.5,  // Per tick
  maxFoodCount: 200,
  foodEnergyValue: 30,
};
