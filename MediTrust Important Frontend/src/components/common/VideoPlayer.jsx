import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MEDITRUST_EXPLAINER_VIDEO_URL } from '@/constants/media';
import { AnalyticsEvents, trackEvent } from '@/lib/analytics';

const PRIMARY_BLUE = '#2563EB';
const SECONDARY_GREEN = '#10B981';

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function requestVideoFullscreen(videoEl, containerEl) {
  const target = containerEl || videoEl;
  if (target?.requestFullscreen) {
    return target.requestFullscreen();
  }
  if (target?.webkitRequestFullscreen) {
    return target.webkitRequestFullscreen();
  }
  if (videoEl?.webkitEnterFullscreen) {
    videoEl.webkitEnterFullscreen();
    return Promise.resolve();
  }
  return Promise.reject(new Error('Fullscreen not supported'));
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    return document.exitFullscreen();
  }
  if (document.webkitExitFullscreen) {
    return document.webkitExitFullscreen();
  }
  return Promise.resolve();
}

export default function VideoPlayer({
  src = MEDITRUST_EXPLAINER_VIDEO_URL,
  className,
  analyticsContext = 'unknown',
  lazy = true,
  poster,
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const hasStartedRef = useRef(false);
  const hasCompletedRef = useRef(false);
  const hideControlsTimer = useRef(null);

  const [isInView, setIsInView] = useState(!lazy);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);

  const effectiveVolume = isMuted ? 0 : volume;

  const resetHideControlsTimer = useCallback(() => {
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    setShowControls(true);
    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!lazy || !containerRef.current) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [lazy]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!document.webkitFullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration || 0);
    const onPlay = () => {
      setIsPlaying(true);
      if (!hasStartedRef.current) {
        hasStartedRef.current = true;
        trackEvent(AnalyticsEvents.VIDEO_STARTED, {
          context: analyticsContext,
          videoUrl: src,
        });
      }
      resetHideControlsTimer();
    };
    const onPause = () => {
      setIsPlaying(false);
      setShowControls(true);
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setShowControls(true);
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true;
        trackEvent(AnalyticsEvents.VIDEO_COMPLETED, {
          context: analyticsContext,
          videoUrl: src,
          duration: video.duration,
        });
      }
    };
    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onError = () => setHasError(true);

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('loadedmetadata', onDurationChange);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('loadedmetadata', onDurationChange);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('error', onError);
    };
  }, [analyticsContext, src, isInView, resetHideControlsTimer]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.volume = effectiveVolume;
  }, [effectiveVolume]);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    } catch {
      setHasError(true);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
    resetHideControlsTimer();
  }, [resetHideControlsTimer]);

  const handleVolumeChange = useCallback((e) => {
    const value = Number(e.target.value);
    setVolume(value);
    setIsMuted(value === 0);
    resetHideControlsTimer();
  }, [resetHideControlsTimer]);

  const seekTo = useCallback((time) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(time)) return;
    video.currentTime = Math.max(0, Math.min(time, duration || video.duration || 0));
    setCurrentTime(video.currentTime);
    resetHideControlsTimer();
  }, [duration, resetHideControlsTimer]);

  const handleProgressClick = useCallback((e) => {
    const bar = progressRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTo(ratio * duration);
  }, [duration, seekTo]);

  const toggleFullscreen = useCallback(async () => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    try {
      if (isFullscreen) {
        await exitFullscreen();
      } else {
        await requestVideoFullscreen(video, container);
      }
    } catch {
      // iOS may reject container fullscreen; webkitEnterFullscreen is attempted above
    }
    resetHideControlsTimer();
  }, [isFullscreen, resetHideControlsTimer]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl bg-gray-900 shadow-lg',
        'aspect-video',
        isFullscreen && 'rounded-none',
        className
      )}
      onMouseMove={resetHideControlsTimer}
      onTouchStart={resetHideControlsTimer}
      onClick={resetHideControlsTimer}
    >
      {!isInView ? (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2563EB]/20 via-gray-900 to-[#10B981]/20"
          aria-hidden
        >
          <div className="h-10 w-10 animate-pulse rounded-full bg-white/20" />
        </div>
      ) : (
        <video
          ref={videoRef}
          className="h-full w-full object-contain bg-black"
          src={src}
          poster={poster}
          playsInline
          preload="metadata"
          aria-label="MediTrust explainer video"
        />
      )}

      {isBuffering && isInView && !hasError && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 px-4 text-center text-white">
          <p className="text-sm font-medium">Unable to load video</p>
          <button
            type="button"
            onClick={() => {
              setHasError(false);
              const video = videoRef.current;
              if (video) video.load();
            }}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: PRIMARY_BLUE }}
          >
            Retry
          </button>
        </div>
      )}

      {isInView && !hasError && (
        <>
          {!isPlaying && (
            <button
              type="button"
              onClick={togglePlay}
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/25 transition-colors hover:bg-black/35"
              aria-label="Play video"
            >
              <span
                className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white/95 shadow-xl transition-transform hover:scale-105"
              >
                <Play className="ml-1 h-7 w-7 sm:h-8 sm:w-8" style={{ color: PRIMARY_BLUE }} fill="currentColor" />
              </span>
            </button>
          )}

          <div
            className={cn(
              'absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 pb-3 pt-8 transition-opacity duration-300 sm:px-4',
              showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
          >
            <button
              ref={progressRef}
              type="button"
              className="relative mb-3 h-2 w-full cursor-pointer rounded-full bg-white/25 touch-manipulation"
              onClick={handleProgressClick}
              aria-label="Seek video"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={currentTime}
              role="slider"
            >
              <span
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${progressPercent}%`,
                  background: `linear-gradient(90deg, ${PRIMARY_BLUE}, ${SECONDARY_GREEN})`,
                }}
              />
              <span
                className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
                style={{
                  left: `calc(${progressPercent}% - 7px)`,
                  backgroundColor: SECONDARY_GREEN,
                }}
              />
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 touch-manipulation"
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" fill="currentColor" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
                )}
              </button>

              <span className="min-w-[4.5rem] text-xs tabular-nums text-white/90 sm:text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 touch-manipulation"
                  aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={effectiveVolume}
                  onChange={handleVolumeChange}
                  className="hidden h-1 w-16 cursor-pointer accent-[#10B981] sm:block sm:w-20"
                  aria-label="Volume"
                />

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 touch-manipulation"
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  {isFullscreen ? (
                    <Minimize className="h-5 w-5" />
                  ) : (
                    <Maximize className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
