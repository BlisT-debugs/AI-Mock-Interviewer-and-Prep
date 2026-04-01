import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@stackframe/stack';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function History() {
  const user = useUser();
  const rooms = useQuery(api.DiscussionRoom.GetUserRooms, user ? { userId: user.id } : "skip");

  if (!rooms) return <div className="text-gray-500 animate-pulse p-4">Loading history...</div>;
  if (rooms.length === 0) return <div className="text-gray-500 p-4">No past sessions found.</div>;

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      {rooms.map((room) => (
        <div key={room._id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Badge variant={room.Option === "Mock Interviews" ? "default" : "secondary"}>
                  {room.Option}
                </Badge>
                {room.completed && <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Completed</Badge>}
              </div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                {room.Option === "Mock Interviews" ? room.role || "Mock Interview" : room.Topic}
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                Interviewer: {room.Assistant} • {new Date(room._creationTime).toLocaleDateString()}
              </p>
            </div>
            
            {/* Show Feedback Button ONLY if Report Exists */}
            {room.feedbackReport && (
              <FeedbackModal report={room.feedbackReport} role={room.role} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Sub-component to display the detailed feedback in a modal
function FeedbackModal({ report, role }) {
  if (!report) return null;

  const scoreColor = report.overallScore >= 80 ? "text-green-600" : report.overallScore >= 60 ? "text-yellow-600" : "text-red-600";
  const progressColor = report.overallScore >= 80 ? "bg-green-600" : report.overallScore >= 60 ? "bg-yellow-500" : "bg-red-500";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-all">
          View Analysis
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-0">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Performance Analysis: <span className="text-blue-600">{role || "Mock Interview"}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-8">
          
          {/* Top Section: Score & General Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-6 flex flex-col items-center justify-center border border-gray-100 shadow-inner">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Overall Score</span>
              <div className={`text-6xl font-black ${scoreColor} mb-4`}>
                {report.overallScore}<span className="text-3xl text-gray-400">/100</span>
              </div>
              <Progress value={report.overallScore} className="h-2 w-full" indicatorClassName={progressColor} />
            </div>
            
            <div className="col-span-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-3">Executive Summary</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                {report.generalFeedback}
              </p>
            </div>
          </div>

          {/* Middle Section: Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-6 border border-green-100">
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
            
            <div className="bg-red-50/50 dark:bg-red-900/10 rounded-xl p-6 border border-red-100">
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
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Detailed Q&A Analysis</h3>
              
              <Accordion type="single" collapsible className="w-full space-y-3">
                {report.questionAnalysis.map((qa, i) => (
                  <AccordionItem value={`item-${i}`} key={i} className="bg-white dark:bg-gray-800 border border-gray-200 rounded-lg px-2 shadow-sm">
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
                    
                    <AccordionContent className="px-4 pb-4 pt-2 border-t border-gray-100">
                      <div className="space-y-5">
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Answer</span>
                          <p className="mt-1 text-gray-700 italic bg-gray-50 p-3 rounded-md border border-gray-100">"{qa.userAnswer}"</p>
                        </div>
                        
                        <div>
                          <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Interviewer Feedback</span>
                          <p className="mt-1 text-gray-800 font-medium">{qa.feedback}</p>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-md border border-green-100">
                          <span className="text-xs font-bold text-green-600 uppercase tracking-wider block mb-1">
                            The Ideal Answer
                          </span>
                          <p className="text-green-900">{qa.idealAnswer}</p>
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