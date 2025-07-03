export const ElevenLabsService = {
  async synthesizeSpeech(text, voiceId, apiKey) {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2', // ✅ more universal fallback
            voice_settings: {
              stability: 0.4,
              similarity_boost: 0.75,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error(' ElevenLabs TTS Error:', error);
      throw new Error('Failed to generate speech. Please try again.');
    }
  },

  async getVoices(apiKey) {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': apiKey },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(' Error fetching voices:', error);
      throw new Error('Failed to load voice options.');
    }
  },
};


export const VOICE_OPTIONS = [
  {
    id: '2qfp6zPuviqeCOZIE9RZ', 
    name: 'Tina',
    description: 'Professional female voice'
  },
  {
    id: 'bIHbv24MWmeRgasZH58o',
    name: 'Larry',
    description: 'Laid Back Friendly Voice'
  },
  {
    id: 'kdmDKE6EkgrWrrykO9Qt', 
    name: 'Lucy',
    description: 'Friendly female voice'
  },
    {
    id: 'UgBBYS2sOqTuMpoF3BR0', 
    name: 'Rohan',
    description: 'Professional Male voice'
  }
];

export const playAudioBuffer = async (arrayBuffer) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const decoded = await audioContext.decodeAudioData(arrayBuffer);
  const source = audioContext.createBufferSource();
  source.buffer = decoded;
  source.connect(audioContext.destination);
  source.start(0);
};
