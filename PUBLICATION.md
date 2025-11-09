# 🚀 Publikations-Anleitung

## ✅ Was wurde vorbereitet:

1. ✅ **README.md** - Professionelle Dokumentation mit Badges
2. ✅ **LICENSE** - MIT License für Open Source
3. ✅ **GitHub Actions Workflow** - Automatisches Deployment
4. ✅ **package.json** - Metadaten, Keywords, Links
5. ✅ **Vite Config** - Für GitHub Pages konfiguriert

## 🌐 GitHub Pages Aktivieren

### Schritt 1: GitHub Pages einrichten

1. Gehe zu deinem Repository: https://github.com/MichaelHein65/evolution-simulation
2. Klicke auf **Settings** (Zahnrad-Icon)
3. Scrolle zu **Pages** im linken Menü
4. Unter "Build and deployment":
   - **Source**: Wähle "GitHub Actions"
5. Speichern (wird automatisch gespeichert)

### Schritt 2: Warte auf Deployment

1. Gehe zu **Actions** Tab in deinem Repository
2. Du siehst den Workflow "Deploy to GitHub Pages" laufen
3. Warte bis ✅ grün wird (ca. 1-2 Minuten)

### Schritt 3: Website aufrufen

Die Simulation wird dann verfügbar sein unter:

🌐 **https://michaelhein65.github.io/evolution-simulation/**

## 🔄 Automatisches Deployment

Ab jetzt wird bei jedem `git push` zu `main`:
1. Automatisch ein Build erstellt
2. Zu GitHub Pages deployed
3. Nach ~2 Minuten ist die neue Version live

## 📢 Projekt teilen

### Repository sichtbar machen

1. Gehe zu Repository Settings
2. Scrolle nach unten zu **Danger Zone**
3. Falls "Private" → Klicke "Change visibility" → "Public"
4. Bestätige mit Repository-Namen

### Repository-Beschreibung hinzufügen

1. Gehe zur Haupt-Seite des Repositories
2. Klicke auf ⚙️ neben "About"
3. Füge hinzu:
   - **Description**: "🧬 Hochperformante Evolution-Simulation mit Web Worker Multi-Threading, Pixi.js und React"
   - **Website**: https://michaelhein65.github.io/evolution-simulation/
   - **Topics**: `evolution`, `simulation`, `react`, `typescript`, `pixijs`, `web-worker`

### Social Media teilen

Teile dein Projekt:
- Twitter/X
- LinkedIn
- Reddit (r/programming, r/webdev, r/reactjs)
- Dev.to
- Hacker News

**Template für Posts:**
```
🧬 Ich habe eine Evolution-Simulation gebaut!

Features:
- Web Worker Multi-Threading
- 1000+ Organismen bei 60 FPS
- Spatial Hash Grid Optimierung
- React + TypeScript + Pixi.js

Live Demo: https://michaelhein65.github.io/evolution-simulation/
Source: https://github.com/MichaelHein65/evolution-simulation

#WebDev #React #TypeScript #GameDev
```

## 📊 GitHub Repository Einstellungen

### Topics hinzufügen
Gehe zu deinem Repository und füge diese Topics hinzu (verbessert Auffindbarkeit):
- evolution
- simulation
- react
- typescript
- pixijs
- web-worker
- genetics
- artificial-life
- biology
- visualization

### README Badges
Diese Badges sind bereits im README:
- ✅ MIT License Badge
- ✅ TypeScript Badge
- ✅ React Badge
- ✅ Vite Badge
- ✅ Pixi.js Badge

## 🎯 Nach der Publikation

1. **Teste die Live-Version** auf GitHub Pages
2. **Sammle Feedback** von Nutzern
3. **Erstelle Issues** für geplante Features
4. **Akzeptiere Pull Requests** von Contributors
5. **Veröffentliche Updates** regelmäßig

## 📝 Versions-Management

Für neue Releases:

```bash
# Version erhöhen
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0

# GitHub Release erstellen
git push --tags
```

Dann auf GitHub:
1. Gehe zu "Releases"
2. "Create a new release"
3. Wähle Tag (z.B. v1.0.1)
4. Beschreibe Änderungen
5. "Publish release"

---

## ✨ Glückwunsch!

Dein Projekt ist jetzt:
- ✅ Open Source (MIT License)
- ✅ Auf GitHub gehostet
- ✅ Live verfügbar (GitHub Pages)
- ✅ Professionell dokumentiert
- ✅ Bereit für Contributors

**Viel Erfolg mit deinem Projekt! 🎉**
