'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

import type { FastVideoProps } from './FastVideo.types';

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
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(poster || '');
  const [isThumbnailReady, setIsThumbnailReady] = useState(!!poster);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy);
  const [videoError, setVideoError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (poster) {
      setThumbnailUrl(poster);
      setIsThumbnailReady(true);
    } else {
      setThumbnailUrl('');
      setIsThumbnailReady(false);
    }
  }, [poster]);

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
    setIsBuffering(false);
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

  return (
    <div className={`relative ${className}`}>
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
      {!videoError && thumbnailUrl && !isBuffering && (
        <Image
          src={thumbnailUrl}
          alt="Video thumbnail"
          fill
          className="object-cover"
          unoptimized
        />
      )}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <video
        key={`video-${key}`}
        ref={videoRef}
        src={shouldLoad ? src : undefined}
        poster={!videoError && thumbnailUrl ? undefined : undefined}
        autoPlay={autoPlay}
        muted={muted}
        playsInline={playsInline}
        controls={false}
        preload={lazy ? 'none' : 'metadata'}
        className="w-full h-full object-contain z-20"
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => {
          setIsLoading(false);
          setIsBuffering(false);
          setRetryCount(0);
          onLoad?.();
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={() => {
          if (!poster && !thumbnailUrl) {
            setIsThumbnailReady(true);
          }
        }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
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
      {!isPlaying && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="w-16 h-16 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#0071e3] ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
