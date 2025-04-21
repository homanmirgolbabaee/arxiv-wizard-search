
export interface ArxivPaper {
  title: string;
  summary: string;
  link: string;
  published: Date;
  authors: string[];
  categories?: string[];
}

export type SearchField = 'all' | 'title' | 'author' | 'abstract' | 'category';
export type BooleanOperator = 'AND' | 'OR';
