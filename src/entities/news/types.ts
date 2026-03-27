export interface NewsMedia {
  id: string;
  newsId: string;
  type: string;
  file: string;
  order: number;
}

export interface News {
  id: string;
  title: string;
  content: string;
  source: string;
  url: string;
  publishedAt: string;
  createdAt: string;
}

export interface NewsWithMedia extends News {
  media: NewsMedia[];
}
