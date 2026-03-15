"use client";

import { Button } from './ui/button';
import { Sparkles } from 'lucide-react';

export function WelcomeSection({ userName }) {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-xl">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium opacity-90 mb-1">My Space</p>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              {greeting}, {userName}! 👋
            </h1>
            <p className="text-white/90 max-w-2xl">
              Ready to ace your next interview? Continue where you left off or explore new topics.
            </p>
          </div>
          <Button 
            size="lg" 
            className="bg-white text-purple-600 hover:bg-white/90 shadow-lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            View Profile
          </Button>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
      <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
    </div>
  );
}