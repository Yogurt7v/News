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
  return `/api/files/${collection}/${recordId}/${filename}`;
}

export function getMediaFileUrl(
  media: MediaItem,
  newsId?: string
): string {
  const recordId = media.id || newsId;
  if (!recordId) {
    console.warn('getMediaFileUrl: no record ID provided');
    return '/placeholder-image';
  }
  return `/api/files/media/${recordId}/${media.file}`;
}

export function getAvatarUrl(
  subscriptionId: string,
  avatarFilename: string
): string {
  if (!avatarFilename) return '';
  return `/api/files/subscriptions/${subscriptionId}/${avatarFilename}`;
}
