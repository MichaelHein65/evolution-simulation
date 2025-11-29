import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSimulationStore } from '../store/simulationStore';
import { audioEngine } from '../audio/AudioEngine';

export const AudioControls = () => {
  const {
    audioEnabled,
    musicPlaying,
    running,
    enableAudio,
    toggleMute,
    startMusic,
    stopMusic,
    setMasterVolume,
    setMusicVolume,
    setEventVolume,
  } = useSimulationStore();

  const [masterVol, setMasterVol] = useState(50);
  const [musicVol, setMusicVol] = useState(30);
  const [eventVol, setEventVol] = useState(60);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync mute state
  useEffect(() => {
    if (audioEnabled) {
      setIsMuted(audioEngine.getIsMuted());
    }
  }, [audioEnabled]);

  const handleEnableAudio = async () => {
    const success = await enableAudio();
    if (success) {
      // Apply initial volumes
      setMasterVolume(masterVol / 100);
      setMusicVolume(musicVol / 100);
      setEventVolume(eventVol / 100);
    }
  };

  const handleMuteToggle = () => {
    toggleMute();
    setIsMuted(!isMuted);
  };

  const handleMasterVolChange = (value: number) => {
    setMasterVol(value);
    setMasterVolume(value / 100);
  };

  const handleMusicVolChange = (value: number) => {
    setMusicVol(value);
    setMusicVolume(value / 100);
  };

  const handleEventVolChange = (value: number) => {
    setEventVol(value);
    setEventVolume(value / 100);
  };

  // Auto-start music when simulation starts (if audio enabled)
  useEffect(() => {
    if (running && audioEnabled && !musicPlaying && !isMuted) {
      startMusic();
    }
  }, [running, audioEnabled, musicPlaying, isMuted, startMusic]);

  // Stop music when simulation stops
  useEffect(() => {
    if (!running && musicPlaying) {
      stopMusic();
    }
  }, [running, musicPlaying, stopMusic]);

  if (!audioEnabled) {
    return (
      <div className="bg-gray-800/50 backdrop-blur rounded-lg p-3 border border-gray-700">
        <button
          onClick={handleEnableAudio}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-white font-medium transition-all w-full justify-center"
        >
          <span>🔊</span>
          <span>Audio aktivieren</span>
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Klicke für Sound-Effekte & Musik
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-lg border border-gray-700 overflow-hidden">
      {/* Header - Always visible */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-700/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{isMuted ? '🔇' : '🔊'}</span>
          <span className="font-medium text-white">Audio</span>
          {musicPlaying && !isMuted && (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Musik läuft
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMuteToggle();
            }}
            className={`p-2 rounded-lg transition-colors ${
              isMuted 
                ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' 
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
            title={isMuted ? 'Ton einschalten' : 'Stummschalten'}
          >
            {isMuted ? '🔇' : '🔈'}
          </button>
          <span className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </div>

      {/* Expanded Controls */}
      {isExpanded && (
        <div className="p-3 pt-0 space-y-4 border-t border-gray-700/50">
          {/* Music Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => musicPlaying ? stopMusic() : startMusic()}
              disabled={isMuted}
              className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all ${
                musicPlaying
                  ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                  : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
              } ${isMuted ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {musicPlaying ? '⏹️ Musik stoppen' : '▶️ Musik starten'}
            </button>
          </div>

          {/* Volume Sliders */}
          <div className="space-y-3">
            {/* Master Volume */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Master</span>
                <span className="text-gray-300">{masterVol}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={masterVol}
                onChange={(e) => handleMasterVolChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Music Volume */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">🎵 Musik</span>
                <span className="text-gray-300">{musicVol}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={musicVol}
                onChange={(e) => handleMusicVolChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Event Volume */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">⚡ Events</span>
                <span className="text-gray-300">{eventVol}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={eventVol}
                onChange={(e) => handleEventVolChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
          </div>

          {/* Info */}
          <p className="text-xs text-gray-500">
            🎵 Musik-Mix passt sich der Populationsverteilung an
          </p>

          {/* Link to Audio Simulator */}
          <Link
            to="/audio-simulator"
            className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors text-sm font-medium"
          >
            <span>🎛️</span>
            <span>Audio Simulator öffnen</span>
          </Link>
        </div>
      )}
    </div>
  );
};
