import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Download, Edit, Link, Globe } from 'lucide-react';
import { ArxivPaper } from '@/types/arxiv';
import { useNavigate } from 'react-router-dom';

interface PaperResultsProps {
  papers: ArxivPaper[];
  isLoading: boolean;
  error: string | null;
  isUrlMode?: boolean;
}

const PaperResults: React.FC<PaperResultsProps> = ({ papers, isLoading, error, isUrlMode = false }) => {
  const navigate = useNavigate();
  
  const getPdfLink = (arxivLink: string) => {
    if (isUrlMode) return arxivLink; // For URL mode, the link is already the PDF URL
    
    // For arXiv mode, extract the ID and construct the PDF link
    const arxivId = arxivLink.split('/abs/').pop();
    if (!arxivId) return null;
    return `https://arxiv.org/pdf/${arxivId}.pdf`;
  };

  const handlePdfClick = (paper: ArxivPaper) => {
    const pdfLink = getPdfLink(paper.link);
    console.debug('Paper PDF accessed:', {
      title: paper.title,
      pdfUrl: pdfLink
    });
  };

  const navigateToEditor = (paper: ArxivPaper) => {
    let arxivId;
    let pdfUrl = getPdfLink(paper.link);
    
    if (isUrlMode) {
      // For URL mode, we'll use the URL itself as the ID (encoded)
      arxivId = encodeURIComponent(paper.link);
    } else {
      // For arXiv mode, extract the ID from the link
      arxivId = paper.link.split('/abs/').pop();
    }
    
    if (arxivId) {
      navigate(`/pdf-editor/${arxivId}`, { 
        state: { 
          paper, 
          pdfUrl
        }
      });
    }
  };
  
  const downloadPdf = async (paper: ArxivPaper) => {
    const pdfLink = getPdfLink(paper.link);
    if (!pdfLink) return;
    
    try {
      // Create a safe filename from the paper title
      const fileName = `${paper.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.pdf`;
      
      // Create an anchor element and trigger download
      const link = document.createElement('a');
      link.href = pdfLink;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.debug('Paper PDF downloaded:', {
        title: paper.title,
        fileName,
        pdfUrl: pdfLink
      });
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
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
        <Badge variant="outline">{papers.length} {isUrlMode ? 'URL' : 'papers'} found</Badge>
      </div>
      
      <ScrollArea className="h-[65vh]">
        <div className="space-y-6">
          {papers.map((paper, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium leading-tight group">
                  {isUrlMode && <Globe className="inline-block mr-2 h-4 w-4" />}
                  {paper.title}
                  <div className="text-xs text-muted-foreground mt-1">
                    {isUrlMode ? (
                      <span className="flex items-center">
                        <Link className="h-3 w-3 mr-1" />
                        {paper.link}
                      </span>
                    ) : (
                      `Published: ${paper.published.toLocaleDateString()}`
                    )}
                  </div>
                </CardTitle>
                {!isUrlMode && (
                  <p className="text-sm text-muted-foreground">
                    {paper.authors.join(', ')}
                  </p>
                )}
                {!isUrlMode && paper.categories?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {paper.categories.map((category, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary" 
                        className="text-xs hover:bg-secondary/80 transition-colors"
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <p className="text-sm line-clamp-4 text-muted-foreground">
                  {paper.summary}
                </p>
              </CardContent>
              <CardFooter className="flex flex-wrap justify-end gap-2 pt-2">
                {!isUrlMode && (
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
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5"
                  onClick={() => downloadPdf(paper)}
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="gap-1.5"
                  onClick={() => navigateToEditor(paper)}
                >
                  <Edit className="h-4 w-4" />
                  Go to Editor
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