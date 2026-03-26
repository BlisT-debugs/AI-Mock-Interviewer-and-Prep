import React from 'react';

export default function DynamicBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-50 bg-slate-50 dark:bg-slate-950">
      
      {/* Top Left Aurora - Blue */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px] md:blur-[120px] opacity-60 animate-aurora-1 bg-blue-400/40 dark:bg-blue-600/30"></div>
      
      {/* Top Right Aurora - Purple */}
      <div className="absolute top-[10%] right-[-10%] w-[45vw] h-[45vw] rounded-full blur-[100px] md:blur-[120px] opacity-60 animate-aurora-2 bg-purple-400/40 dark:bg-purple-600/30"></div>
      
      {/* Bottom Center Aurora - Indigo */}
      <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full blur-[100px] md:blur-[120px] opacity-60 animate-aurora-3 bg-indigo-400/40 dark:bg-indigo-600/30"></div>
      
      {/* Subtle Noise Overlay for a premium glass look */}
      <div 
        className="absolute inset-0 opacity-[0.25] dark:opacity-[0.15] mix-blend-overlay"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }}
      ></div>
    </div>
  );
}