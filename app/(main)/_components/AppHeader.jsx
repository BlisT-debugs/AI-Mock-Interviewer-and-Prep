"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeSection";
import { Rocket } from 'lucide-react';

// Stack Auth
import { UserButton } from "@stackframe/stack";


export default function AppHeader({ userName }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
      <div className="w-full px-6 lg:px-10">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
              Go Ready
            </span>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-pink-600 rounded-full"></span>
            </Button>

            {/* Stack Auth User Button */}
            <div className="flex items-center pl-3 border-l border-gray-200 dark:border-gray-800">
              <UserButton />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
            
          </div>
        </div>
      </div>
    </header>
  );
}