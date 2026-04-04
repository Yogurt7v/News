import { render, screen, fireEvent } from '@testing-library/react';
import { MediaModal } from './MediaModal';

jest.mock('./FastVideo', () => ({
  FastVideo: ({ src }: { src: string }) => (
    <video data-testid="fast-video" src={src} />
  ),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { alt, fill, unoptimized, priority, sizes, ...rest } = props;
    return <img alt={String(alt)} {...rest} />;
  },
}));

describe('MediaModal', () => {
  const mockMedia = [
    { type: 'photo', url: 'https://example.com/image1.jpg' },
    { type: 'video', url: 'https://example.com/video1.mp4' },
    { type: 'photo', url: 'https://example.com/image2.jpg' },
  ];

  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  test('не рендерит ничего когда media пустой массив', () => {
    const { container } = render(
      <MediaModal media={[]} onClose={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  test('рендерит фото', () => {
    render(
      <MediaModal
        media={[{ type: 'photo', url: 'https://example.com/image.jpg' }]}
        onClose={jest.fn()}
      />
    );

    const img = document.querySelector('img');
    expect(img).toBeInTheDocument();
  });

  test('рендерит видео', () => {
    render(
      <MediaModal
        media={[{ type: 'video', url: 'https://example.com/video.mp4' }]}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByTestId('fast-video')).toBeInTheDocument();
  });

  test('показывает индикатор количества для нескольких медиа', () => {
    render(<MediaModal media={mockMedia} onClose={jest.fn()} />);

    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  test('показывает индикатор даже для одного медиа', () => {
    render(
      <MediaModal
        media={[{ type: 'photo', url: 'https://example.com/image.jpg' }]}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('1 / 1')).toBeInTheDocument();
  });

  test('вызывает onClose при нажатии Escape', () => {
    const onClose = jest.fn();
    render(<MediaModal media={mockMedia} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('вызывает onClose при клике на кнопку закрытия', () => {
    const onClose = jest.fn();
    render(<MediaModal media={mockMedia} onClose={onClose} />);

    const closeButtons = document.querySelectorAll('button');
    closeButtons[0].click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('переключает на следующее медиа при нажатии стрелки вправо', () => {
    render(<MediaModal media={mockMedia} onClose={jest.fn()} />);

    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  test('переключает на предыдущее медиа при нажатии стрелки влево', () => {
    render(<MediaModal media={mockMedia} onClose={jest.fn()} />);

    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  test('циклически переходит с последнего на первый', () => {
    render(<MediaModal media={mockMedia} onClose={jest.fn()} />);

    fireEvent.keyDown(document, { key: 'ArrowRight' });
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  test('циклически переходит с первого на последний', () => {
    render(<MediaModal media={mockMedia} onClose={jest.fn()} />);

    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });
});
