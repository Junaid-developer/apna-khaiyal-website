import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Layers, Tag, ExternalLink, Sparkles, Image as ImageIcon } from 'lucide-react';
import { ProductItem } from '../types';

interface ProductsViewProps {
  products: ProductItem[];
  isLoading?: boolean;
  onBookDemo?: (productName: string) => void;
}

// Helper function for enterprise software dashboard preview images
const getProductDashboardImage = (name: string, customImg?: string) => {
  if (customImg && customImg.trim() !== '') return customImg;
  const n = name.toLowerCase();
  if (n.includes('hospital') || n.includes('khms') || n.includes('clinical')) {
    return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop';
  }
  if (n.includes('finance') || n.includes('tfms') || n.includes('ledger')) {
    return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop';
  }
  if (n.includes('school') || n.includes('yushay') || n.includes('edtech')) {
    return 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1200&auto=format&fit=crop';
  }
  if (n.includes('retail') || n.includes('rms')) {
    return 'https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=1200&auto=format&fit=crop';
  }
  if (n.includes('pos') || n.includes('sale') || n.includes('register')) {
    return 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop';
  }
  if (n.includes('atee') || n.includes('excellence') || n.includes('metric')) {
    return 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=1200&auto=format&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop';
};

export default function ProductsView({ products, isLoading = false, onBookDemo }: ProductsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeProductModal, setActiveProductModal] = useState<ProductItem | null>(null);

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Filter items
  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="bg-[#12343b] text-white min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 font-sans" id="products-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Our Proprietary Products
          </h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto mt-3 text-sm font-sans">
            Ready-to-deploy digital structures, accounting ledger backbones, and organizational metrics platforms.
          </p>
        </div>

        {/* Dynamic Category Switcher */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 sm:mb-8" id="products-category-filter">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              id={`prod-cat-btn-${cat.replace(/\s+/g, '-').toLowerCase()}`}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-[#e1b382] hover:bg-[#d4af37] text-[#12343b] hover:text-[#12343b] border-transparent shadow-md font-bold'
                  : 'bg-[#2d545e]/80 text-[#94A3B8] border-[#3f6973] hover:text-white hover:border-[#e1b382]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="products-grid">
          {isLoading || products.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`prod-skel-${i}`}
                className="premium-card rounded-3xl overflow-hidden flex flex-col justify-between animate-pulse border border-[#3f6973]/60 bg-[#2d545e]/50"
              >
                <div className="aspect-[16/10] bg-[#2d545e] border-b border-[#3f6973] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3f6973]/20 to-transparent animate-shimmer" />
                  <div className="absolute top-4 left-4 w-12 h-12 rounded-xl bg-[#12343b]/90 border border-[#3f6973]" />
                </div>
                <div className="p-6 space-y-3">
                  <div className="w-24 h-4 rounded bg-[#e1b382]/20 border border-[#e1b382]/20" />
                  <div className="w-3/4 h-6 rounded bg-[#3f6973]/80" />
                  <div className="w-full h-3.5 rounded bg-[#3f6973]/50" />
                  <div className="w-5/6 h-3.5 rounded bg-[#3f6973]/40" />
                  <div className="pt-2 space-y-2">
                    <div className="w-full h-3 rounded bg-[#3f6973]/30" />
                    <div className="w-4/5 h-3 rounded bg-[#3f6973]/30" />
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <div className="w-full h-10 rounded-xl bg-[#e1b382]/20 border border-[#e1b382]/30" />
                </div>
              </div>
            ))
          ) : (
            filteredProducts.map((prod, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              key={prod.id}
              onClick={() => setActiveProductModal(prod)}
              className="premium-card rounded-3xl overflow-hidden flex flex-col justify-between group cursor-pointer"
              id={`product-card-${prod.id}`}
            >
              {/* Product Visual Container */}
              <div className="relative aspect-[16/10] overflow-hidden border-b border-[#3f6973] bg-[#2d545e]">
                <img 
                  src={getProductDashboardImage(prod.name, prod.image)} 
                  alt={`${prod.name} Dashboard Mockup`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getProductDashboardImage(prod.name);
                  }}
                />
                {/* Gradient shade */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#12343b] via-transparent to-transparent opacity-80" />
                
                {/* Top badges bar */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-[#e1b382] bg-[#12343b]/95 backdrop-blur-md px-2.5 py-1 rounded-md border border-[#e1b382]/35 shadow-md">
                    {prod.category}
                  </span>
                  
                  <span className={`inline-flex items-center text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-md backdrop-blur-md ${
                    prod.status === 'Active' 
                      ? 'bg-[#12343b]/95 text-emerald-400 border border-emerald-500/60'
                      : 'bg-[#12343b]/95 text-amber-400 border border-amber-500/60'
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-1.5 ${
                      prod.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`} />
                    {prod.status}
                  </span>
                </div>

                {/* Highly stylized product initial logo overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center space-x-3 z-10">
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#12343b]/95 backdrop-blur-md border border-[#e1b382]/40 flex items-center justify-center font-bold text-[#e1b382] shadow-xl group-hover:border-[#e1b382] transition-all overflow-hidden p-1">
                    {prod.logoUrl ? (
                      <img src={prod.logoUrl} alt={prod.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <span className={`text-center font-mono font-bold leading-none ${
                        prod.logoText.length > 4 ? 'text-[10px] tracking-tight' : 'text-xs tracking-wider'
                      }`}>
                        {prod.logoText}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold tracking-wide text-white group-hover:text-[#e1b382] transition-colors leading-tight drop-shadow-md">
                      {prod.name}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Description & features list */}
              <div className="p-6 flex-grow flex flex-col justify-between space-y-6">
                <div>
                  <p className="text-[#94A3B8] text-xs sm:text-sm leading-relaxed mb-6 font-sans">
                    {prod.description}
                  </p>

                  <div className="space-y-2.5">
                    <span className="text-[10px] font-mono text-[#94A3B8] tracking-wider uppercase block">
                      Core Framework Features
                    </span>
                    {prod.features.slice(0, 3).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start space-x-2 text-xs text-[#F1F5F9] font-sans">
                        <Check className="w-3.5 h-3.5 text-[#e1b382] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action triggers */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveProductModal(prod);
                    }}
                    id={`prod-details-trigger-${prod.id}`}
                    className="py-3 rounded-xl bg-[#12343b] hover:bg-[#2d545e] text-[#CBD5E1] hover:text-white border border-[#3f6973] text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer text-center"
                  >
                    Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onBookDemo) {
                        onBookDemo(prod.name);
                      }
                    }}
                    id={`prod-book-demo-btn-${prod.id}`}
                    className="py-3 rounded-xl bg-[#e1b382] hover:bg-[#d4af37] text-[#12343b] hover:text-[#12343b] border border-[#e1b382] text-xs font-bold tracking-wide uppercase transition-all cursor-pointer shadow-md text-center hover:scale-[1.02]"
                  >
                    Book Demo
                  </button>
                </div>
              </div>
            </motion.div>
          )))}
        </div>

        {/* Interactive Specs Lightbox Modal */}
        <AnimatePresence>
          {activeProductModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md"
              id="product-lightbox-modal"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="premium-card rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col lg:flex-row shadow-2xl relative bg-[#2d545e] border border-[#3f6973] my-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setActiveProductModal(null)}
                  id="close-prod-lightbox"
                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-[#12343b] border border-[#3f6973] text-[#94A3B8] hover:text-white flex items-center justify-center hover:scale-105 transition-all cursor-pointer"
                  aria-label="Close Product View"
                >
                  ✕
                </button>

                {/* Left side: Product graphic & Gallery previews */}
                <div className="lg:w-1/2 relative bg-[#12343b] border-r border-[#3f6973] flex flex-col justify-between">
                  <div className="aspect-[4/3] w-full">
                    <img 
                      src={getProductDashboardImage(activeProductModal.name, activeProductModal.image)} 
                      alt={activeProductModal.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getProductDashboardImage(activeProductModal.name);
                      }}
                    />
                  </div>
                  <div className="p-4 bg-[#12343b]/90 flex-grow">
                    <span className="text-[10px] font-mono text-[#e1b382] tracking-widest uppercase block mb-2">
                      Interactive Product Media
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {(() => {
                        const modalImages = activeProductModal.productImages && activeProductModal.productImages.length > 0
                          ? activeProductModal.productImages.map(img => img.imageUrl)
                          : (activeProductModal.images && activeProductModal.images.length > 0
                              ? activeProductModal.images
                              : activeProductModal.gallery);

                        return modalImages && modalImages.length > 0 ? (
                          modalImages.map((img, index) => (
                            <div key={index} className="aspect-video rounded-lg overflow-hidden border border-[#3f6973]">
                              <img 
                                src={img} 
                                alt={`Gallery ${index}`}
                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all cursor-zoom-in"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 py-4 flex items-center justify-center border border-dashed border-[#3f6973] rounded-lg text-[#94A3B8] text-xs">
                            <ImageIcon className="w-4 h-4 mr-1.5 text-[#e1b382]" />
                            <span>No supplementary photos</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Right side: Core spec details */}
                <div className="lg:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-[#2d545e]">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-11 h-11 shrink-0 rounded-xl bg-[#12343b] border border-[#e1b382]/30 flex items-center justify-center font-bold text-[#e1b382] overflow-hidden p-1 shadow-md">
                        {activeProductModal.logoUrl ? (
                          <img src={activeProductModal.logoUrl} alt={activeProductModal.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <span className={`text-center font-mono font-bold leading-none ${
                            activeProductModal.logoText.length > 4 ? 'text-[10px] tracking-tight' : 'text-xs tracking-wider'
                          }`}>
                            {activeProductModal.logoText}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-widest block leading-none">
                            {activeProductModal.category}
                          </span>
                          <span className={`inline-flex items-center text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-md ${
                            activeProductModal.status === 'Active' 
                              ? 'bg-[#12343b] text-emerald-400 border border-emerald-500/50'
                              : 'bg-[#12343b] text-amber-400 border border-amber-500/50'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              activeProductModal.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                            }`} />
                            {activeProductModal.status}
                          </span>
                        </div>
                        <h4 className="text-xl font-bold tracking-wide text-white leading-tight">
                          {activeProductModal.name}
                        </h4>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed mb-6 font-sans">
                      {activeProductModal.description}
                    </p>

                    <div className="space-y-3">
                      <span className="text-[10px] font-mono text-[#e1b382] uppercase tracking-wider block">
                        Architecture Deliverables
                      </span>
                      {activeProductModal.features.map((feat, index) => (
                        <div key={index} className="flex items-start space-x-2 text-xs text-[#F1F5F9] font-sans">
                          <Check className="w-4 h-4 text-[#e1b382] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions bar */}
                  <div className="pt-4 border-t border-[#3f6973] flex items-center justify-between gap-4">
                    <span className="text-[10px] text-[#94A3B8] font-sans">
                      Enterprise Systems Verified
                    </span>
                    <button
                      onClick={() => {
                        const targetName = activeProductModal.name;
                        setActiveProductModal(null);
                        if (onBookDemo) {
                          onBookDemo(targetName);
                        }
                      }}
                      id="modal-book-demo-btn"
                      className="px-6 py-2.5 rounded-full bg-[#e1b382] hover:bg-[#d4af37] text-[#12343b] hover:text-[#12343b] text-xs font-bold tracking-wide hover:scale-105 transition-all cursor-pointer shadow-md flex items-center space-x-1.5"
                    >
                      <span>Book Demo</span>
                    </button>
                  </div>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
