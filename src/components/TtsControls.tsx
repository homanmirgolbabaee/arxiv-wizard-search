import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { VolumeIcon, Volume2Icon, StopCircleIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { textToSpeech, playAudio, stopAudio, isElevenLabsConfigured } from '@/services/textToSpeechService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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
  const [apiKey, setApiKey] = useState('');
  
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
  
  const saveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }
    
    try {
      sessionStorage.setItem('elevenlabs-api-key', apiKey);
      setShowApiKeyDialog(false);
      toast.success('ElevenLabs API key saved');
      
      // Try TTS again
      handleTtsClick();
    } catch (error) {
      toast.error('Failed to save API key');
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
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ElevenLabs API Key Required</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="apiKey">
                Enter your ElevenLabs API key
              </Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your ElevenLabs API key"
              />
              <p className="text-sm text-muted-foreground">
                You can get your API key from the <a href="https://elevenlabs.io/app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ElevenLabs dashboard</a>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowApiKeyDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveApiKey}>
              Save API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TtsControls;