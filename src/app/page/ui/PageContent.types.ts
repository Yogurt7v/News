export interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  url: string;
  imageUrl?: string;
  publishedAt?: string;
  expand?: Record<string, unknown>;
  media?: Array<{
    type: string;
    file: string;
    order?: number;
    id: string;
  }>;
  [key: string]: unknown;
}

export interface PageContentProps {
  title: string;
  statsText?: string;
  showHint: boolean;
  hasSubscriptions: boolean;
  news: NewsItem[];
  isAdmin?: boolean;
}
