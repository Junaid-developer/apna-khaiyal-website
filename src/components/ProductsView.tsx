import { useState } from 'react';
import { Check, Layers, Tag, ExternalLink, Sparkles, Image as ImageIcon } from 'lucide-react';
import { ProductItem } from '../types';

interface ProductsViewProps { products: ProductItem[]; isLoading?: boolean; onBookDemo?: (productName: string) => void; }

const getProductDashboardImage = (name: string, customImg?: string) => customImg?.trim() || '';

export default function ProductsView({ products, isLoading = false, onBookDemo }: ProductsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeProductModal, setActiveProductModal] = useState<ProductItem | null>(null);
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  const filtered = selectedCategory === 'All' ? products : products.filter(p => p.category === selectedCategory);

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
          {isLoading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[560px] rounded-3xl bg-[#2d545e]/60 animate-pulse" />) : filtered.map(prod => {
            const image = getProductDashboardImage(prod.name, prod.image);
            return <article key={prod.id} id={`product-card-${prod.id}`} onClick={() => setActiveProductModal(prod)} className="premium-card rounded-3xl overflow-hidden flex flex-col group cursor-pointer">
              <div className="relative aspect-[16/10] overflow-hidden border-b border-[#3f6973] bg-[#214b55]">
                {image ? <img src={image} alt={`${prod.name} Dashboard Mockup`} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-90" /> : <div className="w-full h-full flex items-center justify-center"><Layers className="w-16 h-16 text-[#e1b382]/70" /></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-[#12343b] via-transparent to-transparent opacity-80" />
                <div className="absolute top-4 left-4 right-4 flex justify-between gap-2"><span className="text-[10px] sm:text-xs font-mono font-bold uppercase text-[#e1b382] bg-[#12343b]/95 px-2.5 py-1 rounded-md border border-[#e1b382]/35">{prod.category}</span><span className="text-[10px] sm:text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-md bg-[#12343b]/95 text-emerald-400 border border-emerald-500/60">● {prod.status}</span></div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3"><div className="w-12 h-12 shrink-0 rounded-2xl bg-[#12343b]/95 border border-[#e1b382]/40 flex items-center justify-center font-bold text-[#e1b382] overflow-hidden p-1">{prod.logoUrl ? <img src={prod.logoUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-contain" referrerPolicy="no-referrer" /> : <span className="text-xs font-mono">{prod.logoText}</span>}</div><h3 className="text-base font-bold text-white leading-tight">{prod.name}</h3></div>
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between gap-6">
                <div><p className="text-[#94A3B8] text-xs sm:text-sm leading-relaxed mb-6">{prod.description}</p><span className="text-[10px] font-mono text-[#94A3B8] uppercase block mb-2">Core Framework Features</span><div className="space-y-2">{(prod.features || []).slice(0, 3).map((feat, i) => <div key={i} className="flex items-start gap-2 text-xs"><Check className="w-3.5 h-3.5 text-[#e1b382] shrink-0" /><span>{feat}</span></div>)}</div></div>
                <div className="grid grid-cols-2 gap-2.5"><button onClick={e => { e.stopPropagation(); setActiveProductModal(prod); }} id={`prod-details-trigger-${prod.id}`} className="py-3 rounded-xl bg-[#12343b] text-[#CBD5E1] border border-[#3f6973] text-xs font-semibold uppercase">Details</button><button onClick={e => { e.stopPropagation(); onBookDemo?.(prod.name); }} id={`prod-book-demo-btn-${prod.id}`} className="py-3 rounded-xl bg-[#e1b382] text-[#12343b] border border-[#e1b382] text-xs font-bold uppercase">Book Demo</button></div>
              </div>
            </article>;
          })}
        </div>

        {activeProductModal && <div id="product-lightbox-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85" onClick={() => setActiveProductModal(null)}><div className="bg-[#2d545e] border border-[#3f6973] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative" onClick={e => e.stopPropagation()}><button onClick={() => setActiveProductModal(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#12343b] text-white">✕</button><div className="flex items-center gap-3 mb-6"><Sparkles className="w-6 h-6 text-[#e1b382]" /><div><h3 className="text-2xl font-bold">{activeProductModal.name}</h3><p className="text-[#94A3B8] text-sm">{activeProductModal.category}</p></div></div><p className="text-[#CBD5E1] leading-relaxed">{activeProductModal.description}</p><div className="mt-6 space-y-2">{(activeProductModal.features || []).map((f, i) => <div key={i} className="flex gap-2 text-sm"><Check className="w-4 h-4 text-[#e1b382] shrink-0" />{f}</div>)}</div><button onClick={() => onBookDemo?.(activeProductModal.name)} className="mt-8 px-6 py-3 rounded-lg bg-[#e1b382] text-[#12343b] font-bold">Book Demo</button></div></div>}
      </div>
    </main>
  );
}
