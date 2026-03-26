import React from "react";

import AppHeader from "./_components/AppHeader";
import DynamicBackground from "@/components/DynamicBackground";

export default function MainLayout({ children }) {
  return (
    <div className="relative min-h-screen">
      <DynamicBackground />
      
      <AppHeader />
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
}