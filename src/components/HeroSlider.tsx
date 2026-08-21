import React, { useState, useEffect, useRef, TouchEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HeroSlide } from '../types';

interface HeroSliderProps {
  slides: HeroSlide[];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  // Filter only active slides
  const activeSlides = slides ? slides.filter((s) => s.isActive) : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const [isHovered, setIsHovered] = useState(false);

  // Touch Swipe Handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Ensure index stays in range when slides array changes
  useEffect(() => {
    if (currentIndex >= activeSlides.length && activeSlides.length > 0) {
      setCurrentIndex(0);
    }
  }, [activeSlides.length, currentIndex]);

  // Autoplay loop every 4 seconds (paused on hover)
  useEffect(() => {
    if (activeSlides.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [activeSlides.length, isHovered]);

  // Hide completely if no active slides exist
  if (!activeSlides || activeSlides.length === 0) {
    return null;
  }

  const currentSlide = activeSlides[currentIndex];

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const distance = touchStartX.current - touchEndX.current;
      const minSwipeDistance = 40;
      if (distance > minSwipeDistance) {
        handleNext();
      } else if (distance < -minSwipeDistance) {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Slide Animation Variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
    <div
      className="relative w-full h-[125px] xs:h-[130px] sm:h-[140px] md:h-[155px] rounded-[16px] overflow-hidden bg-[#12343b]/90 backdrop-blur-md border border-[#3f6973] hover:border-[#e1b382] transition-all duration-300 group shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      id="hero-dynamic-slider"
    >
      {/* Default Base Background for Whole Card */}
      <div className="absolute inset-0 bg-[#12343b]/85 z-0" />

      {/* Slide Content Carousel */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentSlide.id || currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
          className="absolute inset-0 z-10 flex flex-col justify-center px-8 xs:px-9 sm:px-12 md:px-14 pt-2.5 pb-7 sm:pt-4 sm:pb-8"
        >
          {/* Background Image / Uniform Overlay across entire card */}
          {currentSlide.imageUrl && (
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <img
                src={currentSlide.imageUrl}
                alt={currentSlide.title}
                className="w-full h-full object-cover object-center opacity-30 scale-105 group-hover:scale-100 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#12343b]/95 via-[#12343b]/80 to-[#12343b]/90" />
            </div>
          )}

          {/* Slide Text Content */}
          <div className="relative z-10 w-full min-w-0 pr-1 sm:pr-2">
            <h3 className="text-xs sm:text-sm md:text-base font-bold text-white tracking-wide truncate group-hover:text-[#e1b382] transition-colors leading-snug">
              {currentSlide.title}
            </h3>
            <p className="text-[11px] sm:text-xs md:text-sm text-[#CBD5E1] font-sans line-clamp-2 mt-0.5 sm:mt-1 w-full leading-relaxed">
              {currentSlide.description}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows (vertically centered & consistently positioned inside banner) */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-1.5 xs:left-2 sm:left-3.5 md:left-4 top-1/2 -translate-y-1/2 z-20 w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-8.5 md:h-8.5 rounded-full bg-[#12343b]/90 backdrop-blur-md border border-[#e1b382]/40 text-[#e1b382] hover:bg-[#e1b382] hover:text-[#12343b] hover:border-[#e1b382] hover:scale-105 active:scale-95 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg shadow-black/40"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-1.5 xs:right-2 sm:right-3.5 md:right-4 top-1/2 -translate-y-1/2 z-20 w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-8.5 md:h-8.5 rounded-full bg-[#12343b]/90 backdrop-blur-md border border-[#e1b382]/40 text-[#e1b382] hover:bg-[#e1b382] hover:text-[#12343b] hover:border-[#e1b382] hover:scale-105 active:scale-95 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg shadow-black/40"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform" />
          </button>
        </>
      )}

      {/* Bottom Dot Indicators */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-2 sm:bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1.5 bg-[#12343b]/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#e1b382]/30 shadow-md">
          {activeSlides.map((slide, idx) => (
            <button
              key={slide.id || idx}
              onClick={() => handleDotClick(idx)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === currentIndex
                  ? 'w-5 h-1.5 bg-[#e1b382]'
                  : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
