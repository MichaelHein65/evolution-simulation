import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { titleMelody } from '../audio/TitleMelody';
import { withBasePath } from '../utils/appPaths';

export default function LandingPage() {
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [isMusicStarted, setIsMusicStarted] = useState(false);
  const hasStartedRef = useRef(false);

  // Musik automatisch 5 Sekunden nach Start der App starten
  useEffect(() => {
    let delayTimeout: ReturnType<typeof setTimeout> | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    
    const startMusic = async () => {
      if (hasStartedRef.current) return;
      
      try {
        const success = await titleMelody.init();
        if (success) {
          await titleMelody.start();
          hasStartedRef.current = true;
          setIsMusicStarted(true);
        }
      } catch (e) {
        // Browser blockiert - bei nächster Interaktion versuchen
        console.log('Autoplay blocked, waiting for interaction...');
      }
    };
    
    // Nach 5 Sekunden automatisch starten
    delayTimeout = setTimeout(startMusic, 5000);

    // Fade-out beim Verlassen der Seite
    return () => {
      if (delayTimeout) clearTimeout(delayTimeout);
      if (retryTimeout) clearTimeout(retryTimeout);
      if (hasStartedRef.current) {
        titleMelody.fadeOut();
      }
    };
  }, []);

  // Toggle Musik an/aus
  const toggleMusic = () => {
    if (isMusicEnabled) {
      titleMelody.fadeOut();
      setIsMusicEnabled(false);
    } else {
      titleMelody.start();
      setIsMusicEnabled(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Sticky Header Navigation */}
      <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-blue-500/20 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Evolution Simulation
            </h1>
            <div className="flex items-center gap-4">
              {/* Music Toggle */}
              <button
                onClick={toggleMusic}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isMusicEnabled 
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50' 
                    : 'bg-gray-700/50 text-gray-400 hover:bg-purple-600/20 hover:text-purple-300 border border-gray-600/50'
                }`}
                title={isMusicEnabled ? 'Musik ausschalten' : 'Musik einschalten'}
              >
                {!isMusicStarted ? '🎵 Klick für Musik' : (isMusicEnabled ? '🎵 Musik an' : '🔇 Musik aus')}
              </button>
              <Link 
                to="/simulation"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105"
              >
                🚀 Starten
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center space-y-8">
          {/* Title */}
          <h2 className="text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Evolution Simulation
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Erlebe die Entstehung künstlichen Lebens in Echtzeit
          </p>

          {/* Hero Animation */}
          <div className="relative max-w-4xl mx-auto my-12 rounded-2xl overflow-hidden shadow-2xl border-4 border-blue-500/30">
            <img 
              src={withBasePath('20251109_Evolution_Intro.gif')}
              alt="Evolution Simulation Animation"
              className="w-full h-auto"
            />
          </div>

          {/* CTA Button */}
          <Link 
            to="/simulation"
            className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-xl px-12 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
          >
            🚀 Simulation starten
          </Link>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left">
            {/* Feature 1 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/50 transition-all">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2 text-blue-400">Web Worker Performance</h3>
              <p className="text-gray-400">
                Multi-Threading Architektur ermöglicht bis zu 5000 Organismen ohne Performance-Verlust
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all">
              <div className="text-4xl mb-4">🧬</div>
              <h3 className="text-xl font-bold mb-2 text-purple-400">5 Basis-Populationen</h3>
              <p className="text-gray-400">
                Sprinter, Tank, Jäger, Sammler und Allrounder mit je 12 anpassbaren Eigenschaften
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-pink-500/20 hover:border-pink-500/50 transition-all">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2 text-pink-400">Live Evolution Tracking</h3>
              <p className="text-gray-400">
                Interaktive Grafiken mit Zoom & Pan zeigen die Entwicklung der Populationen in Echtzeit
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-16 space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold">Wie funktioniert es?</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Die Simulation basiert auf einfachen Regeln: Organismen bewegen sich, suchen Nahrung, 
              vermehren sich und sterben. Doch aus diesen simplen Mechanismen entstehen komplexe 
              Verhaltensweisen wie Schwarmbildung, Jagdstrategien und Ressourcen-Wettbewerb.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              Dank optimierter Algorithmen (Spatial Hash Grid, Object Pooling) läuft die Simulation 
              flüssig in deinem Browser - ohne Limits!
            </p>
          </div>

          {/* Footer Links */}
          <div className="mt-16 pt-8 border-t border-gray-700 flex flex-wrap justify-center gap-6 text-gray-400">
            <a 
              href="https://github.com/MichaelHein65/evolution-simulation" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
            >
              📦 GitHub Repository
            </a>
            <span>•</span>
            <Link to="/evolution" className="hover:text-purple-400 transition-colors">
              📈 Evolution Grafiken
            </Link>
            <span>•</span>
            <Link to="/settings" className="hover:text-pink-400 transition-colors">
              ⚙️ Einstellungen
            </Link>
            <span>•</span>
            <Link to="/help" className="hover:text-green-400 transition-colors">
              🤖 AI-Hilfe
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
