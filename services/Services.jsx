import OpenAI from 'openai';
import options from './Options';

// Rate limit state
let requestQueue = [];
const MAX_REQUESTS_PER_MINUTE = 10; // Conservative limit for free tier
const REQUEST_INTERVAL = 6000; // 6 seconds between requests

// Singleton OpenAI client
let openaiInstance = null;

const createOpenAIClient = (apiKey) => {
  if (!apiKey) throw new Error('API key required');
  
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      dangerouslyAllowBrowser: true,
      timeout: 10000 // 10 second timeout
    });
  }
  return openaiInstance;
};

const queueRequest = async (fn) => {
  return new Promise((resolve, reject) => {
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
};

const processQueue = async () => {
  if (requestQueue.length === 0) return;

  await requestQueue[0]();
  requestQueue.shift();
  
  if (requestQueue.length > 0) {
    setTimeout(processQueue, REQUEST_INTERVAL);
  }
};

export const AI_Model = async (topic, option, msg, conversationHistory = []) => {
  try {
    const selected = options.find(opt => opt.name === option);
    if (!selected) throw new Error(`Option "${option}" not found`);
    
    const prompt = selected.prompt.replace('{user_topic}', topic);
    const openai = createOpenAIClient(process.env.NEXT_PUBLIC_API_KEY);
    
    const messages = [
      { role: 'system', content: 'Respond concisely (under 100 words)' },
      { role: 'assistant', content: prompt },
      ...conversationHistory.slice(-2), // Only keep last 2 exchanges
      { role: 'user', content: msg },
    ];
    
    const aiRequest = async () => {
      const startTime = Date.now();
      const completion = await openai.chat.completions.create({
        model: 'google/gemini-2.0-flash-exp:free',
        messages,
        temperature: 0.7,
        max_tokens: 200, // Reduced for faster responses
      });
      
      const response = completion.choices?.[0]?.message?.content;
      if (!response) throw new Error('No response from AI');
      
      console.log(`AI response time: ${Date.now() - startTime}ms`);
      return response;
    };
    
    return await queueRequest(aiRequest);
  } catch (error) {
    console.error('AI_Model Error:', error);
    
    if (error.status === 429) {
      throw new Error('You have exceeded the free usage limit. Please wait or add credits to your OpenRouter account.');
    }
    
    throw new Error('AI is currently unavailable. Please try again later.');
  }
};