// src/components/PdfViewer.tsx
import React, { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';

// Import the worker directly instead of using CDN
import pdfWorker from 'pdfjs-dist/build/pdf.worker.entry';

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfViewerProps {
  url: string;
  onSelectionChange?: (text: string) => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url, onSelectionChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfViewerRef = useRef<any>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Load and render the PDF
    const loadPdf = async () => {
      try {
        console.log("Loading PDF from URL:", url);
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        console.log("PDF loaded successfully, pages:", pdf.numPages);
        
        // Create a viewer div
        const viewer = document.createElement('div');
        viewer.className = 'pdfViewer';
        containerRef.current.appendChild(viewer);
        
        // Render each page
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          console.log(`Rendering page ${pageNum}/${pdf.numPages}`);
          const page = await pdf.getPage(pageNum);
          const pageDiv = document.createElement('div');
          pageDiv.className = 'page';
          pageDiv.dataset.pageNumber = String(pageNum);
          viewer.appendChild(pageDiv);
          
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          pageDiv.appendChild(canvas);
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const renderContext = {
              canvasContext: ctx,
              viewport: viewport
            };
            
            await page.render(renderContext).promise;
            
            // Add the text layer for selection
            const textContent = await page.getTextContent();
            const textLayer = document.createElement('div');
            textLayer.className = 'textLayer';
            pageDiv.appendChild(textLayer);
            
            pdfjsLib.renderTextLayer({
              textContent: textContent,
              container: textLayer,
              viewport: viewport,
              textDivs: []
            });
          }
        }
        
        // Handle text selection events
        if (onSelectionChange) {
          viewer.addEventListener('mouseup', () => {
            const selection = window.getSelection();
            if (selection && !selection.isCollapsed) {
              onSelectionChange(selection.toString());
            }
          });
        }
        
        pdfViewerRef.current = viewer;
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };
    
    loadPdf();
    
    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [url, onSelectionChange]);
  
  return (
    <div 
      ref={containerRef} 
      className="pdfViewerContainer overflow-auto flex-1"
      style={{ position: 'relative', height: '100%', minHeight: '75vh' }}
    />
  );
};

export default PdfViewer;