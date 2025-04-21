
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { formatSearchQuery } from '@/services/arxivService';
import { SearchField, BooleanOperator } from '@/types/arxiv';
import { HelpTooltip } from './HelpTooltip';

interface SearchFormProps {
  onSearch: (query: string, maxResults: number) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [keywords, setKeywords] = useState('');
  const [field, setField] = useState<SearchField>('all');
  const [operator, setOperator] = useState<BooleanOperator>('AND');
  const [maxResults, setMaxResults] = useState('10');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keywords.trim() === '') return;
    
    const formattedQuery = formatSearchQuery(keywords, field, operator);
    onSearch(formattedQuery, parseInt(maxResults));
  };

  return (
    <Card className="p-6 shadow-md bg-white">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">ArXiv Paper Search</h2>
          <p className="text-sm text-gray-600 mb-4">
            Search for research papers across various scientific disciplines.
          </p>
        </div>
        
        {/* Keywords input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="keywords">Search Keywords</Label>
            <HelpTooltip content={
              <div className="space-y-2 text-sm">
                <p>Examples:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Simple search: machine learning</li>
                  <li>Exact phrase: "deep learning"</li>
                  <li>Multiple terms: quantum AND computing</li>
                </ul>
              </div>
            }>
              Search syntax
            </HelpTooltip>
          </div>
          <Input
            id="keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder='Example: "quantum computing" OR "machine learning"'
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Use quotes for exact phrase search. Example: "neural networks"
          </p>
        </div>
        
        {/* Search options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Field selection */}
          <div className="space-y-2">
            <Label htmlFor="field">Search In</Label>
            <Select 
              value={field} 
              onValueChange={(value: string) => setField(value as SearchField)}>
              <SelectTrigger>
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="author">Author</SelectItem>
                <SelectItem value="abstract">Abstract</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select where to search for your keywords
            </p>
          </div>
          
          {/* Results count */}
          <div className="space-y-2">
            <Label htmlFor="maxResults">Max Results</Label>
            <Select value={maxResults} onValueChange={setMaxResults}>
              <SelectTrigger>
                <SelectValue placeholder="Number of results" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 results</SelectItem>
                <SelectItem value="10">10 results</SelectItem>
                <SelectItem value="25">25 results</SelectItem>
                <SelectItem value="50">50 results</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Number of papers to display
            </p>
          </div>
        </div>
        
        {/* Boolean operator toggle */}
        <div className="flex items-center space-x-4">
          <Label htmlFor="operator">Boolean Operator:</Label>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${operator === 'AND' ? 'text-primary' : 'text-muted-foreground'}`}>AND</span>
            <Switch
              id="operator"
              checked={operator === 'OR'}
              onCheckedChange={(checked) => setOperator(checked ? 'OR' : 'AND')}
            />
            <span className={`text-sm font-medium ${operator === 'OR' ? 'text-primary' : 'text-muted-foreground'}`}>OR</span>
          </div>
          <p className="text-xs text-muted-foreground">
            AND: All terms must match; OR: Any term can match
          </p>
        </div>
        
        {/* Search button */}
        <Button 
          type="submit" 
          className="w-full"
          disabled={keywords.trim() === ''}
        >
          Search ArXiv
        </Button>
      </form>
    </Card>
  );
};

export default SearchForm;
