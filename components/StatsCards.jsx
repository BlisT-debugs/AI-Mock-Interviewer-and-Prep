"use client";

import { TrendingUp, Clock, Award, Target } from 'lucide-react';

const stats = [
  {
    label: 'Lectures Completed',
    value: '24',
    change: '+12%',
    icon: Award,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    label: 'Study Hours',
    value: '48h',
    change: '+8%',
    icon: Clock,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    label: 'Mock Interviews',
    value: '8',
    change: '+3',
    icon: Target,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
  {
    label: 'Success Rate',
    value: '87%',
    change: '+5%',
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-1 font-medium">
                  {stat.change} from last week
                </p>
              </div>
              <div className={`${stat.bgColor} dark:bg-opacity-20 ${stat.color} p-3 rounded-lg`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}