// Renderer using Pixi.js with Object Pooling
class Renderer {
    constructor(container) {
        this.container = container;
        this.app = null;
        this.organismGraphicsPool = null;
        this.foodGraphicsPool = null;
        this.organismGraphicsMap = new Map();
        this.foodGraphicsMap = new Map();
        
        // Camera properties for pan and zoom
        this.camera = {
            x: 0,
            y: 0,
            scale: 1,
            minScale: 0.2,
            maxScale: 2
        };
        
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        this.initialize();
    }

    initialize() {
        // Create Pixi application
        this.app = new PIXI.Application({
            width: CONFIG.CANVAS_WIDTH,
            height: CONFIG.CANVAS_HEIGHT,
            backgroundColor: 0xf0f0f0,
            antialias: true
        });

        this.container.appendChild(this.app.view);

        // Create containers
        this.worldContainer = new PIXI.Container();
        this.app.stage.addChild(this.worldContainer);

        // Initialize object pools
        this.initializeObjectPools();

        // Setup camera controls
        this.setupCameraControls();

        // Center camera
        this.camera.x = -CONFIG.WORLD_WIDTH / 2 + CONFIG.CANVAS_WIDTH / 2;
        this.camera.y = -CONFIG.WORLD_HEIGHT / 2 + CONFIG.CANVAS_HEIGHT / 2;
        this.updateCamera();
    }

    initializeObjectPools() {
        // Organism graphics pool
        this.organismGraphicsPool = new ObjectPool(
            () => {
                const graphics = new PIXI.Graphics();
                this.worldContainer.addChild(graphics);
                return graphics;
            },
            (graphics) => {
                graphics.clear();
                graphics.visible = false;
            },
            CONFIG.OBJECT_POOL_SIZE
        );

        // Food graphics pool
        this.foodGraphicsPool = new ObjectPool(
            () => {
                const graphics = new PIXI.Graphics();
                this.worldContainer.addChild(graphics);
                return graphics;
            },
            (graphics) => {
                graphics.clear();
                graphics.visible = false;
            },
            CONFIG.FOOD_COUNT * 2
        );
    }

    setupCameraControls() {
        const canvas = this.app.view;

        // Mouse wheel zoom
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            this.camera.scale = Math.max(
                this.camera.minScale,
                Math.min(this.camera.maxScale, this.camera.scale * zoomFactor)
            );
            this.updateCamera();
        });

        // Mouse drag pan
        canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });

        canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const dx = e.clientX - this.lastMouseX;
                const dy = e.clientY - this.lastMouseY;
                this.camera.x += dx;
                this.camera.y += dy;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                this.updateCamera();
            }
        });

        canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
        });
    }

    updateCamera() {
        this.worldContainer.position.set(this.camera.x, this.camera.y);
        this.worldContainer.scale.set(this.camera.scale, this.camera.scale);
    }

    render(state) {
        // Release all graphics back to pool
        for (const graphics of this.organismGraphicsMap.values()) {
            this.organismGraphicsPool.release(graphics);
        }
        for (const graphics of this.foodGraphicsMap.values()) {
            this.foodGraphicsPool.release(graphics);
        }
        this.organismGraphicsMap.clear();
        this.foodGraphicsMap.clear();

        // Render organisms
        for (const organism of state.organisms) {
            if (organism.alive) {
                let graphics = this.organismGraphicsPool.acquire();
                graphics.visible = true;
                
                // Draw organism
                graphics.clear();
                graphics.beginFill(CONFIG.POPULATION_COLORS[organism.populationId]);
                graphics.drawCircle(organism.x, organism.y, organism.size);
                graphics.endFill();

                // Draw vision range (semi-transparent)
                if (this.camera.scale > 0.5) {
                    graphics.lineStyle(1, CONFIG.POPULATION_COLORS[organism.populationId], 0.1);
                    graphics.drawCircle(organism.x, organism.y, organism.traits.vision);
                }

                // Energy indicator
                if (this.camera.scale > 0.5) {
                    const energyRatio = organism.energy / CONFIG.BASE_ENERGY;
                    const barWidth = organism.size * 2;
                    const barHeight = 3;
                    graphics.beginFill(0x000000, 0.3);
                    graphics.drawRect(organism.x - barWidth / 2, organism.y - organism.size - 5, barWidth, barHeight);
                    graphics.endFill();
                    graphics.beginFill(energyRatio > 0.5 ? 0x2ecc71 : 0xe74c3c);
                    graphics.drawRect(organism.x - barWidth / 2, organism.y - organism.size - 5, barWidth * Math.min(1, energyRatio), barHeight);
                    graphics.endFill();
                }

                this.organismGraphicsMap.set(organism.id, graphics);
            }
        }

        // Render food
        for (const foodItem of state.food) {
            if (foodItem.available) {
                let graphics = this.foodGraphicsPool.acquire();
                graphics.visible = true;
                
                graphics.clear();
                graphics.beginFill(0x27ae60);
                graphics.drawCircle(foodItem.x, foodItem.y, 3);
                graphics.endFill();

                this.foodGraphicsMap.set(foodItem.id, graphics);
            }
        }
    }

    destroy() {
        if (this.app) {
            this.app.destroy(true);
        }
    }
}
