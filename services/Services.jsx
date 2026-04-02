import options from './Options';
import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client 
const ai = new GoogleGenAI({ 
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY 
});

export const AI_Model = async (RoomData, msg, conversationHistory = []) => {
  try {
    const { Topic, Option, Assistant, resumeText, jdText, role, industry } = RoomData;
    
    const selected = options.find((opt) => opt.name === Option);
    if (!selected) throw new Error(`Option "${Option}" not found`);

    let prompt = "";

    // --- MOCK INTERVIEW MODE (Context Aware) ---
    if (Option === "Mock Interviews" && resumeText) {
      prompt = `
      You are ${Assistant}, a Senior Technical Recruiter and Hiring Manager.
      You are currently conducting a professional mock interview with a candidate.

      Here is the candidate's actual Resume:
      """
      ${resumeText.substring(0, 3000)} // Truncate to save tokens if it's huge
      """

      Here is the Job Description / Role they are applying for:
      """
      ${jdText ? jdText.substring(0, 2000) : `Role: ${role}, Industry: ${industry}`}
      """

      YOUR INSTRUCTIONS:
      1. Act exactly like a real interviewer. Be professional, slightly challenging, but encouraging.
      2. Ask ONE question at a time. DO NOT give a list of questions. Wait for the user to answer.
      3. Base your questions directly on the skills and experiences listed in their resume AND how they apply to the Job Description.
      4. If they give a weak answer, ask a follow-up probing question to dig deeper.
      5. Keep your responses conversational and under 100 words so it feels like a real chat.
      6. Do not break character. Do not say "I am an AI".
      `;
    } 
    // --- STANDARD TOPIC MODE ---
    else {
      prompt = `
        You are ${Assistant}, a ${Option} assistant specializing in ${Topic}. 
        Your role is to strictly discuss ${Topic} and related concepts.
        You should answer the user's questions based on the provided context and conversation history and like a professional teacher.
        If asked about unrelated topics, politely decline and guide back to ${Topic}.
        
        Current conversation rules:
        - Stay focused on ${Topic}
        - If user asks unrelated questions, respond: "I specialize in ${Topic}. Let's focus on that."
        - Keep responses concise (under 100 words)
        
        ${selected.prompt.replace('{user_topic}', Topic)}
      `;
    }

    const formattedHistory = conversationHistory.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    // Keep the last 10 messages for context (increased for better interview flow)
    const recentHistory = formattedHistory.slice(-10);

    const fullConversation = [
        { role: "user", parts: [{ text: "System Instructions: " + prompt }] },
        { role: "model", parts: [{ text: "Understood. I am ready." }] },
        ...recentHistory,
        { role: "user", parts: [{ text: msg }] } 
    ];

    const startTime = Date.now();

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullConversation,
        config: {
            temperature: 0.5 // Slightly higher for more creative interview questions
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
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        throw new Error('Gemini API key is missing.');
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

// Add this to services/Services.jsx

// Add this at the bottom of services/Services.jsx

export const GenerateInterviewFeedback = async (conversationHistory, role) => {
  try {
    const transcriptText = conversationHistory
      .filter(msg => msg.role !== 'system' && msg.content !== '...')
      .map(msg => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`)
      .join('\n\n');

    if (!transcriptText.trim()) return null;

    const prompt = `
      You are an expert Technical Hiring Manager.
      Review the following transcript of a mock interview for a ${role || 'candidate'}.
      
      Format your response strictly as a JSON object with this exact structure:
      {
        "overallScore": 85,
        "generalFeedback": "A short paragraph summarizing their performance.",
        "strengths": ["Strong understanding of React", "Good communication"],
        "weaknesses": ["Hesitated on system design"],
        "questionAnalysis": [
          {
            "question": "The interviewer's question",
            "userAnswer": "The candidate's answer",
            "rating": 7,
            "feedback": "Specific feedback on this answer",
            "idealAnswer": "What a perfect answer would have been"
          }
        ]
      }
      
      TRANSCRIPT:
      ${transcriptText}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { 
            temperature: 0.1, // Lower temp for strict JSON
            responseMimeType: "application/json" 
        }
    });

    let resultText = response.text;
    console.log("Raw Gemini Feedback:", resultText); 
    
    // --- THE FIX: BULLETPROOF SCRUBBER ---
    try {
      // 1. Strip hidden markdown backticks if they exist
      resultText = resultText.replace(/```json\n?|```/g, '');
      
      // 2. Remove illegal Non-Breaking Spaces (this is what caused your crash!)
      resultText = resultText.replace(/\u00A0/g, ' ');

      // 3. Remove illegal trailing commas
      resultText = resultText.replace(/,(?=\s*[\}\]])/g, '');

      const parsedReport = JSON.parse(resultText.trim());
      console.log("✅ JSON Successfully Parsed!"); 
      return parsedReport;
      
    } catch (parseError) {
      console.error("❌ JSON Parsing Failed! The scrubber missed something:", parseError);
      return null;
    }

  } catch (error) {
    console.error('Feedback Generation Error:', error);
    return null;
  }
};