# 🧬 Evolution Simulation

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646cff.svg)](https://vitejs.dev/)
[![Pixi.js](https://img.shields.io/badge/Pixi.js-8.5-ff6680.svg)](https://pixijs.com/)
[![Version](https://img.shields.io/badge/Version-1.3.0-green.svg)](https://github.com/MichaelHein65/evolution-simulation)
[![AI](https://img.shields.io/badge/AI-GPT--4o-orange.svg)](https://openai.com/)

Eine hochperformante, interaktive Evolution-Simulation mit Web Worker Multi-Threading Architektur und AI-gestützter Hilfe. Beobachte wie verschiedene Organismen-Populationen um Ressourcen konkurrieren, jagen, Schwärme bilden und sich entwickeln.

🌐 **[Live Demo](https://michaelhein65.github.io/evolution-simulation/)**

## ✨ Hauptfeatures

### 🤖 AI-Hilfe (NEU in v1.3.0)
- **ChatGPT-4o Integration** - Intelligenter Assistent für Fragen und Strategien
- **Kontext-Bewusst** - Kennt alle aktuellen Einstellungen und Live-Statistiken
- **Natürlichsprachlich** - Beantwortet Fragen auf Deutsch
- **Modernes Chat-Interface** - Message-History mit Auto-Scroll

### 🎯 Landing Page
- **Professionelle Begrüßungsseite** mit animiertem Intro
- **Feature-Highlights** - Übersicht aller Funktionen
- **Sticky Navigation** - Bleibt beim Scrollen sichtbar
- **Responsive Design** - Optimiert für alle Bildschirmgrößen

### 🚀 Performance
- **Web Worker Architektur** - Simulation läuft in separatem Thread (60 FPS auch bei 1000+ Organismen)
- **Object Pooling** - Wiederverwendbare Pixi.js Graphics-Objekte
- **Spatial Hash Grid** - O(1) Nachbar-Suche statt O(n²)
- **Smart Rendering** - Nur jeder 2. Frame wird gerendert

### 🎮 Simulation
- **5 Basis-Populationen** mit unterschiedlichen Strategien:
  - 🏃 **Sprinter** - Schnell und wendig
  - 🛡️ **Tank** - Robust mit hoher Energie
  - 🦁 **Jäger** - Aggressiv, jagt andere Organismen
  - 🌿 **Sammler** - Effizient bei Nahrungssuche
  - ⚖️ **Allrounder** - Ausgewogene Eigenschaften
  
- **Komplexe Verhaltensweisen**:
  - 💙 Sozialverhalten & Schwarmbildung
  - 🧡 Jagd-Mechanik (Räuber-Beute-Dynamik)
  - ⚡ Energie-System mit Fortpflanzung
  - 💀 Natürlicher Tod durch Alter oder Hunger
  
- **12 editierbare Traits** pro Population:
  - Geschwindigkeit, Größe, Energie
  - Wahrnehmung, Aggression, Sozialverhalten
  - Reproduktionsrate, Lebenserwartung, u.v.m.

### 📊 Visualisierung & Daten
- **Echtzeit-Canvas** mit Pixi.js (1400x700px)
- **Evolution-Grafiken** mit Zoom & Pan durch die Zeitachse
- **Live-Statistiken** - Populations-Entwicklung, Energie-Level
- **Visuelle Indikatoren**:
  - 🔴 Rot = Niedrige Energie (<30%)
  - 🧡 Orange = Jagt gerade
  - 💙 Blau = In Gruppe/Schwarm

### ⚙️ Einstellungen & Persistierung
- **Auto-Speicherung** - Einstellungen bleiben nach Neustart erhalten (localStorage)
- **Reset-Funktion** - Zurück zu Standard-Werten
- **Anpassbare Welt** - Nahrung-Spawn, Weltgröße, etc.

## 🚀 Schnellstart

```bash
# Repository klonen
git clone https://github.com/MichaelHein65/evolution-simulation.git
cd evolution-simulation

# Dependencies installieren
npm install

# OpenAI API-Key setzen (für AI-Hilfe)
export OPENAI_API_KEY="dein-api-key-hier"

# Development Server starten (Frontend + Backend)
npm run dev:all
```

Die Anwendung läuft dann auf `http://localhost:5173/` (Frontend) und `http://localhost:3001/` (AI-Backend)

### macOS Launcher

Für den lokalen Start auf macOS liegt zusätzlich ein fertiger App-Launcher im Projekt:

- **`Evolution.app`** startet Frontend und AI-Backend ohne sichtbares Terminal
- **Safari** wird automatisch geöffnet, nach vorne geholt und in den Vollbildmodus geschaltet
- **`launch_evolution.sh`** übernimmt den eigentlichen Start und schreibt Fehlerdetails nach `.evolution-launch.log`

Direktstart per Doppelklick:

```bash
open Evolution.app
```

Direktstart per Shell:

```bash
./launch_evolution.sh
```

### Alternative Start-Befehle

```bash
npm run dev        # Nur Frontend
npm run server     # Nur AI-Backend
npm run dev:all    # Frontend + Backend gleichzeitig
npm start          # Server + Safari öffnen
npm run start:fullscreen  # Server + Safari im Fullscreen
./launch_evolution.sh     # macOS Launcher ohne Terminal
```

## 🎮 Bedienung

### Landing Page
- 🚀 **Simulation starten** - Zur interaktiven Simulation
- 📖 **Feature-Übersicht** - Alle Funktionen im Überblick
- 🔗 **Quick Links** - Direkt zu Evolution-Grafiken, Einstellungen oder AI-Hilfe

### AI-Hilfe-Seite (NEU!)
- 💬 **Fragen stellen** - Alles über Spielmechaniken, Strategien, Features
- 📊 **Kontext-basierte Antworten** - AI kennt deine aktuellen Einstellungen
- 🎯 **Tipps & Tricks** - Konkrete Empfehlungen für bessere Ergebnisse
- ⌨️ **Enter** zum Senden, **Shift+Enter** für neue Zeile

### Simulation-Seite
- ▶️ **Play/Pause** - Simulation starten/stoppen
- 🔄 **Reset** - Simulation zurücksetzen
- ⚡ **Speed** - Geschwindigkeit anpassen (0.5x - 5x)

### Evolution-Seite
- 🖱️ **Mausrad** - In Zeitachse zoomen
- ✋ **Ziehen** - Durch Zeit navigieren
- 🖱️ **Doppelklick** - Zurück zur Original-Ansicht

### Einstellungen-Seite
- ✏️ Alle Traits der 5 Populationen anpassen
- 🌍 Welt-Parameter konfigurieren
- 💾 Änderungen werden automatisch gespeichert
- 🔄 "Alle zurücksetzen" - Zurück zu Standard-Werten

## 🛠️ Tech Stack

| Technologie | Version | Zweck |
|------------|---------|-------|
| React | 18.3 | UI Framework |
| TypeScript | 5.6 | Type Safety |
| Vite | 6.4 | Build Tool & Dev Server |
| Pixi.js | 8.5 | WebGL-basierte 2D Grafik-Engine |
| Zustand | 5.0 | Leichtgewichtiges State Management |
| React Router | 6.27 | Client-seitige Navigation |
| Tailwind CSS | 3.x | Utility-First CSS Framework |
| Chart.js | 4.4 | Datenvisualisierung für Evolution-Grafiken |
| chartjs-plugin-zoom | 2.2 | Zoom & Pan für Charts |

## 📁 Projektstruktur

```
src/
├── components/              # React Komponenten
│   └── Simulation/         # Canvas, Controls, Stats
├── engine/                 # Simulations-Engine
│   ├── Organism.ts         # Organismus-Klasse & Verhalten
│   ├── World.ts            # Welt-Verwaltung & Updates
│   └── SpatialHashGrid.ts  # Performance-Optimierung (O(1) Queries)
├── workers/                # Web Worker für Multi-Threading
│   └── simulationWorker.ts # Simulation in separatem Thread
├── store/                  # Zustand State Management
│   └── simulationStore.ts  # App-State + Worker-Integration
├── pages/                  # Seiten-Komponenten
│   ├── SimulationPage.tsx  # Haupt-Simulation
│   ├── EvolutionPage.tsx   # Grafiken & Statistiken
│   └── SettingsPage.tsx    # Populations- & Welt-Einstellungen
├── types/                  # TypeScript Definitionen
│   └── index.ts           
└── utils/                  # Konstanten & Helpers
    └── constants.ts        # Standard-Populationen & Config
```

## 🏗️ Architektur

```
┌─────────────────────┐         ┌──────────────────────┐
│   Main Thread       │ ◄─────► │   Worker Thread      │
│                     │ Messages│                      │
│  - UI Rendering     │         │  - Simulation Loop   │
│  - Pixi.js Canvas   │         │  - World.update()    │
│  - React Components │         │  - Organism Logic    │
│  - User Input       │         │  - Physics           │
│                     │         │  - Spatial Hashing   │
└─────────────────────┘         └──────────────────────┘
         │                                   │
         └────────── LocalStorage ───────────┘
              (Settings Persistence)
```

**Vorteile:**
- ✅ UI bleibt flüssig auch bei komplexer Simulation
- ✅ Simulation läuft mit konstant 60 FPS
- ✅ Keine Frame-Drops durch Berechnungen
- ✅ Skaliert auf 1000+ Organismen

## 🎮 Verwendung

### Simulation Starten
1. Öffne die Anwendung im Browser
2. Klicke auf **Start** in der Steuerung
3. Beobachte wie die Organismen sich bewegen, Nahrung suchen und sich fortpflanzen

### Einstellungen Anpassen
1. Navigiere zur **Einstellungen**-Seite
2. Passe die Start-Anzahl der Populationen an
3. Ändere Welt-Parameter wie Nahrungsmenge
4. Starte die Simulation neu, um die Änderungen zu sehen

## 🧬 Organismus-Eigenschaften

Jeder Organismus hat folgende Eigenschaften (0-100):

- **Geschwindigkeit** - Bewegungsgeschwindigkeit
- **Wendigkeit** - Wie schnell sie die Richtung ändern können
- **Max Energie** - Energie-Kapazität
- **Energie-Effizienz** - Weniger Energie-Verbrauch
- **Maximales Alter** - Wie lange sie leben
- **Sichtweite** - Wie weit sie sehen können
- **Nahrungs-Erkennung** - Wie gut sie Nahrung finden
- **Reproduktionsrate** - Wie schnell/oft sie sich fortpflanzen
- **Nachkommen-Anzahl** - Anzahl der Babies
- **Aggression** - Angriff vs. Flucht (für zukünftige Features)
- **Größe** - Sichtbare Größe und Einfluss
- **Sozialverhalten** - Rudel vs. Einzelgänger (für zukünftige Features)

## 🔮 Geplante Features

- [ ] **Mutationen** bei Fortpflanzung
- [ ] **Räuber-Beute-Dynamik** zwischen Populationen
- [ ] **Kreuzungen** zwischen verschiedenen Populationen
- [ ] **Detaillierte Evolutions-Grafiken** mit Chart.js
- [ ] **Speichern/Laden** von Simulationen
- [ ] **Export** von Statistiken als CSV
- [ ] **Verschiedene Biome** mit unterschiedlichen Bedingungen
- [ ] **Gruppenverhalten** (Schwärme, Rudel)
- [ ] **Bessere Sprites** für Organismen

## 📊 Simulations-Mechanik

### Energie-System
- Organismen starten mit voller Energie
- Bewegung kostet Energie (abhängig von Geschwindigkeit, Größe & Effizienz)
- Nahrung gibt Energie zurück
- Bei 0 Energie → Tod durch Verhungern

### Reproduktion
- Möglich bei ≥70% Energie
- Kostet 40% der aktuellen Energie
- Erzeugt Nachkommen mit identischen Eigenschaften (Mutation kommt später)
- Nachkommen starten mit 50% Energie

### Tod
- Maximales Alter erreicht
- Energie auf 0 gesunken

### Nahrung
- Spawnt kontinuierlich in der Welt
- Begrenzte maximale Anzahl
- Wird konsumiert wenn Organismen nahe genug sind

## 🤝 Beitragen

Contributions sind willkommen! So kannst du helfen:

1. **Fork** das Repository
2. **Create** einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** deine Änderungen (`git commit -m '✨ Add AmazingFeature'`)
4. **Push** zum Branch (`git push origin feature/AmazingFeature`)
5. **Open** einen Pull Request

### Development Setup

```bash
git clone https://github.com/MichaelHein65/evolution-simulation.git
cd evolution-simulation
npm install
npm run dev
```

## 🚀 Deployment

### GitHub Pages (Automatisch)

Das Projekt ist so konfiguriert, dass es automatisch zu GitHub Pages deployt wird:

1. Push zu `main` Branch triggert automatisch den Build
2. Die App wird dann verfügbar unter: `https://michaelhein65.github.io/evolution-simulation/`

### Manuelles Deployment

```bash
# Build erstellen
npm run build

# dist/ Ordner kann auf jedem Webserver gehostet werden
```

## 📊 Performance

- **Target**: 60 FPS konstant
- **Getestet mit**: Bis zu 2000 Organismen
- **Empfohlen**: 500-1000 Organismen für beste Performance
- **Optimierungen**:
  - Spatial Hash Grid (O(1) statt O(n²))
  - Object Pooling für Graphics
  - Web Worker für Simulation
  - Reduced Render Frequency (30 FPS Rendering bei 60 FPS Simulation)

## 📝 Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei für Details.

Copyright (c) 2025 Michael Hein

## 🙏 Danksagungen

- **Pixi.js** - Fantastische WebGL-Engine
- **React** - UI Framework
- **Vite** - Blitzschneller Build-Tool
- **Chart.js** - Datenvisualisierung

---

**Viel Spaß beim Experimentieren mit Evolution!** 🧬✨

Entwickelt mit ❤️ von [Michael Hein](https://github.com/MichaelHein65)
