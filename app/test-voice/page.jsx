"use client";
import React, { useState } from 'react';
import { ElevenLabsService } from '@/services/ElevenLabs';
import { playAudioBuffer } from '@/services/ElevenLabs';

const TestVoice = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testVoiceId = "UgBBYS2sOqTuMpoF3BR0"; // Replace with one of your voice IDs
  const textToSpeak = "Hello, this is your AI voice test from ElevenLabs.";

  const handleTest = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_ELEVENAI_API_KEY;
      const buffer = await ElevenLabsService.synthesizeSpeech(textToSpeak, testVoiceId, apiKey);
      await playAudioBuffer(buffer);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-2xl font-bold mb-4">🔊 ElevenLabs TTS Test</h1>
      <button 
        onClick={handleTest}
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Testing..." : "Play Voice"}
      </button>
      {error && <p className="mt-4 text-red-500">Error: {error}</p>}
    </div>
  );
};

export default TestVoice;
