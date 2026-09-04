import { useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Layers, Sparkles } from 'lucide-react';
import { ProductItem } from '../types';

interface ProductsViewProps { products: ProductItem[]; isLoading?: boolean; onBookDemo?: (productName: string) => void; }

const getProductImages = (product: ProductItem) => {
  const relationalImages = (product.productImages || [])
    .slice()
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map(item => item.imageUrl)
    .filter(Boolean);

  return Array.from(new Set([
    ...(product.image?.trim() ? [product.image.trim()] : []),
    ...(product.gallery || []).filter(Boolean),
    ...(product.images || []).filter(Boolean),
    ...relationalImages
  ]));
};

function ProductImageSlider({ product }: { product: ProductItem }) {
  const images = getProductImages(product);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [product.id]);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex(current => (current + 1) % images.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [product.id, images.length]);

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex(current => (current - 1 + images.length) % images.length);
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex(current => (current + 1) % images.length);
  };

  return (
    <div className="relative aspect-[16/10] overflow-hidden border-b border-[#3f6973] bg-[#214b55]">
      {images.length > 0 ? (
        <>
          <div className="absolute inset-0">
            {images.map((src, index) => (
              <img
                key={src + index}
                src={src}
                alt={`${product.name} Dashboard Mockup ${index + 1}`}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                referrerPolicy="no-referrer"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${index === activeIndex ? 'opacity-90' : 'opacity-0'}`}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#12343b] via-transparent to-transparent opacity-80 pointer-events-none" />

          {images.length > 1 && (
            <>
              <button type="button" aria-label={`Previous image for ${product.name}`} onClick={goToPrevious} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#12343b]/85 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#12343b]">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button type="button" aria-label={`Next image for ${product.name}`} onClick={goToNext} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#12343b]/85 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#12343b]">
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, index) => (
                  <button key={index} type="button" aria-label={`Show image ${index + 1} of ${product.name}`} onClick={e => { e.stopPropagation(); setActiveIndex(index); }} className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-5 bg-[#e1b382]' : 'w-1.5 bg-white/60'}`} />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Layers className="w-16 h-16 text-[#e1b382]/70" />
        </div>
      )}

      <div className="absolute top-4 left-4 right-4 flex justify-between gap-2">
        <span className="text-[10px] sm:text-xs font-mono font-bold uppercase text-[#e1b382] bg-[#12343b]/95 px-2.5 py-1 rounded-md border border-[#e1b382]/35">{product.category}</span>
        <span className="text-[10px] sm:text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-md bg-[#12343b]/95 text-emerald-400 border border-emerald-500/60">● {product.status}</span>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
        <div className="w-12 h-12 shrink-0 rounded-2xl bg-transparent border-0 flex items-center justify-center font-bold text-[#e1b382] overflow-hidden p-0">
          {product.logoUrl ? <img src={product.logoUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]" referrerPolicy="no-referrer" /> : <span className="text-xs font-mono">{product.logoText}</span>}
        </div>
        <h3 className="text-base font-bold text-white leading-tight">{product.name}</h3>
      </div>
    </div>
  );
}

export default function ProductsView({ products, onBookDemo }: ProductsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeProductModal, setActiveProductModal] = useState<ProductItem | null>(null);
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  const orderedProducts = [...products].sort((a, b) => {
    const orderA = Number.isFinite(Number(a.displayOrder)) ? Number(a.displayOrder) : Number.MAX_SAFE_INTEGER;
    const orderB = Number.isFinite(Number(b.displayOrder)) ? Number(b.displayOrder) : Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return String(a.id || '').localeCompare(String(b.id || ''));
  });
  const filtered = selectedCategory === 'All' ? orderedProducts : orderedProducts.filter(p => p.category === selectedCategory);

  return (
    <main id="products-page" className="bg-[#12343b] text-white min-h-screen pt-20 sm:pt-24 pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-8">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Our Proprietary Products</h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto mt-3 text-sm">Ready-to-deploy digital structures, accounting ledger backbones, and organizational metrics platforms.</p>
        </header>

        <div id="products-category-filter" className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(cat => <button key={cat} id={`prod-cat-btn-${cat.replace(/\s+/g, '-').toLowerCase()}`} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase border ${selectedCategory === cat ? 'bg-[#e1b382] text-[#12343b] border-transparent font-bold' : 'bg-[#2d545e]/80 text-[#94A3B8] border-[#3f6973]'}`}>{cat}</button>)}
        </div>

        <div id="products-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(prod => (
            <article key={prod.id} id={`product-card-${prod.id}`} onClick={() => setActiveProductModal(prod)} className="premium-card rounded-3xl overflow-hidden flex flex-col group cursor-pointer">
              <ProductImageSlider product={prod} />
              <div className="p-6 flex-grow flex flex-col justify-between gap-6">
                <div>
                  <p className="text-[#94A3B8] text-xs sm:text-sm leading-relaxed mb-6">{prod.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button onClick={e => { e.stopPropagation(); setActiveProductModal(prod); }} id={`prod-details-trigger-${prod.id}`} className="py-3 rounded-xl bg-[#12343b] text-[#CBD5E1] border border-[#3f6973] text-xs font-semibold uppercase">Details</button>
                  <button onClick={e => { e.stopPropagation(); onBookDemo?.(prod.name); }} id={`prod-book-demo-btn-${prod.id}`} className="py-3 rounded-xl bg-[#e1b382] text-[#12343b] border border-[#e1b382] text-xs font-bold uppercase">Book Demo</button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {activeProductModal && <div id="product-lightbox-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85" onClick={() => setActiveProductModal(null)}><div className="bg-[#2d545e] border border-[#3f6973] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative" onClick={e => e.stopPropagation()}><button onClick={() => setActiveProductModal(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#12343b] text-white">✕</button><div className="flex items-center gap-3 mb-6"><Sparkles className="w-6 h-6 text-[#e1b382]" /><div><h3 className="text-2xl font-bold">{activeProductModal.name}</h3><p className="text-[#94A3B8] text-sm">{activeProductModal.category}</p></div></div><p className="text-[#CBD5E1] leading-relaxed">{activeProductModal.description}</p><div className="mt-6 space-y-2">{(activeProductModal.features || []).map((f, i) => <div key={i} className="flex gap-2 text-sm"><Check className="w-4 h-4 text-[#e1b382] shrink-0" />{f}</div>)}</div><button onClick={() => onBookDemo?.(activeProductModal.name)} className="mt-8 px-6 py-3 rounded-lg bg-[#e1b382] text-[#12343b] font-bold">Book Demo</button></div></div>}
      </div>
    </main>
  );
}
