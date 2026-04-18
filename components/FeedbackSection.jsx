"use client";

import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Star, TrendingUp, AlertCircle, LayoutDashboard, ListChecks, Download, Loader2 } from 'lucide-react';
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

  const chartData = mockInterviews.slice(0, 5).reverse().map((room, index) => {
    const date = new Date(room._creationTime);
    return {
        name: `Session ${index + 1}`,
        date: `${date.getMonth()+1}/${date.getDate()}`,
        Overall: room.feedbackReport.overallScore,
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
// The Detailed Analysis Modal
// -------------------------------------------------------------
function FeedbackModal({ report, role }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef(null);

  if (!report) return null;

  const scoreColor = report.overallScore >= 80 ? "text-green-600" : report.overallScore >= 60 ? "text-yellow-600" : "text-red-600";
  const progressColor = report.overallScore >= 80 ? "bg-green-600" : report.overallScore >= 60 ? "bg-yellow-500" : "bg-red-500";

  // The Modern Print/PDF Hook
  const handlePrint = useReactToPrint({
    contentRef: printRef,            
    documentTitle: `${role?.replace(/\s+/g, '_') || 'Interview'}_Report`,
    onAfterPrint: () => setIsExporting(false),
  });

  const downloadPDF = () => {
    setIsExporting(true); // Trigger both tabs to show
    
    // Give React 300ms to open the hidden tabs, then trigger the print dialog
    setTimeout(() => {
      handlePrint();
    }, 300);
  };

  // If exporting, show both. Otherwise, obey the active tab.
  const showOverview = activeTab === "overview" || isExporting;
  const showQa = activeTab === "qa" || isExporting;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="text-xs p-0 h-auto text-blue-600 font-semibold hover:text-blue-800">
          Details →
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-0 flex flex-col">
        
        {/* Sticky Header with Tabs & Download Button */}
        <div className="px-8 pt-8 pb-0 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          <div className="flex justify-between items-start mb-6">
            <DialogTitle className="text-3xl font-bold text-gray-800 dark:text-white">
              Performance Analysis: <span className="text-blue-600">{role || "Mock Interview"}</span>
            </DialogTitle>

            <Button 
                onClick={downloadPDF} 
                disabled={isExporting}
                className="bg-gray-900 hover:bg-gray-800 text-white shadow-md transition-all"
            >
              {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              {isExporting ? 'Preparing PDF...' : 'Download Report'}
            </Button>
          </div>
          
          <div className="flex gap-8">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`pb-4 px-2 text-base font-bold border-b-4 transition-colors flex items-center gap-2 ${
                activeTab === "overview" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Overview & Metrics
            </button>
            <button 
              onClick={() => setActiveTab("qa")}
              className={`pb-4 px-2 text-base font-bold border-b-4 transition-colors flex items-center gap-2 ${
                activeTab === "qa" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <ListChecks className="w-5 h-5" />
              Detailed Q&A Breakdown
            </button>
          </div>
        </div>

        {/* Scrollable Content Area. Added printRef here! */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50 dark:bg-gray-900/50">
          <div 
            ref={printRef} 
            className="max-w-5xl mx-auto space-y-8 pb-10 bg-gray-50/50 dark:bg-gray-900/50"
            style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }} // Forces backgrounds to print!
          >
              
              {/* TAB 1: OVERVIEW */}
              {showOverview && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  
                  {isExporting && (
                      <h1 className="text-4xl font-black text-gray-900 mb-8 pb-4 border-b-2 border-gray-200">
                          Interview Assessment: <span className="text-blue-600">{role || "Candidate"}</span>
                      </h1>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="col-span-1 lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700 shadow-sm">
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Overall Score</span>
                      <div className={`text-7xl font-black ${scoreColor} mb-6 tracking-tighter`}>
                        {report.overallScore}<span className="text-3xl text-gray-300">/100</span>
                      </div>
                      <Progress value={report.overallScore} className="h-3 w-full bg-gray-100 dark:bg-gray-700" indicatorClassName={progressColor} />
                    </div>
                    
                    <div className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-8 border border-blue-100 dark:border-blue-900/50 flex flex-col justify-center">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-sm font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wide">Technical</span>
                                <span className="text-2xl font-black text-blue-600 dark:text-blue-300">{report.technicalScore || report.overallScore}%</span>
                            </div>
                            <Progress value={report.technicalScore || report.overallScore} className="h-3 bg-blue-100 dark:bg-blue-950" indicatorClassName="bg-blue-500" />
                        </div>
                        
                        <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-2xl p-8 border border-purple-100 dark:border-purple-900/50 flex flex-col justify-center">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-sm font-bold text-purple-800 dark:text-purple-400 uppercase tracking-wide">Communication</span>
                                <span className="text-2xl font-black text-purple-600 dark:text-purple-300">{report.communicationScore || report.overallScore}%</span>
                            </div>
                            <Progress value={report.communicationScore || report.overallScore} className="h-3 bg-purple-100 dark:bg-purple-950" indicatorClassName="bg-purple-500" />
                        </div>

                        <div className="bg-orange-50/50 dark:bg-orange-900/10 rounded-2xl p-8 border border-orange-100 dark:border-orange-900/50 flex flex-col justify-center">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-sm font-bold text-orange-800 dark:text-orange-400 uppercase tracking-wide">Confidence</span>
                                <span className="text-2xl font-black text-orange-600 dark:text-orange-300">{report.confidenceScore || report.overallScore}%</span>
                            </div>
                            <Progress value={report.confidenceScore || report.overallScore} className="h-3 bg-orange-100 dark:bg-orange-950" indicatorClassName="bg-orange-500" />
                        </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <MessageSquare className="w-6 h-6 text-blue-500" />
                      Executive Summary
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                      {report.generalFeedback}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-green-50/50 dark:bg-green-900/10 rounded-2xl p-8 border border-green-200 dark:border-green-900/30 shadow-sm">
                      <h3 className="flex items-center text-xl font-bold text-green-800 dark:text-green-400 mb-6">
                        Top Strengths
                      </h3>
                      <ul className="space-y-4">
                        {report.strengths?.map((strength, i) => (
                          <li key={i} className="flex items-start text-green-900 dark:text-green-300 font-medium text-lg">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2.5 mr-4 shrink-0"></div>
                            <span className="leading-relaxed">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-red-50/50 dark:bg-red-900/10 rounded-2xl p-8 border border-red-200 dark:border-red-900/30 shadow-sm">
                      <h3 className="flex items-center text-xl font-bold text-red-800 dark:text-red-400 mb-6">
                        Areas for Improvement
                      </h3>
                      <ul className="space-y-4">
                        {report.weaknesses?.map((weakness, i) => (
                          <li key={i} className="flex items-start text-red-900 dark:text-red-300 font-medium text-lg">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-2.5 mr-4 shrink-0"></div>
                            <span className="leading-relaxed">{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Q&A ANALYSIS */}
              {showQa && (
                <div className="animate-in fade-in duration-500 pt-8">
                  
                  {isExporting && (
                      <h2 className="text-3xl font-black text-gray-900 mb-6">Detailed Q&A Breakdown</h2>
                  )}

                  {report.questionAnalysis && report.questionAnalysis.length > 0 ? (
                    <div className="w-full space-y-6">
                      {report.questionAnalysis.map((qa, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-6 shadow-sm">
                            <div className="flex items-start text-left w-full mb-6">
                              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-xl mr-5 shadow-inner mt-1 ${
                                qa.rating >= 8 ? 'bg-green-500' : qa.rating >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}>
                                {qa.rating}
                              </div>
                              <p className="font-semibold text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                                Q: {qa.question}
                              </p>
                            </div>
                            
                            <div className="space-y-6 ml-17 pl-4 border-l-2 border-gray-100 dark:border-gray-700">
                              <div>
                                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Your Answer</span>
                                <p className="text-gray-700 dark:text-gray-300 italic bg-gray-50 dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 leading-relaxed text-lg">"{qa.userAnswer}"</p>
                              </div>
                              
                              <div>
                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-2">Interviewer Feedback</span>
                                <p className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed text-lg bg-blue-50/30 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/50">{qa.feedback}</p>
                              </div>
                              
                              <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-xl border border-green-200 dark:border-green-900/40 mt-6">
                                <span className="text-sm font-bold text-green-700 dark:text-green-400 uppercase tracking-wider block mb-2">
                                  The Ideal Answer
                                </span>
                                <p className="text-green-900 dark:text-green-100 leading-relaxed text-lg">{qa.idealAnswer}</p>
                              </div>
                            </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <p className="text-gray-500 text-lg">No specific question analysis found for this session.</p>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}