/**
 * API Key Management Service
 * Handles storage and validation of API keys for Toolhouse, OpenAI, and ElevenLabs
 */

// Local storage keys
const TOOLHOUSE_API_KEY_STORAGE = 'arxiv-wizard-toolhouse-api-key';
const OPENAI_API_KEY_STORAGE = 'arxiv-wizard-openai-api-key';
const ELEVENLABS_API_KEY_STORAGE = 'elevenlabs-api-key'; // This should match the key used in the original code

// Type for API keys
export interface ApiKeys {
  toolhouseApiKey: string;
  openaiApiKey: string;
  elevenLabsApiKey: string;
}

/**
 * Get stored API keys from local storage
 */
export const getStoredApiKeys = (): ApiKeys => {
  if (typeof window === 'undefined') {
    return { toolhouseApiKey: '', openaiApiKey: '', elevenLabsApiKey: '' };
  }
  
  return {
    toolhouseApiKey: localStorage.getItem(TOOLHOUSE_API_KEY_STORAGE) || '',
    openaiApiKey: localStorage.getItem(OPENAI_API_KEY_STORAGE) || '',
    elevenLabsApiKey: sessionStorage.getItem(ELEVENLABS_API_KEY_STORAGE) || ''
  };
};

/**
 * Save API keys to local storage
 */
export const saveApiKeys = (keys: ApiKeys): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(TOOLHOUSE_API_KEY_STORAGE, keys.toolhouseApiKey);
  localStorage.setItem(OPENAI_API_KEY_STORAGE, keys.openaiApiKey);
  if (keys.elevenLabsApiKey) {
    sessionStorage.setItem(ELEVENLABS_API_KEY_STORAGE, keys.elevenLabsApiKey);
  }
};

/**
 * Save ElevenLabs API key to session storage
 */
export const saveElevenLabsApiKey = (apiKey: string): void => {
  if (typeof window === 'undefined') return;
  
  sessionStorage.setItem(ELEVENLABS_API_KEY_STORAGE, apiKey);
};

/**
 * Clear stored API keys from local storage
 */
export const clearApiKeys = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(TOOLHOUSE_API_KEY_STORAGE);
  localStorage.removeItem(OPENAI_API_KEY_STORAGE);
  sessionStorage.removeItem(ELEVENLABS_API_KEY_STORAGE);
};

/**
 * Check if API keys exist and are valid format
 * Note: This doesn't check if keys work with their services, just if they look like valid keys
 */
export const validateApiKeyFormat = (keys: ApiKeys): { valid: boolean; message: string } => {
  // Required keys validation
  if (!keys.toolhouseApiKey) {
    return { valid: false, message: 'Toolhouse API key is required' };
  }
  
  if (!keys.openaiApiKey) {
    return { valid: false, message: 'OpenAI API key is required' };
  }
  
  // Check Toolhouse key format (th-...)
  if (!keys.toolhouseApiKey.startsWith('th-')) {
    return { valid: false, message: 'Toolhouse API key should start with "th-"' };
  }
  
  // Check OpenAI key format (sk-...)
  if (!keys.openaiApiKey.startsWith('sk-')) {
    return { valid: false, message: 'OpenAI API key should start with "sk-"' };
  }
  
  return { valid: true, message: 'API keys are valid' };
};

/**
 * Check if required API keys are configured
 */
export const areApiKeysConfigured = (): boolean => {
  const keys = getStoredApiKeys();
  return !!keys.toolhouseApiKey && !!keys.openaiApiKey;
};

/**
 * Check if ElevenLabs API key is configured
 */
export const isElevenLabsApiKeyConfigured = (): boolean => {
  return !!sessionStorage.getItem(ELEVENLABS_API_KEY_STORAGE);
};