import options from './Options';
import { ElevenLabsService, VOICE_OPTIONS } from './ElevenLabs';
import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client using the new unified SDK
const ai = new GoogleGenAI({ 
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY 
});

export const AI_Model = async (topic, option, msg, conversationHistory = []) => {
  try {
    const selected = options.find((opt) => opt.name === option);
    if (!selected) throw new Error(`Option "${option}" not found`);

    const prompt = `
      You are a ${option} assistant specializing in ${topic}. 
      Your role is to strictly discuss ${topic} and related concepts.
      You should answer the user's questions based on the provided context and conversation history and like a professional teacher.
      If asked about unrelated topics, politely decline and guide back to ${topic}.
      
      Current conversation rules:
      - Stay focused on ${topic}
      - If user asks unrelated questions, respond: "I specialize in ${topic}. Let's focus on that."
      - Never discuss politics, sports, or other off-topic subjects
      - Keep responses concise (under 100 words)
      
      ${selected.prompt.replace('{user_topic}', topic)}
    `;

    // 1. Format the history for Gemini.
    // The new SDK uses 'user' and 'model' for roles.
    const formattedHistory = conversationHistory.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    // 2. We keep a bit more context (last 6 messages) so the AI remembers the flow
    const recentHistory = formattedHistory.slice(-6);

    // 3. Construct the full message array including system instructions
    const fullConversation = [
        { role: "user", parts: [{ text: "System Instructions: " + prompt }] },
        { role: "model", parts: [{ text: "Understood. I will act as the requested assistant." }] },
        ...recentHistory,
        { role: "user", parts: [{ text: msg }] } // Add the current message
    ];

    const startTime = Date.now();

    // 4. Call the Gemini API using the recommended gemini-2.5-flash model
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullConversation,
        config: {
            temperature: 0.3 // Lower temperature keeps it focused on the topic
        }
    });

    const resultText = response.text;

    if (resultText) {
        console.log(`AI (Gemini) responded in ${Date.now() - startTime}ms`);
        return resultText;
    }

    throw new Error('AI response failed to generate text');

  } catch (error) {
    console.error('Gemini API Error:', error);

    // Provide a user-friendly error if the API key is missing
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        throw new Error('Gemini API key is missing. Please configure it in your environment variables.');
    }

    throw new Error('AI is currently unavailable. Please try again later.');
  }
};

const playAudioBuffer = (arrayBuffer) => {
  return new Promise((resolve) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContext.decodeAudioData(arrayBuffer)
      .then(decodedData => {
        const source = audioContext.createBufferSource();
        source.buffer = decodedData;
        source.connect(audioContext.destination);
        source.start(0);
        console.log("Audio Started");
        source.onended = resolve;
      })
      .catch(error => {
        console.error('Audio playback error:', error);
        resolve();
      });
  });
};

export const speakText = async (text, voiceId = null) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_ELEVENAI_API_KEY;
    if (!apiKey) {
      console.error('Missing ElevenLabs API key');
      return;
    }

    if (!text || text.trim().length < 2) {
      console.warn("Empty text, skipping speech.");
      return;
    }

    const defaultVoice = VOICE_OPTIONS[0].id;
    const voiceToUse = voiceId || defaultVoice;

    console.log("speakText() called");
    console.log("Text:", text);
    console.log("Voice ID:", voiceToUse);

    const buffer = await ElevenLabsService.synthesizeSpeech(text, voiceToUse, apiKey);

    console.log("Got buffer of", buffer.byteLength, "bytes");
    await playAudioBuffer(buffer);
  } catch (error) {
    console.error('speakText error:', error);
  }
};