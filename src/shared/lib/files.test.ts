import { getFileUrl, getMediaFileUrl, getAvatarUrl } from './files';

describe('files.ts', () => {
  describe('getFileUrl', () => {
    test('возвращает корректный URL для файла', () => {
      const result = getFileUrl('posts', 'rec123', 'image.jpg');
      expect(result).toBe('/api/files/posts/rec123/image.jpg');
    });

    test('работает с разными коллекциями', () => {
      expect(getFileUrl('avatars', 'user1', 'photo.png')).toBe(
        '/api/files/avatars/user1/photo.png'
      );
      expect(getFileUrl('media', 'news5', 'video.mp4')).toBe(
        '/api/files/media/news5/video.mp4'
      );
    });

    test('обрабатывает специальные символы в имени файла', () => {
      const result = getFileUrl('files', 'rec123', 'file%20name.jpg');
      expect(result).toBe('/api/files/files/rec123/file%20name.jpg');
    });
  });

  describe('getMediaFileUrl', () => {
    test('возвращает URL с id из media', () => {
      const media = { id: 'media123', file: 'photo.jpg' };
      const result = getMediaFileUrl(media);
      expect(result).toBe('/api/files/media/media123/photo.jpg');
    });

    test('возвращает URL с newsId когда id отсутствует', () => {
      const media = { file: 'photo.jpg' };
      const result = getMediaFileUrl(media, 'news456');
      expect(result).toBe('/api/files/media/news456/photo.jpg');
    });

    test('возвращает placeholder когда нет id и newsId', () => {
      const media = { file: 'photo.jpg' };
      const warnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});
      const result = getMediaFileUrl(media);
      expect(result).toBe('/placeholder-image');
      warnSpy.mockRestore();
    });

    test('id имеет приоритет над newsId', () => {
      const media = { id: 'media789', file: 'image.png' };
      const result = getMediaFileUrl(media, 'news123');
      expect(result).toBe('/api/files/media/media789/image.png');
    });
  });

  describe('getAvatarUrl', () => {
    test('возвращает корректный URL для аватара', () => {
      const result = getAvatarUrl('sub123', 'avatar.jpg');
      expect(result).toBe('/api/files/subscriptions/sub123/avatar.jpg');
    });

    test('возвращает пустую строку когда avatarFilename пустой', () => {
      expect(getAvatarUrl('sub123', '')).toBe('');
      expect(getAvatarUrl('sub123', undefined as unknown as string)).toBe(
        ''
      );
    });

    test('работает с разными subscriptionId', () => {
      expect(getAvatarUrl('chan1', 'pic.png')).toBe(
        '/api/files/subscriptions/chan1/pic.png'
      );
      expect(getAvatarUrl('channel_abc', 'photo.jpeg')).toBe(
        '/api/files/subscriptions/channel_abc/photo.jpeg'
      );
    });
  });
});
