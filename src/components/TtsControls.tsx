import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { VolumeIcon, Volume2Icon, StopCircleIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { textToSpeech, playAudio, stopAudio, isElevenLabsConfigured } from '@/services/textToSpeechService';
import ApiKeyDialog from '@/components/ApiKeyDialog';

interface TtsControlsProps {
  text: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'default';
  tooltipText?: string;
  className?: string;
}

const TtsControls: React.FC<TtsControlsProps> = ({
  text,
  size = 'sm',
  variant = 'ghost',
  tooltipText = 'Listen with TTS',
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const handleTtsClick = async () => {
    // If already playing, stop the audio
    if (isPlaying) {
      stopAudio(audioRef.current);
      setIsPlaying(false);
      return;
    }
    
    // Check if ElevenLabs API key is configured
    if (!isElevenLabsConfigured()) {
      setShowApiKeyDialog(true);
      return;
    }
    
    // No text to speak
    if (!text.trim()) {
      toast.error('No text available to speak');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const audioBlob = await textToSpeech(text);
      audioRef.current = playAudio(audioBlob);
      
      setIsPlaying(true);
      
      // Update state when audio finishes playing
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
      
    } catch (error) {
      toast.error(`TTS Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('TTS error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleTtsClick}
        className={className}
        title={tooltipText}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <StopCircleIcon className="h-4 w-4" />
        ) : (
          <VolumeIcon className="h-4 w-4" />
        )}
      </Button>
      
      {/* API Key Dialog */}
      <ApiKeyDialog 
        open={showApiKeyDialog} 
        onOpenChange={setShowApiKeyDialog}
        onKeysConfigured={() => {
          // Try TTS again after keys are configured
          handleTtsClick();
        }}
      />
    </>
  );
};

export default TtsControls;