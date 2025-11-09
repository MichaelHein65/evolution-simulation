# Evolution Simulation

Eine interaktive Web-Anwendung zur Simulation von Evolution mit verschiedenen Organismen-Populationen.

## 🌟 Features

- **5 verschiedene Populationen** mit individuellen Eigenschaften (Sprinter, Tank, Jäger, Sammler, Allrounder)
- **Echtzeit-Simulation** mit Pixi.js für performante Grafik-Darstellung
- **Komplexe Eigenschaften**: Geschwindigkeit, Energie, Größe, Wahrnehmung, Aggression, und mehr
- **3 Haupt-Seiten**:
  - **Simulation**: Beobachte die Organismen in Echtzeit
  - **Evolution**: Statistiken und Grafiken über den Verlauf
  - **Einstellungen**: Passe Populationen und Welt-Parameter an

## 🚀 Installation & Start

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Build für Produktion
npm run build

# Preview des Production Builds
npm run preview
```

Die Anwendung läuft dann auf `http://localhost:5173/`

## 🛠️ Tech Stack

- **React 18** + **TypeScript** - UI Framework
- **Vite** - Build Tool & Dev Server
- **Pixi.js 8** - WebGL-basierte 2D Grafik-Engine
- **Zustand** - State Management
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Chart.js** - Datenvisualisierung (geplant)

## 📁 Projektstruktur

```
src/
├── components/          # React Komponenten
│   ├── Simulation/     # Hauptsimulation (Canvas, Controls, Stats)
│   ├── Evolution/      # Evolutionsgrafiken (geplant)
│   └── Settings/       # Einstellungen (geplant)
├── engine/             # Simulations-Engine
│   ├── Organism.ts     # Organismus-Klasse
│   └── World.ts        # Welt-Logik
├── store/              # Zustand State Management
│   └── simulationStore.ts
├── types/              # TypeScript Type Definitionen
│   └── index.ts
├── utils/              # Hilfsfunktionen
│   └── constants.ts    # Standard-Populationen
└── pages/              # Seiten-Komponenten
    ├── SimulationPage.tsx
    ├── EvolutionPage.tsx
    └── SettingsPage.tsx
```

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

## 🤝 Entwicklung

Projekt wurde mit Fokus auf Erweiterbarkeit entwickelt:

- **Modulare Engine**: Simulations-Logik getrennt von UI
- **TypeScript**: Type-Safety für komplexe Datenstrukturen
- **Zustand Store**: Zentrales State Management für einfache Erweiterung
- **Komponenten-basiert**: Leicht neue Features hinzuzufügen

## 📝 Lizenz

MIT License - frei verwendbar für eigene Projekte

---

**Viel Spaß beim Experimentieren mit Evolution!** 🧬✨
