"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Experts } from "@/services/Options";
import { useQuery, useMutation } from "convex/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { AI_Model, speakText } from "@/services/Services";
import {
  checkMicrophonePermission,
  createSpeechRecognition,
  mapRecognitionError,
} from "@/services/speechUtils";
import { useUser, ClerkProvider } from "@clerk/nextjs";

function DiscussionRoomContent() {
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const { roomId } = useParams();
  const updateConversation = useMutation(api.DiscussionRoom.UpdateConversation);
  const RoomData = useQuery(api.DiscussionRoom.GetRoom, { id: roomId });

  const [expert, setExpert] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [recognitionError, setRecognitionError] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const conversationContainerRef = useRef(null);
  const currentMessageRef = useRef("");

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    clearTimeout(silenceTimerRef.current);
    setIsRecording(false);
  }, []);

  const saveConversation = useCallback(
    async (completed = false) => {
      if (!roomId || conversation.length === 0) return;
      setIsSaving(true);
      try {
        await updateConversation({
          id: roomId,
          conversation,
          completed,
          lastUpdated: Date.now(),
        });
        console.log("Conversation saved");
      } catch (err) {
        console.error("Save error", err);
      } finally {
        setIsSaving(false);
      }
    },
    [roomId, conversation, updateConversation]
  );

  const speakResponse = useCallback(
  async (text) => {
    if (!text || isSpeaking || !expert?.voiceId) return;
    setIsSpeaking(true);
    try {
      const chunks = text.match(/[^.!?]+[.!?]+/g) || [text];

      for (const chunk of chunks) {
        await speakText(chunk, expert.voiceId); // serialize speech
      }
    } catch (e) {
      console.error("speakText error:", e);
    } finally {
      setIsSpeaking(false);
    }
  },
  [expert?.voiceId, isSpeaking]
);


  const handleAIResponse = useCallback(
    async (userMessage) => {
      if (
        !userMessage.trim() ||
        !RoomData?.Topic ||
        !RoomData?.Option ||
        isAiResponding
      )
        return;

      setIsAiResponding(true);
      setRateLimitError(null);

      const userMsgObj = {
        role: "user",
        content: userMessage,
        timestamp: new Date().toLocaleTimeString(),
      };

      const thinkingObj = {
        role: "assistant",
        content: "...",
        timestamp: new Date().toLocaleTimeString(),
      };

      setConversation((prev) => [...prev, userMsgObj, thinkingObj]);

      try {
        const response = await AI_Model(
          RoomData.Topic,
          RoomData.Option,
          userMessage,
          conversation.filter((msg) => msg.role !== "system")
        );

        setConversation((prev) => [
          ...prev.slice(0, -1),
          {
            role: "assistant",
            content: response,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);

        speakResponse(response);
      } catch (err) {
        console.error("AI error", err);
        setConversation((prev) => [
          ...prev.slice(0, -1),
          {
            role: "assistant",
            content: err.message || "I'm having trouble responding.",
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);

        if (err.message?.includes("free usage limit")) {
          setRateLimitError(err.message);
        }
      } finally {
        setIsAiResponding(false);
      }
    },
    [RoomData, conversation, isAiResponding, speakResponse]
  );

  const startRecording = () => {
    if (isRecording) return;
    setRecognitionError(null);
    setTranscript("");

    try {
      const recognition = createSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        clearTimeout(silenceTimerRef.current);

        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const txt = result[0].transcript;

          if (result.isFinal) {
            currentMessageRef.current += txt + " ";
            setTranscript(currentMessageRef.current.trim());
          } else {
            interim += txt;
            setTranscript(currentMessageRef.current + interim);
          }
        }

        silenceTimerRef.current = setTimeout(() => {
          const finalText = currentMessageRef.current.trim();
          if (finalText) {
            handleAIResponse(finalText);
            currentMessageRef.current = "";
            setTranscript("");
          }
        }, 3000); // Trigger after 3 sec silence
      };

      recognition.onerror = (e) => {
        setRecognitionError(mapRecognitionError(e.error));
        stopRecording();
      };

      recognition.onend = () => {
        setIsRecording(false);
        recognitionRef.current = null;
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } catch (err) {
      console.error("Speech error", err);
      setRecognitionError(err.message);
    }
  };

  const toggleConnection = async () => {
    if (isConnected) {
      stopRecording();
      setIsConnected(false);
    } else {
      try {
        const hasPermission = await checkMicrophonePermission();
        if (!hasPermission) throw new Error("Microphone permission denied");
        startRecording();
        setIsConnected(true);
      } catch (err) {
        console.error(err);
        setRecognitionError(err.message);
      }
    }
  };

  const endSession = useCallback(async () => {
    if (window.confirm("End session and save conversation?")) {
      stopRecording();
      setIsConnected(false);
      await saveConversation(true);
      router.push("/dashboard");
    }
  }, [router, saveConversation, stopRecording]);

  useEffect(() => {
    if (RoomData?.conversation) {
      setConversation(RoomData.conversation);
    }
  }, [RoomData?.conversation]);

  useEffect(() => {
    if (RoomData && !expert) {
      const found = Experts.find((e) => e.name === RoomData.Assistant);
      if (found) {
        setExpert(found);
        if (!RoomData.conversation || RoomData.conversation.length === 0) {
          const welcome = `Hello! I'm ${found.name}, your ${RoomData.Option} assistant. How can I help you with ${RoomData.Topic} today?`;
          setConversation([
            {
              role: "assistant",
              content: welcome,
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);
          if (isConnected) {
            speakResponse(welcome);
          }
        }
      }
    }
  }, [RoomData, expert, isConnected, speakResponse]);

  useEffect(() => {
    if (conversationContainerRef.current) {
      conversationContainerRef.current.scrollTop =
        conversationContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 h-screen flex flex-col bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">AI Assistant</h1>
        <div className="flex items-center space-x-4">
          <Button
            onClick={endSession}
            variant="ghost"
            className="px-6 py-3 rounded-full shadow-md border border-gray-300 hover:bg-gray-100 transition-all group"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                End Session
              </>
            )}
          </Button>
          
          <div className={`flex items-center ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
            <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          
          <Button
            onClick={toggleConnection}
            variant={isConnected ? 'destructive' : 'default'}
            className="px-6 py-3 rounded-full shadow-md transition-all hover:scale-105"
            disabled={isAiResponding || isSpeaking}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
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
                      {msg.timestamp}
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

export default function DiscussionRoomPage() {
  return (
    <ClerkProvider>
      <DiscussionRoomContent />
    </ClerkProvider>
  );
}