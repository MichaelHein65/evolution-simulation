# 🧬 Evolution Simulation

Interactive Evolution Simulation with Web Worker Performance Architecture

## Features

### Performance Architecture
- **Web Worker Multi-Threading**: Simulation runs in a separate thread for smooth 60 FPS rendering
- **Object Pooling**: Pixi.js graphics objects are pooled and reused to minimize garbage collection
- **Spatial Hash Grid**: O(1) neighbor lookup for efficient collision detection and interaction
- **Optimized for 1000+ Organisms**: Handles large populations with minimal performance impact

### Simulation Features
- **5 Base Populations**: Each with distinct colors and editable traits
- **12 Editable Traits**:
  - Speed: Movement velocity
  - Size: Visual size and collision radius
  - Vision Range: How far organisms can see
  - Strength: Combat effectiveness
  - Aggression: Likelihood to attack
  - Cooperation: Social behavior tendency
  - Metabolism: Energy consumption rate
  - Intelligence: Decision-making quality
  - Camouflage: Stealth ability
  - Lifespan: Maximum age
  - Reproduction Rate: Breeding frequency
  - Social Behavior: Group interaction tendency

### Behavioral Systems
- **Hunting Mechanics**: Organisms hunt weaker prey based on strength and aggression
- **Social Behavior**: Cooperation and group dynamics
- **Food Seeking**: Autonomous resource gathering
- **Flee Response**: Escape from threats
- **Evolution**: Traits mutate across generations

### Visualization
- **Zoom & Pan**: Interactive camera controls in simulation canvas
- **Evolution Charts**: Real-time population and trait statistics with zoom/pan
- **Energy Indicators**: Visual health bars for organisms
- **Vision Range Display**: See organism perception radius

### Data Persistence
- **LocalStorage**: Save and load simulation states
- **Generation Tracking**: Monitor evolutionary progress
- **Statistics**: Population counts and average traits per population

## Installation

```bash
# Clone the repository
git clone https://github.com/MichaelHein65/evolution-simulation.git
cd evolution-simulation

# Install dependencies
npm install

# Start development server
npm run dev
```

Then open http://localhost:8080 in your browser.

## Usage

### Controls
- **Start**: Begin the simulation
- **Pause**: Halt the simulation
- **Reset**: Restart with initial populations
- **Save**: Persist current state to localStorage
- **Load**: Restore saved simulation state

### Trait Editing
1. Click on population tabs (Pop 1-5) to select a population
2. Adjust trait sliders to modify population characteristics
3. Changes apply to all living organisms in that population
4. New offspring inherit and mutate these traits

### Camera Controls
- **Mouse Wheel**: Zoom in/out
- **Click & Drag**: Pan around the simulation world
- **Charts**: Click and drag on charts to pan, scroll to zoom

## Architecture

### Web Worker
The simulation logic runs in `simulationWorker.js`, completely separate from the rendering thread. This ensures smooth 60 FPS even with 1000+ organisms.

### Spatial Hash Grid
Divides the world into grid cells for O(1) neighbor lookup instead of O(n²) all-pairs checking. Critical for performance with many organisms.

### Object Pooling
Pixi.js graphics objects are expensive to create/destroy. The pool maintains reusable objects, dramatically reducing garbage collection overhead.

## Performance Tips

- Use Web Worker mode for best performance (enabled by default)
- Spatial hash grid automatically optimizes neighbor searches
- Object pool size can be adjusted in `config.js`
- Reduce vision range for faster computation with many organisms

## Technical Stack

- **Pixi.js**: High-performance 2D WebGL rendering
- **Web Workers**: Multi-threaded simulation
- **Canvas API**: Evolution charts
- **LocalStorage**: State persistence
- **Vanilla JavaScript**: No framework dependencies

## Browser Support

Modern browsers with ES6+ support:
- Chrome/Edge 60+
- Firefox 55+
- Safari 11+

## License

MIT
