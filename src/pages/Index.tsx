import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchForm from '@/components/SearchForm';
import PaperResults from '@/components/PaperResults';
import ApiKeyDialog from '@/components/ApiKeyDialog';
import { searchPapers } from '@/services/arxivService';
import { ArxivPaper } from '@/types/arxiv';
import { areApiKeysConfigured } from '@/services/apiKeyService';
import { Button } from '@/components/ui/button';
import { FileText, Globe, Key, Bot, SparkleIcon } from 'lucide-react';

// Adding basic animation with CSS classes to keep the implementation simple
const fadeIn = "animate-in fade-in duration-500";
const slideIn = "animate-in slide-in-from-bottom-4 duration-500";

const Index = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState<ArxivPaper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [mode, setMode] = useState<'arxiv' | 'url'>('arxiv');
  const [aiProvider, setAiProvider] = useState<'openai' | 'anthropic'>('openai');
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [keysConfigured, setKeysConfigured] = useState(false);

  // Check if API keys are configured on mount
  useEffect(() => {
    const configured = areApiKeysConfigured();
    setKeysConfigured(configured);
  }, []);

  const handleSearch = async (query: string, maxResults: number) => {
    if (mode === 'url') {
      // For URL mode, navigate to the URL viewer page with the selected AI provider
      navigate('/url-viewer', { state: { aiProvider } });
      return;
    }
    
    // Regular arXiv search
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      const results = await searchPapers(query, maxResults);
      setPapers(results);
    } catch (err) {
      setError('Failed to fetch papers. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlButtonClick = () => {
    setMode('url');
    navigate('/url-viewer', { state: { aiProvider } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* API Key Configuration Dialog */}
      <ApiKeyDialog 
        open={isApiKeyDialogOpen} 
        onOpenChange={setIsApiKeyDialogOpen}
        onKeysConfigured={() => setKeysConfigured(true)}
      />
      
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex-1"></div>
            <h1 className="text-2xl font-bold text-center flex-1">PDF Search & Viewer</h1>
            <div className="flex-1 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsApiKeyDialogOpen(true)}
                className="flex items-center gap-1.5"
              >
                <Key className="h-4 w-4" />
                {keysConfigured ? 'Manage Keys' : 'Set Keys'}
              </Button>
            </div>
          </div>
          
          {/* Mode Selector */}
          <div className="flex justify-center mt-4 gap-4">
            <Button 
              variant={mode === 'arxiv' ? "default" : "outline"} 
              className="gap-2 px-6"
              onClick={() => setMode('arxiv')}
            >
              <FileText className="h-5 w-5" />
              ArXiv
            </Button>
            <Button 
              variant={mode === 'url' ? "default" : "outline"} 
              className="gap-2 px-6"
              onClick={handleUrlButtonClick}
            >
              <Globe className="h-5 w-5" />
              URL
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {mode === 'arxiv' && (
            <>
              <div className={fadeIn}>
                <SearchForm 
                  onSearch={handleSearch} 
                  placeholder="Search arXiv papers..."
                  aiProvider={aiProvider}
                  onAiProviderChange={setAiProvider}
                />
              </div>
              
              {!hasSearched && (
                <div className={`${slideIn} mt-8 text-center text-gray-500`}>
                  <p className="text-sm">
                    Search for research papers across arXiv's extensive database. 
                    Use the filter button to refine your search.
                  </p>
                </div>
              )}
              
              {hasSearched && (
                <div className={`${slideIn} mt-8`}>
                  <PaperResults
                    papers={papers}
                    isLoading={isLoading}
                    error={error}
                    isUrlMode={false}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <footer className="py-6 border-t mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          PDF Search & Viewer | {mode === 'arxiv' ? 'ArXiv Database' : 'External URLs'} | AI Provider: {aiProvider === 'openai' ? 'OpenAI' : 'Anthropic'}
        </div>
      </footer>
    </div>
  );
};

export default Index;