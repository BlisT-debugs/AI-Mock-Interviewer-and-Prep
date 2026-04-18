"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Experts } from "@/services/Options";
import { useQuery, useMutation } from "convex/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { AI_Model, speakText, GenerateInterviewFeedback, GenerateStudyGuide } from "@/services/Services";
import { useUser } from "@stackframe/stack";


function DiscussionRoomContent() {
  const router = useRouter();
  const user = useUser();
  const { roomId } = useParams();
  const updateConversation = useMutation(api.DiscussionRoom.UpdateConversation);
  const RoomData = useQuery(api.DiscussionRoom.GetRoom, { id: roomId });

  // States
  const [expert, setExpert] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [recognitionError, setRecognitionError] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [shouldBeConnected, setShouldBeConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Refs
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const conversationContainerRef = useRef(null);
  const currentMessageRef = useRef("");

  // Helper Functions
  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      console.error("Microphone permission denied:", err);
      alert("Microphone access is required to use the voice assistant.");
      return false;
    }
  };

  const createSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) throw new Error("Speech Recognition is not supported in this browser.");
    return new SpeechRecognition();
  };

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
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      try {
        const chunks = text.match(/[^.!?]+[.!?]+/g) || [text];
        for (const chunk of chunks) {
          await speakText(chunk, expert.voiceId);
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
      if (!userMessage.trim() || !RoomData?.Topic || !RoomData?.Option || isAiResponding) return;

      setIsAiResponding(true);
      setRateLimitError(null);

      const userMsgObj = { role: "user", content: userMessage, timestamp: new Date().toLocaleTimeString() };
      const thinkingObj = { role: "assistant", content: "...", timestamp: new Date().toLocaleTimeString() };

      setConversation((prev) => [...prev, userMsgObj, thinkingObj]);

      try {
        const response = await AI_Model(
          RoomData, 
          userMessage,
          conversation.filter((msg) => msg.role !== "system")
        );

        setConversation((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: response, timestamp: new Date().toLocaleTimeString() },
        ]);

        speakResponse(response);
      } catch (err) {
        console.error("AI error", err);
        setConversation((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: err.message || "I'm having trouble responding.", timestamp: new Date().toLocaleTimeString() },
        ]);
        if (err.message?.includes("free usage limit")) setRateLimitError(err.message);
      } finally {
        setIsAiResponding(false);
      }
    },
    [RoomData, conversation, isAiResponding, speakResponse]
  );

  const startRecording = useCallback(() => {
    if (recognitionRef.current || isSpeaking) return;
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
            if (recognitionRef.current) recognitionRef.current.stop();
            handleAIResponse(finalText);
            currentMessageRef.current = "";
            setTranscript("");
          }
        }, 2000); 
      };

      recognition.onerror = (e) => {
        if (e.error !== 'no-speech') {
          setShouldBeConnected(false);
          setIsConnected(false);
        }
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
      setShouldBeConnected(false);
      setIsConnected(false);
    }
  }, [isSpeaking, handleAIResponse]);

  useEffect(() => {
    if (shouldBeConnected && !isSpeaking && !isAiResponding && !isRecording) {
      const timer = setTimeout(() => {
        startRecording();
      }, 250); 
      return () => clearTimeout(timer);
    }
  }, [shouldBeConnected, isSpeaking, isAiResponding, isRecording, startRecording]);

  const toggleConnection = async () => {
    if (isConnected) {
      setShouldBeConnected(false);
      setIsConnected(false);
      stopRecording();
    } else {
      try {
        const hasPermission = await checkMicrophonePermission();
        if (!hasPermission) throw new Error("Microphone permission denied");
        
        setShouldBeConnected(true);
        setIsConnected(true);
        startRecording();
      } catch (err) {
        console.error(err);
        setShouldBeConnected(false);
      }
    }
  };

const endSession = useCallback(async () => {
    if (window.confirm("End session and generate your AI summary? This will take a few seconds.")) {
      stopRecording();
      setIsConnected(false);
      setShouldBeConnected(false);
      setIsSaving(true); 

      try {
        let feedbackReport = null;
        let studyGuide = null; // New variable to hold our notes
        
        if (conversation.length >= 2) {
            // If it's a Mock Interview, grade it
            if (RoomData?.Option === "Mock Interviews") {
               feedbackReport = await GenerateInterviewFeedback(conversation, RoomData?.role);
               if (!feedbackReport) alert("ERROR: The AI generated the report, but the JSON formatting was broken.");
            } 
            // If it's anything else (Topic Learning, Lecture), build a Study Guide!
            else {
               studyGuide = await GenerateStudyGuide(conversation, RoomData?.Topic);
               if (!studyGuide) alert("ERROR: Could not generate the study guide. Check the console.");
            }
        }

        // Save everything to the database
        await updateConversation({
          id: roomId,
          conversation,
          completed: true,
          lastUpdated: Date.now(),
          feedbackReport: feedbackReport || undefined,
          studyGuide: studyGuide || undefined // Send the guide to Convex!
        });

        router.push("/dashboard");
      } catch (err) {
        console.error("End session error", err);
        alert("Something went wrong saving your session.");
        setIsSaving(false);
      }
    }
  }, [router, stopRecording, conversation, RoomData, updateConversation, roomId]);

  useEffect(() => {
    if (RoomData?.conversation) setConversation(RoomData.conversation);
  }, [RoomData?.conversation]);

  useEffect(() => {
    if (RoomData && !expert) {
      const found = Experts.find((e) => e.name === RoomData.Assistant);
      if (found) {
        setExpert(found);
        if (!RoomData.conversation || RoomData.conversation.length === 0) {
          const welcome = RoomData.Option === "Mock Interviews" 
            ? `Hello! I'm ${found.name}, your Hiring Manager today. I've reviewed your resume. Let's get started with the interview when you're ready.`
            : `Hello! I'm ${found.name}, your ${RoomData.Option} assistant. How can I help you with ${RoomData.Topic} today?`;
          
          setConversation([{ role: "assistant", content: welcome, timestamp: new Date().toLocaleTimeString() }]);
          if (isConnected) speakResponse(welcome);
        }
      }
    }
  }, [RoomData, expert, isConnected, speakResponse]);

  useEffect(() => {
    if (conversationContainerRef.current) {
      conversationContainerRef.current.scrollTop = conversationContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  if (!user || !RoomData) {
    return <div className="flex justify-center items-center h-screen text-blue-800 font-semibold text-xl">Loading Room...</div>;
  }
  // AUTOSAVE
  useEffect(() => {
    // auto-save if there is actually a conversation happening
    if (conversation.length > 0) {
      const lastMsg = conversation[conversation.length - 1];
      
      // Only trigger the save when the AI FINISHES speaking. 
      // We don't want to save the "..." thinking state.
      if (lastMsg.role === 'assistant' && lastMsg.content !== '...') {
        saveConversation(false); // false = not completed yet!
      }
    }
  }, [conversation, saveConversation]);

  // --- UI LAYOUT LOGIC ---
  const isMockInterview = RoomData.Option === "Mock Interviews";
  const lastAssistantMessage = conversation.filter(msg => msg.role === 'assistant' && msg.content !== '...').pop();
  const currentQuestion = lastAssistantMessage ? lastAssistantMessage.content : "Connecting to interviewer...";

  return (
    <div className="max-w-6xl mx-auto p-4 h-screen flex flex-col bg-transparent">
      
      {/* Universal Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-300">
          {isMockInterview ? "Live Interview" : "AI Assistant"}
        </h1>
        <div className="flex items-center space-x-4">
          <Button
            onClick={endSession}
            variant="ghost"
            className="px-6 py-3 rounded-full shadow-md border bg-white/50 border-gray-300 hover:bg-gray-100 transition-all group"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "End Session"}
          </Button>
          
          <Button
            onClick={toggleConnection}
            className={`px-6 py-3 rounded-full shadow-md transition-all hover:scale-105 ${
              isConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={isAiResponding || isSpeaking}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </Button>
        </div>
      </div>

      {rateLimitError && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-lg">
          <p>{rateLimitError}</p>
        </div>
      )}

      {/* --- CONDITIONAL RENDERING --- */}
      {isMockInterview ? (
        
        /* --------------------------------------------------- */
        /* MOCK INTERVIEW FOCUS MODE                           */
        /* --------------------------------------------------- */
        <div className="flex flex-col items-center justify-center flex-1 space-y-8 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 rounded-3xl shadow-2xl p-8 w-full mx-auto relative overflow-hidden">
          
          {/* Avatar (Pulses green when AI is speaking) */}
          <div className="relative mb-2 group">
            {expert?.avatar && (
              <Image 
                src={expert.avatar} 
                alt={expert.name} 
                width={160}
                height={160}
                className={`rounded-full border-4 shadow-xl transition-all duration-300 ${
                  isSpeaking ? 'border-green-400 shadow-green-200 animate-pulse scale-105' : 'border-blue-100'
                }`}
                priority
              />
            )}
            {/* Small status indicator bubble on the avatar */}
            <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-white transition-colors duration-300 ${
              isSpeaking ? 'bg-green-500' : isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
            }`}></div>
          </div>

          {/* Current AI Question */}
          <div className="text-center w-full max-w-4xl px-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-100 leading-relaxed min-h-[80px]">
              {isAiResponding ? (
                 <span className="flex items-center justify-center space-x-2 text-blue-500">
                   <span>Analyzing</span>
                   <span className="animate-bounce">.</span>
                   <span className="animate-bounce delay-100">.</span>
                   <span className="animate-bounce delay-200">.</span>
                 </span>
              ) : currentQuestion}
            </h2>
          </div>

          {/* Live User Transcript Box */}
          <div className="w-full max-w-3xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-white/40 dark:border-gray-700/40 rounded-2xl p-6 min-h-[140px] shadow-inner flex flex-col relative transition-all duration-300 hover:bg-white/60">
            <div className="flex items-center justify-between mb-3 border-b border-gray-200/50 pb-2">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Your Answer</span>
              <div className="flex items-center space-x-2">
                 {isRecording && <span className="text-xs font-bold text-red-500 uppercase animate-pulse">Recording</span>}
              </div>
            </div>
            
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
              {transcript || (
                <span className="text-gray-400 italic font-normal">
                  {isConnected 
                    ? (isRecording ? "I'm listening..." : "Take your time. Speak when you're ready.") 
                    : "Click 'Connect' to begin your interview."}
                </span>
              )}
            </p>
          </div>
        </div>

      ) : (

        /* --------------------------------------------------- */
        /* STANDARD CHAT MODE (For Lectures/Q&A)               */
        /* --------------------------------------------------- */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
          {/* Expert Profile Panel */}
          <div className="lg:col-span-1 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 rounded-2xl shadow-lg p-6 flex flex-col">
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
                    isSpeaking ? 'bg-green-500' : isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
                  }`}></div>
                </div>
              )}
              
              <div className="text-center w-full">
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{expert?.name}</h3>
                <p className="text-blue-600 font-medium mb-4">{expert?.bio}</p>
                
                <div className="bg-white/50 rounded-lg p-4 mb-4 shadow-sm border border-gray-100">
                  <h4 className="font-semibold text-gray-700 mb-2">Current Topic</h4>
                  <p className="text-lg font-medium text-blue-700">{RoomData?.Topic}</p>
                </div>
                
                <div className="bg-white/50 rounded-lg p-4 shadow-sm border border-gray-100">
                  <h4 className="font-semibold text-gray-700 mb-2">Assistant Mode</h4>
                  <p className="text-gray-800">{RoomData?.Option}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Conversation Panel */}
          <div className="lg:col-span-2 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 rounded-2xl shadow-lg p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Conversation</h3>
            </div>
            
            <div 
              ref={conversationContainerRef}
              className="flex-1 overflow-y-auto bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 rounded-lg p-4 mb-4 space-y-4"
              style={{ maxHeight: 'calc(100vh - 300px)' }}
            >
              {conversation.length > 0 ? (
                conversation.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg max-w-[90%] shadow-sm transition-all ${
                      msg.role === 'user' 
                        ? 'bg-blue-500 text-white ml-auto border border-blue-600' 
                        : 'bg-white text-gray-800 mr-auto border border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-medium text-sm ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {msg.role === 'user' ? 'You' : expert?.name || 'Assistant'}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {msg.content === '...' ? "Thinking..." : msg.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <h4 className="text-lg font-medium text-gray-700 mb-2">
                    {isConnected ? 'Ready to Chat' : 'Connect to Start'}
                  </h4>
                </div>
              )}
            </div>
            
            {/* Current Input Panel */}
            <div className="bg-white/50 p-4 rounded-lg border border-gray-200/50 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-700">Current Input</h4>
              </div>
              <div className="bg-white/80 p-3 rounded border border-gray-200 min-h-[60px] flex items-center">
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
      )}
    </div>
  );
}

export default function DiscussionRoomPage() {
  return <DiscussionRoomContent />;
}