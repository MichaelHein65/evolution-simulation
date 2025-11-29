/**
 * AudioEngine - Web Audio API Wrapper für Evolution Simulation
 * Synthesisiert Sounds für verschiedene Populationen und Ereignisse
 * Inklusive dynamischer Hintergrundmusik basierend auf Populationsanteilen
 */
class AudioEngine {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.musicGain = null;  // Separater Gain für Musik
    this.isEnabled = false;
    this.isMuted = false;
    this.isMusicPlaying = false;
    
    // Aktive Musik-Tracks pro Population
    this.musicTracks = {};
    this.musicSchedulers = {};
    this.nextNoteTime = {};
    
    // Populationsanteile (0-1)
    this.populationShares = {
      sprinter: 0.2,
      tank: 0.2,
      hunter: 0.2,
      gatherer: 0.2,
      allrounder: 0.2
    };
    
    // Sound-Konfiguration pro Population
    this.populationConfig = {
      sprinter: {
        frequency: 523.25,  // C5
        waveform: 'sawtooth',
        color: '#EF4444',
        name: 'Sprinter',
        // Schnelle, hektische Melodie - Staccato-artig
        melody: {
          notes: [523, 659, 784, 659, 523, 784, 880, 784],  // C5-E5-G5-E5-C5-G5-A5-G5
          durations: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.2, 0.1],
          tempo: 180,
          waveform: 'sawtooth',
          style: 'staccato'
        }
      },
      tank: {
        frequency: 220.00,  // A3
        waveform: 'sine',
        color: '#3B82F6',
        name: 'Tank',
        // Langsame, tiefe, majestätische Melodie
        melody: {
          notes: [110, 130.81, 146.83, 130.81, 110, 98, 110, 130.81],  // A2-C3-D3-C3-A2-G2-A2-C3
          durations: [0.5, 0.5, 0.75, 0.25, 0.5, 0.5, 0.5, 0.5],
          tempo: 60,
          waveform: 'sine',
          style: 'legato'
        }
      },
      hunter: {
        frequency: 392.00,  // G4
        waveform: 'square',
        color: '#F97316',
        name: 'Jäger',
        // Aggressive, spannungsgeladene Melodie - Moll
        melody: {
          notes: [392, 466, 392, 349, 392, 466, 523, 466],  // G4-Bb4-G4-F4-G4-Bb4-C5-Bb4
          durations: [0.2, 0.2, 0.15, 0.15, 0.2, 0.2, 0.3, 0.2],
          tempo: 120,
          waveform: 'square',
          style: 'aggressive'
        }
      },
      gatherer: {
        frequency: 329.63,  // E4
        waveform: 'triangle',
        color: '#10B981',
        name: 'Sammler',
        // Friedliche, naturverbundene Melodie - Pentatonik
        melody: {
          notes: [329.63, 392, 440, 523, 440, 392, 329.63, 293.66],  // E4-G4-A4-C5-A4-G4-E4-D4
          durations: [0.3, 0.3, 0.3, 0.4, 0.3, 0.3, 0.3, 0.4],
          tempo: 80,
          waveform: 'triangle',
          style: 'gentle'
        }
      },
      allrounder: {
        frequency: 440.00,  // A4
        waveform: 'sine',
        color: '#A855F7',
        name: 'Allrounder',
        // Ausgewogene, neutrale Melodie
        melody: {
          notes: [440, 493.88, 523, 493.88, 440, 392, 440, 523],  // A4-B4-C5-B4-A4-G4-A4-C5
          durations: [0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.5],
          tempo: 100,
          waveform: 'sine',
          style: 'balanced'
        }
      }
    };
    
    // Modifizierbare Parameter
    this.params = {
      masterVolume: 0.5,
      eventVolume: 0.7,
      musicVolume: 0.4,
      frequencyMultiplier: 1.0,
      attack: 0.01,      // Sekunden
      decay: 0.1,        // Sekunden
      pitchShift: 0,     // Halbtöne
      detune: 0          // Cents
    };
  }
  
  /**
   * Initialisiert den AudioContext (muss nach User-Interaktion aufgerufen werden)
   */
  async enable() {
    if (this.isEnabled) return true;
    
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      
      // Master Gain Node
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = this.params.masterVolume;
      this.masterGain.connect(this.context.destination);
      
      // Music Gain Node (separater Kanal für Hintergrundmusik)
      this.musicGain = this.context.createGain();
      this.musicGain.gain.value = this.params.musicVolume;
      this.musicGain.connect(this.masterGain);
      
      // Gain-Nodes für jede Population
      for (const popId of Object.keys(this.populationConfig)) {
        this.musicTracks[popId] = {
          gain: this.context.createGain(),
          noteIndex: 0,
          isPlaying: false
        };
        this.musicTracks[popId].gain.gain.value = this.populationShares[popId];
        this.musicTracks[popId].gain.connect(this.musicGain);
      }
      
      // Resume if suspended
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }
      
      this.isEnabled = true;
      console.log('AudioEngine enabled:', this.context.state);
      return true;
    } catch (error) {
      console.error('Failed to enable AudioEngine:', error);
      return false;
    }
  }
  
  /**
   * Spielt den Basis-Sound einer Population ab
   */
  playPopulationSound(populationId) {
    if (!this.isEnabled || this.isMuted) return;
    
    const config = this.populationConfig[populationId];
    if (!config) return;
    
    const freq = config.frequency * this.params.frequencyMultiplier;
    this._playTone(freq, config.waveform, this.params.attack, this.params.decay);
  }
  
  /**
   * Spielt ein Event-Sound ab
   */
  playEventSound(eventType, populationId) {
    if (!this.isEnabled || this.isMuted) return;
    
    const config = this.populationConfig[populationId];
    if (!config) return;
    
    const baseFreq = config.frequency * this.params.frequencyMultiplier;
    
    switch (eventType) {
      case 'eat':
        this._playEatSound(baseFreq, config.waveform);
        break;
      case 'birth':
        this._playBirthSound(baseFreq, config.waveform);
        break;
      case 'death':
        this._playDeathSound(baseFreq, config.waveform);
        break;
      case 'kill':
        this._playKillSound(baseFreq, config.waveform);
        break;
    }
  }
  
  /**
   * Nahrung essen - kurzer hoher Blip
   */
  _playEatSound(baseFreq, waveform) {
    const freq = baseFreq + 200;  // +200 Hz Blip
    this._playTone(freq, waveform, 0.005, 0.05, this.params.eventVolume);
  }
  
  /**
   * Geburt - aufsteigender Sweep
   */
  _playBirthSound(baseFreq, waveform) {
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = waveform;
    osc.frequency.setValueAtTime(baseFreq, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      baseFreq * 2,  // +1 Oktave
      this.context.currentTime + 0.15
    );
    osc.detune.value = this.params.detune;
    
    const volume = this.params.masterVolume * this.params.eventVolume * 0.3;
    gain.gain.setValueAtTime(0, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(volume, this.context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.15);
  }
  
  /**
   * Tod - absteigender Sweep
   */
  _playDeathSound(baseFreq, waveform) {
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = waveform;
    osc.frequency.setValueAtTime(baseFreq, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      baseFreq / 2,  // -1 Oktave
      this.context.currentTime + 0.2
    );
    osc.detune.value = this.params.detune;
    
    const volume = this.params.masterVolume * this.params.eventVolume * 0.3;
    gain.gain.setValueAtTime(volume, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.2);
  }
  
  /**
   * Jagd-Kill - percussiver Impact
   */
  _playKillSound(baseFreq, waveform) {
    // Haupt-Ton
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'square';  // Immer kantig für Kill
    osc.frequency.setValueAtTime(baseFreq, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, this.context.currentTime + 0.1);
    osc.detune.value = this.params.detune;
    
    const volume = this.params.masterVolume * this.params.eventVolume * 0.4;
    gain.gain.setValueAtTime(volume, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.1);
    
    // Noise-Layer für Impact
    this._playNoiseBurst(0.05);
  }
  
  /**
   * Kurzer Noise-Burst für percussive Sounds
   */
  _playNoiseBurst(duration) {
    const bufferSize = this.context.sampleRate * duration;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.context.createBufferSource();
    noise.buffer = buffer;
    
    const gain = this.context.createGain();
    const volume = this.params.masterVolume * this.params.eventVolume * 0.15;
    gain.gain.setValueAtTime(volume, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
    
    // High-pass filter für knackigen Sound
    const filter = this.context.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start();
    noise.stop(this.context.currentTime + duration);
  }
  
  /**
   * Basis-Methode zum Abspielen eines Tons
   */
  _playTone(frequency, waveform, attack, decay, volumeMultiplier = 1) {
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    // Pitch-Shift berechnen (Halbtöne → Frequenz-Multiplikator)
    const pitchMultiplier = Math.pow(2, this.params.pitchShift / 12);
    
    osc.type = waveform;
    osc.frequency.value = frequency * pitchMultiplier;
    osc.detune.value = this.params.detune;
    
    const volume = this.params.masterVolume * volumeMultiplier * 0.3;
    
    // ADSR Envelope (vereinfacht: Attack + Decay)
    gain.gain.setValueAtTime(0, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(volume, this.context.currentTime + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + attack + decay);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.context.currentTime + attack + decay);
  }
  
  /**
   * Setzt die Master-Lautstärke (0-1)
   */
  setMasterVolume(value) {
    this.params.masterVolume = Math.max(0, Math.min(1, value));
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.params.masterVolume, this.context.currentTime);
    }
  }
  
  /**
   * Setzt die Musik-Lautstärke (0-1)
   */
  setMusicVolume(value) {
    this.params.musicVolume = Math.max(0, Math.min(1, value));
    if (this.musicGain) {
      this.musicGain.gain.setTargetAtTime(this.params.musicVolume, this.context.currentTime, 0.1);
    }
  }
  
  /**
   * Mute an/aus
   */
  setMuted(muted) {
    this.isMuted = muted;
    if (muted && this.isMusicPlaying) {
      this.stopMusic();
    }
  }
  
  /**
   * Setzt die Populationsanteile (für dynamische Musik-Mischung)
   * @param {Object} shares - { sprinter: 0.3, tank: 0.2, ... } (sollte sich zu 1 addieren)
   */
  setPopulationShares(shares) {
    for (const popId of Object.keys(shares)) {
      if (this.populationShares.hasOwnProperty(popId)) {
        this.populationShares[popId] = Math.max(0, Math.min(1, shares[popId]));
        
        // Gain-Node updaten wenn Musik läuft
        if (this.musicTracks[popId] && this.musicTracks[popId].gain) {
          this.musicTracks[popId].gain.gain.setTargetAtTime(
            this.populationShares[popId],
            this.context.currentTime,
            0.3  // Smooth transition über 300ms
          );
        }
      }
    }
  }
  
  /**
   * Startet die Hintergrundmusik für alle Populationen
   */
  startMusic() {
    if (!this.isEnabled || this.isMuted || this.isMusicPlaying) return;
    
    this.isMusicPlaying = true;
    
    // Starte Melodie-Scheduler für jede Population
    for (const popId of Object.keys(this.populationConfig)) {
      this._startMelodyScheduler(popId);
    }
    
    console.log('Music started');
  }
  
  /**
   * Stoppt die Hintergrundmusik
   */
  stopMusic() {
    if (!this.isMusicPlaying) return;
    
    this.isMusicPlaying = false;
    
    // Stoppe alle Scheduler
    for (const popId of Object.keys(this.musicSchedulers)) {
      if (this.musicSchedulers[popId]) {
        clearTimeout(this.musicSchedulers[popId]);
        this.musicSchedulers[popId] = null;
      }
      if (this.musicTracks[popId]) {
        this.musicTracks[popId].noteIndex = 0;
      }
    }
    
    console.log('Music stopped');
  }
  
  /**
   * Startet den Melodie-Scheduler für eine Population
   */
  _startMelodyScheduler(popId) {
    const config = this.populationConfig[popId];
    if (!config || !config.melody) return;
    
    const melody = config.melody;
    const track = this.musicTracks[popId];
    
    const scheduleNextNote = () => {
      if (!this.isMusicPlaying) return;
      
      const noteIndex = track.noteIndex;
      const frequency = melody.notes[noteIndex];
      const duration = melody.durations[noteIndex];
      const beatsPerSecond = melody.tempo / 60;
      const noteDuration = duration / beatsPerSecond;
      
      // Spiele die Note
      this._playMelodyNote(popId, frequency, noteDuration, melody.waveform, melody.style);
      
      // Nächste Note Index
      track.noteIndex = (noteIndex + 1) % melody.notes.length;
      
      // Schedule nächste Note
      const nextNoteDelay = noteDuration * 1000;
      this.musicSchedulers[popId] = setTimeout(scheduleNextNote, nextNoteDelay);
    };
    
    // Starte mit leichtem Offset pro Population für mehr Variation
    const startDelay = Object.keys(this.populationConfig).indexOf(popId) * 100;
    setTimeout(scheduleNextNote, startDelay);
  }
  
  /**
   * Spielt eine einzelne Melodie-Note
   */
  _playMelodyNote(popId, frequency, duration, waveform, style) {
    if (!this.isEnabled || this.isMuted) return;
    
    const track = this.musicTracks[popId];
    if (!track || !track.gain) return;
    
    const osc = this.context.createOscillator();
    const noteGain = this.context.createGain();
    
    osc.type = waveform;
    osc.frequency.value = frequency * this.params.frequencyMultiplier;
    osc.detune.value = this.params.detune;
    
    const volume = 0.15;  // Basis-Lautstärke für Melodie-Noten
    
    // Style-abhängige Envelope
    switch (style) {
      case 'staccato':
        // Kurze, abgehackte Noten
        noteGain.gain.setValueAtTime(0, this.context.currentTime);
        noteGain.gain.linearRampToValueAtTime(volume, this.context.currentTime + 0.01);
        noteGain.gain.setValueAtTime(volume, this.context.currentTime + duration * 0.3);
        noteGain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration * 0.5);
        break;
        
      case 'legato':
        // Lange, fließende Noten
        noteGain.gain.setValueAtTime(0, this.context.currentTime);
        noteGain.gain.linearRampToValueAtTime(volume, this.context.currentTime + duration * 0.1);
        noteGain.gain.setValueAtTime(volume, this.context.currentTime + duration * 0.7);
        noteGain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration * 0.95);
        break;
        
      case 'aggressive':
        // Harter Attack, mittlerer Decay
        noteGain.gain.setValueAtTime(volume, this.context.currentTime);
        noteGain.gain.setValueAtTime(volume * 0.8, this.context.currentTime + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration * 0.8);
        break;
        
      case 'gentle':
        // Sanfter Attack und Decay
        noteGain.gain.setValueAtTime(0, this.context.currentTime);
        noteGain.gain.linearRampToValueAtTime(volume * 0.7, this.context.currentTime + duration * 0.2);
        noteGain.gain.setValueAtTime(volume * 0.7, this.context.currentTime + duration * 0.6);
        noteGain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration * 0.95);
        break;
        
      case 'balanced':
      default:
        // Standard Envelope
        noteGain.gain.setValueAtTime(0, this.context.currentTime);
        noteGain.gain.linearRampToValueAtTime(volume, this.context.currentTime + 0.02);
        noteGain.gain.setValueAtTime(volume, this.context.currentTime + duration * 0.5);
        noteGain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration * 0.9);
        break;
    }
    
    osc.connect(noteGain);
    noteGain.connect(track.gain);  // Verbinde mit populations-spezifischem Gain
    
    osc.start();
    osc.stop(this.context.currentTime + duration);
  }
  
  /**
   * Setzt einen Parameter
   */
  setParam(name, value) {
    if (name in this.params) {
      this.params[name] = value;
    }
  }
  
  /**
   * Gibt alle aktuellen Einstellungen als JSON zurück
   */
  exportSettings() {
    return {
      params: { ...this.params },
      populationConfig: JSON.parse(JSON.stringify(this.populationConfig)),
      populationShares: { ...this.populationShares }
    };
  }
  
  /**
   * Setzt alle Parameter auf Standardwerte zurück
   */
  resetDefaults() {
    this.params = {
      masterVolume: 0.5,
      eventVolume: 0.7,
      musicVolume: 0.4,
      frequencyMultiplier: 1.0,
      attack: 0.01,
      decay: 0.1,
      pitchShift: 0,
      detune: 0
    };
    
    this.populationShares = {
      sprinter: 0.2,
      tank: 0.2,
      hunter: 0.2,
      gatherer: 0.2,
      allrounder: 0.2
    };
    
    if (this.masterGain) {
      this.masterGain.gain.value = this.params.masterVolume;
    }
    if (this.musicGain) {
      this.musicGain.gain.value = this.params.musicVolume;
    }
    
    // Reset population gains
    for (const popId of Object.keys(this.musicTracks)) {
      if (this.musicTracks[popId] && this.musicTracks[popId].gain) {
        this.musicTracks[popId].gain.gain.value = this.populationShares[popId];
      }
    }
  }
  
  /**
   * Gibt die aktuellen Populationsanteile zurück
   */
  getPopulationShares() {
    return { ...this.populationShares };
  }
  
  /**
   * Prüft ob Musik läuft
   */
  isMusicActive() {
    return this.isMusicPlaying;
  }
}

// Global verfügbar machen
window.AudioEngine = AudioEngine;
