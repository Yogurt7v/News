'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface FastVideoProps {
  src: string;
  className?: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  controls?: boolean;
  lazy?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

const MAX_RETRIES = 5;
const RETRY_DELAY = 1500;

export function FastVideo({
  src,
  className = '',
  poster,
  autoPlay = false,
  muted = true,
  playsInline = true,
  controls = false,
  lazy = true,
  onLoad,
  onError,
}: FastVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const thumbnailVideoRef = useRef<HTMLVideoElement>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(poster || '');
  const [isThumbnailReady, setIsThumbnailReady] = useState(!!poster);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldLoad, setShouldLoad] = useState(!lazy);
  const [videoError, setVideoError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [key, setKey] = useState(0);

  const handleRetry = useCallback(() => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount((prev) => prev + 1);
      setVideoError(false);
      setIsLoading(true);
      setKey((prev) => prev + 1);
    }
  }, [retryCount]);

  const handleFallback = useCallback(() => {
    setVideoError(true);
    setIsLoading(false);
    onError?.();
  }, [onError]);

  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, [lazy]);

  useEffect(() => {
    if (!thumbnailVideoRef.current || poster) return;

    const video = thumbnailVideoRef.current;
    let cancelled = false;

    const generateThumbnail = async () => {
      if (video.readyState < 1) {
        await new Promise<void>((resolve) => {
          video.addEventListener('loadedmetadata', () => resolve(), {
            once: true,
          });
        });
      }

      if (cancelled || video.readyState < 1) return;

      video.currentTime = 0.1;

      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          resolve();
        };
        video.addEventListener('seeked', onSeeked);
      });

      if (cancelled) return;

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob && !cancelled) {
            const url = URL.createObjectURL(blob);
            setThumbnailUrl(url);
            setIsThumbnailReady(true);
            setIsLoading(false);
          }
        },
        'image/jpeg',
        0.8
      );
    };

    if (video.readyState >= 1) {
      generateThumbnail();
    } else {
      video.addEventListener('loadedmetadata', generateThumbnail, {
        once: true,
      });
    }

    return () => {
      cancelled = true;
      if (thumbnailUrl && thumbnailUrl.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailUrl);
      }
    };
  }, [src, poster]);

  return (
    <div className={`relative ${className}`}>
      <video
        key={`thumb-${key}`}
        ref={thumbnailVideoRef}
        src={src}
        preload="metadata"
        className="hidden"
        aria-hidden="true"
      />
      {isLoading && !isThumbnailReady && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {videoError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
          {thumbnailUrl ? (
            <>
              <Image
                src={thumbnailUrl}
                alt="Video preview"
                fill
                className="object-contain opacity-50"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium backdrop-blur-sm transition-colors"
                >
                  Попробовать ещё раз
                </button>
              </div>
            </>
          ) : (
            <span className="text-sm">Ошибка загрузки видео</span>
          )}
        </div>
      )}
      <video
        key={`video-${key}`}
        ref={videoRef}
        src={shouldLoad ? src : undefined}
        poster={!videoError ? thumbnailUrl || undefined : undefined}
        autoPlay={autoPlay}
        muted={muted}
        playsInline={playsInline}
        controls={controls}
        preload={lazy ? 'none' : 'metadata'}
        className="w-full h-full object-contain"
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => {
          setIsLoading(false);
          setRetryCount(0);
          onLoad?.();
        }}
        onLoadedMetadata={() => {
          if (!poster && !thumbnailUrl) {
            setIsThumbnailReady(true);
          }
        }}
        onError={() => {
          if (retryCount < MAX_RETRIES) {
            setTimeout(() => {
              handleRetry();
            }, RETRY_DELAY);
          } else {
            handleFallback();
          }
        }}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
