// src/components/ElevenLabsApiDialog.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { saveElevenLabsApiKey, getStoredApiKeys } from '@/services/apiKeyService';
import { toast } from 'sonner';
import { Key, Eye, EyeOff } from 'lucide-react';

interface ElevenLabsApiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKeyConfigured?: () => void;
}

const ElevenLabsApiDialog: React.FC<ElevenLabsApiDialogProps> = ({ 
  open, 
  onOpenChange,
  onKeyConfigured
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Load saved key on mount
  useEffect(() => {
    if (open) {
      const savedKeys = getStoredApiKeys();
      setApiKey(savedKeys.elevenLabsApiKey || '');
    }
  }, [open]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error("API key cannot be empty");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Save the API key
      saveElevenLabsApiKey(apiKey);
      
      // Show success message
      toast.success('ElevenLabs API key saved successfully');
      
      // Close the dialog and call the callback
      onOpenChange(false);
      if (onKeyConfigured) onKeyConfigured();
    } catch (error) {
      toast.error("Failed to save API key");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Configure ElevenLabs API Key
          </DialogTitle>
          <DialogDescription>
            Set up your ElevenLabs API key to enable text-to-speech functionality.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="elevenlabs-api-key" className="text-left">
              ElevenLabs API Key
            </Label>
            <div className="relative">
              <Input
                id="elevenlabs-api-key"
                type={showApiKey ? "text" : "password"}
                placeholder="Enter your ElevenLabs API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full w-10 px-3"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showApiKey ? "Hide" : "Show"} API key
                </span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              You can get your API key from the{" "}
              <a 
                href="https://elevenlabs.io/app/settings/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                ElevenLabs dashboard
              </a>.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={isLoading || !apiKey}
          >
            {isLoading ? "Saving..." : "Save API Key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ElevenLabsApiDialog;