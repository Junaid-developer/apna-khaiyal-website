import { Globe, Smartphone, Monitor, Cpu, Sparkles, TrendingUp, ArrowRight, CodeXml, CheckCircle2, ShieldCheck, Zap, Layers } from 'lucide-react';
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
    case 'shield': return ShieldCheck;
    case 'zap': return Zap;
    case 'layers': return Layers;
    default: return CodeXml;
  }
};

export const getServiceCategory = (service: ServiceItem): string => {
  if (service.category?.trim()) return service.category;
  const t = `${service.title || ''} ${service.description || ''}`.toLowerCase();
  if (t.includes('web') || t.includes('pwa') || t.includes('spa')) return 'Web Development';
  if (t.includes('mobile') || t.includes('android') || t.includes('ios')) return 'Mobile Apps';
  if (t.includes('desktop') || t.includes('electron')) return 'Desktop Systems';
  if (t.includes('ai') || t.includes('automation') || t.includes('agentic')) return 'AI & Automation';
  if (t.includes('marketing') || t.includes('seo') || t.includes('digital')) return 'Digital Growth';
  if (t.includes('cloud') || t.includes('security') || t.includes('devops')) return 'Cloud & Security';
  return 'Engineering';
};

export const getServiceImage = (title: string, customImage?: string) => customImage?.trim() || '';

export default function ServicesView({ services, settings, setCurrentTab }: ServicesViewProps) {
  const connect = () => { setCurrentTab('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <main id="services-page" className="bg-[#12343b] text-white min-h-screen pt-20 sm:pt-24 pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-10 sm:mb-14">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            {settings?.servicesSectionHeading || 'Our Expertise'}
          </h2>
          {settings?.servicesSectionSubtitle?.trim() && (
            <p className="text-[#94A3B8] max-w-3xl mx-auto mt-5 text-base sm:text-lg leading-relaxed">{settings.servicesSectionSubtitle}</p>
          )}
        </header>

        <div id="services-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = getServiceIcon(service.icon);
            const image = getServiceImage(service.title, service.image);
            return (
              <article key={service.id} id={`service-card-${service.id}`} onClick={connect} className="group bg-[#2d545e]/70 border border-[#e1b382]/20 hover:border-[#e1b382]/60 rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-colors">
                <div className="relative aspect-[16/9] bg-[#214b55] overflow-hidden">
                  {image ? <img src={image} alt={service.title} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-85" /> : <div className="w-full h-full flex items-center justify-center"><Icon className="w-16 h-16 text-[#e1b382]/70" /></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2d545e] via-transparent to-transparent" />
                  <span className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-mono font-bold uppercase text-[#e1b382] bg-[#12343b]/90 border border-[#e1b382]/40 rounded-full">{getServiceCategory(service)}</span>
                  <div className="absolute -bottom-5 left-6 w-14 h-14 flex items-center justify-center bg-[#12343b] border-2 border-[#e1b382]/60 rounded-xl"><Icon className="w-7 h-7 text-[#e1b382]" /></div>
                </div>
                <div className="p-7 pt-10 flex-1">
                  <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                  <p className="text-[#94A3B8] text-sm leading-relaxed line-clamp-4">{service.description}</p>
                </div>
                <div className="p-7 pt-0"><button onClick={(e) => { e.stopPropagation(); connect(); }} className="w-full py-3 rounded-lg bg-[#e1b382]/10 text-[#e1b382] border border-[#e1b382]/30 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"><span>Learn More</span><ArrowRight className="w-4 h-4" /></button></div>
              </article>
            );
          })}
        </div>

        <section className="mt-12 bg-[#2d545e]/80 border border-[#e1b382]/30 rounded-2xl p-8 sm:p-12">
          <div className="max-w-3xl">
            <span className="inline-flex text-xs font-mono font-bold tracking-widest text-[#e1b382] uppercase bg-[#e1b382]/10 px-3 py-1 rounded-md border border-[#e1b382]/30">Solvency & Assurance</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-4">How We Engineer Enterprise Solvency</h3>
            <p className="text-[#94A3B8] text-sm leading-relaxed mt-4">Our team applies modular design principles, rigorous type safety, and continuous integration routines. Every platform, web engine, or AI architecture we deliver undergoes comprehensive compliance and stress audits.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 text-xs font-medium"><span className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-[#e1b382]" />TypeScript Strict Type-Safety</span><span className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-[#e1b382]" />Automated E2E Audit Suites</span><span className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-[#e1b382]" />Global Edge Delivery</span><span className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-[#e1b382]" />Supabase & Relational Solvency</span></div>
            <button onClick={connect} className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#e1b382] text-[#12343b] font-bold text-sm">Start a Project <ArrowRight className="w-4 h-4" /></button>
          </div>
        </section>
      </div>
    </main>
  );
}
