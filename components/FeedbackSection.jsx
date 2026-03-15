"use client";

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { MessageSquare, Star, TrendingUp, AlertCircle } from 'lucide-react';
import { Progress } from './ui/progress';

const feedbackData = {
  hasAttended: false,
  upcomingInterview: {
    date: 'Feb 26, 2026',
    time: '2:00 PM',
    type: 'Technical Interview',
  },
  stats: {
    averageRating: 4.2,
    totalFeedback: 6,
    improvement: 15,
  },
  recentFeedback: [
    {
      id: 1,
      interviewer: 'Sarah Johnson',
      rating: 4.5,
      date: 'Feb 15, 2026',
      comment: 'Great problem-solving approach. Work on communication.',
      strength: 'Technical Skills',
    },
    {
      id: 2,
      interviewer: 'Mike Chen',
      rating: 4.0,
      date: 'Feb 10, 2026',
      comment: 'Good understanding of concepts. Practice more on system design.',
      strength: 'Analytical Thinking',
    },
  ],
};

export function FeedbackSection() {
  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Feedback & Progress</span>
          <Button variant="ghost" size="sm" className="text-xs">
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upcoming Interview Alert */}
        {!feedbackData.hasAttended && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-400 mb-1">
                  Upcoming Mock Interview
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-500">
                  {feedbackData.upcomingInterview.type} scheduled for{' '}
                  <span className="font-semibold">
                    {feedbackData.upcomingInterview.date} at {feedbackData.upcomingInterview.time}
                  </span>
                </p>
                <Button size="sm" className="mt-3 bg-amber-600 hover:bg-amber-700 text-white">
                  Prepare Now
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-400">{feedbackData.stats.averageRating}</p>
            <p className="text-xs text-blue-700 dark:text-blue-500">Avg Rating</p>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-400">{feedbackData.stats.totalFeedback}</p>
            <p className="text-xs text-purple-700 dark:text-purple-500">Feedbacks</p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-400">{feedbackData.stats.improvement}%</p>
            <p className="text-xs text-green-700 dark:text-green-500">Growth</p>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Feedback</h4>
          {feedbackData.recentFeedback.map((feedback) => (
            <div key={feedback.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{feedback.interviewer}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{feedback.date}</p>
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-gray-700 px-2 py-1 rounded-full">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-semibold dark:text-white">{feedback.rating}</span>
                </div>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">{feedback.comment}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Strength:</span>
                <span className="text-xs bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                  {feedback.strength}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">68%</span>
          </div>
          <Progress value={68} className="h-2" />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Keep going! You're making great progress toward your goals.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}