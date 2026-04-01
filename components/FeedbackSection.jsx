"use client";

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { MessageSquare, Star, TrendingUp, AlertCircle } from 'lucide-react';
import { Progress } from './ui/progress';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@stackframe/stack';

export function FeedbackSection() {
  const user = useUser();
  const rooms = useQuery(api.DiscussionRoom.GetUserRooms, user ? { userId: user.id } : "skip");

  // Show a smooth loading state while fetching from Convex
  if (rooms === undefined) {
    return <Card className="border-0 shadow-sm bg-gray-100 dark:bg-gray-800 animate-pulse h-[500px]"></Card>;
  }

  // Filter for completed mock interviews that successfully generated an AI report
  const mockInterviews = rooms.filter(
    (room) => room.Option === "Mock Interviews" && room.feedbackReport
  );

  const hasAttended = mockInterviews.length > 0;
  const totalFeedback = mockInterviews.length;

  // Calculate Average Score (out of 100) and convert to a 5-Star Rating
  const averageScore = totalFeedback > 0 
    ? Math.round(mockInterviews.reduce((acc, curr) => acc + curr.feedbackReport.overallScore, 0) / totalFeedback)
    : 0;
  const averageRating = totalFeedback > 0 ? (averageScore / 20).toFixed(1) : "0.0";

  // Calculate Improvement (Compare most recent score to the average of previous scores)
  let improvement = 0;
  if (totalFeedback > 1) {
    const latestScore = mockInterviews[0].feedbackReport.overallScore;
    const previousAvg = Math.round(mockInterviews.slice(1).reduce((acc, curr) => acc + curr.feedbackReport.overallScore, 0) / (totalFeedback - 1));
    improvement = latestScore - previousAvg;
  }

  // Map the Convex data to match your UI's expected format (grab the 2 most recent)
  const recentFeedback = mockInterviews.slice(0, 2).map((room, index) => ({
    id: room._id,
    interviewer: room.Assistant,
    rating: (room.feedbackReport.overallScore / 20).toFixed(1),
    date: new Date(room._creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    // Use the first sentence of the general feedback as the comment
    comment: room.feedbackReport.generalFeedback.split('.')[0] + '.',
    strength: room.feedbackReport.strengths?.[0] || 'Communication',
  }));

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
        
        {/* Upcoming Interview Alert (Only shows if they've NEVER done an interview) */}
        {!hasAttended && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-400 mb-1">
                  Ready for your first interview?
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-500">
                  Head over to the Mock Interviews tab to start your first session and generate your baseline scores!
                </p>
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
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-400">{averageRating}</p>
            <p className="text-xs text-blue-700 dark:text-blue-500">Avg Rating</p>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-400">{totalFeedback}</p>
            <p className="text-xs text-purple-700 dark:text-purple-500">Feedbacks</p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-400">
              {improvement > 0 ? `+${improvement}` : improvement}%
            </p>
            <p className="text-xs text-green-700 dark:text-green-500">Growth</p>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Feedback</h4>
          
          {!hasAttended ? (
            <p className="text-sm text-gray-500 italic">Complete an interview to see feedback here.</p>
          ) : (
            recentFeedback.map((feedback) => (
              <div key={feedback.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{feedback.interviewer}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{feedback.date}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-white dark:bg-gray-700 px-2 py-1 rounded-full shadow-sm">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-semibold dark:text-white">{feedback.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">{feedback.comment}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Strength:</span>
                  <span className="text-xs bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full truncate max-w-[150px]">
                    {feedback.strength}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Capability</span>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{averageScore}%</span>
          </div>
          <Progress value={averageScore} className="h-2" />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {averageScore > 80 ? "Excellent! You are highly prepared." : 
             averageScore > 50 ? "Keep going! You're making great progress." : 
             hasAttended ? "Keep practicing to boost your scores." : "Start an interview to track your progress."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}