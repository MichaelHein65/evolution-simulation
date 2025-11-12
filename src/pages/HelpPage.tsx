import { useState, useRef, useEffect } from 'react';
import { useSimulationStore } from '../store/simulationStore';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export default function HelpPage() {
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load chat history from localStorage
    const saved = localStorage.getItem('ai-chat-history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        return parsed.map((m: Message) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    }
    // Default welcome message
    return [{
      role: 'assistant',
      content: '👋 Hallo! Ich bin dein AI-Assistent für die Evolution Simulation. Ich kenne alle Spielmechaniken, deine aktuellen Einstellungen und kann dir bei Fragen und Strategien helfen. Was möchtest du wissen?',
      timestamp: new Date()
    }];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [wasRunning, setWasRunning] = useState(false);
  const [totalTokensUsed, setTotalTokensUsed] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { running, pauseSimulation, startSimulation } = useSimulationStore();

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('ai-chat-history', JSON.stringify(messages));
  }, [messages]);

  // Pause simulation when entering help page, resume when leaving
  useEffect(() => {
    if (running) {
      setWasRunning(true);
      pauseSimulation();
      console.log('⏸️ Simulation pausiert für AI-Hilfe');
    }

    return () => {
      // Resume simulation when leaving page if it was running before
      if (wasRunning) {
        startSimulation();
        console.log('▶️ Simulation fortgesetzt');
      }
    };
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Build system context from current game state
  const buildSystemContext = (state = useSimulationStore.getState()) => {
    const { populations, worldConfig, renderData } = state;
    
    const populationInfo = populations.map(pop => {
      const t = pop.defaultTraits;
      return `${pop.name} (${pop.color}): ${pop.initialCount} initial, Speed: ${t.speed.toFixed(1)}, Size: ${t.size}, MaxEnergy: ${t.maxEnergy}, Vision: ${t.visionRange}, Aggression: ${t.aggression.toFixed(1)}, Social: ${t.socialBehavior.toFixed(1)}, ReproductionRate: ${t.reproductionRate}, MaxAge: ${t.maxAge}`;
    }).join('\n');

    const stats = renderData ? `
Aktive Organismen: ${renderData.organisms.length}
Nahrung verfügbar: ${renderData.food.length}
` : 'Simulation nicht gestartet';

    return `
=== POPULATIONS-EINSTELLUNGEN ===
${populationInfo}

=== WELT-KONFIGURATION ===
Weltbreite: ${worldConfig.width}px
Welthöhe: ${worldConfig.height}px
Nahrung-Spawn-Rate: ${worldConfig.foodSpawnRate}
Max. Nahrung: ${worldConfig.maxFoodCount}
Nahrung-Energie-Wert: ${worldConfig.foodEnergyValue}

=== AKTUELLE STATISTIKEN ===
${stats}

=== SPIELMECHANIKEN (EXAKTE REGELN) ===

REPRODUKTION:
- Voraussetzungen:
  * Organismus muss mindestens 80% seiner MaxEnergy haben (energyThreshold = maxEnergy * 0.8)
  * Organismus muss mindestens 50 Ticks alt sein (ageThreshold = 50)
- Wahrscheinlichkeit pro Frame: reproductionRate / 100000
  * Beispiel: Bei reproductionRate=50 → 0.05% pro Frame → ~3% pro Sekunde
- Kosten: 50% der aktuellen Energie geht an das Nachkommen
- Nachkomme startet mit dieser Energie
- Mutation: Aktuell NICHT implementiert (geplant für später)

ALTERUNG & TOD:
- Jeder Tick erhöht das Alter um 1
- Tod durch Alter: wenn age >= maxAge
- Tod durch Hunger: wenn energy <= 0
- Organismen werden dann aus der Simulation entfernt

ENERGIE-SYSTEM:
- Bewegung kostet Energie: Jede Bewegung verbraucht Energie basierend auf Speed und Size
- Nahrung sammeln: Organismen in der Nähe von Nahrung nehmen sie auf
- Energie-Gewinn: foodEnergyValue wird zur Energie addiert
- Max-Energie: Begrenzt durch maxEnergy Trait

BEWEGUNG & WAHRNEHMUNG:
- Vision Range: Organismen sehen Nahrung und andere Organismen in diesem Radius
- Speed: Bestimmt wie schnell sich ein Organismus bewegt
- Agility: Beeinflusst Wendigkeit (wie schnell sie Richtung ändern)

SOZIALVERHALTEN:
- Social Behavior (0-100): Je höher, desto stärker Gruppenbildung
- Organismen mit hohem Social-Wert bilden Schwärme
- Visuell: Blaues Leuchten um Organismen in Gruppen
- Performance: Verwendet Spatial Hash Grid für O(1) Nachbar-Suche

AGGRESSION & JAGD:
- Aggression (0-100): Je höher, desto wahrscheinlicher Jagdverhalten
- Jäger greifen kleinere/schwächere Organismen an
- Erfolgreiche Jagd: Jäger bekommt Energie des Opfers
- Visuell: Oranges Leuchten beim aktiven Jagen
- Tod des Opfers bei erfolgreichem Angriff

PERFORMANCE-OPTIMIERUNGEN:
- Web Worker: Simulation läuft in separatem Thread (60 FPS)
- Spatial Hash Grid: O(1) Nachbar-Suche statt O(n²)
- Object Pooling: Wiederverwendbare Pixi.js Graphics
- Render-Throttling: Nur jeder 2. Frame wird gerendert (30 FPS Display)
- Max. Organismen: Theoretisch 5000+, praktisch begrenzt durch Browser

WICHTIG: 
- Alle Zahlen oben sind die EXAKTEN Werte aus dem Code
- Wenn du Fragen zu Mechaniken beantwortest, beziehe dich IMMER auf diese konkreten Werte
- KEINE Fantasie-Antworten - nur was hier dokumentiert ist!
`;
  };

    const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get fresh data from store right before sending
      const currentState = useSimulationStore.getState();
      const freshSystemContext = buildSystemContext(currentState);
      
      console.log('🔄 Aktuelle Simulations-Daten an AI gesendet:', {
        organismen: currentState.renderData?.organisms.length || 0,
        nahrung: currentState.renderData?.food.length || 0,
        tick: currentState.tick
      });
      
      // Don't send the initial greeting message
      const chatHistory = messages.slice(1).concat(userMessage);

      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: chatHistory,
          systemContext: freshSystemContext
        }),
      });

      if (!response.ok) {
        throw new Error('API-Fehler');
      }

      const data = await response.json();

      const aiMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        usage: data.usage // Token-Usage von OpenAI
      };

      // Update total tokens used
      if (data.usage) {
        setTotalTokensUsed(prev => prev + data.usage.total_tokens);
      }

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: '❌ Entschuldigung, es gab einen Fehler bei der Kommunikation mit der AI. Stelle sicher, dass der AI-Server läuft (npm run server).',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    const confirmClear = window.confirm('Möchtest du den Chat-Verlauf wirklich löschen?');
    if (confirmClear) {
      const welcomeMessage: Message = {
        role: 'assistant',
        content: '👋 Hallo! Ich bin dein AI-Assistent für die Evolution Simulation. Ich kenne alle Spielmechaniken, deine aktuellen Einstellungen und kann dir bei Fragen und Strategien helfen. Was möchtest du wissen?',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      localStorage.removeItem('ai-chat-history');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl h-[calc(100vh-4rem)]">
      {/* Pause Indicator */}
      {wasRunning && (
        <div className="mb-4 bg-yellow-900/50 border border-yellow-600 rounded-lg p-3 text-yellow-200 flex items-center gap-2">
          <span className="text-xl">⏸️</span>
          <span className="text-sm">
            Die Simulation wurde pausiert, damit du dich in Ruhe beraten lassen kannst. 
            Sie wird automatisch fortgesetzt, wenn du die Hilfe-Seite verlässt.
          </span>
        </div>
      )}
      
      <div className="bg-gray-800 rounded-xl shadow-2xl h-full flex flex-col overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                🤖 AI-Hilfe & Assistent
              </h1>
              <p className="text-blue-100 mt-2">
                Frag mich alles über die Evolution Simulation!
              </p>
              {totalTokensUsed > 0 && (
                <p className="text-blue-200 text-sm mt-1">
                  💰 Tokens verwendet: {totalTokensUsed.toLocaleString()} 
                  {' '}(≈ ${(totalTokensUsed * 0.000005).toFixed(4)})
                </p>
              )}
            </div>
            <button
              onClick={clearChat}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-200 px-4 py-2 rounded-lg transition-colors text-sm border border-red-400/30"
              title="Chat-Verlauf löschen"
            >
              🗑️ Chat löschen
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-900">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xl">
                    {message.role === 'user' ? '👤' : '🤖'}
                  </span>
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                    <div className="flex items-center gap-3 text-xs opacity-50 mt-2">
                      <span>
                        {message.timestamp.toLocaleTimeString('de-DE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      {message.usage && (
                        <span className="text-blue-400">
                          💰 {message.usage.total_tokens} tokens 
                          (${(message.usage.total_tokens * 0.000005).toFixed(4)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-2xl px-4 py-3 border border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🤖</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Stell mir eine Frage..."
              disabled={isLoading}
              className="flex-1 bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Senden
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Tipp: Drücke Enter zum Senden, Shift+Enter für neue Zeile
          </p>
        </div>
      </div>
    </div>
  );
}
