import { render, screen } from '@testing-library/react';
import { NewsCard } from './NewsCard';

jest.mock('@/shared/ui/MediaModal', () => ({
  MediaModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="media-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

jest.mock('@/shared/ui/FastVideo', () => ({
  FastVideo: ({ src }: { src: string }) => (
    <video data-testid="fast-video" src={src} />
  ),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { alt, fill, unoptimized, priority, sizes, loading, ...rest } =
      props;
    return <img alt={String(alt)} {...rest} />;
  },
}));

jest.mock('@/shared/lib/files', () => ({
  getMediaFileUrl: (media: { file: string }) =>
    `/api/files/media/${media.file}`,
}));

describe('NewsCard', () => {
  const mockNews = {
    id: 'news-1',
    title: 'Test News Title',
    content: 'Test news content',
    source: 'Test Source',
    channelTitle: 'Test Channel',
    url: 'https://example.com/news',
    publishedAt: '2024-03-15T14:30:00Z',
    media: [{ type: 'image', file: 'image.jpg', id: 'media-1' }],
  };

  test('рендерит заголовок новости', () => {
    render(<NewsCard news={mockNews} />);
    expect(screen.getByText(/Test News Title/)).toBeInTheDocument();
  });

  test('рендерит контент новости', () => {
    render(<NewsCard news={mockNews} />);
    expect(screen.getByText(/Test news content/)).toBeInTheDocument();
  });

  test('рендерит название канала', () => {
    render(<NewsCard news={mockNews} />);
    expect(screen.getByText('Test Channel')).toBeInTheDocument();
  });

  test('использует source когда channelTitle пустой', () => {
    const newsWithoutChannel = { ...mockNews, channelTitle: '' };
    render(<NewsCard news={newsWithoutChannel} />);
    expect(screen.getByText('Test Source')).toBeInTheDocument();
  });

  test('не рендерит дату когда publishedAt не указан', () => {
    const newsWithoutDate = { ...mockNews, publishedAt: undefined };
    render(<NewsCard news={newsWithoutDate} />);

    const timeElement = document.querySelector('time');
    expect(timeElement).not.toBeInTheDocument();
  });

  test('не рендерит медиа когда его нет', () => {
    const newsWithoutMedia = { ...mockNews, media: undefined };
    render(<NewsCard news={newsWithoutMedia} />);

    const mediaContainer = document.querySelector('.aspect-video');
    expect(mediaContainer).not.toBeInTheDocument();
  });

  test('рендерит видео когда тип медиа video', () => {
    const newsWithVideo = {
      ...mockNews,
      media: [{ type: 'video', file: 'video.mp4', id: 'media-1' }],
    };
    render(<NewsCard news={newsWithVideo} />);

    expect(screen.getByTestId('fast-video')).toBeInTheDocument();
  });
});
