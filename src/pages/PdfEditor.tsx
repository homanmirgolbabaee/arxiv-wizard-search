
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArxivPaper } from '@/types/arxiv';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center">
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
              <p className="text-sm text-muted-foreground line-clamp-1">
                {paper.title}
              </p>
            )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <Card className="flex items-center justify-center p-12 min-h-[80vh]">
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
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex justify-center gap-4 mb-4">
                  <Button variant="secondary" onClick={() => {
                    console.log("Annotation mode toggled");
                    toast.info("Annotation mode toggled");
                  }}>
                    Toggle Annotations
                  </Button>
                  {pdfUrl && (
                    <Button variant="outline" asChild>
                      <a 
                        href={pdfUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        Open in New Tab
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
              
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {pdfUrl ? (
                  <iframe 
                    src={`${pdfUrl}`} 
                    className="w-full min-h-[75vh]" 
                    title="PDF Viewer"
                  />
                ) : (
                  <div className="p-12 text-center">
                    <p>No PDF URL available</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="py-6 border-t mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          ArXiv Wizard Search | PDF Editor Mode
        </div>
      </footer>
    </div>
  );
};

export default PdfEditor;
