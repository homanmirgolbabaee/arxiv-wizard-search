import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArxivPaper } from '@/types/arxiv';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Bot, Loader2, Copy, X, VolumeIcon, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { areApiKeysConfigured } from '@/services/apiKeyService';
import ApiKeyDialog from '@/components/ApiKeyDialog';
import { analyzeText } from '@/services/textAnalysisService';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import AnalysisResult from '@/components/AnalysisResult';

interface LocationState {
  paper: ArxivPaper;
  pdfUrl: string | null;
}

const PdfEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { arxivId } = useParams<{ arxivId: string }>();
  
  // Get state from location or reconstruct it
  const state = location.state as LocationState | undefined;
  const [paper] = useState<ArxivPaper | null>(state?.paper || null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(state?.pdfUrl || null);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [isWebUrl, setIsWebUrl] = useState(false);
  const [isPdfLoaded, setIsPdfLoaded] = useState(false);
  
  // Text analysis state
  const [selectedText, setSelectedText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  
  // API key state
  const [keysConfigured, setKeysConfigured] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  
  // Container refs
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const objectRef = useRef<HTMLObjectElement>(null);
  const analysisPanelRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Check if API keys are configured
    const configured = areApiKeysConfigured();
    setKeysConfigured(configured);
  }, []);
  
  useEffect(() => {
    // Check if we're in URL mode - if the ID is a URL
    try {
      const url = decodeURIComponent(arxivId || '');
      const isUrl = url.startsWith('http');
      setIsUrlMode(isUrl);
      
      // Check if it's a web URL (not ending with .pdf)
      const isPdfUrl = url.toLowerCase().endsWith('.pdf');
      setIsWebUrl(isUrl && !isPdfUrl);
      
      // If we don't have the paper info from state, reconstruct the URL
      if (!pdfUrl) {
        if (isUrl) {
          // For URL mode, the ID is the URL itself
          setPdfUrl(url);
        } else if (arxivId) {
          // For arXiv mode, construct the PDF URL
          const constructedUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;
          setPdfUrl(constructedUrl);
        }
      }
    } catch (error) {
      console.error('Error handling URL:', error);
      // If decoding fails, assume it's an arXiv ID
      if (!pdfUrl && arxivId) {
        const constructedUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;
        setPdfUrl(constructedUrl);
      }
    }
  }, [arxivId, pdfUrl, isUrlMode, isWebUrl]);

  // Improved text selection handling
  useEffect(() => {
    const handleMouseUp = (event: MouseEvent) => {
      // Skip if the click happened inside the analysis panel
      if (analysisPanelRef.current && analysisPanelRef.current.contains(event.target as Node)) {
        return;
      }
      
      const selection = window.getSelection();
      if (!selection) return;
      
      const selectedStr = selection.toString().trim();
      if (selectedStr) {
        console.log('Text selected:', selectedStr.substring(0, 50) + '...');
        setSelectedText(selectedStr);
        
        // Only show toast if analyzing panel is not already open
        if (!showAnalysisPanel) {
          toast.info('Text selected! Click "Analyze Selection" to analyze.');
        }
      }
    };
    
    // Listen for mouseup events on the entire document
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [showAnalysisPanel]);

  const goBack = () => {
    navigate('/');
  };

  const handlePdfLoad = () => {
    setIsPdfLoaded(true);
    toast.success('PDF loaded successfully');
  };

  const handlePdfError = () => {
    toast.error('Failed to load PDF. Try opening in a new tab.');
  };

  const handleAnalyzeText = async () => {
    // Check if API keys are configured
    if (!keysConfigured) {
      toast.error('API keys are required for text analysis');
      setIsApiKeyDialogOpen(true);
      return;
    }

    // Check if text is selected
    if (!selectedText) {
      toast.info('Please select some text from the PDF first');
      return;
    }

    setIsAnalyzing(true);
    setShowAnalysisPanel(true);
    setAnalysisResult(null);
    setAnalysisCompleted(false);

    try {
      const result = await analyzeText(selectedText);
      setAnalysisResult(result.analysis);
      setAnalysisCompleted(true);
      toast.success('Text analysis completed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Analysis failed: ${errorMessage}`);
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Toggle analysis panel
  const toggleAnalysisPanel = () => {
    setShowAnalysisPanel(!showAnalysisPanel);
    // Don't auto-populate text if panel is closing
    if (!showAnalysisPanel && !selectedText) {
      setTimeout(() => {
        // Small timeout to avoid flicker
        setSelectedText('Please select text from the PDF or paste it here manually.');
      }, 100);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('Copied to clipboard');
      })
      .catch((err) => {
        toast.error('Failed to copy: ' + err.message);
      });
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setSelectedText(text);
      toast.success('Text pasted from clipboard');
    } catch (error) {
      toast.error('Could not access clipboard. Please paste text manually.');
    }
  };

  // Handle text area changes without affecting window selection
  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    setSelectedText(e.target.value);
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
                ArXiv PDF Editor
              </h1>
              {paper && (
                <p className="text-sm text-muted-foreground line-clamp-1 max-w-[500px]">
                  {paper.title}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAnalyzeText}
              disabled={isAnalyzing || !selectedText}
              className="flex items-center gap-1.5"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4" />
                  Analyze Selection
                </>
              )}
            </Button>
            
            <Button 
              variant="default" 
              size="sm" 
              onClick={toggleAnalysisPanel}
              className="flex items-center gap-1.5"
            >
              <Bot className="h-4 w-4" />
              Open Analysis Panel
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 flex-1 flex flex-col">
        <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
          <div className="space-y-4 flex-1 flex flex-col">
            {/* PDF Viewer with Analysis Split Panel */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4">
              {/* PDF Viewer */}
              <div 
                className={`flex-1 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col 
                  transition-all duration-300 ease-in-out 
                  ${showAnalysisPanel ? 'lg:w-3/5' : 'w-full'}`}
              >
                {pdfUrl && (
                  <div 
                    ref={pdfContainerRef}
                    className="flex-1 flex flex-col min-h-[75vh]"
                  >
                    <object
                      ref={objectRef}
                      data={pdfUrl}
                      type="application/pdf"
                      width="100%"
                      height="100%"
                      className="flex-1"
                      onLoad={handlePdfLoad}
                      onError={handlePdfError}
                    >
                      <p className="p-8 text-center">
                        Your browser doesn't support PDF viewing. 
                        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline ml-1">
                          Download the PDF
                        </a> instead.
                      </p>
                    </object>
                  </div>
                )}
                
                {!pdfUrl && (
                  <div className="p-12 text-center flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <p>No content to display</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Analysis Panel (Conditional Render) */}
              {showAnalysisPanel && (
                <Card 
                  ref={analysisPanelRef}
                  className="lg:w-2/5 flex flex-col h-full transition-all duration-300 transform animate-in slide-in-from-right-5"
                  onMouseDown={(e) => e.stopPropagation()} // Prevent selection loss
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        Text Analysis
                        <div className="ml-auto flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title="Text-to-Speech (Coming Soon)"
                          >
                            <VolumeIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAnalysisPanel(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 overflow-auto space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Selected Text</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handlePasteFromClipboard} 
                          className="h-8 text-xs"
                        >
                          Paste from Clipboard
                        </Button>
                      </div>
                      <Textarea 
                        value={selectedText} 
                        onChange={handleTextAreaChange}
                        onClick={(e) => e.stopPropagation()} // Prevent selection loss
                        placeholder="Paste or type the text you want to analyze..."
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Analysis Result</p>
                        {analysisCompleted && (
                          <div className="flex items-center text-green-600 text-xs">
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Text analysis completed
                          </div>
                        )}
                      </div>
                      
                      {isAnalyzing ? (
                        <div className="p-4 text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                          <p>Analyzing text...</p>
                        </div>
                      ) : (
                        <AnalysisResult analysis={analysisResult} />
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAnalyzeText}
                      disabled={!selectedText || isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          Analyzing...
                        </>
                      ) : (
                        <>Analyze Text</>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(analysisResult || '')}
                      disabled={!analysisResult}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Analysis
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
            
            {/* Open Analysis Panel Button at the bottom - for mobile view */}
            {!showAnalysisPanel && (
              <div className="flex justify-center sm:hidden">
                <Button 
                  variant="default" 
                  onClick={toggleAnalysisPanel}
                  className="gap-1.5"
                >
                  <Bot className="h-4 w-4" />
                  Open Analysis Panel
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PdfEditor;