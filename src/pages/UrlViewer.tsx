import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Globe, ExternalLink, Copy, CheckCircle2, Key } from 'lucide-react';
import { processUrlWithToolhouse } from '@/services/toolhouseService';
import { areApiKeysConfigured } from '@/services/apiKeyService';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiKeyDialog from '@/components/ApiKeyDialog';

const UrlViewer = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [keysConfigured, setKeysConfigured] = useState(false);

  // Check if API keys are configured on mount
  useEffect(() => {
    const configured = areApiKeysConfigured();
    setKeysConfigured(configured);
    
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
      // Process the URL with Toolhouse SDK integration
      const response = await processUrlWithToolhouse(processedUrl);
      
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
    if (!result || result.error || !result.finalResponse?.content) {
      return "No summary available";
    }
    
    return result.finalResponse.content;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* API Key Configuration Dialog */}
      <ApiKeyDialog 
        open={isApiKeyDialogOpen} 
        onOpenChange={setIsApiKeyDialogOpen}
        onKeysConfigured={() => setKeysConfigured(true)}
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
                Process any web URL with Toolhouse SDK
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
              <CardTitle>Enter URL</CardTitle>
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
                  disabled={isLoading || !url.trim() || !keysConfigured}
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
            </CardContent>
          </Card>
          
          {isLoading && (
            <Card className="mb-6">
              <CardContent className="py-8">
                <div className="flex flex-col items-center justify-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] mb-4"></div>
                  <p>Processing URL with Toolhouse SDK...</p>
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
          URL Processor | Toolhouse SDK Integration
        </div>
      </footer>
    </div>
  );
};

export default UrlViewer;