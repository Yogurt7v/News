import { render, screen } from '@testing-library/react';
import { FastVideo } from './FastVideo';

(
  global as unknown as { IntersectionObserver: unknown }
).IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
};

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { src: string; alt: string }) => <img {...props} />,
}));

describe('FastVideo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('рендерит video элемент', () => {
    render(<FastVideo src="https://example.com/video.mp4" lazy={false} />);

    const videos = document.querySelectorAll('video');
    expect(videos.length).toBeGreaterThanOrEqual(1);
  });

  test('применяет переданный className', () => {
    render(
      <FastVideo
        src="https://example.com/video.mp4"
        className="test-class"
        lazy={false}
      />
    );

    const container = document.querySelector('.test-class');
    expect(container).toBeInTheDocument();
  });

  test('рендерит с poster', () => {
    render(
      <FastVideo
        src="https://example.com/video.mp4"
        poster="https://example.com/poster.jpg"
        lazy={false}
      />
    );

    const videos = document.querySelectorAll('video');
    expect(videos.length).toBeGreaterThanOrEqual(1);
  });
});
