/**
 * Service for Text-to-Speech functionality using ElevenLabs API
 */

// Default voice ID for ElevenLabs - "Rachel" voice
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

/**
 * Converts text to speech using ElevenLabs API
 * @param text The text to convert to speech
 * @param voiceId Optional voice ID (defaults to Rachel)
 * @returns Promise with audio blob
 */
export const textToSpeech = async (text: string, voiceId: string = DEFAULT_VOICE_ID): Promise<Blob> => {
  try {
    // Get API key from session storage
    const apiKey = sessionStorage.getItem('elevenlabs-api-key');
    
    if (!apiKey) {
      throw new Error('ElevenLabs API key not found. Please set your API key first.');
    }
    
    // Clean up the text - remove markdown formatting
    const cleanText = cleanMarkdown(text);
    
    // Prepare the request
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API Error: ${response.status} - ${errorText}`);
    }
    
    // Get the audio blob from the response
    const audioBlob = await response.blob();
    return audioBlob;
    
  } catch (error) {
    console.error('Error in text-to-speech conversion:', error);
    throw error;
  }
};

/**
 * Sets the ElevenLabs API key
 * @param apiKey The ElevenLabs API key
 */
export const setElevenLabsApiKey = (apiKey: string): void => {
  sessionStorage.setItem('elevenlabs-api-key', apiKey);
};

/**
 * Checks if ElevenLabs API key is configured
 * @returns Boolean indicating if API key is set
 */
export const isElevenLabsConfigured = (): boolean => {
  return !!sessionStorage.getItem('elevenlabs-api-key');
};

/**
 * Function to clean markdown formatting for better TTS results
 */
const cleanMarkdown = (text: string): string => {
  // Remove markdown formatting
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold markers
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic markers
    .replace(/^(\d+)\.\s+/, '') // Remove numbering
    .replace(/^\s*[-*]\s+/gm, '') // Remove bullet points
    .trim();
};

/**
 * Plays audio from a blob
 * @param audioBlob The audio blob to play
 * @returns Audio element that's playing
 */
export const playAudio = (audioBlob: Blob): HTMLAudioElement => {
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  
  // Clean up object URL when done playing
  audio.onended = () => {
    URL.revokeObjectURL(audioUrl);
  };
  
  audio.play();
  return audio;
};

/**
 * Stops audio playback
 * @param audio Audio element to stop
 */
export const stopAudio = (audio: HTMLAudioElement | null): void => {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
};

/**
 * Get a simplified text from analysis section for TTS
 * This helps TTS engines by removing markdown and formatting
 */
export const prepareTtsText = (text: string): string => {
  // Remove section numbering if present
  text = text.replace(/^\d+\.\s+\*\*[^*]+\*\*:?\s*/m, '');
  
  // Remove markdown formatting
  return cleanMarkdown(text);
};