# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [1.4.0] - 2025-11-09

### 🎵 Audio Sonification
- **Event-Sounds**: Synthesierte Sounds für alle Simulation-Ereignisse
  - **Nahrung essen** (50ms): Kurzer hoher Blip mit +200Hz Frequenzanstieg
  - **Geburt** (150ms): Aufsteigender Sweep über eine Oktave
  - **Tod** (200ms): Absteigender Sweep über eine Oktave
  - **Jagd-Kill** (100ms): Percussiver Impact mit Noise-Burst
- **Hintergrundmusik**: 5 einzigartige Melodien - eine pro Population
  - **Sprinter**: 523 Hz (C5), Sawtooth, schnell & staccato
  - **Tank**: 220 Hz (A3), Sine, langsam & legato
  - **Jäger**: 392 Hz (G4), Square, aggressiv & Moll
  - **Sammler**: 330 Hz (E4), Triangle, sanft & pentatonisch
  - **Allrounder**: 440 Hz (A4), Sine, ausgewogen
- **Dynamischer Mix**: Musik-Lautstärke basiert auf Populationsanteilen
- **Stereo-Panning**: Sounds links/rechts je nach X-Position im Canvas
- **Event-Throttling**: Max 30 Sounds/Sekunde für Performance

### ✨ Neue Features
- **AudioEngine**: Web Audio API basierte Synthesizer-Engine (`/src/audio/AudioEngine.ts`)
- **Audio Controls UI**: Neue Komponente mit Volume-Slidern
  - Master-Volume für Gesamtlautstärke
  - Musik-Volume für Hintergrundmusik
  - Event-Volume für Ereignis-Sounds
  - Mute-Button für schnelles Stummschalten
  - Musik Start/Stop Toggle
- **Audio Simulator**: Standalone-Tool zum Testen und Optimieren der Sounds
  - Erreichbar über Button "Audio Simulator öffnen" in den Audio Controls
  - Eigene Route `/audio-simulator`
  - Vollständiges Test-Interface für alle Sounds und Melodien

### 🛠️ Technisch
- `World.ts`: Event-Tracking hinzugefügt (foodEaten, births, deaths, kills)
- `Organism.ts`: Kill-Tracking für Jagd-Events
- `simulationWorker.ts`: Neuer EVENTS Message-Type für Audio-Events
- `simulationStore.ts`: Audio-State und Actions integriert
- Neue Dateien:
  - `/src/audio/AudioEngine.ts` - Singleton AudioEngine
  - `/src/components/AudioControls.tsx` - UI-Komponente
  - `/src/pages/AudioSimulatorPage.tsx` - Simulator-Seite
  - `/public/audio-simulator/` - Standalone Simulator-App

---

## [1.3.1] - 2025-11-09

### 🐛 Bugfixes
- **Canvas-Reset**: Simulation-Canvas wird beim Reset korrekt geleert
  - Graphics werden explizit gelöscht wenn `renderData === null`
  - Console-Log "🧹 Canvas cleared (no render data)" zur Bestätigung
- **Chart-Performance**: Evolution-Grafiken "pumpen" nicht mehr
  - Key-Attribute entfernt die bei jedem Tick Charts neu mounteten
  - Charts updaten jetzt smooth durch ihre eigene Update-Logik
- **Stats-Filter**: Tick 0 Stats werden nach Reset ignoriert
  - Verhindert dass alte Stats zur geleerten History hinzugefügt werden
  - Console-Log "🔄 Ignoring tick 0 stats after reset"

### 🛠️ Technisch
- `terser` als Dev-Dependency hinzugefügt für Production-Builds
- Build-Prozess funktioniert jetzt einwandfrei

---

## [1.3.0] - 2025-11-09

### ✨ Neue Features
- **AI-Hilfe-Seite**: Intelligenter Chat-Assistent mit ChatGPT-4o Integration
  - Beantwortet Fragen zu Spielmechaniken und Strategien
  - Kennt alle aktuellen Einstellungen (Populationen, Traits, Weltconfig)
  - Sieht Live-Statistiken der laufenden Simulation
  - Natürlichsprachliche Konversation auf Deutsch
  - Modernes Chat-Interface mit Message-History
  - **Persistenter Chat**: Verlauf bleibt über Sessions erhalten (localStorage)
  - **Chat löschen**: Button zum Zurücksetzen mit Bestätigung
- **Backend-Server**: Express.js Server für sichere OpenAI API-Calls (Port 3001)
- **Kontext-System**: AI erhält vollständigen Spiel-Kontext bei jeder Anfrage
  - Umfassende Spielmechanik-Dokumentation (80+ Zeilen)
  - Konkrete Formeln für Reproduktion, Energie, Aging, Tod
  - Performance-Details (Spatial Hash Grid, Object Pooling)
- **Auto-Pause**: Simulation pausiert automatisch bei AI-Beratung
- **Auto-Scroll**: Chat scrollt automatisch zu neuesten Nachrichten
- **Loading-States**: Animierte Lade-Indikatoren während AI antwortet

### 🎨 UI-Verbesserungen
- "🤖 Hilfe" Link in Navigation hinzugefügt
- AI-Hilfe auch in Landing Page Footer verlinkt
- Gradient-Header für Hilfe-Seite
- Responsive Chat-Design
- "Chat löschen" Button mit roter Farbe und Confirm-Dialog

### 🛠️ Technisch
- OpenAI SDK integriert
- Express + CORS für Backend
- Concurrently für paralleles Frontend/Backend Development
- Neue npm Scripts: `npm run server`, `npm run dev:all`
- Strikte AI-Prompts gegen Spekulation

---

## [1.2.0] - 2025-11-09

### ✨ Neue Features
- **Landing Page**: Professionelle Begrüßungsseite als neue Startseite
  - Hero-Bereich mit animiertem Intro-GIF
  - Gradient-Hintergrund (blau-lila-pink)
  - Feature-Highlights in 3 Karten
  - "Wie funktioniert es?" Erklärungssektion
  - Footer mit Links zu GitHub und internen Seiten
- **Sticky Navigation**: Navigationsleiste bleibt beim Scrollen sichtbar
  - Landing Page: Kompakter Header mit Logo und "Starten" Button
  - Interne Seiten: Vollständige Navigation mit allen Links
  - Backdrop-Blur-Effekt für moderne Optik
- **Optimiertes Routing**: 
  - Landing Page auf `/`
  - Simulation verschoben nach `/simulation`
  - Worker-Initialisierung erst bei Bedarf (Performance-Optimierung)
  - Basename für GitHub Pages korrekt konfiguriert

### 🎨 Verbesserungen
- Navigation nur auf internen Seiten sichtbar (cleanes Landing Page Design)
- Responsive Design für alle Bildschirmgrößen
- Verbesserte visuelle Hierarchie

---

## [1.1.0] - 2025-11-09

### 🐛 Bugfixes
- **Seitenwechsel-Problem behoben**: Canvas ist jetzt persistent und wird nicht mehr destroyed/recreated beim Seitenwechsel
- **Simulation läuft weiter**: Worker läuft auf allen Seiten weiter, Evolution-Seite zeigt Live-Updates
- **Keine "Time Warps" mehr**: Visuelle Sprünge beim Zurückkehren zur Simulation eliminiert
- **Sofortige Anzeige**: Canvas wird direkt beim Laden der Simulation-Seite angezeigt
- **Canvas-Zentrierung**: Canvas ist jetzt mittig und korrekt im Container-Layout positioniert

**Technische Details**: Canvas wurde von SimulationPage nach App.tsx verschoben und wird nur noch mit CSS versteckt/angezeigt statt unmounted/mounted. Dies verhindert den Verlust des Pixi.js Rendering-Kontexts. Der Canvas ist jetzt in einem `container mx-auto` Wrapper für korrekte Zentrierung.

### 📝 Changelog
- CHANGELOG.md Datei hinzugefügt für bessere Versionsverwaltung

---

## [1.0.0] - 2025-11-09

### ✨ Initiales Release

#### Features
- **Web Worker Architecture** - Multi-Threading für flüssige Performance
- **Object Pooling** - Wiederverwendbare Pixi.js Graphics
- **Spatial Hash Grid** - O(1) Nachbar-Suche für bis zu 5000 Organismen
- **5 Basis-Populationen** mit unterschiedlichen Eigenschaften
- **Sozialverhalten** - Schwarmbildung mit visuellen Indikatoren
- **Jagd-Mechanik** - Räuber-Beute-Dynamik
- **Energie-System** - Bewegung, Nahrung, Reproduktion
- **Evolution-Grafiken** - Zoom & Pan durch Zeitachse
- **LocalStorage Persistierung** - Einstellungen bleiben erhalten
- **12 editierbare Traits** pro Population
- **Live-Statistiken** - Echtzeit-Populationsdaten
- **Auto-Save** - Alle Einstellungen werden automatisch gespeichert

#### Performance
- 60 FPS mit 1000+ Organismen
- Render-Frequenz reduziert (jeder 2. Frame)
- Optimierte Update-Zyklen für Social/Hunt-Verhalten

#### Tech Stack
- React 18.3 + TypeScript 5.6
- Vite 6.4
- Pixi.js 8.5
- Zustand 5.0
- Chart.js 4.4 + chartjs-plugin-zoom
- Tailwind CSS

[1.4.0]: https://github.com/MichaelHein65/evolution-simulation/compare/v1.3.1...v1.4.0
[1.3.1]: https://github.com/MichaelHein65/evolution-simulation/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/MichaelHein65/evolution-simulation/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/MichaelHein65/evolution-simulation/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/MichaelHein65/evolution-simulation/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/MichaelHein65/evolution-simulation/releases/tag/v1.0.0
