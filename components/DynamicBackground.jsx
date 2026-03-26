import React from 'react';

// A perfectly looping SVG sine wave
const Wave = ({ className, d }) => (
  <svg className={className} viewBox="0 0 1000 120" preserveAspectRatio="none" fill="currentColor">
    <path d={d} />
  </svg>
);

export default function DynamicBackground() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none -z-50 bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      
      {/* Back Wave (Slowest, Tallest) */}
      <div className="absolute bottom-0 left-0 flex w-[200%] h-[60vh] animate-wave-slow text-blue-200/50 dark:text-indigo-900/20">
        <Wave className="w-1/2 h-full" d="M0,50 Q250,0 500,50 T1000,50 L1000,120 L0,120 Z" />
        <Wave className="w-1/2 h-full" d="M0,50 Q250,0 500,50 T1000,50 L1000,120 L0,120 Z" />
      </div>

      {/* Middle Wave */}
      <div className="absolute bottom-0 left-0 flex w-[200%] h-[45vh] animate-wave-med text-blue-300/40 dark:text-blue-900/30">
        <Wave className="w-1/2 h-full" d="M0,60 Q250,10 500,60 T1000,60 L1000,120 L0,120 Z" />
        <Wave className="w-1/2 h-full" d="M0,60 Q250,10 500,60 T1000,60 L1000,120 L0,120 Z" />
      </div>

      {/* Front Wave (Fastest, Shortest) */}
      <div className="absolute bottom-0 left-0 flex w-[200%] h-[30vh] animate-wave-fast text-blue-400/30 dark:text-sky-800/40">
        <Wave className="w-1/2 h-full" d="M0,70 Q250,20 500,70 T1000,70 L1000,120 L0,120 Z" />
        <Wave className="w-1/2 h-full" d="M0,70 Q250,20 500,70 T1000,70 L1000,120 L0,120 Z" />
      </div>

    </div>
  );
}