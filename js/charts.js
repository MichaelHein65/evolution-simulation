// Charts for evolution statistics with zoom and pan
class Charts {
    constructor() {
        this.populationChart = document.getElementById('populationChart');
        this.traitChart = document.getElementById('traitChart');
        
        this.populationData = Array.from({ length: 5 }, () => []);
        this.traitData = {};
        
        this.maxDataPoints = 100;
        this.currentTrait = 'speed';
        
        // Pan and zoom state
        this.populationViewport = { offsetX: 0, offsetY: 0, zoom: 1 };
        this.traitViewport = { offsetX: 0, offsetY: 0, zoom: 1 };
        
        this.setupCharts();
    }

    setupCharts() {
        // Setup population chart interactions
        this.setupChartInteractions(this.populationChart, this.populationViewport);
        this.setupChartInteractions(this.traitChart, this.traitViewport);
    }

    setupChartInteractions(canvas, viewport) {
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;

        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastX = e.offsetX;
            lastY = e.offsetY;
        });

        canvas.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const dx = e.offsetX - lastX;
                const dy = e.offsetY - lastY;
                viewport.offsetX += dx;
                viewport.offsetY += dy;
                lastX = e.offsetX;
                lastY = e.offsetY;
                this.render();
            }
        });

        canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });

        canvas.addEventListener('mouseleave', () => {
            isDragging = false;
        });

        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            viewport.zoom = Math.max(0.5, Math.min(3, viewport.zoom * zoomFactor));
            this.render();
        });
    }

    update(stats) {
        // Update population data
        for (let i = 0; i < 5; i++) {
            this.populationData[i].push(stats.populationCounts[i]);
            if (this.populationData[i].length > this.maxDataPoints) {
                this.populationData[i].shift();
            }
        }

        // Update trait data
        if (!this.traitData[this.currentTrait]) {
            this.traitData[this.currentTrait] = Array.from({ length: 5 }, () => []);
        }
        
        for (let i = 0; i < 5; i++) {
            const avgTrait = stats.averageTraits[i]?.[this.currentTrait] || 0;
            this.traitData[this.currentTrait][i].push(avgTrait);
            if (this.traitData[this.currentTrait][i].length > this.maxDataPoints) {
                this.traitData[this.currentTrait][i].shift();
            }
        }

        this.render();
    }

    render() {
        this.renderPopulationChart();
        this.renderTraitChart();
    }

    renderPopulationChart() {
        const canvas = this.populationChart;
        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;

        ctx.clearRect(0, 0, width, height);

        // Apply transformations
        ctx.save();
        ctx.translate(this.populationViewport.offsetX, this.populationViewport.offsetY);
        ctx.scale(this.populationViewport.zoom, this.populationViewport.zoom);

        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        // Find max value
        let maxValue = 0;
        for (const data of this.populationData) {
            maxValue = Math.max(maxValue, ...data);
        }
        maxValue = Math.max(maxValue, 10); // Minimum scale

        // Draw axes
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Draw grid
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = padding + (chartHeight / gridLines) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Draw population lines
        for (let popId = 0; popId < 5; popId++) {
            const data = this.populationData[popId];
            if (data.length < 2) continue;

            ctx.strokeStyle = '#' + CONFIG.POPULATION_COLORS[popId].toString(16).padStart(6, '0');
            ctx.lineWidth = 2;
            ctx.beginPath();

            for (let i = 0; i < data.length; i++) {
                const x = padding + (chartWidth / (this.maxDataPoints - 1)) * i;
                const y = height - padding - (data[i] / maxValue) * chartHeight;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }

        // Draw labels
        ctx.restore();
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('Population Count', padding, 20);
        ctx.fillText('Time', width - 60, height - 10);
        ctx.fillText('0', padding - 10, height - padding + 5);
        ctx.fillText(maxValue.toFixed(0), padding - 30, padding + 5);
    }

    renderTraitChart() {
        const canvas = this.traitChart;
        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;

        ctx.clearRect(0, 0, width, height);

        // Apply transformations
        ctx.save();
        ctx.translate(this.traitViewport.offsetX, this.traitViewport.offsetY);
        ctx.scale(this.traitViewport.zoom, this.traitViewport.zoom);

        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        const traitConfig = CONFIG.TRAITS[this.currentTrait];
        const maxValue = traitConfig ? traitConfig.max : 10;
        const minValue = traitConfig ? traitConfig.min : 0;

        // Draw axes
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Draw grid
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = padding + (chartHeight / gridLines) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Draw trait lines
        const data = this.traitData[this.currentTrait];
        if (data) {
            for (let popId = 0; popId < 5; popId++) {
                const popData = data[popId];
                if (popData.length < 2) continue;

                ctx.strokeStyle = '#' + CONFIG.POPULATION_COLORS[popId].toString(16).padStart(6, '0');
                ctx.lineWidth = 2;
                ctx.beginPath();

                for (let i = 0; i < popData.length; i++) {
                    const x = padding + (chartWidth / (this.maxDataPoints - 1)) * i;
                    const normalizedValue = (popData[i] - minValue) / (maxValue - minValue);
                    const y = height - padding - normalizedValue * chartHeight;
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            }
        }

        // Draw labels
        ctx.restore();
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        const label = traitConfig ? traitConfig.label : this.currentTrait;
        ctx.fillText(label, padding, 20);
        ctx.fillText('Time', width - 60, height - 10);
        ctx.fillText(minValue.toFixed(1), padding - 30, height - padding + 5);
        ctx.fillText(maxValue.toFixed(1), padding - 30, padding + 5);
    }

    setCurrentTrait(trait) {
        this.currentTrait = trait;
        if (!this.traitData[trait]) {
            this.traitData[trait] = Array.from({ length: 5 }, () => []);
        }
        this.render();
    }

    reset() {
        this.populationData = Array.from({ length: 5 }, () => []);
        this.traitData = {};
        this.populationViewport = { offsetX: 0, offsetY: 0, zoom: 1 };
        this.traitViewport = { offsetX: 0, offsetY: 0, zoom: 1 };
        this.render();
    }
}
