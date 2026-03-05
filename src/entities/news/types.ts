import { news, media } from '@/db/schema';

export type NewsWithMedia = typeof news.$inferSelect & {
  media: (typeof media.$inferSelect)[];
};
