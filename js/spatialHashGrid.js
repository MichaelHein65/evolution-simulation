// Spatial Hash Grid for O(1) neighbor lookup
class SpatialHashGrid {
    constructor(cellSize, worldWidth, worldHeight) {
        this.cellSize = cellSize;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.cols = Math.ceil(worldWidth / cellSize);
        this.rows = Math.ceil(worldHeight / cellSize);
        this.grid = new Map();
    }

    // Get cell key from position
    getCellKey(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        return `${col},${row}`;
    }

    // Insert an object into the grid
    insert(obj) {
        const key = this.getCellKey(obj.x, obj.y);
        if (!this.grid.has(key)) {
            this.grid.set(key, []);
        }
        this.grid.get(key).push(obj);
    }

    // Clear the grid
    clear() {
        this.grid.clear();
    }

    // Get all objects in neighboring cells within radius
    getNearby(x, y, radius) {
        const nearby = [];
        const cellRadius = Math.ceil(radius / this.cellSize);
        const centerCol = Math.floor(x / this.cellSize);
        const centerRow = Math.floor(y / this.cellSize);

        for (let col = centerCol - cellRadius; col <= centerCol + cellRadius; col++) {
            for (let row = centerRow - cellRadius; row <= centerRow + cellRadius; row++) {
                const key = `${col},${row}`;
                const cell = this.grid.get(key);
                if (cell) {
                    nearby.push(...cell);
                }
            }
        }

        return nearby;
    }

    // Get objects in a specific cell
    getCell(x, y) {
        const key = this.getCellKey(x, y);
        return this.grid.get(key) || [];
    }

    // Get all objects in the grid
    getAll() {
        const all = [];
        for (const cell of this.grid.values()) {
            all.push(...cell);
        }
        return all;
    }
}
