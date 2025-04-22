import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Copy, CheckCircle2, Bot, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { analyzeText } from '@/services/textAnalysisService';

interface TextAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
}

const TextAnalyzer: React.FC<TextAnalyzerProps> = ({ isOpen, onClose }) => {
  const [selectedText, setSelectedText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!selectedText.trim()) {
      toast.error('Please select or paste some text first');
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeText(selectedText);
      setAnalysisResult(result.analysis);
      toast.success('Analysis completed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Analysis failed: ${errorMessage}`);
      console.error('Analysis error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        toast.error('Failed to copy: ' + err.message);
      });
  };

  // Use browser's copy functionality to get text from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setSelectedText(text);
      toast.success('Text pasted from clipboard');
    } catch (error) {
      toast.error('Could not access clipboard. Please paste text manually.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[calc(100vh-2rem)] flex flex-col relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Text Analyzer
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-auto grid gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Selected Text</label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePasteFromClipboard} 
                className="h-8 text-xs"
              >
                Paste from Clipboard
              </Button>
            </div>
            <Textarea 
              value={selectedText} 
              onChange={(e) => setSelectedText(e.target.value)}
              placeholder="Paste or type the text you want to analyze..."
              className="min-h-[120px]"
            />
          </div>
          
          {analysisResult && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Analysis Result</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(analysisResult)}
                  className="h-8 flex items-center gap-1.5 text-xs"
                >
                  {copied ? 
                    <><CheckCircle2 className="h-3.5 w-3.5" /> Copied</> : 
                    <><Copy className="h-3.5 w-3.5" /> Copy</>
                  }
                </Button>
              </div>
              <div className="p-4 bg-muted rounded-md whitespace-pre-wrap text-sm">
                {analysisResult}
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end gap-2 border-t p-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            onClick={handleAnalyze} 
            disabled={isLoading || !selectedText.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>Analyze Text</>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TextAnalyzer;