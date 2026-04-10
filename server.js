import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT || 3001);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');
const indexFile = path.join(distDir, 'index.html');
const shouldServeStatic = process.env.NODE_ENV === 'production' && fs.existsSync(indexFile);

// Middleware
app.use(cors());
app.use(express.json());

// OpenAI Client
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({
        error: 'OPENAI_API_KEY fehlt',
        details: 'Der AI-Server ist erreichbar, aber der API-Key ist nicht gesetzt.'
      });
    }

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
  res.json({
    status: 'ok',
    message: 'Evolution Simulation AI Server läuft',
    staticFrontend: shouldServeStatic
  });
});

if (shouldServeStatic) {
  app.use(express.static(distDir, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      }
    }
  }));

  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.sendFile(indexFile);
  });
}

app.listen(port, () => {
  console.log(`🤖 Evolution Server läuft auf http://localhost:${port}`);
  if (shouldServeStatic) {
    console.log(`🌐 Frontend wird statisch aus ${distDir} ausgeliefert`);
  } else {
    console.log('🛠️ Frontend wird im Dev-Modus separat über Vite erwartet');
  }
  console.log(`✅ OpenAI API-Key: ${process.env.OPENAI_API_KEY ? 'Gefunden' : 'FEHLT!'}`);
});
