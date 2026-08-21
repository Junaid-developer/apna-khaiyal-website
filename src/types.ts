export interface HeroData {
  heading: string;
  subHeading: string;
  imageUrl?: string;
  primaryBtnText?: string;
  primaryBtnLink?: string;
  secondaryBtnText?: string;
  secondaryBtnLink?: string;
}

export interface AboutData {
  companyStory: string;
  mission: string;
  vision: string;
  experience: string;
  achievements: string[];
  imageUrl?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  icon: string; // Lucide icon name or emoji
  description: string;
  displayOrder: number;
  image?: string;
  category?: string;
}

export interface ProductImage {
  id?: string;
  productId: string;
  imageUrl: string;
  displayOrder: number;
  isPrimary: boolean;
  altText?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  logoText: string;
  description: string;
  features: string[];
  gallery: string[];
  images?: string[];
  productImages?: ProductImage[];
  category: string;
  status: 'Active' | 'In Progress' | 'Coming Soon' | 'Under Maintenance' | 'Discontinued' | 'Hidden';
  featured: boolean;
  displayOrder: number;
  image: string;
  logoUrl?: string;
}

export interface DynamicSocialLink {
  id: string;
  platform: 'LinkedIn' | 'WhatsApp' | 'GitHub' | 'Facebook' | 'Instagram' | 'X (Twitter)' | 'YouTube' | 'Email' | 'Website' | 'Behance' | 'Dribbble' | string;
  url: string;
  enabled: boolean;
  openInNewTab?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  designation: string;
  gender: 'Male' | 'Female';
  experience: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    whatsapp?: string;
    [key: string]: string | undefined;
  };
  dynamicSocialLinks?: DynamicSocialLink[];
  displayOrder: number;
  photoUrl: string;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  category: 'Meetings' | 'Office' | 'Projects' | 'Events' | 'Team';
  caption: string;
}

export interface ClientReview {
  id: string;
  name: string;
  designation: string;
  company: string;
  country?: string;
  email?: string;
  rating: number;
  review: string;
  photoUrl: string;
  companyLogoUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CareerOpportunity {
  id: string;
  title: string;
  type: 'job' | 'internship';
  department: string;
  location: string;
  description: string;
  requirements: string[];
  benefits: string[];
  active: boolean;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  coverLetter: string;
  appliedAt: string;
  status?: string;
}

export interface ContactReply {
  id: string;
  subject: string;
  message: string;
  sentAt: string;
  status: 'Sent' | 'Draft';
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  repliedStatus: 'Pending' | 'Replied' | 'Ignored';
  createdAt: string;
  replies?: ContactReply[];
}

export interface ProcessItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  displayOrder: number;
  active: boolean;
}

export interface IndustryItem {
  id: string;
  title: string;
  displayOrder: number;
  active: boolean;
}

export interface TechStackItem {
  id: string;
  title: string;
  description: string;
  iconType?: 'lucide' | 'image';
  iconName?: string;
  imageUrl?: string;
  displayOrder: number;
  active: boolean;
}

export interface CompanyInformation {
  id?: string;
  companyName: string;
  email: string;
  phone: string;
  ceoWhatsApp?: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CompanyContact = CompanyInformation;

export interface SystemSettings {
  companyName: string;
  logoText: string;
  phone: string;
  email: string;
  address: string;
  googleMapsEmbedUrl: string;
  whatsappNumber: string;
  ceoWhatsAppNumber?: string;
  companyLogo?: string;
  copyright?: string;
  adminName?: string;
  adminAvatarUrl?: string;
  servicesSectionHeading?: string;
  servicesSectionSubtitle?: string;
  productShowcaseSectionHeading?: string;
  processSectionSmallHeading?: string;
  processSectionMainHeading?: string;
  processSectionSubtitle?: string;
  industriesSectionHeading?: string;
  industriesSectionSubtitle?: string;
  techStackSectionHeading?: string;
  techStackSectionSubtitle?: string;
  galleryDescription?: string;
  teamDescription?: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
    youtube?: string;
  };
}

export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  twitterCard: string;
}

export interface ExpertiseItem {
  id: string;
  name: string;
  displayOrder: number;
}

export interface CorporateOfficeSettings {
  address: string;
  phone: string;
  email: string;
  googleMapLink?: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type AdminRole = 'Admin' | 'HR' | 'Support';

export interface AdminUser {
  id: string;
  user_id?: string;
  email: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PermissionDefinition {
  id: string;
  role: AdminRole;
  module: string;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
}
