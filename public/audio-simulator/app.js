/**
 * Evolution Audio Simulator - Main Application
 */

// Global Audio Engine Instance
let audioEngine = null;

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
  eventBtns: null
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
  
  // Population Buttons - Melodie bei Drücken starten, bei Loslassen stoppen
  elements.populationBtns.forEach(btn => {
    const popId = btn.dataset.population;
    
    // Maus-Events
    btn.addEventListener('mousedown', () => {
      audioEngine.startPopulationMelody(popId);
      btn.classList.add('active');
    });
    btn.addEventListener('mouseup', () => {
      audioEngine.stopPopulationMelody(popId);
      btn.classList.remove('active');
    });
    btn.addEventListener('mouseleave', () => {
      audioEngine.stopPopulationMelody(popId);
      btn.classList.remove('active');
    });
    
    // Touch-Events für mobile
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      audioEngine.startPopulationMelody(popId);
      btn.classList.add('active');
    });
    btn.addEventListener('touchend', () => {
      audioEngine.stopPopulationMelody(popId);
      btn.classList.remove('active');
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
