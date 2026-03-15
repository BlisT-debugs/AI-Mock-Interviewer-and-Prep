"use client";

import React from 'react'
import { WelcomeSection } from '@/components/WelcomeSection';
import { FeatureCards } from '@/components/FeatureCards';
import { StatsCards } from '@/components/StatsCards';
import { ActivitySection } from '@/components/ActivitySection';
import { FeedbackSection } from '@/components/FeedbackSection';
import { useUser } from '@stackframe/stack';    


export function Dashboard() {
  const user = useUser();
  const userName = user?.displayName || "User";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      
      <main className="w-full px-6 lg:px-10 py-8 space-y-8">
        <WelcomeSection userName={userName} />
        
        {/* Stats Overview */}
        <StatsCards />
        
        {/* Main Feature Cards */}
        <FeatureCards />
        
        {/* Activity and Feedback Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivitySection />
          <FeedbackSection />
        </div>
      </main>
    </div>
  );
}

export default Dashboard
