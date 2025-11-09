// Spatial Hash Grid for efficient neighbor queries
// This dramatically speeds up finding nearby organisms

export class SpatialHashGrid {
  private cellSize: number;
  private grid: Map<string, Set<any>>;

  constructor(cellSize: number = 100) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  // Clear all cells
  clear(): void {
    this.grid.clear();
  }

  // Get grid cell key for coordinates
  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  // Insert object into grid
  insert(x: number, y: number, object: any): void {
    const key = this.getCellKey(x, y);
    if (!this.grid.has(key)) {
      this.grid.set(key, new Set());
    }
    this.grid.get(key)!.add(object);
  }

  // Query objects within radius (much faster than checking all objects)
  queryRadius(x: number, y: number, radius: number): any[] {
    const results: any[] = [];
    const cellRadius = Math.ceil(radius / this.cellSize);
    const centerCellX = Math.floor(x / this.cellSize);
    const centerCellY = Math.floor(y / this.cellSize);

    // Check all cells in radius
    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
      for (let dy = -cellRadius; dy <= cellRadius; dy++) {
        const key = `${centerCellX + dx},${centerCellY + dy}`;
        const cell = this.grid.get(key);
        if (cell) {
          results.push(...Array.from(cell));
        }
      }
    }

    return results;
  }
}
