import { useEffect, useRef } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import SimulationCanvas2 from '../components/Simulation/SimulationCanvas2';
import ControlPanel from '../components/Simulation/ControlPanel';
import StatsDisplay from '../components/Simulation/StatsDisplay';

export default function SimulationPage() {
  const { initializeSimulation, worker, running, pauseSimulation } = useSimulationStore();
  const initializedRef = useRef<boolean>(false);
  const wasRunningRef = useRef<boolean>(false);

  // Initialize simulation only once on first mount
  useEffect(() => {
    if (!initializedRef.current && !worker) {
      console.log('🚀 Initialisiere Simulation mit Web Worker...');
      initializeSimulation();
      initializedRef.current = true;
    }
  }, [initializeSimulation, worker]);

  // Pause simulation when leaving the page, resume when returning
  useEffect(() => {
    // Save running state when component mounts
    wasRunningRef.current = running;

    return () => {
      // Cleanup: Pause simulation when leaving the page
      if (running) {
        console.log('⏸️ Pause simulation (leaving page)');
        pauseSimulation();
      }
    };
  }, [running, pauseSimulation]);

  return (
    <div className="container mx-auto px-4 py-4 max-w-screen-2xl">
      <div className="space-y-4">
        {/* Main Canvas Area */}
        <SimulationCanvas2 />

        {/* Controls and Stats - Side by Side Below */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ControlPanel />
          <StatsDisplay />
        </div>
      </div>
    </div>
  );
}
