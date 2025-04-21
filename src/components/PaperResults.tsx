
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

import { ArxivPaper } from '@/types/arxiv';

interface PaperResultsProps {
  papers: ArxivPaper[];
  isLoading: boolean;
  error: string | null;
}

const PaperResults: React.FC<PaperResultsProps> = ({ papers, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="animate-pulse h-6 w-1/2 bg-muted rounded mb-4"></div>
        <div className="animate-pulse h-24 w-full bg-muted rounded mb-2"></div>
        <div className="animate-pulse h-24 w-full bg-muted rounded mb-2"></div>
        <div className="animate-pulse h-24 w-full bg-muted rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <p className="mt-2">Please try again with a different query.</p>
        </CardContent>
      </Card>
    );
  }

  if (papers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No papers match your search criteria. Try adjusting your search terms.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Search Results</h2>
        <Badge variant="outline">{papers.length} papers found</Badge>
      </div>
      
      <ScrollArea className="h-[65vh]">
        <div className="space-y-6">
          {papers.map((paper, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium leading-tight">{paper.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {paper.authors.join(', ')}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {paper.categories?.map((category, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Published: {paper.published.toLocaleDateString()}
                </p>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <p className="text-sm line-clamp-4">{paper.summary}</p>
              </CardContent>
              <CardFooter className="flex justify-end pt-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={paper.link} target="_blank" rel="noopener noreferrer">
                    View on arXiv
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PaperResults;
