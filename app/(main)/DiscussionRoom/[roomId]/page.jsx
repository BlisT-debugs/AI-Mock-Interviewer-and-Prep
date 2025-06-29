"use client";
import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import { Experts } from '@/services/Options';
import { useQuery } from 'convex/react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AI_Model } from '@/services/Services';
import { 
  checkMicrophonePermission, 
  createSpeechRecognition, 
  mapRecognitionError 
} from '@/services/speechUtils';

function DiscussionRoom() {
  const { roomId } = useParams();
  const RoomData = useQuery(api.DiscussionRoom.GetRoom, { id: roomId });
  const [expert, setExpert] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [recognitionError, setRecognitionError] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(null);
  const recognitionRef = useRef(null);
  const conversationContainerRef = useRef(null);
  const spacebarPressed = useRef(false);

  // Auto-scroll to bottom when conversation updates
  useEffect(() => {
    if (conversationContainerRef.current) {
      conversationContainerRef.current.scrollTop = conversationContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  // Handle spacebar press/release
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !spacebarPressed.current && !isRecording && !isAiResponding) {
        e.preventDefault();
        spacebarPressed.current = true;
        startRecording();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space' && spacebarPressed.current) {
        e.preventDefault();
        spacebarPressed.current = false;
        stopRecording();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording, isAiResponding]);

  // Set expert when room data loads
  useEffect(() => {
    if (RoomData) {
      const foundExpert = Experts.find(item => item.name === RoomData.Assistant);
      setExpert(foundExpert);
      if (conversation.length === 0 && foundExpert) {
        setConversation([{
          role: 'assistant',
          content: `Hello! I'm ${foundExpert.name}, your ${RoomData.Option} assistant. How can I help you with ${RoomData.Topic} today?`
        }]);
      }
    }
  }, [RoomData]);

  const handleAIResponse = useCallback(async (userMessage) => {
    if (!userMessage.trim() || !RoomData?.Topic || !RoomData?.Option || isAiResponding) return;
    
    setIsAiResponding(true);
    setRateLimitError(null);
    try {
      // Add user message to conversation immediately
      setConversation(prev => [...prev, { role: 'user', content: userMessage }]);
      
      // Add typing indicator
      setConversation(prev => [...prev, { role: 'assistant', content: '...' }]);
      
      const aiResponse = await AI_Model(
        RoomData.Topic, 
        RoomData.Option, 
        userMessage,
        conversation.filter(msg => msg.role !== 'system')
      );
      
      // Replace typing indicator with actual response
      setConversation(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: aiResponse }
      ]);
    } catch (error) {
      // Replace typing indicator with error message
      setConversation(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: "Sorry, I'm having trouble responding." }
      ]);
      
      if (error.message.includes('free usage limit')) {
        setRateLimitError(error.message);
      }
    } finally {
      setIsAiResponding(false);
    }
  }, [RoomData, conversation, isAiResponding]);

  const startRecording = async () => {
    if (isRecording || isAiResponding) return;
    
    setRecognitionError(null);
    setTranscript('');
    
    try {
      const hasPermission = await checkMicrophonePermission();
      if (!hasPermission) {
        throw new Error("Microphone permission required");
      }
      
      const recognition = createSpeechRecognition();
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        handleAIResponse(transcript);
      };
      
      recognition.onerror = (event) => {
        setRecognitionError(mapRecognitionError(event.error));
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
        recognitionRef.current = null;
      };
      
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } catch (error) {
      console.error("Recording error:", error);
      setRecognitionError(error.message);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 h-screen flex flex-col">
      <h2 className="text-2xl font-bold text-center mb-4">{RoomData?.Option}</h2>
      
      {/* Spacebar instructions */}
      <div className="text-center mb-4 text-sm text-gray-600 bg-blue-50 p-2 rounded-lg">
        <p>Press and hold <span className="font-mono bg-gray-100 px-2 py-1 rounded">Spacebar</span> to speak, or click the microphone button below</p>
      </div>

      {rateLimitError && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
          <p className="font-medium">Usage Limit Reached</p>
          <p>{rateLimitError}</p>
          <a 
            href="https://openrouter.ai/account" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Manage your OpenRouter account
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        {/* Left Panel - Expert View */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 flex flex-col">
          <div className="flex flex-col items-center justify-center">
            {expert?.avatar && (
              <div className="relative">
                <Image 
                  src={expert.avatar} 
                  alt={expert.name} 
                  width={160}
                  height={160}
                  className="rounded-full border-4 border-blue-100"
                  priority
                />
                <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full ${
                  isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
                }`}></div>
              </div>
            )}
            
            <div className="mt-4 text-center">
              <h3 className="text-xl font-semibold">{expert?.name}</h3>
              <p className="text-gray-600">{expert?.bio}</p>
              <p className="mt-2 text-blue-600 font-medium">{RoomData?.Topic}</p>
            </div>
            
            <div className="mt-8 w-full max-w-md">
              <div className="flex justify-center">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-32 h-32 rounded-full flex items-center justify-center ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  disabled={isAiResponding || rateLimitError}
                >
                  {isRecording ? (
                    <div className="text-center">
                      <div className="text-white text-lg font-bold">Stop</div>
                      <div className="text-white text-sm">Recording</div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-white text-lg font-bold">Start</div>
                      <div className="text-white text-sm">Speaking</div>
                    </div>
                  )}
                </Button>
              </div>
              
              {recognitionError && (
                <div className="mt-4 text-center">
                  <p className="text-red-500">{recognitionError}</p>
                  <Button 
                    variant="outline"
                    className="mt-2"
                    onClick={startRecording}
                  >
                    Try Again
                  </Button>
                </div>
              )}
              
              <div className="mt-4 text-center">
                {isRecording ? (
                  <div className="flex items-center justify-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                    <span className="text-gray-600">
                      {spacebarPressed.current ? "Release spacebar to send" : "Listening..."}
                    </span>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    {isAiResponding ? "Processing your request..." : "Hold spacebar or click above to speak"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Conversation */}
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col h-full">
          <h3 className="text-xl font-bold mb-4">Conversation</h3>
          
          <div 
            ref={conversationContainerRef}
            className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 mb-4"
          >
            {conversation.length > 0 ? (
              <div className="space-y-3">
                {conversation.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg max-w-[85%] ${
                      msg.role === 'user' 
                        ? 'bg-blue-100 ml-auto border border-blue-200' 
                        : 'bg-gray-100 mr-auto border border-gray-200'
                    }`}
                  >
                    <div className="font-medium text-sm mb-1 text-gray-700">
                      {msg.role === 'user' ? 'You' : expert?.name || 'Assistant'}
                    </div>
                    <p className="whitespace-pre-wrap">
                      {msg.content === '...' ? (
                        <span className="flex space-x-1">
                          <span className="animate-pulse">.</span>
                          <span className="animate-pulse delay-75">.</span>
                          <span className="animate-pulse delay-150">.</span>
                        </span>
                      ) : msg.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 text-center">
                  {isRecording 
                    ? "Speak to start the conversation..." 
                    : "Your conversation will appear here"}
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Current Input</h4>
            <div className="bg-white p-3 rounded border border-blue-200 min-h-[60px] flex items-center">
              {transcript || (
                <p className="text-gray-500 italic">
                  {isRecording ? "Listening..." : "Nothing recorded yet"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiscussionRoom;