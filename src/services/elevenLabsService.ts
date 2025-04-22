// src/services/elevenLabsService.ts

import { getStoredApiKeys } from './apiKeyService';

/**
 * Interface for ElevenLabs TTS configuration options
 */
export interface ElevenLabsTtsConfig {
  voiceId: string;
  modelId: string;
  outputFormat: string;
  stability?: number;
  similarityBoost?: number;
  speakerBoost?: number;
}

/**
 * Default configuration values for ElevenLabs TTS
 */
export const DEFAULT_TTS_CONFIG: ElevenLabsTtsConfig = {
  voiceId: 'JBFqnCBsd6RMkjVDRZzb', // Default voice (Rachel)
  modelId: 'eleven_multilingual_v2',
  outputFormat: 'mp3_44100_128',
  stability: 0.5,
  similarityBoost: 0.75
};

/**
 * Service for interacting with the ElevenLabs Text-to-Speech API
 */
export class ElevenLabsService {
  private apiKey: string | null = null;
  private config: ElevenLabsTtsConfig;
  private audioElement: HTMLAudioElement | null = null;
  
  constructor(config: Partial<ElevenLabsTtsConfig> = {}) {
    // Merge provided config with defaults
    this.config = { ...DEFAULT_TTS_CONFIG, ...config };
    
    // Try to load API key from storage
    this.loadApiKey();
    
    // Create audio element for playback
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
    }
  }
  
  /**
   * Load the ElevenLabs API key from storage
   */
  private loadApiKey(): void {
    try {
      // The storage key will be added to the apiKeyService
      const keys = getStoredApiKeys();
      if (keys.elevenLabsApiKey) {
        this.apiKey = keys.elevenLabsApiKey;
      }
    } catch (error) {
      console.error('Failed to load ElevenLabs API key:', error);
    }
  }
  
  /**
   * Update the service configuration
   */
  public updateConfig(config: Partial<ElevenLabsTtsConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Set the API key for the service
   */
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }
  
  /**
   * Get the current API key
   */
  public getApiKey(): string | null {
    return this.apiKey;
  }
  
  /**
   * Check if the service has an API key configured
   */
  public hasApiKey(): boolean {
    return !!this.apiKey;
  }
  
  /**
   * Convert text to speech using ElevenLabs API
   * @param text Text to convert to speech
   * @returns Promise with audio data
   */
  public async textToSpeech(text: string): Promise<ArrayBuffer> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }
    
    if (!text.trim()) {
      throw new Error('Text cannot be empty');
    }
    
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${this.config.voiceId}`;
    
    const requestBody = {
      text,
      model_id: this.config.modelId,
      voice_settings: {
        stability: this.config.stability,
        similarity_boost: this.config.similarityBoost,
        speaker_boost: this.config.speakerBoost
      }
    };
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`);
      }
      
      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error converting text to speech:', error);
      throw error;
    }
  }
  
  /**
   * Play text as speech
   * @param text Text to speak
   * @returns Promise that resolves when audio playback starts
   */
  public async speakText(text: string): Promise<void> {
    try {
      const audioData = await this.textToSpeech(text);
      
      if (!this.audioElement) {
        throw new Error('Audio playback not available');
      }
      
      // Convert array buffer to blob URL
      const blob = new Blob([audioData], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      
      // Set the src and play
      this.audioElement.src = url;
      
      // Clean up previous blob URL when audio is done playing
      this.audioElement.onended = () => {
        URL.revokeObjectURL(url);
      };
      
      return this.audioElement.play();
    } catch (error) {
      console.error('Error in speakText:', error);
      throw error;
    }
  }
  
  /**
   * Stop any current playback
   */
  public stop(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
  }
  
  /**
   * Get available voices from ElevenLabs API
   * @returns Promise with voice data
   */
  public async getVoices(): Promise<any> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }
    
    const url = 'https://api.elevenlabs.io/v1/voices';
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw error;
    }
  }
}

// Create a singleton instance for easy import
export const elevenLabsService = new ElevenLabsService();