import { useState, useRef, useEffect } from 'react';
import { useSimulationStore } from '../store/simulationStore';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function HelpPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Hallo! Ich bin dein AI-Assistent für die Evolution Simulation. Ich kenne alle Spielmechaniken, deine aktuellen Einstellungen und kann dir bei Fragen und Strategien helfen. Was möchtest du wissen?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { populations, worldConfig, renderData } = useSimulationStore();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Build system context from current game state
  const buildSystemContext = () => {
    const populationInfo = populations.map(pop => {
      const t = pop.defaultTraits;
      return `${pop.name} (${pop.color}): ${pop.initialCount} initial, Speed: ${t.speed.toFixed(1)}, Size: ${t.size}, MaxEnergy: ${t.maxEnergy}, Vision: ${t.visionRange}, Aggression: ${t.aggression.toFixed(1)}, Social: ${t.socialBehavior.toFixed(1)}`;
    }).join('\n');

    const stats = renderData ? `
Aktive Organismen: ${renderData.organisms.length}
Nahrung verfügbar: ${renderData.food.length}
` : 'Simulation nicht gestartet';

    return `
POPULATIONS-EINSTELLUNGEN:
${populationInfo}

WELT-KONFIGURATION:
Weltbreite: ${worldConfig.width}px
Welthöhe: ${worldConfig.height}px
Nahrung-Spawn-Rate: ${worldConfig.foodSpawnRate}
Max. Nahrung: ${worldConfig.maxFoodCount}
Nahrung-Energie: ${worldConfig.foodEnergyValue}

AKTUELLE STATISTIKEN:
${stats}
`;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          systemContext: buildSystemContext()
        }),
      });

      if (!response.ok) {
        throw new Error('API-Fehler');
      }

      const data = await response.json();

      const aiMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl h-[calc(100vh-4rem)]">
      <div className="bg-gray-800 rounded-xl shadow-2xl h-full flex flex-col overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            🤖 AI-Hilfe & Assistent
          </h1>
          <p className="text-blue-100 mt-2">
            Frag mich alles über die Evolution Simulation!
          </p>
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
                    <p className="text-xs opacity-50 mt-2">
                      {message.timestamp.toLocaleTimeString('de-DE', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
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
