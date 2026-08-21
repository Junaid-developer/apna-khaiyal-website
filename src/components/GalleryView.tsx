import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Camera, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { GalleryItem } from '../types';

interface GalleryViewProps {
  gallery: GalleryItem[];
  onAddGalleryItem?: (item: GalleryItem) => void;
}

export default function GalleryView({ gallery, onAddGalleryItem }: GalleryViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = ['All', 'Meetings', 'Office', 'Projects', 'Events', 'Team'];

  const filteredGallery = activeCategory === 'All'
    ? gallery
    : gallery.filter(item => item.category === activeCategory);

  const handlePrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex(prev => prev !== null && prev > 0 ? prev - 1 : filteredGallery.length - 1);
  };

  const handleNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex(prev => prev !== null && prev < filteredGallery.length - 1 ? prev + 1 : 0);
  };

  return (
    <div className="bg-[#12343b] text-white min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 font-sans" id="gallery-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Titles */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Media & Operations Gallery
          </h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto mt-3 text-sm font-sans">
            A window into the corporate meetups, launch forums, design workshops, and community events at ApnaKhaiyal.
          </p>
        </div>

        {/* Categories Tab selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 sm:mb-8" id="gallery-category-filter">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              id={`gallery-cat-btn-${cat.toLowerCase()}`}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer border ${
                activeCategory === cat
                  ? 'bg-[#e1b382] hover:bg-[#d4af37] text-[#12343b] hover:text-[#12343b] border-transparent font-bold shadow-md'
                  : 'bg-[#2d545e]/80 text-[#94A3B8] border-[#3f6973] hover:text-white hover:border-[#e1b382]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Matrix Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="gallery-matrix">
          <AnimatePresence mode="popLayout">
            {filteredGallery.map((item, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                key={item.id}
                onClick={() => setLightboxIndex(index)}
                className="premium-card rounded-2xl overflow-hidden aspect-[4/3] relative group cursor-zoom-in border border-[#3f6973] hover:border-[#e1b382]"
                id={`gallery-card-${item.id}`}
              >
                {/* Image */}
                <img 
                  src={item.imageUrl} 
                  alt={item.caption}
                  className="w-full h-full object-cover grayscale opacity-85 group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />

                {/* Overlaid Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#12343b]/90 via-[#12343b]/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Info Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#e1b382] bg-[#12343b]/90 px-2 py-0.5 rounded border border-[#e1b382]/30 w-fit mb-2">
                    {item.category}
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-white leading-snug group-hover:text-[#e1b382] transition-colors line-clamp-2">
                    {item.caption}
                  </p>
                </div>

                {/* Center preview icon on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 rounded-full bg-[#12343b]/80 border border-[#e1b382]/40 flex items-center justify-center shadow-lg">
                    <Eye className="w-5 h-5 text-[#e1b382]" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredGallery.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center border border-dashed border-[#3f6973] rounded-3xl" id="gallery-empty-state">
              <Camera className="w-12 h-12 text-[#e1b382] mb-4 animate-pulse" />
              <p className="text-sm text-[#94A3B8] font-sans">No photography available in this category yet.</p>
            </div>
          )}
        </div>

        {/* Premium Lightbox Modal Slider */}
        <AnimatePresence>
          {lightboxIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4"
              id="gallery-lightbox"
              onClick={() => setLightboxIndex(null)}
            >
              {/* Close Handle */}
              <button
                onClick={() => setLightboxIndex(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#12343b]/85 backdrop-blur-md border border-[#e1b382]/40 text-[#CBD5E1] hover:text-[#e1b382] hover:bg-[#e1b382]/10 hover:border-[#e1b382] flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg hover:scale-105"
                aria-label="Close"
                title="Close"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Slider Core Container */}
              <div 
                className="relative max-w-5xl w-full max-h-[75vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Left Button */}
                <button
                  onClick={handlePrev}
                  className="absolute left-1 sm:left-4 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#12343b]/90 border border-[#3f6973] text-[#94A3B8] hover:text-[#e1b382] hover:border-[#e1b382] flex items-center justify-center hover:scale-105 transition-all cursor-pointer shadow-lg backdrop-blur-sm"
                  aria-label="Previous Image"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Core Image Display */}
                <motion.div
                  key={lightboxIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl overflow-hidden border border-[#3f6973] max-h-[70vh] flex items-center justify-center mx-2 sm:mx-0"
                >
                  <img 
                    src={filteredGallery[lightboxIndex].imageUrl} 
                    alt={filteredGallery[lightboxIndex].caption}
                    className="object-contain max-h-[70vh] max-w-full"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>

                {/* Right Button */}
                <button
                  onClick={handleNext}
                  className="absolute right-1 sm:right-4 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#12343b]/90 border border-[#3f6973] text-[#94A3B8] hover:text-[#e1b382] hover:border-[#e1b382] flex items-center justify-center hover:scale-105 transition-all cursor-pointer shadow-lg backdrop-blur-sm"
                  aria-label="Next Image"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Slider Caption details */}
              <div 
                className="mt-6 text-center max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-[10px] font-mono font-bold text-[#e1b382] tracking-widest uppercase block mb-1">
                  Category: {filteredGallery[lightboxIndex].category}
                </span>
                <p className="text-sm text-[#F1F5F9] font-sans leading-relaxed">
                  {filteredGallery[lightboxIndex].caption}
                </p>
                <span className="text-[9px] font-mono text-[#94A3B8] block mt-2">
                  Image {lightboxIndex + 1} of {filteredGallery.length}
                </span>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
