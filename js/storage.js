// LocalStorage persistence
class Storage {
    constructor() {
        this.STORAGE_KEY = 'evolution_simulation_state';
    }

    save(state) {
        try {
            const serialized = JSON.stringify(state);
            localStorage.setItem(this.STORAGE_KEY, serialized);
            return true;
        } catch (error) {
            console.error('Failed to save state:', error);
            return false;
        }
    }

    load() {
        try {
            const serialized = localStorage.getItem(this.STORAGE_KEY);
            if (serialized) {
                return JSON.parse(serialized);
            }
            return null;
        } catch (error) {
            console.error('Failed to load state:', error);
            return null;
        }
    }

    clear() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('Failed to clear state:', error);
            return false;
        }
    }

    hasState() {
        return localStorage.getItem(this.STORAGE_KEY) !== null;
    }
}
