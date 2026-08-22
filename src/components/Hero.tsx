import { motion } from 'motion/react';
import { HeroData, HeroSlide, ServiceItem, ProductItem } from '../types';
import heroOffice from '../assets/images/hero_office_building_1784921030842.jpg';
import HeroSlider from './HeroSlider';

interface HeroProps {
  data: HeroData;
  heroSlides?: HeroSlide[];
  setCurrentTab: (tab: string) => void;
  services?: ServiceItem[];
  products?: ProductItem[];
}

export default function Hero({ data, heroSlides = [], setCurrentTab, services = [], products = [] }: HeroProps) {
  const bgImage = (data.imageUrl && data.imageUrl.trim() !== '') ? data.imageUrl : heroOffice;

  return (
    <section
      className="relative min-h-[580px] sm:min-h-[640px] w-full flex flex-col justify-center bg-[#12343b] overflow-hidden pt-20 sm:pt-24 pb-12"
      id="home-hero"
    >
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={bgImage}
          alt="Corporate Headquarters"
          className="absolute inset-0 w-full h-full object-cover object-right"
          referrerPolicy="no-referrer"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#12343b] via-[#12343b]/85 via-[42%] to-transparent to-[65%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2d545e]/50 via-transparent to-transparent" style={{ maxWidth: '58%' }} />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#12343b]/70 to-transparent" />
        <div className="absolute top-1/4 left-[-4rem] w-[480px] h-[480px] bg-[#e1b382]/10 rounded-full filter blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[420px] h-[420px] bg-[#2d545e]/50 rounded-full filter blur-[160px] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-12 flex flex-col justify-center items-start text-left">
        <div className="max-w-[620px] w-full text-left flex flex-col items-start">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-sans tracking-tight text-white mb-5 leading-[1.15] text-left [text-wrap:balance]"
            id="hero-heading"
          >
            {data.heading.includes('Through') ? (
              <>
                <span className="text-white">{data.heading.split('Through')[0]}</span>
                <br className="hidden sm:inline" />
                <span className="gold-text-gradient">
                  Through {data.heading.split('Through').slice(1).join('Through')}
                </span>
              </>
            ) : (
              <span className="gold-text-gradient">{data.heading}</span>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg text-[#cbd8dc] font-sans max-w-[560px] mb-7 leading-relaxed text-left"
            id="hero-subheading"
          >
            {data.subHeading}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-[620px]"
            id="hero-slider-wrapper"
          >
            <HeroSlider slides={heroSlides} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
