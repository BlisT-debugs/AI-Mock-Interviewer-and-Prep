"use client";
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Button } from '@/components/ui/button';

function History() {
  const previousLectures = useQuery(api.DiscussionRoom.GetUserRooms, { userId: "temp-user" }); // Replace with actual user ID when you implement auth

  return (
    <div>
      <h2 className='font-bold font-mono text-xl mb-4'>Your Previous Lectures</h2>
      
      {previousLectures?.length === 0 ? (
        <p className='text-gray-400'>You don't have any previous lectures</p>
      ) : (
        <div className="space-y-4">
          {previousLectures?.map((lecture) => (
            <div key={lecture._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold">{lecture.Topic}</h3>
              <p className="text-sm text-gray-600">{lecture.Option} with {lecture.Assistant}</p>
              <p className="text-xs text-gray-400">
                Last updated: {new Date(lecture.lastUpdated).toLocaleString()}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => router.push(`/discussion/${lecture._id}`)}
              >
                Continue Learning
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;