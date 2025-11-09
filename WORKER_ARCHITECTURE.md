# Web Worker Architektur

## Übersicht

Die Evolution-Simulation verwendet eine **Multi-Threading-Architektur** mit Web Workers, um maximale Performance zu erreichen.

## Architektur-Diagramm

```
┌─────────────────────────────────────────────────────────────┐
│                      Main Thread (UI)                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  SimulationPage  │────────▶│  ControlPanel    │          │
│  └──────────────────┘         └──────────────────┘          │
│           │                             │                    │
│           │                             │                    │
│           ▼                             ▼                    │
│  ┌─────────────────────────────────────────────┐            │
│  │        simulationStore (Zustand)            │            │
│  │  - Worker-Instanz                           │            │
│  │  - renderData (empfangen vom Worker)        │            │
│  │  - startSimulation(), pauseSimulation()     │            │
│  └─────────────────────────────────────────────┘            │
│           │                             ▲                    │
│           │ postMessage()               │ onmessage          │
│           ▼                             │                    │
└───────────┼─────────────────────────────┼───────────────────┘
            │                             │
════════════╪═════════════════════════════╪═══════════════════
            │      Message Passing        │
════════════╪═════════════════════════════╪═══════════════════
            │                             │
┌───────────▼─────────────────────────────┼───────────────────┐
│                   Worker Thread                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────┐           │
│  │       simulationWorker.ts                    │           │
│  │  - Simulation Loop (requestAnimationFrame)   │           │
│  │  - Message Handler (INIT, START, STOP, etc.) │           │
│  └──────────────────────────────────────────────┘           │
│           │                                                   │
│           ▼                                                   │
│  ┌──────────────────────────────────────────────┐           │
│  │              World.ts                        │           │
│  │  - organisms: OrganismClass[]                │           │
│  │  - food: Food[]                              │           │
│  │  - update()                                  │           │
│  │  - handleReproduction()                      │           │
│  │  - handleFoodConsumption()                   │           │
│  │  - spawnFood()                               │           │
│  └──────────────────────────────────────────────┘           │
│           │                                                   │
│           ▼                                                   │
│  ┌──────────────────────────────────────────────┐           │
│  │          OrganismClass.ts                    │           │
│  │  - update()                                  │           │
│  │  - wander()                                  │           │
│  │  - eat()                                     │           │
│  │  - canReproduce()                            │           │
│  └──────────────────────────────────────────────┘           │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Message Types

### Main Thread → Worker
```typescript
{
  type: 'INIT',
  payload: { populations, worldConfig }
}
```
- Initialisiert die Simulation mit Populationen und Welt-Konfiguration

```typescript
{
  type: 'START'
}
```
- Startet die Simulation-Loop

```typescript
{
  type: 'STOP'
}
```
- Pausiert die Simulation

```typescript
{
  type: 'RESET',
  payload: { populations, worldConfig }
}
```
- Setzt die Simulation zurück

```typescript
{
  type: 'SET_SPEED',
  payload: { speed }
}
```
- Ändert die Simulationsgeschwindigkeit (0.1x - 5x)

```typescript
{
  type: 'UPDATE_POPULATIONS',
  payload: { populations }
}
```
- Aktualisiert Populationen-Traits (aus Einstellungen)

```typescript
{
  type: 'UPDATE_WORLD_CONFIG',
  payload: { config }
}
```
- Aktualisiert Welt-Konfiguration

### Worker → Main Thread

```typescript
{
  type: 'INITIALIZED',
  payload: { success: true }
}
```
- Bestätigt erfolgreiche Initialisierung

```typescript
{
  type: 'RENDER_DATA',
  payload: {
    organisms: [{ id, x, y, populationId, size, energy, maxEnergy }, ...],
    food: [{ x, y, energy }, ...]
  }
}
```
- Sendet Render-Daten **jeden Frame** (60 FPS)
- Nur die minimal notwendigen Daten für Rendering

```typescript
{
  type: 'STATS',
  payload: {
    tick,
    populationCounts: { [populationId]: count },
    totalOrganisms
  }
}
```
- Sendet Statistiken **alle 50 Ticks**
- Für Grafiken und Verlaufs-Daten

```typescript
{
  type: 'ERROR',
  payload: { message }
}
```
- Fehler-Meldungen vom Worker

## Performance-Vorteile

### 1. **Nicht-blockierendes UI**
- Simulation läuft in separatem Thread
- UI bleibt immer reaktiv
- Keine Lags bei Play/Pause/Navigation

### 2. **Volle CPU-Nutzung**
- MacBook kann beide Threads parallel ausführen
- Worker nutzt eigenen CPU-Kern
- Main-Thread frei für Rendering

### 3. **Optimierte Datenübertragung**
- Nur notwendige Render-Daten werden übertragen
- Stats nur alle 50 Ticks statt jeden Frame
- Strukturierte Daten statt kompletter Objekte

### 4. **Keine künstlichen Limits**
- ❌ Alte Version: Max 500 Organismen
- ✅ Neue Version: Unbegrenzt (nur durch Hardware limitiert)
- ❌ Alte Version: Throttled Rendering (alle 3 Ticks)
- ✅ Neue Version: 60 FPS Rendering

## Rendering-Pipeline

1. **Worker**: Berechnet Simulation (60 FPS)
2. **Worker**: Sendet Render-Daten via `postMessage()`
3. **Store**: Empfängt Daten, aktualisiert `renderData`
4. **Canvas**: React-useEffect triggert bei `renderData`-Änderung
5. **Pixi.js**: Rendert alle Organismen und Nahrung

## Datenmenge

Bei **1000 Organismen**:
- Render-Daten: ~100 KB pro Frame
- 60 FPS = 6 MB/Sekunde
- **Kein Problem** für moderne Browser!

Bei **10.000 Organismen**:
- Render-Daten: ~1 MB pro Frame
- 60 FPS = 60 MB/Sekunde
- Immer noch **performant** auf modernem MacBook

## Code-Struktur

```
src/
├── workers/
│   └── simulationWorker.ts    # Worker mit Simulation-Loop
├── store/
│   └── simulationStore.ts     # Worker-Integration
├── engine/
│   ├── World.ts               # Läuft im Worker
│   └── Organism.ts            # Läuft im Worker
├── components/
│   └── Simulation/
│       └── SimulationCanvas2.tsx  # Empfängt renderData
└── pages/
    └── SimulationPage.tsx     # Initialisiert Worker
```

## Debugging

### Worker-Konsole öffnen
Chrome DevTools → Sources → Threads → Worker

### Performance überwachen
```javascript
// Im Worker
console.log('FPS:', 1000 / deltaTime);
console.log('Organismen:', world.organisms.length);
```

### Message-Logging
```javascript
// In simulationStore.ts
worker.onmessage = (event) => {
  console.log('Received:', event.data.type, event.data.payload);
  // ...
};
```

## Bekannte Limitierungen

1. **Kein direkter Zugriff auf DOM** im Worker
   - → Deshalb separate Render-Daten
   
2. **Serialisierung** bei Message-Passing
   - → Keine Funktionen/Klassen-Instanzen übertragen
   - → Nur Plain Objects (JSON-serialisierbar)

3. **Debugging** ist komplexer
   - → Separate Console für Worker-Thread
   - → console.log() in beiden Threads

## Zukünftige Optimierungen

- [ ] **SharedArrayBuffer** für noch schnellere Datenübertragung
- [ ] **OffscreenCanvas** für Rendering im Worker
- [ ] **WebAssembly** für kritische Berechnungen
- [ ] **Objekt-Pooling** zur Reduktion von Garbage Collection
