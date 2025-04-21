import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Download } from 'lucide-react';
import { ArxivPaper } from '@/types/arxiv';

interface PaperResultsProps {
  papers: ArxivPaper[];
  isLoading: boolean;
  error: string | null;
}

const PaperResults: React.FC<PaperResultsProps> = ({ papers, isLoading, error }) => {
  const getPdfLink = (arxivLink: string) => {
    const arxivId = arxivLink.split('/abs/').pop();
    if (!arxivId) return null;
    return `https://arxiv.org/pdf/${arxivId}.pdf`;
  };

  const handlePdfClick = (paper: ArxivPaper) => {
    const pdfLink = getPdfLink(paper.link);
    console.debug('Paper PDF accessed:', {
      title: paper.title,
      arxivId: paper.link.split('/abs/').pop(),
      pdfUrl: pdfLink
    });
  };

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
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium leading-tight group">
                  {paper.title}
                  <div className="text-xs text-muted-foreground mt-1">
                    Published: {paper.published.toLocaleDateString()}
                  </div>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {paper.authors.join(', ')}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {paper.categories?.map((category, idx) => (
                    <Badge 
                      key={idx} 
                      variant="secondary" 
                      className="text-xs hover:bg-secondary/80 transition-colors"
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <p className="text-sm line-clamp-4 text-muted-foreground">
                  {paper.summary}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                  className="gap-1.5"
                >
                  <a href={paper.link} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4" />
                    View on arXiv
                  </a>
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  asChild
                  className="gap-1.5"
                  onClick={() => handlePdfClick(paper)}
                >
                  <a 
                    href={getPdfLink(paper.link) || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
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
