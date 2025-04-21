
// Service for handling arXiv API requests
import { SearchField, BooleanOperator, ArxivPaper } from '@/types/arxiv';

/**
 * Formats the search query according to arXiv API syntax
 * @param keywords The search keywords
 * @param field The field to search in (title, author, abstract, category)
 * @param operator The boolean operator to use (AND, OR)
 * @returns Formatted search query
 */
const formatSearchQuery = (keywords: string, field: SearchField, operator: BooleanOperator): string => {
  // Split keywords by spaces, but respect quoted phrases
  const terms = keywords.match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g) || [];
  
  // Clean up the terms and handle quoted phrases
  const cleanTerms = terms.map(term => term.trim().replace(/^"(.*)"$/, '$1'));
  
  // Format each term according to the field
  const formattedTerms = cleanTerms.map(term => {
    // If the term already contains quotes, preserve them for exact phrase search
    const isExactPhrase = keywords.includes(`"${term}"`);
    
    switch (field) {
      case 'title':
        return `ti:${isExactPhrase ? `"${term}"` : term}`;
      case 'author':
        return `au:${isExactPhrase ? `"${term}"` : term}`;
      case 'abstract':
        return `abs:${isExactPhrase ? `"${term}"` : term}`;
      case 'category':
        return `cat:${term}`;
      default:
        return isExactPhrase ? `"${term}"` : term; // 'all' case
    }
  });
  
  // Join terms with the selected operator
  return formattedTerms.join(` ${operator} `);
};

/**
 * Fetch papers from arXiv API
 * @param query The formatted search query
 * @param maxResults Maximum number of results to return
 * @returns Promise with the search results
 */
const searchPapers = async (query: string, maxResults: number = 10): Promise<ArxivPaper[]> => {
  const baseUrl = 'https://export.arxiv.org/api/query';
  const searchUrl = `${baseUrl}?search_query=${encodeURIComponent(query)}&start=0&max_results=${maxResults}`;
  
  try {
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    // arXiv API returns results as XML
    const xmlText = await response.text();
    
    // Parse XML to extract paper information
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Extract entries from XML
    const entries = xmlDoc.getElementsByTagName('entry');
    const results = Array.from(entries).map(entry => {
      const title = entry.getElementsByTagName('title')[0]?.textContent || '';
      const summary = entry.getElementsByTagName('summary')[0]?.textContent || '';
      const link = Array.from(entry.getElementsByTagName('link')).find(
        link => link.getAttribute('type') === 'text/html'
      )?.getAttribute('href') || '';
      const id = entry.getElementsByTagName('id')[0]?.textContent || '';
      const published = entry.getElementsByTagName('published')[0]?.textContent || '';
      const authors = Array.from(entry.getElementsByTagName('author')).map(
        author => author.getElementsByTagName('name')[0]?.textContent || ''
      );
      
      // Get categories
      const categories = Array.from(entry.getElementsByTagName('category')).map(
        category => category.getAttribute('term') || ''
      );
      
      return {
        title: title.trim(),
        summary: summary.trim(),
        link: link || id.replace('http://', 'https://'),
        published: new Date(published),
        authors,
        categories
      };
    });
    
    return results;
  } catch (error) {
    console.error('Error fetching papers:', error);
    throw error;
  }
};

export { formatSearchQuery, searchPapers };
