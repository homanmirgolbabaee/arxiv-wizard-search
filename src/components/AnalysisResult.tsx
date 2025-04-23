import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import TtsControls from './TtsControls';
import { prepareTtsText } from '@/services/textToSpeechService';

interface AnalysisResultProps {
  analysis: string | null;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>Analysis will appear here</p>
      </div>
    );
  }

  // Process the analysis text to enhance formatting
  const processedAnalysis = formatAnalysisText(analysis);

  return (
    <div className="space-y-2">
      {processedAnalysis.map((item, index) => (
        <ExpandableSection
          key={index} 
          number={item.number}
          title={item.title}
          content={item.content}
          fullText={prepareTtsText(item.content)}
          isInitiallyExpanded={index === 0} // First item expanded by default
        />
      ))}
    </div>
  );
};

interface ExpandableSectionProps {
  number: string;
  title: string;
  content: string;
  fullText: string; // Plain text for TTS
  isInitiallyExpanded?: boolean;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({ 
  number, 
  title, 
  content,
  fullText,
  isInitiallyExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);

  return (
    <div className="rounded-md overflow-hidden border border-slate-200 bg-white">
      <div className="px-4 py-3 flex items-start gap-2">
        <button 
          className="flex-shrink-0 mt-0.5 text-slate-500 hover:text-slate-700 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        
        <div className="flex-1 flex justify-between items-start">
          <button 
            className="flex gap-2 text-left hover:text-slate-900 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="font-medium text-slate-800">{number}</span>
            <h3 className="font-bold text-slate-800">{title}</h3>
          </button>
          
          <TtsControls 
            text={`${title}. ${fullText}`} 
            tooltipText={`Listen to ${title}`}
            className="ml-2 flex-shrink-0"
          />
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 pt-1">
          <div className="ml-6 pl-4 border-l border-slate-200">
            <div 
              className="text-slate-700 text-sm"
              dangerouslySetInnerHTML={{ __html: processInnerContent(content) }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Function to process and format the inner content of each section
function processInnerContent(content: string): string {
  // Process nested bullet points (lines starting with - or *)
  content = content.replace(/^(\s*[-*]\s+)(.*?)$/gm, (match, bullet, text) => {
    return `<div class="flex py-1"><span class="mr-2 flex-shrink-0">${bullet}</span><span>${processBoldItalic(text)}</span></div>`;
  });
  
  // Process any remaining content that isn't part of a bullet point
  const lines = content.split('\n');
  const processedLines = lines.map(line => {
    // Skip lines that we've already processed as bullet points
    if (line.trim().startsWith('<div class="flex">')) {
      return line;
    }
    return processBoldItalic(line);
  });
  
  return processedLines.join('<br/>');
}

// Process bold and italic markdown in text
function processBoldItalic(text: string): string {
  // Process bold text (**text**)
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Process italic text (*text*)
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  return text;
}

// Helper function to format the analysis text into sections
function formatAnalysisText(text: string) {
  // Split by numbered sections (e.g., "1. **Title**:")
  const sections = text.split(/(\d+\.\s+\*\*[^*]+\*\*:?)/);
  
  const processedItems = [];
  
  for (let i = 1; i < sections.length; i += 2) {
    if (i + 1 < sections.length) {
      const heading = sections[i];
      const content = sections[i + 1];
      
      // Extract number (e.g., "1.")
      const numberMatch = heading.match(/(\d+)\./);
      const number = numberMatch ? numberMatch[1] + '.' : '';
      
      // Extract title (between ** **) 
      const titleMatch = heading.match(/\*\*([^*]+)\*\*/);
      const title = titleMatch ? titleMatch[1] : heading;
      
      processedItems.push({
        number,
        title,
        content: content.trim()
      });
    }
  }
  
  // Handle case where parsing might fail
  if (processedItems.length === 0) {
    // Fallback to simple formatting
    return [{
      number: '',
      title: '',
      content: text
    }];
  }
  
  return processedItems;
}

export default AnalysisResult;