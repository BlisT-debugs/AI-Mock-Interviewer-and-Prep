// speechUtils.js
export const checkMicrophonePermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (error) {
    console.error('Microphone permission error:', error);
    return false;
  }
};

export const createSpeechRecognition = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    throw new Error('Speech recognition not supported in this browser');
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.lang = 'en-US';

  return recognition;
};

export const mapRecognitionError = (errorCode) => {
  const errors = {
    aborted: 'Recognition stopped',
    'audio-capture': 'Microphone not available',
    'not-allowed': 'Microphone access denied',
    'no-speech': 'No speech detected',
    network: 'Network communication failed',
    'service-not-allowed': 'Service not allowed',
    'language-not-supported': 'Language not supported',
    'bad-grammar': 'Invalid grammar',
    'audio-busy': 'Audio capture device is busy',
  };

  return errors[errorCode] || 'Recognition error occurred';
};
