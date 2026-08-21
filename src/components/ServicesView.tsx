import { motion } from 'motion/react';
import { 
  Globe, 
  Smartphone, 
  Monitor, 
  Cpu, 
  Sparkles, 
  TrendingUp, 
  ArrowRight,
  CodeXml,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Layers
} from 'lucide-react';
import { ServiceItem, SystemSettings } from '../types';

interface ServicesViewProps {
  services: ServiceItem[];
  settings?: SystemSettings;
  setCurrentTab: (tab: string) => void;
  isLoading?: boolean;
}

// Icon mapper helper with enhanced fallback
export const getServiceIcon = (iconName: string) => {
  switch (iconName ? iconName.toLowerCase() : '') {
    case 'globe':
      return Globe;
    case 'smartphone':
      return Smartphone;
    case 'monitor':
      return Monitor;
    case 'cpu':
      return Cpu;
    case 'sparkles':
      return Sparkles;
    case 'trendingup':
    case 'trending-up':
      return TrendingUp;
    case 'shield':
      return ShieldCheck;
    case 'zap':
      return Zap;
    case 'layers':
      return Layers;
    default:
      return CodeXml;
  }
};

// Helper function to resolve service category
export const getServiceCategory = (service: ServiceItem): string => {
  if (service.category && service.category.trim() !== '') {
    return service.category;
  }
  const t = (service.title || '').toLowerCase();
  const d = (service.description || '').toLowerCase();
  
  if (t.includes('web') || d.includes('web') || d.includes('pwa') || d.includes('spa')) return 'Web Development';
  if (t.includes('mobile') || t.includes('app') || d.includes('mobile') || d.includes('ios') || d.includes('android')) return 'Mobile Apps';
  if (t.includes('desktop') || d.includes('desktop') || d.includes('electron')) return 'Desktop Systems';
  if (t.includes('ai') || t.includes('automation') || t.includes('agentic') || d.includes('machine learning') || d.includes('language models')) return 'AI & Automation';
  if (t.includes('marketing') || t.includes('seo') || t.includes('growth') || d.includes('marketing') || d.includes('digital')) return 'Digital Growth';
  if (t.includes('cloud') || t.includes('security') || t.includes('devops') || d.includes('infrastructure')) return 'Cloud & Security';
  
  return 'Engineering';
};

// Helper function to resolve high quality service technology illustrations
export const getServiceImage = (title: string, customImage?: string) => {
  if (customImage && customImage.trim() !== '') return customImage;
  const t = title.toLowerCase();
  if (t.includes('web')) return 'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=800&auto=format&fit=crop';
  if (t.includes('mobile') || t.includes('app')) return 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop';
  if (t.includes('desktop') || t.includes('monitor')) return 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop';
  if (t.includes('agentic')) return 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=800&auto=format&fit=crop';
  if (t.includes('ai') || t.includes('automation')) return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop';
  if (t.includes('marketing') || t.includes('digital')) return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop';
  return 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop';
};

export default function ServicesView({ services, settings, setCurrentTab, isLoading = false }: ServicesViewProps) {
  const handleConnectClick = () => {
    setCurrentTab('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#12343b] text-white min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 font-sans relative overflow-hidden" id="services-page">
      {/* Background ambient lighting glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#e1b382]/5 rounded-full filter blur-[160px] pointer-events-none" />
      <div className="absolute top-3/4 right-0 w-[500px] h-[500px] bg-[#d4af37]/5 rounded-full filter blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Block */}
        <div className="text-center mb-10 sm:mb-14">
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white"
          >
            {settings?.servicesSectionHeading || 'Our Expertise'}
          </motion.h2>

          {settings?.servicesSectionSubtitle && settings.servicesSectionSubtitle.trim() !== '' && (
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-[#94A3B8] max-w-3xl mx-auto mt-5 text-base sm:text-lg font-sans leading-relaxed"
            >
              {settings.servicesSectionSubtitle}
            </motion.p>
          )}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 sm:mb-12" id="services-grid">
          {isLoading || services.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`svc-skel-${i}`}
                className="bg-[#2d545e]/50 backdrop-blur-xl border border-[#3f6973]/60 rounded-2xl overflow-hidden flex flex-col justify-between h-full animate-pulse shadow-lg"
              >
                <div>
                  <div className="aspect-[16/9] bg-[#2d545e]/90 border-b border-[#3f6973]/40 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3f6973]/20 to-transparent animate-shimmer" />
                    <div className="absolute -bottom-6 left-6 w-14 h-14 bg-[#12343b] border border-[#3f6973] rounded-xl shadow-md" />
                  </div>
                  <div className="p-7 pt-10 space-y-3.5">
                    <div className="w-2/3 h-6 bg-[#3f6973]/70 rounded-md" />
                    <div className="w-full h-3.5 bg-[#3f6973]/40 rounded-sm" />
                    <div className="w-5/6 h-3.5 bg-[#3f6973]/30 rounded-sm" />
                    <div className="w-4/5 h-3.5 bg-[#3f6973]/20 rounded-sm" />
                  </div>
                </div>
                <div className="p-7 pt-0">
                  <div className="w-full h-11 bg-[#e1b382]/15 border border-[#e1b382]/20 rounded-lg" />
                </div>
              </div>
            ))
          ) : (
            services.map((service, idx) => {
              const IconComponent = getServiceIcon(service.icon);
              const serviceImg = getServiceImage(service.title, service.image);
              const serviceCategory = getServiceCategory(service);

              return (
                <motion.div
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx * 0.08, ease: "easeOut" }}
                  whileHover={{
                    y: -6,
                    transition: { duration: 0.25, ease: "easeOut" }
                  }}
                  key={service.id}
                  onClick={handleConnectClick}
                  className="group relative bg-[#2d545e]/70 backdrop-blur-xl border border-[#e1b382]/20 hover:border-[#e1b382]/60 rounded-2xl overflow-hidden transition-colors duration-500 hover:shadow-[0_20px_40px_-15px_rgba(225,179,130,0.18)] flex flex-col justify-between h-full cursor-pointer"
                  id={`service-card-${service.id}`}
                >
                  {/* Subtle card top glow indicator */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#e1b382]/0 group-hover:via-[#e1b382] to-transparent transition-all duration-500 z-20" />

                  <div>
                    {/* Image Header with Floating Icon & Category Tag */}
                    <div className="relative">
                      <div className="relative aspect-[16/9] overflow-hidden bg-[#2d545e] border-b border-[#e1b382]/10 rounded-t-2xl">
                        <img 
                          src={serviceImg} 
                          alt={service.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100 filter brightness-95 contrast-105"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2d545e] via-[#2d545e]/40 to-transparent" />

                        {/* Category Badge Pill */}
                        <div className="absolute top-3 right-3 z-20">
                          <span className="px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider uppercase text-[#e1b382] bg-[#12343b]/90 backdrop-blur-md border border-[#e1b382]/40 rounded-full shadow-md">
                            {serviceCategory}
                          </span>
                        </div>
                      </div>

                      {/* Icon Container */}
                      <div className="absolute -bottom-6 left-6 z-20">
                        <div className="w-13 h-13 sm:w-14 sm:h-14 flex items-center justify-center shrink-0 bg-[#12343b] backdrop-blur-xl border-2 border-[#e1b382]/50 rounded-xl shadow-2xl group-hover:border-[#e1b382] group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(225,179,130,0.35)] transition-all duration-300">
                          <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-[#e1b382] group-hover:text-[#F5D76E] transition-colors duration-300 shrink-0" />
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-7 pt-10 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold tracking-tight text-white mb-3 group-hover:text-[#e1b382] transition-colors duration-300">
                          {service.title}
                        </h3>
                        
                        <p className="text-[#94A3B8] text-sm leading-relaxed font-sans line-clamp-3">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* "Learn More" Button */}
                  <div className="p-7 pt-0">
                    <button
                      onClick={handleConnectClick}
                      id={`service-learn-more-${service.id}`}
                      className="w-full py-3 px-4 rounded-lg bg-[#e1b382]/10 hover:bg-[#e1b382] text-[#e1b382] hover:text-[#12343b] border border-[#e1b382]/30 hover:border-transparent font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all duration-300 cursor-pointer shadow-md group/btn"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="w-4 h-4 text-[#e1b382] group-hover:text-[#12343b] group-hover/btn:translate-x-1 transition-all duration-300" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Dynamic Workflow / Solvency Roadmap Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#2d545e]/80 backdrop-blur-xl border border-[#e1b382]/30 rounded-2xl p-8 sm:p-12 relative overflow-hidden shadow-2xl"
        >
          {/* Subtle gold glow inside roadmap box */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#e1b382]/10 rounded-full filter blur-[60px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold tracking-widest text-[#e1b382] uppercase bg-[#e1b382]/10 px-3 py-1 rounded-md border border-[#e1b382]/30">
                <span>Solvency & Assurance</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                How We Engineer Enterprise Solvency
              </h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed font-sans">
                Our team applies modular design principles, rigorous type safety, and continuous integration routines. Every platform, web engine, or AI architecture we deliver undergoes comprehensive compliance and stress audits.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs font-medium text-[#F1F5F9]">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#e1b382] shrink-0" />
                  <span>TypeScript Strict Type-Safety</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#e1b382] shrink-0" />
                  <span>Automated E2E Audit Suites</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#e1b382] shrink-0" />
                  <span>Sub-second Global Edge Delivery</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#e1b382] shrink-0" />
                  <span>Supabase & Relational Solvency</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <button
                onClick={handleConnectClick}
                id="services-consult-cta"
                className="w-full sm:w-auto px-8 py-4 rounded-lg bg-[#e1b382] hover:bg-[#d4af37] text-[#12343b] font-bold tracking-wide shadow-xl hover:shadow-[#e1b382]/20 hover:scale-105 transition-all duration-300 cursor-pointer text-sm flex items-center justify-center space-x-2"
              >
                <span>Schedule Technical Discovery</span>
                <ArrowRight className="w-4 h-4 text-[#12343b]" />
              </button>
            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
}


