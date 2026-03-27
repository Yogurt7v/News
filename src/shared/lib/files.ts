type RecordWithFile = {
  id: string;
  collectionId?: string;
  collectionName?: string;
};

type FileField = {
  id?: string;
  file: string;
};

export function getFileUrl(
  record: RecordWithFile,
  field: FileField | string
): string {
  const filename = typeof field === 'string' ? field : field.file;
  const collectionName = record.collectionName || 'unknown';
  const recordId = record.id;

  return `/api/files/${collectionName}/${recordId}/${filename}`;
}
