"use client";

import { BookOpen, Video, HelpCircle, Languages, ArrowRight } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
// Import UserInputDialog - adjust path if necessary depending on your folder structure setup
import UserInputDialog from '@/app/(main)/dashboard/_components/UserInputDialog';

const features = [
  {
    title: 'Topic Wise Lectures',
    description: 'Access structured lectures organized by topics',
    icon: BookOpen,
    color: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badge: '12 New',
  },
  {
    title: 'Mock Interviews',
    description: 'Practice with real interview scenarios',
    icon: Video,
    color: 'from-purple-500 to-pink-500',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    badge: 'Popular',
  },
  {
    title: 'Question Bank',
    description: 'Comprehensive collection of interview questions',
    icon: HelpCircle,
    color: 'from-cyan-500 to-blue-500',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    badge: '500+',
  },
  {
    title: 'Language Proficiency',
    description: 'Improve your communication skills',
    icon: Languages,
    color: 'from-pink-500 to-rose-500',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    badge: 'New',
  },
];

export function FeatureCards() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Access</h2>
        <Button variant="ghost" className="text-sm">
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          
          // Determine if this specific card should trigger the dialog
          const needsDialog = feature.title === 'Topic Wise Lectures' || feature.title === 'Mock Interviews';

          // Define the card visually
          const CardContent = (
            <Card className="group relative overflow-hidden border-0 bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
              <div className="p-6 flex flex-col h-full">
                {/* Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`${feature.iconBg} dark:bg-opacity-20 p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>

                {/* Content */}
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {feature.description}
                </p>

                {/* Arrow (Stats removed as requested) */}
                <div className="flex items-center justify-end mt-auto">
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Gradient overlay on hover */}
              <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`}></div>
            </Card>
          );

          // Conditionally wrap with UserInputDialog based on the title
          return needsDialog ? (
            <UserInputDialog key={feature.title} options={{ name: feature.title }}>
              {CardContent}
            </UserInputDialog>
          ) : (
            <div key={feature.title} className="h-full">
              {CardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}