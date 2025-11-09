import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// OpenAI Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, systemContext } = req.body;

    // System-Nachricht mit Spiel-Kontext
    const systemMessage = {
      role: 'system',
      content: `Du bist ein EXPERTEN-ASSISTENT für die Evolution Simulation Web-App. 

KRITISCHE REGEL: Du darfst NUR Informationen verwenden, die in den SPIEL-INFORMATIONEN unten stehen. KEINE Fantasie, KEINE Vermutungen!

AKTUELLE SPIEL-INFORMATIONEN:
${systemContext || 'Keine zusätzlichen Informationen verfügbar.'}

Deine Aufgabe:
- Beantworte Fragen EXAKT basierend auf den obigen Spielmechaniken
- Wenn eine Information NICHT in den Spiel-Informationen steht, sage klar: "Das ist aktuell nicht implementiert" oder "Dazu habe ich keine Informationen"
- Gib konkrete Zahlen und Werte aus den Einstellungen an (z.B. "80% Energie" nicht nur "viel Energie")
- Erkläre komplexe Konzepte einfach, aber präzise
- Gib praktische Tipps basierend auf den aktuellen Einstellungen
- Antworte auf Deutsch
- Sei freundlich und hilfsbereit

BEISPIELE FÜR GUTE ANTWORTEN:
- "Die Reproduktion wird durch ZWEI Faktoren getriggert: 1) Der Organismus muss mindestens 80% seiner MaxEnergy haben, UND 2) er muss mindestens 50 Ticks alt sein."
- "Die Reproduktionswahrscheinlichkeit pro Frame ist reproductionRate / 100000. Bei deiner aktuellen Einstellung von reproductionRate=50 sind das 0.05% pro Frame."

BEISPIELE FÜR SCHLECHTE ANTWORTEN:
- "Organismen vermehren sich, wenn sie genug Energie haben" (zu vage!)
- "Es gibt verschiedene Mutationen" (FALSCH - Mutationen sind nicht implementiert!)

WICHTIG: Du bist kein ChatGPT der spekuliert - du bist ein präzises Handbuch für DIESE spezifische Simulation!`
    };

    // OpenAI API Call
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({ 
      response: aiResponse,
      usage: completion.usage 
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ 
      error: 'Fehler bei der AI-Kommunikation',
      details: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Evolution Simulation AI Server läuft' });
});

app.listen(port, () => {
  console.log(`🤖 AI Help Server läuft auf http://localhost:${port}`);
  console.log(`✅ OpenAI API-Key: ${process.env.OPENAI_API_KEY ? 'Gefunden' : 'FEHLT!'}`);
});
