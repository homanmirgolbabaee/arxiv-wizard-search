
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArxivPaper } from '@/types/arxiv';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Download, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface LocationState {
  paper: ArxivPaper;
  pdfUrl: string | null;
}

const PdfEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { arxivId } = useParams<{ arxivId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [annotationMode, setAnnotationMode] = useState(false);
  
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

    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
      toast.success('PDF loaded successfully');
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [arxivId, pdfUrl]);

  const goBack = () => {
    navigate('/');
  };

  const toggleAnnotationMode = () => {
    setAnnotationMode(!annotationMode);
    console.log("Annotation mode toggled");
    toast.info("Annotation mode toggled");
  };

  const downloadPdf = async () => {
    if (!pdfUrl) return;
    
    try {
      // Create a safe filename
      const fileName = paper?.title 
        ? `${paper.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.pdf`
        : `arxiv_${arxivId}.pdf`;
      
      // Create an anchor element and trigger download
      const link = document.createElement('a');
      link.href = pdfUrl;
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
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 flex-1 flex flex-col">
        <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
          {loading ? (
            <Card className="flex items-center justify-center p-12 flex-1">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
                <p>Loading PDF...</p>
              </div>
            </Card>
          ) : error ? (
            <Card className="p-6 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={goBack}>Return to Search</Button>
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
                  
                  {pdfUrl && (
                    <Button variant="outline" asChild>
                      <a 
                        href={pdfUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5"
                      >
                        Open in New Tab
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
              
              <div className="bg-white rounded-lg shadow-lg overflow-hidden flex-1 flex flex-col">
                {pdfUrl ? (
                  <iframe 
                    src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                    className="w-full flex-1 min-h-[75vh]" 
                    title="PDF Viewer"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    loading="eager"
                  />
                ) : (
                  <div className="p-12 text-center flex-1 flex items-center justify-center">
                    <p>No PDF URL available</p>
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
