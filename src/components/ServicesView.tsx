import {
  Globe, Smartphone, Monitor, Cpu, Sparkles, TrendingUp,
  ArrowRight, CodeXml, CheckCircle2, ShieldCheck, Zap, Layers
} from 'lucide-react';
import { ServiceItem, SystemSettings } from '../types';

interface ServicesViewProps {
  services: ServiceItem[];
  settings?: SystemSettings;
  setCurrentTab: (tab: string) => void;
  isLoading?: boolean;
}

export const getServiceIcon = (iconName: string) => {
  switch ((iconName || '').toLowerCase()) {
    case 'globe': return Globe;
    case 'smartphone': return Smartphone;
    case 'monitor': return Monitor;
    case 'cpu': return Cpu;
    case 'sparkles': return Sparkles;
    case 'trendingup': case 'trending-up': return TrendingUp;
    case 'shield': case 'shieldcheck': return ShieldCheck;
    case 'zap': return Zap;
    case 'layers': return Layers;
    default: return CodeXml;
  }
};

export const getServiceCategory = (service: ServiceItem): string => {
  if (service.category?.trim()) return service.category;
  const t = `${service.title || ''} ${service.description || ''}`.toLowerCase();
  if (/web|pwa|spa/.test(t)) return 'Web Development';
  if (/mobile|app|ios|android/.test(t)) return 'Mobile Apps';
  if (/desktop|electron/.test(t)) return 'Desktop Systems';
  if (/ai|automation|agentic|machine learning|language models/.test(t)) return 'AI & Automation';
  if (/marketing|seo|growth|digital/.test(t)) return 'Digital Growth';
  if (/cloud|security|devops|infrastructure/.test(t)) return 'Cloud & Security';
  return 'Engineering';
};

const SERVICE_IMAGES: Record<string, string> = {
  'web development': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=55',
  'mobile apps': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=55',
  'desktop systems': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=55',
  'ai & automation': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=55',
  'digital growth': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=55',
  'cloud & security': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=55',
  'engineering': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=55'
};

export const getServiceImage = (title: string, customImage?: string) => {
  const t = (title || '').toLowerCase();
  // Always use the reliable AI fallback for Agentic AI, even if an old custom URL is broken.
  if (/agentic\s*ai|agentic/.test(t)) return SERVICE_IMAGES['ai & automation'];
  if (customImage?.trim()) return customImage;
  if (/web|pwa|spa/.test(t)) return SERVICE_IMAGES['web development'];
  if (/mobile|app|ios|android/.test(t)) return SERVICE_IMAGES['mobile apps'];
  if (/desktop|electron/.test(t)) return SERVICE_IMAGES['desktop systems'];
  if (/ai|automation|machine learning|language models/.test(t)) return SERVICE_IMAGES['ai & automation'];
  if (/marketing|seo|growth|digital/.test(t)) return SERVICE_IMAGES['digital growth'];
  if (/cloud|security|devops|infrastructure/.test(t)) return SERVICE_IMAGES['cloud & security'];
  return SERVICE_IMAGES['engineering'];
};

export default function ServicesView({ services, settings, setCurrentTab }: ServicesViewProps) {
  const handleConnectClick = () => {
    setCurrentTab('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main id="services-page" className="bg-[#12343b] text-white min-h-screen pt-20 sm:pt-24 pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-10 sm:mb-14">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">{settings?.servicesSectionHeading || 'Our Expertise'}</h2>
          {settings?.servicesSectionSubtitle?.trim() && <p className="text-[#94A3B8] max-w-3xl mx-auto mt-5 text-base sm:text-lg leading-relaxed">{settings.servicesSectionSubtitle}</p>}
        </header>
        <section id="services-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = getServiceIcon(service.icon);
            const imageUrl = getServiceImage(service.title, (service as ServiceItem & { image?: string }).image);
            return (
              <article key={service.id} id={`service-card-${service.id}`} onClick={handleConnectClick}
                className="group bg-[#2d545e] border border-[#e1b382]/20 hover:border-[#e1b382]/60 rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-colors duration-150">
                <div className="relative h-40 sm:h-44 overflow-hidden bg-[#214b55]">
                  <img src={imageUrl} alt={`${service.title} service`} loading="lazy" decoding="async" width="600" height="336" className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-[1.03]" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12343b] via-[#12343b]/25 to-transparent pointer-events-none" />
                  <span className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-mono font-bold uppercase text-[#e1b382] bg-[#12343b]/95 border border-[#e1b382]/40 rounded-full">{getServiceCategory(service)}</span>
                  <div className="absolute bottom-4 left-6 w-14 h-14 flex items-center justify-center bg-[#12343b] border-2 border-[#e1b382]/60 rounded-xl"><Icon className="w-7 h-7 text-[#e1b382]" /></div>
                </div>
                <div className="p-7 pt-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                  <p className="text-[#94A3B8] text-sm leading-relaxed line-clamp-3 flex-1">{service.description}</p>
                  <button onClick={(e) => { e.stopPropagation(); handleConnectClick(); }} id={`service-learn-more-${service.id}`} className="mt-6 w-full py-3 rounded-lg bg-[#e1b382]/10 hover:bg-[#e1b382] text-[#e1b382] hover:text-[#12343b] border border-[#e1b382]/30 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors duration-150">Learn More <ArrowRight className="w-4 h-4" /></button>
                </div>
              </article>
            );
          })}
        </section>
        <section className="mt-10 sm:mt-12 bg-[#2d545e] border border-[#e1b382]/30 rounded-2xl p-8 sm:p-12">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#e1b382] uppercase bg-[#e1b382]/10 px-3 py-1 rounded-md border border-[#e1b382]/30">Solvency & Assurance</span>
            <h3 className="mt-4 text-2xl sm:text-3xl font-extrabold">How We Engineer Enterprise Solvency</h3>
            <p className="mt-4 text-[#94A3B8] text-sm leading-relaxed">Our team applies modular design principles, rigorous type safety, and continuous integration routines. Every platform, web engine, or AI architecture we deliver undergoes comprehensive compliance and stress audits.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 text-xs font-medium">{['TypeScript Strict Type-Safety','Automated E2E Audit Suites','Sub-second Global Edge Delivery','Supabase & Relational Solvency'].map(item => <div key={item} className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-[#e1b382]" /><span>{item}</span></div>)}</div>
            <button onClick={handleConnectClick} className="mt-7 px-6 py-3 rounded-lg bg-[#e1b382] text-[#12343b] font-bold text-sm inline-flex items-center gap-2">Talk to an Expert <ArrowRight className="w-4 h-4" /></button>
          </div>
        </section>
      </div>
    </main>
  );
}