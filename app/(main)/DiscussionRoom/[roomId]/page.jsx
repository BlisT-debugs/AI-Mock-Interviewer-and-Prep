"use client";
import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import { Experts } from '@/services/Options';
import { useQuery } from 'convex/react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AI_Model, speakText } from '@/services/Services';
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
  const [isConnected, setIsConnected] = useState(false);
  const recognitionRef = useRef(null);
  const conversationContainerRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Auto-scroll conversation
  useEffect(() => {
    if (conversationContainerRef.current) {
      conversationContainerRef.current.scrollTop = conversationContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  // Set expert and welcome message
  useEffect(() => {
    if (RoomData && !expert) {
      const foundExpert = Experts.find(item => item.name === RoomData.Assistant);
      if (foundExpert) {
        setExpert(foundExpert);
        const welcomeMessage = `Hello! I'm ${foundExpert.name}, your ${RoomData.Option} assistant. How can I help you with ${RoomData.Topic} today?`;
        setConversation([{ role: 'assistant', content: welcomeMessage }]);
        
        if (isConnected) {
          speakResponse(welcomeMessage).catch(err => 
            console.error('Failed to speak welcome:', err)
          );
        }
      }
    }
  }, [RoomData, expert, isConnected]);

  // Speech synthesis
  const speakResponse = useCallback(async (text) => {
    if (!text || isSpeaking || !expert?.voiceId) return;
    
    setIsSpeaking(true);
    try {
      await speakText(text, expert.voiceId);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, [expert?.voiceId, isSpeaking]);

  // Handle AI responses
  const handleAIResponse = useCallback(async (userMessage) => {
    if (!userMessage.trim() || !RoomData?.Topic || !RoomData?.Option || isAiResponding) return;
    
    setIsAiResponding(true);
    setRateLimitError(null);
    try {
      setConversation(prev => [...prev, { role: 'user', content: userMessage }]);
      setConversation(prev => [...prev, { role: 'assistant', content: '...' }]);
      
      const aiResponse = await AI_Model(
        RoomData.Topic, 
        RoomData.Option, 
        userMessage,
        conversation.filter(msg => msg.role !== 'system')
      );
      
      setConversation(prev => [
        ...prev.slice(0, -1),
        { 
          role: 'assistant', 
          content: aiResponse,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      
      await speakResponse(aiResponse);
    } catch (error) {
      console.error('AI Response Error:', error);
      setConversation(prev => [
        ...prev.slice(0, -1),
        { 
          role: 'assistant', 
          content: error.message || "Sorry, I'm having trouble responding.",
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      
      if (error.message.includes('free usage limit')) {
        setRateLimitError(error.message);
      }
    } finally {
      setIsAiResponding(false);
    }
  }, [RoomData, conversation, isAiResponding, speakResponse]);

  // Start/stop continuous listening
  const toggleConnection = async () => {
    if (isConnected) {
      stopRecording();
      setIsConnected(false);
    } else {
      try {
        const hasPermission = await checkMicrophonePermission();
        if (!hasPermission) {
          throw new Error("Microphone permission required");
        }
        
        startRecording();
        setIsConnected(true);
      } catch (error) {
        console.error("Connection error:", error);
        setRecognitionError(error.message);
      }
    }
  };

  // Recording functions with proper message handling
  const startRecording = () => {
    if (isRecording) return;
    
    setRecognitionError(null);
    setTranscript('');
    
    try {
      const recognition = createSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      let currentMessage = '';
      
      recognition.onresult = (event) => {
        clearTimeout(silenceTimerRef.current);
        
        // Reset interim transcript
        let interim = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            // Add to current message if it's a final result
            currentMessage += transcript + ' ';
            setTranscript(currentMessage.trim());
          } else {
            // Show interim results
            interim += transcript;
            setTranscript(currentMessage + interim);
          }
        }
        
        // Set timeout for silence detection (3 seconds)
        silenceTimerRef.current = setTimeout(() => {
          if (currentMessage.trim()) {
            handleAIResponse(currentMessage.trim());
            currentMessage = '';
            setTranscript('');
          }
        }, 3000);
      };
      
      recognition.onerror = (event) => {
        setRecognitionError(mapRecognitionError(event.error));
        stopRecording();
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
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    clearTimeout(silenceTimerRef.current);
    setIsRecording(false);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 h-screen flex flex-col bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">AI Assistant</h1>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
            <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <Button
            onClick={toggleConnection}
            variant={isConnected ? 'destructive' : 'default'}
            className="px-6 py-3 rounded-full shadow-md transition-all hover:scale-105"
          >
            {isConnected ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                Disconnect
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                Connect
              </>
            )}
          </Button>
        </div>
      </div>

      {rateLimitError && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-lg">
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
        {/* Expert Profile Panel */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6 flex flex-col">
          <div className="flex flex-col items-center">
            {expert?.avatar && (
              <div className="relative mb-6 group">
                <Image 
                  src={expert.avatar} 
                  alt={expert.name} 
                  width={180}
                  height={180}
                  className="rounded-full border-4 border-blue-100 shadow-md transition-transform duration-300 group-hover:scale-105"
                  priority
                />
                <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white ${
                  isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
                }`}></div>
              </div>
            )}
            
            <div className="text-center w-full">
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{expert?.name}</h3>
              <p className="text-blue-600 font-medium mb-4">{expert?.bio}</p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-4 transition-all hover:shadow-md">
                <h4 className="font-semibold text-gray-700 mb-2">Current Topic</h4>
                <p className="text-lg font-medium text-blue-700">{RoomData?.Topic}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 transition-all hover:shadow-md">
                <h4 className="font-semibold text-gray-700 mb-2">Assistant Mode</h4>
                <p className="text-gray-800">{RoomData?.Option}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Conversation Panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Conversation</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isRecording ? 'bg-red-500 animate-pulse' : 
                isAiResponding ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              <span className="text-sm text-gray-500">
                {isRecording ? 'Listening...' : 
                 isAiResponding ? 'Thinking...' : 
                 isConnected ? 'Ready' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          <div 
            ref={conversationContainerRef}
            className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 mb-4 space-y-4"
            style={{ maxHeight: 'calc(100vh - 300px)' }}
          >
            {conversation.length > 0 ? (
              conversation.map((msg, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg max-w-[90%] shadow-sm transition-all ${
                    msg.role === 'user' 
                      ? 'bg-blue-100 ml-auto border border-blue-200' 
                      : 'bg-gray-100 mr-auto border border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm text-gray-700">
                      {msg.role === 'user' ? 'You' : expert?.name || 'Assistant'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {msg.timestamp || new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-gray-800">
                    {msg.content === '...' ? (
                      <span className="flex space-x-1">
                        <span className="animate-pulse">.</span>
                        <span className="animate-pulse delay-75">.</span>
                        <span className="animate-pulse delay-150">.</span>
                      </span>
                    ) : msg.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="bg-blue-100 p-5 rounded-full mb-4 transition-all hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-700 mb-2">
                  {isConnected ? 'Ready to Chat' : 'Connect to Start'}
                </h4>
                <p className="text-gray-500 max-w-md">
                  {isConnected 
                    ? "Speak naturally - I'll respond when you pause" 
                    : "Click the Connect button to begin your conversation"}
                </p>
              </div>
            )}
          </div>
          
          {/* Current Input Panel */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 transition-all hover:shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-700">Current Input</h4>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
                }`}></div>
                <span className="text-xs text-gray-500">
                  {isRecording ? 'Active' : 'Waiting'}
                </span>
              </div>
            </div>
            <div className="bg-white p-3 rounded border border-blue-200 min-h-[60px] flex items-center transition-all">
              {transcript ? (
                <p className="text-gray-800 animate-pulse">{transcript}</p>
              ) : (
                <p className="text-gray-500 italic">
                  {isConnected 
                    ? (isRecording ? "Listening..." : "Paused - speak to continue") 
                    : "Microphone disconnected"}
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