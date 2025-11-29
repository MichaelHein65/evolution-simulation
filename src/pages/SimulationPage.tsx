import ControlPanel from '../components/Simulation/ControlPanel';
import StatsDisplay from '../components/Simulation/StatsDisplay';
import { AudioControls } from '../components/AudioControls';

export default function SimulationPage() {
  return (
    <div className="container mx-auto px-4 py-4 max-w-screen-2xl">
      <div className="space-y-4">
        {/* Canvas is now in App.tsx - only show controls here */}
        
        {/* Controls and Stats - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ControlPanel />
          <StatsDisplay />
          <AudioControls />
        </div>
      </div>
    </div>
  );
}
