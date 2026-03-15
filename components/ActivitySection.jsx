"use client";

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Play, Clock, Calendar } from 'lucide-react';
import { Badge } from './ui/badge';

const recentLectures = [
  {
    id: 1,
    title: 'Advanced Data Structures',
    topic: 'Computer Science',
    duration: '45 min',
    date: 'Feb 22, 2026',
    progress: 75,
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=200&fit=crop',
  },
  {
    id: 2,
    title: 'System Design Fundamentals',
    topic: 'Engineering',
    duration: '60 min',
    date: 'Feb 20, 2026',
    progress: 100,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
  },
  {
    id: 3,
    title: 'Behavioral Interview Tips',
    topic: 'Soft Skills',
    duration: '30 min',
    date: 'Feb 18, 2026',
    progress: 50,
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop',
  },
];

export function ActivitySection() {
  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Previous Lectures</span>
          <Button variant="ghost" size="sm" className="text-xs">
            See All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentLectures.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Play className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">You don't have any previous lectures</p>
            <Button variant="outline" size="sm" className="mt-4">
              Browse Lectures
            </Button>
          </div>
        ) : (
          recentLectures.map((lecture) => (
            <div
              key={lecture.id}
              className="group flex gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-800">
                <img
                  src={lecture.thumbnail}
                  alt={lecture.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {lecture.title}
                  </h4>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {lecture.topic}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {lecture.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {lecture.date}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${lecture.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}