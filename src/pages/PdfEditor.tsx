import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArxivPaper } from '@/types/arxiv';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Download, Pencil, ExternalLink, FileText, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';

interface LocationState {
  paper: ArxivPaper;
  pdfUrl: string | null;
}

const PdfEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { arxivId } = useParams<{ arxivId: string }>();
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [annotationMode, setAnnotationMode] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  
  // Get state from location or reconstruct it
  const state = location.state as LocationState | undefined;
  const [paper] = useState<ArxivPaper | null>(state?.paper || null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(state?.pdfUrl || null);
  const [pdfBlob, setPdfBlob] = useState<string | null>(null);
  
  useEffect(() => {
    // If we don't have the paper info from state, reconstruct the PDF URL
    if (!pdfUrl && arxivId) {
      const constructedUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;
      setPdfUrl(constructedUrl);
    }

    // Start loading animation
    const loadingInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        return newProgress > 90 ? 90 : newProgress;
      });
    }, 300);

    // Load the PDF
    if (pdfUrl) {
      fetchPdf(pdfUrl);
    }
    
    return () => clearInterval(loadingInterval);
  }, [arxivId, pdfUrl]);

  const fetchPdf = async (url: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        // Using no-cors as a fallback might not work for PDF rendering
        // but we'll try the normal request first
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const pdfObjectUrl = URL.createObjectURL(blob);
      setPdfBlob(pdfObjectUrl);
      setLoadingProgress(100);
      
      // Add a small delay to simulate completion
      setTimeout(() => {
        setLoading(false);
        toast.success('PDF loaded successfully');
      }, 500);
      
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError('Unable to load PDF directly from arXiv. Try opening in a new tab.');
      setLoading(false);
      toast.error('Error loading PDF');
    }
  };

  const goBack = () => {
    navigate('/');
  };

  const toggleAnnotationMode = () => {
    setAnnotationMode(!annotationMode);
    toast.info(annotationMode ? "Annotation mode disabled" : "Annotation mode enabled");
  };

  const retryLoading = () => {
    if (pdfUrl) {
      setLoadingProgress(0);
      fetchPdf(pdfUrl);
    }
  };

  const downloadPdf = async () => {
    if (!pdfUrl) return;
    
    try {
      // Create a safe filename
      const fileName = paper?.title 
        ? `${paper.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.pdf`
        : `arxiv_${arxivId}.pdf`;
      
      // If we already have the blob, use it directly
      if (pdfBlob) {
        const link = document.createElement('a');
        link.href = pdfBlob;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Otherwise, create a link to the original URL
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      toast.success('PDF download started');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const openInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
              <h1 className="text-xl font-bold">PDF Editor</h1>
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
              onClick={downloadPdf}
              className="flex items-center gap-1.5"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={openInNewTab}
              className="flex items-center gap-1.5"
            >
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 flex-1 flex flex-col">
        <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
          {loading ? (
            <Card className="flex flex-col items-center justify-center p-12 flex-1">
              <div className="text-center mb-4">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
                <p>Loading PDF...</p>
              </div>
              <div className="w-full max-w-md">
                <Progress value={loadingProgress} className="h-2" />
              </div>
            </Card>
          ) : error ? (
            <Card className="p-6 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-red-500 mb-4">{error}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={retryLoading} className="flex items-center gap-1.5">
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
                <Button onClick={openInNewTab} variant="outline" className="flex items-center gap-1.5">
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </Button>
                <Button onClick={goBack} variant="outline">
                  Return to Search
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4 flex-1 flex flex-col">
              <Card className="p-4">
                <div className="flex flex-wrap justify-center gap-4 mb-0">
                  <Button 
                    variant={annotationMode ? "default" : "secondary"} 
                    onClick={toggleAnnotationMode}
                    className="flex items-center gap-1.5"
                  >
                    <Pencil className="h-4 w-4" />
                    {annotationMode ? "Exit Annotation Mode" : "Enable Annotations"}
                  </Button>
                  
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline">Annotation Tools</Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                      <div className="space-y-4 pt-6">
                        <h3 className="font-medium text-lg">Annotation Tools</h3>
                        <p className="text-muted-foreground">
                          Select a tool to annotate the PDF.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" className="justify-start">
                            Highlight
                          </Button>
                          <Button variant="outline" className="justify-start">
                            Underline
                          </Button>
                          <Button variant="outline" className="justify-start">
                            Comment
                          </Button>
                          <Button variant="outline" className="justify-start">
                            Draw
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </Card>
              
              <div className="bg-white rounded-lg shadow-lg overflow-hidden flex-1 flex flex-col" ref={pdfContainerRef}>
                {pdfBlob ? (
                  <iframe 
                    src={`${pdfBlob}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                    className="w-full flex-1 min-h-[75vh]" 
                    title="PDF Viewer"
                    sandbox="allow-scripts allow-same-origin"
                    loading="eager"
                  />
                ) : (
                  <div className="p-12 text-center flex-1 flex items-center justify-center">
                    <p>No PDF available to display</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          ArXiv Wizard Search | PDF Editor Mode
        </div>
      </footer>
    </div>
  );
};

export default PdfEditor;