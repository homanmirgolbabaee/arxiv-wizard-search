import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Search, SlidersHorizontal, Globe, FileText } from 'lucide-react';
import { formatSearchQuery } from '@/services/arxivService';
import { SearchField, BooleanOperator } from '@/types/arxiv';
import { toast } from 'sonner';

interface SearchFormProps {
  onSearch: (query: string, maxResults: number) => void;
  placeholder?: string;
  hideAdvanced?: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ 
  onSearch, 
  placeholder = 'Search arXiv papers...', 
  hideAdvanced = false 
}) => {
  const [keywords, setKeywords] = useState('');
  const [field, setField] = useState<SearchField>('all');
  const [operator, setOperator] = useState<BooleanOperator>('AND');
  const [maxResults, setMaxResults] = useState('10');
  const [isOpen, setIsOpen] = useState(false);

  const validateUrl = (url: string) => {
    try {
      // Simple check if the input appears to be a URL
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keywords.trim() === '') return;
    
    // If in URL mode, validate the URL
    if (hideAdvanced) {
      if (!validateUrl(keywords)) {
        toast.error("Please enter a valid URL");
        return;
      }
      
      // If URL doesn't start with http:// or https://, add https://
      let processedUrl = keywords.trim();
      if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
        processedUrl = 'https://' + processedUrl;
      }
      
      onSearch(processedUrl, parseInt(maxResults));
    } else {
      // Regular arXiv search
      const formattedQuery = formatSearchQuery(keywords, field, operator);
      onSearch(formattedQuery, parseInt(maxResults));
    }
  };

  return (
    <Card className="p-6 shadow-md bg-white">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Search Bar */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder={placeholder}
              className="pr-10 h-12"
            />
            {hideAdvanced ? (
              <Globe className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            ) : (
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            )}
          </div>
          
          {!hideAdvanced && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-12 w-12 shrink-0"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-4 space-y-4">
                {/* Advanced Search Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="field">Search In</Label>
                    <Select value={field} onValueChange={(value: string) => setField(value as SearchField)}>
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxResults">Results to Show</Label>
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
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Label htmlFor="operator">Match Type:</Label>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${operator === 'AND' ? 'text-primary' : 'text-muted-foreground'}`}>All Terms</span>
                    <Switch
                      id="operator"
                      checked={operator === 'OR'}
                      onCheckedChange={(checked) => setOperator(checked ? 'OR' : 'AND')}
                    />
                    <span className={`text-sm font-medium ${operator === 'OR' ? 'text-primary' : 'text-muted-foreground'}`}>Any Term</span>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          <Button 
            type="submit" 
            className="h-12 px-6"
            disabled={keywords.trim() === ''}
          >
            Search
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default SearchForm;