import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@stackframe/stack';
import { Progress } from '@/components/ui/progress';

export default function Feedback() {
  const user = useUser();
  // Fetch all the user's rooms
  const rooms = useQuery(api.DiscussionRoom.GetUserRooms, user ? { userId: user.id } : "skip");

  // Show a loading skeleton while fetching
  if (rooms === undefined) {
    return <div className="animate-pulse bg-gray-100 dark:bg-gray-800 h-48 rounded-2xl"></div>;
  }

  // Find the most recent mock interview that actually has a feedback report saved
  const latestInterview = rooms.find(
    (room) => room.Option === "Mock Interviews" && room.feedbackReport
  );

  // If no feedback exists yet, show the default empty state
  if (!latestInterview) {
    return (
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full justify-center items-center text-center">
        <div className="bg-gray-50 p-4 rounded-full mb-3">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </div>
        <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-1">No Feedback Yet</h2>
        <p className="text-sm text-gray-500">Complete a Mock Interview to see your performance analysis here.</p>
      </div>
    );
  }

  // If we have data, extract it!
  const report = latestInterview.feedbackReport;
  const scoreColor = report.overallScore >= 80 ? "text-green-600" : report.overallScore >= 60 ? "text-yellow-600" : "text-red-600";
  const progressColor = report.overallScore >= 80 ? "bg-green-600" : report.overallScore >= 60 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-all">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-xl text-gray-800 dark:text-gray-100">Latest Performance</h2>
        <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100">
          {new Date(latestInterview._creationTime).toLocaleDateString()}
        </span>
      </div>

      <div className="mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100">
         <div className="flex justify-between items-end mb-2">
           <span className="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Overall Score</span>
           <span className={`text-2xl font-black ${scoreColor} leading-none`}>{report.overallScore}/100</span>
         </div>
         <Progress value={report.overallScore} className="h-2.5 w-full bg-gray-200" indicatorClassName={progressColor} />
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <h3 className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider mb-1 flex items-center">
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            Top Strength
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 bg-green-50/50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 font-medium">
            {report.strengths?.[0] || "Good effort overall."}
          </p>
        </div>
        <div>
          <h3 className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1 flex items-center">
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            Area to Improve
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 bg-red-50/50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 font-medium line-clamp-2">
            {report.weaknesses?.[0] || "Keep practicing your explanations."}
          </p>
        </div>
      </div>
    </div>
  );
}