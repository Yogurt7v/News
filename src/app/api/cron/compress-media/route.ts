import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/shared/lib/pocketbase-admin';
import { unlink } from 'fs/promises';
import { join } from 'path';
import os from 'os';

const CRON_SECRET =
  process.env.CRON_SECRET || process.env.NEXT_PUBLIC_CRON_SECRET;

interface CompressRequestBody {
  limit?: number;
  priority?: 'video' | 'photo';
}

async function compressImage(
  inputPath: string,
  outputPath: string
): Promise<boolean> {
  try {
    const sharp = (await import('sharp')).default;
    await sharp(inputPath)
      .jpeg({ quality: 80 })
      .png({ compressionLevel: 9 })
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error('Image compress error:', error);
    return false;
  }
}

async function compressVideo(
  inputPath: string,
  outputPath: string
): Promise<boolean> {
  try {
    const ffmpeg = (await import('fluent-ffmpeg')).default;

    return new Promise((resolve) => {
      ffmpeg(inputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions(['-preset fast', '-crf 28', '-movflags +faststart'])
        .output(outputPath)
        .on('end', () => resolve(true))
        .on('error', (err) => {
          console.error('Video compress error:', err);
          resolve(false);
        })
        .run();
    });
  } catch (error) {
    console.error('FFmpeg error:', error);
    return false;
  }
}

async function safeUnlink(path: string) {
  try {
    await unlink(path);
  } catch {}
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');

  if (token !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: CompressRequestBody = {};
  try {
    body = await request.json();
  } catch {}

  const limit = body.limit || 5;
  const priority = body.priority || 'video';

  try {
    const pb = await createAdminClient();

    const filter =
      priority === 'video'
        ? 'isCompressed = false && type = "video"'
        : 'isCompressed = false';

    const uncompressedMedia = await pb.collection('media').getFullList({
      filter,
      sort: '+created',
      limit,
    });

    if (uncompressedMedia.length === 0) {
      const photoMedia = await pb.collection('media').getFullList({
        filter: 'isCompressed = false && type = "photo"',
        sort: '+created',
        limit,
      });

      if (photoMedia.length === 0) {
        return NextResponse.json({
          message: 'No media to compress',
          processed: 0,
        });
      }
    }

    const pbUrl = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
    let processed = 0;
    let errors = 0;

    for (const media of uncompressedMedia) {
      const inputFileName = media.file;
      const inputPath = join(os.tmpdir(), inputFileName);
      const outputFileName = `compressed_${inputFileName}`;
      const outputPath = join(os.tmpdir(), outputFileName);

      try {
        const fileUrl = `${pbUrl}/api/files/media/${media.id}/${inputFileName}`;
        const response = await fetch(fileUrl);

        if (!response.ok) {
          errors++;
          continue;
        }

        const buffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);

        const { writeFile } = await import('fs/promises');
        await writeFile(inputPath, uint8Array);

        const isVideo = media.type === 'video';
        let success = false;

        if (isVideo) {
          success = await compressVideo(inputPath, outputPath);
        } else {
          success = await compressImage(inputPath, outputPath);
        }

        if (success) {
          const { readFile } = await import('fs/promises');
          const outputBuffer = await readFile(outputPath);

          const formData = new FormData();
          const blob = new Blob([outputBuffer], {
            type: isVideo ? 'video/mp4' : 'image/jpeg',
          });
          formData.append('file', blob, outputFileName);

          await pb.collection('media').update(media.id, {
            file: outputFileName,
            isCompressed: true,
          });

          processed++;
        } else {
          errors++;
        }

        await safeUnlink(inputPath);
        await safeUnlink(outputPath);

        await pb.collection('media').update(media.id, {
          isCompressed: true,
        });
      } catch (e) {
        console.error(`Error processing media ${media.id}:`, e);
        errors++;
        await safeUnlink(inputPath);
        await safeUnlink(outputPath);
      }
    }

    return NextResponse.json({
      message: 'Compress completed',
      processed,
      errors,
      total: uncompressedMedia.length,
    });
  } catch (error) {
    console.error('Compress error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
