"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Clock, Calendar, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation'; // <-- NEW: Use Router instead of Link
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function ActivitySection() {
  const user = useUser();
  const rooms = useQuery(api.DiscussionRoom.GetUserRooms, user ? { userId: user.id } : "skip");
  const router = useRouter(); // <-- NEW: Initialize router

  // 1. Clean Loading State
  if (rooms === undefined) {
    return (
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-900 animate-pulse h-[500px]">
        <CardContent className="h-full flex items-center justify-center">
          <p className="text-gray-500 font-medium">Loading activity...</p>
        </CardContent>
      </Card>
    );
  }

  // 2. Filter for non-interview rooms (Topic Learning, Lectures, etc.)
  const learningRooms = rooms
    .filter((room) => room.Option !== "Mock Interviews")
    // Sort by newest first
    .sort((a, b) => b._creationTime - a._creationTime);

  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-gray-900 h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <span>Your Learning Sessions</span>
          {learningRooms.length > 0 && (
             <Button 
                onClick={() => router.push('/dashboard/learning-history')} 
                variant="ghost" 
                size="sm" 
                className="text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800"
             >
               View History →
             </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 flex-1 overflow-y-auto pr-2 min-h-0">
        {learningRooms.length === 0 ? (
          
          /* Empty State */
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 mt-4">
            <div className="mx-auto w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <BookOpen className="h-8 w-8 text-blue-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No learning sessions yet</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Start a Topic Discussion or Lecture to see it here.</p>
          </div>
          
        ) : (
          
          /* Dynamic List */
          learningRooms.slice(0, 4).map((room) => {
            const formattedDate = new Date(room._creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            const msgCount = room.conversation?.length || 0;
            const progress = room.completed ? 100 : Math.min(Math.max((msgCount / 10) * 100, 10), 90);
            const estimatedMins = Math.max(5, Math.round(msgCount * 1.5)); 

            return (
              /* THE FIX: We use a div with onClick instead of a <Link> */
              <div 
                key={room._id}
                onClick={() => router.push(`/DiscussionRoom/${room._id}`)}
                className="group flex gap-4 p-3 rounded-lg hover:bg-blue-50/50 dark:hover:bg-gray-800 transition-all cursor-pointer border border-transparent hover:border-blue-100 dark:hover:border-gray-700 mb-2"
              >
                  
                {/* Left Icon Area */}
                <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 flex items-center justify-center border border-blue-200/50 dark:border-blue-800/50">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-6 w-6 text-blue-700 dark:text-blue-300 fill-current" />
                  </div>
                </div>
                
                {/* Right Details Area */}
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {room.Topic || 'General Discussion'}
                    </h4>
                    <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5 flex-shrink-0 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {room.Option}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ~{estimatedMins} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formattedDate}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${room.completed ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  
                  {/* THE FIX: We stop the click from reaching the parent div! */}
                  {room.studyGuide && (
                      <div 
                        className="mt-3 inline-block"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation(); // Stops the router.push!
                        }}
                      >
                          <StudyGuideModal guide={room.studyGuide} />
                      </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

// -------------------------------------------------------------
// The Study Guide Modal
// -------------------------------------------------------------
function StudyGuideModal({ guide }) {
  if (!guide) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
            variant="outline" 
            size="sm" 
            className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
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
          {/* Summary Section */}
          <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-100 dark:border-blue-900">
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-2">Lesson Summary</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{guide.summary}</p>
          </div>

          {/* Key Concepts Dictionary */}
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

          {/* Quick Quiz */}
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