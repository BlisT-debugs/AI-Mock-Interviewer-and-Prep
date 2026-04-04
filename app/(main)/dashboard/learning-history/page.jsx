"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Play, Clock, Calendar, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';

export default function LearningHistoryPage() {
  const user = useUser();
  const rooms = useQuery(api.DiscussionRoom.GetUserRooms, user ? { userId: user.id } : "skip");
  const router = useRouter();

  if (rooms === undefined) {
    return <div className="p-10 text-center text-gray-500 animate-pulse">Loading your learning history...</div>;
  }

  // Filter out Mock Interviews to ONLY show lectures and topics
  const learningRooms = rooms
    .filter((room) => room.Option !== "Mock Interviews")
    .sort((a, b) => b._creationTime - a._creationTime);

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-6 min-h-screen">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button variant="outline" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Learning History</h1>
          <p className="text-sm text-gray-500 mt-1">Review all your past topic discussions, lectures, and AI study guides.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-8">
        {learningRooms.length === 0 ? (
            <div className="text-center py-20">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">No learning sessions yet</p>
                <p className="text-gray-500">Start a Topic Discussion or Lecture to build your history.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {learningRooms.map((room) => {
                    const formattedDate = new Date(room._creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    const msgCount = room.conversation?.length || 0;
                    const progress = room.completed ? 100 : Math.min(Math.max((msgCount / 10) * 100, 10), 90);
                    const estimatedMins = Math.max(5, Math.round(msgCount * 1.5));

                    return (
                        <div 
                            key={room._id}
                            onClick={() => router.push(`/DiscussionRoom/${room._id}`)}
                            className="group flex flex-col sm:flex-row gap-4 p-4 rounded-xl hover:bg-blue-50/50 dark:hover:bg-gray-800/50 transition-all cursor-pointer border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-gray-700 shadow-sm"
                        >
                            {/* Left Icon Area */}
                            <div className="relative w-full sm:w-32 h-24 sm:h-auto rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 flex items-center justify-center border border-blue-200/50 dark:border-blue-800/50">
                              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play className="h-8 w-8 text-blue-700 dark:text-blue-300 fill-current" />
                              </div>
                            </div>
                            
                            {/* Right Details Area */}
                            <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                              <div>
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <h4 className="font-semibold text-base text-gray-900 dark:text-white truncate pr-2">
                                      {room.Topic || 'General Discussion'}
                                    </h4>
                                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 shrink-0">
                                      {room.Option}
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5" />
                                      ~{estimatedMins} min
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3.5 w-3.5" />
                                      {formattedDate}
                                    </span>
                                  </div>
                              </div>

                              <div>
                                  {/* Progress bar */}
                                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden mb-3">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${room.completed ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                                      style={{ width: `${progress}%` }}
                                    ></div>
                                  </div>
                                  
                                  {/* Study Guide Button */}
                                  {room.studyGuide && (
                                      <div 
                                        className="inline-block"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation(); // Stops the router from redirecting!
                                        }}
                                      >
                                          <StudyGuideModal guide={room.studyGuide} />
                                      </div>
                                  )}
                              </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// The Study Guide Modal (Included here so the page is self-contained)
// -------------------------------------------------------------
function StudyGuideModal({ guide }) {
  if (!guide) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
            variant="outline" 
            size="sm" 
            className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
        >
          View Notes
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-0">
        <DialogHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-500" />
            Study Guide: <span className="text-blue-600">{guide.topic}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-8">
          <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-100 dark:border-blue-900">
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-2">Lesson Summary</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{guide.summary}</p>
          </div>

          {guide.keyConcepts && guide.keyConcepts.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    Key Concepts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {guide.keyConcepts.map((concept, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                            <span className="font-bold text-blue-700 dark:text-blue-400 block mb-1">{concept.term}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">{concept.definition}</span>
                        </div>
                    ))}
                </div>
              </div>
          )}

          {guide.quiz && guide.quiz.length > 0 && (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    Knowledge Check
                </h3>
                <div className="space-y-4">
                    {guide.quiz.map((q, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <p className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Q: {q.question}</p>
                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-100 dark:border-green-900/30">
                                <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider block mb-1">Answer</span>
                                <p className="text-sm text-green-900 dark:text-green-100">{q.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}