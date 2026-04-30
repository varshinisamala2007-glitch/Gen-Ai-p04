import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music2, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: number;
  color: string;
}

const TRACKS: Track[] = [
  { id: 1, title: 'NEON_PULSE.wav', artist: 'CYBERGEN_AI', duration: 185, color: '#06b6d2' },
  { id: 2, title: 'SYNTH_WAVE.mp3', artist: 'DREAMCODER_AI', duration: 210, color: '#d946ef' },
  { id: 3, title: 'BITSTREAM.flac', artist: 'NEURAL_BEATS', duration: 145, color: '#22c55e' },
];

interface MusicPlayerProps {
  onPlayStateChange: (isPlaying: boolean) => void;
}

export default function MusicPlayer({ onPlayStateChange }: MusicPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume] = useState(85);
  
  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= currentTrack.duration) {
            handleSkipForward();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  const togglePlay = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    onPlayStateChange(newState);
  };

  const handleSkipForward = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setProgress(0);
  };

  const handleSkipBack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setProgress(0);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden" id="music-player-widget">
      {/* Decorative hardware lines */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <motion.div 
              key={currentTrack.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-16 h-16 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/10 relative overflow-hidden"
              style={{ boxShadow: `0 0 20px ${currentTrack.color}15` }}
            >
              <Disc 
                size={32} 
                className={isPlaying ? "animate-spin text-zinc-500" : "text-zinc-600"} 
                style={{ animationDuration: '3s', color: isPlaying ? currentTrack.color : '' }}
              />
            </motion.div>
            {isPlaying && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full animate-ping" />
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Now_Transmitting</span>
              <div className="h-px grow bg-white/5" />
            </div>
            <AnimatePresence mode="wait">
              <motion.h3 
                key={currentTrack.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="text-lg font-bold text-white tracking-tight font-display truncate"
              >
                {currentTrack.title}
              </motion.h3>
            </AnimatePresence>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.2em]">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">
            <span className="text-cyan-500/80">{formatTime(progress)}</span>
            <span>{formatTime(currentTrack.duration)}</span>
          </div>
          <div className="relative h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 h-full shadow-[0_0_10px_currentColor]"
              animate={{ width: `${(progress / currentTrack.duration) * 100}%` }}
              transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              style={{ backgroundColor: currentTrack.color, color: currentTrack.color }}
            />
          </div>
        </div>

        {/* Controls Layout */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSkipBack}
              className="text-zinc-500 hover:text-white transition-all hover:scale-110 active:scale-90"
              aria-label="Previous track"
            >
              <SkipBack size={20} fill="currentColor" />
            </button>
            
            <button 
              onClick={togglePlay}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-white text-black hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
              id="play-pause-button"
            >
              {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
            </button>

            <button 
              onClick={handleSkipForward}
              className="text-zinc-500 hover:text-white transition-all hover:scale-110 active:scale-90"
              aria-label="Next track"
            >
              <SkipForward size={20} fill="currentColor" />
            </button>
          </div>

          <div className="flex items-center gap-3 bg-black/20 px-3 py-2 rounded-lg border border-white/5">
            <Volume2 size={14} className="text-zinc-500" />
            <div className="w-16 h-1 bg-zinc-800 rounded-full relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-white/40" style={{ width: `${volume}%` }} />
            </div>
            <span className="text-[9px] font-mono text-zinc-600">{volume}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
