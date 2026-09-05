  import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code, 
  Award, 
  Shield, 
  Sparkles, 
  Smartphone, 
  Globe, 
  Monitor, 
  Cpu, 
  TrendingUp, 
  Users, 
  Check, 
  Star, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ChevronUp, 
  MessageSquare, 
  ArrowRight, 
  ShieldCheck, 
  Quote,
  Activity,
  Workflow,
  Laptop,
  Search,
  Layers,
  CheckCircle2,
  Rocket,
  Zap,
  Database,
  Terminal,
  Server,
  Plus
} from 'lucide-react';

import { dbStore, getAvatarUrl, syncAllFromSupabase, isSupabaseConfigured, supabase, verifyAndStoreAdminRole } from './lib/db';
import { 
  HeroData, 
  AboutData, 
  ServiceItem, 
  ProductItem, 
  TeamMember, 
  GalleryItem, 
  ClientReview, 
  CareerOpportunity, 
  JobApplication,
  ContactMessage, 
  SystemSettings, 
  CompanyInformation,
  CompanyContact,
  SEOSettings,
  ExpertiseItem,
  CorporateOfficeSettings,
  HeroSlide,
  ProcessItem,
  IndustryItem,
  TechStackItem
} from './types';

// Import our modular view components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import AboutView from './components/AboutView';
import ServicesView, { getServiceIcon } from './components/ServicesView';
import ProductsView from './components/ProductsView';
import GalleryView from './components/GalleryView';
import TeamView from './components/TeamView';
import CareersView from './components/CareersView';
import ContactView from './components/ContactView';
import AdminPanel from './components/AdminPanel';
import ErrorBoundary from './components/ErrorBoundary';
import AddReviewModal from './components/AddReviewModal';

const ProcessIcon = ({ iconName }: { iconName?: string }) => {
  if (!iconName) return <Sparkles className="w-5 h-5 text-[#e1b382]" />;
  const lower = iconName.toLowerCase().trim();
  if (lower === 'search' || lower === 'discovery') return <Search className="w-5 h-5" />;
  if (lower === 'layers' || lower === 'architecture') return <Layers className="w-5 h-5" />;
  if (lower === 'checkcircle2' || lower === 'check' || lower === 'refining & qa' || lower === 'qa') return <CheckCircle2 className="w-5 h-5" />;
  if (lower === 'rocket' || lower === 'operations' || lower === 'deploy') return <Rocket className="w-5 h-5" />;
  if (lower === 'cpu') return <Cpu className="w-5 h-5" />;
  if (lower === 'sparkles') return <Sparkles className="w-5 h-5" />;
  if (lower === 'workflow') return <Workflow className="w-5 h-5" />;
  if (lower === 'code') return <Code className="w-5 h-5" />;
  if (lower === 'zap') return <Zap className="w-5 h-5" />;
  if (lower === 'database') return <Database className="w-5 h-5" />;
  if (lower === 'terminal') return <Terminal className="w-5 h-5" />;
  if (lower === 'shield' || lower === 'shieldcheck') return <ShieldCheck className="w-5 h-5" />;
  if (lower === 'globe') return <Globe className="w-5 h-5" />;
  if (lower === 'monitor') return <Monitor className="w-5 h-5" />;
  if (lower === 'smartphone') return <Smartphone className="w-5 h-5" />;
  if (iconName.length <= 4) {
    return <span className="text-base">{iconName}</span>;
  }
  return <Sparkles className="w-5 h-5" />;
};

const TechIcon = ({ iconName }: { iconName?: string }) => {
  if (!iconName) return <Code className="w-6 h-6" />;
  const lower = iconName.toLowerCase().trim();
  if (lower === 'code') return <Code className="w-6 h-6" />;
  if (lower === 'server') return <Server className="w-6 h-6" />;
  if (lower === 'database') return <Database className="w-6 h-6" />;
  if (lower === 'cpu') return <Cpu className="w-6 h-6" />;
  if (lower === 'terminal') return <Terminal className="w-6 h-6" />;
  if (lower === 'zap') return <Zap className="w-6 h-6" />;
  if (lower === 'layers') return <Layers className="w-6 h-6" />;
  if (lower === 'globe') return <Globe className="w-6 h-6" />;
  if (lower === 'shield' || lower === 'shieldcheck') return <ShieldCheck className="w-6 h-6" />;
  if (lower === 'sparkles') return <Sparkles className="w-6 h-6" />;
  if (lower === 'workflow') return <Workflow className="w-6 h-6" />;
  if (lower === 'search') return <Search className="w-6 h-6" />;
  if (lower === 'monitor') return <Monitor className="w-6 h-6" />;
  if (lower === 'smartphone') return <Smartphone className="w-6 h-6" />;
  if (lower === 'laptop') return <Laptop className="w-6 h-6" />;
  if (lower === 'rocket') return <Rocket className="w-6 h-6" />;
  return <Code className="w-6 h-6" />;
};

export default function App() {
  // Custom router state synced with window.location.pathname
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  // Dark Theme Enforcement
  useEffect(() => {
    document.documentElement.classList.remove('light-theme');
    document.documentElement.classList.add('dark');
  }, []);

  // Navigation Routing State
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return (
      sessionStorage.getItem('isAdminLoggedIn') === 'true' ||
      localStorage.getItem('isAdminLoggedIn') === 'true'
    );
  });

  // Supabase auth state listener & session check
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          const roleCheck = await verifyAndStoreAdminRole(session.user.id, session.user.email, session.user.user_metadata?.full_name);
          if (roleCheck.isAdmin) {
            setIsAdminLoggedIn(true);
            if (localStorage.getItem('admin_remember_me') === 'true') {
              localStorage.setItem('isAdminLoggedIn', 'true');
            } else {
              sessionStorage.setItem('isAdminLoggedIn', 'true');
            }
          } else {
            console.warn('[Session Verify] User has active Auth session but no record in public.admins. Signing out.');
            await supabase.auth.signOut();
            setIsAdminLoggedIn(false);
            sessionStorage.removeItem('isAdminLoggedIn');
            localStorage.removeItem('isAdminLoggedIn');
          }
        } else {
          setIsAdminLoggedIn(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            const roleCheck = await verifyAndStoreAdminRole(session.user.id, session.user.email, session.user.user_metadata?.full_name);
            if (roleCheck.isAdmin) {
              setIsAdminLoggedIn(true);
              if (localStorage.getItem('admin_remember_me') === 'true') {
                localStorage.setItem('isAdminLoggedIn', 'true');
              } else {
                sessionStorage.setItem('isAdminLoggedIn', 'true');
              }
            } else {
              setIsAdminLoggedIn(false);
              sessionStorage.removeItem('isAdminLoggedIn');
              localStorage.removeItem('isAdminLoggedIn');
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setIsAdminLoggedIn(false);
          sessionStorage.removeItem('isAdminLoggedIn');
          localStorage.removeItem('isAdminLoggedIn');
        } else if (event === 'PASSWORD_RECOVERY') {
          window.history.pushState({}, '', '/admin/reset-password');
          setCurrentPath('/admin/reset-password');
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setIsAdminLoggedIn(false);
    }
  }, []);

  // Global login handlers to sync session
  const handleLogin = () => {
    setIsAdminLoggedIn(true);
    if (localStorage.getItem('admin_remember_me') === 'true') {
      localStorage.setItem('isAdminLoggedIn', 'true');
    } else {
      sessionStorage.setItem('isAdminLoggedIn', 'true');
    }
    window.history.pushState({}, '', '/admin/dashboard');
    setCurrentPath('/admin/dashboard');
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Supabase signout error:', e);
      }
    }
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('admin_remember_me');
    window.history.pushState({}, '', '/admin/login');
    setCurrentPath('/admin/login');
  };

  // Synchronize browser history and path changes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Secure admin routing controller & auth guards
  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);

    if (searchParams.get('action') === 'review') {
      setIsReviewModalOpen(true);
      setCurrentTab('home');
      setTimeout(() => {
        const el = document.getElementById('home-testimonials');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }

    if (hash.includes('access_token') || hash.includes('type=recovery')) {
      if (currentPath !== '/admin/reset-password') {
        window.history.replaceState({}, '', '/admin/reset-password');
        setCurrentPath('/admin/reset-password');
      }
      return;
    }

    if (path.startsWith('/admin')) {
      const publicAdminPaths = ['/admin/login', '/admin/forgot-password', '/admin/reset-password'];
      if (publicAdminPaths.includes(path)) {
        if (isAdminLoggedIn && path === '/admin/login') {
          // Redirect authenticated user to dashboard
          window.history.replaceState({}, '', '/admin/dashboard');
          setCurrentPath('/admin/dashboard');
        }
      } else {
        // Unauthenticated access to /admin/* redirects to /admin/login
        if (!isAdminLoggedIn) {
          window.history.replaceState({}, '', '/admin/login');
          setCurrentPath('/admin/login');
        } else if (path === '/admin' || path === '/admin/') {
          // Authenticated /admin redirects to dashboard
          window.history.replaceState({}, '', '/admin/dashboard');
          setCurrentPath('/admin/dashboard');
        }
      }
    }
  }, [currentPath, isAdminLoggedIn]);

  // Core Reactive States
  const [hero, setHero] = useState<HeroData>(dbStore.getHero());
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(dbStore.getHeroSlides());
  const [about, setAbout] = useState<AboutData>(dbStore.getAbout());
  const [services, setServices] = useState<ServiceItem[]>(dbStore.getServices());
  const [products, setProducts] = useState<ProductItem[]>(dbStore.getProducts());
  const [team, setTeam] = useState<TeamMember[]>(dbStore.getTeam());
  const [gallery, setGallery] = useState<GalleryItem[]>(dbStore.getGallery());
  const [reviews, setReviews] = useState<ClientReview[]>(dbStore.getReviews());
  const [careers, setCareers] = useState<CareerOpportunity[]>(dbStore.getCareers());
  const [applications, setApplications] = useState<JobApplication[]>(dbStore.getApplications());
  const [messages, setMessages] = useState<ContactMessage[]>(dbStore.getMessages());
  const [settings, setSettings] = useState<SystemSettings>(dbStore.getSettings());
  const [companyInformation, setCompanyInformation] = useState<CompanyInformation>(() => dbStore.getCompanyInformation());
  const [companyContact, setCompanyContact] = useState<CompanyContact>(() => dbStore.getCompanyInformation());
  const [seo, setSEO] = useState<SEOSettings>(dbStore.getSEO());
  const [expertise, setExpertise] = useState<ExpertiseItem[]>(dbStore.getExpertise());
  const [office, setOffice] = useState<CorporateOfficeSettings>(dbStore.getOffice());
  const [processItems, setProcessItems] = useState<ProcessItem[]>(dbStore.getProcess());
  const [industryItems, setIndustryItems] = useState<IndustryItem[]>(() => dbStore.getIndustries());
  const [techStackItems, setTechStackItems] = useState<TechStackItem[]>(() => dbStore.getTechStack());
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  // Asynchronously fetch latest data from Supabase if configured
  useEffect(() => {
    const initSync = async () => {
      setIsDataLoading(true);
      const liveData = await syncAllFromSupabase();
      if (liveData) {
        if (liveData.hero) setHero(liveData.hero);
        if (Array.isArray(liveData.heroSlides) && liveData.heroSlides.length > 0) setHeroSlides(liveData.heroSlides);
        if (liveData.about) setAbout(liveData.about);
        if (Array.isArray(liveData.services) && liveData.services.length > 0) setServices(liveData.services);
        if (Array.isArray(liveData.products) && liveData.products.length > 0) setProducts(liveData.products);
        if (Array.isArray(liveData.team) && liveData.team.length > 0) setTeam(liveData.team);
        if (Array.isArray(liveData.gallery) && liveData.gallery.length > 0) setGallery(liveData.gallery);
        if (Array.isArray(liveData.reviews) && liveData.reviews.length > 0) setReviews(liveData.reviews);
        if (liveData.careers) {
          const normCareers = Array.isArray(liveData.careers)
          ? liveData.careers
          : (liveData.careers && typeof liveData.careers === 'object'
           ? [liveData.careers]
           : []);
       if (normCareers.length > 0) {
         setCareers(normCareers);
       }
     }
        if (liveData.applications) {
          const normApps = Array.isArray(liveData.applications)
            ? liveData.applications
            : (liveData.applications && typeof liveData.applications === 'object' ? [liveData.applications] : []);
          // Never wipe locally loaded applications when Supabase returns an empty/temporary response.
          if (normApps.length > 0) {
            setApplications(normApps);
          }
        }
        if (Array.isArray(liveData.messages) && liveData.messages.length > 0) setMessages(liveData.messages);
        if (liveData.settings) setSettings(liveData.settings);
        if (liveData.companyInformation) {
          setCompanyInformation(liveData.companyInformation);
          setCompanyContact(liveData.companyInformation);
        } else if (liveData.companyContact) {
          setCompanyInformation(liveData.companyContact);
          setCompanyContact(liveData.companyContact);
        }
        if (liveData.seo) setSEO(liveData.seo);
        if (Array.isArray(liveData.expertise) && liveData.expertise.length > 0) setExpertise(liveData.expertise);
        if (liveData.office) setOffice(liveData.office);
        if (Array.isArray(liveData.process) && liveData.process.length > 0) setProcessItems(liveData.process);
        if (Array.isArray(liveData.industries) && liveData.industries.length > 0) setIndustryItems(liveData.industries);
        if (Array.isArray(liveData.techStack) && liveData.techStack.length > 0) setTechStackItems(liveData.techStack);
      }
      setIsDataLoading(false);
    };
    initSync();
  }, []);

  // Slider indices
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);
  const [slideDirection, setSlideDirection] = useState<number>(1);
  const [activeProdIdx, setActiveProdIdx] = useState(0);
  const [expandedProdId, setExpandedProdId] = useState<string | null>(null);
  const [isProdSliderHovered, setIsProdSliderHovered] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProductForDemo, setSelectedProductForDemo] = useState<string>('');

  // Handle Book Demo navigation & product prefilling
  const handleBookDemo = (productName: string) => {
    setSelectedProductForDemo(productName);
    setCurrentTab('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const contactFormEl = document.getElementById('contact-form-card') || document.getElementById('contact-page');
      if (contactFormEl) {
        contactFormEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  // Filter approved reviews for public display
  const approvedReviews = useMemo(() => {
    return (Array.isArray(reviews) ? reviews : []).filter(r => r && (r.status === 'approved' || !r.status));
  }, [reviews]);

  // Sync state helpers
  const handleSaveHero = (data: HeroData) => {
    setHero(data);
    dbStore.saveHero(data);
  };

  const handleSaveHeroSlides = (data: HeroSlide[]) => {
    setHeroSlides(data);
    dbStore.saveHeroSlides(data);
  };

  const handleSaveAbout = (data: AboutData) => {
    setAbout(data);
    dbStore.saveAbout(data);
  };

  const handleSaveServices = async (data: ServiceItem[]) => {
    // Wait until Supabase confirms the save before treating the edit as
    // persisted. This prevents stale background syncs from winning a race.
    await dbStore.saveServices(data);
    setServices(data);
  };

  const handleSaveProducts = (data: ProductItem[]) => {
    setProducts(data);
    dbStore.saveProducts(data);
  };

  const handleSaveTeam = (data: TeamMember[]) => {
    setTeam(data);
    dbStore.saveTeam(data);
  };

  const handleUpdateTeamInPlace = (data: TeamMember[]) => {
    setTeam(data);
    localStorage.setItem('apnakhaiyal_team', JSON.stringify(data));
  };

  const handleSaveGallery = (data: GalleryItem[]) => {
    setGallery(data);
    dbStore.saveGallery(data);
  };

  const handleSaveReviews = (data: ClientReview[]) => {
    setReviews(data);
    dbStore.saveReviews(data);
  };

  const handleSaveCareers = (data: CareerOpportunity[]) => {
    setCareers(data);
    dbStore.saveCareers(data);
  };

  const handleSaveApplications = (data: JobApplication[]) => {
    setApplications(data);
    dbStore.saveApplications(data);
  };

  const handleSaveMessages = (data: ContactMessage[]) => {
    setMessages(data);
    dbStore.saveMessages(data);
  };

  const handleSaveSettings = (data: SystemSettings) => {
    setSettings(data);
    dbStore.saveSettings(data);
  };

  const handleSaveSEO = (data: SEOSettings) => {
    setSEO(data);
    dbStore.saveSEO(data);
  };

  const handleSaveExpertise = (data: ExpertiseItem[]) => {
    setExpertise(data);
    dbStore.saveExpertise(data);
  };

  const handleSaveOffice = (data: CorporateOfficeSettings) => {
    setOffice(data);
    dbStore.saveOffice(data);
  };

  const handleSaveProcess = (data: ProcessItem[]) => {
    setProcessItems(data);
    dbStore.saveProcess(data);
  };

  const handleSaveIndustries = (data: IndustryItem[]) => {
    setIndustryItems(data);
    dbStore.saveIndustries(data);
  };

  const handleSaveTechStack = (data: TechStackItem[]) => {
    setTechStackItems(data);
    dbStore.saveTechStack(data);
  };

  // Append new application from Careers Portal
  const handleAddApplication = (newApp: JobApplication) => {
    const updated = [newApp, ...applications];
    handleSaveApplications(updated);
  };

  // Append message from Contact Desk
  const handleSendMessage = (newMsg: ContactMessage) => {
    const updated = [newMsg, ...messages];
    handleSaveMessages(updated);
  };

  // SEO Update Handler on state change
  useEffect(() => {
    document.title = (seo.metaTitle || "ApnaKhaiyal").replace(/\s*SMC\s*(Pvt\s*Ltd|Private\s*Limited)?/gi, '').trim() || "ApnaKhaiyal";
    
    // Manage meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', seo.metaDescription);

    // Manage meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', seo.keywords);
  }, [seo]);

  // Next and previous controls for slider
  const handlePrevReview = () => {
    if (approvedReviews.length === 0) return;
    setSlideDirection(-1);
    setActiveReviewIdx(prev => prev > 0 ? prev - 1 : approvedReviews.length - 1);
  };

  const handleNextReview = () => {
    if (approvedReviews.length === 0) return;
    setSlideDirection(1);
    setActiveReviewIdx(prev => prev < approvedReviews.length - 1 ? prev + 1 : 0);
  };

  const handleSubmitPublicReview = (newReview: ClientReview) => {
    const updated = [newReview, ...(Array.isArray(reviews) ? reviews : [])];
    handleSaveReviews(updated);
  };

  const handlePrevProd = () => {
    const featuredList = (Array.isArray(products) ? products : []).filter(p => p && p.featured);
    setActiveProdIdx(prev => prev > 0 ? prev - 1 : (featuredList.length > 0 ? featuredList.length - 1 : 0));
  };

  const handleNextProd = () => {
    const featuredList = (Array.isArray(products) ? products : []).filter(p => p && p.featured);
    if (featuredList.length === 0) return;
    setActiveProdIdx(prev => prev < featuredList.length - 1 ? prev + 1 : 0);
  };

  // Auto-play timer for Featured Products slider (cycles every 5s, pauses on hover)
  useEffect(() => {
    if (currentTab !== 'home' || isProdSliderHovered) return;
    const featuredList = (Array.isArray(products) ? products : []).filter(p => p && p.featured);
    if (featuredList.length <= 1) return;

    const timer = setInterval(() => {
      setActiveProdIdx(prev => (prev < featuredList.length - 1 ? prev + 1 : 0));
    }, 5000);

    return () => clearInterval(timer);
  }, [currentTab, isProdSliderHovered, products]);

  if (currentPath.startsWith('/admin')) {
    return (
      <ErrorBoundary fallbackTitle="Admin Panel Workspace Notice">
        <AdminPanel 
          products={products}
          saveProducts={handleSaveProducts}
          services={services}
          saveServices={handleSaveServices}
          team={team}
          saveTeam={handleSaveTeam}
          updateTeamInPlace={handleUpdateTeamInPlace}
          gallery={gallery}
          saveGallery={handleSaveGallery}
          reviews={reviews}
          saveReviews={handleSaveReviews}
          careers={careers}
          saveCareers={handleSaveCareers}
          applications={applications}
          saveApplications={handleSaveApplications}
          messages={messages}
          saveMessages={handleSaveMessages}
          hero={hero}
          saveHero={handleSaveHero}
          heroSlides={heroSlides}
          saveHeroSlides={handleSaveHeroSlides}
          about={about}
          saveAbout={handleSaveAbout}
          settings={settings}
          saveSettings={handleSaveSettings}
          seo={seo}
          saveSEO={handleSaveSEO}
          expertise={expertise}
          saveExpertise={handleSaveExpertise}
          office={office}
          saveOffice={handleSaveOffice}
          processItems={processItems}
          saveProcess={handleSaveProcess}
          industryItems={industryItems}
          saveIndustries={handleSaveIndustries}
          techStackItems={techStackItems}
          saveTechStack={handleSaveTechStack}
          companyInformation={companyInformation}
          onCompanyInformationUpdated={(info) => {
            setCompanyInformation(info);
            setCompanyContact(info);
          }}
          companyContact={companyContact}
          onCompanyContactUpdated={(cc) => {
            setCompanyInformation(cc);
            setCompanyContact(cc);
          }}
          isAdminLoggedIn={isAdminLoggedIn}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen relative font-sans transition-colors duration-300 bg-[#12343b] text-white selection:bg-[#e1b382] selection:text-[#12343b]">
      
      {/* 1. Header Global Navbar */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        settings={settings}
        companyInformation={companyInformation}
        companyContact={companyContact}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={() => {
          setIsAdminLoggedIn(false);
          setCurrentTab('home');
        }}
      />

      {/* 2. Main content views (with fade transitions) */}
      <main className="pb-6 min-h-[75vh]">
        <AnimatePresence mode="wait">
          
          {/* ==================== HOME PAGE VIEW ==================== */}
          {currentTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-10 sm:space-y-12"
            >
              {/* Hero block */}
              <Hero data={hero} heroSlides={heroSlides} setCurrentTab={setCurrentTab} services={services} products={products} />

              {/* Company Introduction brief */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2" id="home-intro">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
                      We Engineer High-Yield Digital Infrastructure
                    </h2>
                    <p className="text-[#CBD5E1] text-sm sm:text-base leading-relaxed font-sans">
                      {about.companyStory.split('.')[0]}. {about.companyStory.split('.')[1]}.
                    </p>
                  </div>

                  {/* Intro Visual Deck - One Large Premium Image Card */}
                  <div className="lg:col-span-6">
                    <div className="relative w-full rounded-[18px] overflow-hidden border border-[#3f6973] hover:border-[#e1b382] transition-colors duration-500 shadow-2xl group bg-[#12343b]/80 aspect-[16/10] sm:aspect-[16/9]">
                      <img
                        src={about.imageUrl && about.imageUrl.trim() !== '' ? about.imageUrl : 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop'}
                        alt="Company Infrastructure Overview"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop';
                        }}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#12343b]/60 via-transparent to-transparent pointer-events-none" />
                    </div>
                  </div>
                </div>
              </section>

              {/* Our Services Quick Grid */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2" id="home-services-teaser">
                <div className="text-center mb-6 sm:mb-8">
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-wide">
                    {settings?.servicesSectionHeading || 'Our Expertise'}
                  </h3>
                  {settings?.servicesSectionSubtitle && settings.servicesSectionSubtitle.trim() !== '' && (
                    <p className="text-[#CBD5E1] text-xs sm:text-sm mt-1.5 font-sans">
                      {settings.servicesSectionSubtitle}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {isDataLoading || services.length === 0 ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                      <div
                        key={`home-svc-skel-${idx}`}
                        className="premium-card p-5 rounded-2xl space-y-3 animate-pulse border border-[#3f6973]/60 bg-[#2d545e]/50 shadow-md"
                      >
                        <div className="w-2/3 h-5 bg-[#3f6973]/80 rounded-md" />
                        <div className="w-full h-3.5 bg-[#3f6973]/50 rounded-sm" />
                        <div className="w-4/5 h-3.5 bg-[#3f6973]/30 rounded-sm" />
                      </div>
                    ))
                  ) : (
                    services.slice(0, 3).map((svc, idx) => {
                      const IconComponent = getServiceIcon(svc.icon);
                      return (
                      <div
                        key={svc.id}
                        onClick={() => {
                          setCurrentTab('services');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                         className="premium-card p-5 rounded-2xl space-y-3 group hover:border-[#e1b382]/50 transition-all duration-200 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
                      >
                          <div className="space-y-3">
                            <div className="w-11 h-11 rounded-xl bg-[#12343b] border border-[#e1b382]/40 flex items-center justify-center shrink-0 text-[#e1b382] group-hover:border-[#e1b382] group-hover:scale-105 transition-all shadow-md">
                              <IconComponent className="w-5 h-5 text-[#e1b382] shrink-0" />
                            </div>
                            <h4 className="text-base font-bold text-white group-hover:text-[#e1b382] transition-colors">{svc.title}</h4>
                            <p className="text-xs text-[#CBD5E1] leading-relaxed font-sans line-clamp-3">{svc.description}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="text-center mt-6">
                  <button
                    onClick={() => {
                      setCurrentTab('services');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center space-x-1 px-5 py-2.5 rounded-lg bg-[#2d545e] hover:bg-[#e1b382] text-[#E5E7EB] hover:text-[#12343b] border border-[#3f6973] hover:border-[#e1b382] text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <span>View All Services</span>
                  </button>
                </div>
              </section>

              {/* Featured Products Slider */}
              <section 
                className="bg-[#2d545e]/40 border-y border-[#3f6973] py-10 sm:py-12" 
                id="home-featured-products-slider"
                onMouseEnter={() => setIsProdSliderHovered(true)}
                onMouseLeave={() => setIsProdSliderHovered(false)}
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold tracking-wide">
                        {settings?.productShowcaseSectionHeading?.trim() || 'Featured Proprietary Systems'}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={handlePrevProd}
                        className="w-10 h-10 rounded-lg bg-[#12343b] border border-[#3f6973] text-[#CBD5E1] hover:text-[#e1b382] hover:border-[#e1b382] flex items-center justify-center hover:scale-105 transition-all cursor-pointer"
                        aria-label="Previous Product"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleNextProd}
                        className="w-10 h-10 rounded-lg bg-[#12343b] border border-[#3f6973] text-[#CBD5E1] hover:text-[#e1b382] hover:border-[#e1b382] flex items-center justify-center hover:scale-105 transition-all cursor-pointer"
                        aria-label="Next Product"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Slider Core Frame */}
                  {(() => {
                    const featuredList = products.filter(p => p.featured);
                    if (false) {
                      return (
                        <div className="premium-card rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl animate-pulse border border-[#3f6973]/60 bg-[#2d545e]/50">
                          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 sm:gap-8 w-full">
                            <div className="w-full lg:w-1/2 aspect-video rounded-xl bg-[#2d545e] border border-[#3f6973] relative overflow-hidden flex items-center justify-center">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3f6973]/20 to-transparent animate-shimmer" />
                              <div className="absolute top-4 left-4 w-12 h-12 rounded-xl bg-[#12343b] border border-[#3f6973]" />
                              <div className="absolute top-4 right-4 w-20 h-5 rounded-md bg-[#12343b] border border-[#3f6973]" />
                            </div>
                            <div className="w-full lg:w-1/2 space-y-3">
                              <div className="w-28 h-5 rounded bg-[#e1b382]/20 border border-[#e1b382]/20" />
                              <div className="w-3/4 h-7 rounded-lg bg-[#3f6973]/80" />
                              <div className="w-full h-4 rounded bg-[#3f6973]/50" />
                              <div className="w-4/5 h-4 rounded bg-[#3f6973]/40" />
                              <div className="space-y-2 pt-1">
                                <div className="w-3/5 h-4 rounded bg-[#3f6973]/30" />
                                <div className="w-1/2 h-4 rounded bg-[#3f6973]/30" />
                              </div>
                              <div className="pt-3 flex items-center gap-3">
                                <div className="w-32 h-10 rounded-lg bg-[#e1b382]/30" />
                                <div className="w-28 h-10 rounded-lg bg-[#3f6973]/60" />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    if (featuredList.length === 0) return <p className="text-[#CBD5E1] text-xs">No featured products.</p>;
                    const currentProd = featuredList[activeProdIdx] || featuredList[0];
                    const isExpanded = expandedProdId === currentProd.id;

                    return (
                      <motion.div 
                        key={currentProd.id}
                        onClick={() => setExpandedProdId(isExpanded ? null : currentProd.id)}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        transition={{ duration: 0.4 }}
                        className="premium-card rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl cursor-pointer"
                      >
                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 sm:gap-8 w-full">
                          {/* Slide Image */}
                          <div className="w-full lg:w-1/2 aspect-video rounded-xl overflow-hidden border border-[#3f6973] relative shrink-0">
                            <img 
                              src={currentProd.image} 
                              alt={currentProd.name} 
                              className="w-full h-full object-cover grayscale opacity-80"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-4 left-4 w-12 h-12 shrink-0 rounded-xl bg-[#12343b] border border-[#e1b382]/40 flex items-center justify-center font-bold text-[#e1b382] shadow-lg p-1">
                              {currentProd.logoUrl ? (
                                <img src={currentProd.logoUrl} alt={currentProd.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                              ) : (
                                <span className={`text-center font-mono font-bold leading-none ${
                                  currentProd.logoText.length > 4 ? 'text-[10px] tracking-tight' : 'text-xs tracking-wider'
                                }`}>
                                  {currentProd.logoText}
                                </span>
                              )}
                            </div>
                            {currentProd.status && (
                              <div className="absolute top-4 right-4 bg-[#12343b]/90 border border-[#3f6973] px-2.5 py-1 rounded-md text-[10px] font-mono text-[#e1b382]">
                                {currentProd.status}
                              </div>
                            )}
                          </div>

                          {/* Slide Details */}
                          <div className="w-full lg:w-1/2 space-y-3">
                            <span className="text-[10px] font-mono text-[#e1b382] uppercase tracking-widest bg-[#e1b382]/10 px-2.5 py-0.5 rounded border border-[#e1b382]/30 w-fit block">
                              {currentProd.category}
                            </span>
                            <h4 className="text-xl sm:text-2xl font-bold tracking-wide text-white">
                              {currentProd.name}
                            </h4>
                            <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed font-sans">
                              {currentProd.description}
                            </p>

                            <div className="space-y-1.5 pt-1">
                              {currentProd.features.slice(0, 2).map((feat, index) => (
                                <div key={index} className="flex items-center space-x-2 text-xs text-[#E5E7EB] font-sans">
                                  <Check className="w-3.5 h-3.5 text-[#e1b382] shrink-0" />
                                  <span>{feat}</span>
                                </div>
                              ))}
                            </div>

                            <div className="pt-3 flex items-center flex-wrap gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentTab('products');
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-5 py-2.5 rounded-lg bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] hover:text-white text-xs font-bold tracking-wider uppercase shadow hover:scale-105 transition-all cursor-pointer"
                              >
                                Inspect System
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBookDemo(currentProd.name);
                                }}
                                className="px-4 py-2.5 rounded-lg bg-[#12343b] hover:bg-[#e1b382] border border-[#e1b382]/60 hover:border-[#e1b382] text-xs font-bold text-[#e1b382] hover:text-[#12343b] transition-all cursor-pointer shadow-sm uppercase tracking-wider"
                              >
                                Book Demo
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedProdId(isExpanded ? null : currentProd.id);
                                }}
                                className="px-4 py-2.5 rounded-lg bg-[#12343b] hover:bg-[#1f4e5b] border border-[#3f6973] hover:border-[#e1b382] text-xs font-bold text-[#CBD5E1] hover:text-[#e1b382] flex items-center space-x-2 transition-all cursor-pointer"
                                aria-expanded={isExpanded}
                              >
                                <span>{isExpanded ? 'Collapse Details' : 'Read More'}</span>
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-[#e1b382]" /> : <ChevronDown className="w-4 h-4 text-[#e1b382]" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Details Panel */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.35, ease: "easeInOut" }}
                              className="overflow-hidden border-t border-[#3f6973]/60 pt-6 mt-2 space-y-4"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#12343b]/70 p-4 rounded-xl border border-[#3f6973]/80">
                                <div>
                                  <span className="text-[10px] font-mono text-[#e1b382] uppercase tracking-wider block mb-1">Architecture Category</span>
                                  <p className="text-xs font-semibold text-white">{currentProd.category || 'Enterprise System'}</p>
                                </div>
                                <div>
                                  <span className="text-[10px] font-mono text-[#e1b382] uppercase tracking-wider block mb-1">Deployment Status</span>
                                  <p className="text-xs font-semibold text-white">{currentProd.status || 'Active Production'}</p>
                                </div>
                                <div>
                                  <span className="text-[10px] font-mono text-[#e1b382] uppercase tracking-wider block mb-1">Module Count</span>
                                  <p className="text-xs font-semibold text-white">{currentProd.features.length} Core Features</p>
                                </div>
                              </div>

                              {currentProd.features.length > 2 && (
                                <div className="space-y-2">
                                  <h5 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center space-x-2">
                                    <Sparkles className="w-3.5 h-3.5 text-[#e1b382]" />
                                    <span>All Built-in System Capabilities</span>
                                  </h5>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {currentProd.features.map((feat, fIdx) => (
                                      <div key={fIdx} className="p-2.5 bg-[#12343b]/40 rounded-lg border border-[#3f6973]/50 flex items-center space-x-2 text-xs text-[#CBD5E1]">
                                        <Check className="w-3.5 h-3.5 text-[#e1b382] shrink-0" />
                                        <span>{feat}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {(currentProd.gallery && currentProd.gallery.length > 0) && (
                                <div className="space-y-2 pt-2">
                                  <h5 className="text-xs font-bold uppercase tracking-wider text-white font-mono">System Visual Gallery</h5>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {currentProd.gallery.map((gImg, gIdx) => (
                                      <div key={gIdx} className="aspect-video rounded-lg overflow-hidden border border-[#3f6973]/60 bg-black/40">
                                        <img src={gImg} alt={`System preview ${gIdx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })()}

                </div>
              </section>

              {/* Development Process */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2" id="home-process">
                <div className="text-center mb-6 sm:mb-8">
                  <h3 className="text-2xl sm:text-3xl font-extrabold">
                    {settings.processSectionMainHeading || 'Our Rigorous Development Process'}
                  </h3>
                  {settings.processSectionSubtitle && settings.processSectionSubtitle.trim() !== '' && (
                    <p className="text-[#CBD5E1] text-xs sm:text-sm mt-2 font-sans max-w-2xl mx-auto leading-relaxed">
                      {settings.processSectionSubtitle}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {processItems
                    .filter(p => p.active !== false)
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((p) => (
                      <div key={p.id} className="premium-card p-5 rounded-2xl relative group hover:border-[#e1b382]/50 transition-all">
                        {p.icon && (
                          <div className="w-9 h-9 rounded-xl bg-[#e1b382]/10 border border-[#e1b382]/30 flex items-center justify-center mb-2.5 text-[#e1b382] group-hover:bg-[#e1b382] group-hover:text-[#12343b] transition-colors">
                            <ProcessIcon iconName={p.icon} />
                          </div>
                        )}
                        <h4 className="text-sm font-semibold text-white mb-1.5">{p.title}</h4>
                        <p className="text-xs text-[#CBD5E1] font-sans leading-relaxed">{p.description}</p>
                      </div>
                    ))}
                </div>
              </section>

              {/* Industries We Serve */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2" id="home-industries">
                <div className="premium-card rounded-2xl p-6 sm:p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold tracking-wide">
                      {settings.industriesSectionHeading || 'Industries We Serve'}
                    </h3>
                    {settings.industriesSectionSubtitle && settings.industriesSectionSubtitle.trim() !== '' && (
                      <p className="text-[#CBD5E1] text-xs mt-1 font-sans">
                        {settings.industriesSectionSubtitle}
                      </p>
                    )}
                  </div>

                  {industryItems.filter(ind => ind.active !== false).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 text-center font-mono text-xs text-[#CBD5E1]">
                      {industryItems
                        .filter(ind => ind.active !== false)
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((ind) => (
                          <div key={ind.id} className="p-3.5 bg-[#12343b]/60 rounded-xl border border-[#3f6973] hover:border-[#e1b382] transition-all flex items-center justify-center">
                            <span className="font-sans font-medium text-[#E5E7EB]">{ind.title}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Technology Stack Grid */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2" id="home-techstack">
                <div className="text-center mb-6 sm:mb-8">
                  <h3 className="text-2xl sm:text-3xl font-extrabold">
                    {settings.techStackSectionHeading || 'Our Technology Stack'}
                  </h3>
                  {settings.techStackSectionSubtitle && settings.techStackSectionSubtitle.trim() !== '' && (
                    <p className="text-[#CBD5E1] text-xs sm:text-sm mt-2 font-sans max-w-2xl mx-auto leading-relaxed">
                      {settings.techStackSectionSubtitle}
                    </p>
                  )}
                </div>

                {techStackItems.filter(st => st.active !== false).length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center font-mono text-xs">
                    {techStackItems
                      .filter(st => st.active !== false)
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map((st, idx) => (
                        <motion.div 
                          key={st.id} 
                          initial={{ opacity: 0, y: 25 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-30px" }}
                          transition={{ duration: 0.45, delay: idx * 0.08, ease: "easeOut" }}
                          className="premium-card p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-center hover:border-[#e1b382]/50 transition-all"
                        >
                          {st.iconType === 'image' && st.imageUrl ? (
                            <img src={st.imageUrl} alt={st.title} className="w-8 h-8 object-contain mb-2 rounded" />
                          ) : (
                            st.iconName && (
                              <div className="mb-2 text-[#e1b382]">
                                <TechIcon iconName={st.iconName} />
                              </div>
                            )
                          )}
                          <span className="text-[#e1b382] block font-semibold mb-1.5">{st.title}</span>
                          <p className="text-[11px] text-[#CBD5E1] leading-relaxed font-sans">{st.description}</p>
                        </motion.div>
                      ))}
                  </div>
                )}
              </section>

              {/* Client Reviews Slider */}
              <section className="bg-[#2d545e]/30 border-y border-[#3f6973] py-10 sm:py-12" id="home-testimonials">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <h3 className="text-2xl sm:text-3xl font-extrabold mb-6 sm:mb-8">What Our Corporate Partners Say</h3>

                  <AnimatePresence mode="wait">
                    {approvedReviews.length > 0 ? (
                      <motion.div
                        key={activeReviewIdx}
                        initial={{ opacity: 0, x: slideDirection * 40, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -slideDirection * 40, scale: 0.98 }}
                        transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                        className="space-y-4"
                      >
                        <div className="w-10 h-10 bg-[#e1b382]/10 border border-[#e1b382]/30 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Quote className="w-4 h-4 text-[#e1b382]" />
                        </div>
                        
                        <p className="text-base sm:text-lg text-[#E5E7EB] font-sans max-w-3xl mx-auto italic leading-relaxed">
                          "{approvedReviews[activeReviewIdx % approvedReviews.length]?.review}"
                        </p>

                        <div className="flex items-center justify-center space-x-1 text-[#e1b382]">
                          {Array.from({ length: approvedReviews[activeReviewIdx % approvedReviews.length]?.rating || 5 }).map((_, rIdx) => (
                            <Star key={rIdx} className="w-4 h-4 fill-current" />
                          ))}
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white tracking-wide">{approvedReviews[activeReviewIdx % approvedReviews.length]?.name}</h4>
                          <span className="text-xs text-[#CBD5E1] block font-sans mt-0.5">
                            {approvedReviews[activeReviewIdx % approvedReviews.length]?.designation} · {approvedReviews[activeReviewIdx % approvedReviews.length]?.company}
                            {approvedReviews[activeReviewIdx % approvedReviews.length]?.country && ` (${approvedReviews[activeReviewIdx % approvedReviews.length]?.country})`}
                          </span>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="p-6 bg-[#12343b]/60 border border-[#3f6973] rounded-2xl max-w-lg mx-auto text-center space-y-2">
                        <p className="text-sm text-[#CBD5E1]">No published reviews available yet. Be the first to share your feedback!</p>
                      </div>
                    )}
                  </AnimatePresence>

                  {approvedReviews.length > 1 && (
                    <div className="flex items-center justify-center space-x-3 mt-6">
                      <button
                        onClick={handlePrevReview}
                        className="w-9 h-9 rounded-lg bg-[#12343b] border border-[#3f6973] text-[#CBD5E1] hover:text-[#e1b382] hover:border-[#e1b382] flex items-center justify-center cursor-pointer transition-all hover:scale-105"
                        aria-label="Previous Testimonial"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleNextReview}
                        className="w-9 h-9 rounded-lg bg-[#12343b] border border-[#3f6973] text-[#CBD5E1] hover:text-[#e1b382] hover:border-[#e1b382] flex items-center justify-center cursor-pointer transition-all hover:scale-105"
                        aria-label="Next Testimonial"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Centered Premium "Add Review" Button */}
                  <div className="pt-8 mt-8 border-t border-[#3f6973]/50 flex justify-center">
                    <button
                      onClick={() => setIsReviewModalOpen(true)}
                      className="px-8 py-3.5 rounded-xl bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] hover:text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg hover:shadow-2xl flex items-center space-x-2.5 group"
                    >
                      <Plus className="w-4 h-4 transition-transform group-hover:scale-125" />
                      <span>Add Review</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* Gallery Preview & Team Preview mini deck */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2" id="home-previews">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gallery brief */}
                  <div 
                    onClick={() => {
                      setCurrentTab('gallery');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-[#2d545e]/60 border border-[#3f6973] hover:border-[#e1b382]/50 p-6 rounded-2xl space-y-3 flex flex-col justify-between cursor-pointer transition-all"
                  >
                    <div>
                      <h4 className="text-lg font-bold text-white tracking-wide mt-0.5">Our Media Gallery</h4>
                      <p className="text-xs text-[#CBD5E1] leading-relaxed font-sans">{settings.galleryDescription || "Inspect photographs from strategy briefings, product launches, and community meets."}</p>
                      
                      <div className="grid grid-cols-3 gap-2 pt-3">
                        {gallery.slice(0, 3).map((g) => (
                          <div key={g.id} className="aspect-square rounded-lg overflow-hidden border border-[#3f6973]">
                            <img src={g.imageUrl} alt={g.caption} className="w-full h-full object-cover grayscale opacity-80" referrerPolicy="no-referrer" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentTab('gallery');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center space-x-1 text-xs font-bold tracking-wider text-white hover:text-[#c89666] uppercase pt-3 hover:translate-x-1.5 transition-transform cursor-pointer"
                    >
                      <span>Explore Gallery Archive</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Team brief */}
                  <div 
                    onClick={() => {
                      setCurrentTab('team');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-[#2d545e]/60 border border-[#3f6973] hover:border-[#e1b382]/50 p-6 rounded-2xl space-y-3 flex flex-col justify-between cursor-pointer transition-all"
                  >
                    <div>
                      <h4 className="text-lg font-bold text-white tracking-wide mt-0.5">Our Technical Board</h4>
                      <p className="text-xs text-[#CBD5E1] leading-relaxed font-sans">{settings.teamDescription || "Meet the executive developers, AI leads, and systems designers building ApnaKhaiyal pipelines."}</p>
                      
                      <div className="flex -space-x-3 pt-3 overflow-hidden">
                        {team.slice(0, 4).map((m) => (
                          <div key={m.id} className="w-10 h-10 rounded-full border-2 border-[#12343b] overflow-hidden shrink-0">
                            <img 
                              src={m.photoUrl && m.photoUrl.trim() !== "" ? m.photoUrl : getAvatarUrl(m.gender, m.name)} 
                              alt={m.name} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = getAvatarUrl(m.gender, m.name);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentTab('team');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center space-x-1 text-xs font-bold tracking-wider text-white hover:text-[#c89666] uppercase pt-3 hover:translate-x-1.5 transition-transform cursor-pointer"
                    >
                      <span>Meet The Executive Board</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </section>

              {/* Call To Action Block */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 mb-4" id="home-cta-block">
                <div className="bg-[#2d545e] border border-[#3f6973] rounded-2xl p-6 sm:p-8 text-center space-y-4 relative overflow-hidden">
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#e1b382] via-[#c89666] to-[#e1b382]" />
                  
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-white">
                    Ready to Transform Your Corporate Scaling?
                  </h3>
                  <p className="text-[#CBD5E1] text-xs sm:text-sm max-w-xl mx-auto font-sans leading-relaxed">
                    Collaborate with ApnaKhaiyal's senior software architects to custom engineer systems designed for your organization boundaries.
                  </p>

                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setCurrentTab('contact');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-7 py-3 rounded-lg bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] hover:text-white font-bold tracking-wide shadow-lg hover:scale-105 transition-all cursor-pointer text-xs sm:text-sm"
                    >
                      Inquire Custom Development
                    </button>
                  </div>
                </div>
              </section>

            </motion.div>
          )}

          {/* ==================== ABOUT PAGE VIEW ==================== */}
          {currentTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
            >
              <AboutView data={about} />
            </motion.div>
          )}

          {/* ==================== SERVICES VIEW ==================== */}
          {currentTab === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
            >
              <ServicesView services={services} settings={settings} setCurrentTab={setCurrentTab} isLoading={isDataLoading} />
            </motion.div>
          )}

          {/* ==================== PRODUCTS VIEW ==================== */}
          {currentTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
            >
              <ProductsView 
                products={products} 
                isLoading={isDataLoading} 
                onBookDemo={handleBookDemo} 
              />
            </motion.div>
          )}

          {/* ==================== GALLERY VIEW ==================== */}
          {currentTab === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
            >
              <GalleryView gallery={gallery} />
            </motion.div>
          )}

          {/* ==================== TEAM VIEW ==================== */}
          {currentTab === 'team' && (
            <motion.div
              key="team"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
            >
              <TeamView team={team} settings={settings} companyContact={companyContact} />
            </motion.div>
          )}

          {/* ==================== CAREERS VIEW ==================== */}
          {currentTab === 'careers' && (
            <motion.div
              key="careers"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
            >
              <CareersView opportunities={careers} onAddApplication={handleAddApplication} />
            </motion.div>
          )}

          {/* ==================== CONTACT VIEW ==================== */}
          {currentTab === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
            >
              <ContactView 
                settings={settings} 
                companyInformation={companyInformation}
                companyContact={companyContact}
                onSendMessage={handleSendMessage} 
                initialProductName={selectedProductForDemo}
                products={products}
              />
            </motion.div>
          )}


        </AnimatePresence>
      </main>

      {/* 3. Global Footer Component */}
      <Footer 
        settings={settings} 
        companyInformation={companyInformation}
        companyContact={companyContact}
        setCurrentTab={setCurrentTab} 
        expertise={expertise} 
        office={office} 
      />

      {/* Add Review Modal Popup */}
      <AddReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmitReview={handleSubmitPublicReview}
      />

    </div>
  );
}
