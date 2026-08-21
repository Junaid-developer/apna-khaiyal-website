import { motion } from 'motion/react';
import { Target, Compass, Sparkles, Award, Shield, Cpu, Activity, Clock } from 'lucide-react';
import { AboutData } from '../types';

interface AboutViewProps {
  data: AboutData;
}

export default function AboutView({ data }: AboutViewProps) {
  // Core values to show
  const values = [
    { title: "Architectural Rigor", desc: "We enforce pristine clean code foundations, strict type safety, and optimized database layouts across all software.", icon: Shield },
    { title: "Human Aesthetics", desc: "Technology should be intuitive. We design fluid interfaces that prioritize clean typography, micro-interactions, and negative space.", icon: Sparkles },
    { title: "Intelligent Automation", desc: "We integrate modern LLMs, predictive pipeline processing, and stateful agents to eliminate manual labor.", icon: Cpu },
    { title: "Extreme Reliability", desc: "No room for crashes. Our enterprise platforms are engineered with high availability, robust caching, and error fallbacks.", icon: Activity }
  ];

  // Dynamic timeline items
  const timeline = [
    { year: "2022", title: "Inception & Core Frameworks", desc: "Founded ApnaKhaiyal with 3 developers, launching our first local educational portal and database sync tool." },
    { year: "2023", title: "Enterprise Systems Entry", desc: "Built TFMS (Town Finance) and KHMS (Hospital Management System), expanding enterprise system capabilities." },
    { year: "2024", title: "Modular Architecture Pivots", desc: "Consolidated POS and RMS systems with offline-first local synchronization, serving 30+ regional clients." },
    { year: "2025", title: "The Agentic AI Frontier", desc: "Launched ATEE Metric tracker and started integrating multi-agent autonomous decision pipelines for tech businesses." },
    { year: "2026", title: "Global Expansion Strategy", desc: "Scaling systems, delivering custom software suites globally, and maintaining a solid 99.9% uptime track record." }
  ];

  return (
    <div className="bg-[#12343b] text-white min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 font-sans" id="about-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Our Story, Mission & Vision
          </h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto mt-3 text-sm font-sans">
            Learn about the software foundations and core values driving the engineers at ApnaKhaiyal.
          </p>
        </div>

        {/* Company Story Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center mb-12 sm:mb-16">
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-wide border-b border-[#3f6973] pb-3">
              The Journey of ApnaKhaiyal
            </h3>
            <p className="text-[#F1F5F9] leading-relaxed text-base font-sans">
              {data.companyStory}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {data.achievements.map((achievement, idx) => (
                <div key={idx} className="premium-card p-4 rounded-xl flex items-start space-x-3">
                  <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#e1b382]/10 shrink-0 mt-0.5">
                    <Award className="w-3.5 h-3.5 text-[#e1b382]" />
                  </div>
                  <span className="text-sm font-medium text-[#F1F5F9] leading-snug">{achievement}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {/* Primary Image: Professional Office Workspace */}
            <div className="relative group">
              <div className="aspect-[16/10] rounded-3xl overflow-hidden border border-[#3f6973] relative z-10 shadow-2xl bg-[#2d545e]">
                <img 
                  src={data.imageUrl && data.imageUrl.trim() !== '' ? data.imageUrl : "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop"} 
                  alt="Modern Software House Office Workspace"
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12343b] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-4 bg-[#12343b]/80 backdrop-blur-md px-3 py-1 rounded-full border border-[#e1b382]/30">
                  <span className="text-[10px] font-mono font-bold text-[#e1b382] uppercase tracking-wider">
                    Corporate Tech HQ & Workspace
                  </span>
                </div>
              </div>
            </div>

            {/* Secondary Image: Strategic Business Meeting */}
            <div className="relative group pt-2">
              <div className="aspect-[16/10] rounded-3xl overflow-hidden border border-[#3f6973] shadow-2xl bg-[#2d545e]">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop" 
                  alt="Strategic Business Meeting and Collaborative Planning"
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12343b] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-4 bg-[#12343b]/80 backdrop-blur-md px-3 py-1 rounded-full border border-[#e1b382]/30">
                  <span className="text-[10px] font-mono font-bold text-[#e1b382] uppercase tracking-wider">
                    Executive Strategy & Collaboration
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision Bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {/* Mission Card */}
          <div className="premium-card p-6 sm:p-8 rounded-3xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#e1b382]/5 rounded-full filter blur-[40px] group-hover:bg-[#e1b382]/10 transition-all" />
            <div className="w-12 h-12 flex items-center justify-center bg-[#e1b382]/10 rounded-2xl border border-[#e1b382]/30 mb-6 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6 text-[#e1b382]" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-wide mb-3">Our Mission</h3>
            <p className="text-[#94A3B8] leading-relaxed text-sm font-sans">
              {data.mission}
            </p>
          </div>

          {/* Vision Card */}
          <div className="premium-card p-6 sm:p-8 rounded-3xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#e1b382]/5 rounded-full filter blur-[40px] group-hover:bg-[#e1b382]/10 transition-all" />
            <div className="w-12 h-12 flex items-center justify-center bg-[#e1b382]/10 rounded-2xl border border-[#e1b382]/30 mb-6 group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6 text-[#e1b382]" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-wide mb-3">Our Vision</h3>
            <p className="text-[#94A3B8] leading-relaxed text-sm font-sans">
              {data.vision}
            </p>
          </div>
        </div>

        {/* Core Values Section */}
        <div className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Our Core Architecture Values
            </h3>
            <p className="text-[#94A3B8] text-sm mt-2 font-sans">
              Values that guide our design choices, performance tuning, and systems optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {values.map((v, idx) => {
              const IconComp = v.icon;
              return (
                <div 
                  key={idx}
                  className="premium-card p-5 sm:p-6 rounded-2xl transition-all duration-300 group"
                  id={`value-card-${idx}`}
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-[#12343b] group-hover:bg-[#e1b382]/10 rounded-xl border border-[#3f6973] group-hover:border-[#e1b382] mb-4 transition-all duration-300">
                    <IconComp className="w-5 h-5 text-[#e1b382]" />
                  </div>
                  <h4 className="text-base font-semibold text-white mb-2 group-hover:text-[#e1b382] transition-colors">{v.title}</h4>
                  <p className="text-xs text-[#94A3B8] leading-relaxed font-sans">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline Journey */}
        <div>
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
              The Evolution Timeline
            </h3>
            <p className="text-[#94A3B8] text-sm mt-2 font-sans">
              A historical walk through ApnaKhaiyal's major releases and achievements over the last 4+ years.
            </p>
          </div>

          <div className="relative border-l border-[#3f6973] max-w-3xl mx-auto pl-6 sm:pl-10 space-y-8 sm:space-y-12">
            {timeline.map((item, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                key={idx} 
                className="relative group"
                id={`timeline-item-${idx}`}
              >
                {/* TIMELINE CONNECTOR DOT */}
                <span className="absolute -left-[33px] sm:-left-[49px] top-1.5 w-4 h-4 rounded-full bg-[#12343b] border-2 border-[#3f6973] group-hover:border-[#e1b382] transition-all duration-300 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e1b382] scale-0 group-hover:scale-100 transition-all duration-300" />
                </span>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-[#e1b382] bg-[#e1b382]/10 px-2.5 py-1 rounded border border-[#e1b382]/20 inline-block w-fit mb-1.5 sm:mb-0">
                    {item.year}
                  </span>
                  <h4 className="text-base font-semibold text-white tracking-wide sm:text-right group-hover:text-[#e1b382] transition-colors">
                    {item.title}
                  </h4>
                </div>
                
                <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed font-sans sm:text-left">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
