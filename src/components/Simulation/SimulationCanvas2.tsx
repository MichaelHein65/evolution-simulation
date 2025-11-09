import { useEffect, useRef } from 'react';
import { Application, Graphics, Container } from 'pixi.js';
import { useSimulationStore } from '../../store/simulationStore';

export default function SimulationCanvas2() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const organismContainerRef = useRef<Container | null>(null);
  const foodContainerRef = useRef<Container | null>(null);
  const organismGraphicsPoolRef = useRef<Map<string, Graphics>>(new Map());
  const foodGraphicsPoolRef = useRef<Graphics[]>([]);
  
  const renderData = useSimulationStore((state) => state.renderData);
  const populations = useSimulationStore((state) => state.populations);

  // Initialize Pixi.js Application
  useEffect(() => {
    if (!canvasRef.current) return;

    const initPixi = async () => {
      try {
        // Pixi.js v8 uses async init
        const app = new Application();
        
        await app.init({
          width: 1400,
          height: 700,
          backgroundColor: 0x1a1a2e,
          antialias: true,
        });

        const container = canvasRef.current;
        if (container) {
          // Clear any existing content
          container.innerHTML = '';
          container.appendChild(app.canvas);
        }
        appRef.current = app;

        // Create containers
        const foodContainer = new Container();
        const organismContainer = new Container();
        app.stage.addChild(foodContainer);
        app.stage.addChild(organismContainer);
        foodContainerRef.current = foodContainer;
        organismContainerRef.current = organismContainer;

        console.log('✅ Pixi.js Application initialized with object pooling');
      } catch (error) {
        console.error('❌ Pixi.js initialization error:', error);
      }
    };

    initPixi();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
      organismGraphicsPoolRef.current.clear();
      foodGraphicsPoolRef.current = [];
    };
  }, []);

  // Render organisms and food from worker data (with object pooling!)
  useEffect(() => {
    if (!appRef.current || !renderData || !organismContainerRef.current || !foodContainerRef.current) {
      return;
    }

    const renderStart = performance.now();
    
    try {
      const organismContainer = organismContainerRef.current;
      const foodContainer = foodContainerRef.current;
      const organismPool = organismGraphicsPoolRef.current;
      const foodPool = foodGraphicsPoolRef.current;

      // Track which organisms are still alive
      const activeOrganismIds = new Set<string>();

      // Update or create organism graphics
      renderData.organisms.forEach((organism) => {
        activeOrganismIds.add(organism.id);
        
        const population = populations.find((p) => p.id === organism.populationId);
        if (!population) return;

        let graphic = organismPool.get(organism.id);
        
        // Create new graphic if needed
        if (!graphic) {
          graphic = new Graphics();
          organismPool.set(organism.id, graphic);
          organismContainer.addChild(graphic);
        }

        // Update graphic
        graphic.clear();
        
        const size = (organism.size / 100) * 15 + 5;
        const color = parseInt(population.color.replace('#', ''), 16);

        graphic.circle(organism.x, organism.y, size);
        graphic.fill(color);
        
        // Energy indicator (red outline if low energy)
        const energyPercent = organism.energy / organism.maxEnergy;
        if (energyPercent < 0.3) {
          graphic.circle(organism.x, organism.y, size + 2);
          graphic.stroke({ width: 2, color: 0xff6b6b });
        }

        // Hunting indicator (orange glow if hunting)
        if (organism.isHunting) {
          graphic.circle(organism.x, organism.y, size + 4);
          graphic.stroke({ width: 3, color: 0xff8800, alpha: 0.7 });
        }

        // Social indicator (blue glow if in group)
        if (organism.nearbyAlliesCount > 2) {
          graphic.circle(organism.x, organism.y, size + 3);
          graphic.stroke({ width: 2, color: 0x00aaff, alpha: 0.5 });
        }
      });

      // Remove graphics for dead organisms
      for (const [id, graphic] of organismPool.entries()) {
        if (!activeOrganismIds.has(id)) {
          graphic.destroy();
          organismPool.delete(id);
        }
      }

      // Update food graphics (reuse pool)
      const foodCount = renderData.food.length;
      
      // Create more food graphics if needed
      while (foodPool.length < foodCount) {
        const graphic = new Graphics();
        foodContainer.addChild(graphic);
        foodPool.push(graphic);
      }

      // Update food positions
      renderData.food.forEach((food, i) => {
        const graphic = foodPool[i];
        graphic.clear();
        graphic.circle(food.x, food.y, 3);
        graphic.fill(0x22c55e);
        graphic.visible = true;
      });

      // Hide unused food graphics
      for (let i = foodCount; i < foodPool.length; i++) {
        foodPool[i].visible = false;
      }
      
      const renderTime = performance.now() - renderStart;
      // Log occasionally
      if (Math.random() < 0.02) { // ~2% chance = every ~3 seconds at 60fps
        console.log(`[Render] ${renderTime.toFixed(2)}ms | ${renderData.organisms.length} organisms, ${renderData.food.length} food | Pool: ${organismPool.size} graphics`);
      }
    } catch (error) {
      console.error('Fehler beim Rendern:', error);
    }
  }, [renderData, populations]);

  return (
    <div 
      ref={canvasRef} 
      className="border-2 border-gray-700 rounded-lg overflow-hidden"
      style={{ width: '1400px', height: '700px' }}
    />
  );
}
