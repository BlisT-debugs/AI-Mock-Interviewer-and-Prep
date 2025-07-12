import OpenAI from 'openai';
import options from './Options';
import { ElevenLabsService, VOICE_OPTIONS } from './ElevenLabs';

let openaiInstance = null;
const requestQueue = [];
const REQUEST_INTERVAL = 6000;

const createOpenAIClient = (apiKey) => {
  if (!apiKey) throw new Error('API key required');

  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      dangerouslyAllowBrowser: true,
      timeout: 10000,
    });
  }

  return openaiInstance;
};

const queueRequest = (fn) =>
  new Promise((resolve, reject) => {
    const executeRequest = async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    requestQueue.push(executeRequest);

    if (requestQueue.length === 1) {
      processQueue();
    }
  });

const processQueue = async () => {
  if (!requestQueue.length) return;

  await requestQueue[0]();
  requestQueue.shift();

  if (requestQueue.length > 0) {
    setTimeout(processQueue, REQUEST_INTERVAL);
  }
};

export const AI_Model = async (topic, option, msg, conversationHistory = []) => {
  try {
    const selected = options.find((opt) => opt.name === option);
    if (!selected) throw new Error(`Option "${option}" not found`);

    const prompt = `
      You are a ${option} assistant specializing in ${topic}. 
      Your role is to strictly discuss ${topic} and related concepts.
      
      If asked about unrelated topics, politely decline and guide back to ${topic}.
      
      Current conversation rules:
      - Stay focused on ${topic}
      - If user asks unrelated questions, respond: "I specialize in ${topic}. Let's focus on that."
      - Never discuss politics, sports, or other off-topic subjects
      - Keep responses concise (under 100 words)
      
      ${selected.prompt.replace('{user_topic}', topic)}
    `;

    const openai = createOpenAIClient(process.env.NEXT_PUBLIC_API_KEY);

    const messages = [
      { role: 'system', content: prompt },
      ...conversationHistory.slice(-4), // Keep more context
      { role: 'user', content: msg },
    ];

    const fallbackModels = [      
      'deepseek/deepseek-chat:free',
      'openchat/openchat-3.5-0106:free',
      'mistralai/mistral-7b-instruct:free',
      'gryphe/mythomax-l2-13b:free'
    ];

    const aiRequest = async () => {
      const startTime = Date.now();
      let lastError;

      for (const model of fallbackModels) {
        try {
          const completion = await openai.chat.completions.create({
            model,
            messages,
            temperature: 0.3, // Lower temperature for more focused responses
          });

          const response = completion.choices?.[0]?.message?.content;
          if (response) {
            // Additional topic enforcement
            const lowerResponse = response.toLowerCase();
            const lowerTopic = topic.toLowerCase();
            
            if (!lowerResponse.includes(lowerTopic)) {
              return `I specialize in ${topic}Let's focus on that.`;
            }

            console.log(`AI (${model}) responded in ${Date.now() - startTime}ms`);
            return response;
          }
        } catch (err) {
          console.warn(`Model ${model} failed: ${err.message}`);
          lastError = err;
          if (err.status !== 429) break;
        }
      }

      throw lastError || new Error('AI response failed');
    };

    return await queueRequest(aiRequest);
  } catch (error) {
    console.error('AI_Model Error:', error);

    if (error.status === 429) {
      throw new Error(
        'You have exceeded the free usage limit. Please wait or add credits to your OpenRouter account.'
      );
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
        console.log("Audio Started")
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

    console.log(" Got buffer of", buffer.byteLength, "bytes");
    await playAudioBuffer(buffer);
  } catch (error) {
    console.error(' speakText error:', error);
  }
};



