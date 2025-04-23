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
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getStoredApiKeys, saveApiKeys, validateApiKeyFormat, saveElevenLabsApiKey } from '@/services/apiKeyService';
import { testApiKeys } from '@/services/toolhouseService';
import { toast } from 'sonner';
import { Key, Eye, EyeOff, CheckCircle2, XCircle, VolumeIcon } from 'lucide-react';

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
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToolhouseKey, setShowToolhouseKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showElevenLabsKey, setShowElevenLabsKey] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    valid: boolean;
    message: string;
    testing: boolean;
  }>({ valid: false, message: '', testing: false });
  const [activeTab, setActiveTab] = useState("core");

  // Load saved keys on mount
  useEffect(() => {
    if (open) {
      const savedKeys = getStoredApiKeys();
      setToolhouseApiKey(savedKeys.toolhouseApiKey);
      setOpenaiApiKey(savedKeys.openaiApiKey);
      setElevenLabsApiKey(savedKeys.elevenLabsApiKey || '');
    }
  }, [open]);

  const handleSaveCoreKeys = async () => {
    // First validate the format
    const formatValidation = validateApiKeyFormat({ 
      toolhouseApiKey, 
      openaiApiKey,
      elevenLabsApiKey: ''
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
        saveApiKeys({ 
          toolhouseApiKey, 
          openaiApiKey,
          elevenLabsApiKey
        });
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

  const handleSaveElevenLabsKey = () => {
    if (!elevenLabsApiKey.trim()) {
      toast.error("API key cannot be empty");
      return;
    }
    
    try {
      // Save the API key
      saveElevenLabsApiKey(elevenLabsApiKey);
      
      // Show success message
      toast.success('ElevenLabs API key saved successfully');
      
      // Close the dialog and call the callback
      setTimeout(() => {
        setActiveTab("core"); // Switch back to core tab
      }, 1000);
    } catch (error) {
      toast.error("Failed to save API key");
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
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="core" className="flex-1">Core APIs</TabsTrigger>
            <TabsTrigger value="tts" className="flex-1">
              <VolumeIcon className="h-3.5 w-3.5 mr-1" />
              Text-to-Speech
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="core" className="mt-0">
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
                onClick={handleSaveCoreKeys}
                disabled={isLoading || !toolhouseApiKey || !openaiApiKey}
              >
                {isLoading ? "Validating..." : "Save API Keys"}
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="tts" className="mt-0">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="elevenlabs-api-key" className="text-left">
                  ElevenLabs API Key
                </Label>
                <div className="relative">
                  <Input
                    id="elevenlabs-api-key"
                    type={showElevenLabsKey ? "text" : "password"}
                    placeholder="Enter your ElevenLabs API key"
                    value={elevenLabsApiKey}
                    onChange={(e) => setElevenLabsApiKey(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full w-10 px-3"
                    onClick={() => setShowElevenLabsKey(!showElevenLabsKey)}
                  >
                    {showElevenLabsKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showElevenLabsKey ? "Hide" : "Show"} API key
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
                onClick={handleSaveElevenLabsKey}
                disabled={!elevenLabsApiKey}
              >
                Save ElevenLabs API Key
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;