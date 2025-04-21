import { useState } from 'react';
import SearchForm from '@/components/SearchForm';
import PaperResults from '@/components/PaperResults';
import { searchPapers } from '@/services/arxivService';
import { ArxivPaper } from '@/types/arxiv';

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
          <h1 className="text-2xl font-bold text-center">ArXiv Paper Search</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <SearchForm onSearch={handleSearch} />
          
          {!hasSearched && (
            <div className="mt-8 text-center text-gray-500">
              <p className="text-sm">
                Search for research papers across arXiv's extensive database.
                Use the filter button to refine your search.
              </p>
            </div>
          )}
          
          {hasSearched && (
            <div className="mt-8">
              <PaperResults
                papers={papers}
                isLoading={isLoading}
                error={error}
              />
            </div>
          )}
        </div>
      </main>
      
      <footer className="py-6 border-t mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          ArXiv Wizard Search | Data provided by{' '}
          <a href="https://arxiv.org/" className="underline" target="_blank" rel="noopener noreferrer">
            arXiv.org
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Index;
