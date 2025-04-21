
import { useState } from 'react';
import SearchForm from '@/components/SearchForm';
import PaperResults from '@/components/PaperResults';
import { searchPapers } from '@/services/arxivService';
import { ArxivPaper } from '@/types/arxiv';
import { Separator } from '@/components/ui/separator';

const Index = () => {
  const [papers, setPapers] = useState<ArxivPaper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query: string, maxResults: number) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">ArXiv Wizard Search</h1>
            <a 
              href="https://arxiv.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              About arXiv.org
            </a>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 md:flex-row md:gap-12">
          {/* Left column: Search form */}
          <div className="w-full md:w-2/5 lg:w-1/3">
            <div className="sticky top-8">
              <SearchForm onSearch={handleSearch} />
              
              {/* Help section */}
              {!hasSearched && (
                <div className="mt-8 bg-blue-50 p-4 rounded-md border border-blue-100">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Search Tips</h3>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Use quotes for exact phrase matching: "quantum computing"</li>
                    <li>• For author search, try using last name, first initial: "Smith J"</li>
                    <li>• For categories, use arXiv notation: cs.AI, math.AG, etc.</li>
                    <li>• Combine terms with AND/OR: neural networks AND reinforcement learning</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {/* Right column: Results */}
          <div className="w-full md:w-3/5 lg:w-2/3">
            {hasSearched && (
              <PaperResults
                papers={papers}
                isLoading={isLoading}
                error={error}
              />
            )}
            
            {!hasSearched && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-24 h-24 mb-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Search ArXiv Papers</h2>
                <p className="text-gray-500 max-w-md">
                  Enter your search terms in the form to find relevant scientific papers from arXiv's extensive database.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            ArXiv Wizard Search | Data provided by <a href="https://arxiv.org/" className="underline" target="_blank" rel="noopener noreferrer">arXiv.org</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
