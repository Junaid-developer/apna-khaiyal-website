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

// Kept for compatibility with other imports; Services no longer requests remote images.
export const getServiceImage = (_title: string, _customImage?: string) => '';

export default function ServicesView({ services, settings, setCurrentTab, isLoading = false }: ServicesViewProps) {
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
          {isLoading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-[#2d545e] border border-[#3f6973] rounded-2xl h-[430px] animate-pulse" />) : services.map((service) => {
            const Icon = getServiceIcon(service.icon);
            return (
              <article key={service.id} id={`service-card-${service.id}`} onClick={handleConnectClick}
                className="group bg-[#2d545e] border border-[#e1b382]/20 hover:border-[#e1b382]/60 rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-colors duration-150">
                <div className="relative h-36 sm:h-40 overflow-hidden bg-gradient-to-br from-[#214b55] via-[#2d545e] to-[#12343b]">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_20%,#e1b382,transparent_45%)]" />
                  <span className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-mono font-bold uppercase text-[#e1b382] bg-[#12343b]/95 border border-[#e1b382]/40 rounded-full">{getServiceCategory(service)}</span>
                  <div className="absolute bottom-4 left-6 w-14 h-14 flex items-center justify-center bg-[#12343b] border-2 border-[#e1b382]/60 rounded-xl shadow-lg">
                    <Icon className="w-7 h-7 text-[#e1b382]" />
                  </div>
                </div>
                <div className="p-7 pt-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                  <p className="text-[#94A3B8] text-sm leading-relaxed line-clamp-3 flex-1">{service.description}</p>
                  <button onClick={(e) => { e.stopPropagation(); handleConnectClick(); }} id={`service-learn-more-${service.id}`}
                    className="mt-6 w-full py-3 rounded-lg bg-[#e1b382]/10 hover:bg-[#e1b382] text-[#e1b382] hover:text-[#12343b] border border-[#e1b382]/30 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors duration-150">
                    Learn More <ArrowRight className="w-4 h-4" />
                  </button>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 text-xs font-medium">
              {['TypeScript Strict Type-Safety','Automated E2E Audit Suites','Sub-second Global Edge Delivery','Supabase & Relational Solvency'].map(item => <div key={item} className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-[#e1b382]" /><span>{item}</span></div>)}
            </div>
            <button onClick={handleConnectClick} className="mt-7 px-6 py-3 rounded-lg bg-[#e1b382] text-[#12343b] font-bold text-sm inline-flex items-center gap-2">Talk to an Expert <ArrowRight className="w-4 h-4" /></button>
          </div>
        </section>
      </div>
    </main>
  );
}
