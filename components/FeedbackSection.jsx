"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Star, TrendingUp, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@stackframe/stack';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Feedback() {
  const user = useUser();
  const rooms = useQuery(api.DiscussionRoom.GetUserRooms, user ? { userId: user.id } : "skip");

  if (rooms === undefined) {
    return (
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-900 animate-pulse h-[500px]">
        <CardContent className="h-full flex items-center justify-center">
          <p className="text-gray-500 font-medium">Syncing performance data...</p>
        </CardContent>
      </Card>
    );
  }

  const mockInterviews = rooms.filter(
    (room) => room.Option === "Mock Interviews" && room.feedbackReport
  );

  const hasAttended = mockInterviews.length > 0;
  const totalFeedback = mockInterviews.length;

  const averageScore = totalFeedback > 0 
    ? Math.round(mockInterviews.reduce((acc, curr) => acc + curr.feedbackReport.overallScore, 0) / totalFeedback)
    : 0;
  const averageRating = totalFeedback > 0 ? (averageScore / 20).toFixed(1) : "0.0";

  let improvement = 0;
  if (totalFeedback > 1) {
    const latestScore = mockInterviews[0].feedbackReport.overallScore;
    const previousScore = mockInterviews[1].feedbackReport.overallScore;
    improvement = latestScore - previousScore;
  }

  // NEW: Prepare Data for the Chart (Reverse it so oldest is on the left, newest on the right)
  const chartData = mockInterviews.slice(0, 5).reverse().map((room, index) => {
    const date = new Date(room._creationTime);
    return {
        name: `Session ${index + 1}`,
        date: `${date.getMonth()+1}/${date.getDate()}`,
        Overall: room.feedbackReport.overallScore,
        // Fallback to overallScore for old data that doesn't have the new metrics yet
        Technical: room.feedbackReport.technicalScore || room.feedbackReport.overallScore, 
    };
  });

  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-gray-900 h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <span>Feedback & Progress</span>
          {hasAttended && (
             <Link href="/dashboard/history">
                <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-800 transition-colors">
                    View All →
                </Button>
             </Link>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 min-h-0 flex flex-col">
        
        {/* Empty State Alert */}
        {!hasAttended && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4 flex-shrink-0">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-400 mb-1">
                  Ready for your first baseline score?
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-500">
                  You haven't completed any graded mock interviews yet. Head to the Mock Interviews tab and finish a session to track your progress!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 flex-shrink-0">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg shadow-inner">
            <div className="flex items-center justify-center mb-2"><Star className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-400">{averageRating}</p>
            <p className="text-xs text-blue-700 dark:text-blue-500">Avg Rating</p>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg shadow-inner">
            <div className="flex items-center justify-center mb-2"><MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" /></div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-400">{totalFeedback}</p>
            <p className="text-xs text-purple-700 dark:text-purple-500">Feedbacks</p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg shadow-inner">
            <div className="flex items-center justify-center mb-2"><TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" /></div>
            <p className={`text-2xl font-bold ${improvement >= 0 ? 'text-green-900 dark:text-green-400' : 'text-red-900 dark:text-red-400'}`}>
              {improvement > 0 ? `+${improvement}` : improvement}%
            </p>
            <p className="text-xs text-green-700 dark:text-green-500">Growth</p>
          </div>
        </div>

        {/* NEW: The Performance Trend Chart */}
        {hasAttended && totalFeedback > 1 && (
          <div className="h-40 w-full bg-gray-50 dark:bg-gray-800/30 rounded-xl p-3 border border-gray-100 dark:border-gray-800 flex-shrink-0">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{fontSize: 10, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 10, fill: '#6b7280'}} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}
                  />
                  <Line type="monotone" dataKey="Overall" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Technical" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
             </ResponsiveContainer>
          </div>
        )}

        {/* THE LIST: Recent Feedback */}
        <div className="space-y-3 flex-1 overflow-y-auto pr-2 min-h-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white sticky top-0 bg-white dark:bg-gray-900 pt-1 pb-2 z-10">Recent Feedback</h4>
          
          {!hasAttended ? (
            <div className="h-full flex items-center justify-center text-center p-6 border border-dashed rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                <p className="text-sm text-gray-500 italic">No recent feedback available.</p>
            </div>
          ) : (
            mockInterviews.slice(0, 3).map((room) => {
              const report = room.feedbackReport;
              const formattedDate = new Date(room._creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const starRating = (report.overallScore / 20).toFixed(1);

              return (
                <div key={room._id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[180px]">
                        {room.role || room.Topic || 'Mock Interview'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Interviewer: {room.Assistant} • {formattedDate}</p>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-white dark:bg-gray-700 px-2 py-1 rounded-full shadow-sm border border-gray-100 dark:border-gray-600">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-semibold dark:text-white">{starRating}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 line-clamp-2 italic">
                    "{report.generalFeedback.split('.')[0]}."
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Strength:</span>
                        <Badge variant="outline" className="text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0 border-blue-200 dark:border-blue-800 truncate max-w-[120px]">
                            {report.strengths?.[0] || 'Communication'}
                        </Badge>
                    </div>
                     <FeedbackModal report={report} role={room.role || room.Topic} />
                  </div>
                </div>
              );
            })
          )}
        </div>

      </CardContent>
    </Card>
  );
}

// -------------------------------------------------------------
// The Detailed Analysis Modal (Upgraded with Advanced Metrics)
// -------------------------------------------------------------
function FeedbackModal({ report, role }) {
  if (!report) return null;

  const scoreColor = report.overallScore >= 80 ? "text-green-600" : report.overallScore >= 60 ? "text-yellow-600" : "text-red-600";
  const progressColor = report.overallScore >= 80 ? "bg-green-600" : report.overallScore >= 60 ? "bg-yellow-500" : "bg-red-500";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="text-xs p-0 h-auto text-blue-600 font-semibold hover:text-blue-800">
          Details →
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-0">
        <DialogHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-white">
            Performance Analysis: <span className="text-blue-600">{role || "Mock Interview"}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-8">
          
          {/* Top Section: Advanced Metrics Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="col-span-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-6 flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700 shadow-inner">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Overall Score</span>
              <div className={`text-5xl font-black ${scoreColor} mb-4`}>
                {report.overallScore}<span className="text-2xl text-gray-400">/100</span>
              </div>
              <Progress value={report.overallScore} className="h-2 w-full bg-gray-200 dark:bg-gray-700" indicatorClassName={progressColor} />
            </div>
            
            {/* The 3 New Metric Bars */}
            <div className="col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase">Technical</span>
                        <span className="text-sm font-bold text-blue-900 dark:text-blue-300">{report.technicalScore || report.overallScore}%</span>
                    </div>
                    <Progress value={report.technicalScore || report.overallScore} className="h-2 bg-blue-100 dark:bg-blue-950" indicatorClassName="bg-blue-600" />
                </div>
                
                <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-100 dark:border-purple-900 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase">Communication</span>
                        <span className="text-sm font-bold text-purple-900 dark:text-purple-300">{report.communicationScore || report.overallScore}%</span>
                    </div>
                    <Progress value={report.communicationScore || report.overallScore} className="h-2 bg-purple-100 dark:bg-purple-950" indicatorClassName="bg-purple-600" />
                </div>

                <div className="bg-orange-50/50 dark:bg-orange-900/10 rounded-xl p-4 border border-orange-100 dark:border-orange-900 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase">Confidence</span>
                        <span className="text-sm font-bold text-orange-900 dark:text-orange-300">{report.confidenceScore || report.overallScore}%</span>
                    </div>
                    <Progress value={report.confidenceScore || report.overallScore} className="h-2 bg-orange-100 dark:bg-orange-950" indicatorClassName="bg-orange-500" />
                </div>
            </div>
          </div>

          <div className="bg-blue-50/30 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-50 dark:border-blue-900">
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-2">Executive Summary</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
              {report.generalFeedback}
            </p>
          </div>

          {/* Middle Section: Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-6 border border-green-100 dark:border-green-900">
              <h3 className="flex items-center text-lg font-bold text-green-800 dark:text-green-400 mb-4">
                Key Strengths
              </h3>
              <ul className="space-y-3">
                {report.strengths?.map((strength, i) => (
                  <li key={i} className="flex items-start text-green-700 dark:text-green-300">
                    <span className="mr-2 font-bold">•</span> <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-red-50/50 dark:bg-red-900/10 rounded-xl p-6 border border-red-100 dark:border-red-900">
              <h3 className="flex items-center text-lg font-bold text-red-800 dark:text-red-400 mb-4">
                Areas for Improvement
              </h3>
              <ul className="space-y-3">
                {report.weaknesses?.map((weakness, i) => (
                  <li key={i} className="flex items-start text-red-700 dark:text-red-300">
                    <span className="mr-2 font-bold">•</span> <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Section: Question Breakdown */}
          {report.questionAnalysis && report.questionAnalysis.length > 0 && (
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Detailed Q&A Analysis</h3>
              
              <Accordion type="single" collapsible className="w-full space-y-3">
                {report.questionAnalysis.map((qa, i) => (
                  <AccordionItem value={`item-${i}`} key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 shadow-sm">
                    <AccordionTrigger className="hover:no-underline py-4 px-2">
                      <div className="flex items-center text-left w-full pr-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mr-4 ${
                          qa.rating >= 8 ? 'bg-green-500' : qa.rating >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}>
                          {qa.rating}
                        </div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          Q: {qa.question}
                        </p>
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="space-y-5 mt-4">
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Answer</span>
                          <p className="mt-1 text-gray-700 dark:text-gray-300 italic bg-gray-50 dark:bg-gray-900 p-3 rounded-md border border-gray-100 dark:border-gray-800">"{qa.userAnswer}"</p>
                        </div>
                        
                        <div>
                          <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Interviewer Feedback</span>
                          <p className="mt-1 text-gray-800 dark:text-gray-200 font-medium">{qa.feedback}</p>
                        </div>
                        
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-100 dark:border-green-900/30">
                          <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider block mb-1">
                            The Ideal Answer
                          </span>
                          <p className="text-green-900 dark:text-green-100">{qa.idealAnswer}</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}