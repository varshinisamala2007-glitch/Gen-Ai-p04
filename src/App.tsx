import React, { useState } from 'react';
import SnakeGame from './components/SnakeGame.tsx';
import MusicPlayer from './components/MusicPlayer.tsx';
import { motion } from 'motion/react';
import { LayoutGrid, Music, Trophy, Terminal, Cpu } from 'lucide-react';

export default function App() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const handleScoreChange = (newScore: number) => {
    setScore(newScore);
    if (newScore > highScore) {
      setHighScore(newScore);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] relative flex flex-col items-center p-6 md:p-12 font-sans selection:bg-cyan-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-noise pointer-events-none z-0" />
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.08)_0%,transparent_50%)] pointer-events-none" />
      
      {/* Structural Dividers */}
      <div className="fixed top-0 left-1/4 w-px h-full bg-white/5 pointer-events-none" />
      <div className="fixed top-0 right-1/4 w-px h-full bg-white/5 pointer-events-none" />

      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10"
        id="app-header"
      >
        <div className="flex items-center gap-4">
          <div className="relative group">
             <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all duration-500">
              <Cpu className="text-black" size={26} />
            </div>
            <div className="absolute -inset-1 bg-cyan-400/20 blur-lg rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tighter text-white font-display">
              NEON <span className="text-cyan-500">PULSE</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">System Online // v2.0.4</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-1">Live Score</span>
            <span className="text-3xl font-mono text-cyan-400 font-bold tabular-nums text-glow-cyan leading-none">
              {score.toString().padStart(4, '0')}
            </span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-1">Terminal Best</span>
            <span className="text-3xl font-mono text-white font-bold tabular-nums flex items-center gap-2 leading-none">
              <Trophy size={20} className="text-yellow-500" />
              {highScore.toString().padStart(4, '0')}
            </span>
          </div>
        </div>
      </motion.header>

      {/* Main Game Area */}
      <main className="w-full max-w-7xl grow flex flex-col lg:grid lg:grid-cols-4 gap-8 relative z-10 mb-12" id="main-content">
        {/* Left Side: System Metrics (Visual depth) */}
        <div className="hidden lg:flex flex-col gap-6">
          <section className="glass-surface p-6 rounded-2xl" id="system-stats">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
              <Terminal size={12} /> System Feed
            </h4>
            <div className="space-y-4 font-mono text-[10px]">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-600">GRAVITY</span>
                <span className="text-cyan-500">9.81 m/s²</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-600">INPUT_LAG</span>
                <span className="text-cyan-500">0.02ms</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-600">AUTH_KEY</span>
                <span className="text-cyan-500 truncate ml-4">AES_256_GCM</span>
              </div>
            </div>
          </section>

          <section className="glass-surface p-6 rounded-2xl grow relative overflow-hidden" id="visualizer-hint">
             <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-cyan-500/5 to-transparent" />
             <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-4">Neural Activity</h4>
             <div className="flex items-end gap-1 h-24">
               {[...Array(12)].map((_, i) => (
                 <motion.div 
                   key={i}
                   animate={{ height: isMusicPlaying ? [10, 40, 20, 60, 30] : 10 }}
                   transition={{ duration: 0.5 + i * 0.1, repeat: Infinity, ease: "easeInOut" }}
                   className="flex-1 bg-cyan-500/20 rounded-t-sm"
                 />
               ))}
             </div>
          </section>
        </div>

        {/* Center: The Game */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          <div className="flex-1 min-h-[400px] lg:min-h-[600px] relative">
            <SnakeGame 
              onScoreChange={handleScoreChange} 
              isPaused={!isMusicPlaying}
            />
          </div>
        </div>

        {/* Right Side: Music & Controls */}
        <div className="flex flex-col gap-6">
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:h-full flex flex-col"
          >
            <MusicPlayer onPlayStateChange={setIsMusicPlaying} />
            
            <div className="mt-6 glass-surface p-6 rounded-2xl grow hidden lg:block">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-6 border-b border-white/10 pb-4">Operator Commands</h4>
              <nav className="space-y-4">
                <div className="flex items-center gap-3 text-zinc-400 group">
                  <span className="w-8 h-8 rounded border border-white/10 flex items-center justify-center font-mono text-[10px] group-hover:border-cyan-500 transition-colors">↑</span>
                  <span className="text-[11px] uppercase tracking-wider">Thrust Forward</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400 group">
                  <span className="w-8 h-8 rounded border border-white/10 flex items-center justify-center font-mono text-[10px] group-hover:border-cyan-500 transition-colors">↓</span>
                  <span className="text-[11px] uppercase tracking-wider">Reverse Vect</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400 group">
                  <span className="w-8 h-8 rounded border border-white/10 flex items-center justify-center font-mono text-[10px] group-hover:border-cyan-500 transition-colors">SPACE</span>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-cyan-500/80">Activate Pulse</span>
                </div>
              </nav>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Persistent Status Bar */}
      <footer className="fixed bottom-0 left-0 w-full glass-surface border-t-0 p-3 px-8 flex justify-between items-center z-50 pointer-events-none lg:pointer-events-auto" id="app-footer">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isMusicPlaying ? "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,1)]" : "bg-red-500"}`} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              MOD_01: {isMusicPlaying ? "SYNESTHESIA_ACTIVE" : "ENGINE_STANDBY"}
            </span>
          </div>
          <div className="hidden md:block w-px h-4 bg-white/10" />
          <span className="hidden md:block text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            LOC // {Math.floor(Math.random() * 1000)}:883:02
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Music size={14} className={isMusicPlaying ? "text-cyan-500 animate-pulse" : "text-zinc-600"} />
          <span className={`text-[10px] font-mono uppercase tracking-widest ${isMusicPlaying ? "text-zinc-300" : "text-zinc-600"}`}>
            {isMusicPlaying ? "// Audio Sync Validated" : "Awaiting Frequency"}
          </span>
        </div>
      </footer>
    </div>
  );
}
