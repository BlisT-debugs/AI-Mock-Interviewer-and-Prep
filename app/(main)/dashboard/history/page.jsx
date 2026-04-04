"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import History from '../_components/History';

export default function HistoryPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-6 min-h-screen">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button variant="outline" size="icon" className="rounded-full hover:bg-gray-100">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Interview History</h1>
          <p className="text-sm text-gray-500 mt-1">Review all your past mock interviews and detailed AI feedback.</p>
        </div>
      </div>
      
      {/* The Full History Component */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 p-2 sm:p-6">
        <History />
      </div>
    </div>
  );
}