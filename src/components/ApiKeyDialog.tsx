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
import { getStoredApiKeys, saveApiKeys, validateApiKeyFormat } from '@/services/apiKeyService';
import { testApiKeys } from '@/services/toolhouseService';
import { toast } from 'sonner';
import { Key, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKeysConfigured?: () => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ 
  open, 
  onOpenChange,
  onKeysConfigured 
}) => {
  const [toolhouseApiKey, setToolhouseApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToolhouseKey, setShowToolhouseKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    valid: boolean;
    message: string;
    testing: boolean;
  }>({ valid: false, message: '', testing: false });

  // Load saved keys on mount
  useEffect(() => {
    if (open) {
      const savedKeys = getStoredApiKeys();
      setToolhouseApiKey(savedKeys.toolhouseApiKey);
      setOpenaiApiKey(savedKeys.openaiApiKey);
    }
  }, [open]);

  const handleSave = async () => {
    // First validate the format
    const formatValidation = validateApiKeyFormat({ 
      toolhouseApiKey, 
      openaiApiKey
    });
    
    if (!formatValidation.valid) {
      setValidationStatus({
        valid: false,
        message: formatValidation.message,
        testing: false
      });
      return;
    }
    
    // Then test the keys with the APIs
    setIsLoading(true);
    setValidationStatus({
      valid: false,
      message: 'Testing API keys...',
      testing: true
    });
    
    try {
      const testResult = await testApiKeys(toolhouseApiKey, openaiApiKey);
      
      if (testResult.valid) {
        // Save keys if validation passed
        saveApiKeys({ toolhouseApiKey, openaiApiKey });
        setValidationStatus({
          valid: true,
          message: testResult.message,
          testing: false
        });
        
        // Show success message
        toast.success('API keys saved successfully');
        
        // Wait a moment to show the success message
        setTimeout(() => {
          onOpenChange(false);
          if (onKeysConfigured) onKeysConfigured();
        }, 1500);
      } else {
        setValidationStatus({
          valid: false,
          message: testResult.message,
          testing: false
        });
      }
    } catch (error) {
      setValidationStatus({
        valid: false,
        message: error instanceof Error ? error.message : 'Failed to validate API keys',
        testing: false
      });
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
            Configure API Keys
          </DialogTitle>
          <DialogDescription>
            Set up your API keys to use all the features of the application.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="toolhouse-api-key" className="text-left">
              Toolhouse API Key
            </Label>
            <div className="relative">
              <Input
                id="toolhouse-api-key"
                type={showToolhouseKey ? "text" : "password"}
                placeholder="th-..."
                value={toolhouseApiKey}
                onChange={(e) => setToolhouseApiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full w-10 px-3"
                onClick={() => setShowToolhouseKey(!showToolhouseKey)}
              >
                {showToolhouseKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showToolhouseKey ? "Hide" : "Show"} Toolhouse API key
                </span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              The API key for Toolhouse. Should start with "th-".
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="openai-api-key" className="text-left">
              OpenAI API Key
            </Label>
            <div className="relative">
              <Input
                id="openai-api-key"
                type={showOpenAIKey ? "text" : "password"}
                placeholder="sk-..."
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full w-10 px-3"
                onClick={() => setShowOpenAIKey(!showOpenAIKey)}
              >
                {showOpenAIKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showOpenAIKey ? "Hide" : "Show"} OpenAI API key
                </span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              The API key for OpenAI. Should start with "sk-".
            </p>
          </div>
          
          {validationStatus.message && (
            <div className={`p-3 rounded-md ${
              validationStatus.testing 
                ? 'bg-muted' 
                : validationStatus.valid 
                  ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                  : 'bg-destructive/10 text-destructive'
            }`}>
              <div className="flex items-center gap-2">
                {validationStatus.testing ? (
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                ) : validationStatus.valid ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span>{validationStatus.message}</span>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={isLoading || !toolhouseApiKey || !openaiApiKey}
          >
            {isLoading ? "Validating..." : "Save API Keys"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;