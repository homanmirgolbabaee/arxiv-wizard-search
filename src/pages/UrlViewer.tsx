import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Globe, ExternalLink, Copy, CheckCircle2, Key } from 'lucide-react';
import { processUrlWithToolhouse } from '@/services/toolhouseService';
import { processUrlWithAnthropic } from '@/services/anthropicService';
import { areApiKeysConfigured, getStoredApiKeys } from '@/services/apiKeyService';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiKeyDialog from '@/components/ApiKeyDialog';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { HelpTooltip } from '@/components/HelpTooltip';

// Custom OpenAI and Anthropic icons
const OpenAIIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" className="mr-1">
    <path 
      fill="currentColor" 
      d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
    />
  </svg>
);

const AnthropicIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" className="mr-1">
    <path
      fill="currentColor"
      d="M11.998 0C5.366 0 0 5.366 0 12a11.962 11.962 0 0 0 9.799 11.734c.2.034.292.034.352-.154.048-.17.048-.302.048-.347v-.818c0-.594.006-1.104.02-1.54-.453.079-1.23.115-1.787.115-.93 0-1.62-.13-2.031-.521-.348-.336-.591-.86-.761-1.539a2.988 2.988 0 0 0-.87-1.459c-.182-.165-.222-.348-.027-.4 1.006-.233 1.57.632 1.863.943.41.445.88.663 1.493.663.404 0 1.006-.049 1.579-.228.205-.859.788-1.582 1.485-1.95-.175-.012-5.633-1.043-5.633-8.201 0-1.846.634-3.427 1.677-4.622-.168-.418-.762-2.141.155-4.438 0 0 1.198-.036 2.485.927.695-.194 2.075-.469 3.344-.476 1.298 0 2.572.282 3.344.476 1.287-.989 2.498-.927 2.498-.927.917 2.303.31 4.02.155 4.438 1.043 1.195 1.677 2.782 1.677 4.622 0 7.158-5.47 8.189-5.645 8.208.765.43 1.312 1.26 1.312 2.53v3.756c0 .127 0 .24.068.388.075.167.242.228.382.207A11.962 11.962 0 0 0 24 12c0-6.634-5.366-12-12.002-12z"
    />
  </svg>
);

const UrlViewer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [keysConfigured, setKeysConfigured] = useState(false);
  const [aiProvider, setAiProvider] = useState<'openai' | 'anthropic'>(
    location.state?.aiProvider || 'openai'
  );
  const [anthropicKeyAvailable, setAnthropicKeyAvailable] = useState(false);

  // Check if API keys are configured on mount
  useEffect(() => {
    const configured = areApiKeysConfigured();
    setKeysConfigured(configured);
    
    // Check if Anthropic key is available
    const { anthropicApiKey } = getStoredApiKeys();
    setAnthropicKeyAvailable(!!anthropicApiKey);
    
    // If keys are not configured, show the dialog
    if (!configured) {
      setIsApiKeyDialogOpen(true);
    }
  }, []);

  const goBack = () => {
    navigate('/');
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if API keys are configured
    if (!keysConfigured) {
      setIsApiKeyDialogOpen(true);
      return;
    }
    
    // If using Anthropic but key isn't available
    if (aiProvider === 'anthropic' && !anthropicKeyAvailable) {
      toast.error('Anthropic API key not configured. Please set up your API keys first.');
      setIsApiKeyDialogOpen(true);
      return;
    }
    
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    
    // Format URL if needed
    let processedUrl = url.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }
    
    setIsLoading(true);
    setResult(null);
    
    try {
      let response;
      
      // Process the URL with the selected AI provider
      if (aiProvider === 'anthropic') {
        response = await processUrlWithAnthropic(processedUrl);
      } else {
        response = await processUrlWithToolhouse(processedUrl);
      }
      
      // Set the result
      setResult(response);
      
      // Show success message
      toast.success('URL processed successfully');
    } catch (error) {
      console.error('Error processing URL:', error);
      toast.error('Failed to process URL: ' + (error instanceof Error ? error.message : 'Unknown error'));
      
      // Set error result
      setResult({
        error: true,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const openUrl = () => {
    if (url) {
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        toast.error('Failed to copy: ' + err.message);
      });
  };

  // Extract summary from the final response
  const getSummary = () => {
    if (!result || result.error) return "No summary available";
    
    if (aiProvider === 'anthropic') {
      return result.finalResponse?.length > 0 ? result.finalResponse[0].text : "No summary available";
    } else {
      return result.finalResponse?.content || "No summary available";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* API Key Configuration Dialog */}
      <ApiKeyDialog 
        open={isApiKeyDialogOpen} 
        onOpenChange={setIsApiKeyDialogOpen}
        onKeysConfigured={() => {
          setKeysConfigured(true);
          // Check if Anthropic key is now available
          const { anthropicApiKey } = getStoredApiKeys();
          setAnthropicKeyAvailable(!!anthropicApiKey);
        }}
      />
      
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goBack}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div>
              <h1 className="text-xl font-bold flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                URL Processor
              </h1>
              <p className="text-sm text-muted-foreground">
                Process any web URL with {aiProvider === 'anthropic' ? 'Anthropic Claude' : 'OpenAI'}
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsApiKeyDialogOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Key className="h-4 w-4" />
            {keysConfigured ? 'Manage API Keys' : 'Set Up API Keys'}
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 flex-1">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Enter URL</span>
                
                <ToggleGroup 
                  type="single" 
                  value={aiProvider}
                  onValueChange={(value) => {
                    if (value) setAiProvider(value as 'openai' | 'anthropic');
                  }}
                  className="border rounded-md"
                >
                  <HelpTooltip content="Use OpenAI for processing">
                    <ToggleGroupItem 
                      value="openai"
                      className="px-3"
                      aria-label="Use OpenAI"
                    >
                      <OpenAIIcon />
                      <span className="text-xs">OpenAI</span>
                    </ToggleGroupItem>
                  </HelpTooltip>
                  
                  <HelpTooltip content={anthropicKeyAvailable ? "Use Anthropic Claude for processing" : "Anthropic API key not configured"}>
                    <ToggleGroupItem 
                      value="anthropic"
                      className="px-3"
                      aria-label="Use Anthropic"
                      disabled={!anthropicKeyAvailable}
                    >
                      <AnthropicIcon />
                      <span className="text-xs">Claude</span>
                    </ToggleGroupItem>
                  </HelpTooltip>
                </ToggleGroup>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUrlSubmit} className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter website URL..."
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !url.trim() || !keysConfigured || (aiProvider === 'anthropic' && !anthropicKeyAvailable)}
                >
                  {isLoading ? 'Processing...' : 'Process'}
                </Button>
              </form>
              
              {!keysConfigured && (
                <div className="mt-4 p-3 rounded border bg-muted">
                  <p className="text-sm flex items-center gap-1.5">
                    <Key className="h-4 w-4" />
                    Please configure your API keys before processing URLs.
                  </p>
                </div>
              )}
              
              {aiProvider === 'anthropic' && !anthropicKeyAvailable && keysConfigured && (
                <div className="mt-4 p-3 rounded border bg-muted">
                  <p className="text-sm flex items-center gap-1.5">
                    <Key className="h-4 w-4" />
                    Anthropic API key is required. Please set up your API keys.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {isLoading && (
            <Card className="mb-6">
              <CardContent className="py-8">
                <div className="flex flex-col items-center justify-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] mb-4"></div>
                  <p>Processing URL with {aiProvider === 'anthropic' ? 'Anthropic Claude' : 'OpenAI'}...</p>
                  <p className="text-sm text-muted-foreground mt-2">This may take a few moments.</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {result && !result.error && (
            <Card>
              <CardHeader>
                <CardTitle>Processing Result</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary">
                  <TabsList className="mb-4">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="raw">Raw Data</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary" className="p-4 border rounded-md">
                    <div className="prose max-w-none">
                      <h3 className="text-xl font-medium mb-4">URL Summary</h3>
                      <div className="whitespace-pre-wrap">
                        {getSummary()}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="raw">
                    <div className="p-4 bg-muted rounded-md overflow-auto max-h-[50vh]">
                      <pre className="whitespace-pre-wrap text-xs">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={openUrl}
                  className="flex items-center gap-1.5"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open URL in New Tab
                </Button>
                <Button
                  variant="default"
                  onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                  className="flex items-center gap-1.5"
                >
                  {copied ? 
                    <><CheckCircle2 className="h-4 w-4" /> Copied</> : 
                    <><Copy className="h-4 w-4" /> Copy Result</>
                  }
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {result && result.error && (
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Error Processing URL</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-destructive/10 border-destructive/50 border rounded-md">
                  <p className="font-medium mb-2">Error Message:</p>
                  <p>{result.message}</p>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Please check your URL and try again. Make sure your API keys are correctly configured.</p>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={openUrl}
                  className="flex items-center gap-1.5"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open URL in New Tab
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsApiKeyDialogOpen(true)}
                  className="flex items-center gap-1.5"
                >
                  <Key className="h-4 w-4" />
                  Check API Keys
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
      
      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          URL Processor | {aiProvider === 'anthropic' ? 'Anthropic Claude' : 'OpenAI GPT'} Integration
        </div>
      </footer>
    </div>
  );
};

export default UrlViewer;