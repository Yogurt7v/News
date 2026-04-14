type MediaItem = {
  id?: string;
  file: string;
  type?: string;
  order?: number;
};

export function getFileUrl(
  collection: string,
  recordId: string,
  filename: string
): string {
  const pocketbaseUrl =
    process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://5.53.125.238:8090';
  return `${pocketbaseUrl}/api/files/${collection}/${recordId}/${filename}`;
}

export function getMediaFileUrl(
  media: MediaItem,
  newsId?: string
): string {
  if (!media.file) return '/placeholder-image';

  const pocketbaseUrl =
    process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://5.53.125.238:8090';

  if (media.file.startsWith('http')) {
    return media.file;
  }

  if (media.file.startsWith('/api/files/')) {
    return `${pocketbaseUrl}${media.file}`;
  }

  const recordId = media.id || newsId;
  if (!recordId) {
    console.warn('getMediaFileUrl: no record ID provided');
    return '/placeholder-image';
  }
  return `${pocketbaseUrl}/api/files/media/${recordId}/${media.file}`;
}

export function getAvatarUrl(
  subscriptionId: string,
  avatarFilename: string
): string {
  if (!avatarFilename) return '';
  const pocketbaseUrl =
    process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://5.53.125.238:8090';
  return `${pocketbaseUrl}/api/files/subscriptions/${subscriptionId}/${avatarFilename}`;
}
