# Evolution Simulation Project

## Checklist
- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [x] Clarify Project Requirements
- [x] Scaffold the Project
- [x] Customize the Project
- [x] Install Required Extensions
- [x] Compile the Project
- [x] Create and Run Task
- [x] Launch the Project
- [x] Ensure Documentation is Complete

## Project Details
- **Type**: Web Application
- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **Graphics**: Pixi.js
- **State Management**: Zustand
- **Routing**: React Router
- **Charts**: Chart.js / Recharts
- **Styling**: Tailwind CSS

## Current Status
✅ Version 1.3.0 - AI-Hilfe mit ChatGPT-4o Integration!

**Live Demo**: https://michaelhein65.github.io/evolution-simulation/
**Lokal**: http://localhost:5173/evolution-simulation/
**AI-Backend**: http://localhost:3001/

## Architektur
🚀 **Web Worker Performance-Architektur**:
- **Worker-Thread**: Komplette Simulation-Engine läuft in separatem Thread
- **Main-Thread**: Nur noch für UI-Rendering zuständig
- **Message-Passing**: Asynchrone Kommunikation zwischen Threads
- **Keine Limits**: Unbegrenzte Organismen-Anzahl möglich
- **Volle Performance**: MacBook-Leistung wird optimal genutzt

## Implementierte Features
- ✅ **AI-Hilfe-Seite** - ChatGPT-4o Integration für Fragen und Strategien
- ✅ **Backend-Server** - Express.js für sichere OpenAI API-Calls
- ✅ **Kontext-System** - AI erhält vollständigen Spiel-Kontext
- ✅ **Landing Page** - Professionelle Begrüßungsseite mit Intro-Animation
- ✅ **Sticky Navigation** - Bleibt beim Scrollen sichtbar (Landing + Interne Seiten)
- ✅ **Optimiertes Routing** - Landing auf /, Simulation auf /simulation, Hilfe auf /help
- ✅ Web Worker mit kompletter Simulation-Engine
- ✅ Multi-Threading: Simulation läuft parallel zum Rendering
- ✅ Message-basierte Kommunikation (INIT, START, STOP, RESET, SET_SPEED)
- ✅ Render-Daten-Streaming vom Worker zum Main-Thread (jeder 2. Frame)
- ✅ **Object Pooling** für Pixi.js Graphics (wiederverwendbare Graphics-Objekte)
- ✅ **Spatial Hash Grid** für O(1) Nachbar-Suche statt O(n²)
- ✅ **LocalStorage Persistierung** - Einstellungen bleiben nach Neustart erhalten
- ✅ **Zoom & Pan** in Evolution-Grafiken - Zeitachse durchsuchbar
- ✅ 5 Basis-Populationen (Sprinter, Tank, Jäger, Sammler, Allrounder)
- ✅ Simulations-Engine mit Organismus- und Welt-Klassen
- ✅ Energie-System (Bewegung kostet Energie, Nahrung gibt Energie)
- ✅ Reproduktions-Mechanik mit natürlicher Balance
- ✅ Tod durch Alter oder Hunger
- ✅ Nahrung-Spawning
- ✅ Pixi.js Canvas mit Echtzeit-Rendering (1400x700px)
- ✅ Alle Organismen und Nahrung werden gerendert (keine Limits mehr)
- ✅ Energie-Indikator (rot bei <30% Energie)
- ✅ Sozialverhalten (blaues Leuchten bei Gruppen)
- ✅ Jagd-Mechanik (oranges Leuchten beim Jagen)
- ✅ 4 Seiten: Landing, Simulation, Evolution, Einstellungen
- ✅ 5. Seite: AI-Hilfe mit Chat-Interface
- ✅ React Router Navigation mit basename für GitHub Pages
- ✅ Zustand State Management mit Worker-Integration
- ✅ Tailwind CSS Styling mit Gradients und Backdrop-Blur
- ✅ Steuerungs-Panel (Play/Pause/Reset/Speed)
- ✅ Live-Statistiken direkt aus Render-Daten
- ✅ Farbige Legende für Populationen
- ✅ Erweiterte Einstellungen-Seite mit allen 12 Traits editierbar
- ✅ Reset-Buttons für Einstellungen (einzeln & alle)
- ✅ Performance-Optimierungen für 1000+ Organismen

## Nächste Entwicklungsschritte
- [ ] Performance-Tests mit >1000 Organismen
- [ ] Mutationen bei Reproduktion implementieren
- [ ] Evolution-Grafiken optimieren
- [ ] Räuber-Beute-Mechanik
- [ ] Kreuzungen zwischen Populationen
- [ ] Speichern/Laden
- [ ] Export-Funktionen
- [ ] Bessere Sprites/Grafik

## Commands
```bash
npm run dev              # Development Server starten
npm start                # Server starten + Safari öffnen
npm run start:fullscreen # Server + Safari Fullscreen
npm run build            # Production Build
npm run preview          # Preview Production Build
npm run lint             # Linting
```
