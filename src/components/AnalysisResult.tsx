import React from 'react';

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
    <div className="p-4 bg-slate-50 rounded-md text-sm">
      {processedAnalysis.map((item, index) => (
        <div key={index} className={`${index > 0 ? 'mt-6' : ''}`}>
          <div className="flex gap-2">
            <span className="font-medium text-slate-800">{item.number}</span>
            <h3 className="font-bold text-slate-800">{item.title}</h3>
          </div>
          <div 
            className="mt-1 ml-5 text-slate-700"
            dangerouslySetInnerHTML={{ __html: processInnerContent(item.content) }}
          />
        </div>
      ))}
    </div>
  );
};

// Function to process and format the inner content of each section
function processInnerContent(content: string): string {
  // Process nested bullet points (lines starting with - or *)
  content = content.replace(/^(\s*[-*]\s+)(.*?)$/gm, (match, bullet, text) => {
    return `<div class="flex"><span class="mr-2">${bullet}</span><span>${processBoldItalic(text)}</span></div>`;
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