/**
 * Evolution Audio Simulator - Main Application
 */

// Global Audio Engine Instance
let audioEngine = null;
let simulationInterval = null;

// DOM Elements
const elements = {
  enableAudioBtn: null,
  audioStatus: null,
  mainControls: null,
  masterVolume: null,
  masterVolumeValue: null,
  musicVolume: null,
  musicVolumeValue: null,
  muteBtn: null,
  startMusic: null,
  stopMusic: null,
  populationShareSliders: {},
  populationShareValues: {},
  mixSegments: {},
  activePopulation: null,
  populationBtns: null,
  eventBtns: null,
  freqMult: null,
  freqMultValue: null,
  attack: null,
  attackValue: null,
  decay: null,
  decayValue: null,
  eventVolume: null,
  eventVolumeValue: null,
  pitchShift: null,
  pitchShiftValue: null,
  detune: null,
  detuneValue: null,
  eventsPerSecond: null,
  eventsPerSecondValue: null,
  startSimulation: null,
  stopSimulation: null,
  simulationLog: null,
  exportPreset: null,
  resetDefaults: null,
  presetOutput: null
};

// Populations für Simulation
const populations = ['sprinter', 'tank', 'hunter', 'gatherer', 'allrounder'];
const events = ['eat', 'birth', 'death', 'kill'];
const eventIcons = {
  eat: '🍎',
  birth: '🐣',
  death: '💀',
  kill: '⚔️'
};
const populationIcons = {
  sprinter: '🏃',
  tank: '🛡️',
  hunter: '🎯',
  gatherer: '🌿',
  allrounder: '⚖️'
};

/**
 * Initialisierung beim Laden der Seite
 */
document.addEventListener('DOMContentLoaded', () => {
  // DOM Referenzen cachen
  cacheElements();
  
  // Event Listeners einrichten
  setupEventListeners();
  
  // Audio Engine erstellen (aber noch nicht aktivieren)
  audioEngine = new AudioEngine();
  
  console.log('Audio Simulator initialized');
});

/**
 * Cached alle DOM-Elemente
 */
function cacheElements() {
  elements.enableAudioBtn = document.getElementById('enable-audio');
  elements.audioStatus = document.getElementById('audio-status');
  elements.mainControls = document.getElementById('main-controls');
  elements.masterVolume = document.getElementById('master-volume');
  elements.masterVolumeValue = document.getElementById('master-volume-value');
  elements.musicVolume = document.getElementById('music-volume');
  elements.musicVolumeValue = document.getElementById('music-volume-value');
  elements.muteBtn = document.getElementById('mute-btn');
  elements.startMusic = document.getElementById('start-music');
  elements.stopMusic = document.getElementById('stop-music');
  
  // Population share sliders and values
  for (const popId of populations) {
    elements.populationShareSliders[popId] = document.getElementById(`share-${popId}`);
    elements.populationShareValues[popId] = document.getElementById(`share-${popId}-value`);
    elements.mixSegments[popId] = document.getElementById(`mix-${popId}`);
  }
  
  elements.activePopulation = document.getElementById('active-population');
  elements.populationBtns = document.querySelectorAll('.population-btn');
  elements.eventBtns = document.querySelectorAll('.event-btn');
  elements.freqMult = document.getElementById('freq-mult');
  elements.freqMultValue = document.getElementById('freq-mult-value');
  elements.attack = document.getElementById('attack');
  elements.attackValue = document.getElementById('attack-value');
  elements.decay = document.getElementById('decay');
  elements.decayValue = document.getElementById('decay-value');
  elements.eventVolume = document.getElementById('event-volume');
  elements.eventVolumeValue = document.getElementById('event-volume-value');
  elements.pitchShift = document.getElementById('pitch-shift');
  elements.pitchShiftValue = document.getElementById('pitch-shift-value');
  elements.detune = document.getElementById('detune');
  elements.detuneValue = document.getElementById('detune-value');
  elements.eventsPerSecond = document.getElementById('events-per-second');
  elements.eventsPerSecondValue = document.getElementById('events-per-second-value');
  elements.startSimulation = document.getElementById('start-simulation');
  elements.stopSimulation = document.getElementById('stop-simulation');
  elements.simulationLog = document.getElementById('simulation-log');
  elements.exportPreset = document.getElementById('export-preset');
  elements.resetDefaults = document.getElementById('reset-defaults');
  elements.presetOutput = document.getElementById('preset-output');
}

/**
 * Event Listeners einrichten
 */
function setupEventListeners() {
  // Audio aktivieren
  elements.enableAudioBtn.addEventListener('click', enableAudio);
  
  // Master Volume
  elements.masterVolume.addEventListener('input', (e) => {
    const value = e.target.value / 100;
    elements.masterVolumeValue.textContent = `${e.target.value}%`;
    audioEngine.setMasterVolume(value);
  });
  
  // Music Volume
  elements.musicVolume.addEventListener('input', (e) => {
    const value = e.target.value / 100;
    elements.musicVolumeValue.textContent = `${e.target.value}%`;
    audioEngine.setMusicVolume(value);
  });
  
  // Mute Button
  elements.muteBtn.addEventListener('click', toggleMute);
  
  // Music Controls
  elements.startMusic.addEventListener('click', startMusic);
  elements.stopMusic.addEventListener('click', stopMusic);
  
  // Population Share Sliders
  for (const popId of populations) {
    const slider = elements.populationShareSliders[popId];
    if (slider) {
      slider.addEventListener('input', (e) => {
        updatePopulationShares();
      });
    }
  }
  
  // Population Buttons
  elements.populationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const popId = btn.dataset.population;
      audioEngine.playPopulationSound(popId);
      flashButton(btn);
    });
  });
  
  // Event Buttons
  elements.eventBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const eventType = btn.dataset.event;
      const popId = elements.activePopulation.value;
      audioEngine.playEventSound(eventType, popId);
      flashButton(btn);
    });
  });
  
  // Parameter Sliders
  elements.freqMult.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    elements.freqMultValue.textContent = `${value.toFixed(1)}x`;
    audioEngine.setParam('frequencyMultiplier', value);
  });
  
  elements.attack.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    elements.attackValue.textContent = `${value}ms`;
    audioEngine.setParam('attack', value / 1000);
  });
  
  elements.decay.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    elements.decayValue.textContent = `${value}ms`;
    audioEngine.setParam('decay', value / 1000);
  });
  
  elements.eventVolume.addEventListener('input', (e) => {
    const value = e.target.value / 100;
    elements.eventVolumeValue.textContent = `${e.target.value}%`;
    audioEngine.setParam('eventVolume', value);
  });
  
  elements.pitchShift.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    elements.pitchShiftValue.textContent = value > 0 ? `+${value}` : value;
    audioEngine.setParam('pitchShift', value);
  });
  
  elements.detune.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    elements.detuneValue.textContent = value;
    audioEngine.setParam('detune', value);
  });
  
  // Simulation Controls
  elements.eventsPerSecond.addEventListener('input', (e) => {
    elements.eventsPerSecondValue.textContent = `${e.target.value}/s`;
  });
  
  elements.startSimulation.addEventListener('click', startSimulation);
  elements.stopSimulation.addEventListener('click', stopSimulation);
  
  // Preset Controls
  elements.exportPreset.addEventListener('click', exportPreset);
  elements.resetDefaults.addEventListener('click', resetDefaults);
}

/**
 * Audio aktivieren (nach User-Interaktion)
 */
async function enableAudio() {
  const success = await audioEngine.enable();
  
  if (success) {
    elements.audioStatus.classList.add('hidden');
    elements.mainControls.classList.remove('hidden');
    
    // Test-Sound abspielen
    setTimeout(() => {
      audioEngine.playPopulationSound('allrounder');
    }, 100);
  } else {
    alert('Audio konnte nicht aktiviert werden. Bitte versuche es erneut.');
  }
}

/**
 * Mute umschalten
 */
function toggleMute() {
  const isMuted = !audioEngine.isMuted;
  audioEngine.setMuted(isMuted);
  elements.muteBtn.textContent = isMuted ? '🔇 Sound Aus' : '🔊 Sound An';
  elements.muteBtn.classList.toggle('btn-danger', isMuted);
  elements.muteBtn.classList.toggle('btn-secondary', !isMuted);
  
  // Update music buttons
  if (isMuted) {
    elements.startMusic.disabled = true;
    elements.stopMusic.disabled = true;
  } else {
    elements.startMusic.disabled = audioEngine.isMusicActive();
    elements.stopMusic.disabled = !audioEngine.isMusicActive();
  }
}

/**
 * Musik starten
 */
function startMusic() {
  audioEngine.startMusic();
  elements.startMusic.disabled = true;
  elements.stopMusic.disabled = false;
}

/**
 * Musik stoppen
 */
function stopMusic() {
  audioEngine.stopMusic();
  elements.startMusic.disabled = false;
  elements.stopMusic.disabled = true;
}

/**
 * Populationsanteile aktualisieren
 */
function updatePopulationShares() {
  // Sammle alle Slider-Werte
  const rawValues = {};
  let total = 0;
  
  for (const popId of populations) {
    const slider = elements.populationShareSliders[popId];
    if (slider) {
      rawValues[popId] = parseInt(slider.value);
      total += rawValues[popId];
    }
  }
  
  // Normalisiere auf 0-1 (oder verteile gleichmäßig wenn total = 0)
  const shares = {};
  for (const popId of populations) {
    if (total > 0) {
      shares[popId] = rawValues[popId] / total;
    } else {
      shares[popId] = 0.2;  // Gleichverteilt
    }
    
    // Update UI
    const percentage = Math.round(shares[popId] * 100);
    if (elements.populationShareValues[popId]) {
      elements.populationShareValues[popId].textContent = `${percentage}%`;
    }
    
    // Update Mix-Visualisierung
    if (elements.mixSegments[popId]) {
      elements.mixSegments[popId].style.width = `${percentage}%`;
    }
  }
  
  // Update Audio Engine
  audioEngine.setPopulationShares(shares);
}

/**
 * Button kurz aufblitzen lassen
 */
function flashButton(btn) {
  btn.style.transform = 'scale(0.95)';
  btn.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.5)';
  setTimeout(() => {
    btn.style.transform = '';
    btn.style.boxShadow = '';
  }, 100);
}

/**
 * Simulations-Modus starten
 */
function startSimulation() {
  elements.startSimulation.disabled = true;
  elements.stopSimulation.disabled = false;
  elements.simulationLog.innerHTML = '';
  
  const eventsPerSec = parseInt(elements.eventsPerSecond.value);
  const intervalMs = 1000 / eventsPerSec;
  
  logEvent('system', 'Simulation gestartet');
  
  simulationInterval = setInterval(() => {
    // Zufällige Population und Event
    const popId = populations[Math.floor(Math.random() * populations.length)];
    const eventType = events[Math.floor(Math.random() * events.length)];
    
    // Sound abspielen
    audioEngine.playEventSound(eventType, popId);
    
    // Loggen
    logEvent(eventType, `${populationIcons[popId]} ${audioEngine.populationConfig[popId].name}: ${eventIcons[eventType]} ${getEventName(eventType)}`);
  }, intervalMs);
}

/**
 * Simulations-Modus stoppen
 */
function stopSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
  
  elements.startSimulation.disabled = false;
  elements.stopSimulation.disabled = true;
  
  logEvent('system', 'Simulation gestoppt');
}

/**
 * Event ins Log schreiben
 */
function logEvent(type, message) {
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  
  const time = new Date().toLocaleTimeString('de-DE', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    fractionalSecondDigits: 1
  });
  
  entry.innerHTML = `<span class="time">${time}</span>${message}`;
  
  // Altes Hint entfernen wenn vorhanden
  const hint = elements.simulationLog.querySelector('.log-hint');
  if (hint) hint.remove();
  
  elements.simulationLog.appendChild(entry);
  
  // Auto-scroll
  elements.simulationLog.scrollTop = elements.simulationLog.scrollHeight;
  
  // Max 100 Einträge behalten
  while (elements.simulationLog.children.length > 100) {
    elements.simulationLog.removeChild(elements.simulationLog.firstChild);
  }
}

/**
 * Event-Name auf Deutsch
 */
function getEventName(eventType) {
  const names = {
    eat: 'Nahrung',
    birth: 'Geburt',
    death: 'Tod',
    kill: 'Kill'
  };
  return names[eventType] || eventType;
}

/**
 * Einstellungen exportieren
 */
function exportPreset() {
  const settings = audioEngine.exportSettings();
  const json = JSON.stringify(settings, null, 2);
  
  elements.presetOutput.textContent = json;
  elements.presetOutput.classList.add('visible');
}

/**
 * Auf Standardwerte zurücksetzen
 */
function resetDefaults() {
  audioEngine.resetDefaults();
  
  // UI aktualisieren
  elements.masterVolume.value = 50;
  elements.masterVolumeValue.textContent = '50%';
  elements.musicVolume.value = 40;
  elements.musicVolumeValue.textContent = '40%';
  elements.freqMult.value = 1;
  elements.freqMultValue.textContent = '1.0x';
  elements.attack.value = 10;
  elements.attackValue.textContent = '10ms';
  elements.decay.value = 100;
  elements.decayValue.textContent = '100ms';
  elements.eventVolume.value = 70;
  elements.eventVolumeValue.textContent = '70%';
  elements.pitchShift.value = 0;
  elements.pitchShiftValue.textContent = '0';
  elements.detune.value = 0;
  elements.detuneValue.textContent = '0';
  
  // Reset population sliders
  for (const popId of populations) {
    if (elements.populationShareSliders[popId]) {
      elements.populationShareSliders[popId].value = 20;
    }
    if (elements.populationShareValues[popId]) {
      elements.populationShareValues[popId].textContent = '20%';
    }
    if (elements.mixSegments[popId]) {
      elements.mixSegments[popId].style.width = '20%';
    }
  }
  
  elements.presetOutput.classList.remove('visible');
  
  // Bestätigungs-Sound
  audioEngine.playPopulationSound('allrounder');
}
