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
      content: `Du bist ein hilfreicher Assistent für die Evolution Simulation Web-App. 

AKTUELLE SPIEL-INFORMATIONEN:
${systemContext || 'Keine zusätzlichen Informationen verfügbar.'}

Deine Aufgabe:
- Beantworte Fragen zu Spielmechaniken, Strategien und Features
- Erkläre komplexe Konzepte einfach und verständlich
- Gib konkrete Tipps basierend auf den aktuellen Einstellungen
- Sei freundlich und hilfsbereit
- Antworte auf Deutsch, wenn die Frage auf Deutsch ist

WICHTIG: Du hast Zugriff auf die aktuellen Einstellungen und Statistiken der Simulation oben.`
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
