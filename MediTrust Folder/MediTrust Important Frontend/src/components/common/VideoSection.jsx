import React from 'react';
import { cn } from '@/lib/utils';
import VideoPlayer from './VideoPlayer';

export default function VideoSection({
  className,
  titleClassName,
  analyticsContext = 'unknown',
  showTitle = true,
  title = 'See How MediTrust Works',
  lazy = true,
}) {
  return (
    <section className={cn('w-full', className)} aria-labelledby={showTitle ? 'video-section-title' : undefined}>
      {showTitle && (
        <h2
          id="video-section-title"
          className={cn(
            'mb-4 text-center text-xl font-bold text-gray-800 sm:text-2xl',
            titleClassName
          )}
        >
          {title}
        </h2>
      )}
      <VideoPlayer analyticsContext={analyticsContext} lazy={lazy} />
    </section>
  );
}
