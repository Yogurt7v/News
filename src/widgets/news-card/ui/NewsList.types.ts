export interface NewsListProps {
  initialNews: Array<{
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
      thumbnailUrl?: string;
    }>;
    [key: string]: unknown;
  }>;
}
