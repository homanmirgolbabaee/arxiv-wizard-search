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
  const [annotationMode, setAnnotationMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [pdfBlob, setPdfBlob] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const embedRef = useRef<HTMLEmbedElement>(null);
  
  // Get state from location or reconstruct it
  const state = location.state as LocationState | undefined;
  const [paper] = useState<ArxivPaper | null>(state?.paper || null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(state?.pdfUrl || null);
  
  useEffect(() => {
    // If we don't have the paper info from state, reconstruct the PDF URL
    if (!pdfUrl && arxivId) {
      const constructedUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;
      setPdfUrl(constructedUrl);
    }
    
    // Reset states when URL changes
    setPdfBlob(null);
    setLoading(true);
    setPdfError(null);
    
    // Start loading animation
    const loadingInterval = setInterval(() => {
      setLoadProgress(prev => Math.min(prev + 5, 90));
    }, 300);
    
    // Attempt to load PDF if we have a URL
    if (pdfUrl) {
      fetchPdf(pdfUrl);
    }
    
    return () => clearInterval(loadingInterval);
  }, [arxivId, pdfUrl]);
  
  // Function to fetch PDF and create blob URL
  const fetchPdf = async (url: string) => {
    try {
      const corsProxy = 'https://corsproxy.io/?';
      const proxyUrl = `${corsProxy}${encodeURIComponent(url)}`;
      
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status}`);
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      setPdfBlob(blobUrl);
      setLoadProgress(100);
      
      setTimeout(() => {
        setLoading(false);
        toast.success('PDF loaded successfully');
      }, 500);
      
    } catch (error) {
      console.error('Error fetching PDF:', error);
      // Instead of showing error, let's just try direct embedding
      setLoadProgress(100);
      setPdfError(null);
      
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const goBack = () => {
    navigate('/');
  };

  const toggleAnnotationMode = () => {
    setAnnotationMode(!annotationMode);
    toast.info(annotationMode ? "Annotation mode disabled" : "Annotation mode enabled");
  };

  const downloadPdf = async () => {
    if (!pdfUrl) return;
    
    try {
      // Create a safe filename
      const fileName = paper?.title 
        ? `${paper.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.pdf`
        : `arxiv_${arxivId}.pdf`;
      
      // If we have a blob URL, use that for the download
      const downloadUrl = pdfBlob || pdfUrl;
      
      // Create a link to download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
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
              variant="default" 
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
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden flex-1 flex flex-col">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12">
                  <div className="text-center mb-6">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
                    <p>Loading PDF...</p>
                  </div>
                  <div className="w-full max-w-md">
                    <Progress value={loadProgress} className="h-2" />
                  </div>
                </div>
              ) : pdfBlob ? (
                // If we have a blob URL, use an iframe to display it
                <iframe 
                  src={`${pdfBlob}#toolbar=1&navpanes=1`}
                  className="w-full flex-1 min-h-[75vh]"
                  title="PDF Viewer"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                // Fallback to displaying PDF in an embed tag with Google PDF Viewer as fallback
                <>
                  <div className="flex flex-col items-center justify-center p-6 border-b">
                    <h3 className="font-medium mb-2">PDF Viewer</h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      We're trying to display the PDF directly. If nothing appears below,
                      use one of these alternatives:
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl || '')}`, '_blank')}
                        className="flex items-center gap-1.5"
                      >
                        View with Google
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={openInNewTab}
                        className="flex items-center gap-1.5"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open in New Tab
                      </Button>
                    </div>
                  </div>
                  
                  {/* Try multiple PDF viewing options */}
                  <div className="relative flex-1 min-h-[65vh] flex flex-col">
                    {/* Option 1: Standard embed tag */}
                    <embed 
                      ref={embedRef}
                      src={pdfUrl || ''}
                      type="application/pdf"
                      className="w-full h-full absolute inset-0"
                    />
                    
                    {/* Option 2: Google Docs viewer fallback (hidden in an iframe) */}
                    <iframe 
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl || '')}&embedded=true`}
                      className="w-full h-full absolute inset-0"
                      style={{ opacity: 0.01 }} // Nearly invisible, just a fallback
                    />
                  </div>
                </>
              )}
            </div>
          </div>
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