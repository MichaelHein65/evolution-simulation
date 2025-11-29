/**
 * TitleMelody - Mysteriöse Titelmelodie für die Landing Page
 * Harry Potter inspiriert - langsamer Start, nachklingend beim Verlassen
 */

class TitleMelodyEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverbGain: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private isPlaying = false;
  private noteTimeouts: ReturnType<typeof setTimeout>[] = [];
  private activeOscillators: OscillatorNode[] = [];
  private fadeOutTimeout: ReturnType<typeof setTimeout> | null = null;
  
  // Mysteriöse Melodie - inspiriert von Harry Potter's "Hedwig's Theme"
  // Verwendet Moll-Tonart und charakteristische Intervalle
  private melody = {
    // Hauptmelodie: B - E - G - F# - E - B - A - F#
    // In Frequenzen (E-Moll / mysteriös)
    notes: [
      // Phrase 1 - langsam einsetzen
      { freq: 493.88, duration: 0.8, delay: 0 },      // B4
      { freq: 659.25, duration: 1.2, delay: 1.0 },    // E5
      { freq: 783.99, duration: 0.4, delay: 2.4 },    // G5
      { freq: 739.99, duration: 0.4, delay: 2.9 },    // F#5
      { freq: 659.25, duration: 1.6, delay: 3.4 },    // E5 (lang)
      
      // Phrase 2
      { freq: 987.77, duration: 0.8, delay: 5.2 },    // B5
      { freq: 880.00, duration: 1.8, delay: 6.2 },    // A5 (sehr lang)
      { freq: 739.99, duration: 2.0, delay: 8.2 },    // F#5 (ausklingend)
      
      // Phrase 3 - Wiederholung tiefer
      { freq: 329.63, duration: 0.8, delay: 10.5 },   // E4
      { freq: 493.88, duration: 1.2, delay: 11.5 },   // B4
      { freq: 587.33, duration: 0.4, delay: 12.9 },   // D5
      { freq: 554.37, duration: 0.4, delay: 13.4 },   // C#5
      { freq: 493.88, duration: 1.6, delay: 13.9 },   // B4
      
      // Phrase 4 - mysteriöser Schluss
      { freq: 659.25, duration: 0.6, delay: 15.7 },   // E5
      { freq: 622.25, duration: 0.6, delay: 16.4 },   // Eb5 (chromatisch)
      { freq: 587.33, duration: 0.6, delay: 17.1 },   // D5
      { freq: 554.37, duration: 0.6, delay: 17.8 },   // C#5
      { freq: 493.88, duration: 2.5, delay: 18.5 },   // B4 (Schluss)
    ],
    
    // Begleitende tiefe Töne (Bordun/Drone)
    bass: [
      { freq: 164.81, duration: 5.0, delay: 0.5 },    // E3
      { freq: 146.83, duration: 4.0, delay: 5.5 },    // D3
      { freq: 164.81, duration: 5.0, delay: 10.0 },   // E3
      { freq: 123.47, duration: 6.0, delay: 15.5 },   // B2
    ],
    
    // Glitzernde hohe Töne (Celesta-artig)
    sparkles: [
      { freq: 1318.51, duration: 0.3, delay: 2.5 },   // E6
      { freq: 1567.98, duration: 0.2, delay: 6.3 },   // G6
      { freq: 1479.98, duration: 0.3, delay: 8.4 },   // F#6
      { freq: 1318.51, duration: 0.4, delay: 12.0 },  // E6
      { freq: 1174.66, duration: 0.3, delay: 16.5 },  // D6
      { freq: 987.77, duration: 0.5, delay: 19.0 },   // B5
    ]
  };
  
  /**
   * Initialisiert den AudioContext
   */
  async init(): Promise<boolean> {
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Master Gain (für Fade-out)
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 0; // Start silent
      this.masterGain.connect(this.context.destination);
      
      // Reverb für atmosphärischen Klang
      this.reverbGain = this.context.createGain();
      this.reverbGain.gain.value = 0.3;
      
      // Einfacher Hall mit Delay-basiertem Reverb
      const delay = this.context.createDelay(1.0);
      delay.delayTime.value = 0.3;
      const feedback = this.context.createGain();
      feedback.gain.value = 0.4;
      
      this.reverbGain.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(this.masterGain);
      this.reverbGain.connect(this.masterGain);
      
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }
      
      console.log('🎵 Title Melody initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize Title Melody:', error);
      return false;
    }
  }
  
  /**
   * Startet die Melodie mit langsamem Einsetzen
   */
  async start(): Promise<void> {
    if (!this.context || this.isPlaying) return;
    
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
    
    this.isPlaying = true;
    
    // Langsames Einblenden über 2 Sekunden
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(0, this.context.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.20, this.context.currentTime + 2);
    }
    
    // Hauptmelodie spielen
    this.melody.notes.forEach(note => {
      const timeout = setTimeout(() => {
        this.playMelodyNote(note.freq, note.duration, 'melody');
      }, note.delay * 1000);
      this.noteTimeouts.push(timeout);
    });
    
    // Bass-Töne
    this.melody.bass.forEach(note => {
      const timeout = setTimeout(() => {
        this.playMelodyNote(note.freq, note.duration, 'bass');
      }, note.delay * 1000);
      this.noteTimeouts.push(timeout);
    });
    
    // Sparkles (hohe Glitzer-Töne)
    this.melody.sparkles.forEach(note => {
      const timeout = setTimeout(() => {
        this.playMelodyNote(note.freq, note.duration, 'sparkle');
      }, note.delay * 1000);
      this.noteTimeouts.push(timeout);
    });
    
    // Loop nach Ende der Melodie
    const loopTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.restartMelody();
      }
    }, 22000); // Melodie ist ca. 21 Sekunden
    this.noteTimeouts.push(loopTimeout);
  }
  
  /**
   * Startet die Melodie neu (für Looping)
   */
  private restartMelody(): void {
    if (!this.isPlaying) return;
    
    // Alle Timeouts clearen
    this.noteTimeouts.forEach(t => clearTimeout(t));
    this.noteTimeouts = [];
    
    // Neu starten
    this.melody.notes.forEach(note => {
      const timeout = setTimeout(() => {
        if (this.isPlaying) {
          this.playMelodyNote(note.freq, note.duration, 'melody');
        }
      }, note.delay * 1000);
      this.noteTimeouts.push(timeout);
    });
    
    this.melody.bass.forEach(note => {
      const timeout = setTimeout(() => {
        if (this.isPlaying) {
          this.playMelodyNote(note.freq, note.duration, 'bass');
        }
      }, note.delay * 1000);
      this.noteTimeouts.push(timeout);
    });
    
    this.melody.sparkles.forEach(note => {
      const timeout = setTimeout(() => {
        if (this.isPlaying) {
          this.playMelodyNote(note.freq, note.duration, 'sparkle');
        }
      }, note.delay * 1000);
      this.noteTimeouts.push(timeout);
    });
    
    const loopTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.restartMelody();
      }
    }, 22000);
    this.noteTimeouts.push(loopTimeout);
  }
  
  /**
   * Spielt eine einzelne Note der Melodie
   */
  private playMelodyNote(freq: number, duration: number, type: 'melody' | 'bass' | 'sparkle'): void {
    if (!this.context || !this.masterGain || !this.reverbGain || !this.isPlaying) return;
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    
    // Verschiedene Sounds für verschiedene Typen
    switch (type) {
      case 'melody':
        osc.type = 'sine';
        // Leichtes Vibrato
        const vibrato = this.context.createOscillator();
        const vibratoGain = this.context.createGain();
        vibrato.frequency.value = 5; // 5 Hz Vibrato
        vibratoGain.gain.value = 3; // 3 Hz Pitch-Variation
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        vibrato.start();
        vibrato.stop(this.context.currentTime + duration);
        
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        gain.gain.setValueAtTime(0, this.context.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, this.context.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, this.context.currentTime + duration * 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
        break;
        
      case 'bass':
        osc.type = 'sine';
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        gain.gain.setValueAtTime(0, this.context.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, this.context.currentTime + 0.3);
        gain.gain.setValueAtTime(0.12, this.context.currentTime + duration * 0.7);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
        break;
        
      case 'sparkle':
        osc.type = 'sine';
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        gain.gain.setValueAtTime(0.08, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
        break;
    }
    
    osc.frequency.value = freq;
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    gain.connect(this.reverbGain); // Auch zum Reverb
    
    osc.start();
    osc.stop(this.context.currentTime + duration + 0.5);
    
    this.activeOscillators.push(osc);
    
    // Cleanup nach dem Stoppen
    osc.onended = () => {
      const index = this.activeOscillators.indexOf(osc);
      if (index > -1) {
        this.activeOscillators.splice(index, 1);
      }
    };
  }
  
  /**
   * Stoppt die Melodie mit Nachklingen (Fade-out über 3 Sekunden)
   */
  fadeOut(): void {
    if (!this.context || !this.masterGain) return;
    
    this.isPlaying = false;
    
    // Alle zukünftigen Noten stoppen
    this.noteTimeouts.forEach(t => clearTimeout(t));
    this.noteTimeouts = [];
    
    // Langsames Ausblenden über 3 Sekunden
    const currentGain = this.masterGain.gain.value;
    this.masterGain.gain.setValueAtTime(currentGain, this.context.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0, this.context.currentTime + 3);
    
    // Nach dem Fade-out aufräumen
    this.fadeOutTimeout = setTimeout(() => {
      this.activeOscillators.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {
          // Ignorieren wenn bereits gestoppt
        }
      });
      this.activeOscillators = [];
    }, 3500);
  }
  
  /**
   * Sofortiger Stop (ohne Fade)
   */
  stop(): void {
    this.isPlaying = false;
    
    this.noteTimeouts.forEach(t => clearTimeout(t));
    this.noteTimeouts = [];
    
    if (this.fadeOutTimeout) {
      clearTimeout(this.fadeOutTimeout);
    }
    
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Ignorieren
      }
    });
    this.activeOscillators = [];
    
    if (this.masterGain) {
      this.masterGain.gain.value = 0;
    }
  }
  
  /**
   * Prüft ob die Melodie läuft
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }
  
  /**
   * Aufräumen
   */
  destroy(): void {
    this.stop();
    if (this.context) {
      this.context.close();
      this.context = null;
    }
  }
}

// Singleton Instance
export const titleMelody = new TitleMelodyEngine();
