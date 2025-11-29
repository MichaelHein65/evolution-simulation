/**
 * AudioEngine - Web Audio API für Evolution Simulation
 * Synthesisiert Event-Sounds und Hintergrundmusik basierend auf Populationen
 */

export interface SimulationEvents {
  foodEaten: Array<{ populationId: string; x: number }>;
  births: Array<{ populationId: string; x: number }>;
  deaths: Array<{ populationId: string; x: number }>;
  kills: Array<{ attackerId: string; victimId: string; x: number }>;
}

interface PopulationMelody {
  notes: number[];
  durations: number[];
  tempo: number;
  waveform: OscillatorType;
  style: 'staccato' | 'legato' | 'aggressive' | 'gentle' | 'balanced';
}

interface PopulationAudioConfig {
  frequency: number;
  waveform: OscillatorType;
  color: string;
  name: string;
  melody: PopulationMelody;
}

export class AudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private eventsGain: GainNode | null = null;
  private isEnabled = false;
  private isMuted = false;
  private isMusicPlaying = false;
  
  // Musik-Tracks pro Population
  private musicTracks: Record<string, {
    gain: GainNode;
    noteIndex: number;
  }> = {};
  private musicSchedulers: Record<string, ReturnType<typeof setTimeout> | null> = {};
  
  // Populationsanteile (0-1)
  private populationShares: Record<string, number> = {
    sprinter: 0.2,
    tank: 0.2,
    hunter: 0.2,
    gatherer: 0.2,
    allrounder: 0.2
  };
  
  // Event-Throttling
  private lastEventTime: Record<string, number> = {};
  private eventCooldown = 50; // ms zwischen gleichen Events
  private maxEventsPerSecond = 30;
  private eventCount = 0;
  private eventCountResetTime = 0;
  
  // Sound-Konfiguration pro Population
  private populationConfig: Record<string, PopulationAudioConfig> = {
    sprinter: {
      frequency: 523.25,  // C5
      waveform: 'sawtooth',
      color: '#EF4444',
      name: 'Sprinter',
      melody: {
        notes: [523, 659, 784, 659, 523, 784, 880, 784],
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
      melody: {
        notes: [110, 130.81, 146.83, 130.81, 110, 98, 110, 130.81],
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
      melody: {
        notes: [392, 466, 392, 349, 392, 466, 523, 466],
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
      melody: {
        notes: [329.63, 392, 440, 523, 440, 392, 329.63, 293.66],
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
      melody: {
        notes: [440, 493.88, 523, 493.88, 440, 392, 440, 523],
        durations: [0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.5],
        tempo: 100,
        waveform: 'sine',
        style: 'balanced'
      }
    }
  };
  
  // Parameter
  private params = {
    masterVolume: 0.5,
    eventVolume: 0.6,
    musicVolume: 0.3,
    frequencyMultiplier: 1.0,
    detune: 0
  };

  /**
   * Initialisiert den AudioContext (muss nach User-Interaktion aufgerufen werden)
   */
  async enable(): Promise<boolean> {
    if (this.isEnabled) return true;
    
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Master Gain Node
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = this.params.masterVolume;
      this.masterGain.connect(this.context.destination);
      
      // Events Gain Node
      this.eventsGain = this.context.createGain();
      this.eventsGain.gain.value = this.params.eventVolume;
      this.eventsGain.connect(this.masterGain);
      
      // Music Gain Node
      this.musicGain = this.context.createGain();
      this.musicGain.gain.value = this.params.musicVolume;
      this.musicGain.connect(this.masterGain);
      
      // Gain-Nodes für jede Population
      for (const popId of Object.keys(this.populationConfig)) {
        const gain = this.context.createGain();
        gain.gain.value = this.populationShares[popId] || 0.2;
        gain.connect(this.musicGain);
        this.musicTracks[popId] = { gain, noteIndex: 0 };
      }
      
      // Resume if suspended
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }
      
      this.isEnabled = true;
      console.log('🔊 AudioEngine enabled');
      return true;
    } catch (error) {
      console.error('Failed to enable AudioEngine:', error);
      return false;
    }
  }

  /**
   * Verarbeitet Events aus der Simulation
   */
  processEvents(events: SimulationEvents): void {
    if (!this.isEnabled || this.isMuted) return;
    
    const now = performance.now();
    
    // Reset event count jede Sekunde
    if (now - this.eventCountResetTime > 1000) {
      this.eventCount = 0;
      this.eventCountResetTime = now;
    }
    
    // Priorität: kills > births > deaths > foodEaten
    const allEvents: Array<{ type: string; popId: string; x: number; priority: number }> = [];
    
    for (const kill of events.kills) {
      allEvents.push({ type: 'kill', popId: kill.attackerId, x: kill.x, priority: 4 });
    }
    for (const birth of events.births) {
      allEvents.push({ type: 'birth', popId: birth.populationId, x: birth.x, priority: 3 });
    }
    for (const death of events.deaths) {
      allEvents.push({ type: 'death', popId: death.populationId, x: death.x, priority: 2 });
    }
    for (const eat of events.foodEaten) {
      allEvents.push({ type: 'eat', popId: eat.populationId, x: eat.x, priority: 1 });
    }
    
    // Nach Priorität sortieren
    allEvents.sort((a, b) => b.priority - a.priority);
    
    // Events abspielen (mit Throttling)
    for (const event of allEvents) {
      if (this.eventCount >= this.maxEventsPerSecond) break;
      
      const eventKey = `${event.type}-${event.popId}`;
      const lastTime = this.lastEventTime[eventKey] || 0;
      
      if (now - lastTime > this.eventCooldown) {
        this.playEventSound(event.type as any, event.popId, event.x);
        this.lastEventTime[eventKey] = now;
        this.eventCount++;
      }
    }
  }

  /**
   * Spielt einen Event-Sound ab
   */
  playEventSound(eventType: 'eat' | 'birth' | 'death' | 'kill', populationId: string, x?: number): void {
    if (!this.isEnabled || this.isMuted || !this.context || !this.eventsGain) return;
    
    const config = this.populationConfig[populationId];
    if (!config) return;
    
    const baseFreq = config.frequency * this.params.frequencyMultiplier;
    
    // Stereo-Panning basierend auf X-Position (optional)
    const pan = x !== undefined ? (x / 1400) * 2 - 1 : 0; // -1 bis 1
    
    switch (eventType) {
      case 'eat':
        this.playEatSound(baseFreq, config.waveform, pan);
        break;
      case 'birth':
        this.playBirthSound(baseFreq, config.waveform, pan);
        break;
      case 'death':
        this.playDeathSound(baseFreq, config.waveform, pan);
        break;
      case 'kill':
        this.playKillSound(baseFreq, pan);
        break;
    }
  }

  private playEatSound(baseFreq: number, waveform: OscillatorType, pan: number): void {
    if (!this.context || !this.eventsGain) return;
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const panner = this.context.createStereoPanner();
    
    osc.type = waveform;
    osc.frequency.value = baseFreq + 200;
    panner.pan.value = pan;
    
    const volume = 0.15;
    gain.gain.setValueAtTime(0, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(volume, this.context.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(panner);
    panner.connect(this.eventsGain);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.05);
  }

  private playBirthSound(baseFreq: number, waveform: OscillatorType, pan: number): void {
    if (!this.context || !this.eventsGain) return;
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const panner = this.context.createStereoPanner();
    
    osc.type = waveform;
    osc.frequency.setValueAtTime(baseFreq, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2, this.context.currentTime + 0.15);
    panner.pan.value = pan;
    
    const volume = 0.12;
    gain.gain.setValueAtTime(0, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(volume, this.context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(panner);
    panner.connect(this.eventsGain);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.15);
  }

  private playDeathSound(baseFreq: number, waveform: OscillatorType, pan: number): void {
    if (!this.context || !this.eventsGain) return;
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const panner = this.context.createStereoPanner();
    
    osc.type = waveform;
    osc.frequency.setValueAtTime(baseFreq, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq / 2, this.context.currentTime + 0.2);
    panner.pan.value = pan;
    
    const volume = 0.1;
    gain.gain.setValueAtTime(volume, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(panner);
    panner.connect(this.eventsGain);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.2);
  }

  private playKillSound(baseFreq: number, pan: number): void {
    if (!this.context || !this.eventsGain) return;
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const panner = this.context.createStereoPanner();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(baseFreq, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, this.context.currentTime + 0.1);
    panner.pan.value = pan;
    
    const volume = 0.15;
    gain.gain.setValueAtTime(volume, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(panner);
    panner.connect(this.eventsGain);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.1);
    
    // Noise burst
    this.playNoiseBurst(0.05, pan);
  }

  private playNoiseBurst(duration: number, pan: number): void {
    if (!this.context || !this.eventsGain) return;
    
    const bufferSize = this.context.sampleRate * duration;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.context.createBufferSource();
    noise.buffer = buffer;
    
    const gain = this.context.createGain();
    const panner = this.context.createStereoPanner();
    const filter = this.context.createBiquadFilter();
    
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    panner.pan.value = pan;
    
    const volume = 0.08;
    gain.gain.setValueAtTime(volume, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(this.eventsGain);
    
    noise.start();
    noise.stop(this.context.currentTime + duration);
  }

  /**
   * Setzt die Populationsanteile für die Musik
   */
  setPopulationShares(shares: Record<string, number>): void {
    for (const popId of Object.keys(shares)) {
      if (this.populationShares.hasOwnProperty(popId)) {
        this.populationShares[popId] = Math.max(0, Math.min(1, shares[popId]));
        
        if (this.musicTracks[popId]?.gain && this.context) {
          this.musicTracks[popId].gain.gain.setTargetAtTime(
            this.populationShares[popId],
            this.context.currentTime,
            0.3
          );
        }
      }
    }
  }

  /**
   * Berechnet Populationsanteile aus den Counts
   */
  updatePopulationSharesFromCounts(counts: Record<string, number>): void {
    let total = 0;
    for (const popId in counts) {
      total += counts[popId];
    }
    
    if (total === 0) return;
    
    const shares: Record<string, number> = {};
    for (const popId in counts) {
      shares[popId] = counts[popId] / total;
    }
    
    this.setPopulationShares(shares);
  }

  /**
   * Startet die Hintergrundmusik
   */
  startMusic(): void {
    if (!this.isEnabled || this.isMuted || this.isMusicPlaying) return;
    
    this.isMusicPlaying = true;
    
    for (const popId of Object.keys(this.populationConfig)) {
      this.startMelodyScheduler(popId);
    }
    
    console.log('🎵 Music started');
  }

  /**
   * Stoppt die Hintergrundmusik
   */
  stopMusic(): void {
    if (!this.isMusicPlaying) return;
    
    this.isMusicPlaying = false;
    
    for (const popId of Object.keys(this.musicSchedulers)) {
      if (this.musicSchedulers[popId]) {
        clearTimeout(this.musicSchedulers[popId]!);
        this.musicSchedulers[popId] = null;
      }
      if (this.musicTracks[popId]) {
        this.musicTracks[popId].noteIndex = 0;
      }
    }
    
    console.log('🎵 Music stopped');
  }

  private startMelodyScheduler(popId: string): void {
    const config = this.populationConfig[popId];
    if (!config?.melody) return;
    
    const melody = config.melody;
    const track = this.musicTracks[popId];
    if (!track) return;
    
    const scheduleNextNote = () => {
      if (!this.isMusicPlaying) return;
      
      const noteIndex = track.noteIndex;
      const frequency = melody.notes[noteIndex];
      const duration = melody.durations[noteIndex];
      const beatsPerSecond = melody.tempo / 60;
      const noteDuration = duration / beatsPerSecond;
      
      this.playMelodyNote(popId, frequency, noteDuration, melody.waveform, melody.style);
      
      track.noteIndex = (noteIndex + 1) % melody.notes.length;
      
      const nextNoteDelay = noteDuration * 1000;
      this.musicSchedulers[popId] = setTimeout(scheduleNextNote, nextNoteDelay);
    };
    
    const startDelay = Object.keys(this.populationConfig).indexOf(popId) * 100;
    setTimeout(scheduleNextNote, startDelay);
  }

  private playMelodyNote(popId: string, frequency: number, duration: number, waveform: OscillatorType, style: string): void {
    if (!this.isEnabled || this.isMuted || !this.context) return;
    
    const track = this.musicTracks[popId];
    if (!track?.gain) return;
    
    const osc = this.context.createOscillator();
    const noteGain = this.context.createGain();
    
    osc.type = waveform;
    osc.frequency.value = frequency * this.params.frequencyMultiplier;
    osc.detune.value = this.params.detune;
    
    const volume = 0.12;
    
    switch (style) {
      case 'staccato':
        noteGain.gain.setValueAtTime(0, this.context.currentTime);
        noteGain.gain.linearRampToValueAtTime(volume, this.context.currentTime + 0.01);
        noteGain.gain.setValueAtTime(volume, this.context.currentTime + duration * 0.3);
        noteGain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration * 0.5);
        break;
        
      case 'legato':
        noteGain.gain.setValueAtTime(0, this.context.currentTime);
        noteGain.gain.linearRampToValueAtTime(volume, this.context.currentTime + duration * 0.1);
        noteGain.gain.setValueAtTime(volume, this.context.currentTime + duration * 0.7);
        noteGain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration * 0.95);
        break;
        
      case 'aggressive':
        noteGain.gain.setValueAtTime(volume, this.context.currentTime);
        noteGain.gain.setValueAtTime(volume * 0.8, this.context.currentTime + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration * 0.8);
        break;
        
      case 'gentle':
        noteGain.gain.setValueAtTime(0, this.context.currentTime);
        noteGain.gain.linearRampToValueAtTime(volume * 0.7, this.context.currentTime + duration * 0.2);
        noteGain.gain.setValueAtTime(volume * 0.7, this.context.currentTime + duration * 0.6);
        noteGain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration * 0.95);
        break;
        
      default:
        noteGain.gain.setValueAtTime(0, this.context.currentTime);
        noteGain.gain.linearRampToValueAtTime(volume, this.context.currentTime + 0.02);
        noteGain.gain.setValueAtTime(volume, this.context.currentTime + duration * 0.5);
        noteGain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration * 0.9);
        break;
    }
    
    osc.connect(noteGain);
    noteGain.connect(track.gain);
    
    osc.start();
    osc.stop(this.context.currentTime + duration);
  }

  // Setter für Parameter
  setMasterVolume(value: number): void {
    this.params.masterVolume = Math.max(0, Math.min(1, value));
    if (this.masterGain && this.context) {
      this.masterGain.gain.setTargetAtTime(this.params.masterVolume, this.context.currentTime, 0.1);
    }
  }

  setMusicVolume(value: number): void {
    this.params.musicVolume = Math.max(0, Math.min(1, value));
    if (this.musicGain && this.context) {
      this.musicGain.gain.setTargetAtTime(this.params.musicVolume, this.context.currentTime, 0.1);
    }
  }

  setEventVolume(value: number): void {
    this.params.eventVolume = Math.max(0, Math.min(1, value));
    if (this.eventsGain && this.context) {
      this.eventsGain.gain.setTargetAtTime(this.params.eventVolume, this.context.currentTime, 0.1);
    }
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted && this.isMusicPlaying) {
      this.stopMusic();
    }
  }

  // Getter
  getIsEnabled(): boolean { return this.isEnabled; }
  getIsMuted(): boolean { return this.isMuted; }
  getIsMusicPlaying(): boolean { return this.isMusicPlaying; }
  getMasterVolume(): number { return this.params.masterVolume; }
  getMusicVolume(): number { return this.params.musicVolume; }
  getEventVolume(): number { return this.params.eventVolume; }
}

// Singleton-Instanz
export const audioEngine = new AudioEngine();
