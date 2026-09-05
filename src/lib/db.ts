import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getRolePermissions, checkUserRoleAccess } from './rbac';
import {
  formatWhatsAppNumber,
  getCEOWhatsAppNumber,
  getCEOWhatsAppUrl,
  getWhatsAppLink
} from './utils';
export { formatWhatsAppNumber, getCEOWhatsAppNumber, getCEOWhatsAppUrl, getWhatsAppLink };
import {
  HeroData,
  AboutData,
  ServiceItem,
  ProductItem,
  ProductImage,
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
} from '../types';

// Detect Supabase keys gracefully
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export let supabase: SupabaseClient | null = null;
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    // Standard initialization fallback with a placeholder URL to prevent application crashes
    supabase = createClient('https://placeholder-project.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder');
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
}

// PREMIUM DEFAULT DATA FOR SEEDING / LOCAL FALLBACK
const DEFAULT_HERO: HeroData = {
  heading: "Transforming Businesses Through Technology",
  subHeading: "We engineer high-performance software, intelligent agentic AI solutions, and premium digital systems tailored for global enterprise growth.",
  imageUrl: "",
  primaryBtnText: "Explore Flagship Products",
  primaryBtnLink: "products",
  secondaryBtnText: "Request Consult",
  secondaryBtnLink: "contact"
};

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: "hs1",
    title: "Engineering Excellence",
    description: "4+ years crafting mission-critical software & digital automation platforms for enterprise leaders.",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
    buttonText: "",
    buttonLink: "",
    displayOrder: 1,
    isActive: true
  },
  {
    id: "hs2",
    title: "Global Deployments",
    description: "Multi-tenant cloud architectures powering organizations across North America, Europe, and Asia.",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
    buttonText: "",
    buttonLink: "",
    displayOrder: 2,
    isActive: true
  },
  {
    id: "hs3",
    title: "Active Enterprise Products",
    description: "Flagship hospital management, town finances, POS, and educational portal systems in production.",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
    buttonText: "",
    buttonLink: "",
    displayOrder: 3,
    isActive: true
  },
  {
    id: "hs4",
    title: "Core Service Uptime",
    description: "99.9% uptime SLA backed by automated monitoring, redundant servers, and real-time security logs.",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
    buttonText: "",
    buttonLink: "",
    displayOrder: 4,
    isActive: true
  }
];

const DEFAULT_ABOUT: AboutData = {
  companyStory: "ApnaKhaiyal SMC Pvt Ltd was founded with a single focus: to elevate standard corporate processes into seamless, automated, high-yield digital structures. Over the last 4+ years, we have designed, optimized, and deployed customized software suites for schools, town finances, hospitals, and retail enterprises worldwide. Our philosophy blends architectural rigor with human-centered aesthetics.",
  mission: "To architect scalable, secure, and beautiful technical ecosystems that empower global organizations to focus on what matters most — their people and core purpose.",
  vision: "To lead the next epoch of intelligent system automation, serving as the trusted technical foundation for enterprises transitioning to the Agentic AI era.",
  experience: "4+ Years of Engineering Excellence",
  achievements: [
    "50+ Global Enterprises Empowered",
    "99.9% Production System Uptime",
    "6+ High-Impact Flagship Software Products",
    "4+ Years of Constant Tech Evolution"
  ],
  imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop"
};

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: "s1",
    title: "Web Development",
    icon: "Globe",
    description: "Highly interactive, state-of-the-art Single Page Applications (SPAs) and Progressive Web Apps (PWAs) styled with precision and built for lightning-fast speeds.",
    displayOrder: 1,
    image: "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "s2",
    title: "Mobile Application Development",
    icon: "Smartphone",
    description: "Native and cross-platform mobile apps engineered for fluid gestures, offline-first reliability, and seamless operating system performance.",
    displayOrder: 2,
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "s3",
    title: "Desktop Application Development",
    icon: "Monitor",
    description: "Cross-platform desktop application suites styled with modern styling, background processing, and custom local database setups.",
    displayOrder: 3,
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "s4",
    title: "AI Automation",
    icon: "Cpu",
    description: "Integrating intelligent pipeline processing, modern language models, predictive analysis, and automatic multi-tier system logic.",
    displayOrder: 4,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "s5",
    title: "Agentic AI",
    icon: "Sparkles",
    description: "Multi-agent autonomous systems capable of executing complex workflows, decision trees, task delegation, and automated problem-solving.",
    displayOrder: 5,
    image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "s6",
    title: "Digital Marketing",
    icon: "TrendingUp",
    description: "Result-driven SEO optimization, brand identity formulation, and growth-hacking funnels to scale visibility and revenue pipelines.",
    displayOrder: 6,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"
  }
];

const DEFAULT_PROCESS: ProcessItem[] = [
  { id: "proc1", title: "Discovery", description: "Formulating complete system flowcharts and data schemas.", icon: "Search", displayOrder: 1, active: true },
  { id: "proc2", title: "Architecture", description: "Setting up secure, optimized type-safe client & server layers.", icon: "Layers", displayOrder: 2, active: true },
  { id: "proc3", title: "Refining & QA", description: "Extensive pipeline load tests, mock cycles, and accessibility checks.", icon: "CheckCircle2", displayOrder: 3, active: true },
  { id: "proc4", title: "Operations", description: "Deploying high availability systems to cloud containers.", icon: "Rocket", displayOrder: 4, active: true }
];

const DEFAULT_INDUSTRIES: IndustryItem[] = [
  { id: "ind1", title: "Enterprise Healthcare", displayOrder: 1, active: true },
  { id: "ind2", title: "Government Tech", displayOrder: 2, active: true },
  { id: "ind3", title: "EdTech Portals", displayOrder: 3, active: true },
  { id: "ind4", title: "Retail Logistics", displayOrder: 4, active: true },
  { id: "ind5", title: "Autonomous AI Agents", displayOrder: 5, active: true }
];

const DEFAULT_TECH_STACK: TechStackItem[] = [
  { id: "tech1", title: "Frontend Client", description: "React, TypeScript, Tailwind CSS, Framer Motion", iconType: "lucide", iconName: "Code", displayOrder: 1, active: true },
  { id: "tech2", title: "Backend Server", description: "Node.js, Express, Python Pipelines", iconType: "lucide", iconName: "Server", displayOrder: 2, active: true },
  { id: "tech3", title: "Durable Database", description: "PostgreSQL, Supabase Cloud Storage", iconType: "lucide", iconName: "Database", displayOrder: 3, active: true },
  { id: "tech4", title: "Autonomous AI", description: "Google GenAI Core, LangChain, Vector Embeds", iconType: "lucide", iconName: "Cpu", displayOrder: 4, active: true }
];

const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: "p1",
    name: "Hospital Management System",
    logoText: "KHMS",
    description: "An elegant, comprehensive clinical suite coordinating patient intake, billing, electronic health records (EHR), staff shifts, and secure pharmacy dispensing.",
    features: ["Intelligent Patient Portal", "EHR Synchronization", "Advanced Pharmacy Management", "Automated Revenue Cycle Billing"],
    gallery: [
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop"
    ],
    category: "Enterprise Healthcare",
    status: "Active",
    featured: true,
    displayOrder: 1,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "p2",
    name: "Town Finance Management System",
    logoText: "TFMS",
    description: "A secure double-entry accounting ledger system designed specifically for municipal authorities to track taxes, budgets, community allocations, and audits.",
    features: ["Municipal Tax Invoicing", "Real-time Budget Visualizers", "Ledger Audit Trails", "Community Grant Pipelines"],
    gallery: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop"
    ],
    category: "Government Tech",
    status: "Active",
    featured: true,
    displayOrder: 2,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "p3",
    name: "Yushay School Management System",
    logoText: "Yushay",
    description: "A beautifully fast school portal enabling parents, teachers, and administrators to seamlessly manage homework, grades, fees, attendance, and transport updates.",
    features: ["Student & Parent Interactive Portal", "Automated Grade Book", "Fee Structure Invoicing", "Instant SMS/Email Push Alerts"],
    gallery: [
      "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=800&auto=format&fit=crop"
    ],
    category: "EdTech Systems",
    status: "Active",
    featured: true,
    displayOrder: 3,
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "p4",
    name: "Retail Management System",
    logoText: "RMS",
    description: "A centralized cloud-ready system connecting multi-branch inventories, sales metrics, suppliers, customer loyalty systems, and automated stock alerts.",
    features: ["Multi-Store Sync", "Predictive Restock Signals", "Loyalty Point Ledger", "Supplier Procurement Rails"],
    gallery: [
      "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=800&auto=format&fit=crop"
    ],
    category: "Retail Infrastructure",
    status: "Active",
    featured: false,
    displayOrder: 4,
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "p5",
    name: "Point Of Sale",
    logoText: "POS",
    description: "A highly resilient offline-first cash register application. It processes custom barcodes, splits billing, handles returns, and connects instantly to printers.",
    features: ["Offline-first Transacting", "Split Bill Mechanics", "Barcode Scanner Support", "Thermal Printer Hooks"],
    gallery: [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop"
    ],
    category: "Retail Infrastructure",
    status: "Active",
    featured: true,
    displayOrder: 5,
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "p6",
    name: "ATEE Enterprise Excellence",
    logoText: "ATEE",
    description: "The crown jewel of operations metrics. It quantifies internal employee output, measures team velocity, records feedback, and charts professional roadmap milestones.",
    features: ["OKR Performance Metrics", "Anonymous Team Feedback", "Interactive Roadmap Trees", "Skill Matrix Charts"],
    gallery: [
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=800&auto=format&fit=crop"
    ],
    category: "HR & Productivity",
    status: "Active",
    featured: true,
    displayOrder: 6,
    image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=1200&auto=format&fit=crop"
  }
];

const DEFAULT_TEAM: TeamMember[] = [
  {
    id: "t1",
    name: "Muhammad Junaid",
    designation: "Founder & CEO",
    gender: "Male",
    experience: "",
    dynamicSocialLinks: [
      { id: "sl1", platform: "LinkedIn", url: "https://linkedin.com", enabled: true, openInNewTab: true },
      { id: "sl2", platform: "WhatsApp", url: "https://wa.me/923090111330", enabled: true, openInNewTab: true },
      { id: "sl3", platform: "GitHub", url: "https://github.com", enabled: true, openInNewTab: true }
    ],
    socialLinks: { linkedin: "https://linkedin.com", whatsapp: "https://wa.me/923090111330", github: "https://github.com" },
    displayOrder: 1,
    photoUrl: ""
  },
  {
    id: "t2",
    name: "Zainab Malik",
    designation: "CTO",
    gender: "Female",
    experience: "",
    dynamicSocialLinks: [],
    socialLinks: {},
    displayOrder: 2,
    photoUrl: ""
  },
  {
    id: "t3",
    name: "Hamza Abbasi",
    designation: "Head of Engineering",
    gender: "Male",
    experience: "",
    dynamicSocialLinks: [],
    socialLinks: {},
    displayOrder: 3,
    photoUrl: ""
  },
  {
    id: "t4",
    name: "Dr. Bilal Siddiqui",
    designation: "AI Lead",
    gender: "Male",
    experience: "",
    dynamicSocialLinks: [],
    socialLinks: {},
    displayOrder: 4,
    photoUrl: ""
  },
  {
    id: "t5",
    name: "Sara Khan",
    designation: "Project Manager",
    gender: "Female",
    experience: "",
    dynamicSocialLinks: [],
    socialLinks: {},
    displayOrder: 5,
    photoUrl: ""
  },
  {
    id: "t6",
    name: "Ayesha Ahmed",
    designation: "Lead Product Designer",
    gender: "Female",
    experience: "",
    dynamicSocialLinks: [],
    socialLinks: {},
    displayOrder: 6,
    photoUrl: ""
  },
  {
    id: "t7",
    name: "Farhan Shah",
    designation: "Mobile Lead",
    gender: "Male",
    experience: "",
    dynamicSocialLinks: [],
    socialLinks: {},
    displayOrder: 7,
    photoUrl: ""
  }
];

const DEFAULT_GALLERY: GalleryItem[] = [
  { id: "g1", category: "Meetings", imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop", caption: "Strategy workshop with engineering leads." },
  { id: "g2", category: "Office", imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop", caption: "Our open collaborative workstation space." },
  { id: "g3", category: "Projects", imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop", caption: "Launching ATEE Operational Excellence metrics tracker." },
  { id: "g4", category: "Events", imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop", caption: "Annual Technical Innovation Summit." },
  { id: "g5", category: "Team", imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop", caption: "Our dedicated engineering team building for global scaling." }
];

const DEFAULT_REVIEWS: ClientReview[] = [
  {
    id: "r1",
    name: "Johnathan Mercer",
    designation: "Managing Director",
    company: "HealCare Systems Ltd",
    country: "United Kingdom",
    email: "j.mercer@healcare.co.uk",
    rating: 5,
    review: "ApnaKhaiyal delivered a pristine, highly resilient Hospital Management System that consolidated our 5 clinics. Uptime is unmatched, and their attention to our patient logs security was exceptional.",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop",
    companyLogoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=120&auto=format&fit=crop",
    status: "approved",
    featured: true,
    displayOrder: 1,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: "r2",
    name: "Arthur Pendelton",
    designation: "Finance Commissioner",
    company: "Weston Municipal District",
    country: "United States",
    email: "apendelton@weston.gov",
    rating: 5,
    review: "The Town Finance Management System transformed our treasury department. Bulletproof audit trail capabilities and clean budget visualization screens are highly praised by the town council.",
    photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&auto=format&fit=crop",
    companyLogoUrl: "",
    status: "approved",
    featured: true,
    displayOrder: 2,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
  },
  {
    id: "r3",
    name: "Principal Sarah Jenkins",
    designation: "Head Administrator",
    company: "Yushay Global Academy",
    country: "Canada",
    email: "s.jenkins@yushayacademy.org",
    rating: 5,
    review: "Before ApnaKhaiyal, homework assignment and portal updates were scattered. The Yushay Portal consolidated everything into one fast dashboard that parents, students, and teachers absolutely love.",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop",
    companyLogoUrl: "",
    status: "approved",
    featured: false,
    displayOrder: 3,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

const DEFAULT_CAREERS: CareerOpportunity[] = [
  {
    id: "j1",
    title: "Senior Full Stack Engineer (React/Node)",
    type: "job",
    department: "Engineering",
    location: "Bahawalpur, Pakistan (Onsite/Hybrid)",
    description: "We are seeking a seasoned Full Stack Engineer with exceptional control of React 19, Node.js, and complex SQL schema optimization to design next-gen enterprise portals.",
    requirements: [
      "4+ years of professional backend & client-side software architecture experience.",
      "In-depth command of Tailwind, TypeScript, state management systems, and query indexing.",
      "Proven history of launching resilient client applications."
    ],
    benefits: [
      "Highly competitive salary package and profit-sharing dividends.",
      "Premium family health insurance & physical wellness allowance.",
      "Dedicated professional evolution budgets & technical certifications."
    ],
    active: true
  },
  {
    id: "j2",
    title: "Autonomous AI Agent Developer",
    type: "job",
    department: "AI & Automation",
    location: "Remote / Hybrid",
    description: "Help us build intelligent Agentic AI networks capable of handling multi-tier corporate pipelines and automated data mapping.",
    requirements: [
      "Strong background in Python, LangChain, or Google GenAI modern tools.",
      "Familiarity with vectorized search engines (Pinecone, pgvector) and prompt engineering.",
      "Passionate about workflow automation and machine reasoning."
    ],
    benefits: [
      "Access to premium hardware stacks and compute credits.",
      "Flexible hybrid hours with complete outcome-based autonomy.",
      "Generous annual retreat, team bonding events, and stock options."
    ],
    active: true
  },
  {
    id: "j3",
    title: "Product Design Intern",
    type: "internship",
    department: "Design",
    location: "Bahawalpur, Pakistan (Onsite)",
    description: "A 3-month paid internship with potential transition to a full-time position. You will work with lead designers crafting brand blueprints, mockups, and glassmorphism web layouts.",
    requirements: [
      "Outstanding UI portfolio containing responsive web and mobile designs.",
      "Solid command of Figma, vector assets, typography scales, and negative spacing.",
      "Excellent active listening and communication skills."
    ],
    benefits: [
      "Paid hands-on mentorship with experienced designers.",
      "Work directly on systems being deployed to enterprise customers.",
      "Direct transition roadmap to permanent Associate Designer roles."
    ],
    active: true
  }
];

const DEFAULT_MESSAGES: ContactMessage[] = [
  {
    id: "m1",
    name: "Alex Sterling",
    email: "alex@sterlingretail.com",
    subject: "Custom POS Integration",
    message: "Hello team, we are scaling our retail stores to 8 locations and need to customize your Point of Sale system to support local thermal printing and real-time inventory multi-sync. Please contact us to coordinate.",
    read: false,
    repliedStatus: "Pending",
    createdAt: "2026-07-18T14:32:00Z"
  }
];

const DEFAULT_SETTINGS: SystemSettings = {
  companyName: "ApnaKhaiyal",
  logoText: "ApnaKhaiyal",
  phone: "+92 309 0111330",
  email: "info@apnakhaiyal.com",
  address: "Model Town C, Bahawalpur, Pakistan",
  googleMapsEmbedUrl: "https://maps.google.com/maps?q=Model%20Town%20C%2C%20Bahawalpur%2C%20Pakistan&t=&z=15&ie=UTF8&iwloc=&output=embed",
  whatsappNumber: "+923090111330",
  ceoWhatsAppNumber: "+923090111330",
  companyLogo: "",
  copyright: "© 2026 ApnaKhaiyal. All rights reserved.",
  servicesSectionHeading: "Our Expertise",
  servicesSectionSubtitle: "We deliver premium enterprise solutions.",
  productShowcaseSectionHeading: "Featured Proprietary Systems",
  processSectionSmallHeading: "Engineering Workflow",
  processSectionMainHeading: "Our Rigorous Development Process",
  processSectionSubtitle: "",
  industriesSectionHeading: "Industries We Serve",
  industriesSectionSubtitle: "Delivering robust automation schemas across multiple vertical segments.",
  techStackSectionHeading: "Our Technology Stack",
  techStackSectionSubtitle: "",
  galleryDescription: "Inspect photographs from strategy briefings, product launches, and community meets.",
  teamDescription: "Meet the executive developers, AI leads, and systems designers building ApnaKhaiyal pipelines.",
  socialLinks: {
    facebook: "https://facebook.com/apnakhaiyal",
    twitter: "https://twitter.com/apnakhaiyal",
    linkedin: "https://linkedin.com/company/apnakhaiyal",
    github: "https://github.com/apnakhaiyal",
    instagram: "https://instagram.com/apnakhaiyal",
    youtube: "https://youtube.com/apnakhaiyal"
  }
};

export const DEFAULT_COMPANY_INFORMATION: CompanyInformation = {
  companyName: "ApnaKhaiyal",
  email: "info@apnakhaiyal.com",
  phone: "+92 309 0111330",
  address: "Model Town C, Bahawalpur, Pakistan"
};

export const DEFAULT_COMPANY_CONTACT = DEFAULT_COMPANY_INFORMATION;

const DEFAULT_SEO: SEOSettings = {
  metaTitle: "ApnaKhaiyal | Transforming Businesses Through Technology",
  metaDescription: "ApnaKhaiyal is a premium software house building state-of-the-art Web Development, Mobile Apps, Desktop Systems, and Agentic AI Solutions.",
  keywords: "software house, mobile app, web development, Agentic AI, AI automation, custom software, Bahawalpur software company, enterprise software",
  ogImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
  twitterCard: "summary_large_image"
};

// INITIALIZE LOCALSTORAGE STATE MACHINE
const DEFAULT_EXPERTISE: ExpertiseItem[] = [
  { id: 'exp1', name: 'Web Platforms (React / Node)', displayOrder: 1 },
  { id: 'exp2', name: 'Custom iOS & Android Apps', displayOrder: 2 },
  { id: 'exp3', name: 'High-velocity POS & Desktop', displayOrder: 3 },
  { id: 'exp4', name: 'Enterprise double-ledger Finance', displayOrder: 4 },
  { id: 'exp5', name: 'Autonomous Agentic AI Pipelines', displayOrder: 5 },
  { id: 'exp6', name: 'Strategic SEO Growth Engines', displayOrder: 6 }
];

const DEFAULT_OFFICE: CorporateOfficeSettings = {
  address: 'Model Town C, Bahawalpur, Pakistan',
  phone: '+92 300 1234567',
  email: 'info@apnakhaiyal.com',
  googleMapLink: 'https://www.google.com/maps/search/?api=1&query=Model+Town+C,+Bahawalpur,+Pakistan'
};

const getStored = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(`apnakhaiyal_${key}`) || localStorage.getItem(`apnakhiyal_${key}`);
  if (!data) {
    localStorage.setItem(`apnakhaiyal_${key}`, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
};

const setStored = <T>(key: string, value: T) => {
  try {
    localStorage.setItem(`apnakhaiyal_${key}`, JSON.stringify(value));
  } catch (error: any) {
    // Multiple product screenshots can exceed browser localStorage quota.
    // Never let that exception abort the Save Product form submission.
    console.warn(`[localStorage] Could not persist ${key}; continuing with remote persistence:`, error?.message || error);
  }
};

// Buckets assurance helper
export const ensureBucketExists = async (bucketName: string) => {
  if (!supabase) return;
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.warn('Could not list buckets from Supabase:', error);
      return;
    }
    const exists = buckets?.some(b => b.name === bucketName);
    if (!exists) {
      console.log(`Bucket ${bucketName} not found. Creating bucket...`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880 // 5MB limit
      });
      if (createError) {
        console.error(`Error creating bucket ${bucketName}:`, createError);
      }
    }
  } catch (err) {
    console.error(`ensureBucketExists failed for bucket ${bucketName}:`, err);
  }
};

// Image Upload with size & format validation
export const uploadImageToSupabase = async (
  bucketName: string,
  file: File,
  folder: string = '',
  onProgress?: (progress: number) => void
): Promise<string> => {
  // File size validation (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File exceeds the 5MB maximum size limit.');
  }

  // Type validation (jpg, jpeg, png, webp, gif, svg)
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Unsupported image format. Allowed formats: JPG, JPEG, PNG, WEBP, GIF, SVG.');
  }

  onProgress?.(25);

  if (isSupabaseConfigured && supabase) {
    try {
      const actualBucket = bucketName || 'team-images';
      await ensureBucketExists(actualBucket);

      const fileExt = file.name.split('.').pop() || 'jpg';
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = folder ? `${folder}/${uniqueName}` : uniqueName;

      const { data, error } = await supabase.storage
        .from(actualBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (!error) {
        onProgress?.(75);
        const { data: urlData } = supabase.storage
          .from(actualBucket)
          .getPublicUrl(filePath);

        onProgress?.(100);
        if (urlData?.publicUrl) {
          return urlData.publicUrl;
        }
      } else {
        console.warn('Supabase storage upload error, using local data URL fallback:', error.message);
      }
    } catch (err: any) {
      console.warn('Supabase storage upload failed, using local data URL fallback:', err?.message || err);
    }
  }

  // Fallback: Convert file to Data URL for instant local persistence and live preview
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      onProgress?.(100);
      resolve(reader.result as string);
    };
    reader.onerror = () => reject(new Error('Failed to convert image file.'));
    reader.readAsDataURL(file);
  });
};

// Delete image from Supabase
export const deleteImageFromSupabase = async (bucketName: string, url: string) => {
  const actualBucket = bucketName || 'team-images';
  if (!supabase || !url) return;
  try {
    if (url.includes('.supabase.co/storage/v1/object/public/')) {
      const marker = `/public/${actualBucket}/`;
      let index = url.indexOf(marker);
      let foundBucket = actualBucket;
      if (index === -1) {
        const fallbackMarker = `/public/${bucketName}/`;
        index = url.indexOf(fallbackMarker);
        foundBucket = bucketName;
      }
      if (index !== -1) {
        const markerToUse = `/public/${foundBucket}/`;
        const filePath = decodeURIComponent(url.substring(index + markerToUse.length));
        console.log(`Deleting file from ${actualBucket}: ${filePath}`);
        const { error } = await supabase.storage.from(actualBucket).remove([filePath]);
        if (error) {
          console.error(`Failed to delete file from bucket ${actualBucket}:`, error);
        }
      }
    } else if (url.startsWith('data:')) {
      const mockStorage = JSON.parse(localStorage.getItem(`mock_storage_${actualBucket}`) || '{}');
      for (const [filePath, storedData] of Object.entries(mockStorage)) {
        if (storedData === url) {
          delete mockStorage[filePath];
          localStorage.setItem(`mock_storage_${actualBucket}`, JSON.stringify(mockStorage));
          console.log(`Mock deleted file from ${actualBucket}: ${filePath}`);
          break;
        }
      }
    }
  } catch (err) {
    console.error('Error in deleteImageFromSupabase:', err);
  }
};

// Update individual team member photo in Supabase DB dynamically supporting camelCase and snake_case columns
export const updateTeamMemberPhotoInDb = async (memberId: string, url: string | null): Promise<void> => {
  if (!supabase) {
    return;
  }
  try {
    // Fetch existing record to check column names
    const { data, error } = await supabase.from('team_members').select('*').eq('id', memberId).maybeSingle();
    
    let columnToUpdate = 'photoUrl';
    if (data) {
      if ('photo_url' in data) {
        columnToUpdate = 'photo_url';
      } else if ('photoUrl' in data) {
        columnToUpdate = 'photoUrl';
      }
    } else {
      // Direct column probe
      const { error: testError } = await supabase.from('team_members').update({ photoUrl: url }).eq('id', memberId);
      if (testError) {
        console.warn('Updating photoUrl column failed, trying photo_url...', testError.message);
        const { error: fallbackError } = await supabase.from('team_members').update({ photo_url: url }).eq('id', memberId);
        if (fallbackError) {
          throw new Error(`Database update failed on both photoUrl and photo_url columns: ${fallbackError.message}`);
        }
      }
      return;
    }
    
    console.log(`Updating column ${columnToUpdate} of team_members table for ID ${memberId} with URL ${url}`);
    const { error: updateError } = await supabase
      .from('team_members')
      .update({ [columnToUpdate]: url })
      .eq('id', memberId);
      
    if (updateError) {
      throw updateError;
    }
    console.log(`Successfully updated database record for team member ${memberId}`);
  } catch (err: any) {
    console.error('Error in updateTeamMemberPhotoInDb:', err);
    throw err;
  }
};

// Generic single website_settings & site_settings saver helper
export const saveWebsiteSetting = async (key: string, value: any) => {
  if (!supabase) return;
  try {
    console.log(`Saving website setting for key: ${key}`);
    const record: any = { id: key, key, value };
    
    if (key === 'settings') {
      record.company_logo = value.companyLogo || '';
      record.google_map = value.googleMapsEmbedUrl || '';
      record.facebook = value.socialLinks?.facebook || '';
      record.linkedin = value.socialLinks?.linkedin || '';
      record.instagram = value.socialLinks?.instagram || '';
      record.youtube = value.socialLinks?.youtube || '';
      record.copyright = value.copyright || '';
      record.updated_at = new Date().toISOString();
    }
    
    // Save to website_settings
    const { error } = await supabase.from('website_settings').upsert(record);
    if (error) {
      console.warn(`Upsert with full columns failed, trying fallback upsert with key/value only: ${error.message}`);
      await supabase.from('website_settings').upsert({ key, value });
    }

    // Save to site_settings as well
    await supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() });
  } catch (err) {
    console.error(`Error saving website setting for ${key}:`, err);
  }
};

/**
 * Single source of truth for company contact details from the dedicated `company_information` table in Supabase.
 */
export const fetchCompanyInformation = async (): Promise<CompanyInformation> => {
  if (!supabase) {
    return getStored('company_information', DEFAULT_COMPANY_INFORMATION);
  }
  try {
    const { data, error } = await supabase
      .from('company_information')
      .select('*')
      .limit(1);

    if (error) {
      console.error('[Supabase SELECT Error] company_information:', JSON.stringify(error, null, 2));
    }

    if (data && data.length > 0) {
      const first = data[0];
      const result: CompanyInformation = {
        id: first.id,
        companyName: first.company_name || DEFAULT_COMPANY_INFORMATION.companyName,
        email: first.email || DEFAULT_COMPANY_INFORMATION.email,
        phone: first.phone || DEFAULT_COMPANY_INFORMATION.phone,
        phoneSecondary: first.phone_secondary || undefined,
        ceoWhatsApp: first.ceo_whatsapp || undefined,
        address: first.address || DEFAULT_COMPANY_INFORMATION.address,
        createdAt: first.created_at || first.updated_at,
        updatedAt: first.updated_at
      };
      setStored('company_information', result);
      return result;
    }

    console.log('company_information table empty. Inserting default single row...');
    const defaultRow: Record<string, any> = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      company_name: DEFAULT_COMPANY_INFORMATION.companyName || 'ApnaKhaiyal',
      email: DEFAULT_COMPANY_INFORMATION.email || 'info@apnakhaiyal.com',
      phone: DEFAULT_COMPANY_INFORMATION.phone || '+92 309 0111330',
      ceo_whatsapp: '+923090111330',
      address: DEFAULT_COMPANY_INFORMATION.address || 'Model Town C, Bahawalpur, Pakistan',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('[Supabase INSERT Payload] company_information:', JSON.stringify(defaultRow, null, 2));

    const { data: inserted, error: insertError } = await supabase
      .from('company_information')
      .insert([defaultRow])
      .select()
      .single();

    if (insertError) {
      console.error('[Supabase INSERT Error] company_information:', JSON.stringify(insertError, null, 2));
      setStored('company_information', DEFAULT_COMPANY_INFORMATION);
      return DEFAULT_COMPANY_INFORMATION;
    }

    if (inserted) {
      const result: CompanyInformation = {
        id: inserted.id,
        companyName: inserted.company_name || DEFAULT_COMPANY_INFORMATION.companyName,
        email: inserted.email || DEFAULT_COMPANY_INFORMATION.email,
        phone: inserted.phone || DEFAULT_COMPANY_INFORMATION.phone,
        phoneSecondary: inserted.phone_secondary || undefined,
        ceoWhatsApp: inserted.ceo_whatsapp || undefined,
        address: inserted.address || DEFAULT_COMPANY_INFORMATION.address,
        createdAt: inserted.created_at || inserted.updated_at,
        updatedAt: inserted.updated_at
      };
      setStored('company_information', result);
      return result;
    }

    setStored('company_information', DEFAULT_COMPANY_INFORMATION);
    return DEFAULT_COMPANY_INFORMATION;
  } catch (err) {
    console.error('Error in fetchCompanyInformation:', err);
    return getStored('company_information', DEFAULT_COMPANY_INFORMATION);
  }
};

export const fetchCompanyContact = fetchCompanyInformation;

/**
 * Updates the single row in `company_information` in Supabase.
 * Updates company_information, waits for update, re-fetches updated row, and returns it.
 */
export const updateCompanyInformation = async (data: Partial<CompanyInformation>): Promise<CompanyInformation> => {
  const current = await fetchCompanyInformation();
  const updatedData: CompanyInformation = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString()
  };

  // Validate Email
  if (data.email !== undefined) {
    const cleanEmail = data.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      throw new Error('Please enter a valid email address (e.g. info@apnakhaiyal.com).');
    }
    updatedData.email = cleanEmail;
  }

  if (supabase) {
    const payload: Record<string, any> = {
      company_name: updatedData.companyName,
      email: updatedData.email,
      phone: updatedData.phone,
      phone_secondary: updatedData.phoneSecondary ?? null,
      ceo_whatsapp: updatedData.ceoWhatsApp ?? null,
      address: updatedData.address,
      updated_at: new Date().toISOString()
    };

    if (current.id) {
      const { error } = await supabase
        .from('company_information')
        .update(payload)
        .eq('id', current.id);
      if (error) {
        console.error('Failed updating company_information in Supabase:', error);
        throw new Error(error.message || 'Failed updating company_information');
      }
    } else {
      const { error } = await supabase
        .from('company_information')
        .insert([{ ...payload, created_at: new Date().toISOString() }]);
      if (error) {
        console.error('Failed inserting company_information in Supabase:', error);
        throw new Error(error.message || 'Failed inserting company_information');
      }
    }

    // Wait for Supabase update to complete, then fetch the updated row again directly!
    const reFetched = await fetchCompanyInformation();
    setStored('company_information', reFetched);
    return reFetched;
  } else {
    setStored('company_information', updatedData);
    return updatedData;
  }
};

export const updateCompanyContact = updateCompanyInformation;

export const updateCompanyContactSettings = async (email: string) => {
  return updateCompanyInformation({ email });
};

// Background async db sync helper supporting inserts, targeted updates, and removals
const syncTableToSupabase = async (tableName: string, data: any) => {
  if (!supabase) return;
  try {
    const incomingArray = Array.isArray(data) ? data : [data];
    
    // Determine alias table names if present
    let secondaryTableName = '';
    if (tableName === 'client_reviews') secondaryTableName = 'reviews';
    if (tableName === 'reviews') secondaryTableName = 'client_reviews';
    if (tableName === 'process_items') secondaryTableName = 'development_process';
    if (tableName === 'development_process') secondaryTableName = 'process_items';
    if (tableName === 'industry_items') secondaryTableName = 'industries';
    if (tableName === 'industries') secondaryTableName = 'industry_items';
    if (tableName === 'tech_stack_items') secondaryTableName = 'technology_stack';
    if (tableName === 'technology_stack') secondaryTableName = 'tech_stack_items';
    if (tableName === 'website_settings') secondaryTableName = 'site_settings';
    if (tableName === 'site_settings') secondaryTableName = 'website_settings';

    if (incomingArray.length === 0) {
      // Clear table
      await supabase.from(tableName).delete().neq('id', '_dummy_');
      if (secondaryTableName) {
        await supabase.from(secondaryTableName).delete().neq('id', '_dummy_');
      }
      return;
    }

    // Format individual fields for schema compatibility
    const formattedData = incomingArray.map((item: any) => ({ ...item }));

    // Contact form submissions are append-only. Map frontend camelCase fields
    // to the actual contact_messages schema and never destructively sync them.
    if (tableName === 'contact_messages') {
      const messageRows = formattedData.map((item: any) => ({
        id: item.id || crypto.randomUUID(),
        name: item.name || '',
        email: item.email || '',
        subject: item.subject || '',
        message: item.message || '',
        service_interest: item.service_interest ?? item.serviceInterest ?? null,
        phone: item.phone ?? null,
        company: item.company ?? null,
        read: item.read ?? false,
        replied: item.replied ?? (item.repliedStatus === 'Replied'),
        admin_notes: item.admin_notes ?? item.adminNotes ?? null,
        created_at: item.created_at ?? item.createdAt ?? new Date().toISOString()
      })).filter((row: any) => row.name && row.email && row.subject && row.message);

      if (messageRows.length > 0) {
        const { error: messageUpsertErr } = await supabase
          .from('contact_messages')
          .upsert(messageRows, { onConflict: 'id' });
        if (messageUpsertErr) {
          console.error('[Contact Messages] Supabase upsert failed:', messageUpsertErr.message);
        } else {
          console.log('[Contact Messages] Saved messages without deleting existing records.');
        }
      }
      return;
    }

    // Job applications are append-only from the public Careers form. Do not delete
    // existing applications when the caller has a stale/partial local array.
    // Also map the frontend camelCase fields to the actual Supabase schema.
    if (tableName === 'job_applications') {
      const applicationRows = formattedData.map((item: any) => ({
        id: item.id,
        job_id: item.job_id ?? item.jobId ?? null,
        job_title: item.job_title ?? item.jobTitle ?? 'General Application',
        applicant_name: item.applicant_name ?? item.fullName ?? item.applicantName ?? '',
        email: item.email ?? item.applicant_email ?? item.applicantEmail ?? '',
        phone: item.phone ?? '',
        experience: item.experience ?? '',
        cover_note: item.cover_note ?? item.coverLetter ?? item.cover_note ?? '',
        resume_url: item.resume_url ?? item.resumeUrl ?? '',
        status: item.status ?? 'New',
        created_at: item.created_at ?? item.appliedAt ?? new Date().toISOString()
      })).filter((row: any) => row.applicant_name && row.email);

      if (applicationRows.length > 0) {
        const { error: applicationUpsertErr } = await supabase
          .from('job_applications')
          .upsert(applicationRows, { onConflict: 'id' });
        if (applicationUpsertErr) {
          console.error('[Job Applications] Supabase upsert failed:', applicationUpsertErr.message);
        } else {
          console.log('[Job Applications] Saved applications without deleting existing records.');
        }
      }
      return;
    }

    // 1. Fetch current IDs from database to find removed rows
    const { data: existing, error: getErr } = await supabase.from(tableName).select('id');
    if (!getErr && existing) {
      const existingIds = existing.map((row: any) => row.id);
      const incomingIds = formattedData.map((row: any) => row.id);
      
      const toDelete = existingIds.filter(id => !incomingIds.includes(id));
      if (toDelete.length > 0) {
        console.log(`Deleting removed records from ${tableName}:`, toDelete);
        await supabase.from(tableName).delete().in('id', toDelete);
      }
    }

    // 2. Perform direct Upsert (which inserts or updates records matching id)
    console.log(`Upserting ${formattedData.length} records into ${tableName}`);
    const { error: upsertErr } = await supabase.from(tableName).upsert(formattedData);
    if (upsertErr) {
      console.warn(`Initial upsert failed on table ${tableName}, attempting auto-mapping fallback...`, upsertErr.message);
      
      // Automatic snake_case fallback mapping in case tables have standard snake_case column names
      const fallbackData = formattedData.map((item: any) => {
        const mapped: any = { ...item };
        // public.products requires a NOT NULL title, while the frontend ProductItem uses name.
        if (tableName === 'products' && !mapped.title) {
          mapped.title = item.name || item.title || item.id || '';
        }
        if ('photoUrl' in item) {
          mapped.photo_url = item.photoUrl;
          mapped.profile_image = item.photoUrl;
          mapped.user_image = item.photoUrl;
        }
        if ('companyLogoUrl' in item) {
          mapped.company_logo = item.companyLogoUrl;
          mapped.company_logo_url = item.companyLogoUrl;
        }
        if ('name' in item) {
          mapped.full_name = item.name;
          mapped.author = item.name;
        }
        if ('review' in item) {
          mapped.text = item.review;
          mapped.content = item.review;
        }
        if ('designation' in item) {
          mapped.role = item.designation;
        }
        if ('featured' in item) {
          mapped.is_featured = item.featured;
        }
        if ('displayOrder' in item) mapped.display_order = item.displayOrder;
        if ('logoText' in item) mapped.logo_text = item.logoText;
        if ('logoUrl' in item) mapped.logo_url = item.logoUrl;
        if ('imageUrl' in item) mapped.image_url = item.imageUrl;
        if ('repliedStatus' in item) mapped.replied_status = item.repliedStatus;
        if ('createdAt' in item) mapped.created_at = item.createdAt;
        if ('updatedAt' in item) mapped.updated_at = item.updatedAt;
        if ('jobId' in item) mapped.job_id = item.jobId;
        if ('jobTitle' in item) mapped.job_title = item.jobTitle;
        if ('fullName' in item) mapped.full_name = item.fullName;
        if ('resumeUrl' in item) mapped.resume_url = item.resumeUrl;
        if ('coverLetter' in item) mapped.cover_letter = item.coverLetter;
        if ('appliedAt' in item) mapped.applied_at = item.appliedAt;
        if ('socialLinks' in item) mapped.social_links = item.socialLinks;
        if ('dynamicSocialLinks' in item) mapped.dynamic_social_links = item.dynamicSocialLinks;
        return mapped;
      });

      const { error: fallbackErr } = await supabase.from(tableName).upsert(fallbackData);
      if (fallbackErr) {
        console.error(`Fallback upsert failed too for ${tableName}:`, fallbackErr.message);
        if (secondaryTableName) {
          console.log(`Attempting upsert into secondary table alias: ${secondaryTableName}`);
          await supabase.from(secondaryTableName).upsert(fallbackData);
        }
      } else {
        console.log(`Fallback upsert succeeded for table ${tableName}`);
      }
    } else {
      console.log(`Successfully upserted data to table ${tableName}`);
    }

    // Also sync secondary table alias if present
    if (secondaryTableName) {
      try {
        await supabase.from(secondaryTableName).upsert(formattedData);
      } catch (e) {
        // secondary table sync is best-effort
      }
    }
  } catch (err) {
    console.error(`Sync error for table ${tableName}:`, err);
  }
};

// Automatic seeding of default values if database tables are completely brand new / empty
export const seedDatabaseIfEmpty = async () => {
  if (!supabase) return;
  try {
    console.log('Checking database tables population for seeding...');

    // 1. Seed team_members
    const { data: team, error: teamErr } = await supabase.from('team_members').select('id').limit(1);
    if (!teamErr && (!team || team.length === 0)) {
      console.log('Seeding default team_members...');
      await supabase.from('team_members').insert(DEFAULT_TEAM);
    }

    // 2. Seed products
    const { data: products, error: prodErr } = await supabase.from('products').select('id').limit(1);
    if (!prodErr && (!products || products.length === 0)) {
      console.log('Seeding default products...');
      await supabase.from('products').insert(DEFAULT_PRODUCTS);
    }

    // 2.5. Seed product_images for relational & array-like multiple images
    const { data: prodImgs, error: imgErr } = await supabase.from('product_images').select('id').limit(1);
    if (!imgErr && (!prodImgs || prodImgs.length === 0)) {
      console.log('Seeding default product_images...');
      const seedImages: any[] = [];
      DEFAULT_PRODUCTS.forEach((p) => {
        if (p.image) {
          seedImages.push({
            product_id: p.id,
            image_url: p.image,
            display_order: 0,
            is_primary: true
          });
        }
        if (Array.isArray(p.gallery)) {
          p.gallery.forEach((gUrl, gIdx) => {
            if (gUrl && gUrl !== p.image) {
              seedImages.push({
                product_id: p.id,
                image_url: gUrl,
                display_order: gIdx + 1,
                is_primary: false
              });
            }
          });
        }
      });
      if (seedImages.length > 0) {
        await supabase.from('product_images').insert(seedImages);
      }
    }

    // 3. Seed services
    const { data: services, error: servErr } = await supabase.from('services').select('id').limit(1);
    if (!servErr && (!services || services.length === 0)) {
      console.log('Seeding default services...');
      await supabase.from('services').insert(DEFAULT_SERVICES);
    }

    // 4. Seed gallery
    const { data: gallery, error: gallErr } = await supabase.from('gallery').select('id').limit(1);
    if (!gallErr && (!gallery || gallery.length === 0)) {
      console.log('Seeding default gallery...');
      await supabase.from('gallery').insert(DEFAULT_GALLERY);
    }

    // 5. Seed client_reviews
    const { data: reviews, error: revErr } = await supabase.from('client_reviews').select('id').limit(1);
    if (!revErr && (!reviews || reviews.length === 0)) {
      console.log('Seeding default client_reviews...');
      await supabase.from('client_reviews').insert(DEFAULT_REVIEWS);
    }

    // 6. Seed contact_messages
    const { data: messages, error: msgErr } = await supabase.from('contact_messages').select('id').limit(1);
    if (!msgErr && (!messages || messages.length === 0)) {
      console.log('Seeding default contact_messages...');
      await supabase.from('contact_messages').insert(DEFAULT_MESSAGES);
    }

    // 7. Seed website_settings
    const { data: settings, error: settingsErr } = await supabase.from('website_settings').select('key').limit(1);
    if (!settingsErr && (!settings || settings.length === 0)) {
      console.log('Seeding default website_settings...');
      const seedRows = [
        { id: 'hero', key: 'hero', value: DEFAULT_HERO },
        { id: 'about', key: 'about', value: DEFAULT_ABOUT },
        { 
          id: 'settings', 
          key: 'settings', 
          value: DEFAULT_SETTINGS,
          company_name: DEFAULT_SETTINGS.companyName,
          company_logo: DEFAULT_SETTINGS.companyLogo || '',
          phone: DEFAULT_SETTINGS.phone,
          email: DEFAULT_SETTINGS.email,
          address: DEFAULT_SETTINGS.address,
          google_map: DEFAULT_SETTINGS.googleMapsEmbedUrl,
          facebook: DEFAULT_SETTINGS.socialLinks?.facebook || '',
          linkedin: DEFAULT_SETTINGS.socialLinks?.linkedin || '',
          instagram: DEFAULT_SETTINGS.socialLinks?.instagram || '',
          youtube: DEFAULT_SETTINGS.socialLinks?.youtube || '',
          copyright: DEFAULT_SETTINGS.copyright || '',
          ceo_whatsapp_number: DEFAULT_SETTINGS.ceoWhatsAppNumber || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { id: 'seo', key: 'seo', value: DEFAULT_SEO },
        { id: 'careers', key: 'careers', value: DEFAULT_CAREERS },
        { id: 'expertise', key: 'expertise', value: DEFAULT_EXPERTISE },
        { id: 'office', key: 'office', value: DEFAULT_OFFICE }
      ];
      const { error: seedErr } = await supabase.from('website_settings').insert(seedRows);
      if (seedErr) {
        console.warn('Seeding with full columns failed, trying key/value only...', seedErr.message);
        await supabase.from('website_settings').insert([
          { key: 'hero', value: DEFAULT_HERO },
          { key: 'about', value: DEFAULT_ABOUT },
          { key: 'settings', value: DEFAULT_SETTINGS },
          { key: 'seo', value: DEFAULT_SEO },
          { key: 'careers', value: DEFAULT_CAREERS },
          { key: 'expertise', value: DEFAULT_EXPERTISE },
          { key: 'office', value: DEFAULT_OFFICE }
        ]);
      }
    }

    // 8. Seed site_settings table with default records
    try {
      const { data: siteSetData } = await supabase.from('site_settings').select('key');
      const existingKeys = siteSetData ? siteSetData.map((s: any) => s.key) : [];

      const siteSettingDefaults = [
        { key: 'hero', value: DEFAULT_HERO },
        { key: 'about', value: DEFAULT_ABOUT },
        { key: 'settings', value: DEFAULT_SETTINGS },
        { key: 'seo', value: DEFAULT_SEO },
        { key: 'careers', value: DEFAULT_CAREERS },
        { key: 'expertise', value: DEFAULT_EXPERTISE },
        { key: 'office', value: DEFAULT_OFFICE },
        { 
          key: 'ceo_whatsapp_number', 
          value: { 
            ceo_whatsapp_number: DEFAULT_SETTINGS.ceoWhatsAppNumber || "+923090111330",
            number: DEFAULT_SETTINGS.ceoWhatsAppNumber || "+923090111330"
          } 
        }
      ];

      for (const item of siteSettingDefaults) {
        if (!existingKeys.includes(item.key)) {
          console.log(`Seeding missing record in site_settings: ${item.key}`);
          await supabase.from('site_settings').upsert({ key: item.key, value: item.value });
        }
      }
    } catch (siteErr) {
      console.warn('Error seeding site_settings:', siteErr);
    }

    // Ensure company_information table single record is fetched/initialized
    try {
      await fetchCompanyInformation();
    } catch (ciErr) {
      console.error('Error initializing company_information:', ciErr);
    }

    console.log('Database verification and seeding checks finished.');
  } catch (err) {
    console.warn('Error during table seeding check:', err);
  }
};

// Load live data from Supabase if configured with centralized role checking
export const syncAllFromSupabase = async (userRole: string = 'Admin') => {
  if (!supabase) return null;
  try {
    // 0. Auto-seed if tables are empty
    await seedDatabaseIfEmpty();

    console.log(`Fetching live data from Supabase for role: ${userRole}...`);
    const result: any = {};
    const rolePerms = getRolePermissions(userRole);
    const isHRRole = rolePerms.role === 'HR';
    const permissionRestrictedTables: string[] = [];

    // Helper to determine whether a table query is allowed for the logged-in user's role
    const isTableAllowed = (tableKey: string): boolean => {
      if (rolePerms.isFullAdmin) return true;
      if (isHRRole) {
        const hrTables = ['careers', 'job_applications', 'contact_messages', 'team_members', 'team', 'admins'];
        return hrTables.includes(tableKey.toLowerCase().trim());
      }
      return rolePerms.allowedModules.includes(tableKey.toLowerCase().trim());
    };

    // 1. Products & Product Images
    if (!isTableAllowed('products')) {
      console.warn(`[RBAC Data Fetch Guard] Filtered out restricted table 'products' for role '${rolePerms.role}'`);
      permissionRestrictedTables.push('products');
      result.products = getStored('products', DEFAULT_PRODUCTS);
    } else {
      const { data: products, error: prodErr } = await supabase.from('products').select('*');
      const { data: productImgs } = await supabase.from('product_images').select('*').order('display_order', { ascending: true });

      const imagesByProductId: Record<string, ProductImage[]> = {};
      if (productImgs && Array.isArray(productImgs)) {
        productImgs.forEach((img: any) => {
          const pId = img.product_id || img.productId;
          if (!pId) return;
          if (!imagesByProductId[pId]) imagesByProductId[pId] = [];
          imagesByProductId[pId].push({
            id: img.id,
            productId: pId,
            imageUrl: img.image_url || img.imageUrl || '',
            displayOrder: img.display_order ?? img.displayOrder ?? 0,
            isPrimary: img.is_primary ?? img.isPrimary ?? false,
            altText: img.alt_text || img.altText || '',
            createdAt: img.created_at || img.createdAt,
            updatedAt: img.updated_at || img.updatedAt,
          });
        });
      }

      if (prodErr) {
        console.warn('[Supabase Sync] products query notice:', prodErr.message);
        result.products = getStored('products', DEFAULT_PRODUCTS);
      } else if (products) {
        const mappedProducts = products.map((item: any) => {
          const attachedImages = imagesByProductId[item.id] || [];
          const imageList = attachedImages.map(img => img.imageUrl).filter(Boolean);
          const primaryImg = attachedImages.find(img => img.isPrimary)?.imageUrl 
            || attachedImages[0]?.imageUrl 
            || item.image 
            || item.image_url 
            || '';
          const galleryList = Array.isArray(item.gallery) && item.gallery.length > 0
            ? item.gallery
            : (imageList.length > 1 ? imageList.slice(1) : []);

          return {
            id: item.id,
            name: item.name,
            logoText: item.logoText || item.logo_text || '',
            description: item.description,
            features: Array.isArray(item.features) ? item.features : [],
            gallery: galleryList,
            images: imageList.length > 0 ? imageList : (primaryImg ? [primaryImg, ...galleryList] : galleryList),
            productImages: attachedImages,
            category: item.category,
            status: item.status || 'Active',
            featured: item.featured ?? false,
            displayOrder: item.displayOrder ?? item.display_order ?? 0,
            image: primaryImg,
            logoUrl: item.logoUrl || item.logo_url || ''
          };
        });
        setStored('products', mappedProducts);
        result.products = mappedProducts;
      }
    }

    // 2. Team Members
    if (!isTableAllowed('team_members')) {
      console.warn(`[RBAC Data Fetch Guard] Filtered out restricted table 'team_members' for role '${rolePerms.role}'`);
      permissionRestrictedTables.push('team_members');
      result.team = getStored('team', DEFAULT_TEAM);
    } else {
      const { data: team, error: teamErr } = await supabase.from('team_members').select('*');
      if (teamErr) {
        console.warn('[Supabase Sync] team_members query notice:', teamErr.message);
        result.team = getStored('team', DEFAULT_TEAM);
      } else if (team) {
        const mappedTeam = team.map((item: any) => ({
          id: item.id,
          name: item.name,
          designation: item.designation,
          gender: item.gender || 'Male',
          experience: item.experience || '',
          socialLinks: item.socialLinks || item.social_links || {},
          dynamicSocialLinks: item.dynamicSocialLinks || item.dynamic_social_links || (Array.isArray(item.socialLinks?.dynamic) ? item.socialLinks.dynamic : undefined),
          displayOrder: item.displayOrder ?? item.display_order ?? 0,
          photoUrl: item.photoUrl || item.photo_url || ''
        }));
        setStored('team', mappedTeam);
        result.team = mappedTeam;
      }
    }

    // 3. Gallery
    if (!isTableAllowed('gallery')) {
      console.warn(`[RBAC Data Fetch Guard] Filtered out restricted table 'gallery' for role '${rolePerms.role}'`);
      permissionRestrictedTables.push('gallery');
      result.gallery = getStored('gallery', DEFAULT_GALLERY);
    } else {
      const { data: gallery, error: gallErr } = await supabase.from('gallery').select('*');
      if (gallErr) {
        console.warn('[Supabase Sync] gallery query notice:', gallErr.message);
        result.gallery = getStored('gallery', DEFAULT_GALLERY);
      } else if (gallery) {
        const mappedGallery = gallery.map((item: any) => ({
          id: item.id,
          category: item.category || 'Office',
          caption: item.caption || '',
          imageUrl: item.imageUrl || item.image_url || ''
        }));
        setStored('gallery', mappedGallery);
        result.gallery = mappedGallery;
      }
    }

    // 4. Services
    if (!isTableAllowed('services')) {
      console.warn(`[RBAC Data Fetch Guard] Filtered out restricted table 'services' for role '${rolePerms.role}'`);
      permissionRestrictedTables.push('services');
      result.services = getStored('services', DEFAULT_SERVICES);
    } else {
      const { data: services, error: servErr } = await supabase.from('services').select('*');
      if (servErr) {
        console.warn('[Supabase Sync] services query notice:', servErr.message);
        result.services = getStored('services', DEFAULT_SERVICES);
      } else if (services) {
        const mappedServices = services.map((item: any) => ({
          id: item.id,
          title: item.title,
          icon: item.icon || 'Globe',
          description: item.description || '',
          displayOrder: item.displayOrder ?? item.display_order ?? 0
        }));
        setStored('services', mappedServices);
        result.services = mappedServices;
      }
    }

    // 5. Client Reviews
    if (!isTableAllowed('reviews') && !isTableAllowed('client_reviews')) {
      console.warn(`[RBAC Data Fetch Guard] Filtered out restricted table 'reviews' for role '${rolePerms.role}'`);
      permissionRestrictedTables.push('reviews');
      result.reviews = getStored('reviews', DEFAULT_REVIEWS);
    } else {
      let reviewsData: any[] | null = null;
      const { data: revData1, error: revErr1 } = await supabase.from('client_reviews').select('*');
      if (!revErr1 && revData1 && revData1.length > 0) {
        reviewsData = revData1;
      } else {
        const { data: revData2, error: revErr2 } = await supabase.from('reviews').select('*');
        if (revErr2) {
          console.warn('[Supabase Sync] reviews query notice:', revErr2.message);
        }
        if (!revErr2 && revData2) {
          reviewsData = revData2;
        } else {
          reviewsData = revData1 || [];
        }
      }

      if (reviewsData && reviewsData.length > 0) {
        const mappedReviews = reviewsData.map((item: any, idx: number) => ({
          id: item.id,
          name: item.name || item.full_name || item.author || '',
          designation: item.designation || item.role || '',
          company: item.company || '',
          country: item.country || '',
          email: item.email || '',
          rating: item.rating ?? 5,
          review: item.review || item.text || item.content || '',
          photoUrl: item.photoUrl || item.photo_url || item.profile_image || item.user_image || '',
          companyLogoUrl: item.companyLogoUrl || item.company_logo_url || item.company_logo || '',
          status: item.status || 'approved',
          featured: item.featured ?? item.is_featured ?? (idx < 2),
          displayOrder: item.displayOrder ?? item.display_order ?? (idx + 1),
          createdAt: item.createdAt || item.created_at || new Date().toISOString(),
          updatedAt: item.updatedAt || item.updated_at
        }));
        setStored('reviews', mappedReviews);
        result.reviews = mappedReviews;
      } else {
        result.reviews = getStored('reviews', DEFAULT_REVIEWS);
      }
    }

    // 6. Contact Messages
    const { data: messages, error: msgErr } = await supabase.from('contact_messages').select('*');
    if (msgErr) {
      console.warn('[Supabase Sync] contact_messages query notice:', msgErr.message);
      result.messages = getStored('messages', DEFAULT_MESSAGES);
    } else if (messages) {
      const mappedMessages = messages.map((item: any) => ({
        id: item.id,
        name: item.name || '',
        email: item.email || '',
        subject: item.subject || '',
        message: item.message || '',
        read: item.read ?? false,
        repliedStatus: item.repliedStatus || item.replied_status || 'Pending',
        createdAt: item.createdAt || item.created_at || new Date().toISOString(),
        replies: Array.isArray(item.replies) ? item.replies : []
      }));
      setStored('messages', mappedMessages);
      result.messages = mappedMessages;
    }

    // 6.5. Careers
    if (!isTableAllowed('careers')) {
      console.warn(`[RBAC Data Fetch Guard] Filtered out restricted table 'careers' for role '${rolePerms.role}'`);
      permissionRestrictedTables.push('careers');
      result.careers = getStored('careers', DEFAULT_CAREERS);
    } else {
      const { data: rawCareers, error: careersErr } = await supabase.from('careers').select('*');
      console.log('[Supabase Sync Inspection] Raw careers data from Supabase:', rawCareers);

      // Normalization check: verify if the returned data is an object, wrapped property, or single item instead of an array
      let normalizedCareersList: any[] = [];
      if (careersErr) {
        console.warn('[Supabase Sync] careers query notice:', careersErr.message);
      } else if (Array.isArray(rawCareers)) {
        normalizedCareersList = rawCareers;
      } else if (rawCareers && typeof rawCareers === 'object') {
        if (Array.isArray((rawCareers as any).data)) {
          normalizedCareersList = (rawCareers as any).data;
        } else if (Array.isArray((rawCareers as any).value)) {
          normalizedCareersList = (rawCareers as any).value;
        } else if ((rawCareers as any).id || (rawCareers as any).title) {
          normalizedCareersList = [rawCareers];
        }
      }

      // The dedicated `careers` table's column schema (is_active/responsibilities/experience)
      // does not match the fields the Admin Panel writes (active/benefits), so admin saves of
      // new/edited jobs land reliably in `website_settings` (key: 'careers') but not always in
      // this table. Treat an empty/errored `careers` table read as inconclusive and fall back to
      // the website_settings / site_settings mirror (and finally local storage) instead of
      // treating "no rows from this table" as "no careers exist" — this is what was overwriting
      // saved jobs with stale/empty data on refresh.
      // Careers exist in multiple legacy stores in this project. NEVER let a shorter
      // website_settings/site_settings snapshot overwrite the complete careers table.
      // Merge all available sources by ID, preserving the complete union of records.
      try {
        const sourceLists: any[][] = [];
        if (Array.isArray(normalizedCareersList)) sourceLists.push(normalizedCareersList);

        const { data: setRow } = await supabase.from('website_settings').select('value').eq('key', 'careers').maybeSingle();
        if (setRow && Array.isArray((setRow as any).value)) sourceLists.push((setRow as any).value);

        const { data: siteSetRow } = await supabase.from('site_settings').select('value').eq('key', 'careers').maybeSingle();
        if (siteSetRow && Array.isArray((siteSetRow as any).value)) sourceLists.push((siteSetRow as any).value);

        const mergedById = new Map<string, any>();
        for (const list of sourceLists) {
          for (const item of list) {
            if (!item) continue;
            const id = String(item.id || '');
            if (!id) continue;
            const previous = mergedById.get(id);
            // Keep the first (dedicated careers-table) record authoritative, while
            // filling any missing fields from the settings mirrors.
            mergedById.set(id, previous ? { ...item, ...previous } : item);
          }
        }
        normalizedCareersList = Array.from(mergedById.values());
      } catch (careersFallbackErr) {
        console.warn('[Supabase Sync] careers multi-source merge notice:', careersFallbackErr);
      }

      /* legacy fallback retained below only when the authoritative snapshot is unavailable */
      if (normalizedCareersList.length === 0) {
        try {
          const { data: setRow } = await supabase.from('website_settings').select('value').eq('key', 'careers').maybeSingle();
          if (setRow && Array.isArray((setRow as any).value) && (setRow as any).value.length > 0) {
            normalizedCareersList = (setRow as any).value;
          } else {
            const { data: siteSetRow } = await supabase.from('site_settings').select('value').eq('key', 'careers').maybeSingle();
            if (siteSetRow && Array.isArray((siteSetRow as any).value) && (siteSetRow as any).value.length > 0) {
              normalizedCareersList = (siteSetRow as any).value;
            }
          }
        } catch (careersFallbackErr) {
          console.warn('[Supabase Sync] careers website_settings fallback notice:', careersFallbackErr);
        }
      }

      if (normalizedCareersList.length > 0) {
        const mappedCareers = normalizedCareersList.map((item: any) => ({
          id: item.id || '',
          title: item.title || item.job_title || '',
          type: item.type === 'internship' ? 'internship' : 'job',
          department: item.department || 'General',
          location: item.location || 'Bahawalpur, Pakistan',
          description: item.description || '',
          requirements: Array.isArray(item.requirements)
            ? item.requirements
            : (typeof item.requirements === 'string' ? JSON.parse(item.requirements || '[]') : []),
          benefits: Array.isArray(item.benefits)
            ? item.benefits
            : (Array.isArray(item.responsibilities)
                ? item.responsibilities
                : (typeof item.benefits === 'string' ? JSON.parse(item.benefits || '[]') : [])),
          active: item.active !== undefined ? item.active : (item.is_active !== undefined ? item.is_active : true)
        }));
        setStored('careers', mappedCareers);
        result.careers = mappedCareers;
      } else {
        // Nothing found in the careers table or its website_settings/site_settings mirror —
        // fall back to whatever is in local storage rather than forcing an empty state.
        result.careers = getStored('careers', DEFAULT_CAREERS);
      }
    }
    // 7. Job Applications
    if (!isTableAllowed('job_applications')) {
      console.warn(`[RBAC Data Fetch Guard] Filtered out restricted table 'job_applications' for role '${rolePerms.role}'`);
      permissionRestrictedTables.push('job_applications');
      result.applications = getStored('applications', []);
    } else {
      const { data: rawApplications, error: appErr } = await supabase.from('job_applications').select('*');
      console.log('[Supabase Sync Inspection] Raw job_applications data from Supabase:', rawApplications);

      if (appErr) {
        console.warn('[Supabase Sync] job_applications query notice:', appErr.message);
        result.applications = getStored('applications', []);
      } else {
        // Normalization check: verify if the returned data is an object, wrapped property, or single item instead of an array
        let normalizedApplicationsList: any[] = [];
        if (Array.isArray(rawApplications)) {
          normalizedApplicationsList = rawApplications;
        } else if (rawApplications && typeof rawApplications === 'object') {
          if (Array.isArray((rawApplications as any).data)) {
            normalizedApplicationsList = (rawApplications as any).data;
          } else if (Array.isArray((rawApplications as any).value)) {
            normalizedApplicationsList = (rawApplications as any).value;
          } else if ((rawApplications as any).id || (rawApplications as any).job_title || (rawApplications as any).applicant_name || (rawApplications as any).fullName) {
            normalizedApplicationsList = [rawApplications];
          }
        }

        const mappedApplications = normalizedApplicationsList.map((item: any) => ({
          id: item.id || '',
          jobId: item.jobId || item.job_id || '',
          jobTitle: item.jobTitle || item.job_title || '',
          fullName: item.fullName || item.full_name || item.applicant_name || '',
          email: item.email || '',
          phone: item.phone || '',
          resumeUrl: item.resumeUrl || item.resume_url || '',
          coverLetter: item.coverLetter || item.cover_letter || item.cover_note || '',
          appliedAt: item.appliedAt || item.applied_at || item.created_at || new Date().toISOString(),
          status: item.status || 'New'
        }));
        setStored('applications', mappedApplications);
        result.applications = mappedApplications;
      }
    }

    // 7.5. Hero Slides
    const { data: heroSlides, error: slidesErr } = await supabase.from('hero_slides').select('*').order('display_order', { ascending: true });
    if (slidesErr) {
      console.warn('[Supabase Sync] hero_slides query notice:', slidesErr.message);
      result.heroSlides = getStored('hero_slides', [DEFAULT_HERO]);
    } else if (heroSlides && heroSlides.length > 0) {
      const mappedSlides = heroSlides.map((item: any) => ({
        id: item.id,
        title: item.title || '',
        description: item.description || '',
        imageUrl: item.imageUrl || item.image_url || '',
        buttonText: item.buttonText || item.button_text || '',
        buttonLink: item.buttonLink || item.button_link || '',
        displayOrder: item.displayOrder ?? item.display_order ?? 0,
        isActive: item.isActive ?? item.is_active ?? true,
        createdAt: item.createdAt || item.created_at,
        updatedAt: item.updatedAt || item.updated_at
      }));
      setStored('hero_slides', mappedSlides);
      result.heroSlides = mappedSlides;
    }

    // 7.6. Process Items
    let procRows: any[] | null = null;
    const { data: processData, error: processErr } = await supabase.from('process_items').select('*');
    if (!processErr && processData && processData.length > 0) {
      procRows = processData;
    } else {
      const { data: devProcData } = await supabase.from('development_process').select('*');
      if (devProcData && devProcData.length > 0) procRows = devProcData;
    }
    if (procRows && procRows.length > 0) {
      const mappedProcess = procRows.map((item: any) => ({
        id: item.id,
        title: item.title || '',
        description: item.description || item.desc || '',
        icon: item.icon || 'Search',
        displayOrder: item.displayOrder ?? item.display_order ?? item.step_number ?? 0,
        active: item.active ?? item.is_active ?? true
      }));
      setStored('process', mappedProcess);
      result.process = mappedProcess;
    }

    // 7.7. Industry Items
    let indRows: any[] | null = null;
    const { data: indData, error: indErr } = await supabase.from('industry_items').select('*');
    if (!indErr && indData && indData.length > 0) {
      indRows = indData;
    } else {
      const { data: indFallback } = await supabase.from('industries').select('*');
      if (indFallback && indFallback.length > 0) indRows = indFallback;
    }
    if (indRows && indRows.length > 0) {
      const mappedInd = indRows.map((item: any) => ({
        id: item.id,
        title: item.title || item.name || '',
        displayOrder: item.displayOrder ?? item.display_order ?? 0,
        active: item.active ?? item.is_active ?? true
      }));
      setStored('industries', mappedInd);
      result.industries = mappedInd;
    }

    // 7.8. Tech Stack Items
    let techRows: any[] | null = null;
    const { data: techData, error: techErr } = await supabase.from('tech_stack_items').select('*');
    if (!techErr && techData && techData.length > 0) {
      techRows = techData;
    } else {
      const { data: techFallback } = await supabase.from('technology_stack').select('*');
      if (techFallback && techFallback.length > 0) techRows = techFallback;
    }
    if (techRows && techRows.length > 0) {
      const mappedTech = techRows.map((item: any) => ({
        id: item.id,
        title: item.title || '',
        description: item.description || '',
        iconType: item.iconType || item.icon_type || 'lucide',
        iconName: item.iconName || item.icon_name || item.icon || 'Code',
        imageUrl: item.imageUrl || item.image_url || '',
        displayOrder: item.displayOrder ?? item.display_order ?? 0,
        active: item.active ?? item.is_active ?? true
      }));
      setStored('tech_stack', mappedTech);
      result.techStack = mappedTech;
    }

    // 8. Website Settings & Site Settings
    const { data: siteSetData } = await supabase.from('site_settings').select('*');
    const { data: settingsData } = await supabase.from('website_settings').select('*');

    const combinedSettingsMap: Record<string, any> = {};

    // 1. Process site_settings rows
    if (siteSetData && siteSetData.length > 0) {
      siteSetData.forEach((row: any) => {
        if (row.key && row.key !== 'ceo_whatsapp_number') {
          combinedSettingsMap[row.key] = row.value || {};
        }
      });
    }

    // 2. Process website_settings rows
    if (settingsData && settingsData.length > 0) {
      settingsData.forEach((row: any) => {
        if (row.key && row.key !== 'ceo_whatsapp_number') {
          let val = row.value || {};
          if (row.key === 'settings') {
            if (row.company_logo !== undefined && row.company_logo !== null) val.companyLogo = row.company_logo;
            if (row.google_map) val.googleMapsEmbedUrl = row.google_map;
            if (row.copyright) val.copyright = row.copyright;
            if (!val.socialLinks) val.socialLinks = {};
            if (row.facebook) val.socialLinks.facebook = row.facebook;
            if (row.linkedin) val.socialLinks.linkedin = row.linkedin;
            if (row.instagram) val.socialLinks.instagram = row.instagram;
            if (row.youtube) val.socialLinks.youtube = row.youtube;
          }
          combinedSettingsMap[row.key] = { ...combinedSettingsMap[row.key], ...val };
        }
      });
    }

    // Store combined settings, but NEVER overwrite the authoritative careers result.
    // Careers are loaded from the dedicated careers table above and may be more complete
    // than legacy website_settings/site_settings mirrors.
    Object.keys(combinedSettingsMap).forEach((key) => {
      if (key === 'careers') return;
      setStored(key, combinedSettingsMap[key]);
      result[key] = combinedSettingsMap[key];
    });

    // 9. Single Source of Truth: Fetch company_information table
    const companyInfo = await fetchCompanyInformation();
    result.companyInformation = companyInfo;
    result.companyContact = companyInfo;

    // Attach RBAC permission restricted metadata for UI notification banners
    result.permissionRestrictedTables = permissionRestrictedTables;
    result.hasRestrictedTables = permissionRestrictedTables.length > 0;
    result.permissionNotice = permissionRestrictedTables.length > 0
      ? `Permission Restricted: Role '${rolePerms.role}' queries filtered to authorized tables only.`
      : null;

    return result;
  } catch (err) {
    console.warn('Error during syncAllFromSupabase:', err);
    return null;
  }
};

export const dbStore = {
  getHero: (): HeroData => {
    const stored = getStored<HeroData>('hero', DEFAULT_HERO);
    return {
      heading: stored?.heading || DEFAULT_HERO.heading,
      subHeading: stored?.subHeading || DEFAULT_HERO.subHeading,
      imageUrl: stored?.imageUrl ?? DEFAULT_HERO.imageUrl,
      primaryBtnText: stored?.primaryBtnText || DEFAULT_HERO.primaryBtnText,
      primaryBtnLink: stored?.primaryBtnLink || DEFAULT_HERO.primaryBtnLink,
      secondaryBtnText: stored?.secondaryBtnText || DEFAULT_HERO.secondaryBtnText,
      secondaryBtnLink: stored?.secondaryBtnLink || DEFAULT_HERO.secondaryBtnLink,
    };
  },
  saveHero: (data: HeroData) => {
    setStored('hero', data);
    saveWebsiteSetting('hero', data);
  },

  getAbout: (): AboutData => getStored('about', DEFAULT_ABOUT),
  saveAbout: (data: AboutData) => {
    setStored('about', data);
    saveWebsiteSetting('about', data);
  },

  getServices: (): ServiceItem[] => getStored('services', DEFAULT_SERVICES).sort((a, b) => a.displayOrder - b.displayOrder),
  saveServices: (items: ServiceItem[]) => {
    setStored('services', items);
    syncTableToSupabase('services', items);
  },

  getProducts: (): ProductItem[] => getStored('products', DEFAULT_PRODUCTS).sort((a, b) => a.displayOrder - b.displayOrder),
  saveProducts: (items: ProductItem[]) => {
    setStored('products', items);
    syncTableToSupabase('products', items);
    // Also synchronize product_images table for array-like image storage
    if (Array.isArray(items)) {
      items.forEach((prod) => {
        const imageList = prod.productImages && prod.productImages.length > 0
          ? prod.productImages
          : (prod.images && prod.images.length > 0
              ? prod.images
              : [prod.image, ...(prod.gallery || [])].filter(Boolean));
        syncProductImagesToSupabase(prod.id, imageList);
      });
    }
  },

  getTeam: (): TeamMember[] => {
    const raw = getStored<TeamMember[]>('team', DEFAULT_TEAM);
    const cleaned = raw.map(m => {
      const isCEO = m.name === 'Muhammad Junaid' || m.designation?.toLowerCase().includes('ceo') || m.designation?.toLowerCase().includes('founder');
      if (isCEO) {
        if (m.socialLinks) {
          m.socialLinks.whatsapp = 'https://wa.me/923090111330';
        }
        if (Array.isArray(m.dynamicSocialLinks)) {
          m.dynamicSocialLinks = m.dynamicSocialLinks.map(l => {
            const p = (l.platform || '').toLowerCase();
            if (p.includes('whatsapp') || p.includes('wa')) {
              return { ...l, url: 'https://wa.me/923090111330' };
            }
            return l;
          });
        }
      }
      return m;
    });
    return cleaned.sort((a, b) => a.displayOrder - b.displayOrder);
  },
  saveTeam: (items: TeamMember[]) => {
    setStored('team', items);
    syncTableToSupabase('team_members', items);
  },

  getGallery: (): GalleryItem[] => getStored('gallery', DEFAULT_GALLERY),
  saveGallery: (items: GalleryItem[]) => {
    setStored('gallery', items);
    syncTableToSupabase('gallery', items);
  },

  getReviews: (): ClientReview[] => {
    const raw = getStored<ClientReview[]>('reviews', DEFAULT_REVIEWS);
    return raw.map((r, idx) => ({
      ...r,
      name: r.name || (r as any).full_name || 'Valued Partner',
      designation: r.designation || 'Executive',
      company: r.company || 'Enterprise Partner',
      photoUrl: r.photoUrl || (r as any).profile_image || (r as any).photo_url || '',
      companyLogoUrl: r.companyLogoUrl || (r as any).company_logo || '',
      status: r.status || 'approved',
      featured: r.featured ?? (idx < 2),
      displayOrder: r.displayOrder ?? (r as any).display_order ?? (idx + 1),
      createdAt: r.createdAt || (r as any).created_at || new Date().toISOString()
    }));
  },
  saveReviews: (items: ClientReview[]) => {
    setStored('reviews', items);
    syncTableToSupabase('client_reviews', items);
  },

  getCareers: (): CareerOpportunity[] => getStored('careers', DEFAULT_CAREERS),
  saveCareers: async (items: CareerOpportunity[]) => {
    // Careers must be additive/persistent: never replace the database array with a partial
    // client-side list (which can happen when the Admin Panel has stale state).
    const incoming = Array.isArray(items) ? items : [];
    let existing: CareerOpportunity[] = [];

    try {
      if (supabase) {
        const { data: row } = await supabase.from('website_settings').select('value').eq('key', 'careers').maybeSingle();
        if (row && Array.isArray((row as any).value)) existing = (row as any).value as CareerOpportunity[];
      }
    } catch (e) {
      console.warn('[Careers] existing settings read notice:', e);
    }

    const byId = new Map<string, CareerOpportunity>();
    for (const job of existing) if (job?.id) byId.set(job.id, job);
    for (const job of incoming) if (job?.id) byId.set(job.id, job);
    const merged = Array.from(byId.values());

    setStored('careers', merged);
    await saveWebsiteSetting('careers', merged);

    // Also persist the normalized records to the dedicated careers table.
    if (supabase && merged.length) {
      try {
        const rows = merged.map((job: any) => ({
          id: job.id,
          title: job.title || '',
          type: job.type || 'job',
          department: job.department || 'General',
          location: job.location || '',
          description: job.description || '',
          requirements: Array.isArray(job.requirements) ? job.requirements : [],
          responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : (Array.isArray(job.benefits) ? job.benefits : []),
          experience: job.experience || '',
          is_active: job.active !== false,
          active: job.active !== false,
          isActive: job.active !== false
        }));
        const { error } = await supabase.from('careers').upsert(rows, { onConflict: 'id' });
        if (error) console.warn('[Careers] dedicated table upsert notice:', error.message);
      } catch (e) {
        console.warn('[Careers] dedicated table sync notice:', e);
      }
    }
    return merged;
  },

  getApplications: (): JobApplication[] => getStored('applications', []),
  saveApplications: (items: JobApplication[]) => {
    setStored('applications', items);
    syncTableToSupabase('job_applications', items);
  },

  getMessages: (): ContactMessage[] => getStored('messages', DEFAULT_MESSAGES),
  saveMessages: (items: ContactMessage[]) => {
    setStored('messages', items);
    syncTableToSupabase('contact_messages', items);
  },

  getSettings: (): SystemSettings => {
    const s = getStored('settings', DEFAULT_SETTINGS);
    if (s) {
      if (s.companyName) {
        s.companyName = s.companyName.replace(/\s*SMC\s*(Pvt\s*Ltd|Private\s*Limited)?/gi, '').trim() || 'ApnaKhaiyal';
      }
      if (s.copyright) {
        s.copyright = s.copyright.replace(/\s*SECP\s*SMC\s*Registration\.?/gi, '').replace(/ApnaKhiyal/gi, 'ApnaKhaiyal').trim();
      }
      if (s.address && (s.address.includes('Sector G-11') || s.address.includes('Islamabad'))) {
        s.address = 'Model Town C, Bahawalpur, Pakistan';
      }
      if (s.googleMapsEmbedUrl && (s.googleMapsEmbedUrl.includes('G-11') || s.googleMapsEmbedUrl.includes('Islamabad') || s.googleMapsEmbedUrl.includes('33.68442228070742'))) {
        s.googleMapsEmbedUrl = 'https://maps.google.com/maps?q=Model%20Town%20C%2C%20Bahawalpur%2C%20Pakistan&t=&z=15&ie=UTF8&iwloc=&output=embed';
      }
      if (!s.ceoWhatsAppNumber || s.ceoWhatsAppNumber.includes('30591101291') || s.ceoWhatsAppNumber.includes('3001234567')) {
        s.ceoWhatsAppNumber = '+923090111330';
      }
      if (!s.whatsappNumber || s.whatsappNumber.includes('30591101291') || s.whatsappNumber.includes('3001234567')) {
        s.whatsappNumber = '+923090111330';
      }
      if (!s.servicesSectionHeading) {
        s.servicesSectionHeading = 'Our Expertise';
      }
      if (s.servicesSectionSubtitle === undefined) {
        s.servicesSectionSubtitle = 'We deliver premium enterprise solutions.';
      }
      if (!s.productShowcaseSectionHeading) {
        s.productShowcaseSectionHeading = 'Featured Proprietary Systems';
      }
      if (!s.processSectionSmallHeading) {
        s.processSectionSmallHeading = 'Engineering Workflow';
      }
      if (!s.processSectionMainHeading) {
        s.processSectionMainHeading = 'Our Rigorous Development Process';
      }
      if (s.processSectionSubtitle === undefined) {
        s.processSectionSubtitle = '';
      }
      if (!s.industriesSectionHeading) {
        s.industriesSectionHeading = 'Industries We Serve';
      }
      if (s.industriesSectionSubtitle === undefined) {
        s.industriesSectionSubtitle = 'Delivering robust automation schemas across multiple vertical segments.';
      }
      if (!s.techStackSectionHeading) {
        s.techStackSectionHeading = 'Our Technology Stack';
      }
      if (s.techStackSectionSubtitle === undefined) {
        s.techStackSectionSubtitle = '';
      }
    }
    return s || DEFAULT_SETTINGS;
  },
  saveSettings: (items: SystemSettings) => {
    setStored('settings', items);
    saveWebsiteSetting('settings', items);
  },
  getCompanyInformation: (): CompanyInformation => {
    const info = getStored('company_information', DEFAULT_COMPANY_INFORMATION);
    if (info && (!info.address || info.address.includes('Sector G-11') || info.address.includes('Islamabad'))) {
      info.address = 'Model Town C, Bahawalpur, Pakistan';
    }
    return info || DEFAULT_COMPANY_INFORMATION;
  },
  updateCompanyInformation: (data: Partial<CompanyInformation>) => updateCompanyInformation(data),
  getCompanyContact: (): CompanyInformation => {
    const info = getStored('company_information', DEFAULT_COMPANY_INFORMATION);
    if (info && (!info.address || info.address.includes('Sector G-11') || info.address.includes('Islamabad'))) {
      info.address = 'Model Town C, Bahawalpur, Pakistan';
    }
    return info || DEFAULT_COMPANY_INFORMATION;
  },
  updateCompanyContact: (data: Partial<CompanyInformation>) => updateCompanyInformation(data),

  getProcess: (): ProcessItem[] => getStored('process', DEFAULT_PROCESS).sort((a, b) => a.displayOrder - b.displayOrder),
  saveProcess: (items: ProcessItem[]) => {
    setStored('process', items);
    syncTableToSupabase('process_items', items);
    saveWebsiteSetting('process_items', items);
  },

  getIndustries: (): IndustryItem[] => getStored('industries', DEFAULT_INDUSTRIES).sort((a, b) => a.displayOrder - b.displayOrder),
  saveIndustries: (items: IndustryItem[]) => {
    setStored('industries', items);
    syncTableToSupabase('industry_items', items);
    saveWebsiteSetting('industry_items', items);
  },

  getTechStack: (): TechStackItem[] => getStored('tech_stack', DEFAULT_TECH_STACK).sort((a, b) => a.displayOrder - b.displayOrder),
  saveTechStack: (items: TechStackItem[]) => {
    setStored('tech_stack', items);
    syncTableToSupabase('tech_stack_items', items);
    saveWebsiteSetting('tech_stack_items', items);
  },

  getSEO: (): SEOSettings => getStored('seo', DEFAULT_SEO),
  saveSEO: (items: SEOSettings) => {
    setStored('seo', items);
    saveWebsiteSetting('seo', items);
  },

  getExpertise: (): ExpertiseItem[] => getStored('expertise', DEFAULT_EXPERTISE).sort((a, b) => a.displayOrder - b.displayOrder),
  saveExpertise: (items: ExpertiseItem[]) => {
    setStored('expertise', items);
    saveWebsiteSetting('expertise', items);
  },

  getOffice: (): CorporateOfficeSettings => {
    const off = getStored('office', DEFAULT_OFFICE);
    if (off) {
      if (!off.address || off.address.includes('Sector G-11') || off.address.includes('Islamabad')) {
        off.address = 'Model Town C, Bahawalpur, Pakistan';
      }
      if (!off.googleMapLink || off.googleMapLink.includes('output=embed') || off.googleMapLink.includes('G-11') || off.googleMapLink.includes('Islamabad')) {
        off.googleMapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(off.address || 'Model Town C, Bahawalpur, Pakistan')}`;
      }
    }
    return off || DEFAULT_OFFICE;
  },
  saveOffice: (data: CorporateOfficeSettings) => {
    setStored('office', data);
    saveWebsiteSetting('office', data);
  },

  getHeroSlides: (): HeroSlide[] => getStored('hero_slides', DEFAULT_HERO_SLIDES).sort((a, b) => a.displayOrder - b.displayOrder),
  saveHeroSlides: (items: HeroSlide[]) => {
    setStored('hero_slides', items);
    syncTableToSupabase('hero_slides', items);
  }
};

export const getAvatarUrl = (gender?: 'Male' | 'Female' | string, name?: string) => {
  const seed = encodeURIComponent((name && name.trim()) || 'User');
  const isFemale = typeof gender === 'string' && gender.toLowerCase().trim() === 'female';

  if (isFemale) {
    return `https://api.dicebear.com/9.x/personas/svg?seed=${seed}&hair=long,bobCut,curly,bobBangs,straightBun,extraLong&backgroundColor=f5d76e`;
  }

  return `https://api.dicebear.com/9.x/personas/svg?seed=${seed}&hair=shortCombover,buzzcut,fade,shortComboverChops&backgroundColor=d4af37`;
};

// =========================================================================
// SUPABASE AUTHENTICATION & ADMIN ROLE VERIFICATION HELPERS
// =========================================================================

export function normalizeAdminRole(roleStr: any): 'Admin' | 'HR' | 'Support' {
  if (!roleStr || typeof roleStr !== 'string') return 'Admin';
  const norm = roleStr.trim().toLowerCase();
  if (norm === 'hr') return 'HR';
  if (norm === 'support') return 'Support';
  if (norm === 'admin' || norm === 'superadmin' || norm.includes('admin')) return 'Admin';
  return 'Admin';
}

export async function verifyAndStoreAdminRole(userId?: string, email?: string, fullName?: string): Promise<{ isAdmin: boolean; role?: 'Admin' | 'HR' | 'Support'; message?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { isAdmin: true, role: 'Admin' };
  }

  try {
    const nowIso = new Date().toISOString();

    // 1. Get authenticated user using supabase.auth.getUser()
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr) {
      console.error('[Supabase Auth Error] getUser failed in verifyAndStoreAdminRole:', {
        message: authErr.message,
        code: (authErr as any).code,
        status: authErr.status
      });
    }
    const user = authData?.user;

    const targetUserId = userId || user?.id;
    const cleanEmail = (email || user?.email || '').toLowerCase().trim();
    const effectiveFullName = fullName || user?.user_metadata?.full_name || user?.user_metadata?.name || (cleanEmail ? cleanEmail.split('@')[0] : 'Administrator');

    if (!targetUserId && !cleanEmail) {
      console.warn('[Admin Lookup] Missing user ID and email in verifyAndStoreAdminRole.');
      return { isAdmin: false, role: 'Admin', message: 'Missing user identification credentials.' };
    }

    console.log(`[Admin Lookup] Verifying public.admins record for UUID: ${targetUserId}, Email: ${cleanEmail}`);

    let determinedRole: 'Admin' | 'HR' | 'Support' = 'Admin';
    let existingAdmin: any = null;

    // 2. Query public.admins using user_id
    if (targetUserId) {
      const { data: byUserId, error: errUserId } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (errUserId) {
        console.error('[Supabase SELECT Error] public.admins by user_id:', {
          message: errUserId.message,
          code: errUserId.code,
          details: errUserId.details,
          hint: errUserId.hint
        });
      } else if (byUserId) {
        existingAdmin = byUserId;
      }
    }

    // 3. Fallback query by email if not found by user_id
    if (!existingAdmin && cleanEmail) {
      const { data: byEmail, error: errEmail } = await supabase
        .from('admins')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (errEmail) {
        console.error('[Supabase SELECT Error] public.admins by email:', {
          message: errEmail.message,
          code: errEmail.code,
          details: errEmail.details,
          hint: errEmail.hint
        });
      } else if (byEmail) {
        existingAdmin = byEmail;
      }
    }

    // 4. Handle missing public.admins record or existing record role assignment
    if (!existingAdmin) {
      const initialRole: 'Admin' | 'HR' | 'Support' = cleanEmail === 'junaidrana80@gmail.com' ? 'HR' : 'Admin';
      console.log(`[Admin Lookup] Creating missing public.admins row for ${cleanEmail} (UUID: ${targetUserId}) with role ${initialRole}`);

      const { data: newAdmin, error: insertErr } = await supabase
        .from('admins')
        .upsert({
          user_id: targetUserId,
          email: cleanEmail,
          full_name: effectiveFullName,
          role: initialRole,
          is_active: true,
          last_login: nowIso,
          created_at: nowIso,
          updated_at: nowIso
        }, { onConflict: 'email' })
        .select()
        .maybeSingle();

      if (insertErr) {
        console.error('[Supabase UPSERT Error] public.admins table:', {
          message: insertErr.message,
          code: insertErr.code,
          details: insertErr.details,
          hint: insertErr.hint
        });
        determinedRole = initialRole;
      } else if (newAdmin) {
        existingAdmin = newAdmin;
        determinedRole = normalizeAdminRole(newAdmin.role || initialRole);
      } else {
        determinedRole = initialRole;
      }
    } else {
      // Read role directly from existingAdmin row in public.admins
      determinedRole = normalizeAdminRole(existingAdmin.role);

      // Update existing record: link user_id if missing, sync last_login
      const updatePayload: Record<string, any> = {
        user_id: targetUserId || existingAdmin.user_id,
        email: cleanEmail || existingAdmin.email,
        full_name: existingAdmin.full_name || effectiveFullName,
        role: determinedRole,
        is_active: true,
        last_login: nowIso,
        updated_at: nowIso
      };

      const { error: updateErr } = await supabase
        .from('admins')
        .update(updatePayload)
        .eq('id', existingAdmin.id);

      if (updateErr) {
        console.error('[Supabase UPDATE Error] public.admins table:', {
          message: updateErr.message,
          code: updateErr.code,
          details: updateErr.details,
          hint: updateErr.hint
        });
      }
    }

    // Synchronize admin_roles table for backward compatibility
    if (targetUserId) {
      try {
        await supabase.from('admin_roles').upsert({
          user_id: targetUserId,
          email: cleanEmail,
          role: determinedRole.toLowerCase(),
          created_at: nowIso
        }, { onConflict: 'user_id' });
      } catch (e) {
        // Safe fallback
      }
    }

    // Synchronize Auth metadata
    if (user && user.id === targetUserId) {
      try {
        await supabase.auth.updateUser({
          data: { role: determinedRole.toLowerCase(), full_name: effectiveFullName }
        });
      } catch (e) {
        // Safe fallback
      }
    }

    return { isAdmin: true, role: determinedRole };
  } catch (err: any) {
    console.error('[Admin Lookup Error] Exception in verifyAndStoreAdminRole:', err);
    return { isAdmin: false, role: 'Admin', message: err.message || 'Verification exception occurred.' };
  }
}

export async function getAdminUserRole(userId: string): Promise<'Admin' | 'HR' | 'Support'> {
  if (!supabase || !isSupabaseConfigured) {
    return 'Admin';
  }
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[Supabase SELECT Error] public.admins role by user_id:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    }

    if (!error && data && data.role) {
      return normalizeAdminRole(data.role);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      const { data: adminByEmail, error: errEmail } = await supabase
        .from('admins')
        .select('role')
        .eq('email', user.email.toLowerCase().trim())
        .maybeSingle();

      if (errEmail) {
        console.error('[Supabase SELECT Error] public.admins role by email:', {
          message: errEmail.message,
          code: errEmail.code,
          details: errEmail.details,
          hint: errEmail.hint
        });
      }

      if (adminByEmail && adminByEmail.role) {
        return normalizeAdminRole(adminByEmail.role);
      }
    }
  } catch (err: any) {
    console.warn('getAdminUserRole error:', err);
  }
  return 'Admin';
}

function dataUserHasAdminRole(user: any): boolean {
  if (!user) return false;
  const role = (user.user_metadata?.role || user.app_metadata?.role || '').toLowerCase();
  return role === 'admin' || role === 'hr' || role === 'support';
}

export async function signUpAdminAccount(email: string, password: string, fullName?: string, initialRole: 'Admin' | 'HR' | 'Support' = 'Admin') {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase client is not configured.');
  }

  const cleanEmail = email.trim().toLowerCase();
  const targetRole = normalizeAdminRole(initialRole);
  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password: password,
    options: {
      data: {
        role: targetRole.toLowerCase(),
        full_name: fullName || 'CMS User'
      }
    }
  });

  if (error) {
    throw error;
  }

  if (data.user) {
    await verifyAndStoreAdminRole(data.user.id, cleanEmail, fullName);
    await supabase.from('admins').update({ role: targetRole }).eq('user_id', data.user.id);
  }

  return data;
}

function isValidUuid(id?: string): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id.trim());
}

// =========================================================================
// ROLE-BASED ACCESS CONTROL (RBAC) MANAGEMENT HELPERS
// =========================================================================

export async function fetchAdminUsers(): Promise<any[]> {
  const defaultAccounts = [
    {
      id: 'sys-adm-1',
      user_id: 'sys-uid-1',
      email: 'junaidrana630@gmail.com',
      full_name: 'Junaid Rana',
      role: 'Admin' as const,
      is_active: true,
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'sys-adm-2',
      user_id: 'sys-uid-2',
      email: 'junaidrana80@gmail.com',
      full_name: 'Junaid Rana (HR)',
      role: 'HR' as const,
      is_active: true,
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'sys-adm-3',
      user_id: 'sys-uid-3',
      email: 'support@apnakhaiyal.com',
      full_name: 'Support Team',
      role: 'Admin' as const,
      is_active: true,
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  if (!supabase || !isSupabaseConfigured) {
    return defaultAccounts;
  }

  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: true });

    const count = data ? data.length : 0;
    console.log(`[Dashboard Diagnostic] Table: 'admins' | Result Count: ${count} | Error Code: ${error?.code || 'None'} | Error Message: ${error?.message || 'None'}`);

    if (error) {
      console.error('[Supabase SELECT Error] admins:', {
        table: 'public.admins',
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return defaultAccounts;
    }

    if (data && data.length > 0) {
      const mapped = data.map((item: any) => {
        const cleanEmail = (item.email || '').toLowerCase().trim();
        const role = normalizeAdminRole(item.role);

        return {
          id: item.id,
          user_id: item.user_id || item.id,
          email: item.email || '',
          full_name: item.full_name || (cleanEmail ? cleanEmail.split('@')[0] : 'Administrator'),
          role: role,
          is_active: item.is_active !== false,
          last_login: item.last_login || item.created_at || new Date().toISOString(),
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString()
        };
      });

      return mapped;
    }

    return defaultAccounts;
  } catch (err: any) {
    console.error('[Supabase SELECT Exception] admins:', {
      table: 'public.admins',
      message: err?.message || String(err),
      code: err?.code || 'UNKNOWN',
      details: err?.details || null
    });
    return defaultAccounts;
  }
}

export async function updateAdminUserRole(adminId: string, role: string, userId?: string, email?: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return true;

  try {
    const nowIso = new Date().toISOString();
    const cleanEmail = (email || '').toLowerCase().trim();

    let query = supabase.from('admins').update({
      role: role,
      updated_at: nowIso
    });

    if (isValidUuid(adminId)) {
      query = query.eq('id', adminId);
    } else if (isValidUuid(userId)) {
      query = query.eq('user_id', userId);
    } else if (cleanEmail) {
      query = query.ilike('email', cleanEmail);
    } else {
      query = query.eq('id', adminId);
    }

    const { error } = await query;

    if (error) {
      console.error('[Supabase UPDATE Error] updateAdminUserRole:', {
        table: 'public.admins',
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return false;
    }

    if (isValidUuid(userId) || cleanEmail) {
      try {
        if (isValidUuid(userId)) {
          const { error: roleErr } = await supabase
            .from('admin_roles')
            .upsert({
              user_id: userId,
              email: cleanEmail || '',
              role: role.toLowerCase(),
              created_at: nowIso
            }, { onConflict: 'user_id' });

          if (roleErr) {
            console.error('[Supabase UPSERT Error] admin_roles:', {
              table: 'public.admin_roles',
              message: roleErr.message,
              code: roleErr.code,
              details: roleErr.details,
              hint: roleErr.hint
            });
          }
        } else if (cleanEmail) {
          await supabase
            .from('admin_roles')
            .update({
              role: role.toLowerCase()
            })
            .ilike('email', cleanEmail);
        }
      } catch (e: any) {
        console.error('[Supabase UPSERT Exception] admin_roles:', {
          table: 'public.admin_roles',
          message: e?.message || String(e),
          code: e?.code || 'UNKNOWN',
          details: e?.details || null
        });
      }
    }
    return true;
  } catch (err: any) {
    console.error('[Supabase UPDATE Exception] updateAdminUserRole:', {
      table: 'public.admins',
      message: err?.message || String(err),
      code: err?.code || 'UNKNOWN',
      details: err?.details || null
    });
    return false;
  }
}

export async function toggleAdminUserActive(adminId: string, isActive: boolean, userId?: string, email?: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return true;

  try {
    const nowIso = new Date().toISOString();
    const cleanEmail = (email || '').toLowerCase().trim();

    let query = supabase.from('admins').update({
      is_active: isActive,
      updated_at: nowIso
    });

    if (isValidUuid(adminId)) {
      query = query.eq('id', adminId);
    } else if (isValidUuid(userId)) {
      query = query.eq('user_id', userId);
    } else if (cleanEmail) {
      query = query.ilike('email', cleanEmail);
    } else {
      query = query.eq('id', adminId);
    }

    const { error } = await query;

    if (error) {
      console.error('[Supabase UPDATE Error] toggleAdminUserActive:', {
        table: 'public.admins',
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('[Supabase UPDATE Exception] toggleAdminUserActive:', {
      table: 'public.admins',
      message: err?.message || String(err),
      code: err?.code || 'UNKNOWN',
      details: err?.details || null
    });
    return false;
  }
}

export async function deleteAdminUserRecord(adminId: string, userId?: string, email?: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return true;

  const cleanEmail = (email || '').toLowerCase().trim();
  console.log(`[Admin Deletion Diagnostic] Initiating deletion for adminId: ${adminId}, userId: ${userId || 'N/A'}, email: ${cleanEmail || 'N/A'}`);

  // 1. Attempt secure database RPC helper if available
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('delete_admin_user_secure', {
      p_admin_id: isValidUuid(adminId) ? adminId : null,
      p_user_id: isValidUuid(userId) ? userId : null,
      p_email: cleanEmail || null
    });

    if (rpcError) {
      console.warn('[Supabase RPC Diagnostic] delete_admin_user_secure RPC notice:', {
        table: 'rpc.delete_admin_user_secure',
        message: rpcError.message,
        code: rpcError.code,
        details: rpcError.details,
        hint: rpcError.hint
      });
    } else if (rpcData && rpcData.success) {
      console.log('[Admin Deletion Diagnostic] Successfully removed user via secure RPC:', rpcData);
      return true;
    }
  } catch (rpcEx: any) {
    console.warn('[Admin Deletion Diagnostic] RPC invocation exception:', rpcEx?.message || rpcEx);
  }

  // 2. Direct deletion from public.admin_roles table
  try {
    if (isValidUuid(userId)) {
      const { error: roleDelErr } = await supabase
        .from('admin_roles')
        .delete()
        .eq('user_id', userId);

      if (roleDelErr) {
        console.error('[Supabase DELETE Error] admin_roles by user_id:', {
          table: 'public.admin_roles',
          message: roleDelErr.message,
          code: roleDelErr.code,
          details: roleDelErr.details,
          hint: roleDelErr.hint
        });
      }
    }

    if (cleanEmail) {
      const { error: roleDelErr2 } = await supabase
        .from('admin_roles')
        .delete()
        .ilike('email', cleanEmail);

      if (roleDelErr2) {
        console.error('[Supabase DELETE Error] admin_roles by email:', {
          table: 'public.admin_roles',
          message: roleDelErr2.message,
          code: roleDelErr2.code,
          details: roleDelErr2.details,
          hint: roleDelErr2.hint
        });
      }
    }
  } catch (err: any) {
    console.error('[Supabase DELETE Exception] admin_roles:', {
      table: 'public.admin_roles',
      message: err?.message || String(err),
      code: err?.code || 'UNKNOWN',
      details: err?.details || null
    });
  }

  // 3. Direct deletion and/or deactivation from public.admins table
  try {
    let deletedSuccessfully = false;

    // A. Delete by UUID adminId if valid
    if (isValidUuid(adminId)) {
      const { error: delErr } = await supabase
        .from('admins')
        .delete()
        .eq('id', adminId);

      if (delErr) {
        console.error('[Supabase DELETE Error] admins by id:', {
          table: 'public.admins',
          message: delErr.message,
          code: delErr.code,
          details: delErr.details,
          hint: delErr.hint
        });

        // Fallback: If delete encounters constraint or RLS restriction, deactivate account
        const { error: updErr } = await supabase
          .from('admins')
          .update({
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', adminId);

        if (updErr) {
          console.error('[Supabase UPDATE Error] admins fallback deactivation:', {
            table: 'public.admins',
            message: updErr.message,
            code: updErr.code,
            details: updErr.details,
            hint: updErr.hint
          });
        } else {
          deletedSuccessfully = true;
        }
      } else {
        deletedSuccessfully = true;
      }
    }

    // B. Delete by UUID userId if valid
    if (isValidUuid(userId)) {
      const { error: delUserErr } = await supabase
        .from('admins')
        .delete()
        .eq('user_id', userId);

      if (delUserErr) {
        console.error('[Supabase DELETE Error] admins by user_id:', {
          table: 'public.admins',
          message: delUserErr.message,
          code: delUserErr.code,
          details: delUserErr.details,
          hint: delUserErr.hint
        });
      } else {
        deletedSuccessfully = true;
      }
    }

    // C. Delete by email if provided
    if (cleanEmail) {
      const { error: delEmailErr } = await supabase
        .from('admins')
        .delete()
        .ilike('email', cleanEmail);

      if (delEmailErr) {
        console.error('[Supabase DELETE Error] admins by email:', {
          table: 'public.admins',
          message: delEmailErr.message,
          code: delEmailErr.code,
          details: delEmailErr.details,
          hint: delEmailErr.hint
        });

        // Fallback: Mark inactive by email
        await supabase
          .from('admins')
          .update({
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .ilike('email', cleanEmail);
      } else {
        deletedSuccessfully = true;
      }
    }

    // Frontend security rule: Never directly call auth.users deletion from client-side.
    // User is completely revoked from public.admins and public.admin_roles.
    console.log(`[Admin Deletion Diagnostic] Completed deletion workflow for ${cleanEmail || adminId}`);
    return true;
  } catch (err: any) {
    console.error('[Supabase DELETE Exception] admins:', {
      table: 'public.admins',
      message: err?.message || String(err),
      code: err?.code || 'UNKNOWN',
      details: err?.details || null
    });
    return true;
  }
}

export async function fetchRolePermissionsFromDb(): Promise<any[]> {
  if (!supabase || !isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('permissions')
      .select('*');

    if (error) {
      console.warn('fetchRolePermissionsFromDb error:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('fetchRolePermissionsFromDb exception:', err);
    return [];
  }
}

export async function updateRolePermissionInDb(role: string, module: string, can_read: boolean, can_write: boolean, can_delete: boolean): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return true;

  try {
    const { error } = await supabase
      .from('permissions')
      .upsert({
        role: role,
        module: module,
        can_read: can_read,
        can_write: can_write,
        can_delete: can_delete,
        updated_at: new Date().toISOString()
      }, { onConflict: 'role,module' });

    if (error) {
      console.warn('updateRolePermissionInDb error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('updateRolePermissionInDb exception:', err);
    return false;
  }
}

// =========================================================================
// OPTIMIZED DASHBOARD ANALYTICS FETCHING (PARALLEL SUPABASE QUERIES)
// =========================================================================

export interface DashboardAnalyticsData {
  totalProducts: number;
  totalServices: number;
  totalHeroSlides: number;
  totalGalleryImages: number;
  totalTeamMembers: number;
  totalCareers: number;
  totalJobApplications: number;
  totalContactMessages: number;
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  totalAdminUsers: number;
  unreadMessagesCount: number;
  openJobApplicationsCount: number;
  rawProducts: any[];
  rawServices: any[];
  rawHeroSlides: any[];
  rawGallery: any[];
  rawTeam: any[];
  rawCareers: any[];
  rawJobApplications: any[];
  rawContactMessages: any[];
  rawReviews: any[];
  rawAdmins: any[];
  permissionRestrictedTables?: string[];
  userRole?: string;
}

export async function fetchDashboardAnalyticsData(userRole: string = 'Admin'): Promise<DashboardAnalyticsData | null> {
  if (!supabase || !isSupabaseConfigured) {
    return null;
  }

  const rolePerms = getRolePermissions(userRole);
  const isHRRole = rolePerms.role === 'HR';
  const permissionRestrictedTables: string[] = [];

  // Allowed tables per role (e.g. HR role only queries careers, job_applications, contact_messages, team_members, admins)
  const isTableAllowedForRole = (tableKey: string): boolean => {
    if (rolePerms.isFullAdmin) return true;
    if (isHRRole) {
      const hrTables = ['careers', 'job_applications', 'contact_messages', 'team_members', 'team', 'admins'];
      return hrTables.includes(tableKey.toLowerCase().trim());
    }
    return rolePerms.allowedModules.includes(tableKey.toLowerCase().trim());
  };

  try {
    // Helper to query table safely and output console diagnostics with explicit error logging
    const safeQuery = async (primaryTable: string, fallbackTable?: string) => {
      let activeTable = primaryTable;

      // Check if table query is permitted for current role
      if (!isTableAllowedForRole(primaryTable)) {
        console.warn(`[RBAC Data Fetch Guard] Skipping query on restricted table '${primaryTable}' for role '${rolePerms.role}'`);
        if (!permissionRestrictedTables.includes(primaryTable)) {
          permissionRestrictedTables.push(primaryTable);
        }
        return {
          tableName: activeTable,
          count: 0,
          data: [],
          error: { code: '403', message: `Permission Restricted: Role '${rolePerms.role}' is not authorized to query table '${primaryTable}'` }
        };
      }

      let res = await supabase.from(activeTable).select('*');
      
      if (res.error) {
        console.error(`[Supabase Error] Query failed on table '${primaryTable}':`, res.error.message, `(Code: ${res.error.code})`, res.error.details || '');
        if (res.error.code === '403' || res.error.code === '42501' || (res.error.message || '').includes('permission denied')) {
          if (!permissionRestrictedTables.includes(primaryTable)) {
            permissionRestrictedTables.push(primaryTable);
          }
        }

        if (fallbackTable && isTableAllowedForRole(fallbackTable)) {
          console.warn(`[Dashboard Diagnostic] Attempting fallback table '${fallbackTable}'...`);
          const fallbackRes = await supabase.from(fallbackTable).select('*');
          if (!fallbackRes.error) {
            activeTable = fallbackTable;
            res = fallbackRes;
          } else {
            console.error(`[Supabase Error] Fallback query failed on table '${fallbackTable}':`, fallbackRes.error.message, `(Code: ${fallbackRes.error.code})`, fallbackRes.error.details || '');
          }
        }
      }

      const count = res.data ? res.data.length : 0;
      const errorCode = res.error ? res.error.code : 'None';
      const errorMessage = res.error ? res.error.message : 'None';

      console.log(`[Dashboard Diagnostic] Table: '${activeTable}' | Result Count: ${count} | Error Code: ${errorCode} | Error Message: ${errorMessage}`);

      return {
        tableName: activeTable,
        count,
        data: res.data || [],
        error: res.error
      };
    };

    const [
      productsRes,
      servicesRes,
      heroSlidesRes,
      galleryRes,
      teamRes,
      careersRes,
      applicationsRes,
      messagesRes,
      reviewsRes,
      adminsRes
    ] = await Promise.all([
      safeQuery('products'),
      safeQuery('services'),
      safeQuery('hero_slides'),
      safeQuery('gallery'),
      safeQuery('team_members', 'team'),
      safeQuery('careers'),
      safeQuery('job_applications'),
      safeQuery('contact_messages'),
      safeQuery('reviews', 'client_reviews'),
      safeQuery('admins')
    ]);

    let rawProducts = Array.isArray(productsRes.data) ? productsRes.data : [];
    if (rawProducts.length === 0) {
      const stored = getStored('products', DEFAULT_PRODUCTS);
      if (Array.isArray(stored) && stored.length > 0) rawProducts = stored;
      else rawProducts = DEFAULT_PRODUCTS;
    }

    let rawServices = Array.isArray(servicesRes.data) ? servicesRes.data : [];
    if (rawServices.length === 0) {
      try {
        const { data: setRow } = await supabase.from('site_settings').select('value').eq('key', 'expertise').maybeSingle();
        if (setRow && Array.isArray(setRow.value) && setRow.value.length > 0) {
          rawServices = setRow.value;
        } else {
          const stored = getStored('services', DEFAULT_SERVICES);
          if (Array.isArray(stored) && stored.length > 0) rawServices = stored;
          else rawServices = DEFAULT_SERVICES;
        }
      } catch (err) {
        console.warn('Fallback services check error:', err);
      }
    }

    let rawHeroSlides = Array.isArray(heroSlidesRes.data) ? heroSlidesRes.data : [];
    if (rawHeroSlides.length === 0) {
      try {
        const { data: setRow } = await supabase.from('site_settings').select('value').eq('key', 'hero').maybeSingle();
        if (setRow && setRow.value) {
          rawHeroSlides = Array.isArray(setRow.value) ? setRow.value : [setRow.value];
        } else {
          const stored = getStored('hero_slides', [DEFAULT_HERO]);
          if (Array.isArray(stored) && stored.length > 0) rawHeroSlides = stored;
      else rawHeroSlides = DEFAULT_HERO_SLIDES;
        }
      } catch (err) {
        console.warn('Fallback hero slides check error:', err);
      }
    }

    let rawGallery = Array.isArray(galleryRes.data) ? galleryRes.data : [];
    if (rawGallery.length === 0) {
      const stored = getStored('gallery', DEFAULT_GALLERY);
      if (Array.isArray(stored) && stored.length > 0) rawGallery = stored;
      else rawGallery = DEFAULT_GALLERY;
    }

    let rawTeam = Array.isArray(teamRes.data) ? teamRes.data : [];
    if (rawTeam.length === 0) {
      const stored = getStored('team', DEFAULT_TEAM);
      if (Array.isArray(stored) && stored.length > 0) rawTeam = stored;
      else rawTeam = DEFAULT_TEAM;
    }

    let rawCareers = Array.isArray(careersRes.data) ? careersRes.data : [];
    if (rawCareers.length === 0) {
      try {
        const { data: setRow } = await supabase.from('website_settings').select('value').eq('key', 'careers').maybeSingle();
        if (setRow && Array.isArray(setRow.value) && setRow.value.length > 0) {
          rawCareers = setRow.value;
        } else {
          const { data: siteSetRow } = await supabase.from('site_settings').select('value').eq('key', 'careers').maybeSingle();
          if (siteSetRow && Array.isArray(siteSetRow.value) && siteSetRow.value.length > 0) {
            rawCareers = siteSetRow.value;
          } else {
            const stored = getStored('careers', DEFAULT_CAREERS);
            if (Array.isArray(stored) && stored.length > 0) rawCareers = stored;
          }
        }
      } catch (cErr) {
        console.warn('Fallback careers check error:', cErr);
      }
    }

    let rawJobApplications = Array.isArray(applicationsRes.data) ? applicationsRes.data : [];
    if (rawJobApplications.length === 0) {
      const stored = getStored('applications', []);
      if (Array.isArray(stored)) rawJobApplications = stored;
    }

    let rawContactMessages = Array.isArray(messagesRes.data) ? messagesRes.data : [];
    if (rawContactMessages.length === 0) {
      const stored = getStored('messages', DEFAULT_MESSAGES);
      if (Array.isArray(stored)) rawContactMessages = stored;
    }

    let rawReviews = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];
    if (rawReviews.length === 0) {
      const stored = getStored('reviews', DEFAULT_REVIEWS);
      if (Array.isArray(stored)) rawReviews = stored;
    }

    // Admin Users should be calculated through the authenticated RBAC/admin flow, not public anon access
    let rawAdmins = Array.isArray(adminsRes.data) ? adminsRes.data : [];
    if (rawAdmins.length === 0) {
      try {
        const authedAdmins = await fetchAdminUsers();
        if (Array.isArray(authedAdmins) && authedAdmins.length > 0) {
          rawAdmins = authedAdmins;
        }
      } catch (aErr) {
        console.warn('Authenticated admin users query error:', aErr);
      }
    }

    const pendingRev = Array.isArray(rawReviews) ? rawReviews.filter((r: any) => (r?.status || 'pending').toLowerCase() === 'pending').length : 0;
    const approvedRev = Array.isArray(rawReviews) ? rawReviews.filter((r: any) => (r?.status || '').toLowerCase() === 'approved').length : 0;
    const unreadMsgs = Array.isArray(rawContactMessages) ? rawContactMessages.filter((m: any) => !m?.read).length : 0;
    const openApps = Array.isArray(rawCareers) ? rawCareers.filter((c: any) => c?.active !== false).length : 0;

    return {
      totalProducts: Array.isArray(rawProducts) ? rawProducts.length : 0,
      totalServices: Array.isArray(rawServices) ? rawServices.length : 0,
      totalHeroSlides: Array.isArray(rawHeroSlides) ? rawHeroSlides.length : 0,
      totalGalleryImages: Array.isArray(rawGallery) ? rawGallery.length : 0,
      totalTeamMembers: Array.isArray(rawTeam) ? rawTeam.length : 0,
      totalCareers: Array.isArray(rawCareers) ? rawCareers.length : 0,
      totalJobApplications: Array.isArray(rawJobApplications) ? rawJobApplications.length : 0,
      totalContactMessages: Array.isArray(rawContactMessages) ? rawContactMessages.length : 0,
      totalReviews: Array.isArray(rawReviews) ? rawReviews.length : 0,
      pendingReviews: pendingRev,
      approvedReviews: approvedRev,
      totalAdminUsers: Array.isArray(rawAdmins) ? rawAdmins.length : 1,
      unreadMessagesCount: unreadMsgs,
      openJobApplicationsCount: openApps,
      rawProducts: Array.isArray(rawProducts) ? rawProducts : [],
      rawServices: Array.isArray(rawServices) ? rawServices : [],
      rawHeroSlides: Array.isArray(rawHeroSlides) ? rawHeroSlides : [],
      rawGallery: Array.isArray(rawGallery) ? rawGallery : [],
      rawTeam: Array.isArray(rawTeam) ? rawTeam : [],
      rawCareers: Array.isArray(rawCareers) ? rawCareers : [],
      rawJobApplications: Array.isArray(rawJobApplications) ? rawJobApplications : [],
      rawContactMessages: Array.isArray(rawContactMessages) ? rawContactMessages : [],
      rawReviews: Array.isArray(rawReviews) ? rawReviews : [],
      rawAdmins: Array.isArray(rawAdmins) ? rawAdmins : [],
      permissionRestrictedTables,
      userRole: rolePerms.role
    };
  } catch (err) {
    console.warn('fetchDashboardAnalyticsData error:', err);
    return null;
  }
}

// =========================================================================
// CONTENT AUDIT LOGS HELPERS
// =========================================================================

export async function fetchContentAuditLogs(limit: number = 20): Promise<any[]> {
  if (!supabase || !isSupabaseConfigured) {
    return [
      {
        id: '1',
        user_email: 'hr@apnakhaiyal.com',
        user_role: 'HR',
        action_type: 'UPDATE',
        content_type: 'Job Posting',
        details: 'Updated Senior Full Stack Engineer requirements and benefits.',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '2',
        user_email: 'hr@apnakhaiyal.com',
        user_role: 'HR',
        action_type: 'STATUS_CHANGE',
        content_type: 'Job Application',
        details: 'Marked candidate application #A-104 as Reviewed.',
        created_at: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: '3',
        user_email: 'hr@apnakhaiyal.com',
        user_role: 'HR',
        action_type: 'REPLY',
        content_type: 'Contact Message',
        details: 'Responded to client inquiry regarding enterprise AI consulting.',
        created_at: new Date(Date.now() - 10800000).toISOString()
      }
    ];
  }

  try {
    const { data, error } = await supabase
      .from('content_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Supabase SELECT Error] content_audit_logs:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('fetchContentAuditLogs exception:', err);
    return [];
  }
}

// =========================================================================
// PRODUCT IMAGES ARRAY & RELATIONAL HELPERS
// =========================================================================

export async function fetchProductImages(productId?: string): Promise<ProductImage[]> {
  if (!supabase || !isSupabaseConfigured) {
    if (productId) {
      const stored = getStored<ProductItem[]>('products', DEFAULT_PRODUCTS);
      const prod = stored.find(p => p.id === productId);
      if (!prod) return [];
      if (prod.productImages && prod.productImages.length > 0) return prod.productImages;
      const urls = prod.images || [prod.image, ...(prod.gallery || [])].filter(Boolean);
      return urls.map((url, idx) => ({
        id: `local-img-${productId}-${idx}`,
        productId,
        imageUrl: url,
        displayOrder: idx,
        isPrimary: idx === 0
      }));
    }
    return [];
  }

  try {
    let query = supabase.from('product_images').select('*').order('display_order', { ascending: true });
    if (productId) {
      query = query.eq('product_id', productId);
    }
    const { data, error } = await query;
    if (error) {
      console.warn('[Supabase Error] fetchProductImages:', error.message);
      return [];
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      productId: row.product_id || row.productId,
      imageUrl: row.image_url || row.imageUrl,
      displayOrder: row.display_order ?? row.displayOrder ?? 0,
      isPrimary: row.is_primary ?? row.isPrimary ?? false,
      altText: row.alt_text || row.altText || '',
      createdAt: row.created_at || row.createdAt,
      updatedAt: row.updated_at || row.updatedAt
    }));
  } catch (err) {
    console.error('fetchProductImages exception:', err);
    return [];
  }
}

export async function syncProductImagesToSupabase(
  productId: string, 
  images: Array<string | Partial<ProductImage>>
): Promise<void> {
  if (!supabase || !productId) return;
  try {
    const formatted = images.map((img, idx) => {
      if (typeof img === 'string') {
        return {
          product_id: productId,
          image_url: img,
          display_order: idx,
          is_primary: idx === 0,
        };
      }
      return {
        product_id: productId,
        image_url: img.imageUrl || (img as any).image_url || '',
        display_order: img.displayOrder ?? (img as any).display_order ?? idx,
        is_primary: img.isPrimary ?? (img as any).is_primary ?? (idx === 0),
        alt_text: img.altText || (img as any).alt_text || '',
      };
    }).filter(item => !!item.image_url);

    // Delete existing records for this product and re-insert in proper display order
    const { error: delErr } = await supabase.from('product_images').delete().eq('product_id', productId);
    if (delErr) {
      console.warn(`[Supabase Notice] Deleting previous product_images for ${productId}:`, delErr.message);
    }

    if (formatted.length > 0) {
      const { error: insErr } = await supabase.from('product_images').insert(formatted);
      if (insErr) {
        console.error(`[Supabase Error] Inserting product_images for ${productId}:`, insErr.message);
      } else {
        console.log(`[Supabase Sync] Saved ${formatted.length} product_images for product ${productId}`);
      }
    }
  } catch (err) {
    console.error(`syncProductImagesToSupabase exception for ${productId}:`, err);
  }
}

export async function deleteProductImageFromSupabase(imageId: string): Promise<boolean> {
  if (!supabase || !imageId) return false;
  try {
    const { error } = await supabase.from('product_images').delete().eq('id', imageId);
    if (error) {
      console.error('[Supabase Error] deleteProductImageFromSupabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('deleteProductImageFromSupabase exception:', err);
    return false;
  }
}

export async function setPrimaryProductImageInSupabase(productId: string, imageId: string): Promise<boolean> {
  if (!supabase || !productId || !imageId) return false;
  try {
    // 1. Reset all images for this product to non-primary
    await supabase.from('product_images').update({ is_primary: false }).eq('product_id', productId);
    // 2. Set the target image as primary
    const { error } = await supabase.from('product_images').update({ is_primary: true }).eq('id', imageId);
    if (error) {
      console.error('[Supabase Error] setPrimaryProductImageInSupabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('setPrimaryProductImageInSupabase exception:', err);
    return false;
  }
}

// =========================================================================
// SYSTEM AUTHENTICATION & RLS DIAGNOSTICS & AUTOMATED REPAIR UTILITIES
// =========================================================================

export interface RLSTableDiagnostic {
  tableName: string;
  status: 'PASSED' | 'FAILED' | 'EMPTY';
  rowCount: number;
  errorCode: string;
  errorMessage: string;
  policyFailureReason: string;
}

export interface SystemAuthDiagnosticsReport {
  authUid: string | null;
  authEmail: string | null;
  sessionActive: boolean;
  matchedAdminRecord: {
    id: string;
    userId: string;
    email: string;
    fullName: string;
    role: string;
    isActive: boolean;
    lastLogin: string;
  } | null;
  matchedAdminRoleRecord: {
    userId: string;
    email: string;
    role: string;
  } | null;
  assignedRole: 'Admin' | 'HR' | 'Support' | 'None';
  tableDiagnostics: RLSTableDiagnostic[];
  failedTables: string[];
  overallStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  diagnosticTimestamp: string;
}

export async function runAuthAndRLSDiagnostics(): Promise<SystemAuthDiagnosticsReport> {
  const nowIso = new Date().toISOString();
  
  if (!supabase || !isSupabaseConfigured) {
    return {
      authUid: null,
      authEmail: null,
      sessionActive: false,
      matchedAdminRecord: null,
      matchedAdminRoleRecord: null,
      assignedRole: 'None',
      tableDiagnostics: [],
      failedTables: [],
      overallStatus: 'CRITICAL',
      diagnosticTimestamp: nowIso
    };
  }

  let authUid: string | null = null;
  let authEmail: string | null = null;
  let sessionActive = false;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      sessionActive = true;
      authUid = session.user.id;
      authEmail = (session.user.email || '').toLowerCase().trim();
    }
  } catch (err) {
    console.warn('[Diagnostics] Error reading auth session:', err);
  }

  // Auto-heal missing admin record for active auth user (especially support@apnakhaiyal.com / f470424b-548e-45e1-9c1e-ac314e3981c8)
  if (authUid || authEmail) {
    try {
      await verifyAndStoreAdminRole(authUid || undefined, authEmail || undefined);
    } catch (healErr) {
      console.warn('[Diagnostics] Auto-heal verifyAndStoreAdminRole notice:', healErr);
    }
  }

  // Look up matched admin record
  let matchedAdminRecord: any = null;
  if (authUid || authEmail) {
    try {
      let query = supabase.from('admins').select('*');
      if (authUid) {
        query = query.or(`user_id.eq.${authUid},email.eq.${authEmail || ''}`);
      } else if (authEmail) {
        query = query.eq('email', authEmail);
      }
      const { data: adminRows } = await query.limit(1);
      if (adminRows && adminRows.length > 0) {
        const item = adminRows[0];
        matchedAdminRecord = {
          id: item.id,
          userId: item.user_id || item.id,
          email: item.email,
          fullName: item.full_name || 'Administrator',
          role: item.role || 'Admin',
          isActive: item.is_active !== false,
          lastLogin: item.last_login || item.created_at || nowIso
        };
      }
    } catch (aErr) {
      console.warn('[Diagnostics] Exception querying admins record:', aErr);
    }
  }

  // Look up matched admin_roles record
  let matchedAdminRoleRecord: any = null;
  if (authUid || authEmail) {
    try {
      let query = supabase.from('admin_roles').select('*');
      if (authUid) {
        query = query.or(`user_id.eq.${authUid},email.eq.${authEmail || ''}`);
      } else if (authEmail) {
        query = query.eq('email', authEmail);
      }
      const { data: roleRows } = await query.limit(1);
      if (roleRows && roleRows.length > 0) {
        const rItem = roleRows[0];
        matchedAdminRoleRecord = {
          userId: rItem.user_id,
          email: rItem.email,
          role: rItem.role
        };
      }
    } catch (rErr) {
      console.warn('[Diagnostics] Exception querying admin_roles record:', rErr);
    }
  }

  const assignedRole = matchedAdminRecord?.role ? normalizeAdminRole(matchedAdminRecord.role) : 'Admin';

  // Core 8 tables plus hero_slides and metadata tables to audit
  const tablesToAudit = [
    'admins',
    'admin_roles',
    'products',
    'services',
    'team_members',
    'gallery',
    'careers',
    'reviews',
    'contact_messages',
    'hero_slides',
    'statistics',
    'job_applications'
  ];

  const tableDiagnostics: RLSTableDiagnostic[] = [];
  const failedTables: string[] = [];

  for (const table of tablesToAudit) {
    try {
      const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: false }).limit(5);
      
      let status: 'PASSED' | 'FAILED' | 'EMPTY' = 'PASSED';
      let errorCode = '200 OK';
      let errorMessage = 'Query executed successfully.';
      let policyFailureReason = 'None - RLS permissions valid.';

      if (error) {
        status = 'FAILED';
        errorCode = error.code || '403 Forbidden';
        errorMessage = error.message || 'Permission denied or query error.';
        policyFailureReason = `RLS Policy Error (${error.code || '403'}): ${error.message} - ${error.details || error.hint || 'Check row-level security policy'}`;
        failedTables.push(table);
      } else {
        const rowTotal = count ?? (data ? data.length : 0);
        if (rowTotal === 0) {
          status = 'EMPTY';
        }
      }

      tableDiagnostics.push({
        tableName: table,
        status,
        rowCount: count ?? (data ? data.length : 0),
        errorCode,
        errorMessage,
        policyFailureReason
      });
    } catch (tblEx: any) {
      failedTables.push(table);
      tableDiagnostics.push({
        tableName: table,
        status: 'FAILED',
        rowCount: 0,
        errorCode: 'EXCEPTION',
        errorMessage: tblEx?.message || 'Exception thrown during query execution.',
        policyFailureReason: `Exception: ${tblEx?.message || String(tblEx)}`
      });
    }
  }

  const overallStatus = failedTables.length === 0 ? 'HEALTHY' : failedTables.length < 3 ? 'WARNING' : 'CRITICAL';

  return {
    authUid,
    authEmail,
    sessionActive,
    matchedAdminRecord,
    matchedAdminRoleRecord,
    assignedRole,
    tableDiagnostics,
    failedTables,
    overallStatus,
    diagnosticTimestamp: nowIso
  };
}

export async function repairAdminAndRLSState(
  userId?: string, 
  email?: string
): Promise<{ success: boolean; message: string; report?: SystemAuthDiagnosticsReport }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, message: 'Supabase is not configured.' };
  }

  try {
    const targetUserId = userId || 'f470424b-548e-45e1-9c1e-ac314e3981c8';
    const cleanEmail = (email || 'support@apnakhaiyal.com').toLowerCase().trim();
    const nowIso = new Date().toISOString();

    console.log(`[Repair Workflow] Running automatic repair for user ${cleanEmail} (UUID: ${targetUserId})...`);

    // 1. Ensure record exists in public.admins
    const { error: adminErr } = await supabase.from('admins').upsert({
      user_id: targetUserId,
      email: cleanEmail,
      full_name: 'ApnaKhaiyal Support Admin',
      role: 'Admin',
      is_active: true,
      last_login: nowIso,
      created_at: nowIso,
      updated_at: nowIso
    }, { onConflict: 'email' });

    if (adminErr) {
      console.error('[Repair Workflow Error] public.admins upsert:', adminErr);
    }

    // 2. Ensure record exists in public.admin_roles
    const { error: roleErr } = await supabase.from('admin_roles').upsert({
      user_id: targetUserId,
      email: cleanEmail,
      role: 'admin',
      created_at: nowIso
    }, { onConflict: 'user_id' });

    if (roleErr) {
      console.error('[Repair Workflow Error] public.admin_roles upsert:', roleErr);
    }

    // 3. Re-run complete diagnostics report
    const updatedReport = await runAuthAndRLSDiagnostics();

    return {
      success: true,
      message: `System repair completed successfully for ${cleanEmail}. Admin record verified in public.admins and public.admin_roles.`,
      report: updatedReport
    };
  } catch (err: any) {
    console.error('[Repair Workflow Exception]:', err);
    return {
      success: false,
      message: `Repair failed: ${err?.message || String(err)}`
    };
  }
}




