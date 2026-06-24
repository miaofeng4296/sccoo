'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerItem {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
}

interface Props {
  banners: BannerItem[];
}

export function BannerCarousel({ banners }: Props) {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoplay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!api) return;
    intervalRef.current = setInterval(() => {
      api.scrollNext();
    }, 4000);
  }, [api]);

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!api) return;

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });

    startAutoplay();

    return () => {
      stopAutoplay();
    };
  }, [api, startAutoplay, stopAutoplay]);

  if (!banners || banners.length === 0) return null;

  return (
    <div
      className="relative rounded-xl overflow-hidden h-48 md:h-64"
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      <Carousel setApi={setApi} className="h-full">
        <CarouselContent className="h-full">
          {banners.map((banner) => (
            <CarouselItem key={banner.id} className="h-full">
              {banner.linkUrl ? (
                <Link href={banner.linkUrl} className="block h-full">
                  <div
                    className="h-full w-full bg-cover bg-center flex items-end"
                    style={{ backgroundImage: `url(${banner.imageUrl})` }}
                  >
                    <div className="w-full bg-gradient-to-t from-black/60 to-transparent p-6">
                      <h2 className="text-white text-xl md:text-2xl font-bold">
                        {banner.title}
                      </h2>
                    </div>
                  </div>
                </Link>
              ) : (
                <div
                  className="h-full w-full bg-cover bg-center flex items-end"
                  style={{ backgroundImage: `url(${banner.imageUrl})` }}
                >
                  <div className="w-full bg-gradient-to-t from-black/60 to-transparent p-6">
                    <h2 className="text-white text-xl md:text-2xl font-bold">
                      {banner.title}
                    </h2>
                  </div>
                </div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Arrows (only show on hover via group) */}
        <button
          onClick={() => api?.scrollPrev()}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-opacity opacity-0 hover:opacity-100"
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => api?.scrollNext()}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-opacity opacity-0 hover:opacity-100"
          aria-label="Next"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </Carousel>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === current ? 'bg-white w-6' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
