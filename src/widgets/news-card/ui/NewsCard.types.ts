export interface NewsCardProps {
  news: {
    id: string;
    title: string;
    content: string;
    source: string;
    channelTitle?: string;
    url: string;
    imageUrl?: string;
    publishedAt?: string;
    expand?: Record<string, unknown>;
    media?: Array<{
      type: string;
      file: string;
      thumbnail?: string;
      order?: number;
      id: string;
    }>;
    [key: string]: unknown;
  };
}
