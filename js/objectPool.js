// Object Pool for Pixi.js Graphics objects
class ObjectPool {
    constructor(createFn, resetFn, initialSize = 100) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.available = [];
        this.inUse = new Set();
        
        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.available.push(this.createFn());
        }
    }

    // Get an object from the pool
    acquire() {
        let obj;
        if (this.available.length > 0) {
            obj = this.available.pop();
        } else {
            obj = this.createFn();
        }
        this.inUse.add(obj);
        return obj;
    }

    // Return an object to the pool
    release(obj) {
        if (this.inUse.has(obj)) {
            this.inUse.delete(obj);
            this.resetFn(obj);
            this.available.push(obj);
        }
    }

    // Release all objects
    releaseAll() {
        for (const obj of this.inUse) {
            this.resetFn(obj);
            this.available.push(obj);
        }
        this.inUse.clear();
    }

    // Get pool statistics
    getStats() {
        return {
            available: this.available.length,
            inUse: this.inUse.size,
            total: this.available.length + this.inUse.size
        };
    }
}
