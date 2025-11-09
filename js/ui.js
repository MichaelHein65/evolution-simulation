// UI controller for trait editor and controls
class UI {
    constructor(onTraitChange) {
        this.onTraitChange = onTraitChange;
        this.currentPopulation = 0;
        this.populationTraits = [];
        
        // Initialize default traits for each population
        for (let i = 0; i < 5; i++) {
            this.populationTraits[i] = {};
            for (const [key, config] of Object.entries(CONFIG.TRAITS)) {
                this.populationTraits[i][key] = config.default;
            }
        }

        this.setupPopulationTabs();
        this.renderTraitEditor();
    }

    setupPopulationTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Update current population
                this.currentPopulation = parseInt(tab.dataset.pop);
                this.renderTraitEditor();
            });
        });
    }

    renderTraitEditor() {
        const editor = document.getElementById('traitEditor');
        editor.innerHTML = '';

        const traits = this.populationTraits[this.currentPopulation];

        for (const [traitKey, traitConfig] of Object.entries(CONFIG.TRAITS)) {
            const traitItem = document.createElement('div');
            traitItem.className = 'trait-item';

            const label = document.createElement('label');
            label.textContent = traitConfig.label;
            traitItem.appendChild(label);

            const input = document.createElement('input');
            input.type = 'range';
            input.min = traitConfig.min;
            input.max = traitConfig.max;
            input.step = (traitConfig.max - traitConfig.min) / 100;
            input.value = traits[traitKey];
            
            const valueDisplay = document.createElement('div');
            valueDisplay.className = 'trait-value';
            valueDisplay.textContent = traits[traitKey].toFixed(2);

            input.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                valueDisplay.textContent = value.toFixed(2);
                this.populationTraits[this.currentPopulation][traitKey] = value;
                
                // Notify about trait change
                if (this.onTraitChange) {
                    this.onTraitChange(this.currentPopulation, this.populationTraits[this.currentPopulation]);
                }
            });

            traitItem.appendChild(input);
            traitItem.appendChild(valueDisplay);
            editor.appendChild(traitItem);
        }
    }

    updateStats(generation, organismCount, fps) {
        document.getElementById('generation').textContent = generation;
        document.getElementById('organismCount').textContent = organismCount;
        document.getElementById('fps').textContent = fps.toFixed(1);
    }

    getPopulationTraits(populationId) {
        return this.populationTraits[populationId];
    }

    setPopulationTraits(populationId, traits) {
        this.populationTraits[populationId] = { ...traits };
        if (populationId === this.currentPopulation) {
            this.renderTraitEditor();
        }
    }
}
