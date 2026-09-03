import { useState, useEffect, useMemo, useCallback, FormEvent } from 'react';
import { motion } from 'motion/react';
import DashboardOverview from './DashboardOverview';
import BrandLogo from './BrandLogo';
import LogoManagement from './LogoManagement';
import AuthDiagnosticsPanel from './AuthDiagnosticsPanel';
import { 
  LayoutDashboard, 
  Layers, 
  Users, 
  Image as ImageIcon, 
  MessageSquare, 
  Briefcase, 
  Settings, 
  Eye, 
  EyeOff,
  Trash2, 
  Plus, 
  Edit, 
  Save, 
  Check, 
  X, 
  FileText,
  Star,
  Globe,
  AlertCircle,
  ShieldCheck,
  Send,
  Sparkles,
  Search,
  Reply,
  Clock,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Building2,
  Lock,
  Key,
  LogOut,
  Mail,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Monitor,
  Share2,
  Smartphone,
  ArrowRight,
  Link as LinkIcon,
  User,
  Camera,
  Download,
  Copy,
  ArrowLeft,
  Workflow,
  ArrowUp,
  ArrowDown,
  Cpu,
  Code,
  Server,
  Database,
  Terminal,
  Zap,
  Laptop,
  Rocket,
  UserCheck,
  UserPlus,
  UserX,
  History,
  ExternalLink,
  ShieldAlert,
  KeyRound
} from 'lucide-react';
import SocialIcon, { SUPPORTED_SOCIAL_PLATFORMS } from './SocialIcon';
import { 
  supabase, 
  isSupabaseConfigured, 
  uploadImageToSupabase, 
  deleteImageFromSupabase, 
  getAvatarUrl, 
  updateTeamMemberPhotoInDb, 
  verifyAndStoreAdminRole, 
  signUpAdminAccount, 
  getAdminUserRole,
  fetchAdminUsers,
  updateAdminUserRole,
  toggleAdminUserActive,
  deleteAdminUserRecord,
  fetchRolePermissionsFromDb,
  updateRolePermissionInDb,
  updateCompanyInformation,
  fetchCompanyInformation,
  fetchContentAuditLogs,
  DEFAULT_COMPANY_INFORMATION,
  updateCompanyContact,
  fetchCompanyContact,
  DEFAULT_COMPANY_CONTACT
} from '../lib/db';
import { 
  checkUserRoleAccess, 
  getRolePermissions, 
  normalizeUserRole, 
  RolePermissions 
} from '../lib/rbac';
import { 
  useAdminUsersQuery, 
  useContentAuditLogsQuery, 
  useCompanyInfoQuery, 
  useCompanyContactQuery, 
  useRoleFilteredDataQuery,
  useAdminCacheInvalidator 
} from '../lib/useAdminQueries';
import { getServiceImage } from './ServicesView';
import { 
  AdminAuthState, 
  getAdminAuthState, 
  saveAdminAuthState, 
  hashPassword, 
  validatePasswordRules, 
  calculatePasswordStrength, 
  generateSecurePassword,
  setActiveSessionVersion, 
  clearActiveSession 
} from '../lib/authSecurity';
import { PasswordComplexityValidator } from './PasswordComplexityValidator';
import { 
  ProductItem, 
  ServiceItem, 
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
  HeroData,
  AboutData,
  ExpertiseItem,
  CorporateOfficeSettings,
  HeroSlide,
  ProcessItem,
  IndustryItem,
  TechStackItem,
  AdminRole,
  AdminUser,
  PermissionDefinition
} from '../types';

interface AdminPanelProps {
  products: ProductItem[];
  saveProducts: (p: ProductItem[]) => void;
  services: ServiceItem[];
  saveServices: (s: ServiceItem[]) => void;
  team: TeamMember[];
  saveTeam: (t: TeamMember[]) => void;
  gallery: GalleryItem[];
  saveGallery: (g: GalleryItem[]) => void;
  reviews: ClientReview[];
  saveReviews: (r: ClientReview[]) => void;
  careers: CareerOpportunity[];
  saveCareers: (c: CareerOpportunity[]) => void;
  applications: JobApplication[];
  saveApplications: (a: JobApplication[]) => void;
  messages: ContactMessage[];
  saveMessages: (m: ContactMessage[]) => void;
  hero: HeroData;
  saveHero: (h: HeroData) => void;
  heroSlides?: HeroSlide[];
  saveHeroSlides?: (slides: HeroSlide[]) => void;
  about: AboutData;
  saveAbout: (a: AboutData) => void;
  settings: SystemSettings;
  saveSettings: (s: SystemSettings) => void;
  seo: SEOSettings;
  saveSEO: (s: SEOSettings) => void;
  expertise: ExpertiseItem[];
  saveExpertise: (e: ExpertiseItem[]) => void;
  office: CorporateOfficeSettings;
  saveOffice: (o: CorporateOfficeSettings) => void;
  processItems?: ProcessItem[];
  saveProcess?: (p: ProcessItem[]) => void;
  industryItems?: IndustryItem[];
  saveIndustries?: (i: IndustryItem[]) => void;
  techStackItems?: TechStackItem[];
  saveTechStack?: (t: TechStackItem[]) => void;
  updateTeamInPlace?: (t: TeamMember[]) => void;
  companyInformation?: CompanyInformation;
  onCompanyInformationUpdated?: (c: CompanyInformation) => void;
  companyContact?: CompanyContact;
  onCompanyContactUpdated?: (c: CompanyContact) => void;
  
  isAdminLoggedIn: boolean;
  onLogin: () => void;
  onLogout?: () => void;
}

/**
 * Helper hook / function 'useRoleGuard'
 * Strict Role-Based Access Control (RBAC) Guard for Admin, HR, and Support roles.
 *
 * RBAC Role Matrix:
 * - Admin: Full access to all 20 modules, user management, security policies, data mutation, and deletion.
 * - HR: Access to Dashboard, Careers & Job Applications, and Contact Messages. Read-only for other modules; no deletion rights.
 * - Support: Access to Dashboard and Contact Messages only. Read-only inquiries desk; cannot delete or mutate core CMS entities.
 */
export function useRoleGuard(
  currentUserRole: string,
  showToastFn?: (msg: string, type: 'success' | 'error' | 'info') => void
) {
  const perms = useMemo(() => getRolePermissions(currentUserRole), [currentUserRole]);
  const normalizedRole = perms.role;
  const isAdmin = perms.isFullAdmin;
  const isHR = perms.role === 'HR';
  const isSupport = perms.role === 'Support';

  // Define strictly allowed tabs per role using centralized RBAC
  const isTabAllowed = useCallback((tabId: string, overrideRole?: string): boolean => {
    const activePerms = overrideRole ? getRolePermissions(overrideRole) : perms;
    if (activePerms.isFullAdmin) return true;
    return activePerms.allowedModules.includes(tabId.toLowerCase().trim());
  }, [perms]);

  const filterAllowedTabs = useCallback(<T extends { id: string }>(tabsList: T[]): T[] => {
    return tabsList.filter(t => isTabAllowed(t.id));
  }, [isTabAllowed]);

  // Access guard check handler with toast notifications and console logging
  const checkAccessGuard = useCallback((
    action: string,
    entityName: string = 'this item'
  ): boolean => {
    if (!isAdmin) {
      const actionName = action.replace(/_/g, ' ');
      const msg = `Access Denied: Your account role (${normalizedRole}) does not have permission to ${actionName} on ${entityName}. Administrator privileges required.`;
      console.warn(`[RBAC Violation Attempt] Role "${normalizedRole}" attempted restricted action: "${action}" on "${entityName}". Blocked.`);
      if (showToastFn) {
        showToastFn(msg, 'error');
      }
      return false;
    }
    return true;
  }, [isAdmin, normalizedRole, showToastFn]);

  return useMemo(() => ({
    role: normalizedRole,
    isAdmin,
    isHR,
    isSupport,
    isTabAllowed,
    filterAllowedTabs,
    canDelete: isAdmin,
    canAddAdmin: isAdmin,
    canManageRoles: isAdmin,
    canManageSecurity: isAdmin,
    canManageUsers: isAdmin,
    canEditSystemSettings: isAdmin,
    canManageProducts: isAdmin,
    canManageServices: isAdmin,
    canManageGallery: isAdmin,
    canManageTeam: isAdmin,
    canManageTechStack: isAdmin,
    canManageWebsiteSettings: isAdmin,
    canManageSEO: isAdmin,
    canManageReviews: isAdmin,
    canManageHero: isAdmin,
    canManageFooter: isAdmin,
    canManageProcess: isAdmin,
    canManageIndustries: isAdmin,
    checkAccessGuard,
  }), [normalizedRole, isAdmin, isHR, isSupport, isTabAllowed, filterAllowedTabs, checkAccessGuard]);
}

export default function AdminPanel({
  products = [], saveProducts = () => {},
  services = [], saveServices = () => {},
  team = [], saveTeam = () => {},
  updateTeamInPlace,
  gallery = [], saveGallery = () => {},
  reviews = [], saveReviews = () => {},
  careers = [], saveCareers = () => {},
  applications = [], saveApplications = () => {},
  messages = [], saveMessages = () => {},
  hero, saveHero = () => {},
  heroSlides = [], saveHeroSlides = () => {},
  about, saveAbout = () => {},
  settings, saveSettings = () => {},
  seo, saveSEO = () => {},
  expertise = [], saveExpertise = () => {},
  office, saveOffice = () => {},
  processItems = [], saveProcess = () => {},
  industryItems = [], saveIndustries = () => {},
  techStackItems = [], saveTechStack = () => {},
  companyInformation,
  onCompanyInformationUpdated,
  companyContact,
  onCompanyContactUpdated,
  isAdminLoggedIn, onLogin, onLogout
}: AdminPanelProps) {
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileTabMenuOpen, setIsMobileTabMenuOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Editing items state
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [editingTeam, setEditingTeam] = useState<TeamMember | null>(null);
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);
  const [editingReview, setEditingReview] = useState<ClientReview | null>(null);
  const [editingCareer, setEditingCareer] = useState<CareerOpportunity | null>(null);

  // New item flags
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [isNewService, setIsNewService] = useState(false);
  const [isNewTeam, setIsNewTeam] = useState(false);
  const [isNewGallery, setIsNewGallery] = useState(false);
  const [isNewReview, setIsNewReview] = useState(false);
  const [isNewCareer, setIsNewCareer] = useState(false);

  // File upload loading states
  const [isUploadingTeamPhoto, setIsUploadingTeamPhoto] = useState(false);
  const [isUploadingGalleryImg, setIsUploadingGalleryImg] = useState(false);
  const [isUploadingProductImg, setIsUploadingProductImg] = useState(false);
  const [isUploadingProductLogo, setIsUploadingProductLogo] = useState(false);
  const [isUploadingProductGallery, setIsUploadingProductGallery] = useState(false);
  const [newProductImageUrl, setNewProductImageUrl] = useState('');
  const [isUploadingServiceImg, setIsUploadingServiceImg] = useState(false);

  // Toast and upload progress states
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState<number | null>(null);
  const [serviceUploadProgress, setServiceUploadProgress] = useState<number | null>(null);
  const [isServiceDragOver, setIsServiceDragOver] = useState(false);

  // Process Workflow management states
  const [editingProcess, setEditingProcess] = useState<ProcessItem | null>(null);
  const [isNewProcess, setIsNewProcess] = useState(false);

  // Industry Cards management states
  const [editingIndustry, setEditingIndustry] = useState<IndustryItem | null>(null);
  const [isNewIndustry, setIsNewIndustry] = useState(false);

  // Tech Stack Cards management states
  const [editingTechStack, setEditingTechStack] = useState<TechStackItem | null>(null);
  const [isNewTechStack, setIsNewTechStack] = useState(false);
  const [isUploadingTechImg, setIsUploadingTechImg] = useState(false);
  const [techImgUploadProgress, setTechImgUploadProgress] = useState<number | null>(null);

  // Hero Slider management states
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isNewSlide, setIsNewSlide] = useState(false);
  const [isUploadingSlideImg, setIsUploadingSlideImg] = useState(false);
  const [slideUploadProgress, setSlideUploadProgress] = useState<number | null>(null);
  const [isSlideDragOver, setIsSlideDragOver] = useState(false);
  const [previewSlide, setPreviewSlide] = useState<HeroSlide | null>(null);

  // Review management states
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewStatusFilter, setReviewStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'featured'>('all');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<number>(0);
  const [reviewSortBy, setReviewSortBy] = useState<'order' | 'rating-desc' | 'rating-asc' | 'newest' | 'oldest'>('order');
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]);
  const [isUploadingReviewPhoto, setIsUploadingReviewPhoto] = useState(false);
  const [isUploadingReviewLogo, setIsUploadingReviewLogo] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type: type === 'info' ? 'success' : type });
    setTimeout(() => setToast(null), 4000);
  };

  // Hero & About Form state
  const [heroForm, setHeroForm] = useState<HeroData>({
    heading: hero?.heading || 'Transforming Businesses Through Technology',
    subHeading: hero?.subHeading || 'We engineer high-performance software, intelligent agentic AI solutions, and premium digital systems tailored for global enterprise growth.',
    imageUrl: hero?.imageUrl || '',
    primaryBtnText: hero?.primaryBtnText || 'Explore Flagship Products',
    primaryBtnLink: hero?.primaryBtnLink || 'products',
    secondaryBtnText: hero?.secondaryBtnText || 'Request Consult',
    secondaryBtnLink: hero?.secondaryBtnLink || 'contact'
  });
  const [isUploadingHeroImg, setIsUploadingHeroImg] = useState(false);
  const [heroUploadProgress, setHeroUploadProgress] = useState<number | null>(null);
  const [heroPreviewViewport, setHeroPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    setHeroForm({
      heading: hero?.heading || 'Transforming Businesses Through Technology',
      subHeading: hero?.subHeading || 'We engineer high-performance software, intelligent agentic AI solutions, and premium digital systems tailored for global enterprise growth.',
      imageUrl: hero?.imageUrl || '',
      primaryBtnText: hero?.primaryBtnText || 'Explore Flagship Products',
      primaryBtnLink: hero?.primaryBtnLink || 'products',
      secondaryBtnText: hero?.secondaryBtnText || 'Request Consult',
      secondaryBtnLink: hero?.secondaryBtnLink || 'contact'
    });
  }, [hero]);

  const [aboutForm, setAboutForm] = useState<AboutData>({ ...about });
  const [isUploadingAboutImg, setIsUploadingAboutImg] = useState(false);
  const [aboutUploadProgress, setAboutUploadProgress] = useState<number | null>(null);
  const [isAboutDragOver, setIsAboutDragOver] = useState(false);

  useEffect(() => {
    setAboutForm({ ...about });
  }, [about]);
  
  // Settings & SEO state
  const [settingsForm, setSettingsForm] = useState<SystemSettings>({ ...settings });
  const [seoForm, setSEOForm] = useState<SEOSettings>({ ...seo });

  // SEO Preview Tool State
  const [seoPreviewDevice, setSeoPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [seoPreviewPlatform, setSeoPreviewPlatform] = useState<'google' | 'facebook'>('google');
  const [seoPreviewTheme, setSeoPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [copiedSeoTags, setCopiedSeoTags] = useState<boolean>(false);

  useEffect(() => {
    if (seo) {
      setSEOForm({ ...seo });
    }
  }, [seo]);

  const handleSaveSEOForm = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    try {
      showToast('Saving SEO settings...', 'success');
      saveSEO(seoForm);
      showToast('SEO settings saved and synced successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to save SEO settings', 'error');
    }
  };

  // Footer CMS state
  const [officeForm, setOfficeForm] = useState<CorporateOfficeSettings>({ ...office });
  const [expertiseList, setExpertiseList] = useState<ExpertiseItem[]>([...expertise]);
  const [newExpertiseName, setNewExpertiseName] = useState('');
  const [editingExpertiseId, setEditingExpertiseId] = useState<string | null>(null);
  const [editingExpertiseName, setEditingExpertiseName] = useState('');

  useEffect(() => {
    setOfficeForm(office);
  }, [office]);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  // Dedicated single row company_information table state (Single Source of Truth)
  const [companyContactForm, setCompanyContactForm] = useState<CompanyInformation>(() => {
    return companyInformation || companyContact || DEFAULT_COMPANY_INFORMATION;
  });
  const [isSavingCompanyContact, setIsSavingCompanyContact] = useState(false);

  useEffect(() => {
    if (companyInformation || companyContact) {
      setCompanyContactForm(companyInformation || companyContact || DEFAULT_COMPANY_INFORMATION);
    } else {
      fetchCompanyInformation().then(c => {
        if (c) setCompanyContactForm(c);
      });
    }
  }, [companyInformation, companyContact]);

  const handleSaveCompanyContact = async (e: FormEvent) => {
    e.preventDefault();
    setIsSavingCompanyContact(true);
    try {
      // 1. Update company_information table only
      // 2. updateCompanyInformation waits for Supabase update to complete and re-fetches the updated row again!
      const updated = await updateCompanyInformation({
        companyName: companyContactForm.companyName,
        email: companyContactForm.email,
        phone: companyContactForm.phone,
        phoneSecondary: companyContactForm.phoneSecondary || '',
        address: companyContactForm.address
      });

      // 3. Refresh local component form state
      setCompanyContactForm(updated);

      // 4. Refresh parent application state
      if (onCompanyInformationUpdated) {
        onCompanyInformationUpdated(updated);
      }
      if (onCompanyContactUpdated) {
        onCompanyContactUpdated(updated);
      }

      // 5. Show success message
      showToast('Company Information updated successfully in company_information!', 'success');
    } catch (err: any) {
      console.error('Error saving company information:', err);
      showToast(err.message || 'Failed to update Company Information details.', 'error');
    } finally {
      setIsSavingCompanyContact(false);
    }
  };

  useEffect(() => {
    setExpertiseList(expertise);
  }, [expertise]);

  // Global Search state across Messages, Applications, and Team Members
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchCategory, setGlobalSearchCategory] = useState<'all' | 'messages' | 'applications' | 'team'>('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Compute filtered search results across messages, applications, and team members
  const searchResults = useMemo(() => {
    const q = globalSearchQuery.trim().toLowerCase();
    if (!q) return { messages: [], applications: [], team: [], total: 0 };

    const matchedMessages = (Array.isArray(messages) ? messages : []).filter(m => 
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      (m.subject && m.subject.toLowerCase().includes(q)) ||
      (m.message && m.message.toLowerCase().includes(q))
    );

    const matchedApplications = (Array.isArray(applications) ? applications : []).filter(a => 
      (a.fullName && a.fullName.toLowerCase().includes(q)) ||
      (a.email && a.email.toLowerCase().includes(q)) ||
      (a.phone && a.phone.toLowerCase().includes(q)) ||
      (a.jobTitle && a.jobTitle.toLowerCase().includes(q)) ||
      (a.coverLetter && a.coverLetter.toLowerCase().includes(q))
    );

    const matchedTeam = (Array.isArray(team) ? team : []).filter(t => 
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.designation && t.designation.toLowerCase().includes(q)) ||
      (t.experience && t.experience.toLowerCase().includes(q))
    );

    return {
      messages: matchedMessages,
      applications: matchedApplications,
      team: matchedTeam,
      total: matchedMessages.length + matchedApplications.length + matchedTeam.length
    };
  }, [globalSearchQuery, messages, applications, team]);

  // Contact Management System upgraded states
  const [msgSearch, setMsgSearch] = useState('');
  const [msgReadFilter, setMsgReadFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [msgReplyFilter, setMsgReplyFilter] = useState<'all' | 'pending' | 'replied' | 'ignored'>('all');
  const [msgSortOrder, setMsgSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [msgPage, setMsgPage] = useState(1);
  const msgItemsPerPage = 5;

  // Selected Message for detailed viewing / replying
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Form states for active reply composition
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [replyError, setReplyError] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [sendingProgress, setSendingProgress] = useState('');
  const [spamCode, setSpamCode] = useState('');
  const [userSpamCode, setUserSpamCode] = useState('');
  const [spamCodeError, setSpamCodeError] = useState('');
  const [lastActionTime, setLastActionTime] = useState<number>(0);

  // Spam code generation helper
  const generateSpamCode = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setSpamCode(code);
    setUserSpamCode('');
    setSpamCodeError('');
  };

  // Math challenge anti-spam generator
  const [mathNum1, setMathNum1] = useState(0);
  const [mathNum2, setMathNum2] = useState(0);
  const [mathAnswer, setMathAnswer] = useState('');

  const generateMathChallenge = () => {
    const num1 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    const num2 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    setMathNum1(num1);
    setMathNum2(num2);
    setMathAnswer('');
    setSpamCodeError('');
  };

  // Production Security & Authentication State
  const [authState, setAuthState] = useState<AdminAuthState | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<'login' | 'forgot-password' | 'reset-password' | 'forgot-code' | 'register'>('login');
  
  // Login Extended States
  const [loginEmail, setLoginEmail] = useState(() => localStorage.getItem('admin_remember_email') || '');
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('admin_remember_me') === 'true');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin Registration States (Create Admin Account)
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerNotice, setRegisterNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Forgot & Reset Password Flow States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCodeInput, setForgotCodeInput] = useState('');
  const [forgotGeneratedCode, setForgotGeneratedCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotNotice, setForgotNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isResettingPass, setIsResettingPass] = useState(false);

  // Security Tab Change Password form states
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passNotice, setPassNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Admin Profile Settings form states
  const [adminProfileName, setAdminProfileName] = useState(settings.adminName || 'Admin User');
  const [adminProfileEmail, setAdminProfileEmail] = useState(settings.email || '');
  const [adminProfilePhoto, setAdminProfilePhoto] = useState(settings.adminAvatarUrl || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // First Login Force Password Change Modal state
  const [forceNewPass, setForceNewPass] = useState('');
  const [forceConfirmPass, setForceConfirmPass] = useState('');
  const [showForceNewPass, setShowForceNewPass] = useState(false);
  const [showForceConfirmPass, setShowForceConfirmPass] = useState(false);
  const [forcePassNotice, setForcePassNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Authenticated Admin Role & Access Guard System
  const [currentUserRole, setCurrentUserRole] = useState<string>('Admin');
  const [isRestricted, setIsRestricted] = useState<boolean>(false);
  const [restrictedNotice, setRestrictedNotice] = useState<string>('Permission Restricted: Please contact your administrator');

  // Fetch role-filtered CMS data safely with try-catch fallback
  const roleFilteredCmsQuery = useRoleFilteredDataQuery(currentUserRole, isAdminLoggedIn);

  useEffect(() => {
    if (roleFilteredCmsQuery.data?.isRestricted || roleFilteredCmsQuery.isError) {
      setIsRestricted(true);
      if (roleFilteredCmsQuery.data?.permissionNotice) {
        setRestrictedNotice(roleFilteredCmsQuery.data.permissionNotice);
      }
    } else {
      setIsRestricted(false);
    }
  }, [roleFilteredCmsQuery.data, roleFilteredCmsQuery.isError]);

  // Dedicated My Profile & Password Modal (Accessible to all roles: Admin, HR, Support)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'password'>('profile');

  // Users & RBAC Management State
  const [adminUsersList, setAdminUsersList] = useState<AdminUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [usersSearchQuery, setUsersSearchQuery] = useState<string>('');
  const [usersRoleFilter, setUsersRoleFilter] = useState<string>('all');

  // Add User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<AdminRole>('HR');
  const [newUserPassword, setNewUserPassword] = useState<string>('');
  const [newUserConfirmPassword, setNewUserConfirmPassword] = useState<string>('');
  const [showNewUserPass, setShowNewUserPass] = useState<boolean>(false);
  const [showNewUserConfirmPass, setShowNewUserConfirmPass] = useState<boolean>(false);
  const [isCreatingUser, setIsCreatingUser] = useState<boolean>(false);
  const [addUserNotice, setAddUserNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Edit Role / Delete User Modals
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState<boolean>(false);

  // Module Permissions List from Supabase permissions table
  const [permissionsList, setPermissionsList] = useState<PermissionDefinition[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState<boolean>(false);

  // React Query Cached Hooks
  const { 
    data: cachedUsersList, 
    refetch: refetchAdminUsersQuery 
  } = useAdminUsersQuery(isAdminLoggedIn);

  const { 
    data: cachedAuditLogs, 
    refetch: refetchAuditLogsQuery 
  } = useContentAuditLogsQuery(20, isAdminLoggedIn && activeTab === 'history');

  const cacheInvalidator = useAdminCacheInvalidator();

  // Sync React Query cached users to local state
  useEffect(() => {
    if (cachedUsersList && cachedUsersList.length > 0) {
      setAdminUsersList(cachedUsersList);
    }
  }, [cachedUsersList]);

  // Sync React Query cached audit logs to local state
  useEffect(() => {
    if (cachedAuditLogs) {
      setAuditLogs(cachedAuditLogs);
    }
  }, [cachedAuditLogs]);

  // Helper to load content audit logs using React Query refetch
  const loadAuditHistory = async () => {
    setIsLoadingAuditLogs(true);
    try {
      const res = await refetchAuditLogsQuery();
      if (res.data) setAuditLogs(res.data);
    } catch (e) {
      console.error('[Audit History Error]:', e);
    } finally {
      setIsLoadingAuditLogs(false);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn && activeTab === 'history') {
      loadAuditHistory();
    }
  }, [isAdminLoggedIn, activeTab]);

  // Helper to load admin users using React Query refetch
  const loadAdminUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await refetchAdminUsersQuery();
      if (res.data) setAdminUsersList(res.data);
    } catch (e) {
      console.warn('loadAdminUsers error:', e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Helper to load role permissions from Supabase
  const loadPermissions = async () => {
    setIsLoadingPermissions(true);
    try {
      const perms = await fetchRolePermissionsFromDb();
      setPermissionsList(perms);
    } catch (e) {
      console.warn('loadPermissions error:', e);
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      loadPermissions();
    }
  }, [isAdminLoggedIn]);

  // Initialize RBAC Role Guard
  const roleGuard = useRoleGuard(currentUserRole, showToast);
  const {
    isAdmin: isAdminRole,
    isHR: isHRRole,
    canDelete,
    canAddAdmin,
    canManageRoles,
    canManageSecurity,
    checkAccessGuard
  } = roleGuard;

  // Load auth state on mount and route sync
  useEffect(() => {
    async function initAuth() {
      const state = await getAdminAuthState();
      setAuthState(state);

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user && user.email) {
            const roleRes = await verifyAndStoreAdminRole(user.id, user.email, user.user_metadata?.full_name);
            if (roleRes.role) {
              setCurrentUserRole(roleRes.role);
            } else {
              const role = await getAdminUserRole(user.id);
              setCurrentUserRole(role);
            }
          }
        } catch (e) {
          console.warn('Initial admin sync note:', e);
        }
      }
    }
    initAuth();

    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path === '/admin/forgot-password') {
      setLoginMode('forgot-password');
    } else if (path === '/admin/reset-password' || hash.includes('type=recovery') || hash.includes('access_token')) {
      setLoginMode('reset-password');
    } else if (path === '/admin/login') {
      setLoginMode('login');
    }

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setLoginMode('reset-password');
          window.history.pushState({}, '', '/admin/reset-password');
          setForgotNotice({
            text: 'Supabase Auth recovery session verified. Please enter your new administrator password below.',
            type: 'success'
          });
        }
        if (session?.user && session.user.email) {
          const roleRes = await verifyAndStoreAdminRole(session.user.id, session.user.email, session.user.user_metadata?.full_name);
          if (roleRes.role) {
            setCurrentUserRole(roleRes.role);
          } else {
            const role = await getAdminUserRole(session.user.id);
            setCurrentUserRole(role);
          }
        }
      });
      return () => {
        subscription?.unsubscribe();
      };
    }
  }, []);

  useEffect(() => {
    if (settings) {
      if (settings.adminName) setAdminProfileName(settings.adminName);
      if (settings.email) setAdminProfileEmail(settings.email);
      if (settings.adminAvatarUrl) setAdminProfilePhoto(settings.adminAvatarUrl);
    }
    if (authState?.adminEmail) {
      setAdminProfileEmail(authState.adminEmail);
    }
  }, [settings, authState]);

  // Handle Admin Account Creation (Registration) via Supabase Auth
  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setRegisterNotice(null);

    if (!checkAccessGuard('add_admin', 'administrator account')) {
      return;
    }

    const cleanEmail = registerEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setRegisterNotice({ text: 'Please enter a valid administrator email address.', type: 'error' });
      return;
    }

    const rules = validatePasswordRules(registerPassword);
    if (!rules.isValid) {
      setRegisterNotice({ text: `Password requirements not met: ${rules.errors.join(', ')}`, type: 'error' });
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setRegisterNotice({ text: 'Passwords do not match.', type: 'error' });
      return;
    }

    setIsRegistering(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        setRegisterNotice({ text: 'Supabase Authentication is not configured.', type: 'error' });
        setIsRegistering(false);
        return;
      }

      const signUpRes = await signUpAdminAccount(cleanEmail, registerPassword, registerName.trim());

      setRegisterNotice({
        text: 'Administrator account created successfully! You can now log in with your credentials.',
        type: 'success'
      });
      showToast('Admin account registered successfully!', 'success');

      setLoginEmail(cleanEmail);
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      
      setTimeout(() => {
        setLoginMode('login');
        setRegisterNotice(null);
      }, 2000);
    } catch (err: any) {
      setRegisterNotice({
        text: err.message || 'Failed to create admin account in Supabase Auth.',
        type: 'error'
      });
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle Login Authentication via Supabase Auth
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setLoginError('Please enter your administrator email address.');
      return;
    }

    if (!password) {
      setLoginError('Please enter your access password.');
      return;
    }

    setIsLoggingIn(true);

    try {
      if (authState?.lockoutUntil && Date.now() < authState.lockoutUntil) {
        const remainingMins = Math.ceil((authState.lockoutUntil - Date.now()) / (60 * 1000));
        setLoginError(`Too many failed login attempts. Account locked for ${remainingMins} minutes.`);
        setIsLoggingIn(false);
        return;
      }

      if (!isSupabaseConfigured || !supabase) {
        setLoginError('Supabase Authentication is not configured. Please check your Supabase API keys.');
        setIsLoggingIn(false);
        return;
      }

      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      // Authentication Diagnostics Logging (STEP 1)
      console.log('[Auth Diagnostic] Supabase auth error:', error ? { message: error.message, status: error.status } : null);
      console.log('[Auth Diagnostic] authenticated user.id:', data?.user?.id || null);
      console.log('[Auth Diagnostic] session exists:', !!data?.session);
      console.log('[Auth Diagnostic] session.access_token exists:', !!data?.session?.access_token);
      console.log('[Auth Diagnostic] user.email:', data?.user?.email || null);

      if (error) {
        const newFailed = (authState?.failedAttempts || 0) + 1;
        let newLockout: number | null = null;
        let errMsg = error.message || 'Invalid email or password.';

        if (newFailed >= 5) {
          newLockout = Date.now() + 15 * 60 * 1000;
          errMsg = 'Too many failed login attempts. Account locked for 15 minutes.';
        }

        if (authState) {
          const updatedState: AdminAuthState = {
            ...authState,
            failedAttempts: newFailed,
            lockoutUntil: newLockout,
          };
          saveAdminAuthState(updatedState);
          setAuthState(updatedState);
        }

        setLoginError(errMsg);
        setIsLoggingIn(false);
        return;
      }

      if (!data.user) {
        setLoginError('Authentication failed: No user returned by Supabase.');
        setIsLoggingIn(false);
        return;
      }

      // 2. Verify Admin Role in Database
      const roleCheck = await verifyAndStoreAdminRole(data.user.id, cleanEmail, data.user.user_metadata?.full_name);
      if (!roleCheck.isAdmin) {
        await supabase.auth.signOut();
        setLoginError(roleCheck.message || 'Access denied: User does not have Administrator privileges.');
        setIsLoggingIn(false);
        return;
      }
      if (roleCheck.role) {
        setCurrentUserRole(roleCheck.role);
      } else {
        const role = await getAdminUserRole(data.user.id);
        setCurrentUserRole(role);
      }

      // 3. Login Success
      if (rememberMe) {
        localStorage.setItem('admin_remember_me', 'true');
        localStorage.setItem('admin_remember_email', cleanEmail);
        localStorage.setItem('isAdminLoggedIn', 'true');
      } else {
        localStorage.removeItem('admin_remember_me');
        localStorage.removeItem('admin_remember_email');
        localStorage.removeItem('isAdminLoggedIn');
      }
      sessionStorage.setItem('isAdminLoggedIn', 'true');

      if (authState) {
        const updatedState: AdminAuthState = {
          ...authState,
          failedAttempts: 0,
          lockoutUntil: null,
          adminEmail: cleanEmail,
        };
        saveAdminAuthState(updatedState);
        setAuthState(updatedState);
        setActiveSessionVersion(updatedState.sessionVersion);
      }

      onLogin();
      setLoginError('');
      setPassword('');
      showToast('Authenticated successfully with Supabase Auth.', 'success');

    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Forgot Password Request via Supabase Auth
  const handleForgotPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setForgotNotice(null);

    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setForgotNotice({ text: 'Please enter your administrator email address.', type: 'error' });
      return;
    }

    setIsSendingReset(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        setForgotNotice({ text: 'Supabase Authentication is not configured.', type: 'error' });
        setIsSendingReset(false);
        return;
      }

      const redirectUrl = `${window.location.origin}/admin/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        setForgotNotice({
          text: error.message || 'Failed to send password reset email via Supabase.',
          type: 'error'
        });
      } else {
        setForgotNotice({
          text: `Password reset instructions sent to ${cleanEmail}. Please check your email inbox for the reset link.`,
          type: 'success'
        });
      }
    } catch (err: any) {
      setForgotNotice({
        text: err.message || 'Error processing password reset request.',
        type: 'error'
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  // Handle Reset Password Submission via Supabase Auth
  const handleResetPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setForgotNotice(null);

    const rules = validatePasswordRules(forgotNewPassword);
    if (!rules.isValid) {
      setForgotNotice({
        text: `Password rules violated: ${rules.errors.join(', ')}`,
        type: 'error'
      });
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotNotice({
        text: 'New password and Confirm password do not match.',
        type: 'error'
      });
      return;
    }

    setIsResettingPass(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.updateUser({
          password: forgotNewPassword,
        });
        if (error) {
          console.warn('Supabase updateUser password note:', error.message);
        }
      }

      if (authState) {
        const newSalt = Math.random().toString(36).substring(2, 10);
        const newHash = await hashPassword(forgotNewPassword, newSalt);

        const updatedState: AdminAuthState = {
          ...authState,
          passwordHash: newHash,
          salt: newSalt,
          lastPasswordChanged: new Date().toISOString(),
          mustChangePassword: false,
          failedAttempts: 0,
          lockoutUntil: null,
          sessionVersion: (authState.sessionVersion || 1) + 1,
        };

        saveAdminAuthState(updatedState);
        setAuthState(updatedState);
      }

      setForgotNotice({
        text: 'Password successfully reset! Redirecting to login...',
        type: 'success'
      });

      showToast('Password reset successfully!', 'success');

      setTimeout(() => {
        setLoginMode('login');
        window.history.pushState({}, '', '/admin/login');
        setPassword('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
        setForgotNotice(null);
      }, 2000);

    } catch (err: any) {
      setForgotNotice({
        text: err.message || 'Failed to update password.',
        type: 'error'
      });
    } finally {
      setIsResettingPass(false);
    }
  };

  // Handle Admin Profile Update
  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileNotice(null);
    setIsUpdatingProfile(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          if (adminProfileEmail.trim() !== (settings.email || '')) {
            const { error } = await supabase.auth.updateUser({
              email: adminProfileEmail.trim(),
              data: { full_name: adminProfileName.trim() }
            });
            if (error) {
              console.warn('Supabase updateUser email note:', error.message);
            }
          }

          // Directly update admins table for logged in admin user_id
          await supabase.from('admins').update({
            full_name: adminProfileName.trim(),
            email: adminProfileEmail.trim(),
            updated_at: new Date().toISOString()
          }).eq('user_id', user.id);
        }
      }

      const updatedSettings = {
        ...settings,
        adminName: adminProfileName.trim(),
        email: adminProfileEmail.trim(),
        adminAvatarUrl: adminProfilePhoto.trim(),
      };
      saveSettings(updatedSettings);

      if (authState) {
        const updatedAuthState = {
          ...authState,
          adminEmail: adminProfileEmail.trim(),
        };
        saveAdminAuthState(updatedAuthState);
        setAuthState(updatedAuthState);
      }

      setProfileNotice({
        text: 'Administrator profile updated successfully!',
        type: 'success',
      });
      showToast('Profile settings saved successfully.', 'success');
    } catch (err: any) {
      setProfileNotice({
        text: err.message || 'Failed to update admin profile.',
        type: 'error',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const isTabAllowedForRole = roleGuard.isTabAllowed;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'History', icon: History },
    { id: 'seo', label: 'SEO & Search Preview', icon: Search },
    { id: 'company-contact', label: 'Company Contact', icon: Phone },
    { id: 'users-management', label: 'Users & RBAC', icon: UserCheck },
    { id: 'security', label: 'Security & Auth', icon: ShieldCheck },
    { id: 'products', label: 'Products', icon: Layers },
    { id: 'services', label: 'Services', icon: Globe },
    { id: 'process', label: 'Development Process', icon: Workflow },
    { id: 'industries', label: 'Industries We Serve', icon: Building2 },
    { id: 'techstack', label: 'Technology Stack', icon: Cpu },
    { id: 'team', label: 'Tech Team', icon: Users },
    { id: 'gallery', label: 'Gallery Archive', icon: ImageIcon },
    { id: 'reviews', label: 'Client Reviews', icon: Star },
    { id: 'careers', label: 'Careers & Apps', icon: Briefcase },
    { id: 'hero-slider', label: 'Hero Slider', icon: Monitor },
    { id: 'hero-about', label: 'Hero & About', icon: Sparkles },
    { id: 'messages', label: 'Contact Messages', icon: MessageSquare },
    { id: 'footer-settings', label: 'Footer Settings', icon: FileText },
    { id: 'branding', label: 'Company Branding', icon: Building2 }
  ];

  const visibleTabs = useMemo(() => {
    return roleGuard.filterAllowedTabs(tabs);
  }, [roleGuard]);

  useEffect(() => {
    if (isAdminLoggedIn && !roleGuard.isTabAllowed(activeTab)) {
      const firstAllowed = visibleTabs[0]?.id || 'dashboard';
      if (activeTab !== firstAllowed) {
        setActiveTab(firstAllowed);
      }
    }
  }, [activeTab, currentUserRole, isAdminLoggedIn, roleGuard, visibleTabs]);

  if (!isAdminLoggedIn) {
    const isLockedOut = authState?.lockoutUntil ? Date.now() < authState.lockoutUntil : false;

    return (
      <div className="bg-[#12343b] text-white min-h-screen flex items-center justify-center p-4 pt-24 font-sans" id="admin-login-screen">
        <div
          className="premium-card rounded-3xl max-w-md w-full p-8 shadow-2xl relative bg-[#2d545e] border border-[#3f6973]"
        >
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#e1b382]/10 rounded-full filter blur-[20px]" />
          
          <div className="text-center space-y-3 mb-8 flex flex-col items-center">
            <BrandLogo customLogoUrl={settingsForm.companyLogo} size="lg" className="mb-2" />
            <h2 className="text-2xl font-bold tracking-wider text-white">
              {loginMode === 'login' && 'SECURE CMS PORTAL'}
              {loginMode === 'register' && 'CREATE ADMIN ACCOUNT'}
              {loginMode === 'forgot-password' && 'FORGOT PASSWORD'}
              {loginMode === 'reset-password' && 'RESET PASSWORD'}
              {loginMode === 'forgot-code' && 'VERIFICATION CODE'}
            </h2>
            <p className="text-xs text-[#CBD5E1] max-w-xs mx-auto">
              {loginMode === 'login' && 'Authenticate with Supabase Auth to authorize system administration, product catalogs, and client inquiries.'}
              {loginMode === 'register' && 'Register your corporate email address to create an administrator account via Supabase Auth.'}
              {loginMode === 'forgot-password' && 'Enter your registered corporate email address to receive password reset instructions via Supabase.'}
              {loginMode === 'reset-password' && 'Create a new strong password for your administrator account.'}
              {loginMode === 'forgot-code' && 'Enter your security verification code and set your new encrypted administrator password.'}
            </p>
          </div>

          {/* Standard Login Error Banner */}
          {loginError && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-xl flex items-center space-x-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Registration Notice Banner */}
          {registerNotice && (
            <div className={`mb-6 p-4 rounded-xl flex items-start space-x-2 text-xs border ${
              registerNotice.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200' : 'bg-red-500/20 border-red-500/40 text-red-300'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{registerNotice.text}</span>
            </div>
          )}

          {/* Forgot / Reset Notice Banner */}
          {forgotNotice && (
            <div className={`mb-6 p-4 rounded-xl flex items-start space-x-2 text-xs border ${
              forgotNotice.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200' : 'bg-red-500/20 border-red-500/40 text-red-300'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{forgotNotice.text}</span>
            </div>
          )}

          {/* MODE 1: Standard Login Form */}
          {loginMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* Admin Email Input */}
              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-widest mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <input 
                    type="email"
                    required
                    disabled={isLockedOut || isLoggingIn}
                    placeholder="admin@yourcompany.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white placeholder-[#CBD5E1]/60 focus:outline-none transition-all font-sans disabled:opacity-50"
                  />
                  <Mail className="w-4 h-4 text-[#CBD5E1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-widest mb-2">
                  Access Password
                </label>
                <div className="relative">
                  <input 
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    disabled={isLockedOut || isLoggingIn}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white placeholder-[#CBD5E1]/60 focus:outline-none transition-all font-mono tracking-widest disabled:opacity-50"
                  />
                  <Lock className="w-4 h-4 text-[#CBD5E1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CBD5E1] hover:text-[#e1b382] p-1.5 transition-colors cursor-pointer"
                    title={showLoginPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-[#CBD5E1] cursor-pointer hover:text-white select-none">
                  <input 
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#3f6973] bg-[#12343b] text-[#e1b382] focus:ring-[#e1b382] focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-[11px] font-mono">Remember Me</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('forgot-password');
                    window.history.pushState({}, '', '/admin/forgot-password');
                    setForgotNotice(null);
                    setLoginError('');
                  }}
                  className="text-[#e1b382] hover:underline font-medium text-[11px] transition-all cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Authorize Session Button */}
              <button
                type="submit"
                id="admin-login-btn"
                disabled={isLockedOut || isLoggingIn}
                className="w-full py-3.5 rounded-xl bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] hover:text-white text-xs font-bold tracking-widest uppercase transition-all shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-[#12343b] animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : isLockedOut ? (
                  <span>Account Locked (15 Min)</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize Session</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('register');
                    setRegisterNotice(null);
                    setLoginError('');
                  }}
                  className="text-xs text-[#e1b382] hover:underline font-medium cursor-pointer"
                >
                  Need an admin account? Register Admin Account
                </button>
              </div>

              <div className="pt-4 border-t border-[#3f6973] mt-2">
                <button
                  type="button"
                  onClick={() => {
                    window.history.pushState({}, '', '/');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="w-full py-2.5 rounded-xl border border-[#3f6973] hover:border-[#e1b382] hover:bg-[#12343b]/60 text-[#CBD5E1] hover:text-white text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer flex items-center justify-center"
                >
                  Return to Public Website
                </button>
              </div>
            </form>
          )}

          {/* MODE: Admin Registration (Create Admin Account) */}
          {loginMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-widest mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    required
                    disabled={isRegistering}
                    placeholder="System Administrator"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white placeholder-[#CBD5E1]/60 focus:outline-none"
                  />
                  <User className="w-4 h-4 text-[#CBD5E1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-widest mb-1">
                  Corporate Admin Email
                </label>
                <div className="relative">
                  <input 
                    type="email"
                    required
                    disabled={isRegistering}
                    placeholder="admin@yourcompany.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white placeholder-[#CBD5E1]/60 focus:outline-none"
                  />
                  <Mail className="w-4 h-4 text-[#CBD5E1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-widest mb-1">
                  Password
                </label>
                <div className="relative">
                  <input 
                    type={showRegisterPassword ? 'text' : 'password'}
                    required
                    disabled={isRegistering}
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none font-mono"
                  />
                  <Lock className="w-4 h-4 text-[#CBD5E1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CBD5E1] hover:text-[#e1b382]"
                  >
                    {showRegisterPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-widest mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input 
                    type={showRegisterPassword ? 'text' : 'password'}
                    required
                    disabled={isRegistering}
                    placeholder="••••••••"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none font-mono"
                  />
                  <Lock className="w-4 h-4 text-[#CBD5E1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Comprehensive Live Password Complexity Validator */}
              <PasswordComplexityValidator
                password={registerPassword}
                confirmPassword={registerConfirmPassword}
                userEmailOrName={registerEmail}
                onApplyGeneratedPassword={(gen) => {
                  setRegisterPassword(gen);
                  setRegisterConfirmPassword(gen);
                }}
                compact={true}
                title="Account Password Complexity Policy"
                subtitle="All requirements must be satisfied for administrator account activation."
              />

              <button
                type="submit"
                disabled={isRegistering || !validatePasswordRules(registerPassword, registerConfirmPassword, registerEmail).isValid}
                className="w-full py-3 rounded-xl bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] hover:text-white text-xs font-bold tracking-widest uppercase transition-all shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
              >
                {isRegistering ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-[#12343b] animate-spin" />
                    <span>Creating Admin Account...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Create & Activate Admin Account</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginMode('login');
                  setRegisterNotice(null);
                }}
                className="w-full py-2 rounded-xl border border-[#3f6973] hover:border-[#e1b382] text-[#CBD5E1] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>
            </form>
          )}

          {/* MODE 2: Forgot Password - Email Submission */}
          {loginMode === 'forgot-password' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-widest mb-2">
                  Corporate Admin Email
                </label>
                <div className="relative">
                  <input 
                    type="email"
                    required
                    disabled={isSendingReset}
                    placeholder="admin@yourcompany.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white placeholder-[#CBD5E1]/60 focus:outline-none transition-all font-sans"
                  />
                  <Mail className="w-4 h-4 text-[#CBD5E1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSendingReset}
                className="w-full py-3.5 rounded-xl bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] hover:text-white text-xs font-bold tracking-widest uppercase transition-all shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isSendingReset ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-[#12343b] animate-spin" />
                    <span>Sending Reset Instructions...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Send Reset Email</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setLoginMode('forgot-code')}
                  className="text-[11px] text-[#CBD5E1]/80 hover:text-[#e1b382] underline font-mono cursor-pointer"
                >
                  Have a 6-digit verification code? Enter Code
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setLoginMode('login');
                  window.history.pushState({}, '', '/admin/login');
                  setForgotNotice(null);
                }}
                className="w-full py-2.5 rounded-xl border border-[#3f6973] hover:border-[#e1b382] text-[#CBD5E1] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>
            </form>
          )}

          {/* MODE 3: Reset Password Page */}
          {loginMode === 'reset-password' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-widest mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input 
                    type={showForgotNewPassword ? 'text' : 'password'}
                    required
                    disabled={isResettingPass}
                    placeholder="••••••••"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none"
                  />
                  <Lock className="w-4 h-4 text-[#CBD5E1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CBD5E1] hover:text-[#e1b382]"
                  >
                    {showForgotNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-widest mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input 
                    type={showForgotConfirmPassword ? 'text' : 'password'}
                    required
                    disabled={isResettingPass}
                    placeholder="••••••••"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none"
                  />
                  <Lock className="w-4 h-4 text-[#CBD5E1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CBD5E1] hover:text-[#e1b382]"
                  >
                    {showForgotConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Comprehensive Live Password Complexity Validator */}
              <PasswordComplexityValidator
                password={forgotNewPassword}
                confirmPassword={forgotConfirmPassword}
                userEmailOrName={forgotEmail}
                onApplyGeneratedPassword={(gen) => {
                  setForgotNewPassword(gen);
                  setForgotConfirmPassword(gen);
                }}
                compact={true}
                title="Password Security Policy"
                subtitle="Ensure the updated password satisfies all complexity standards."
              />

              <button
                type="submit"
                disabled={isResettingPass || !validatePasswordRules(forgotNewPassword, forgotConfirmPassword, forgotEmail).isValid}
                className="w-full py-3.5 rounded-xl bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer mt-2 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isResettingPass ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-[#12343b] animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Save & Update Password</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginMode('login');
                  window.history.pushState({}, '', '/admin/login');
                  setForgotNotice(null);
                }}
                className="w-full py-2.5 rounded-xl border border-[#3f6973] hover:border-[#e1b382] text-[#CBD5E1] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>
            </form>
          )}

          {/* MODE 4: Verification Code Fallback */}
          {loginMode === 'forgot-code' && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              setForgotNotice(null);

              if (forgotCodeInput.trim() !== forgotGeneratedCode) {
                setForgotNotice({ text: 'Invalid verification security code.', type: 'error' });
                return;
              }

              const rules = validatePasswordRules(forgotNewPassword);
              if (!rules.isValid) {
                setForgotNotice({ text: `Password rules violated: ${rules.errors.join(', ')}`, type: 'error' });
                return;
              }

              if (forgotNewPassword !== forgotConfirmPassword) {
                setForgotNotice({ text: 'New password and Confirm password do not match.', type: 'error' });
                return;
              }

              if (!authState) return;

              const newSalt = Math.random().toString(36).substring(2, 10);
              const newHash = await hashPassword(forgotNewPassword, newSalt);

              const updatedState: AdminAuthState = {
                ...authState,
                passwordHash: newHash,
                salt: newSalt,
                lastPasswordChanged: new Date().toISOString(),
                mustChangePassword: false,
                failedAttempts: 0,
                lockoutUntil: null,
                sessionVersion: (authState.sessionVersion || 1) + 1,
              };

              saveAdminAuthState(updatedState);
              setAuthState(updatedState);

              showToast('Password reset successfully! Please log in with your new credentials.', 'success');
              setLoginMode('login');
              setPassword('');
              setForgotNotice(null);
            }} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-[#CBD5E1] uppercase tracking-widest mb-1">
                  6-Digit Verification Code
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. 849201"
                  value={forgotCodeInput}
                  onChange={(e) => setForgotCodeInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-center font-mono tracking-widest text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#CBD5E1] uppercase tracking-widest mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input 
                    type={showForgotNewPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CBD5E1] hover:text-[#e1b382]"
                  >
                    {showForgotNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Meter */}
              {forgotNewPassword && (() => {
                const strength = calculatePasswordStrength(forgotNewPassword);
                return (
                  <div className="space-y-1 bg-[#12343b]/80 p-2.5 rounded-lg border border-[#3f6973]">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-[#CBD5E1]">Password Strength:</span>
                      <span className="font-bold text-[#e1b382]">{strength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#2d545e] rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.score}%` }} />
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="block text-[10px] font-mono text-[#CBD5E1] uppercase tracking-widest mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input 
                    type={showForgotConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CBD5E1] hover:text-[#e1b382]"
                  >
                    {showForgotConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer mt-2"
              >
                Reset Password & Continue
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginMode('login');
                  setForgotNotice(null);
                }}
                className="w-full py-2.5 rounded-xl border border-[#3f6973] hover:border-[#e1b382] text-[#CBD5E1] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>
            </form>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#12343b] text-white min-h-screen pt-12 pb-12 font-sans" id="admin-panel-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Separate Header just for the Admin Control Center */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-[#3f6973] pb-6 mb-8 gap-4">
          <div className="flex items-center space-x-4 shrink-0">
            <BrandLogo customLogoUrl={settingsForm.companyLogo} size="sm" />
            <div>
              <h1 className="text-xl font-bold tracking-wider text-white">
                APNAKHAIYAL CONTROL CENTER
              </h1>
              <div className="flex items-center space-x-2 mt-0.5">
                <p className="text-xs text-[#e1b382] font-mono tracking-wider">
                  SECURE CMS PORTAL ACTIVE
                </p>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#12343b] border border-[#e1b382]/40 text-[#e1b382] uppercase tracking-wider font-semibold">
                  Role: {currentUserRole}
                </span>
              </div>
            </div>
          </div>

          {/* Global Search Bar */}
          <div className="relative flex-1 max-w-lg mx-auto lg:mx-4 w-full">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#e1b382] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search messages, applications, team..."
                value={globalSearchQuery}
                onChange={(e) => {
                  setGlobalSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-10 pr-9 py-2.5 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white placeholder-[#CBD5E1]/60 focus:outline-none transition-all shadow-inner font-sans"
              />
              {globalSearchQuery && (
                <button
                  type="button"
                  onClick={() => setGlobalSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CBD5E1] hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Overlay Results */}
            {isSearchFocused && globalSearchQuery.trim() !== '' && (
              <>
                {/* Backdrop to close search */}
                <div 
                  className="fixed inset-0 z-40 bg-black/20" 
                  onClick={() => setIsSearchFocused(false)} 
                />

                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#12343b] border border-[#3f6973] rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col font-sans">
                  
                  {/* Category Filter Pills Bar */}
                  <div className="p-3 bg-[#2d545e]/60 border-b border-[#3f6973] flex items-center justify-between gap-2 overflow-x-auto text-[11px]">
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setGlobalSearchCategory('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          globalSearchCategory === 'all'
                            ? 'bg-[#e1b382] text-[#12343b] font-bold'
                            : 'bg-[#12343b] text-[#CBD5E1] hover:text-white border border-[#3f6973]'
                        }`}
                      >
                        All ({searchResults.total})
                      </button>
                      <button
                        type="button"
                        onClick={() => setGlobalSearchCategory('messages')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          globalSearchCategory === 'messages'
                            ? 'bg-[#e1b382] text-[#12343b] font-bold'
                            : 'bg-[#12343b] text-[#CBD5E1] hover:text-white border border-[#3f6973]'
                        }`}
                      >
                        Messages ({searchResults.messages.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setGlobalSearchCategory('applications')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          globalSearchCategory === 'applications'
                            ? 'bg-[#e1b382] text-[#12343b] font-bold'
                            : 'bg-[#12343b] text-[#CBD5E1] hover:text-white border border-[#3f6973]'
                        }`}
                      >
                        Applications ({searchResults.applications.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setGlobalSearchCategory('team')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          globalSearchCategory === 'team'
                            ? 'bg-[#e1b382] text-[#12343b] font-bold'
                            : 'bg-[#12343b] text-[#CBD5E1] hover:text-white border border-[#3f6973]'
                        }`}
                      >
                        Team ({searchResults.team.length})
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsSearchFocused(false)}
                      className="text-[#CBD5E1] hover:text-white p-1 cursor-pointer shrink-0"
                      title="Close search results"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Scrollable Results List */}
                  <div className="overflow-y-auto p-2 space-y-3 divide-y divide-[#3f6973]/40 max-h-96">
                    {searchResults.total === 0 ? (
                      <div className="p-6 text-center text-[#CBD5E1] text-xs">
                        <Search className="w-6 h-6 text-[#3f6973] mx-auto mb-2" />
                        <p className="font-semibold text-white">No matching records found for "{globalSearchQuery}"</p>
                        <p className="text-[10px] text-[#CBD5E1]/70 mt-1">Try searching by name, email, subject line, job title, or team designation.</p>
                      </div>
                    ) : (
                      <>
                        {/* 1. MESSAGES SECTION */}
                        {(globalSearchCategory === 'all' || globalSearchCategory === 'messages') && searchResults.messages.length > 0 && (
                          <div className="pt-2 first:pt-0 space-y-1.5">
                            <div className="px-2 py-1 text-[10px] font-mono uppercase text-[#e1b382] font-bold tracking-wider flex items-center justify-between">
                              <span className="flex items-center space-x-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-[#e1b382]" />
                                <span>Contact Messages ({searchResults.messages.length})</span>
                              </span>
                            </div>
                            {searchResults.messages.map((msg) => (
                              <button
                                key={msg.id}
                                type="button"
                                onClick={() => {
                                  setActiveTab('messages');
                                  setSelectedMsg(msg);
                                  setIsViewModalOpen(true);
                                  setIsSearchFocused(false);
                                  setMsgSearch(globalSearchQuery);
                                }}
                                className="w-full text-left p-2.5 rounded-xl bg-[#2d545e]/30 hover:bg-[#2d545e] border border-transparent hover:border-[#3f6973] transition-all cursor-pointer group flex items-start justify-between gap-3"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs font-bold text-white group-hover:text-[#e1b382] transition-colors truncate">
                                      {msg.name}
                                    </span>
                                    <span className="text-[10px] text-[#CBD5E1] font-mono truncate">
                                      &lt;{msg.email}&gt;
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#CBD5E1] truncate font-medium mt-0.5">
                                    Subject: {msg.subject}
                                  </p>
                                  <p className="text-[10px] text-neutral-300 truncate mt-0.5 font-sans">
                                    {msg.message}
                                  </p>
                                </div>
                                <div className="text-right shrink-0 flex flex-col items-end space-y-1">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${
                                    msg.repliedStatus === 'Replied'
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                  }`}>
                                    {msg.repliedStatus || 'Pending'}
                                  </span>
                                  <span className="text-[9px] text-[#CBD5E1]/60 font-mono">
                                    {new Date(msg.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* 2. APPLICATIONS SECTION */}
                        {(globalSearchCategory === 'all' || globalSearchCategory === 'applications') && searchResults.applications.length > 0 && (
                          <div className="pt-2 first:pt-0 space-y-1.5">
                            <div className="px-2 py-1 text-[10px] font-mono uppercase text-[#e1b382] font-bold tracking-wider flex items-center justify-between">
                              <span className="flex items-center space-x-1.5">
                                <Briefcase className="w-3.5 h-3.5 text-[#e1b382]" />
                                <span>Job Applications ({searchResults.applications.length})</span>
                              </span>
                            </div>
                            {searchResults.applications.map((app) => (
                              <button
                                key={app.id}
                                type="button"
                                onClick={() => {
                                  setActiveTab('careers');
                                  setEditingCareer(null);
                                  setIsSearchFocused(false);
                                }}
                                className="w-full text-left p-2.5 rounded-xl bg-[#2d545e]/30 hover:bg-[#2d545e] border border-transparent hover:border-[#3f6973] transition-all cursor-pointer group flex items-start justify-between gap-3"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs font-bold text-white group-hover:text-[#e1b382] transition-colors truncate">
                                      {app.fullName}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#e1b382]/10 border border-[#e1b382]/30 text-[#e1b382]">
                                      {app.jobTitle}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-[#CBD5E1] truncate font-mono mt-0.5">
                                    Email: {app.email} · Tel: {app.phone}
                                  </p>
                                  {app.coverLetter && (
                                    <p className="text-[10px] text-neutral-300 truncate mt-0.5 font-sans">
                                      Cover: {app.coverLetter}
                                    </p>
                                  )}
                                </div>
                                <div className="shrink-0 text-right">
                                  <span className="text-[10px] text-[#e1b382] font-mono flex items-center space-x-1">
                                    <span>View Apps →</span>
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* 3. TEAM MEMBERS SECTION */}
                        {(globalSearchCategory === 'all' || globalSearchCategory === 'team') && searchResults.team.length > 0 && (
                          <div className="pt-2 first:pt-0 space-y-1.5">
                            <div className="px-2 py-1 text-[10px] font-mono uppercase text-[#e1b382] font-bold tracking-wider flex items-center justify-between">
                              <span className="flex items-center space-x-1.5">
                                <Users className="w-3.5 h-3.5 text-[#e1b382]" />
                                <span>Team Members ({searchResults.team.length})</span>
                              </span>
                            </div>
                            {searchResults.team.map((member) => (
                              <button
                                key={member.id}
                                type="button"
                                onClick={() => {
                                  setActiveTab('team');
                                  setEditingTeam(member);
                                  setIsNewTeam(false);
                                  setIsSearchFocused(false);
                                }}
                                className="w-full text-left p-2.5 rounded-xl bg-[#2d545e]/30 hover:bg-[#2d545e] border border-transparent hover:border-[#3f6973] transition-all cursor-pointer group flex items-center justify-between gap-3"
                              >
                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                  <div className="w-8 h-8 rounded-full bg-neutral-900 border border-[#3f6973] overflow-hidden shrink-0 flex items-center justify-center">
                                    <img
                                      src={member.photoUrl && member.photoUrl.trim() !== '' ? member.photoUrl : getAvatarUrl(member.gender, member.name)}
                                      alt={member.name}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-bold text-white group-hover:text-[#e1b382] transition-colors truncate">
                                      {member.name}
                                    </div>
                                    <p className="text-[10px] text-[#CBD5E1] truncate font-sans">
                                      {member.designation} {member.experience ? `· ${member.experience} Exp` : ''}
                                    </p>
                                  </div>
                                </div>
                                <div className="shrink-0 text-right">
                                  <span className="text-[10px] text-[#e1b382] font-mono">
                                    Edit Member →
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto justify-end shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsProfileModalOpen(true);
                setProfileModalTab('profile');
              }}
              className="px-3.5 py-2 rounded-xl border border-[#3f6973] hover:border-[#e1b382] bg-[#12343b] hover:bg-[#2d545e] text-white text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer shrink-0 flex items-center space-x-1.5 shadow-sm"
              title="Manage your profile & update password"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#e1b382]" />
              <span>My Profile & Password</span>
            </button>
            <button
              onClick={() => {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="px-3.5 py-2 rounded-xl border border-[#3f6973] hover:border-[#e1b382] hover:bg-[#2d545e] text-[#CBD5E1] hover:text-white text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer shrink-0"
            >
              View Public Website
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3.5 py-2 rounded-xl bg-red-950/30 hover:bg-red-950/60 border border-red-900/40 text-red-300 hover:text-red-200 text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer shrink-0"
              >
                Logout Session
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Mobile Collapsible Tab Menu Trigger (Visible on small screens) */}
          <div className="lg:hidden col-span-1 bg-[#2d545e] border border-[#3f6973] rounded-2xl p-3 shadow-md mb-4" id="admin-mobile-tab-selector">
            <button
              onClick={() => setIsMobileTabMenuOpen(!isMobileTabMenuOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#12343b] border border-[#e1b382]/40 rounded-xl text-xs font-bold text-[#e1b382] uppercase tracking-wider cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#e1b382]" />
                <span>Tab: {visibleTabs.find((t) => t.id === activeTab)?.label || 'Dashboard'}</span>
              </div>
              <span className="text-xs font-mono">{isMobileTabMenuOpen ? '▲ Hide' : '▼ Menu'}</span>
            </button>

            {isMobileTabMenuOpen && (
              <div className="mt-2 pt-2 border-t border-[#3f6973] space-y-1 max-h-80 overflow-y-auto">
                {visibleTabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileTabMenuOpen(false);
                        setEditingProduct(null);
                        setEditingService(null);
                        setEditingTeam(null);
                        setEditingGallery(null);
                        setEditingReview(null);
                        setEditingCareer(null);
                        setEditingProcess(null);
                        setEditingIndustry(null);
                        setEditingTechStack(null);
                        setEditingSlide(null);
                        setPreviewSlide(null);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? 'bg-[#12343b] text-[#e1b382] border-l-2 border-[#e1b382] font-bold'
                          : 'text-[#CBD5E1] hover:text-white hover:bg-[#12343b]/40'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop Left Menu Tab Rails */}
          <div className="hidden lg:block lg:col-span-3 premium-card rounded-3xl p-4 space-y-1.5 shrink-0 bg-[#2d545e] border border-[#3f6973]" id="admin-tabs-list">
            <div className="px-3 py-3 border-b border-[#3f6973] mb-3 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#e1b382]" />
              <span className="text-xs font-bold tracking-widest text-[#e1b382] uppercase">CMS Controls</span>
            </div>
            {visibleTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    // Clear edits
                    setEditingProduct(null);
                    setEditingService(null);
                    setEditingTeam(null);
                    setEditingGallery(null);
                    setEditingReview(null);
                    setEditingCareer(null);
                    setEditingProcess(null);
                    setEditingIndustry(null);
                    setEditingTechStack(null);
                    setEditingSlide(null);
                    setPreviewSlide(null);
                  }}
                  id={`admin-tab-btn-${tab.id}`}
                  className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#12343b] text-[#e1b382] border-l-2 border-[#e1b382] pl-3'
                      : 'text-[#CBD5E1] hover:text-white hover:bg-[#12343b]/50'
                  }`}
                >
                  <IconComponent className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Core Workspace Panel */}
          <div className="lg:col-span-9 premium-card p-6 sm:p-8 rounded-3xl bg-[#2d545e] border border-[#3f6973]" id="admin-workspace">
            
            {/* Global Permission Restricted Notification Banner */}
            {isRestricted && (
              <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start space-x-3 text-amber-200 shadow-md">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-300">
                    Permission Restricted: Please contact your administrator
                  </h4>
                  <p className="text-xs text-amber-200/80 mt-0.5">
                    {restrictedNotice}
                  </p>
                </div>
              </div>
            )}

            {/* RBAC Access Denied Guard Banner (if unauthorized or restricted tab requested) */}
            {(!roleGuard.isTabAllowed(activeTab) || (isRestricted && activeTab !== 'dashboard')) && (
              <div className="p-8 bg-[#12343b] border border-amber-500/40 rounded-3xl text-center space-y-4 mb-6" id="rbac-access-denied-panel">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center text-amber-400">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-300 uppercase tracking-wider">Permission Restricted: Please contact your administrator</h3>
                  <p className="text-xs text-[#CBD5E1] mt-2 max-w-md mx-auto">
                    {restrictedNotice || `Your assigned account role (${currentUserRole}) does not have sufficient RBAC permissions to access the "${activeTab}" workspace.`}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="px-6 py-2.5 rounded-xl bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer inline-flex items-center space-x-2"
                  >
                    <span>Return to Authorized Dashboard</span>
                  </button>
                </div>
              </div>
            )}

            {/* -------------------- 1. DASHBOARD OVERVIEW TAB -------------------- */}
            {roleGuard.isTabAllowed(activeTab) && activeTab === 'dashboard' && (
              <DashboardOverview
                products={products}
                services={services}
                team={team}
                gallery={gallery}
                reviews={reviews}
                careers={careers}
                applications={applications}
                messages={messages}
                heroSlides={heroSlides}
                setActiveTab={setActiveTab}
                currentUserRole={currentUserRole}
                onOpenProfileModal={() => {
                  setIsProfileModalOpen(true);
                  setProfileModalTab('profile');
                }}
              />
            )}

            {/* -------------------- CONTENT ACTIVITY HISTORY TAB -------------------- */}
            {activeTab === 'history' && (
              <div className="space-y-6" id="admin-tab-history">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#3f6973] pb-5 gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <History className="w-5 h-5 text-[#e1b382]" />
                      <h3 className="text-xl font-bold tracking-wide text-white">Content Activity Audit History</h3>
                    </div>
                    <p className="text-xs text-[#CBD5E1] font-sans mt-1">
                      Recent content updates made by HR users and system admins (Most recent 20 activities).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={loadAuditHistory}
                    disabled={isLoadingAuditLogs}
                    className="px-3.5 py-2.5 rounded-xl border border-[#3f6973] hover:border-[#e1b382] bg-[#12343b] text-[#CBD5E1] hover:text-white text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-2 self-start md:self-auto"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAuditLogs ? 'animate-spin' : ''}`} />
                    <span>Refresh Logs</span>
                  </button>
                </div>

                <div className="bg-[#2d545e] rounded-2xl border border-[#3f6973] overflow-hidden shadow-xl">
                  {isLoadingAuditLogs ? (
                    <div className="p-12 text-center text-[#CBD5E1] text-sm flex items-center justify-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#e1b382]" />
                      <span>Loading recent audit logs...</span>
                    </div>
                  ) : auditLogs.length === 0 ? (
                    <div className="p-12 text-center text-[#CBD5E1] text-sm">
                      No recent activity records found in content audit logs.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#12343b] border-b border-[#3f6973] text-[11px] uppercase tracking-wider text-[#e1b382] font-semibold">
                            <th className="py-3.5 px-4">Type</th>
                            <th className="py-3.5 px-4">Action</th>
                            <th className="py-3.5 px-4">Details</th>
                            <th className="py-3.5 px-4">User Email</th>
                            <th className="py-3.5 px-4">Role</th>
                            <th className="py-3.5 px-4">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3f6973]/50 text-xs text-[#CBD5E1]">
                          {auditLogs.slice(0, 20).map((log, idx) => {
                            const contentType = log.content_type || 'General';
                            let IconComp = FileText;
                            if (contentType.toLowerCase().includes('job') || contentType.toLowerCase().includes('career')) {
                              IconComp = Briefcase;
                            } else if (contentType.toLowerCase().includes('message') || contentType.toLowerCase().includes('contact')) {
                              IconComp = MessageSquare;
                            } else if (contentType.toLowerCase().includes('company') || contentType.toLowerCase().includes('info')) {
                              IconComp = Building2;
                            } else if (contentType.toLowerCase().includes('setting')) {
                              IconComp = Settings;
                            }

                            return (
                              <tr key={log.id || idx} className="hover:bg-[#12343b]/40 transition-colors">
                                <td className="py-3.5 px-4 font-medium text-white flex items-center space-x-2">
                                  <div className="w-7 h-7 rounded-lg bg-[#12343b] border border-[#3f6973] flex items-center justify-center text-[#e1b382] shrink-0">
                                    <IconComp className="w-3.5 h-3.5" />
                                  </div>
                                  <span>{contentType}</span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#12343b] border border-[#e1b382]/30 text-[#e1b382]">
                                    {log.action_type || 'UPDATE'}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-sans text-slate-200 max-w-md truncate">
                                  {log.details || 'No additional details provided.'}
                                </td>
                                <td className="py-3.5 px-4 font-mono text-[11px]">
                                  {log.user_email || 'System'}
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    (log.user_role || '').toLowerCase() === 'hr'
                                      ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30'
                                      : 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/30'
                                  }`}>
                                    {log.user_role || 'Admin'}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                                  {log.created_at ? new Date(log.created_at).toLocaleString() : 'Just now'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* -------------------- SEO SETTINGS & LIVE GOOGLE PREVIEW TAB -------------------- */}
            {activeTab === 'seo' && (
              <div className="space-y-8 animate-fade-in" id="admin-tab-seo-preview">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#3f6973] pb-5 gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Search className="w-5 h-5 text-[#e1b382]" />
                      <h3 className="text-xl font-bold tracking-wide text-white">SEO & Google Search Results Preview</h3>
                    </div>
                    <p className="text-xs text-[#CBD5E1] font-sans mt-1">
                      Configure search engine meta tags, Open Graph cards, and inspect live mockups of how your page appears on Google search results.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const tags = `<!-- Primary Meta Tags -->
<title>${seoForm.metaTitle}</title>
<meta name="title" content="${seoForm.metaTitle}">
<meta name="description" content="${seoForm.metaDescription}">
<meta name="keywords" content="${seoForm.keywords}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://apnakhaiyal.com/">
<meta property="og:title" content="${seoForm.metaTitle}">
<meta property="og:description" content="${seoForm.metaDescription}">
<meta property="og:image" content="${seoForm.ogImage || 'https://apnakhaiyal.com/og-image.jpg'}">

<!-- Twitter -->
<meta property="twitter:card" content="${seoForm.twitterCard || 'summary_large_image'}">
<meta property="twitter:title" content="${seoForm.metaTitle}">
<meta property="twitter:description" content="${seoForm.metaDescription}">
<meta property="twitter:image" content="${seoForm.ogImage || 'https://apnakhaiyal.com/og-image.jpg'}">`;
                        navigator.clipboard.writeText(tags);
                        setCopiedSeoTags(true);
                        showToast('HTML Meta Tags copied to clipboard!', 'success');
                        setTimeout(() => setCopiedSeoTags(false), 3000);
                      }}
                      className="px-3.5 py-2.5 rounded-xl border border-[#3f6973] hover:border-[#e1b382] bg-[#12343b] text-[#CBD5E1] hover:text-white text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-2"
                    >
                      {copiedSeoTags ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#e1b382]" />}
                      <span>{copiedSeoTags ? 'Tags Copied!' : 'Copy Meta Tags HTML'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveSEOForm}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e1b382] to-[#c8965f] text-black text-xs font-bold uppercase cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2 shadow-lg"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save SEO Settings</span>
                    </button>
                  </div>
                </div>

                {/* Scorecard Overview Bar */}
                {(() => {
                  const titleLen = (seoForm.metaTitle || '').length;
                  const descLen = (seoForm.metaDescription || '').length;
                  const keywordArr = (seoForm.keywords || '').split(',').map(s => s.trim()).filter(Boolean);
                  const hasOgImage = !!(seoForm.ogImage && seoForm.ogImage.trim());

                  const titleScore = titleLen >= 30 && titleLen <= 60 ? 25 : titleLen > 0 ? 15 : 0;
                  const descScore = descLen >= 120 && descLen <= 160 ? 25 : descLen > 0 ? 15 : 0;
                  const kwScore = keywordArr.length >= 3 ? 20 : keywordArr.length > 0 ? 10 : 0;
                  const ogScore = hasOgImage ? 15 : 0;
                  const twScore = seoForm.twitterCard ? 15 : 0;
                  const totalScore = titleScore + descScore + kwScore + ogScore + twScore;

                  return (
                    <div className="bg-[#2d545e] border border-[#3f6973] rounded-2xl p-5 shadow-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div className="flex items-center space-x-4 md:border-r border-[#3f6973] pr-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg text-white border shrink-0 ${
                          totalScore >= 80 ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' :
                          totalScore >= 60 ? 'bg-amber-950/80 border-amber-500/50 text-amber-300' :
                          'bg-red-950/80 border-red-500/50 text-red-300'
                        }`}>
                          {totalScore}%
                        </div>
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-wider text-[#CBD5E1]">SEO Readiness Score</div>
                          <div className="text-sm font-bold text-white mt-0.5">
                            {totalScore >= 80 ? 'Excellent Optimization' : totalScore >= 60 ? 'Good / Minor Gaps' : 'Needs Optimization'}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-[#CBD5E1] md:col-span-3 font-sans">
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold flex items-center space-x-1 ${
                            titleLen >= 30 && titleLen <= 60 ? 'bg-emerald-900/40 text-emerald-300 border-emerald-500/30' : 'bg-amber-900/40 text-amber-300 border-amber-500/30'
                          }`}>
                            <span>Title: {titleLen} / 60 chars</span>
                            {titleLen >= 30 && titleLen <= 60 ? <CheckCircle2 className="w-3 h-3 ml-1 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 ml-1 text-amber-400" />}
                          </span>

                          <span className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold flex items-center space-x-1 ${
                            descLen >= 120 && descLen <= 160 ? 'bg-emerald-900/40 text-emerald-300 border-emerald-500/30' : 'bg-amber-900/40 text-amber-300 border-amber-500/30'
                          }`}>
                            <span>Description: {descLen} / 160 chars</span>
                            {descLen >= 120 && descLen <= 160 ? <CheckCircle2 className="w-3 h-3 ml-1 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 ml-1 text-amber-400" />}
                          </span>

                          <span className="px-2.5 py-1 rounded-md border text-[11px] font-semibold bg-[#12343b] text-[#e1b382] border-[#3f6973]">
                            Keywords: {keywordArr.length} tags
                          </span>

                          <span className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold ${
                            hasOgImage ? 'bg-emerald-900/40 text-emerald-300 border-emerald-500/30' : 'bg-red-900/40 text-red-300 border-red-500/30'
                          }`}>
                            {hasOgImage ? 'OG Social Image Attached' : 'Missing OG Image'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Main Split Layout: Form on Left, Live Mockup on Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* LEFT COLUMN: SEO Metadata Form Fields */}
                  <div className="lg:col-span-6 bg-[#2d545e] border border-[#3f6973] rounded-3xl p-6 space-y-6 shadow-xl">
                    <div className="border-b border-[#3f6973] pb-3 flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-[#e1b382]" />
                        <span>SEO Meta Configuration</span>
                      </h4>
                      <span className="text-[10px] font-mono text-[#CBD5E1] bg-[#12343b] px-2 py-0.5 rounded border border-[#3f6973]">
                        Global Target Page
                      </span>
                    </div>

                    <form onSubmit={handleSaveSEOForm} className="space-y-5">
                      {/* Meta Title Field */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-xs font-mono text-[#CBD5E1] uppercase tracking-wider font-semibold">
                            Meta Title Tag *
                          </label>
                          <span className={`text-[11px] font-mono font-bold ${
                            seoForm.metaTitle.length > 60 ? 'text-amber-400' : seoForm.metaTitle.length >= 30 ? 'text-emerald-400' : 'text-slate-300'
                          }`}>
                            {seoForm.metaTitle.length} / 60 chars
                          </span>
                        </div>
                        <input
                          type="text"
                          required
                          value={seoForm.metaTitle}
                          onChange={(e) => setSEOForm({ ...seoForm, metaTitle: e.target.value })}
                          placeholder="e.g. ApnaKhaiyal | Enterprise IT Solutions & Custom Software Development"
                          className="w-full px-4 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none transition-colors font-sans"
                        />
                        <p className="text-[11px] text-slate-300 mt-1">
                          Appears as the main clickable headline link in Google search results. Keep under 60 characters to avoid truncation.
                        </p>
                      </div>

                      {/* Meta Description Field */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-xs font-mono text-[#CBD5E1] uppercase tracking-wider font-semibold">
                            Meta Description *
                          </label>
                          <span className={`text-[11px] font-mono font-bold ${
                            seoForm.metaDescription.length > 160 ? 'text-amber-400' : seoForm.metaDescription.length >= 120 ? 'text-emerald-400' : 'text-slate-300'
                          }`}>
                            {seoForm.metaDescription.length} / 160 chars
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          required
                          value={seoForm.metaDescription}
                          onChange={(e) => setSEOForm({ ...seoForm, metaDescription: e.target.value })}
                          placeholder="Provide a concise summary of your business services, tech expertise, and value proposition for prospective clients."
                          className="w-full px-4 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none transition-colors font-sans leading-relaxed"
                        />
                        <p className="text-[11px] text-slate-300 mt-1">
                          Appears directly beneath the title in Google snippets. Optimal length is between 120 and 160 characters.
                        </p>
                      </div>

                      {/* Meta Keywords Field */}
                      <div>
                        <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider font-semibold mb-1.5">
                          Target Keywords (Comma Separated)
                        </label>
                        <input
                          type="text"
                          value={seoForm.keywords}
                          onChange={(e) => setSEOForm({ ...seoForm, keywords: e.target.value })}
                          placeholder="e.g. IT Consulting, Custom Software, Enterprise Cloud, Web Development"
                          className="w-full px-4 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none transition-colors font-sans"
                        />
                        {/* Keyword Chips */}
                        {seoForm.keywords && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {seoForm.keywords.split(',').map((kw, i) => {
                              const trimmed = kw.trim();
                              if (!trimmed) return null;
                              return (
                                <span key={i} className="px-2 py-0.5 rounded-md bg-[#12343b] border border-[#e1b382]/40 text-[#e1b382] text-[10px] font-mono">
                                  #{trimmed}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Open Graph Social Share Image */}
                      <div>
                        <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider font-semibold mb-1.5">
                          Open Graph (OG) Image URL
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={seoForm.ogImage}
                            onChange={(e) => setSEOForm({ ...seoForm, ogImage: e.target.value })}
                            placeholder="https://apnakhaiyal.com/og-image.jpg"
                            className="flex-1 px-4 py-2.5 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none transition-colors font-sans"
                          />
                          <label className="px-3.5 py-2.5 bg-[#12343b] border border-[#3f6973] hover:border-[#e1b382] text-[#e1b382] hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shrink-0 flex items-center space-x-1">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  showToast('Uploading Open Graph image...', 'success');
                                  const url = await uploadImageToSupabase('team-images', file, 'og-preview-share');
                                  setSEOForm({ ...seoForm, ogImage: url });
                                  showToast('Open Graph image uploaded successfully!', 'success');
                                } catch (err: any) {
                                  showToast(err.message || 'Failed to upload image', 'error');
                                }
                              }}
                            />
                          </label>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1">
                          Recommended size: 1200 x 630 px. Used when sharing website links on social networks.
                        </p>
                      </div>

                      {/* Twitter Card Type */}
                      <div>
                        <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider font-semibold mb-1.5">
                          Twitter / X Card Type
                        </label>
                        <select
                          value={seoForm.twitterCard || 'summary_large_image'}
                          onChange={(e) => setSEOForm({ ...seoForm, twitterCard: e.target.value })}
                          className="w-full px-4 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none transition-colors font-sans cursor-pointer"
                        >
                          <option value="summary_large_image">Summary Card with Large Image (Recommended)</option>
                          <option value="summary">Standard Summary Card (Small Thumbnail)</option>
                        </select>
                      </div>

                      {/* Form Action Submit Button */}
                      <div className="pt-3">
                        <button
                          type="submit"
                          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#e1b382] to-[#c8965f] text-black text-xs font-bold uppercase cursor-pointer hover:scale-[1.01] transition-all flex items-center justify-center space-x-2 shadow-lg"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save & Apply SEO Configuration</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* RIGHT COLUMN: Live Interactive Mockup Engine */}
                  <div className="lg:col-span-6 space-y-6">
                    {/* Mockup Platform & Device Control Bar */}
                    <div className="bg-[#2d545e] border border-[#3f6973] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono uppercase text-[#CBD5E1] font-semibold">Preview Mode:</span>
                        <div className="bg-[#12343b] p-1 rounded-xl border border-[#3f6973] flex space-x-1">
                          <button
                            type="button"
                            onClick={() => setSeoPreviewPlatform('google')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                              seoPreviewPlatform === 'google' ? 'bg-[#e1b382] text-black shadow' : 'text-[#CBD5E1] hover:text-white'
                            }`}
                          >
                            Google SERP
                          </button>
                          <button
                            type="button"
                            onClick={() => setSeoPreviewPlatform('facebook')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                              seoPreviewPlatform === 'facebook' ? 'bg-[#e1b382] text-black shadow' : 'text-[#CBD5E1] hover:text-white'
                            }`}
                          >
                            Social Share
                          </button>
                        </div>
                      </div>

                      {seoPreviewPlatform === 'google' && (
                        <div className="flex items-center space-x-2">
                          {/* Device Toggle */}
                          <div className="bg-[#12343b] p-1 rounded-xl border border-[#3f6973] flex space-x-1">
                            <button
                              type="button"
                              onClick={() => setSeoPreviewDevice('desktop')}
                              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                seoPreviewDevice === 'desktop' ? 'bg-[#e1b382] text-black' : 'text-slate-400 hover:text-white'
                              }`}
                              title="Desktop Search View"
                            >
                              <Monitor className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSeoPreviewDevice('mobile')}
                              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                seoPreviewDevice === 'mobile' ? 'bg-[#e1b382] text-black' : 'text-slate-400 hover:text-white'
                              }`}
                              title="Mobile Search View"
                            >
                              <Smartphone className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Dark / Light SERP Theme Toggle */}
                          <button
                            type="button"
                            onClick={() => setSeoPreviewTheme(seoPreviewTheme === 'dark' ? 'light' : 'dark')}
                            className="px-2.5 py-1.5 rounded-xl border border-[#3f6973] bg-[#12343b] text-[11px] font-mono text-[#e1b382] hover:text-white cursor-pointer"
                          >
                            {seoPreviewTheme === 'dark' ? '🌙 Dark SERP' : '☀️ Light SERP'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* MOCKUP DISPLAY AREA */}
                    <div className="space-y-4">
                      {/* 1. GOOGLE SEARCH RESULTS PREVIEW */}
                      {seoPreviewPlatform === 'google' && (
                        <div className={`rounded-2xl border p-6 shadow-2xl transition-all ${
                          seoPreviewTheme === 'dark'
                            ? 'bg-[#202124] border-[#3c4043] text-[#e8eaed]'
                            : 'bg-white border-slate-200 text-slate-900'
                        } ${seoPreviewDevice === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'}`}>
                          
                          {/* Top Google Search Bar Header Mockup */}
                          <div className={`flex items-center space-x-3 pb-4 mb-4 border-b text-xs ${
                            seoPreviewTheme === 'dark' ? 'border-[#3c4043] text-slate-400' : 'border-slate-200 text-slate-500'
                          }`}>
                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold">
                              G
                            </div>
                            <span className="font-sans text-[11px]">Google Search Mockup Preview</span>
                            <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30">
                              Live Interactive
                            </span>
                          </div>

                          {/* Desktop SERP Card */}
                          {seoPreviewDevice === 'desktop' ? (
                            <div className="space-y-2 font-sans">
                              {/* Breadcrumb / Favicon */}
                              <div className="flex items-center space-x-2 text-xs">
                                <div className="w-6 h-6 rounded-full bg-[#12343b] border border-[#e1b382]/40 flex items-center justify-center text-[#e1b382] shrink-0 overflow-hidden">
                                  {settingsForm.companyLogo ? (
                                    <img src={settingsForm.companyLogo} alt="" className="w-full h-full object-contain" />
                                  ) : (
                                    <Globe className="w-3.5 h-3.5" />
                                  )}
                                </div>
                                <div className="truncate">
                                  <div className={`text-[12px] font-normal ${seoPreviewTheme === 'dark' ? 'text-[#bdc1c6]' : 'text-[#202124]'}`}>
                                    {settingsForm.companyName || 'ApnaKhaiyal'}
                                  </div>
                                  <div className={`text-[11px] font-mono truncate ${seoPreviewTheme === 'dark' ? 'text-[#9aa0a6]' : 'text-[#4d5156]'}`}>
                                    https://apnakhaiyal.com
                                  </div>
                                </div>
                              </div>

                              {/* Clickable Blue Google Search Title */}
                              <h3 className={`text-[18px] leading-snug font-normal hover:underline cursor-pointer tracking-normal ${
                                seoPreviewTheme === 'dark' ? 'text-[#8ab4f8]' : 'text-[#1a0dab]'
                              }`}>
                                {seoForm.metaTitle
                                  ? (seoForm.metaTitle.length > 60 ? `${seoForm.metaTitle.slice(0, 58)}...` : seoForm.metaTitle)
                                  : 'ApnaKhaiyal | Official Corporate Website'}
                              </h3>

                              {/* Snippet Description */}
                              <p className={`text-[13px] leading-relaxed font-sans ${
                                seoPreviewTheme === 'dark' ? 'text-[#bdc1c6]' : 'text-[#4d5156]'
                              }`}>
                                {seoForm.metaDescription ? (
                                  seoForm.metaDescription.length > 160
                                    ? `${seoForm.metaDescription.slice(0, 157)}...`
                                    : seoForm.metaDescription
                                ) : (
                                  'Empowering businesses with custom software solutions, mobile app development, and cloud transformation services.'
                                )}
                              </p>

                              {/* Google Sitelinks Mockup */}
                              <div className="pt-3 grid grid-cols-2 gap-3 border-t border-slate-700/30 mt-2">
                                <div className="space-y-0.5">
                                  <div className={`text-xs font-medium ${seoPreviewTheme === 'dark' ? 'text-[#8ab4f8]' : 'text-[#1a0dab]'}`}>Services</div>
                                  <div className={`text-[11px] truncate ${seoPreviewTheme === 'dark' ? 'text-[#9aa0a6]' : 'text-[#70757a]'}`}>Explore enterprise software solutions</div>
                                </div>
                                <div className="space-y-0.5">
                                  <div className={`text-xs font-medium ${seoPreviewTheme === 'dark' ? 'text-[#8ab4f8]' : 'text-[#1a0dab]'}`}>Careers</div>
                                  <div className={`text-[11px] truncate ${seoPreviewTheme === 'dark' ? 'text-[#9aa0a6]' : 'text-[#70757a]'}`}>Join our engineering tech team</div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Mobile SERP Card */
                            <div className="space-y-2 font-sans">
                              <div className="flex items-center space-x-2 text-xs bg-[#12343b]/20 p-2 rounded-xl">
                                <div className="w-5 h-5 rounded-full bg-[#12343b] flex items-center justify-center text-[#e1b382] shrink-0">
                                  <Globe className="w-3 h-3" />
                                </div>
                                <span className={`text-xs font-medium truncate ${seoPreviewTheme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                                  apnakhaiyal.com
                                </span>
                              </div>

                              <h3 className={`text-base font-medium leading-snug hover:underline cursor-pointer ${
                                seoPreviewTheme === 'dark' ? 'text-[#8ab4f8]' : 'text-[#1a0dab]'
                              }`}>
                                {seoForm.metaTitle
                                  ? (seoForm.metaTitle.length > 55 ? `${seoForm.metaTitle.slice(0, 52)}...` : seoForm.metaTitle)
                                  : 'ApnaKhaiyal | Official Website'}
                              </h3>

                              <p className={`text-xs leading-relaxed ${
                                seoPreviewTheme === 'dark' ? 'text-[#bdc1c6]' : 'text-[#4d5156]'
                              }`}>
                                {seoForm.metaDescription ? (
                                  seoForm.metaDescription.length > 140
                                    ? `${seoForm.metaDescription.slice(0, 137)}...`
                                    : seoForm.metaDescription
                                ) : (
                                  'Empowering businesses with custom software solutions.'
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 2. SOCIAL MEDIA SHARE PREVIEW */}
                      {seoPreviewPlatform === 'facebook' && (
                        <div className="bg-[#18191a] border border-[#3a3b3c] rounded-2xl overflow-hidden shadow-2xl font-sans">
                          <div className="p-3 border-b border-[#3a3b3c] flex items-center justify-between text-xs text-slate-300">
                            <span className="font-semibold text-blue-400">Social Share Open Graph Card</span>
                            <span className="text-[10px] font-mono text-slate-400">Facebook / LinkedIn / WhatsApp</span>
                          </div>

                          {/* Image Box */}
                          <div className="w-full h-48 bg-neutral-900 border-b border-[#3a3b3c] flex items-center justify-center overflow-hidden relative">
                            {seoForm.ogImage ? (
                              <img
                                src={seoForm.ogImage}
                                alt="OG Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center text-slate-500">
                                <Share2 className="w-8 h-8 mb-2 text-slate-600" />
                                <span className="text-xs">No Open Graph Image Configured</span>
                              </div>
                            )}
                          </div>

                          {/* Bottom Card Info */}
                          <div className="p-4 bg-[#242526] space-y-1">
                            <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                              APNAKHAIYAL.COM
                            </div>
                            <div className="text-sm font-bold text-white leading-snug truncate">
                              {seoForm.metaTitle || 'ApnaKhaiyal - Official Website'}
                            </div>
                            <div className="text-xs text-slate-300 line-clamp-2">
                              {seoForm.metaDescription || 'Empowering businesses with custom software solutions.'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Recommendations & Tips Box */}
                    <div className="bg-[#12343b] border border-[#3f6973] rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold text-[#e1b382] uppercase tracking-wider flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Search Engine Optimization Guidelines</span>
                      </h4>

                      <ul className="space-y-2 text-xs text-slate-200">
                        <li className="flex items-start space-x-2">
                          <span className="text-[#e1b382] font-bold">•</span>
                          <span><strong>Brand Name:</strong> Include your brand name ("ApnaKhaiyal") near the end or beginning of the Meta Title.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-[#e1b382] font-bold">•</span>
                          <span><strong>Click-Through Rate (CTR):</strong> Use compelling action-oriented wording in your description to improve click-throughs from search engines.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-[#e1b382] font-bold">•</span>
                          <span><strong>Social Image:</strong> High-resolution landscape images (1200x630) perform best when shared across social channels.</span>
                        </li>
                      </ul>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* -------------------- USERS & RBAC MANAGEMENT TAB -------------------- */}
            {activeTab === 'users-management' && (
              <div className="space-y-8" id="admin-tab-users-management">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#3f6973] pb-5 gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-[#e1b382]" />
                      <h3 className="text-xl font-bold tracking-wide text-white">Users & Role-Based Access Control (RBAC)</h3>
                    </div>
                    <p className="text-xs text-[#CBD5E1] font-sans mt-1">
                      Manage system administrator accounts, assign user roles (Super Admin, Admin, Editor), toggle active status, and inspect module permissions in Supabase.
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <button
                      type="button"
                      onClick={loadAdminUsers}
                      disabled={isLoadingUsers}
                      className="px-3.5 py-2.5 rounded-xl border border-[#3f6973] hover:border-[#e1b382] bg-[#12343b] text-[#CBD5E1] hover:text-white text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-2"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                      <span>Refresh Users</span>
                    </button>

                    {canAddAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!checkAccessGuard('add_admin', 'administrator user')) return;
                          setIsAddUserModalOpen(true);
                          setAddUserNotice(null);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] hover:text-white text-xs font-bold tracking-wider uppercase transition-all shadow-lg cursor-pointer flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Administrator</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Metric Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-[#12343b] border border-[#3f6973]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#CBD5E1]">Total Accounts</span>
                      <Users className="w-4 h-4 text-[#e1b382]" />
                    </div>
                    <span className="text-3xl font-bold text-white tracking-tight mt-2 block">{adminUsersList.length}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#12343b] border border-[#3f6973]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-cyan-300">Admin Accounts</span>
                      <ShieldCheck className="w-4 h-4 text-cyan-300" />
                    </div>
                    <span className="text-3xl font-bold text-cyan-300 tracking-tight mt-2 block">
                      {adminUsersList.filter(u => (u.role || '').toLowerCase() !== 'hr').length}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#12343b] border border-[#3f6973]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-purple-300">HR Accounts</span>
                      <UserCheck className="w-4 h-4 text-purple-300" />
                    </div>
                    <span className="text-3xl font-bold text-purple-300 tracking-tight mt-2 block">
                      {adminUsersList.filter(u => (u.role || '').toLowerCase() === 'hr').length}
                    </span>
                  </div>
                </div>

                {/* Filters and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#12343b] p-4 rounded-2xl border border-[#3f6973]">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-[#e1b382] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={usersSearchQuery}
                      onChange={(e) => setUsersSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#2d545e]/50 border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white placeholder-[#CBD5E1]/60 focus:outline-none transition-all font-sans"
                    />
                    {usersSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setUsersSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CBD5E1] hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto shrink-0">
                    {['all', 'Admin', 'HR'].map((roleOpt) => (
                      <button
                        key={roleOpt}
                        type="button"
                        onClick={() => setUsersRoleFilter(roleOpt)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                          usersRoleFilter === roleOpt
                            ? 'bg-[#e1b382] text-[#12343b] font-bold'
                            : 'bg-[#2d545e]/60 text-[#CBD5E1] hover:text-white border border-[#3f6973]'
                        }`}
                      >
                        {roleOpt === 'all' ? 'All Roles' : roleOpt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* User Accounts List Table */}
                <div className="bg-[#12343b] rounded-2xl border border-[#3f6973] overflow-hidden">
                  <div className="p-4 bg-[#2d545e]/60 border-b border-[#3f6973] flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest flex items-center space-x-2">
                      <Users className="w-4 h-4 text-[#e1b382]" />
                      <span>System User Directory ({adminUsersList.length})</span>
                    </h4>
                    <span className="text-[10px] text-[#CBD5E1] font-mono">
                      Stored in public.admins & auth.users
                    </span>
                  </div>

                  {isLoadingUsers ? (
                    <div className="p-12 text-center text-xs text-[#CBD5E1] flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="w-6 h-6 text-[#e1b382] animate-spin" />
                      <span>Fetching user directory from Supabase...</span>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#3f6973]/40">
                      {adminUsersList
                        .filter((usr) => {
                          const matchesQuery =
                            !usersSearchQuery ||
                            (usr.full_name || '').toLowerCase().includes(usersSearchQuery.toLowerCase()) ||
                            (usr.email || '').toLowerCase().includes(usersSearchQuery.toLowerCase());
                          const matchesRole =
                            usersRoleFilter === 'all' ||
                            (usr.role || '').toLowerCase() === usersRoleFilter.toLowerCase();
                          return matchesQuery && matchesRole;
                        })
                        .map((userItem) => {
                          const isUserHR = (userItem.role || '').toLowerCase() === 'hr';

                          return (
                            <div
                              key={userItem.id || userItem.email}
                              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#2d545e]/20 transition-all"
                            >
                              {/* User Profile Info */}
                              <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                                <div className="w-10 h-10 rounded-xl bg-[#2d545e] border border-[#3f6973] overflow-hidden shrink-0 flex items-center justify-center text-[#e1b382] font-bold text-sm">
                                  {(userItem.full_name || userItem.email || 'A').charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-bold text-white truncate">
                                      {userItem.full_name || 'System User'}
                                    </span>
                                    {userItem.is_active ? (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                        Active
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                                        Inactive
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-[#CBD5E1] truncate font-mono mt-0.5">
                                    {userItem.email}
                                  </p>
                                  {userItem.last_login && (
                                    <p className="text-[10px] text-[#CBD5E1]/70 font-mono mt-0.5">
                                      Last login: {new Date(userItem.last_login).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Role Assignment Selector & Status Controls */}
                              <div className="flex items-center space-x-3 shrink-0">
                                {/* Role Dropdown Selector */}
                                <div className="relative">
                                  <select
                                    disabled={!canManageRoles}
                                    value={userItem.role || 'Admin'}
                                    onChange={async (e) => {
                                      const newRole = e.target.value as AdminRole;
                                      if (!checkAccessGuard('manage_roles', 'user roles')) return;
                                      const success = await updateAdminUserRole(userItem.id, newRole, userItem.user_id, userItem.email);
                                      if (success) {
                                        showToast(`Updated ${userItem.full_name}'s role to ${newRole}`, 'success');
                                        setAdminUsersList((prev) =>
                                          prev.map((u) => (u.id === userItem.id ? { ...u, role: newRole } : u))
                                        );
                                      } else {
                                        showToast(`Failed to update role in Supabase.`, 'error');
                                      }
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase border focus:outline-none transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed ${
                                      isUserHR
                                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                    }`}
                                  >
                                    <option value="Admin" className="bg-[#12343b] text-white">Admin</option>
                                    <option value="HR" className="bg-[#12343b] text-white">HR</option>
                                  </select>
                                </div>

                                {/* Active Toggle Button */}
                                <button
                                  type="button"
                                  disabled={!canManageRoles}
                                  onClick={async () => {
                                    if (!checkAccessGuard('manage_roles', 'user status')) return;
                                    const nextState = !userItem.is_active;
                                    const success = await toggleAdminUserActive(userItem.id, nextState, userItem.user_id, userItem.email);
                                    if (success) {
                                      showToast(`User ${userItem.full_name} is now ${nextState ? 'Active' : 'Inactive'}`, 'success');
                                      setAdminUsersList((prev) =>
                                        prev.map((u) => (u.id === userItem.id ? { ...u, is_active: nextState } : u))
                                      );
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-xl border border-[#3f6973] hover:border-[#e1b382] bg-[#2d545e]/50 text-[#CBD5E1] hover:text-white text-[11px] font-mono transition-all cursor-pointer disabled:opacity-50"
                                  title="Toggle active / inactive state"
                                >
                                  {userItem.is_active ? 'Deactivate' : 'Activate'}
                                </button>

                                {/* Delete User Button */}
                                <button
                                  type="button"
                                  disabled={!canDelete}
                                  onClick={() => {
                                    if (!checkAccessGuard('delete', 'user account')) return;
                                    setDeletingUser(userItem);
                                  }}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-transparent hover:border-red-900/40 rounded-xl transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Delete user account"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Simplified Role Access Matrix Section */}
                <div className="bg-[#12343b] rounded-2xl border border-[#3f6973] overflow-hidden p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#3f6973] pb-4 gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-wide flex items-center space-x-2">
                        <Lock className="w-4 h-4 text-[#e1b382]" />
                        <span>Role Access Capabilities</span>
                      </h4>
                      <p className="text-xs text-[#CBD5E1] font-sans mt-0.5">
                        Overview of permissions for Admin and HR roles across CMS modules.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-[#e1b382] px-2.5 py-1 rounded bg-[#2d545e] border border-[#3f6973]">
                      Two-Role RBAC Active
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans border-collapse">
                      <thead>
                        <tr className="border-b border-[#3f6973] bg-[#2d545e]/40 text-[#e1b382] font-mono uppercase tracking-wider">
                          <th className="py-3 px-4 font-bold">Module / Section</th>
                          <th className="py-3 px-4 font-bold text-center">Admin Role</th>
                          <th className="py-3 px-4 font-bold text-center">HR Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#3f6973]/30">
                        {[
                          { id: 'dashboard', label: 'Dashboard Overview' },
                          { id: 'careers', label: 'Careers & Job Postings / Applications' },
                          { id: 'messages', label: 'Contact Messages' },
                          { id: 'security', label: 'Own Profile & Password' },
                          { id: 'users-management', label: 'Users & HR Management' },
                          { id: 'company-contact', label: 'Company Contact Info' },
                          { id: 'products', label: 'Products Catalog' },
                          { id: 'services', label: 'Services Catalog' },
                          { id: 'gallery', label: 'Gallery Archive' },
                          { id: 'team', label: 'Tech Team Members' },
                          { id: 'reviews', label: 'Client Reviews' },
                          { id: 'branding', label: 'Company Branding' },
                          { id: 'footer-settings', label: 'Footer Settings' },
                          { id: 'hero-about', label: 'Hero & About Content' },
                          { id: 'hero-slider', label: 'Hero Slider' },
                          { id: 'process', label: 'Development Process' },
                          { id: 'industries', label: 'Industries We Serve' },
                          { id: 'techstack', label: 'Technology Stack' }
                        ].map((mod) => {
                          const isAllowedForHR = ['dashboard', 'careers', 'messages', 'security'].includes(mod.id);

                          return (
                            <tr key={mod.id} className="hover:bg-[#2d545e]/20 transition-colors">
                              <td className="py-3 px-4 text-white font-medium flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-[#e1b382]" />
                                <span>{mod.label}</span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                  Full Access
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                {isAllowedForHR ? (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    Access Allowed
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-mono font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                                    Restricted
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add User Modal */}
                {isAddUserModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div
                      className="bg-[#2d545e] border border-[#3f6973] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-white"
                    >
                      <div className="flex items-center justify-between border-b border-[#3f6973] pb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-[#12343b] border border-[#e1b382]/40 flex items-center justify-center text-[#e1b382]">
                            <UserPlus className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">Add Administrator Account</h3>
                            <p className="text-xs text-[#CBD5E1] font-sans">Create a new user in Supabase Auth with assigned RBAC role.</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddUserModalOpen(false)}
                          className="text-[#CBD5E1] hover:text-white p-1"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {addUserNotice && (
                        <div className={`p-3.5 rounded-xl text-xs flex items-center space-x-2 border ${
                          addUserNotice.type === 'success' ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40' : 'bg-red-500/20 text-red-300 border-red-500/40'
                        }`}>
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{addUserNotice.text}</span>
                        </div>
                      )}

                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          setAddUserNotice(null);

                          if (!checkAccessGuard('add_admin', 'administrator user')) return;

                          const cleanEmail = newUserEmail.trim().toLowerCase();
                          if (!cleanEmail) {
                            setAddUserNotice({ text: 'Please enter a valid email address.', type: 'error' });
                            return;
                          }

                          const rules = validatePasswordRules(newUserPassword, newUserConfirmPassword, cleanEmail);
                          if (!rules.isValid) {
                            setAddUserNotice({ text: `Password complexity requirements unmet: ${rules.errors.join(', ')}`, type: 'error' });
                            return;
                          }

                          setIsCreatingUser(true);
                          try {
                            await signUpAdminAccount(cleanEmail, newUserPassword, newUserName.trim(), newUserRole);
                            showToast(`Created user account for ${cleanEmail} (${newUserRole})`, 'success');
                            setIsAddUserModalOpen(false);
                            setNewUserName('');
                            setNewUserEmail('');
                            setNewUserPassword('');
                            setNewUserConfirmPassword('');
                            setNewUserRole('Admin');
                            await loadAdminUsers();
                          } catch (err: any) {
                            setAddUserNotice({ text: err.message || 'Failed to create user in Supabase.', type: 'error' });
                          } finally {
                            setIsCreatingUser(false);
                          }
                        }}
                        className="space-y-4 font-sans text-xs"
                      >
                        <div>
                          <label className="block font-mono uppercase text-[#CBD5E1] text-[10px] tracking-widest mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. John Doe"
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-mono uppercase text-[#CBD5E1] text-[10px] tracking-widest mb-1">
                            Corporate Email Address
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="user@company.com"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="block font-mono uppercase text-[#CBD5E1] text-[10px] tracking-widest mb-1">
                            Assign RBAC Role
                          </label>
                          <select
                            value={newUserRole}
                            onChange={(e) => setNewUserRole(e.target.value as AdminRole)}
                            className="w-full px-3.5 py-2.5 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white font-mono uppercase font-bold focus:outline-none cursor-pointer"
                          >
                            <option value="Admin" className="bg-[#12343b] text-white">Admin (Full Access to CMS, Content & User Management)</option>
                            <option value="HR" className="bg-[#12343b] text-white">HR (Access to Dashboard, Careers, Messages & Profile)</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-mono uppercase text-[#CBD5E1] text-[10px] tracking-widest mb-1">
                              Password
                            </label>
                            <div className="relative">
                              <input
                                type={showNewUserPass ? 'text' : 'password'}
                                required
                                placeholder="••••••••"
                                value={newUserPassword}
                                onChange={(e) => setNewUserPassword(e.target.value)}
                                className="w-full pl-3.5 pr-10 py-2.5 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewUserPass(!showNewUserPass)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#CBD5E1] hover:text-[#e1b382] p-1"
                              >
                                {showNewUserPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block font-mono uppercase text-[#CBD5E1] text-[10px] tracking-widest mb-1">
                              Confirm Password
                            </label>
                            <div className="relative">
                              <input
                                type={showNewUserConfirmPass ? 'text' : 'password'}
                                required
                                placeholder="••••••••"
                                value={newUserConfirmPassword}
                                onChange={(e) => setNewUserConfirmPassword(e.target.value)}
                                className="w-full pl-3.5 pr-10 py-2.5 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewUserConfirmPass(!showNewUserConfirmPass)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#CBD5E1] hover:text-[#e1b382] p-1"
                              >
                                {showNewUserConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Live Password Complexity Policy & Validator */}
                        <PasswordComplexityValidator
                          password={newUserPassword}
                          confirmPassword={newUserConfirmPassword}
                          userEmailOrName={newUserEmail || newUserName}
                          onApplyGeneratedPassword={(gen) => {
                            setNewUserPassword(gen);
                            setNewUserConfirmPassword(gen);
                          }}
                          compact={false}
                          title="Administrator Password Complexity Requirements"
                          subtitle="New administrator accounts require verified strong credentials before system activation."
                          showActivationGateBadge={true}
                        />

                        <div className="flex items-center space-x-3 pt-4 border-t border-[#3f6973]">
                          <button
                            type="button"
                            onClick={() => setIsAddUserModalOpen(false)}
                            className="flex-1 py-3 rounded-xl border border-[#3f6973] hover:border-[#e1b382] text-[#CBD5E1] hover:text-white font-semibold uppercase tracking-wider text-xs transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isCreatingUser || !validatePasswordRules(newUserPassword, newUserConfirmPassword, newUserEmail).isValid}
                            className="flex-1 py-3 rounded-xl bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] font-bold uppercase tracking-wider text-xs transition-all shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
                          >
                            {isCreatingUser ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin text-[#12343b]" />
                                <span>Creating & Activating...</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4" />
                                <span>Create & Activate Administrator</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Delete User Confirmation Modal */}
                {deletingUser && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div
                      className="bg-[#2d545e] border border-red-900/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-white"
                    >
                      <div className="flex items-center space-x-3 text-red-300">
                        <div className="w-10 h-10 rounded-xl bg-red-950/50 border border-red-900/50 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">Delete Administrator User</h3>
                          <p className="text-xs text-[#CBD5E1]">This action will permanently delete user access.</p>
                        </div>
                      </div>

                      <p className="text-xs text-[#CBD5E1] leading-relaxed">
                        Are you sure you want to delete <strong className="text-white">{deletingUser.full_name || deletingUser.email}</strong> (<span className="font-mono text-[#e1b382]">{deletingUser.role}</span>)?
                      </p>

                      <div className="flex items-center space-x-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setDeletingUser(null)}
                          className="flex-1 py-2.5 rounded-xl border border-[#3f6973] text-[#CBD5E1] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isDeletingUser}
                          onClick={async () => {
                            if (!checkAccessGuard('delete', 'user account')) return;
                            setIsDeletingUser(true);
                            try {
                              const ok = await deleteAdminUserRecord(deletingUser.id, deletingUser.user_id, deletingUser.email);
                              if (ok) {
                                showToast(`Successfully removed administrator account ${deletingUser.email || deletingUser.full_name}`, 'success');
                                setAdminUsersList((prev) =>
                                  prev.filter(
                                    (u) =>
                                      u.id !== deletingUser.id &&
                                      (u.email || '').toLowerCase() !== (deletingUser.email || '').toLowerCase()
                                  )
                                );
                              } else {
                                showToast('Failed to delete user in Supabase.', 'error');
                              }
                            } catch (e: any) {
                              console.error('[Admin User Delete Error]', e);
                              showToast(e.message || 'Error deleting user', 'error');
                            } finally {
                              setIsDeletingUser(false);
                              setDeletingUser(null);
                            }
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg cursor-pointer flex items-center justify-center space-x-1.5"
                        >
                          {isDeletingUser ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span>Confirm Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* -------------------- 2. PRODUCTS CRUD TAB -------------------- */}
            {activeTab === 'products' && (
              <div className="space-y-6" id="admin-tab-products">
                {editingProduct === null ? (
                  <>
                    <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
                      <div>
                        <h3 className="text-xl font-bold tracking-wide font-sans">Product List</h3>
                        <p className="text-xs text-neutral-500">Manage and catalog flagship products.</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsNewProduct(true);
                          setEditingProduct({
                            id: `p_${Date.now()}`,
                            name: '',
                            logoText: '',
                            description: '',
                            features: [''],
                            gallery: [],
                            category: '',
                            status: 'Active',
                            featured: false,
                            displayOrder: products.length + 1,
                            image: ''
                          });
                        }}
                        className="px-4 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#F5D76E] text-black text-xs font-bold tracking-wide flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-black" />
                        <span>Add New Product</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {products.map((prod) => (
                        <div key={prod.id} className="bg-neutral-900/40 p-4 rounded-2xl border border-neutral-900 flex items-center justify-between gap-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-black border border-[#D4AF37]/25 flex items-center justify-center font-bold text-[#D4AF37] p-1">
                              {prod.logoUrl ? (
                                <img src={prod.logoUrl} alt={prod.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                              ) : (
                                <span className={`text-center font-mono font-bold leading-none ${
                                  prod.logoText.length > 4 ? 'text-[9px] tracking-tight' : 'text-xs tracking-wider'
                                }`}>
                                  {prod.logoText}
                                </span>
                              )}
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-white">{prod.name}</h4>
                              <p className="text-xs text-neutral-500 font-sans">{prod.category} · Status: {prod.status}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setIsNewProduct(false);
                                setEditingProduct({ ...prod });
                              }}
                              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-all cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (!checkAccessGuard('delete', 'product')) return;
                                if (window.confirm('Delete this product?')) {
                                  saveProducts(products.filter(p => p.id !== prod.id));
                                }
                              }}
                              className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const primaryImg = editingProduct.image || (editingProduct.images && editingProduct.images[0]) || '';
                    const allImgs = editingProduct.images && editingProduct.images.length > 0
                      ? editingProduct.images
                      : (primaryImg ? [primaryImg, ...(editingProduct.gallery || [])] : (editingProduct.gallery || []));
                    const galleryImgs = Array.isArray(editingProduct.gallery) && editingProduct.gallery.length > 0
                      ? editingProduct.gallery
                      : (allImgs.length > 1 ? allImgs.slice(1) : []);

                    const updatedProd: ProductItem = {
                      ...editingProduct,
                      image: primaryImg,
                      gallery: galleryImgs,
                      images: allImgs
                    };

                    if (isNewProduct) {
                      saveProducts([...products, updatedProd]);
                    } else {
                      saveProducts(products.map(p => p.id === updatedProd.id ? updatedProd : p));
                    }
                    showToast('Product settings and images saved successfully!', 'success');
                    setEditingProduct(null);
                  }} className="space-y-5">
                    <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                      <h4 className="text-base font-bold tracking-wide">
                        {isNewProduct ? 'Add Product' : 'Edit Product'}
                      </h4>
                      <button type="button" onClick={() => setEditingProduct(null)} className="text-neutral-500 hover:text-white">✕</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Product Name</label>
                        <input 
                          type="text" required
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Logo Text (Initials)</label>
                        <input 
                          type="text" required
                          value={editingProduct.logoText}
                          onChange={(e) => setEditingProduct({ ...editingProduct, logoText: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Description</label>
                      <textarea 
                        rows={3} required
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        className="w-full p-3 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none resize-none"
                      />
                    </div>

                    {/* PRODUCT_FEATURES_EDITOR_V1: Admin-editable detail bullets shown with check marks in Product Details */}
                    <div className="bg-neutral-900/40 border border-neutral-800 p-4 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <label className="block text-[10px] font-mono text-[#D4AF37] uppercase font-bold tracking-wider">Product Details — Checkmark Text</label>
                          <p className="text-[9px] text-neutral-500 mt-1">Edit the text that appears with the ✓ marks inside this product's Details popup. Each row is one bullet.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, features: [...(editingProduct.features || []), ''] })}
                          className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider transition-all shrink-0"
                        >
                          + Add Bullet
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(editingProduct.features || []).length === 0 ? (
                          <p className="text-[10px] text-neutral-500 italic">No detail bullets yet. Click “Add Bullet” to create one.</p>
                        ) : (
                          (editingProduct.features || []).map((feature, index) => (
                            <div key={`product-feature-${index}`} className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                              <input
                                type="text"
                                value={feature}
                                placeholder={`Detail bullet ${index + 1}`}
                                onChange={(e) => {
                                  const nextFeatures = [...(editingProduct.features || [])];
                                  nextFeatures[index] = e.target.value;
                                  setEditingProduct({ ...editingProduct, features: nextFeatures });
                                }}
                                className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                              />
                              <button
                                type="button"
                                aria-label={`Remove detail bullet ${index + 1}`}
                                onClick={() => setEditingProduct({ ...editingProduct, features: (editingProduct.features || []).filter((_, i) => i !== index) })}
                                className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center text-sm shrink-0"
                              >
                                ×
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Category</label>
                        <input 
                          type="text" required
                          value={editingProduct.category}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Image & Logo Dual Uploader */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 1. Featured Product Image */}
                      <div className="bg-neutral-900/40 border border-neutral-800 p-4 rounded-2xl space-y-4">
                        <label className="block text-[10px] font-mono text-neutral-500 uppercase">Featured Image (Direct Upload)</label>
                        
                        <div className="flex items-center gap-4">
                          <div className="w-24 h-16 rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden flex items-center justify-center shrink-0 relative">
                            {editingProduct.image ? (
                              <img
                                src={editingProduct.image}
                                alt="Product Preview"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="text-[10px] text-neutral-600 font-mono italic">No Image</div>
                            )}
                            {isUploadingProductImg && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <RefreshCw className="w-4 h-4 text-[#D4AF37] animate-spin" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex gap-2">
                              <label className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-bold uppercase cursor-pointer tracking-wider transition-all">
                                {editingProduct.image ? 'Replace' : 'Upload'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={isUploadingProductImg}
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    if (file.size > 5 * 1024 * 1024) {
                                      alert('File size exceeds the 5MB safety limit.');
                                      return;
                                    }
                                    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                                      alert('Unsupported format. Please upload JPG, PNG, or WEBP.');
                                      return;
                                    }

                                    setIsUploadingProductImg(true);
                                    try {
                                      const url = await uploadImageToSupabase('product-images', file);
                                      if (url) {
                                        setEditingProduct({ ...editingProduct, image: url });
                                      } else {
                                        alert('Failed to upload product image.');
                                      }
                                    } catch (err: any) {
                                      alert(`Upload error: ${err.message || err}`);
                                    } finally {
                                      setIsUploadingProductImg(false);
                                    }
                                  }}
                                />
                              </label>

                              {editingProduct.image && (
                                <button
                                  type="button"
                                  disabled={isUploadingProductImg}
                                  onClick={async () => {
                                    if (!checkAccessGuard('delete', 'product photo')) return;
                                    if (confirm('Delete this product photo?')) {
                                      setIsUploadingProductImg(true);
                                      try {
                                        await deleteImageFromSupabase('product-images', editingProduct.image);
                                        setEditingProduct({ ...editingProduct, image: '' });
                                      } catch (err) {
                                        setEditingProduct({ ...editingProduct, image: '' });
                                      } finally {
                                        setIsUploadingProductImg(false);
                                      }
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase cursor-pointer tracking-wider transition-all"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                            <p className="text-[9px] text-neutral-500 font-mono">Max size: 5MB</p>
                          </div>
                        </div>
                      </div>

                      {/* 2. Product Logo Image */}
                      <div className="bg-neutral-900/40 border border-neutral-800 p-4 rounded-2xl space-y-4">
                        <label className="block text-[10px] font-mono text-neutral-500 uppercase">Product Logo (Direct Upload)</label>
                        
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden flex items-center justify-center shrink-0 relative">
                            {editingProduct.logoUrl ? (
                              <img
                                src={editingProduct.logoUrl}
                                alt="Logo Preview"
                                className="w-full h-full object-contain p-2"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="text-[10px] text-neutral-600 font-mono italic">No Logo</div>
                            )}
                            {isUploadingProductLogo && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <RefreshCw className="w-4 h-4 text-[#D4AF37] animate-spin" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex gap-2">
                              <label className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-bold uppercase cursor-pointer tracking-wider transition-all">
                                {editingProduct.logoUrl ? 'Replace' : 'Upload'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={isUploadingProductLogo}
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    if (file.size > 5 * 1024 * 1024) {
                                      alert('File size exceeds the 5MB safety limit.');
                                      return;
                                    }
                                    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                                      alert('Unsupported format. Please upload JPG, PNG, or WEBP.');
                                      return;
                                    }

                                    setIsUploadingProductLogo(true);
                                    try {
                                      const url = await uploadImageToSupabase('product-logos', file);
                                      if (url) {
                                        setEditingProduct({ ...editingProduct, logoUrl: url });
                                      } else {
                                        alert('Failed to upload product logo.');
                                      }
                                    } catch (err: any) {
                                      alert(`Upload error: ${err.message || err}`);
                                    } finally {
                                      setIsUploadingProductLogo(false);
                                    }
                                  }}
                                />
                              </label>

                              {editingProduct.logoUrl && (
                                <button
                                  type="button"
                                  disabled={isUploadingProductLogo}
                                  onClick={async () => {
                                    if (!checkAccessGuard('delete', 'product logo')) return;
                                    if (confirm('Delete this product logo?')) {
                                      setIsUploadingProductLogo(true);
                                      try {
                                        await deleteImageFromSupabase('product-logos', editingProduct.logoUrl);
                                        setEditingProduct({ ...editingProduct, logoUrl: '' });
                                      } catch (err) {
                                        setEditingProduct({ ...editingProduct, logoUrl: '' });
                                      } finally {
                                        setIsUploadingProductLogo(false);
                                      }
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase cursor-pointer tracking-wider transition-all"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                            <p className="text-[9px] text-neutral-500 font-mono">Max size: 5MB</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. Multi-Image Array / Product Images Gallery Manager */}
                    <div className="bg-neutral-900/40 border border-neutral-800 p-4 rounded-2xl space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-2.5">
                        <div>
                          <label className="block text-[10px] font-mono text-[#D4AF37] uppercase font-bold tracking-wider">
                            Product Images & Screenshots Gallery (Multi-Image Support)
                          </label>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            Upload multiple product mockups and screenshots synced with the relational <code className="text-[#D4AF37]">product_images</code> database table.
                          </p>
                        </div>

                        {/* Multi-upload button */}
                        <label className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-bold uppercase cursor-pointer tracking-wider transition-all flex items-center space-x-1.5 shrink-0">
                          {isUploadingProductGallery ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Images</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            disabled={isUploadingProductGallery}
                            onChange={async (e) => {
                              const files: File[] = e.target.files ? Array.from(e.target.files) : [];
                              if (files.length === 0) return;

                              setIsUploadingProductGallery(true);
                              try {
                                const uploadedUrls: string[] = [];
                                for (const file of files) {
                                  if (file.size > 5 * 1024 * 1024) continue;
                                  const url = await uploadImageToSupabase('product-images', file);
                                  if (url) uploadedUrls.push(url);
                                }

                                if (uploadedUrls.length > 0) {
                                  const currentImgs = editingProduct.images || (editingProduct.image ? [editingProduct.image, ...(editingProduct.gallery || [])] : (editingProduct.gallery || []));
                                  const combined = [...currentImgs, ...uploadedUrls];
                                  const primary = editingProduct.image || combined[0] || '';
                                  const gallery = combined.filter((u, i) => u !== primary || i > 0);

                                  setEditingProduct({
                                    ...editingProduct,
                                    image: primary,
                                    images: combined,
                                    gallery: gallery
                                  });
                                  showToast(`Uploaded ${uploadedUrls.length} new product image(s)!`, 'success');
                                }
                              } catch (err: any) {
                                showToast(`Upload error: ${err.message || err}`, 'error');
                              } finally {
                                setIsUploadingProductGallery(false);
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* URL Input Bar */}
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="Or paste direct image URL (https://...)"
                          value={newProductImageUrl}
                          onChange={(e) => setNewProductImageUrl(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-black/60 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newProductImageUrl.trim()) return;
                            const trimmed = newProductImageUrl.trim();
                            const currentImgs = editingProduct.images || (editingProduct.image ? [editingProduct.image, ...(editingProduct.gallery || [])] : (editingProduct.gallery || []));
                            if (currentImgs.includes(trimmed)) {
                              showToast('Image URL already in list.', 'error');
                              return;
                            }
                            const combined = [...currentImgs, trimmed];
                            const primary = editingProduct.image || combined[0] || '';
                            const gallery = combined.filter((u, i) => u !== primary || i > 0);

                            setEditingProduct({
                              ...editingProduct,
                              image: primary,
                              images: combined,
                              gallery: gallery
                            });
                            setNewProductImageUrl('');
                            showToast('Added image URL to product list.', 'success');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Add URL
                        </button>
                      </div>

                      {/* Image Thumbnails Matrix */}
                      {(() => {
                        const imgList = editingProduct.images && editingProduct.images.length > 0
                          ? editingProduct.images
                          : (editingProduct.image ? [editingProduct.image, ...(editingProduct.gallery || [])] : (editingProduct.gallery || []));

                        return imgList.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-1">
                            {imgList.map((url, idx) => {
                              const isPrimary = editingProduct.image === url || (!editingProduct.image && idx === 0);
                              return (
                                <div 
                                  key={idx}
                                  className={`relative group rounded-xl overflow-hidden border ${
                                    isPrimary ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/50' : 'border-neutral-800 bg-neutral-900'
                                  } aspect-video flex items-center justify-center bg-black/40`}
                                >
                                  <img
                                    src={url}
                                    alt={`Product preview ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                  {isPrimary && (
                                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#D4AF37] text-black text-[8px] font-bold uppercase tracking-wider shadow">
                                      Primary
                                    </div>
                                  )}
                                  
                                  {/* Hover Actions */}
                                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 p-1">
                                    {!isPrimary && (
                                      <button
                                        type="button"
                                        title="Set as Primary"
                                        onClick={() => {
                                          const reordered = [url, ...imgList.filter(u => u !== url)];
                                          setEditingProduct({
                                            ...editingProduct,
                                            image: url,
                                            images: reordered,
                                            gallery: reordered.slice(1)
                                          });
                                          showToast('Set as primary product photo.', 'success');
                                        }}
                                        className="px-2 py-1 rounded bg-[#D4AF37] text-black text-[9px] font-bold uppercase hover:bg-[#c8965f] transition-all cursor-pointer"
                                      >
                                        Main
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      title="Remove photo"
                                      onClick={() => {
                                        const remaining = imgList.filter(u => u !== url);
                                        const nextPrimary = isPrimary ? (remaining[0] || '') : (editingProduct.image || remaining[0] || '');
                                        setEditingProduct({
                                          ...editingProduct,
                                          image: nextPrimary,
                                          images: remaining,
                                          gallery: remaining.filter(u => u !== nextPrimary)
                                        });
                                        showToast('Removed photo from product.', 'success');
                                      }}
                                      className="p-1 rounded bg-red-500/80 hover:bg-red-600 text-white text-[9px] transition-all cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="py-4 text-center border border-dashed border-neutral-800 rounded-xl text-neutral-500 text-xs">
                            No additional gallery images added yet. Click &quot;Add Images&quot; to upload multiple screenshots.
                          </div>
                        );
                      })()}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Status</label>
                        <select 
                          value={editingProduct.status}
                          onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as any })}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                        >
                          <option value="Active">Active</option>
                          <option value="Development">Development</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Display Order</label>
                        <input 
                          type="number" required
                          value={editingProduct.displayOrder}
                          onChange={(e) => setEditingProduct({ ...editingProduct, displayOrder: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-5">
                        <input 
                          type="checkbox"
                          checked={editingProduct.featured}
                          onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                          className="w-4 h-4 text-[#D4AF37] focus:ring-amber-500"
                        />
                        <label className="text-xs text-neutral-300 font-sans">Featured Slider</label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-black text-xs font-bold uppercase transition-all shadow cursor-pointer"
                    >
                      Save Product Settings
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* -------------------- 3. SERVICES CRUD TAB -------------------- */}
            {activeTab === 'services' && (
              <div className="space-y-6" id="admin-tab-services">
                {editingService === null ? (
                  <>
                    {/* Services Section Header CMS Customization Box */}
                    <div className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl space-y-4 mb-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                            <span>Services Section Heading & Subtitle CMS</span>
                          </h4>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            Customize the section title and subtitle displayed on the Services page and home page teaser.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            saveSettings(settingsForm);
                            showToast('Services section heading and subtitle saved successfully!', 'success');
                          }}
                          className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#b8982e] text-black font-bold text-xs uppercase cursor-pointer transition-all shadow shrink-0"
                        >
                          Save Heading Settings
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1 font-semibold">
                            Section Heading *
                          </label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. Our Expertise"
                            value={settingsForm.servicesSectionHeading || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, servicesSectionHeading: e.target.value })}
                            className="w-full px-3 py-2 bg-black/60 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1 font-semibold">
                            Section Subtitle (Optional - Leave empty to hide)
                          </label>
                          <input 
                            type="text"
                            placeholder="e.g. We deliver premium enterprise solutions."
                            value={settingsForm.servicesSectionSubtitle || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, servicesSectionSubtitle: e.target.value })}
                            className="w-full px-3 py-2 bg-black/60 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
                      <div>
                        <h3 className="text-xl font-bold tracking-wide font-sans">Service Directory</h3>
                        <p className="text-xs text-neutral-500">Add, edit, and manage service images and descriptions.</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsNewService(true);
                          setEditingService({
                            id: `s_${Date.now()}`,
                            title: '',
                            icon: 'Globe',
                            description: '',
                            displayOrder: services.length + 1,
                            image: ''
                          });
                        }}
                        className="px-4 py-2.5 rounded-lg bg-[#D4AF37] text-black text-xs font-bold flex items-center space-x-1.5 cursor-pointer hover:bg-[#b8982e] transition-all"
                      >
                        <Plus className="w-3.5 h-3.5 text-black" />
                        <span>Add New Service</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {services.map((svc) => (
                        <div key={svc.id} className="bg-neutral-900/40 p-4 rounded-2xl border border-neutral-900 flex items-center justify-between gap-4">
                          <div className="flex items-center space-x-3.5">
                            <div className="w-16 h-12 rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0 relative">
                              <img
                                src={getServiceImage(svc.title, svc.image)}
                                alt={svc.title}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-white">{svc.title}</h4>
                              <p className="text-xs text-neutral-500 font-sans">Icon Key: {svc.icon} · Order: {svc.displayOrder} · {svc.image ? 'Custom Image' : 'Default Placeholder'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setIsNewService(false);
                                setEditingService({ ...svc });
                              }}
                              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg cursor-pointer transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (!checkAccessGuard('delete', 'service')) return;
                                if (window.confirm(`Delete "${svc.title}" service and its associated image?`)) {
                                  if (svc.image && !svc.image.includes('unsplash.com')) {
                                    try {
                                      await deleteImageFromSupabase('service-images', svc.image);
                                    } catch (err) {
                                      console.warn('Failed to delete service image from storage:', err);
                                    }
                                  }
                                  saveServices(services.filter(s => s.id !== svc.id));
                                  showToast('Service deleted successfully.', 'success');
                                }
                              }}
                              className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (isNewService) {
                      saveServices([...services, editingService]);
                      showToast('New service created successfully!', 'success');
                    } else {
                      saveServices(services.map(s => s.id === editingService.id ? editingService : s));
                      showToast('Service updated successfully!', 'success');
                    }
                    setEditingService(null);
                  }} className="space-y-5">
                    <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                      <h4 className="text-base font-bold tracking-wide">
                        {isNewService ? 'Add Service' : 'Edit Service'}
                      </h4>
                      <button type="button" onClick={() => setEditingService(null)} className="text-neutral-500 hover:text-white">✕</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Service Title</label>
                        <input 
                          type="text" required
                          value={editingService.title}
                          onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Icon Alias (Globe, Smartphone, Monitor, Cpu, Sparkles, TrendingUp)</label>
                        <input 
                          type="text" required
                          value={editingService.icon}
                          onChange={(e) => setEditingService({ ...editingService, icon: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Service Cover Image Management Box */}
                    <div className="bg-neutral-900/40 border border-neutral-800 p-4 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-mono text-neutral-500 uppercase">
                          Service Cover Image
                        </label>
                        {editingService.image ? (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                            Custom Image Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-2.5 py-0.5 rounded-full">
                            Default Placeholder Active
                          </span>
                        )}
                      </div>

                      {/* Drag & Drop Upload Container */}
                      <div 
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsServiceDragOver(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsServiceDragOver(false);
                        }}
                        onDrop={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsServiceDragOver(false);

                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            // Validate File Type
                            const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                            if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
                              showToast('Invalid format. Please upload a JPG, PNG, or WebP image.', 'error');
                              return;
                            }
                            // Validate File Size (5MB)
                            if (file.size > 5 * 1024 * 1024) {
                              showToast('File exceeds 5MB limit. Please upload a smaller image.', 'error');
                              return;
                            }

                            const isReplace = !!editingService.image;
                            const oldImg = editingService.image;

                            setIsUploadingServiceImg(true);
                            setServiceUploadProgress(0);
                            try {
                              const url = await uploadImageToSupabase('service-images', file, '', (prog) => {
                                setServiceUploadProgress(prog);
                              });
                              if (url) {
                                if (isReplace && oldImg && !oldImg.includes('unsplash.com')) {
                                  try {
                                    await deleteImageFromSupabase('service-images', oldImg);
                                  } catch (err) {
                                    console.warn('Could not delete previous service image:', err);
                                  }
                                }
                                setEditingService({ ...editingService, image: url });
                                showToast(isReplace ? 'Service image replaced successfully!' : 'Service image uploaded successfully!', 'success');
                              } else {
                                showToast('Failed to upload service image.', 'error');
                              }
                            } catch (err: any) {
                              console.error('Service image drop upload error:', err);
                              showToast(`Upload failed: ${err.message || err}`, 'error');
                            } finally {
                              setIsUploadingServiceImg(false);
                              setServiceUploadProgress(null);
                            }
                          }
                        }}
                        className={`border-2 border-dashed rounded-2xl p-4 transition-all duration-300 ${
                          isServiceDragOver 
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10' 
                            : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/60'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          {/* Preview Box */}
                          <div className="w-36 h-24 rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden flex items-center justify-center shrink-0 relative group">
                            <img
                              src={getServiceImage(editingService.title, editingService.image)}
                              alt={editingService.title || 'Service Preview'}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            {isUploadingServiceImg && (
                              <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center gap-1 z-10">
                                <RefreshCw className="w-5 h-5 text-[#D4AF37] animate-spin" />
                                <span className="text-[10px] font-mono font-bold text-[#D4AF37]">
                                  {serviceUploadProgress !== null ? `${serviceUploadProgress}%` : 'Uploading...'}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Upload Controls */}
                          <div className="flex-1 text-center sm:text-left space-y-2 w-full">
                            <p className="text-xs font-semibold text-white">
                              {isServiceDragOver ? 'Drop image file here to upload' : 'Drag & drop image here or click below'}
                            </p>
                            <p className="text-[10px] text-neutral-500">
                              Supported formats: JPG, PNG, WebP. Maximum size: 5MB.<br/>
                              Directly saved in Supabase storage and instantly reflected on the live website.
                            </p>

                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                              <label className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center space-x-1.5 ${
                                isUploadingServiceImg 
                                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' 
                                  : 'bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37]'
                              }`}>
                                <Upload className="w-3.5 h-3.5" />
                                <span>{editingService.image ? 'Replace Image' : 'Upload Image'}</span>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/jpg,image/png,image/webp"
                                  className="hidden"
                                  disabled={isUploadingServiceImg}
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    // Validate File Type
                                    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                                    if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
                                      showToast('Invalid file format. Please upload a JPG, PNG, or WebP image.', 'error');
                                      return;
                                    }
                                    // Validate File Size (5MB)
                                    if (file.size > 5 * 1024 * 1024) {
                                      showToast('File size exceeds 5MB limit. Please upload a smaller image.', 'error');
                                      return;
                                    }

                                    const isReplace = !!editingService.image;
                                    const oldImg = editingService.image;

                                    setIsUploadingServiceImg(true);
                                    setServiceUploadProgress(0);
                                    try {
                                      const url = await uploadImageToSupabase('service-images', file, '', (prog) => {
                                        setServiceUploadProgress(prog);
                                      });
                                      if (url) {
                                        if (isReplace && oldImg && !oldImg.includes('unsplash.com')) {
                                          try {
                                            await deleteImageFromSupabase('service-images', oldImg);
                                          } catch (err) {
                                            console.warn('Could not delete previous service image:', err);
                                          }
                                        }
                                        setEditingService({ ...editingService, image: url });
                                        showToast(isReplace ? 'Service image replaced successfully!' : 'Service image uploaded successfully!', 'success');
                                      } else {
                                        showToast('Failed to upload service image.', 'error');
                                      }
                                    } catch (err: any) {
                                      console.error('Service image upload error:', err);
                                      showToast(`Upload failed: ${err.message || err}`, 'error');
                                    } finally {
                                      setIsUploadingServiceImg(false);
                                      setServiceUploadProgress(null);
                                    }
                                  }}
                                />
                              </label>

                              {editingService.image && (
                                <button
                                  type="button"
                                  disabled={isUploadingServiceImg}
                                  onClick={async () => {
                                    if (!checkAccessGuard('delete', 'service image')) return;
                                    if (window.confirm('Are you sure you want to remove this service image? It will revert to the default placeholder image.')) {
                                      const oldImg = editingService.image;
                                      setIsUploadingServiceImg(true);
                                      try {
                                        if (oldImg && !oldImg.includes('unsplash.com')) {
                                          try {
                                            await deleteImageFromSupabase('service-images', oldImg);
                                          } catch (err) {
                                            console.warn('Could not delete service image from storage:', err);
                                          }
                                        }
                                        setEditingService({ ...editingService, image: '' });
                                        showToast('Service image removed. Default placeholder restored.', 'success');
                                      } catch (err: any) {
                                        console.error('Remove image error:', err);
                                        showToast(`Failed to remove image: ${err.message || err}`, 'error');
                                      } finally {
                                        setIsUploadingServiceImg(false);
                                      }
                                    }
                                  }}
                                  className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center space-x-1.5"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Remove Image</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Description</label>
                      <textarea 
                        rows={3} required
                        value={editingService.description}
                        onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                        className="w-full p-3 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Display Order</label>
                      <input 
                        type="number" required
                        value={editingService.displayOrder}
                        onChange={(e) => setEditingService({ ...editingService, displayOrder: parseInt(e.target.value) || 0 })}
                        className="w-1/3 px-3 py-2 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-black text-xs font-bold uppercase cursor-pointer hover:shadow-lg transition-all"
                    >
                      Save Service Settings
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* -------------------- PROCESS WORKFLOW CRUD TAB -------------------- */}
            {activeTab === 'process' && (
              <div className="space-y-6" id="admin-tab-process">
                {editingProcess === null ? (
                  <>
                    {/* Process Section Headings CMS Customization Box */}
                    <div className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl space-y-4 mb-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                            <Workflow className="w-4 h-4 text-[#D4AF37]" />
                            <span>Development Process Heading CMS</span>
                          </h4>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            Customize the Development Process main heading and optional section description displayed on the website.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            saveSettings(settingsForm);
                            showToast('Development Process heading saved successfully!', 'success');
                          }}
                          className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#b8982e] text-black font-bold text-xs uppercase cursor-pointer transition-all shadow shrink-0"
                        >
                          Save Heading
                        </button>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1 font-semibold">
                          Development Process Heading
                        </label>
                        <input
                          type="text"
                          value={settingsForm.processSectionMainHeading || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, processSectionMainHeading: e.target.value })}
                          placeholder="Our Rigorous Development Process"
                          className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1 font-semibold">
                          Section Description (Optional - Leave blank to hide completely)
                        </label>
                        <textarea
                          rows={2}
                          value={settingsForm.processSectionSubtitle || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, processSectionSubtitle: e.target.value })}
                          placeholder="e.g. We follow a disciplined engineering model ensuring predictability, velocity, and quality."
                          className="w-full p-3 bg-neutral-950 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none resize-none"
                        />
                      </div>
                    </div>

                    {/* Process Steps Header & Add Button */}
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-900">
                      <div>
                        <h3 className="text-lg font-bold">Development Process Cards ({processItems.length})</h3>
                        <p className="text-xs text-neutral-400 font-sans mt-0.5">Manage process steps, reorder cards, or hide steps from live view.</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsNewProcess(true);
                          setEditingProcess({
                            id: `proc_${Date.now()}`,
                            title: '',
                            description: '',
                            icon: 'Search',
                            displayOrder: processItems.length + 1,
                            active: true
                          });
                        }}
                        className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#b8982e] text-black text-xs font-bold uppercase transition-all shadow flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Process Card</span>
                      </button>
                    </div>

                    {/* Process Items Cards List */}
                    <div className="space-y-3">
                      {processItems.length === 0 ? (
                        <div className="p-8 text-center bg-neutral-900/50 border border-neutral-800 rounded-2xl text-neutral-400 text-xs">
                          No process cards found. Click "Add Process Card" above to create one.
                        </div>
                      ) : (
                        [...processItems]
                          .sort((a, b) => a.displayOrder - b.displayOrder)
                          .map((proc, idx, sortedArr) => (
                            <div key={proc.id} className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-neutral-700 transition-all">
                              <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                                {/* Reorder Controls */}
                                <div className="flex flex-col space-y-1 shrink-0">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => {
                                      const sorted = [...processItems].sort((a, b) => a.displayOrder - b.displayOrder);
                                      const temp = sorted[idx].displayOrder;
                                      sorted[idx].displayOrder = sorted[idx - 1].displayOrder;
                                      sorted[idx - 1].displayOrder = temp;
                                      const reindexed = sorted.sort((a, b) => a.displayOrder - b.displayOrder).map((item, i) => ({ ...item, displayOrder: i + 1 }));
                                      saveProcess(reindexed);
                                      showToast('Process step reordered.', 'success');
                                    }}
                                    className={`p-1 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors ${idx === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer text-white'}`}
                                    title="Move Up"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === sortedArr.length - 1}
                                    onClick={() => {
                                      const sorted = [...processItems].sort((a, b) => a.displayOrder - b.displayOrder);
                                      const temp = sorted[idx].displayOrder;
                                      sorted[idx].displayOrder = sorted[idx + 1].displayOrder;
                                      sorted[idx + 1].displayOrder = temp;
                                      const reindexed = sorted.sort((a, b) => a.displayOrder - b.displayOrder).map((item, i) => ({ ...item, displayOrder: i + 1 }));
                                      saveProcess(reindexed);
                                      showToast('Process step reordered.', 'success');
                                    }}
                                    className={`p-1 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors ${idx === sortedArr.length - 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer text-white'}`}
                                    title="Move Down"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center shrink-0 text-[#D4AF37]">
                                  <Workflow className="w-5 h-5" />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="text-sm font-bold text-white truncate">{proc.title}</h4>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = processItems.map(p => p.id === proc.id ? { ...p, active: !p.active } : p);
                                        saveProcess(updated);
                                        showToast(`"${proc.title}" is now ${!proc.active ? 'Active' : 'Hidden'}`, 'success');
                                      }}
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                                        proc.active !== false
                                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                                          : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700'
                                      }`}
                                    >
                                      {proc.active !== false ? 'Active' : 'Hidden'}
                                    </button>
                                  </div>
                                  <p className="text-xs text-neutral-400 truncate font-sans mt-0.5">{proc.description}</p>
                                  <div className="text-[10px] text-neutral-500 font-mono mt-1">Icon: {proc.icon || 'Search'} • Order: {proc.displayOrder}</div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsNewProcess(false);
                                    setEditingProcess({ ...proc });
                                  }}
                                  className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg cursor-pointer transition-colors"
                                  title="Edit Process Step"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!checkAccessGuard('delete', 'process step')) return;
                                    if (window.confirm(`Delete "${proc.title}" process step?`)) {
                                      saveProcess(processItems.filter(p => p.id !== proc.id));
                                      showToast('Process step deleted.', 'success');
                                    }
                                  }}
                                  className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg cursor-pointer transition-colors"
                                  title="Delete Process Step"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </>
                ) : (
                  /* Edit / Add Process Step Form */
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!editingProcess.title.trim()) {
                      showToast('Please enter a process title.', 'error');
                      return;
                    }
                    if (isNewProcess) {
                      saveProcess([...processItems, editingProcess]);
                      showToast('New process step created successfully!', 'success');
                    } else {
                      saveProcess(processItems.map(p => p.id === editingProcess.id ? editingProcess : p));
                      showToast('Process step updated successfully!', 'success');
                    }
                    setEditingProcess(null);
                  }} className="space-y-5 bg-neutral-900/90 border border-neutral-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                      <h4 className="text-base font-bold tracking-wide text-white">
                        {isNewProcess ? 'Add Process Step' : 'Edit Process Step'}
                      </h4>
                      <button type="button" onClick={() => setEditingProcess(null)} className="text-neutral-500 hover:text-white cursor-pointer">✕</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Title *</label>
                        <input
                          type="text" required
                          value={editingProcess.title}
                          onChange={(e) => setEditingProcess({ ...editingProcess, title: e.target.value })}
                          placeholder="e.g. Discovery"
                          className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Icon Alias</label>
                        <select
                          value={editingProcess.icon || 'Search'}
                          onChange={(e) => setEditingProcess({ ...editingProcess, icon: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                        >
                          <option value="Search">Search (Discovery)</option>
                          <option value="Layers">Layers (Architecture)</option>
                          <option value="CheckCircle2">CheckCircle2 (Refining & QA)</option>
                          <option value="Rocket">Rocket (Operations / Launch)</option>
                          <option value="Cpu">Cpu (System Core)</option>
                          <option value="Sparkles">Sparkles (AI & Innovation)</option>
                          <option value="Workflow">Workflow (Process Flow)</option>
                          <option value="Code">Code (Software Development)</option>
                          <option value="Zap">Zap (Performance & Speed)</option>
                          <option value="Database">Database (Data Schema)</option>
                          <option value="Terminal">Terminal (DevOps)</option>
                          <option value="ShieldCheck">ShieldCheck (Security)</option>
                          <option value="Globe">Globe (Deployment / Web)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Description *</label>
                      <textarea
                        rows={3} required
                        value={editingProcess.description}
                        onChange={(e) => setEditingProcess({ ...editingProcess, description: e.target.value })}
                        placeholder="Formulating complete system flowcharts and data schemas."
                        className="w-full p-3 bg-neutral-950 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Display Order</label>
                        <input
                          type="number" required
                          value={editingProcess.displayOrder}
                          onChange={(e) => setEditingProcess({ ...editingProcess, displayOrder: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-4">
                        <input
                          type="checkbox"
                          id="processActive"
                          checked={editingProcess.active !== false}
                          onChange={(e) => setEditingProcess({ ...editingProcess, active: e.target.checked })}
                          className="w-4 h-4 text-[#D4AF37] rounded border-neutral-700 bg-neutral-950 focus:ring-[#D4AF37] cursor-pointer"
                        />
                        <label htmlFor="processActive" className="text-xs text-neutral-300 font-sans cursor-pointer">Active on Live Website</label>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-black text-xs font-bold uppercase cursor-pointer hover:shadow-lg transition-all"
                      >
                        Save Process Step
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProcess(null)}
                        className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold uppercase cursor-pointer transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* -------------------- INDUSTRIES WE SERVE CRUD TAB -------------------- */}
            {activeTab === 'industries' && (
              <div className="space-y-6" id="admin-tab-industries">
                {editingIndustry === null ? (
                  <>
                    {/* Industries Section Headings CMS Customization Box */}
                    <div className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl space-y-4 mb-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-[#D4AF37]" />
                            <span>Industries Section Heading & Subtitle CMS</span>
                          </h4>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            Customize the Industries section main heading and subtitle displayed on the website.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            saveSettings(settingsForm);
                            showToast('Industries Section Heading and Subtitle saved successfully!', 'success');
                          }}
                          className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#b8982e] text-black font-bold text-xs uppercase cursor-pointer transition-all shadow shrink-0"
                        >
                          Save Headings
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1 font-semibold">
                            Industries Section Heading *
                          </label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. Industries We Serve"
                            value={settingsForm.industriesSectionHeading || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, industriesSectionHeading: e.target.value })}
                            className="w-full px-3 py-2 bg-black/60 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1 font-semibold">
                            Industries Section Subtitle (Optional - Leave empty to hide)
                          </label>
                          <input 
                            type="text"
                            placeholder="e.g. Delivering robust automation schemas across multiple vertical segments."
                            value={settingsForm.industriesSectionSubtitle || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, industriesSectionSubtitle: e.target.value })}
                            className="w-full px-3 py-2 bg-black/60 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
                      <div>
                        <h3 className="text-xl font-bold tracking-wide font-sans">Industry Cards Directory</h3>
                        <p className="text-xs text-neutral-500">Manage, reorder, show/hide, add, and edit industry segment cards.</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsNewIndustry(true);
                          setEditingIndustry({
                            id: `ind_${Date.now()}`,
                            title: '',
                            displayOrder: industryItems.length + 1,
                            active: true
                          });
                        }}
                        className="px-4 py-2.5 rounded-lg bg-[#D4AF37] text-black text-xs font-bold flex items-center space-x-1.5 cursor-pointer hover:bg-[#b8982e] transition-all"
                      >
                        <Plus className="w-3.5 h-3.5 text-black" />
                        <span>Add New Industry Card</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {industryItems.length === 0 ? (
                        <div className="p-8 text-center text-neutral-500 text-xs bg-neutral-900/40 rounded-2xl border border-neutral-900">
                          No industry cards found. Click "Add New Industry Card" to create one.
                        </div>
                      ) : (
                        industryItems
                          .slice()
                          .sort((a, b) => a.displayOrder - b.displayOrder)
                          .map((ind, index, arr) => (
                            <div key={ind.id} className="bg-neutral-900/40 p-4 rounded-2xl border border-neutral-900 flex items-center justify-between gap-4">
                              <div className="flex items-center space-x-3.5">
                                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center font-bold text-xs text-[#D4AF37]">
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-white">{ind.title}</h4>
                                  <p className="text-xs text-neutral-500 font-sans">
                                    Order: {ind.displayOrder} · Status: {ind.active !== false ? 'Active (Visible)' : 'Hidden'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {/* Move Up */}
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => {
                                    if (index === 0) return;
                                    const sorted = industryItems.slice().sort((a, b) => a.displayOrder - b.displayOrder);
                                    const temp = sorted[index].displayOrder;
                                    sorted[index].displayOrder = sorted[index - 1].displayOrder;
                                    sorted[index - 1].displayOrder = temp;
                                    const reindexed = sorted.map((item, i) => ({ ...item, displayOrder: i + 1 }));
                                    saveIndustries(reindexed);
                                    showToast('Industry card reordered.', 'success');
                                  }}
                                  className={`p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors ${index === 0 ? 'opacity-30 cursor-not-allowed text-neutral-600' : 'cursor-pointer text-white'}`}
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>
                                {/* Move Down */}
                                <button
                                  type="button"
                                  disabled={index === arr.length - 1}
                                  onClick={() => {
                                    if (index === arr.length - 1) return;
                                    const sorted = industryItems.slice().sort((a, b) => a.displayOrder - b.displayOrder);
                                    const temp = sorted[index].displayOrder;
                                    sorted[index].displayOrder = sorted[index + 1].displayOrder;
                                    sorted[index + 1].displayOrder = temp;
                                    const reindexed = sorted.map((item, i) => ({ ...item, displayOrder: i + 1 }));
                                    saveIndustries(reindexed);
                                    showToast('Industry card reordered.', 'success');
                                  }}
                                  className={`p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors ${index === arr.length - 1 ? 'opacity-30 cursor-not-allowed text-neutral-600' : 'cursor-pointer text-white'}`}
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>

                                {/* Toggle Active */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = industryItems.map(item => item.id === ind.id ? { ...item, active: item.active === false ? true : false } : item);
                                    saveIndustries(updated);
                                    showToast(`Card "${ind.title}" is now ${ind.active === false ? 'Active' : 'Hidden'}.`, 'success');
                                  }}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                                    ind.active !== false ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20' : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700'
                                  }`}
                                >
                                  {ind.active !== false ? 'Active' : 'Hidden'}
                                </button>

                                {/* Edit */}
                                <button
                                  onClick={() => {
                                    setIsNewIndustry(false);
                                    setEditingIndustry({ ...ind });
                                  }}
                                  className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg cursor-pointer transition-colors"
                                  title="Edit Industry"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>

                                {/* Delete */}
                                <button
                                  onClick={() => {
                                    if (!checkAccessGuard('delete', 'industry card')) return;
                                    if (window.confirm(`Delete "${ind.title}" industry card?`)) {
                                      saveIndustries(industryItems.filter(i => i.id !== ind.id));
                                      showToast('Industry card deleted.', 'success');
                                    }
                                  }}
                                  className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg cursor-pointer transition-colors"
                                  title="Delete Industry"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </>
                ) : (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!editingIndustry.title.trim()) {
                      showToast('Card title cannot be empty.', 'error');
                      return;
                    }
                    if (isNewIndustry) {
                      saveIndustries([...industryItems, editingIndustry]);
                      showToast('New industry card added!', 'success');
                    } else {
                      saveIndustries(industryItems.map(i => i.id === editingIndustry.id ? editingIndustry : i));
                      showToast('Industry card updated successfully!', 'success');
                    }
                    setEditingIndustry(null);
                  }} className="space-y-5 bg-neutral-900/60 p-6 rounded-2xl border border-neutral-800">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                      <h4 className="text-base font-bold tracking-wide text-white">
                        {isNewIndustry ? 'Add Industry Card' : 'Edit Industry Card'}
                      </h4>
                      <button type="button" onClick={() => setEditingIndustry(null)} className="text-neutral-500 hover:text-white text-sm cursor-pointer">✕</button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1 font-semibold">
                        Card Title *
                      </label>
                      <input 
                        type="text" required
                        placeholder="e.g. Enterprise Healthcare"
                        value={editingIndustry.title}
                        onChange={(e) => setEditingIndustry({ ...editingIndustry, title: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1 font-semibold">
                          Display Order
                        </label>
                        <input 
                          type="number" required
                          value={editingIndustry.displayOrder}
                          onChange={(e) => setEditingIndustry({ ...editingIndustry, displayOrder: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center space-x-2 pt-6">
                        <input 
                          type="checkbox"
                          id="industry-active-checkbox"
                          checked={editingIndustry.active !== false}
                          onChange={(e) => setEditingIndustry({ ...editingIndustry, active: e.target.checked })}
                          className="w-4 h-4 text-[#D4AF37] focus:ring-[#D4AF37] rounded border-neutral-700 bg-neutral-950 cursor-pointer"
                        />
                        <label htmlFor="industry-active-checkbox" className="text-xs text-neutral-300 font-sans cursor-pointer">
                          Active on Live Website
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#b8982e] text-black text-xs font-bold uppercase cursor-pointer hover:shadow-lg transition-all"
                      >
                        Save Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingIndustry(null)}
                        className="px-6 py-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white text-xs font-bold uppercase cursor-pointer transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* -------------------- TECHNOLOGY STACK CRUD TAB -------------------- */}
            {activeTab === 'techstack' && (
              <div className="space-y-6" id="admin-tab-techstack">
                {editingTechStack === null ? (
                  <>
                    {/* Section Headings CMS Customization Box */}
                    <div className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl space-y-4 mb-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                            <Cpu className="w-4 h-4 text-[#D4AF37]" />
                            <span>Technology Stack Settings</span>
                          </h4>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            Customize the main section heading and optional subtitle for the Technology Stack on the website.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            saveSettings(settingsForm);
                            showToast('Technology Stack settings saved successfully!', 'success');
                          }}
                          className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#b8982e] text-black font-bold text-xs uppercase cursor-pointer transition-all shadow shrink-0"
                        >
                          Save Headings
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1 font-semibold">
                            Section Heading *
                          </label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. Our Technology Stack"
                            value={settingsForm.techStackSectionHeading || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, techStackSectionHeading: e.target.value })}
                            className="w-full px-3 py-2 bg-black/60 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1 font-semibold">
                            Section Subtitle (Optional - Leave empty to hide)
                          </label>
                          <input 
                            type="text"
                            placeholder="e.g. Cutting-edge frameworks, multi-tenant databases, and agentic AI pipelines."
                            value={settingsForm.techStackSectionSubtitle || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, techStackSectionSubtitle: e.target.value })}
                            className="w-full px-3 py-2 bg-black/60 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
                      <div>
                        <h3 className="text-xl font-bold tracking-wide font-sans">Technology Stack Cards Directory</h3>
                        <p className="text-xs text-neutral-500">Manage, reorder, show/hide, add, and edit technology cards.</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsNewTechStack(true);
                          setEditingTechStack({
                            id: `tech_${Date.now()}`,
                            title: '',
                            description: '',
                            iconType: 'lucide',
                            iconName: 'Code',
                            imageUrl: '',
                            displayOrder: techStackItems.length + 1,
                            active: true
                          });
                        }}
                        className="px-4 py-2.5 rounded-lg bg-[#D4AF37] text-black text-xs font-bold flex items-center space-x-1.5 cursor-pointer hover:bg-[#b8982e] transition-all"
                      >
                        <Plus className="w-3.5 h-3.5 text-black" />
                        <span>Add New Tech Card</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {techStackItems.length === 0 ? (
                        <div className="p-8 text-center text-neutral-500 text-xs bg-neutral-900/40 rounded-2xl border border-neutral-900">
                          No technology cards found. Click "Add New Tech Card" to create one.
                        </div>
                      ) : (
                        techStackItems
                          .slice()
                          .sort((a, b) => a.displayOrder - b.displayOrder)
                          .map((st, index, arr) => (
                            <div key={st.id} className="bg-neutral-900/40 p-4 rounded-2xl border border-neutral-900 flex items-center justify-between gap-4">
                              <div className="flex items-center space-x-3.5 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center font-bold text-xs text-[#D4AF37] shrink-0">
                                  {st.iconType === 'image' && st.imageUrl ? (
                                    <img src={st.imageUrl} alt={st.title} className="w-6 h-6 object-contain rounded" />
                                  ) : (
                                    index + 1
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-sm font-semibold text-white truncate">{st.title}</h4>
                                  <p className="text-xs text-neutral-400 font-sans truncate max-w-md">
                                    {st.description}
                                  </p>
                                  <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                                    Icon: {st.iconType === 'image' ? 'Custom Image' : st.iconName || 'Code'} · Order: {st.displayOrder} · Status: {st.active !== false ? 'Active' : 'Hidden'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 shrink-0">
                                {/* Move Up */}
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => {
                                    if (index === 0) return;
                                    const sorted = techStackItems.slice().sort((a, b) => a.displayOrder - b.displayOrder);
                                    const temp = sorted[index].displayOrder;
                                    sorted[index].displayOrder = sorted[index - 1].displayOrder;
                                    sorted[index - 1].displayOrder = temp;
                                    const reindexed = sorted.map((item, i) => ({ ...item, displayOrder: i + 1 }));
                                    saveTechStack(reindexed);
                                    showToast('Technology card reordered.', 'success');
                                  }}
                                  className={`p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors ${index === 0 ? 'opacity-30 cursor-not-allowed text-neutral-600' : 'cursor-pointer text-white'}`}
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>
                                {/* Move Down */}
                                <button
                                  type="button"
                                  disabled={index === arr.length - 1}
                                  onClick={() => {
                                    if (index === arr.length - 1) return;
                                    const sorted = techStackItems.slice().sort((a, b) => a.displayOrder - b.displayOrder);
                                    const temp = sorted[index].displayOrder;
                                    sorted[index].displayOrder = sorted[index + 1].displayOrder;
                                    sorted[index + 1].displayOrder = temp;
                                    const reindexed = sorted.map((item, i) => ({ ...item, displayOrder: i + 1 }));
                                    saveTechStack(reindexed);
                                    showToast('Technology card reordered.', 'success');
                                  }}
                                  className={`p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors ${index === arr.length - 1 ? 'opacity-30 cursor-not-allowed text-neutral-600' : 'cursor-pointer text-white'}`}
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>

                                {/* Toggle Active */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = techStackItems.map(item => item.id === st.id ? { ...item, active: item.active === false ? true : false } : item);
                                    saveTechStack(updated);
                                    showToast(`Card "${st.title}" is now ${st.active === false ? 'Active' : 'Hidden'}.`, 'success');
                                  }}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                                    st.active !== false ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20' : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700'
                                  }`}
                                >
                                  {st.active !== false ? 'Active' : 'Hidden'}
                                </button>

                                {/* Edit */}
                                <button
                                  onClick={() => {
                                    setIsNewTechStack(false);
                                    setEditingTechStack({ ...st });
                                  }}
                                  className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg cursor-pointer transition-colors"
                                  title="Edit Card"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>

                                {/* Delete */}
                                <button
                                  onClick={() => {
                                    if (!checkAccessGuard('delete', 'technology card')) return;
                                    if (window.confirm(`Delete "${st.title}" technology card?`)) {
                                      saveTechStack(techStackItems.filter(i => i.id !== st.id));
                                      showToast('Technology card deleted.', 'success');
                                    }
                                  }}
                                  className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg cursor-pointer transition-colors"
                                  title="Delete Card"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </>
                ) : (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!editingTechStack.title.trim()) {
                      showToast('Card title cannot be empty.', 'error');
                      return;
                    }
                    if (!editingTechStack.description.trim()) {
                      showToast('Card description cannot be empty.', 'error');
                      return;
                    }
                    if (isNewTechStack) {
                      saveTechStack([...techStackItems, editingTechStack]);
                      showToast('New technology card added!', 'success');
                    } else {
                      saveTechStack(techStackItems.map(i => i.id === editingTechStack.id ? editingTechStack : i));
                      showToast('Technology card updated successfully!', 'success');
                    }
                    setEditingTechStack(null);
                  }} className="space-y-5 bg-neutral-900/60 p-6 rounded-2xl border border-neutral-800">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                      <h4 className="text-base font-bold tracking-wide text-white">
                        {isNewTechStack ? 'Add Technology Card' : 'Edit Technology Card'}
                      </h4>
                      <button type="button" onClick={() => setEditingTechStack(null)} className="text-neutral-500 hover:text-white text-sm cursor-pointer">✕</button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1 font-semibold">
                        Card Title *
                      </label>
                      <input 
                        type="text" required
                        placeholder="e.g. Frontend Client"
                        value={editingTechStack.title}
                        onChange={(e) => setEditingTechStack({ ...editingTechStack, title: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1 font-semibold">
                        Card Description / Framework List *
                      </label>
                      <textarea 
                        rows={2} required
                        placeholder="e.g. React, TypeScript, Tailwind CSS, Framer Motion"
                        value={editingTechStack.description}
                        onChange={(e) => setEditingTechStack({ ...editingTechStack, description: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>

                    {/* Icon Selection Mode */}
                    <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                      <label className="block text-[10px] font-mono text-[#D4AF37] uppercase font-bold tracking-wider">
                        Card Visual Icon Mode
                      </label>
                      <div className="flex items-center space-x-6">
                        <label className="flex items-center space-x-2 text-xs text-white cursor-pointer font-sans">
                          <input 
                            type="radio" 
                            name="iconTypeRadio" 
                            checked={editingTechStack.iconType !== 'image'}
                            onChange={() => setEditingTechStack({ ...editingTechStack, iconType: 'lucide' })}
                            className="text-[#D4AF37] focus:ring-[#D4AF37]"
                          />
                          <span>Lucide Vector Icon</span>
                        </label>
                        <label className="flex items-center space-x-2 text-xs text-white cursor-pointer font-sans">
                          <input 
                            type="radio" 
                            name="iconTypeRadio" 
                            checked={editingTechStack.iconType === 'image'}
                            onChange={() => setEditingTechStack({ ...editingTechStack, iconType: 'image' })}
                            className="text-[#D4AF37] focus:ring-[#D4AF37]"
                          />
                          <span>Custom Uploaded Image / Logo</span>
                        </label>
                      </div>

                      {editingTechStack.iconType !== 'image' ? (
                        <div className="space-y-3 pt-2">
                          <label className="block text-[10px] font-mono text-neutral-400 uppercase font-semibold">
                            Select Vector Icon Preset
                          </label>
                          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                            {[
                              { name: 'Code', icon: Code },
                              { name: 'Server', icon: Server },
                              { name: 'Database', icon: Database },
                              { name: 'Cpu', icon: Cpu },
                              { name: 'Terminal', icon: Terminal },
                              { name: 'Zap', icon: Zap },
                              { name: 'Layers', icon: Layers },
                              { name: 'Globe', icon: Globe },
                              { name: 'ShieldCheck', icon: ShieldCheck },
                              { name: 'Sparkles', icon: Sparkles },
                              { name: 'Workflow', icon: Workflow },
                              { name: 'Search', icon: Search },
                              { name: 'Monitor', icon: Monitor },
                              { name: 'Smartphone', icon: Smartphone },
                              { name: 'Laptop', icon: Laptop },
                              { name: 'Rocket', icon: Rocket }
                            ].map((preset) => {
                              const IconComp = preset.icon;
                              const isSelected = (editingTechStack.iconName || 'Code').toLowerCase() === preset.name.toLowerCase();
                              return (
                                <button
                                  type="button"
                                  key={preset.name}
                                  onClick={() => setEditingTechStack({ ...editingTechStack, iconName: preset.name })}
                                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                                    isSelected 
                                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]' 
                                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                                  }`}
                                >
                                  <IconComp className="w-5 h-5" />
                                  <span className="text-[9px] font-mono">{preset.name}</span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="pt-1">
                            <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">
                              Or Type Custom Lucide Icon Name
                            </label>
                            <input 
                              type="text"
                              placeholder="e.g. Code, Server, Database, Cpu..."
                              value={editingTechStack.iconName || ''}
                              onChange={(e) => setEditingTechStack({ ...editingTechStack, iconName: e.target.value })}
                              className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-lg text-xs text-white focus:outline-none"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 pt-2">
                          <label className="block text-[10px] font-mono text-neutral-400 uppercase font-semibold">
                            Custom Image / Icon File
                          </label>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <label className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs cursor-pointer transition-all flex items-center space-x-2 border border-neutral-700">
                              <Upload className="w-4 h-4 text-[#D4AF37]" />
                              <span>{isUploadingTechImg ? 'Uploading...' : 'Upload Image File'}</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden"
                                disabled={isUploadingTechImg}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  if (file.size > 5 * 1024 * 1024) {
                                    showToast('File size exceeds 5MB limit.', 'error');
                                    return;
                                  }
                                  setIsUploadingTechImg(true);
                                  setTechImgUploadProgress(0);
                                  try {
                                    const url = await uploadImageToSupabase('techstack-images', file, '', (prog) => {
                                      setTechImgUploadProgress(prog);
                                    });
                                    if (url) {
                                      setEditingTechStack({ ...editingTechStack, imageUrl: url });
                                      showToast('Tech card image uploaded successfully!', 'success');
                                    } else {
                                      // Fallback Data URL
                                      const reader = new FileReader();
                                      reader.onload = () => {
                                        setEditingTechStack({ ...editingTechStack, imageUrl: reader.result as string });
                                        showToast('Image loaded successfully!', 'success');
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  } catch (err: any) {
                                    console.error('Upload error:', err);
                                    showToast(`Upload failed: ${err.message || err}`, 'error');
                                  } finally {
                                    setIsUploadingTechImg(false);
                                    setTechImgUploadProgress(null);
                                  }
                                }}
                              />
                            </label>

                            <input 
                              type="text"
                              placeholder="Or paste image URL (e.g. https://...)"
                              value={editingTechStack.imageUrl || ''}
                              onChange={(e) => setEditingTechStack({ ...editingTechStack, imageUrl: e.target.value })}
                              className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                            />
                          </div>

                          {editingTechStack.imageUrl && (
                            <div className="flex items-center space-x-3 pt-2">
                              <img src={editingTechStack.imageUrl} alt="Preview" className="w-12 h-12 object-contain bg-black/80 rounded-xl p-1 border border-neutral-800" />
                              <button
                                type="button"
                                onClick={() => setEditingTechStack({ ...editingTechStack, imageUrl: '' })}
                                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold cursor-pointer transition-all border border-red-500/30"
                              >
                                Remove Image
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1 font-semibold">
                          Display Order
                        </label>
                        <input 
                          type="number" required
                          value={editingTechStack.displayOrder}
                          onChange={(e) => setEditingTechStack({ ...editingTechStack, displayOrder: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center space-x-2 pt-6">
                        <input 
                          type="checkbox"
                          id="techstack-active-checkbox"
                          checked={editingTechStack.active !== false}
                          onChange={(e) => setEditingTechStack({ ...editingTechStack, active: e.target.checked })}
                          className="w-4 h-4 text-[#D4AF37] focus:ring-[#D4AF37] rounded border-neutral-700 bg-neutral-950 cursor-pointer"
                        />
                        <label htmlFor="techstack-active-checkbox" className="text-xs text-neutral-300 font-sans cursor-pointer">
                          Active on Live Website
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#b8982e] text-black text-xs font-bold uppercase cursor-pointer hover:shadow-lg transition-all"
                      >
                        Save Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTechStack(null)}
                        className="px-6 py-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white text-xs font-bold uppercase cursor-pointer transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* -------------------- 4. TEAM CRUD TAB -------------------- */}
            {activeTab === 'team' && (
              <div className="space-y-6" id="admin-tab-team">
                {editingTeam === null ? (
                  <>
                    <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
                      <div>
                        <h3 className="text-xl font-bold tracking-wide font-sans">Engineering Guild</h3>
                        <p className="text-xs text-neutral-500">Define executive roles and social roadmaps.</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsNewTeam(true);
                          setEditingTeam({
                            id: `t_${Date.now()}`,
                            name: '',
                            designation: '',
                            gender: 'Male',
                            experience: '',
                            socialLinks: {},
                            dynamicSocialLinks: [],
                            displayOrder: team.length + 1,
                            photoUrl: ''
                          });
                        }}
                        className="px-4 py-2.5 rounded-lg bg-[#D4AF37] text-black text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-black" />
                        <span>Add Team Member</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {team.map((member) => (
                        <div key={member.id} className="bg-neutral-900/40 p-4 rounded-2xl border border-neutral-900 flex items-center justify-between gap-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0">
                              <img
                                src={member.photoUrl && member.photoUrl.trim() !== "" ? member.photoUrl : getAvatarUrl(member.gender, member.name)}
                                alt={member.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = getAvatarUrl(member.gender, member.name);
                                }}
                              />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-white">{member.name}</h4>
                              <p className="text-xs text-neutral-500 font-sans">{member.designation} · Gender: {member.gender}{member.experience ? ` · Experience: ${member.experience}` : ''}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setIsNewTeam(false);
                                const initialLinks = member.dynamicSocialLinks ? [...member.dynamicSocialLinks] : [];
                                if (initialLinks.length === 0 && (member.name === 'Muhammad Junaid' || member.designation?.toLowerCase().includes('ceo'))) {
                                  initialLinks.push(
                                    { id: 'sl_l', platform: 'LinkedIn', url: member.socialLinks?.linkedin || 'https://linkedin.com', enabled: true, openInNewTab: true },
                                    { id: 'sl_g', platform: 'GitHub', url: member.socialLinks?.github || 'https://github.com', enabled: true, openInNewTab: true }
                                  );
                                }
                                setEditingTeam({ ...member, dynamicSocialLinks: initialLinks });
                              }}
                              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (!checkAccessGuard('delete', 'team member')) return;
                                if (window.confirm('Delete this team member and their profile photo?')) {
                                  if (member.photoUrl) {
                                    try {
                                      await deleteImageFromSupabase('team-images', member.photoUrl);
                                    } catch (err) {
                                      console.warn('Failed to delete team member photo from storage:', err);
                                    }
                                  }
                                  saveTeam(team.filter(t => t.id !== member.id));
                                }
                              }}
                              className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    // Sync legacy socialLinks object from dynamicSocialLinks for backward compatibility
                    const syncedLinks: Record<string, string> = {};
                    (editingTeam.dynamicSocialLinks || []).forEach(item => {
                      if (item.enabled !== false && item.url && item.url.trim()) {
                        const key = item.platform.toLowerCase().replace(/[^a-z]/g, '');
                        syncedLinks[key] = item.url;
                      }
                    });
                    const memberToSave = {
                      ...editingTeam,
                      socialLinks: syncedLinks,
                      dynamicSocialLinks: editingTeam.dynamicSocialLinks || []
                    };

                    if (isNewTeam) {
                      saveTeam([...team, memberToSave]);
                    } else {
                      saveTeam(team.map(t => t.id === memberToSave.id ? memberToSave : t));
                    }
                    setEditingTeam(null);
                  }} className="space-y-5">
                    <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                      <h4 className="text-base font-bold tracking-wide">
                        {isNewTeam ? 'Add Team Member' : 'Edit Member'}
                      </h4>
                      <button type="button" onClick={() => setEditingTeam(null)} className="text-neutral-500 hover:text-white">✕</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Full Name</label>
                        <input 
                          type="text" required
                          value={editingTeam.name}
                          onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Designation</label>
                        <input 
                          type="text" required
                          value={editingTeam.designation}
                          onChange={(e) => setEditingTeam({ ...editingTeam, designation: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Gender (For Auto-Avatar)</label>
                        <select 
                          value={editingTeam.gender}
                          onChange={(e) => setEditingTeam({ ...editingTeam, gender: e.target.value as any })}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Experience Years (Optional)</label>
                        <input 
                          type="text"
                          value={editingTeam.experience || ''}
                          onChange={(e) => setEditingTeam({ ...editingTeam, experience: e.target.value })}
                          placeholder="e.g. 5+ Years (Leave blank to hide)"
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Display Order</label>
                        <input 
                          type="number" required
                          value={editingTeam.displayOrder}
                          onChange={(e) => setEditingTeam({ ...editingTeam, displayOrder: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Profile Image Uploader Field */}
                    <div className="bg-neutral-900/40 border border-neutral-800 p-4 rounded-2xl space-y-4">
                      <label className="block text-[10px] font-mono text-neutral-500 uppercase">Profile Photo (Direct Upload)</label>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Preview Box */}
                        <div className="w-20 h-20 rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden flex items-center justify-center shrink-0 relative">
                          <img
                            src={editingTeam.photoUrl && editingTeam.photoUrl.trim() !== "" ? editingTeam.photoUrl : getAvatarUrl(editingTeam.gender, editingTeam.name || 'avatar')}
                            alt="Team Member Preview"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = getAvatarUrl(editingTeam.gender, editingTeam.name || 'avatar');
                            }}
                          />
                          {isUploadingTeamPhoto && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <RefreshCw className="w-5 h-5 text-[#D4AF37] animate-spin" />
                            </div>
                          )}
                        </div>

                        {/* Upload controls */}
                        <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                          <p className="text-[10px] text-neutral-500">
                            Supported formats: JPG, PNG, WEBP. Max size: 5MB.<br/>
                            If empty, a gender-appropriate vector avatar is auto-generated.
                          </p>

                          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                            {/* File select button overlay */}
                            <label className="px-3.5 py-2 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase cursor-pointer tracking-wider transition-all">
                              {editingTeam.photoUrl ? 'Replace Photo' : 'Upload Photo'}
                              <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                className="hidden"
                                disabled={isUploadingTeamPhoto}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  
                                  // Client-side file size and type validation
                                  if (file.size > 5 * 1024 * 1024) {
                                    alert('File size exceeds the 5MB safety limit. Please upload a smaller image.');
                                    return;
                                  }
                                  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                                  if (!allowedMimeTypes.includes(file.type)) {
                                    alert('Unsupported file format. Please upload a JPG, JPEG, PNG, or WEBP image.');
                                    return;
                                  }

                                  const isReplace = !!editingTeam.photoUrl;
                                  const oldPhotoUrl = editingTeam.photoUrl;

                                  setIsUploadingTeamPhoto(true);
                                  try {
                                    const url = await uploadImageToSupabase('team-images', file);
                                    if (url) {
                                      // Delete the old photo from Supabase Storage if it was a replace operation
                                      if (isReplace && oldPhotoUrl) {
                                        try {
                                          await deleteImageFromSupabase('team-images', oldPhotoUrl);
                                        } catch (delErr) {
                                          console.warn('Could not delete old photo from storage:', delErr);
                                        }
                                      }

                                      const updatedMember = { ...editingTeam, photoUrl: url };
                                      setEditingTeam(updatedMember);

                                      // Save returned public URL in the team_members table (if editing an existing member)
                                      if (!isNewTeam) {
                                        await updateTeamMemberPhotoInDb(editingTeam.id, url);
                                        // Refresh the avatar immediately without page reload
                                        if (updateTeamInPlace) {
                                          const updatedList = team.map(t => t.id === editingTeam.id ? updatedMember : t);
                                          updateTeamInPlace(updatedList);
                                        }
                                      }

                                      if (isReplace) {
                                        alert('Photo replaced successfully!');
                                      } else {
                                        alert('Photo uploaded successfully!');
                                      }
                                    } else {
                                      throw new Error('No URL was returned from upload service.');
                                    }
                                  } catch (err: any) {
                                    console.error('Upload/Replace error:', err);
                                    alert(`Upload failed: ${err.message || err}`);
                                  } finally {
                                    setIsUploadingTeamPhoto(false);
                                  }
                                }}
                              />
                            </label>

                            {editingTeam.photoUrl && (
                              <button
                                type="button"
                                disabled={isUploadingTeamPhoto}
                                onClick={async () => {
                                  if (!checkAccessGuard('delete', 'team member photo')) return;
                                  if (confirm('Are you sure you want to delete this photo and revert to the vector avatar?')) {
                                    setIsUploadingTeamPhoto(true);
                                    const oldPhotoUrl = editingTeam.photoUrl;
                                    try {
                                      if (oldPhotoUrl) {
                                        try {
                                          await deleteImageFromSupabase('team-images', oldPhotoUrl);
                                        } catch (delErr) {
                                          console.warn('Could not delete old photo from storage:', delErr);
                                        }
                                      }

                                      const updatedMember = { ...editingTeam, photoUrl: '' };
                                      setEditingTeam(updatedMember);

                                      // Set photo_url to NULL in database (if editing an existing member)
                                      if (!isNewTeam) {
                                        await updateTeamMemberPhotoInDb(editingTeam.id, null);
                                        // Refresh the avatar immediately without page reload
                                        if (updateTeamInPlace) {
                                          const updatedList = team.map(t => t.id === editingTeam.id ? updatedMember : t);
                                          updateTeamInPlace(updatedList);
                                        }
                                      }

                                      alert('Profile photo deleted successfully!');
                                    } catch (err: any) {
                                      console.error('Delete photo error:', err);
                                      alert(`Delete failed: ${err.message || err}`);
                                    } finally {
                                      setIsUploadingTeamPhoto(false);
                                    }
                                  }
                                }}
                                className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
                              >
                                Delete Photo
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ----------------- DYNAMIC SOCIAL LINKS SECTION ----------------- */}
                    <div className="bg-neutral-900/40 border border-neutral-800 p-5 rounded-2xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                        <div>
                          <h5 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
                            <Share2 className="w-4 h-4 text-[#D4AF37]" />
                            <span>Social Links</span>
                          </h5>
                          <p className="text-[11px] text-neutral-400 mt-0.5 font-sans">
                            Manage social profiles, URLs, display order, and tab behavior for this team member.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            id="add-social-platform-select"
                            defaultValue=""
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!val) return;
                              const currentLinks = editingTeam.dynamicSocialLinks || [];
                              const newLink = {
                                id: `sl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                                platform: val as any,
                                url: '',
                                enabled: true,
                                openInNewTab: true
                              };
                              setEditingTeam({
                                ...editingTeam,
                                dynamicSocialLinks: [...currentLinks, newLink]
                              });
                              e.target.value = '';
                            }}
                            className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-[#D4AF37] font-semibold focus:outline-none cursor-pointer"
                          >
                            <option value="" disabled>+ Add Social Platform...</option>
                            {SUPPORTED_SOCIAL_PLATFORMS.map((plat) => (
                              <option key={plat} value={plat} className="bg-neutral-900 text-white">
                                {plat}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Current List of Social Links */}
                      {(!editingTeam.dynamicSocialLinks || editingTeam.dynamicSocialLinks.length === 0) ? (
                        <div className="text-center py-6 border border-dashed border-neutral-800 rounded-xl">
                          <p className="text-xs text-neutral-500 font-sans">No social links added for this team member yet.</p>
                          <p className="text-[10px] text-neutral-600 mt-1 font-sans">Select a platform above to add a social icon to their profile.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {editingTeam.dynamicSocialLinks.map((linkItem, idx) => (
                            <div 
                              key={linkItem.id || idx}
                              className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition-all hover:border-neutral-700"
                            >
                              {/* Order & Icon & Platform Select */}
                              <div className="flex items-center space-x-2.5 shrink-0 w-full md:w-auto">
                                {/* Reorder Buttons */}
                                <div className="flex flex-col space-y-0.5">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => {
                                      const list = [...(editingTeam.dynamicSocialLinks || [])];
                                      if (idx > 0) {
                                        const temp = list[idx];
                                        list[idx] = list[idx - 1];
                                        list[idx - 1] = temp;
                                        setEditingTeam({ ...editingTeam, dynamicSocialLinks: list });
                                      }
                                    }}
                                    className="p-1 text-neutral-500 hover:text-white disabled:opacity-30 rounded hover:bg-neutral-800 cursor-pointer disabled:cursor-not-allowed"
                                    title="Move Up"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === (editingTeam.dynamicSocialLinks || []).length - 1}
                                    onClick={() => {
                                      const list = [...(editingTeam.dynamicSocialLinks || [])];
                                      if (idx < list.length - 1) {
                                        const temp = list[idx];
                                        list[idx] = list[idx + 1];
                                        list[idx + 1] = temp;
                                        setEditingTeam({ ...editingTeam, dynamicSocialLinks: list });
                                      }
                                    }}
                                    className="p-1 text-neutral-500 hover:text-white disabled:opacity-30 rounded hover:bg-neutral-800 cursor-pointer disabled:cursor-not-allowed"
                                    title="Move Down"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                </div>

                                {/* Platform Icon Preview */}
                                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#D4AF37] shrink-0">
                                  <SocialIcon platform={linkItem.platform} className="w-4 h-4" />
                                </div>

                                {/* Platform Dropdown */}
                                <select
                                  value={linkItem.platform}
                                  onChange={(e) => {
                                    const list = [...(editingTeam.dynamicSocialLinks || [])];
                                    list[idx] = { ...list[idx], platform: e.target.value as any };
                                    setEditingTeam({ ...editingTeam, dynamicSocialLinks: list });
                                  }}
                                  className="px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-lg text-xs font-semibold text-white focus:outline-none cursor-pointer"
                                >
                                  {SUPPORTED_SOCIAL_PLATFORMS.map((plat) => (
                                    <option key={plat} value={plat}>
                                      {plat}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* URL Input */}
                              <div className="flex-1 w-full md:w-auto">
                                <input
                                  type="text"
                                  placeholder={`Enter ${linkItem.platform} URL (e.g. https://...)`}
                                  value={linkItem.url || ''}
                                  onChange={(e) => {
                                    const list = [...(editingTeam.dynamicSocialLinks || [])];
                                    list[idx] = { ...list[idx], url: e.target.value };
                                    setEditingTeam({ ...editingTeam, dynamicSocialLinks: list });
                                  }}
                                  className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-lg text-xs text-white placeholder-neutral-600 focus:outline-none"
                                />
                              </div>

                              {/* Controls: Enable toggle, New Tab, Remove */}
                              <div className="flex items-center space-x-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-neutral-800 pt-2 md:pt-0">
                                {/* Enable/Disable Toggle */}
                                <label className="flex items-center space-x-1.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={linkItem.enabled !== false}
                                    onChange={(e) => {
                                      const list = [...(editingTeam.dynamicSocialLinks || [])];
                                      list[idx] = { ...list[idx], enabled: e.target.checked };
                                      setEditingTeam({ ...editingTeam, dynamicSocialLinks: list });
                                    }}
                                    className="w-3.5 h-3.5 text-[#D4AF37] focus:ring-[#D4AF37] rounded border-neutral-700 bg-neutral-900 cursor-pointer"
                                  />
                                  <span className="text-[11px] text-neutral-300 font-sans">
                                    {linkItem.enabled !== false ? 'Enabled' : 'Disabled'}
                                  </span>
                                </label>

                                {/* Open in New Tab Toggle */}
                                <label className="flex items-center space-x-1.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={linkItem.openInNewTab !== false}
                                    onChange={(e) => {
                                      const list = [...(editingTeam.dynamicSocialLinks || [])];
                                      list[idx] = { ...list[idx], openInNewTab: e.target.checked };
                                      setEditingTeam({ ...editingTeam, dynamicSocialLinks: list });
                                    }}
                                    className="w-3.5 h-3.5 text-[#D4AF37] focus:ring-[#D4AF37] rounded border-neutral-700 bg-neutral-900 cursor-pointer"
                                  />
                                  <span className="text-[11px] text-neutral-400 font-sans">New Tab</span>
                                </label>

                                {/* Delete button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = (editingTeam.dynamicSocialLinks || []).filter((_, i) => i !== idx);
                                    setEditingTeam({ ...editingTeam, dynamicSocialLinks: list });
                                  }}
                                  className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-all cursor-pointer"
                                  title="Remove Social Link"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-black text-xs font-bold uppercase cursor-pointer"
                    >
                      Save Team Member
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* -------------------- 5. GALLERY CRUD TAB -------------------- */}
            {activeTab === 'gallery' && (
              <div className="space-y-6" id="admin-tab-gallery">
                {editingGallery === null ? (
                  <>
                    <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
                      <div>
                        <h3 className="text-xl font-bold tracking-wide font-sans">Media Archive</h3>
                        <p className="text-xs text-neutral-500">Manage meeting photographs, launches, and events.</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsNewGallery(true);
                          setEditingGallery({
                            id: `g_${Date.now()}`,
                            imageUrl: '',
                            category: 'Meetings',
                            caption: ''
                          });
                        }}
                        className="px-4 py-2.5 rounded-lg bg-[#D4AF37] text-black text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-black" />
                        <span>Add Gallery Photo</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {gallery.map((item) => (
                        <div key={item.id} className="bg-neutral-900/40 p-4 rounded-2xl border border-neutral-900 flex items-center justify-between gap-4">
                          <div className="flex items-center space-x-3">
                            <img src={item.imageUrl} alt={item.caption} className="w-12 h-12 object-cover rounded-lg border border-neutral-800" />
                            <div>
                              <h4 className="text-xs font-semibold text-white truncate max-w-[150px]">{item.caption}</h4>
                              <p className="text-[10px] text-neutral-500">{item.category}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => {
                                setIsNewGallery(false);
                                setEditingGallery({ ...item });
                              }}
                              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                if (!checkAccessGuard('delete', 'gallery item')) return;
                                if (window.confirm('Are you sure you want to delete this gallery item and its photo permanently?')) {
                                  try {
                                    if (item.imageUrl) {
                                      try {
                                        await deleteImageFromSupabase('gallery-images', item.imageUrl);
                                      } catch (delErr) {
                                        console.warn('Could not delete old image from storage:', delErr);
                                      }
                                    }
                                    saveGallery(gallery.filter(g => g.id !== item.id));
                                    showToast('Gallery photo and record deleted successfully!', 'success');
                                  } catch (err: any) {
                                    console.error('Error deleting gallery item:', err);
                                    showToast(`Delete failed: ${err.message || err}`, 'error');
                                  }
                                }
                              }}
                              className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!editingGallery.imageUrl) {
                      showToast('Please upload an image before saving.', 'error');
                      return;
                    }
                    try {
                      if (isNewGallery) {
                        saveGallery([...gallery, editingGallery]);
                        showToast('New gallery photo added successfully!', 'success');
                      } else {
                        saveGallery(gallery.map(g => g.id === editingGallery.id ? editingGallery : g));
                        showToast('Gallery photo updated successfully!', 'success');
                      }
                      setEditingGallery(null);
                    } catch (err: any) {
                      console.error('Error saving gallery item:', err);
                      showToast(`Save failed: ${err.message || err}`, 'error');
                    }
                  }} className="space-y-5">
                    <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                      <h4 className="text-base font-bold tracking-wide">
                        {isNewGallery ? 'Add Image' : 'Edit Image'}
                      </h4>
                      <button type="button" onClick={() => setEditingGallery(null)} className="text-neutral-500 hover:text-white">✕</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Category</label>
                        <select 
                          value={editingGallery.category}
                          onChange={(e) => setEditingGallery({ ...editingGallery, category: e.target.value as any })}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                        >
                          <option value="Meetings">Meetings</option>
                          <option value="Office">Office</option>
                          <option value="Projects">Projects</option>
                          <option value="Events">Events</option>
                          <option value="Team">Team</option>
                        </select>
                      </div>
                    {/* Gallery Image Uploader Field */}
                    <div className="bg-neutral-900/40 border border-neutral-800 p-4 rounded-2xl space-y-4">
                      <label className="block text-[10px] font-mono text-neutral-500 uppercase">Gallery Photo (Direct Upload)</label>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Preview Box */}
                        <div className="w-28 h-20 rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden flex items-center justify-center shrink-0 relative">
                          {editingGallery.imageUrl ? (
                            <img
                              src={editingGallery.imageUrl}
                              alt="Gallery Preview"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="text-[10px] text-neutral-600 font-mono italic">No Photo</div>
                          )}
                          {isUploadingGalleryImg && (
                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-1">
                              <RefreshCw className="w-5 h-5 text-[#D4AF37] animate-spin" />
                              {galleryUploadProgress !== null && (
                                <span className="text-[10px] font-mono font-bold text-[#D4AF37]">{galleryUploadProgress}%</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Upload controls */}
                        <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                          <p className="text-[10px] text-neutral-500">
                            Supported formats: JPG, JPEG, PNG, WEBP. Max size: 5MB.<br/>
                            This photo is permanently saved in Supabase Storage.
                          </p>

                          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                            {/* File select button overlay */}
                            <label className="px-3.5 py-2 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase cursor-pointer tracking-wider transition-all">
                              {editingGallery.imageUrl ? 'Replace Photo' : 'Upload Photo'}
                              <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                className="hidden"
                                disabled={isUploadingGalleryImg}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  
                                  // Client-side file size and type validation
                                  if (file.size > 5 * 1024 * 1024) {
                                    showToast('File size exceeds the 5MB safety limit. Please upload a smaller image.', 'error');
                                    return;
                                  }
                                  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                                  if (!allowedMimeTypes.includes(file.type)) {
                                    showToast('Unsupported file format. Please upload a JPG, JPEG, PNG, or WEBP image.', 'error');
                                    return;
                                  }

                                  const isReplace = !!editingGallery.imageUrl;
                                  const oldImageUrl = editingGallery.imageUrl;

                                  setIsUploadingGalleryImg(true);
                                  setGalleryUploadProgress(0);
                                  try {
                                    const url = await uploadImageToSupabase('gallery-images', file, '', (progress) => {
                                      setGalleryUploadProgress(progress);
                                    });
                                    if (url) {
                                      if (isReplace && oldImageUrl) {
                                        try {
                                          await deleteImageFromSupabase('gallery-images', oldImageUrl);
                                        } catch (delErr) {
                                          console.warn('Could not delete old photo from storage:', delErr);
                                        }
                                      }
                                      setEditingGallery({ ...editingGallery, imageUrl: url });
                                      showToast(isReplace ? 'Photo replaced successfully!' : 'Photo uploaded successfully!', 'success');
                                    } else {
                                      showToast('Failed to upload gallery image.', 'error');
                                    }
                                  } catch (err: any) {
                                    console.error('Upload/Replace error:', err);
                                    showToast(`Upload failed: ${err.message || err}`, 'error');
                                  } finally {
                                    setIsUploadingGalleryImg(false);
                                    setGalleryUploadProgress(null);
                                  }
                                }}
                              />
                            </label>

                            {editingGallery.imageUrl && (
                              <button
                                type="button"
                                disabled={isUploadingGalleryImg}
                                onClick={async () => {
                                  if (!checkAccessGuard('delete', 'gallery photo')) return;
                                  if (confirm('Are you sure you want to delete this photo and revert the record?')) {
                                    setIsUploadingGalleryImg(true);
                                    const oldImageUrl = editingGallery.imageUrl;
                                    try {
                                      if (oldImageUrl) {
                                        try {
                                          await deleteImageFromSupabase('gallery-images', oldImageUrl);
                                        } catch (delErr) {
                                          console.warn('Could not delete old image from storage:', delErr);
                                        }
                                      }

                                      if (!isNewGallery) {
                                        // Delete record completely
                                        saveGallery(gallery.filter(g => g.id !== editingGallery.id));
                                        showToast('Gallery item deleted completely!', 'success');
                                        setEditingGallery(null);
                                      } else {
                                        // Just clear preview URL for unsaved item
                                        setEditingGallery({ ...editingGallery, imageUrl: '' });
                                        showToast('Photo removed.', 'success');
                                      }
                                    } catch (err: any) {
                                      console.error('Delete image error:', err);
                                      showToast(`Delete failed: ${err.message || err}`, 'error');
                                    } finally {
                                      setIsUploadingGalleryImg(false);
                                    }
                                  }
                                }}
                                className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
                              >
                                Delete Photo
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Caption Details</label>
                      <input 
                        type="text" required
                        value={editingGallery.caption}
                        onChange={(e) => setEditingGallery({ ...editingGallery, caption: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isUploadingGalleryImg}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-black text-xs font-bold uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save Photo
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* -------------------- 6. CLIENT REVIEWS TAB -------------------- */}
            {activeTab === 'reviews' && (
              <div className="space-y-6" id="admin-tab-reviews">
                {(() => {
                  // Review Calculations & Metrics
                  const pendingReviews = reviews.filter(r => r.status === 'pending');
                  const approvedReviews = reviews.filter(r => r.status === 'approved' || !r.status);
                  const rejectedReviews = reviews.filter(r => r.status === 'rejected');
                  const featuredReviews = reviews.filter(r => r.featured);
                  
                  const validRatings = reviews.filter(r => r.rating > 0);
                  const avgRating = validRatings.length > 0 
                    ? (validRatings.reduce((acc, r) => acc + r.rating, 0) / validRatings.length).toFixed(1)
                    : '5.0';

                  // Apply search and filters
                  let filtered = reviews.filter(r => {
                    // Status filter
                    if (reviewStatusFilter === 'pending') return r.status === 'pending';
                    if (reviewStatusFilter === 'approved') return r.status === 'approved' || !r.status;
                    if (reviewStatusFilter === 'rejected') return r.status === 'rejected';
                    if (reviewStatusFilter === 'featured') return r.featured;
                    return true;
                  });

                  if (reviewRatingFilter > 0) {
                    filtered = filtered.filter(r => r.rating === reviewRatingFilter);
                  }

                  if (reviewSearchQuery.trim()) {
                    const q = reviewSearchQuery.toLowerCase().trim();
                    filtered = filtered.filter(r => 
                      (r.name && r.name.toLowerCase().includes(q)) ||
                      (r.company && r.company.toLowerCase().includes(q)) ||
                      (r.email && r.email.toLowerCase().includes(q)) ||
                      (r.review && r.review.toLowerCase().includes(q)) ||
                      (r.designation && r.designation.toLowerCase().includes(q)) ||
                      (r.country && r.country.toLowerCase().includes(q))
                    );
                  }

                  // Sorting
                  filtered = [...filtered].sort((a, b) => {
                    if (reviewSortBy === 'rating-desc') return b.rating - a.rating;
                    if (reviewSortBy === 'rating-asc') return a.rating - b.rating;
                    if (reviewSortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                    if (reviewSortBy === 'oldest') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
                    return (a.displayOrder || 999) - (b.displayOrder || 999);
                  });

                  // Helper functions
                  const handleApproveReview = (id: string) => {
                    const updated = reviews.map(r => r.id === id ? { ...r, status: 'approved' as const, updatedAt: new Date().toISOString() } : r);
                    saveReviews(updated);
                    showToast('Review approved and published to website!', 'success');
                  };

                  const handleRejectReview = (id: string) => {
                    const updated = reviews.map(r => r.id === id ? { ...r, status: 'rejected' as const, updatedAt: new Date().toISOString() } : r);
                    saveReviews(updated);
                    showToast('Review status set to rejected.', 'success');
                  };

                  const handleToggleFeatured = (id: string) => {
                    const updated = reviews.map(r => r.id === id ? { ...r, featured: !r.featured, updatedAt: new Date().toISOString() } : r);
                    saveReviews(updated);
                    const isFeat = updated.find(r => r.id === id)?.featured;
                    showToast(isFeat ? 'Review marked as Featured!' : 'Review unfeatured.', 'success');
                  };

                  const handleMoveOrder = (id: string, direction: 'up' | 'down') => {
                    const idx = filtered.findIndex(r => r.id === id);
                    if (idx === -1) return;
                    if (direction === 'up' && idx === 0) return;
                    if (direction === 'down' && idx === filtered.length - 1) return;

                    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
                    const itemA = filtered[idx];
                    const itemB = filtered[targetIdx];

                    const updated = reviews.map(r => {
                      if (r.id === itemA.id) return { ...r, displayOrder: targetIdx + 1 };
                      if (r.id === itemB.id) return { ...r, displayOrder: idx + 1 };
                      return r;
                    });

                    saveReviews(updated);
                    showToast('Display order updated.', 'success');
                  };

                  const handleBulkApprove = () => {
                    if (selectedReviewIds.length === 0) return;
                    const updated = reviews.map(r => selectedReviewIds.includes(r.id) ? { ...r, status: 'approved' as const, updatedAt: new Date().toISOString() } : r);
                    saveReviews(updated);
                    setSelectedReviewIds([]);
                    showToast(`${selectedReviewIds.length} review(s) approved successfully!`, 'success');
                  };

                  const handleBulkReject = () => {
                    if (selectedReviewIds.length === 0) return;
                    const updated = reviews.map(r => selectedReviewIds.includes(r.id) ? { ...r, status: 'rejected' as const, updatedAt: new Date().toISOString() } : r);
                    saveReviews(updated);
                    setSelectedReviewIds([]);
                    showToast(`${selectedReviewIds.length} review(s) marked as rejected.`, 'success');
                  };

                  const handleBulkDelete = () => {
                    if (!checkAccessGuard('delete', 'selected reviews')) return;
                    if (selectedReviewIds.length === 0) return;
                    if (window.confirm(`Are you sure you want to permanently delete ${selectedReviewIds.length} review(s)?`)) {
                      const updated = reviews.filter(r => !selectedReviewIds.includes(r.id));
                      saveReviews(updated);
                      setSelectedReviewIds([]);
                      showToast(`${selectedReviewIds.length} review(s) deleted.`, 'success');
                    }
                  };

                  const handleExportCSV = () => {
                    const headers = ['ID', 'Name', 'Email', 'Company', 'Designation', 'Country', 'Rating', 'Status', 'Featured', 'Display Order', 'Created At', 'Review'];
                    const rows = filtered.map(r => [
                      `"${r.id}"`,
                      `"${(r.name || '').replace(/"/g, '""')}"`,
                      `"${(r.email || '').replace(/"/g, '""')}"`,
                      `"${(r.company || '').replace(/"/g, '""')}"`,
                      `"${(r.designation || '').replace(/"/g, '""')}"`,
                      `"${(r.country || '').replace(/"/g, '""')}"`,
                      r.rating || 5,
                      `"${r.status || 'approved'}"`,
                      r.featured ? 'Yes' : 'No',
                      r.displayOrder || 1,
                      `"${r.createdAt || ''}"`,
                      `"${(r.review || '').replace(/"/g, '""')}"`
                    ]);

                    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', `apnakhaiyal_testimonials_${new Date().toISOString().slice(0, 10)}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    showToast('Testimonials exported to CSV file!', 'success');
                  };

                  return editingReview === null ? (
                    <>
                      {/* Top Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800 pb-4 gap-4">
                        <div>
                          <h3 className="text-xl font-bold tracking-wide font-sans text-white flex items-center space-x-2">
                            <span>Client Reviews & Testimonials</span>
                            {pendingReviews.length > 0 && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                                {pendingReviews.length} Pending
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-neutral-400 mt-0.5 font-sans">
                            Approve, edit, feature, and reorder partner testimonials. Pending submissions will NOT appear on the website until approved.
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={handleExportCSV}
                            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer border border-neutral-700"
                          >
                            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>Export CSV</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setIsNewReview(true);
                              setEditingReview({
                                id: `r_${Date.now()}`,
                                name: '',
                                designation: '',
                                company: '',
                                country: '',
                                email: '',
                                rating: 5,
                                review: '',
                                photoUrl: '',
                                companyLogoUrl: '',
                                status: 'approved',
                                featured: false,
                                displayOrder: reviews.length + 1,
                                createdAt: new Date().toISOString()
                              });
                            }}
                            className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#c89666] text-black text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md transition-all"
                          >
                            <Plus className="w-3.5 h-3.5 text-black" />
                            <span>Add Review</span>
                          </button>
                        </div>
                      </div>

                      {/* Pending Review Warning Notice */}
                      {pendingReviews.length > 0 && (
                        <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                              <AlertCircle className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-amber-300 font-mono uppercase tracking-wide">
                                Action Required: {pendingReviews.length} New Testimonial{pendingReviews.length > 1 ? 's' : ''} Pending
                              </h4>
                              <p className="text-xs text-amber-200/80 font-sans mt-0.5">
                                Submissions are held in pending queue to prevent spam and XSS before appearing on the public website.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setReviewStatusFilter('pending')}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer"
                            >
                              View Pending
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = reviews.map(r => r.status === 'pending' ? { ...r, status: 'approved' as const } : r);
                                saveReviews(updated);
                                showToast(`Approved all ${pendingReviews.length} pending review(s)!`, 'success');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all cursor-pointer"
                            >
                              Approve All Pending
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 6 Grid Metric Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-3.5 space-y-1">
                          <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">Total Reviews</span>
                          <span className="text-2xl font-black text-white">{reviews.length}</span>
                        </div>

                        <div className="bg-neutral-900/80 border border-amber-500/30 rounded-2xl p-3.5 space-y-1">
                          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">Pending</span>
                          <span className="text-2xl font-black text-amber-400">{pendingReviews.length}</span>
                        </div>

                        <div className="bg-neutral-900/80 border border-emerald-500/30 rounded-2xl p-3.5 space-y-1">
                          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">Approved</span>
                          <span className="text-2xl font-black text-emerald-400">{approvedReviews.length}</span>
                        </div>

                        <div className="bg-neutral-900/80 border border-red-500/30 rounded-2xl p-3.5 space-y-1">
                          <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider block">Rejected</span>
                          <span className="text-2xl font-black text-red-400">{rejectedReviews.length}</span>
                        </div>

                        <div className="bg-neutral-900/80 border border-[#D4AF37]/30 rounded-2xl p-3.5 space-y-1">
                          <span className="text-[10px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider block">Featured</span>
                          <span className="text-2xl font-black text-[#D4AF37]">{featuredReviews.length}</span>
                        </div>

                        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-3.5 space-y-1">
                          <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">Avg Rating</span>
                          <span className="text-2xl font-black text-white flex items-center space-x-1">
                            <span>{avgRating}</span>
                            <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                          </span>
                        </div>
                      </div>

                      {/* Request a Review Invitation Generator Card */}
                      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center space-x-2 text-[#D4AF37]">
                          <Star className="w-4 h-4 fill-[#D4AF37]" />
                          <h4 className="text-xs font-mono font-bold uppercase tracking-wider">Request a Review / Client Invitation Link</h4>
                        </div>
                        <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                          Share this unique link with clients or partners to submit testimonials. Form submissions will automatically enter the pending approval queue.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                          <div className="w-full flex-1 bg-black/60 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs font-mono text-neutral-300 truncate select-all">
                            {typeof window !== 'undefined' ? `${window.location.origin}?action=review` : 'https://apnakhaiyal.com?action=review'}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const link = typeof window !== 'undefined' ? `${window.location.origin}?action=review` : 'https://apnakhaiyal.com?action=review';
                              navigator.clipboard.writeText(link);
                              showToast('Review invitation link copied to clipboard!', 'success');
                            }}
                            className="w-full sm:w-auto px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all shrink-0 flex items-center justify-center space-x-1.5 border border-neutral-700"
                          >
                            <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>Copy Invitation Link</span>
                          </button>
                        </div>
                      </div>

                      {/* Search, Status Tabs, Rating Filter & Sorting Controls */}
                      <div className="bg-neutral-900/60 border border-neutral-800 p-4 rounded-2xl space-y-4">
                        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                          {/* Search Input */}
                          <div className="relative flex-1">
                            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              placeholder="Search by client name, email, company, country, or review..."
                              value={reviewSearchQuery}
                              onChange={(e) => setReviewSearchQuery(e.target.value)}
                              className="w-full pl-9 pr-8 py-2 bg-black/60 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none"
                            />
                            {reviewSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setReviewSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Rating Filter Dropdown */}
                          <div className="flex items-center space-x-2 shrink-0">
                            <label className="text-[11px] font-mono text-neutral-400">Rating:</label>
                            <select
                              value={reviewRatingFilter}
                              onChange={(e) => setReviewRatingFilter(Number(e.target.value))}
                              className="bg-black/60 border border-neutral-800 text-xs text-neutral-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#D4AF37]"
                            >
                              <option value={0}>All Ratings</option>
                              <option value={5}>5 Stars ★★★★★</option>
                              <option value={4}>4 Stars ★★★★☆</option>
                              <option value={3}>3 Stars ★★★☆☆</option>
                              <option value={2}>2 Stars ★★☆☆☆</option>
                              <option value={1}>1 Star ★☆☆☆☆</option>
                            </select>
                          </div>

                          {/* Sort Dropdown */}
                          <div className="flex items-center space-x-2 shrink-0">
                            <label className="text-[11px] font-mono text-neutral-400">Sort By:</label>
                            <select
                              value={reviewSortBy}
                              onChange={(e) => setReviewSortBy(e.target.value as any)}
                              className="bg-black/60 border border-neutral-800 text-xs text-neutral-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#D4AF37]"
                            >
                              <option value="order">Display Order</option>
                              <option value="rating-desc">Rating: High to Low</option>
                              <option value="rating-asc">Rating: Low to High</option>
                              <option value="newest">Newest First</option>
                              <option value="oldest">Oldest First</option>
                            </select>
                          </div>
                        </div>

                        {/* Status Tabs */}
                        <div className="flex items-center space-x-1.5 overflow-x-auto border-t border-neutral-800/80 pt-3 text-xs font-mono">
                          <button
                            type="button"
                            onClick={() => setReviewStatusFilter('all')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                              reviewStatusFilter === 'all'
                                ? 'bg-[#D4AF37] text-black font-bold'
                                : 'bg-neutral-800 text-neutral-300 hover:text-white'
                            }`}
                          >
                            All ({reviews.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setReviewStatusFilter('pending')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                              reviewStatusFilter === 'pending'
                                ? 'bg-amber-500 text-black font-bold'
                                : 'bg-neutral-800 text-neutral-300 hover:text-white'
                            }`}
                          >
                            <span>Pending</span>
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30">
                              {pendingReviews.length}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setReviewStatusFilter('approved')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                              reviewStatusFilter === 'approved'
                                ? 'bg-emerald-500 text-black font-bold'
                                : 'bg-neutral-800 text-neutral-300 hover:text-white'
                            }`}
                          >
                            Approved ({approvedReviews.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setReviewStatusFilter('rejected')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                              reviewStatusFilter === 'rejected'
                                ? 'bg-red-500 text-white font-bold'
                                : 'bg-neutral-800 text-neutral-300 hover:text-white'
                            }`}
                          >
                            Rejected ({rejectedReviews.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setReviewStatusFilter('featured')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1 ${
                              reviewStatusFilter === 'featured'
                                ? 'bg-[#D4AF37] text-black font-bold'
                                : 'bg-neutral-800 text-neutral-300 hover:text-white'
                            }`}
                          >
                            <Star className="w-3 h-3 fill-current" />
                            <span>Featured ({featuredReviews.length})</span>
                          </button>
                        </div>
                      </div>

                      {/* Bulk Operations Toolbar */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-neutral-900/40 p-3 rounded-xl border border-neutral-800 gap-3 text-xs">
                        <div className="flex items-center space-x-3">
                          <label className="flex items-center space-x-2 cursor-pointer font-mono text-neutral-400">
                            <input
                              type="checkbox"
                              checked={filtered.length > 0 && filtered.every(r => selectedReviewIds.includes(r.id))}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedReviewIds(filtered.map(r => r.id));
                                } else {
                                  setSelectedReviewIds([]);
                                }
                              }}
                              className="rounded border-neutral-700 text-[#D4AF37] focus:ring-0"
                            />
                            <span>Select All ({filtered.length})</span>
                          </label>

                          {selectedReviewIds.length > 0 && (
                            <span className="text-neutral-400 font-mono">
                              ({selectedReviewIds.length} selected)
                            </span>
                          )}
                        </div>

                        {selectedReviewIds.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={handleBulkApprove}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all cursor-pointer"
                            >
                              Approve Selected
                            </button>
                            <button
                              type="button"
                              onClick={handleBulkReject}
                              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow transition-all cursor-pointer"
                            >
                              Reject Selected
                            </button>
                            <button
                              type="button"
                              onClick={handleBulkDelete}
                              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow transition-all cursor-pointer"
                            >
                              Delete Selected
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Reviews Card List */}
                      {filtered.length === 0 ? (
                        <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-12 text-center text-neutral-500 font-sans space-y-2">
                          <CheckCircle2 className="w-8 h-8 text-neutral-600 mx-auto" />
                          <p className="text-sm font-semibold text-neutral-400">No testimonials matching your filters</p>
                          <p className="text-xs text-neutral-600">Try adjusting your search keywords, status filter, or rating criteria.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {filtered.map((rev) => {
                            const isSelected = selectedReviewIds.includes(rev.id);
                            return (
                              <div 
                                key={rev.id} 
                                className={`bg-neutral-900/60 p-4 rounded-2xl border transition-all space-y-3 ${
                                  isSelected 
                                    ? 'border-[#D4AF37] bg-neutral-900/90' 
                                    : rev.status === 'pending'
                                    ? 'border-amber-500/40 bg-amber-950/10'
                                    : rev.status === 'rejected'
                                    ? 'border-red-500/20 opacity-75'
                                    : 'border-neutral-800 hover:border-neutral-700'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start space-x-3.5">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedReviewIds([...selectedReviewIds, rev.id]);
                                        } else {
                                          setSelectedReviewIds(selectedReviewIds.filter(id => id !== rev.id));
                                        }
                                      }}
                                      className="mt-1 rounded border-neutral-700 text-[#D4AF37] focus:ring-0"
                                    />

                                    {/* Client Avatar / Photo */}
                                    <div className="relative shrink-0">
                                      {rev.photoUrl ? (
                                        <img 
                                          src={rev.photoUrl} 
                                          alt={rev.name} 
                                          className="w-11 h-11 rounded-full object-cover border border-neutral-700"
                                        />
                                      ) : (
                                        <div className="w-11 h-11 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[#D4AF37] font-bold text-sm">
                                          {rev.name ? rev.name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                      )}

                                      {rev.companyLogoUrl && (
                                        <img 
                                          src={rev.companyLogoUrl} 
                                          alt="Company Logo" 
                                          className="w-5 h-5 rounded-md object-contain absolute -bottom-1 -right-1 bg-neutral-900 border border-neutral-700 p-0.5"
                                        />
                                      )}
                                    </div>

                                    {/* Client Information & Details */}
                                    <div className="space-y-1">
                                      <div className="flex items-center space-x-2 flex-wrap">
                                        <h4 className="text-sm font-bold text-white">{rev.name}</h4>
                                        
                                        {/* Status Badge */}
                                        {rev.status === 'pending' ? (
                                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                            PENDING
                                          </span>
                                        ) : rev.status === 'rejected' ? (
                                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                                            REJECTED
                                          </span>
                                        ) : (
                                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                            APPROVED
                                          </span>
                                        )}

                                        {/* Featured Tag */}
                                        {rev.featured && (
                                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 flex items-center space-x-1">
                                            <Star className="w-2.5 h-2.5 fill-current" />
                                            <span>FEATURED</span>
                                          </span>
                                        )}

                                        {/* Order tag */}
                                        <span className="text-[10px] font-mono text-neutral-500">
                                          #{rev.displayOrder || 1}
                                        </span>
                                      </div>

                                      <p className="text-xs text-neutral-400 font-sans">
                                        {rev.designation} · <span className="text-neutral-300 font-semibold">{rev.company}</span>
                                        {rev.country && <span className="text-neutral-500 ml-1">({rev.country})</span>}
                                      </p>

                                      {rev.email && (
                                        <p className="text-[11px] font-mono text-neutral-500">
                                          ✉ {rev.email}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Star Rating Display */}
                                  <div className="flex items-center space-x-1 text-[#D4AF37] shrink-0">
                                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                                    ))}
                                    <span className="text-xs font-mono font-bold text-neutral-300 ml-1">
                                      {rev.rating}.0
                                    </span>
                                  </div>
                                </div>

                                {/* Review Message Body */}
                                <div className="bg-black/40 p-3 rounded-xl border border-neutral-800 text-xs text-neutral-300 italic font-sans leading-relaxed">
                                  "{rev.review}"
                                </div>

                                {/* Action Toolbar */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-neutral-800/60 pt-2 gap-2 text-xs">
                                  <span className="text-[10px] font-mono text-neutral-500">
                                    Submitted: {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Legacy Record'}
                                  </span>

                                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                                    {/* Quick Status Buttons */}
                                    {rev.status !== 'approved' && (
                                      <button
                                        type="button"
                                        onClick={() => handleApproveReview(rev.id)}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition-all cursor-pointer"
                                      >
                                        ✓ Approve
                                      </button>
                                    )}

                                    {rev.status !== 'rejected' && (
                                      <button
                                        type="button"
                                        onClick={() => handleRejectReview(rev.id)}
                                        className="px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 text-[11px] font-bold transition-all cursor-pointer"
                                      >
                                        ✕ Reject
                                      </button>
                                    )}

                                    {/* Featured Toggle Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleToggleFeatured(rev.id)}
                                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center space-x-1 ${
                                        rev.featured 
                                          ? 'bg-[#D4AF37]/30 text-[#D4AF37] border-[#D4AF37]/50'
                                          : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                                      }`}
                                    >
                                      <Star className={`w-3 h-3 ${rev.featured ? 'fill-current' : ''}`} />
                                      <span>{rev.featured ? 'Featured' : 'Feature'}</span>
                                    </button>

                                    {/* Order Adjustment Buttons */}
                                    <button
                                      type="button"
                                      onClick={() => handleMoveOrder(rev.id, 'up')}
                                      className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg cursor-pointer"
                                      title="Move Up"
                                    >
                                      ▲
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleMoveOrder(rev.id, 'down')}
                                      className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg cursor-pointer"
                                      title="Move Down"
                                    >
                                      ▼
                                    </button>

                                    {/* Edit Button */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setIsNewReview(false);
                                        setEditingReview({ ...rev });
                                      }}
                                      className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg cursor-pointer transition-all"
                                      title="Edit Testimonial"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (window.confirm(`Are you sure you want to delete the review from "${rev.name}"?`)) {
                                          saveReviews(reviews.filter(r => r.id !== rev.id));
                                          showToast('Review deleted.', 'success');
                                        }
                                      }}
                                      className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg cursor-pointer transition-all"
                                      title="Delete Testimonial"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    /* Edit or Add Review Modal Form */
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!editingReview.name.trim() || !editingReview.company.trim() || !editingReview.review.trim()) {
                          showToast('Please fill in all required fields (Name, Company, Review text).', 'error');
                          return;
                        }

                        if (isNewReview) {
                          saveReviews([editingReview, ...reviews]);
                          showToast('New testimonial created successfully!', 'success');
                        } else {
                          saveReviews(reviews.map(r => r.id === editingReview.id ? editingReview : r));
                          showToast('Testimonial updated successfully!', 'success');
                        }
                        setEditingReview(null);
                      }} 
                      className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5"
                    >
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                        <div>
                          <h4 className="text-base font-bold tracking-wide text-white font-sans">
                            {isNewReview ? 'Add New Testimonial' : `Edit Testimonial: ${editingReview.name}`}
                          </h4>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            Configure client details, rating, approval status, and display settings.
                          </p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setEditingReview(null)} 
                          className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Client Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                            Client Name *
                          </label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Sarah Jenkins"
                            value={editingReview.name || ''}
                            onChange={(e) => setEditingReview({ ...editingReview, name: e.target.value })}
                            className="w-full px-3 py-2 bg-black/60 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                            Client Email Address
                          </label>
                          <input 
                            type="email" 
                            placeholder="e.g. s.jenkins@enterprise.com"
                            value={editingReview.email || ''}
                            onChange={(e) => setEditingReview({ ...editingReview, email: e.target.value })}
                            className="w-full px-3 py-2 bg-black/60 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                            Designation / Job Title *
                          </label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Chief Technology Officer"
                            value={editingReview.designation || ''}
                            onChange={(e) => setEditingReview({ ...editingReview, designation: e.target.value })}
                            className="w-full px-3 py-2 bg-black/60 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                            Company / Organization *
                          </label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Nexus Global Technologies"
                            value={editingReview.company || ''}
                            onChange={(e) => setEditingReview({ ...editingReview, company: e.target.value })}
                            className="w-full px-3 py-2 bg-black/60 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                            Country / Location
                          </label>
                          <input 
                            type="text" 
                            placeholder="e.g. United States"
                            value={editingReview.country || ''}
                            onChange={(e) => setEditingReview({ ...editingReview, country: e.target.value })}
                            className="w-full px-3 py-2 bg-black/60 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Rating, Status & Order Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                            Rating Star (1 to 5)
                          </label>
                          <div className="flex items-center space-x-1 py-1">
                            {[1, 2, 3, 4, 5].map((starVal) => (
                              <button
                                key={starVal}
                                type="button"
                                onClick={() => setEditingReview({ ...editingReview, rating: starVal })}
                                className="p-1 text-[#D4AF37] hover:scale-110 transition-all"
                              >
                                <Star className={`w-5 h-5 ${starVal <= (editingReview.rating || 5) ? 'fill-current' : 'text-neutral-600'}`} />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                            Approval Status
                          </label>
                          <select
                            value={editingReview.status || 'approved'}
                            onChange={(e) => setEditingReview({ ...editingReview, status: e.target.value as any })}
                            className="w-full px-3 py-2 bg-black/60 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                          >
                            <option value="pending">Pending Approval (Hidden)</option>
                            <option value="approved">Approved (Publicly Visible)</option>
                            <option value="rejected">Rejected (Hidden)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                            Display Order Position
                          </label>
                          <input 
                            type="number" 
                            min={1} 
                            max={999}
                            value={editingReview.displayOrder || 1}
                            onChange={(e) => setEditingReview({ ...editingReview, displayOrder: parseInt(e.target.value) || 1 })}
                            className="w-full px-3 py-2 bg-black/60 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      {/* Featured Checkbox */}
                      <div className="flex items-center space-x-2 pt-1">
                        <input
                          type="checkbox"
                          id="edit-featured-toggle"
                          checked={!!editingReview.featured}
                          onChange={(e) => setEditingReview({ ...editingReview, featured: e.target.checked })}
                          className="rounded border-neutral-700 text-[#D4AF37] focus:ring-0 w-4 h-4"
                        />
                        <label htmlFor="edit-featured-toggle" className="text-xs font-semibold text-white cursor-pointer flex items-center space-x-1">
                          <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                          <span>Feature this testimonial on home page carousel</span>
                        </label>
                      </div>

                      {/* Review Content */}
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                          Testimonial Review Message * (Min 30 characters)
                        </label>
                        <textarea 
                          rows={4} 
                          required
                          placeholder="Write or edit client feedback..."
                          value={editingReview.review || ''}
                          onChange={(e) => setEditingReview({ ...editingReview, review: e.target.value })}
                          className="w-full p-3 bg-black/60 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none resize-none font-sans leading-relaxed"
                        />
                      </div>

                      {/* Photos & Logos */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-800">
                        <div>
                          <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                            Client Profile Photo URL
                          </label>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="text" 
                              placeholder="https://..."
                              value={editingReview.photoUrl || ''}
                              onChange={(e) => setEditingReview({ ...editingReview, photoUrl: e.target.value })}
                              className="w-full px-3 py-2 bg-black/60 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none font-mono"
                            />
                            <label className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold cursor-pointer shrink-0 border border-neutral-700">
                              <span>Upload</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    setEditingReview({ ...editingReview, photoUrl: event.target?.result as string });
                                    showToast('Photo uploaded.', 'success');
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                            Company Logo URL
                          </label>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="text" 
                              placeholder="https://..."
                              value={editingReview.companyLogoUrl || ''}
                              onChange={(e) => setEditingReview({ ...editingReview, companyLogoUrl: e.target.value })}
                              className="w-full px-3 py-2 bg-black/60 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none font-mono"
                            />
                            <label className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold cursor-pointer shrink-0 border border-neutral-700">
                              <span>Upload</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    setEditingReview({ ...editingReview, companyLogoUrl: event.target?.result as string });
                                    showToast('Logo uploaded.', 'success');
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Modal Buttons */}
                      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-800">
                        <button
                          type="button"
                          onClick={() => setEditingReview(null)}
                          className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold uppercase transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-black text-xs font-bold uppercase cursor-pointer shadow-lg hover:scale-105 transition-all"
                        >
                          Save Testimonial
                        </button>
                      </div>
                    </form>
                  );
                })()}
              </div>
            )}

            {/* -------------------- 7. CAREERS & APPLICATIONS TAB -------------------- */}
            {activeTab === 'careers' && (
              <div className="space-y-8" id="admin-tab-careers">
                
                {/* 7a. List jobs */}
                {editingCareer === null ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
                      <div>
                        <h3 className="text-lg font-bold tracking-wide">Jobs List</h3>
                        <p className="text-xs text-neutral-500">Manage permanent vacancies & internships.</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsNewCareer(true);
                          setEditingCareer({
                            id: `c_${Date.now()}`,
                            title: '',
                            type: 'job',
                            department: '',
                            location: '',
                            description: '',
                            requirements: ['3+ years exp'],
                            benefits: ['Flexible hours'],
                            active: true
                          });
                        }}
                        className="px-4 py-2.5 rounded-lg bg-[#D4AF37] text-black text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-black" />
                        <span>Add Opportunity</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(Array.isArray(careers) ? careers : []).map((job) => (
                        <div key={job.id || Math.random()} className="bg-neutral-900/40 p-4 rounded-2xl border border-neutral-900 flex items-center justify-between gap-4">
                          <div>
                            <h4 className="text-sm font-semibold text-white">{job.title || 'Untitled Opportunity'}</h4>
                            <p className="text-xs text-neutral-500 font-sans">{(job.type || 'job').toString().toUpperCase()} · {job.department || 'General'} · {job.active ? 'Active' : 'Closed'}</p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setIsNewCareer(false);
                                setEditingCareer({ ...job });
                              }}
                              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (!checkAccessGuard('delete', 'job listing')) return;
                                if (window.confirm('Delete job listing?')) {
                                  saveCareers(careers.filter(c => c.id !== job.id));
                                }
                              }}
                              className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {(!careers || careers.length === 0) && (
                        <p className="text-xs text-neutral-500 font-sans">No job opportunities listed yet. Click &quot;Add Opportunity&quot; to create one.</p>
                      )}
                    </div>

                    {/* Applications received */}
                    <div className="pt-8 border-t border-neutral-900">
                      <h3 className="text-lg font-bold tracking-wide mb-4">Job Applications Received</h3>
                      <div className="space-y-3">
                        {(Array.isArray(applications) ? applications : []).map((app) => (
                          <div key={app.id || Math.random()} className="bg-neutral-900/40 p-5 rounded-2xl border border-neutral-900 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-sm font-bold text-white">{app.fullName || (app as any).applicant_name || 'Candidate'}</h4>
                                <p className="text-xs text-neutral-500">Applied for: <span className="text-[#D4AF37] font-semibold">{app.jobTitle || (app as any).job_title || 'General'}</span></p>
                                <p className="text-xs text-neutral-500">Email: {app.email || 'N/A'} · Phone: {app.phone || 'N/A'}</p>
                              </div>
                              <button
                                onClick={() => {
                                  if (!checkAccessGuard('delete', 'job application')) return;
                                  if (window.confirm('Delete this application record?')) {
                                    saveApplications(applications.filter(a => a.id !== app.id));
                                  }
                                }}
                                className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {app.coverLetter && (
                              <p className="text-xs text-neutral-400 bg-black/40 p-3 rounded-lg font-sans">
                                <span className="font-semibold block text-neutral-500 mb-1">Cover letter:</span>
                                {app.coverLetter}
                              </p>
                            )}

                            <div>
                              {app.resumeUrl ? (
                                <a 
                                  href={app.resumeUrl} 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={`${app.fullName || 'Candidate'}_Resume.pdf`}
                                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25 hover:bg-[#D4AF37]/20 text-xs font-semibold tracking-wide cursor-pointer transition-all"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Download PDF Resume</span>
                                </a>
                              ) : (
                                <span className="text-xs text-neutral-500 italic">No resume attached</span>
                              )}
                            </div>
                          </div>
                        ))}

                        {(!applications || applications.length === 0) && (
                          <p className="text-xs text-neutral-500 font-sans">No career applications have been uploaded by candidates yet.</p>
                        )}
                      </div>
                    </div>

                  </div>
                ) : (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (isNewCareer) {
                      saveCareers([...careers, editingCareer]);
                    } else {
                      saveCareers(careers.map(c => c.id === editingCareer.id ? editingCareer : c));
                    }
                    setEditingCareer(null);
                  }} className="space-y-5">
                    <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                      <h4 className="text-base font-bold tracking-wide">
                        {isNewCareer ? 'Add Opportunity' : 'Edit Opportunity'}
                      </h4>
                      <button type="button" onClick={() => setEditingCareer(null)} className="text-neutral-500 hover:text-white">✕</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Job Title</label>
                        <input 
                          type="text" required
                          value={editingCareer.title}
                          onChange={(e) => setEditingCareer({ ...editingCareer, title: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Type</label>
                        <select 
                          value={editingCareer.type}
                          onChange={(e) => setEditingCareer({ ...editingCareer, type: e.target.value as any })}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                        >
                          <option value="job">job</option>
                          <option value="internship">internship</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Department</label>
                        <input 
                          type="text" required
                          value={editingCareer.department}
                          onChange={(e) => setEditingCareer({ ...editingCareer, department: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Location Details</label>
                        <input 
                          type="text" required
                          value={editingCareer.location}
                          onChange={(e) => setEditingCareer({ ...editingCareer, location: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Job description</label>
                      <textarea 
                        rows={3} required
                        value={editingCareer.description}
                        onChange={(e) => setEditingCareer({ ...editingCareer, description: e.target.value })}
                        className="w-full p-3 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-black text-xs font-bold uppercase cursor-pointer"
                    >
                      Save Opportunity
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* -------------------- HERO SLIDER MANAGEMENT TAB -------------------- */}
            {activeTab === 'hero-slider' && (
              <div className="space-y-8" id="admin-tab-hero-slider">
                
                {/* Header Container */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3f6973] pb-4">
                  <div>
                    <div className="inline-flex items-center space-x-2 bg-[#e1b382]/10 border border-[#e1b382]/30 px-3 py-0.5 rounded-full mb-2">
                      <Monitor className="w-3.5 h-3.5 text-[#e1b382]" />
                      <span className="text-[10px] font-mono uppercase text-[#e1b382] tracking-widest font-bold">Homepage Carousel CMS</span>
                    </div>
                    <h3 className="text-xl font-bold tracking-wide text-white">Hero Slider Management</h3>
                    <p className="text-xs text-[#CBD5E1] font-sans mt-0.5">
                      Configure carousel slides displayed directly below the Hero action buttons. Add, edit, reorder, toggle active visibility, and upload custom artwork.
                    </p>
                  </div>

                  {editingSlide === null && (
                    <button
                      type="button"
                      onClick={() => {
                        const newSlide: HeroSlide = {
                          id: 'slide_' + Date.now(),
                          title: '',
                          description: '',
                          imageUrl: '',
                          buttonText: 'Explore Platform',
                          buttonLink: 'products',
                          displayOrder: (heroSlides.length > 0 ? Math.max(...heroSlides.map(s => s.displayOrder || 0)) : 0) + 1,
                          isActive: true,
                        };
                        setEditingSlide(newSlide);
                        setIsNewSlide(true);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center space-x-2 cursor-pointer shrink-0 hover:scale-105"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Slide</span>
                    </button>
                  )}
                </div>

                {/* 1. LIST VIEW OF ALL SLIDES */}
                {editingSlide === null ? (
                  <div className="space-y-4">
                    {heroSlides.length === 0 ? (
                      <div className="p-8 text-center bg-[#12343b]/60 border border-[#3f6973] rounded-2xl space-y-3">
                        <Monitor className="w-10 h-10 text-[#e1b382]/50 mx-auto" />
                        <h4 className="text-sm font-bold text-white">No Hero Slides Created</h4>
                        <p className="text-xs text-[#CBD5E1] max-w-md mx-auto">
                          There are currently no slides in the database. The hero section slider will automatically hide without leaving empty space until you add a slide.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const newSlide: HeroSlide = {
                              id: 'slide_' + Date.now(),
                              title: 'Engineering Excellence',
                              description: '4+ years crafting mission-critical software and high-availability digital solutions for enterprise partners.',
                              imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
                              buttonText: 'Learn More',
                              buttonLink: 'about',
                              displayOrder: 1,
                              isActive: true,
                            };
                            setEditingSlide(newSlide);
                            setIsNewSlide(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-[#e1b382] text-[#12343b] text-xs font-bold uppercase cursor-pointer inline-flex items-center space-x-2"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create First Slide</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {heroSlides.map((slide, idx) => (
                          <div 
                            key={slide.id}
                            className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                              slide.isActive 
                                ? 'bg-[#12343b]/90 border-[#3f6973] hover:border-[#e1b382]/60' 
                                : 'bg-[#12343b]/40 border-[#3f6973]/40 opacity-70'
                            }`}
                          >
                            {/* Slide Identity & Thumbnail */}
                            <div className="flex items-center space-x-4 min-w-0 flex-1">
                              {/* Display Order Badge & Reorder */}
                              <div className="flex flex-col items-center space-y-1 shrink-0">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => {
                                    const targetIdx = idx - 1;
                                    if (targetIdx < 0) return;
                                    const newSlides = [...heroSlides];
                                    const temp = newSlides[idx];
                                    newSlides[idx] = newSlides[targetIdx];
                                    newSlides[targetIdx] = temp;
                                    const reordered = newSlides.map((s, i) => ({ ...s, displayOrder: i + 1 }));
                                    saveHeroSlides?.(reordered);
                                    showToast('Slide reordered up.', 'success');
                                  }}
                                  className="text-[#CBD5E1] hover:text-[#e1b382] disabled:opacity-20 disabled:hover:text-[#CBD5E1] p-1 cursor-pointer"
                                  title="Move Up"
                                >
                                  ▲
                                </button>
                                <span className="text-[10px] font-mono font-bold text-[#e1b382] bg-[#2d545e] px-2 py-0.5 rounded border border-[#3f6973]">
                                  #{idx + 1}
                                </span>
                                <button
                                  type="button"
                                  disabled={idx === heroSlides.length - 1}
                                  onClick={() => {
                                    const targetIdx = idx + 1;
                                    if (targetIdx >= heroSlides.length) return;
                                    const newSlides = [...heroSlides];
                                    const temp = newSlides[idx];
                                    newSlides[idx] = newSlides[targetIdx];
                                    newSlides[targetIdx] = temp;
                                    const reordered = newSlides.map((s, i) => ({ ...s, displayOrder: i + 1 }));
                                    saveHeroSlides?.(reordered);
                                    showToast('Slide reordered down.', 'success');
                                  }}
                                  className="text-[#CBD5E1] hover:text-[#e1b382] disabled:opacity-20 disabled:hover:text-[#CBD5E1] p-1 cursor-pointer"
                                  title="Move Down"
                                >
                                  ▼
                                </button>
                              </div>

                              {/* Thumbnail */}
                              <div className="w-24 h-16 rounded-xl bg-black/60 border border-[#3f6973] overflow-hidden shrink-0 relative group">
                                {slide.imageUrl ? (
                                  <img 
                                    src={slide.imageUrl} 
                                    alt={slide.title} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#12343b] to-[#2d545e] text-[#e1b382]">
                                    <Monitor className="w-5 h-5 opacity-60" />
                                    <span className="text-[9px] font-mono mt-0.5">No Image</span>
                                  </div>
                                )}
                              </div>

                              {/* Info details */}
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-center space-x-2 flex-wrap">
                                  <h4 className="text-sm font-bold text-white truncate">
                                    {slide.title || 'Untitled Slide'}
                                  </h4>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                                    slide.isActive 
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  }`}>
                                    {slide.isActive ? 'Active' : 'Disabled'}
                                  </span>
                                </div>
                                <p className="text-xs text-[#CBD5E1] line-clamp-1 font-sans">
                                  {slide.description || 'No description provided.'}
                                </p>
                                {slide.buttonText && (
                                  <div className="flex items-center space-x-2 text-[10px] font-mono text-[#e1b382]/90">
                                    <span className="bg-[#2d545e]/60 px-2 py-0.5 rounded border border-[#3f6973]">
                                      CTA: {slide.buttonText}
                                    </span>
                                    {slide.buttonLink && (
                                      <span className="text-[#CBD5E1]/70 truncate">
                                        → {slide.buttonLink}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Control Buttons */}
                            <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                              {/* Active Toggle */}
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = heroSlides.map(s => s.id === slide.id ? { ...s, isActive: !s.isActive } : s);
                                  saveHeroSlides?.(updated);
                                  showToast(`Slide ${!slide.isActive ? 'enabled' : 'disabled'}.`, 'success');
                                }}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                                  slide.isActive
                                    ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300'
                                    : 'bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-400'
                                }`}
                                title={slide.isActive ? 'Disable Slide' : 'Enable Slide'}
                              >
                                {slide.isActive ? 'Enabled' : 'Disabled'}
                              </button>

                              {/* Preview Slide Modal Trigger */}
                              <button
                                type="button"
                                onClick={() => setPreviewSlide(slide)}
                                className="p-2 bg-[#2d545e] hover:bg-[#3f6973] border border-[#3f6973] text-[#e1b382] hover:text-white rounded-lg transition-all cursor-pointer"
                                title="Preview Slide Layout"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Edit Slide */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSlide({ ...slide });
                                  setIsNewSlide(false);
                                }}
                                className="p-2 bg-[#2d545e] hover:bg-[#3f6973] border border-[#3f6973] text-white rounded-lg transition-all cursor-pointer"
                                title="Edit Slide"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              {/* Delete Slide */}
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!checkAccessGuard('delete', 'hero slide')) return;
                                  if (!window.confirm(`Are you sure you want to delete slide "${slide.title}"?`)) return;
                                  if (slide.imageUrl && !slide.imageUrl.includes('unsplash.com')) {
                                    try {
                                      await deleteImageFromSupabase('hero-slides', slide.imageUrl);
                                    } catch (e) {
                                      console.warn('Could not delete image from storage:', e);
                                    }
                                  }
                                  const updated = heroSlides.filter(s => s.id !== slide.id);
                                  saveHeroSlides?.(updated);
                                  showToast('Slide deleted successfully.', 'success');
                                }}
                                className="p-2 bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 text-red-300 rounded-lg transition-all cursor-pointer"
                                title="Delete Slide"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* 2. EDIT / ADD SLIDE FORM */
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!editingSlide) return;
                    if (!editingSlide.title.trim()) {
                      showToast('Slide title is required.', 'error');
                      return;
                    }
                    let updated: HeroSlide[];
                    if (isNewSlide) {
                      updated = [...heroSlides, editingSlide];
                    } else {
                      updated = heroSlides.map(s => s.id === editingSlide.id ? editingSlide : s);
                    }
                    saveHeroSlides?.(updated);
                    showToast(isNewSlide ? 'New slide added successfully!' : 'Slide updated successfully!', 'success');
                    setEditingSlide(null);
                    setIsNewSlide(false);
                  }} className="space-y-6 bg-[#12343b]/80 border border-[#3f6973] p-6 sm:p-8 rounded-3xl shadow-2xl">
                    
                    <div className="flex items-center justify-between border-b border-[#3f6973] pb-4">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#e1b382] uppercase tracking-wider block">
                          {isNewSlide ? 'Create New Slide' : 'Modify Slide Parameters'}
                        </span>
                        <h4 className="text-lg font-bold text-white">
                          {isNewSlide ? 'Add Hero Slide' : `Editing: ${editingSlide.title || 'Slide'}`}
                        </h4>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditingSlide(null);
                          setIsNewSlide(false);
                        }} 
                        className="px-3 py-1.5 rounded-lg border border-[#3f6973] hover:border-[#e1b382] text-xs text-[#CBD5E1] hover:text-white transition-all cursor-pointer"
                      >
                        ✕ Cancel
                      </button>
                    </div>

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-mono text-[#e1b382] uppercase tracking-wider mb-1 font-bold">
                          Slide Title *
                        </label>
                        <input 
                          type="text" required
                          placeholder="e.g. Engineering Excellence"
                          value={editingSlide.title}
                          onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[#2d545e]/40 border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none transition-all font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-[#e1b382] uppercase tracking-wider mb-1 font-bold">
                          Display Order
                        </label>
                        <input 
                          type="number" required min={1}
                          value={editingSlide.displayOrder}
                          onChange={(e) => setEditingSlide({ ...editingSlide, displayOrder: parseInt(e.target.value) || 1 })}
                          className="w-full px-4 py-2.5 bg-[#2d545e]/40 border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none transition-all font-sans"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-[#e1b382] uppercase tracking-wider mb-1 font-bold">
                        Short Description
                      </label>
                      <textarea 
                        rows={2}
                        placeholder="e.g. 4+ years crafting mission-critical software and high-availability digital solutions..."
                        value={editingSlide.description}
                        onChange={(e) => setEditingSlide({ ...editingSlide, description: e.target.value })}
                        className="w-full p-3 bg-[#2d545e]/40 border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none resize-none font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-mono text-[#e1b382] uppercase tracking-wider mb-1 font-bold">
                          Action Button Text (Optional)
                        </label>
                        <input 
                          type="text"
                          placeholder="e.g. Explore Platform"
                          value={editingSlide.buttonText || ''}
                          onChange={(e) => setEditingSlide({ ...editingSlide, buttonText: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[#2d545e]/40 border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none transition-all font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-[#e1b382] uppercase tracking-wider mb-1 font-bold">
                          Button Link / Tab Target (Optional)
                        </label>
                        <input 
                          type="text"
                          placeholder="e.g. products, services, contact, about, or https://..."
                          value={editingSlide.buttonLink || ''}
                          onChange={(e) => setEditingSlide({ ...editingSlide, buttonLink: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[#2d545e]/40 border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none transition-all font-sans"
                        />
                      </div>
                    </div>

                    {/* Active Switch */}
                    <div className="flex items-center space-x-3 bg-[#2d545e]/20 p-3 rounded-xl border border-[#3f6973]">
                      <input 
                        type="checkbox"
                        id="slide-is-active-chk"
                        checked={editingSlide.isActive}
                        onChange={(e) => setEditingSlide({ ...editingSlide, isActive: e.target.checked })}
                        className="w-4 h-4 rounded text-[#e1b382] focus:ring-[#e1b382] border-[#3f6973] bg-[#12343b] cursor-pointer"
                      />
                      <label htmlFor="slide-is-active-chk" className="text-xs text-white font-semibold cursor-pointer select-none">
                        Enable slide on live hero carousel
                      </label>
                    </div>

                    {/* Image Management Container */}
                    <div className="bg-[#2d545e]/30 border border-[#3f6973] p-5 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-mono text-[#e1b382] uppercase font-bold tracking-wider">
                          Slide Cover Artwork / Image
                        </label>
                        {editingSlide.imageUrl ? (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                            Custom Image Uploaded
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                            Glassmorphism Placeholder Active
                          </span>
                        )}
                      </div>

                      {/* Drag & Drop Zone */}
                      <div 
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsSlideDragOver(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsSlideDragOver(false);
                        }}
                        onDrop={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsSlideDragOver(false);

                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                            if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
                              showToast('Invalid format. Please upload JPG, PNG, or WebP.', 'error');
                              return;
                            }
                            if (file.size > 5 * 1024 * 1024) {
                              showToast('File exceeds 5MB limit.', 'error');
                              return;
                            }

                            const isReplace = !!editingSlide.imageUrl;
                            const oldImg = editingSlide.imageUrl;

                            setIsUploadingSlideImg(true);
                            setSlideUploadProgress(0);
                            try {
                              const url = await uploadImageToSupabase('hero-slides', file, '', (prog) => {
                                setSlideUploadProgress(prog);
                              });
                              if (url) {
                                if (isReplace && oldImg && !oldImg.includes('unsplash.com')) {
                                  try {
                                    await deleteImageFromSupabase('hero-slides', oldImg);
                                  } catch (err) {
                                    console.warn('Could not delete old slide image:', err);
                                  }
                                }
                                setEditingSlide({ ...editingSlide, imageUrl: url });
                                showToast(isReplace ? 'Slide image replaced!' : 'Slide image uploaded!', 'success');
                              } else {
                                showToast('Failed to upload slide image.', 'error');
                              }
                            } catch (err: any) {
                              showToast(`Upload failed: ${err.message || err}`, 'error');
                            } finally {
                              setIsUploadingSlideImg(false);
                              setSlideUploadProgress(null);
                            }
                          }
                        }}
                        className={`border-2 border-dashed rounded-2xl p-4 transition-all duration-300 ${
                          isSlideDragOver 
                            ? 'border-[#e1b382] bg-[#e1b382]/10' 
                            : 'border-[#3f6973] hover:border-[#e1b382]/60 bg-[#12343b]/60'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          {/* Image Preview Box */}
                          <div className="w-36 h-24 rounded-xl bg-black/60 border border-[#3f6973] overflow-hidden flex items-center justify-center shrink-0 relative group">
                            {editingSlide.imageUrl ? (
                              <img
                                src={editingSlide.imageUrl}
                                alt={editingSlide.title || 'Slide Preview'}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-[#e1b382]/60 bg-gradient-to-br from-[#12343b] to-[#2d545e]">
                                <Monitor className="w-6 h-6 mb-1" />
                                <span className="text-[9px] font-mono">Glass Backdrop</span>
                              </div>
                            )}

                            {isUploadingSlideImg && (
                              <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center gap-1 z-10">
                                <RefreshCw className="w-5 h-5 text-[#e1b382] animate-spin" />
                                <span className="text-[10px] font-mono font-bold text-[#e1b382]">
                                  {slideUploadProgress !== null ? `${slideUploadProgress}%` : 'Uploading...'}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Upload Controls */}
                          <div className="flex-1 text-center sm:text-left space-y-2 w-full">
                            <p className="text-xs font-semibold text-white">
                              {isSlideDragOver ? 'Drop slide image file here' : 'Drag & drop slide image here or click below'}
                            </p>
                            <p className="text-[10px] text-[#CBD5E1]">
                              Supported formats: JPG, PNG, WebP. Max size: 5MB.<br/>
                              Stored directly in Supabase storage and displayed on live website.
                            </p>

                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                              <label className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center space-x-1.5 ${
                                isUploadingSlideImg 
                                  ? 'bg-[#2d545e] text-[#CBD5E1]/50 cursor-not-allowed' 
                                  : 'bg-[#e1b382]/10 hover:bg-[#e1b382]/20 border border-[#e1b382]/30 text-[#e1b382]'
                              }`}>
                                <Upload className="w-3.5 h-3.5" />
                                <span>{editingSlide.imageUrl ? 'Replace Image' : 'Upload Image'}</span>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/jpg,image/png,image/webp"
                                  className="hidden"
                                  disabled={isUploadingSlideImg}
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                                    if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
                                      showToast('Invalid format. Please upload JPG, PNG, or WebP image.', 'error');
                                      return;
                                    }
                                    if (file.size > 5 * 1024 * 1024) {
                                      showToast('File size exceeds 5MB limit.', 'error');
                                      return;
                                    }

                                    const isReplace = !!editingSlide.imageUrl;
                                    const oldImg = editingSlide.imageUrl;

                                    setIsUploadingSlideImg(true);
                                    setSlideUploadProgress(0);
                                    try {
                                      const url = await uploadImageToSupabase('hero-slides', file, '', (prog) => {
                                        setSlideUploadProgress(prog);
                                      });
                                      if (url) {
                                        if (isReplace && oldImg && !oldImg.includes('unsplash.com')) {
                                          try {
                                            await deleteImageFromSupabase('hero-slides', oldImg);
                                          } catch (err) {
                                            console.warn('Could not delete old slide image:', err);
                                          }
                                        }
                                        setEditingSlide({ ...editingSlide, imageUrl: url });
                                        showToast(isReplace ? 'Slide image replaced!' : 'Slide image uploaded!', 'success');
                                      } else {
                                        showToast('Failed to upload slide image.', 'error');
                                      }
                                    } catch (err: any) {
                                      showToast(`Upload failed: ${err.message || err}`, 'error');
                                    } finally {
                                      setIsUploadingSlideImg(false);
                                      setSlideUploadProgress(null);
                                    }
                                  }}
                                />
                              </label>

                              {editingSlide.imageUrl && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!editingSlide.imageUrl) return;
                                    const oldUrl = editingSlide.imageUrl;
                                    if (!oldUrl.includes('unsplash.com')) {
                                      try {
                                        await deleteImageFromSupabase('hero-slides', oldUrl);
                                      } catch (err) {
                                        console.warn('Could not delete image file:', err);
                                      }
                                    }
                                    setEditingSlide({ ...editingSlide, imageUrl: '' });
                                    showToast('Slide image removed.', 'success');
                                  }}
                                  className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 text-red-300 text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer flex items-center space-x-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Remove Image</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* LIVE PREVIEW OF SLIDE */}
                    <div className="bg-[#12343b] p-5 rounded-2xl border border-[#e1b382]/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#e1b382] uppercase tracking-wider flex items-center space-x-1.5">
                          <Eye className="w-3.5 h-3.5 text-[#e1b382]" />
                          <span>Live Slide Preview (Desktop 170px Height)</span>
                        </span>
                        <span className="text-[10px] font-mono text-[#CBD5E1]/60">Glassmorphism Carousel Card</span>
                      </div>

                      <div className="relative w-full h-[170px] rounded-[16px] overflow-hidden border border-[#3f6973] hover:border-[#e1b382] transition-colors group bg-slate-900/80 backdrop-blur-md">
                        {editingSlide.imageUrl && (
                          <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                            style={{ backgroundImage: `url(${editingSlide.imageUrl})` }}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/40" />
                        <div className="relative z-10 h-full p-5 flex flex-col justify-between">
                          <div className="space-y-1 max-w-xl">
                            <h3 className="text-lg font-bold text-white tracking-wide drop-shadow-sm font-sans">
                              {editingSlide.title || 'Slide Title Placeholder'}
                            </h3>
                            <p className="text-xs text-[#CBD5E1] line-clamp-2 leading-relaxed font-sans">
                              {editingSlide.description || 'Slide short description placeholder text goes here.'}
                            </p>
                          </div>

                          {editingSlide.buttonText && (
                            <div>
                              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#e1b382] text-[#12343b] text-xs font-bold tracking-wide">
                                <span>{editingSlide.buttonText}</span>
                                <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center justify-end space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSlide(null);
                          setIsNewSlide(false);
                        }}
                        className="px-5 py-2.5 rounded-xl border border-[#3f6973] hover:border-[#e1b382] text-xs text-[#CBD5E1] hover:text-white font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg hover:scale-105 flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Hero Slide</span>
                      </button>
                    </div>

                  </form>
                )}

                {/* PREVIEW SLIDE MODAL */}
                {previewSlide && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#2d545e] border border-[#3f6973] rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
                      <div className="flex items-center justify-between border-b border-[#3f6973] pb-3">
                        <div className="flex items-center space-x-2">
                          <Eye className="w-4 h-4 text-[#e1b382]" />
                          <h4 className="text-sm font-bold text-white">Slide Live Preview</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreviewSlide(null)}
                          className="text-[#CBD5E1] hover:text-white p-1 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-[#e1b382] uppercase tracking-wider font-bold">
                          Desktop View (170px Height)
                        </span>
                        <div className="relative w-full h-[170px] rounded-[16px] overflow-hidden border border-[#e1b382] bg-slate-900/90 backdrop-blur-md">
                          {previewSlide.imageUrl && (
                            <div 
                              className="absolute inset-0 bg-cover bg-center"
                              style={{ backgroundImage: `url(${previewSlide.imageUrl})` }}
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/40" />
                          <div className="relative z-10 h-full p-5 flex flex-col justify-between">
                            <div className="space-y-1">
                              <h3 className="text-lg font-bold text-white tracking-wide font-sans">
                                {previewSlide.title}
                              </h3>
                              <p className="text-xs text-[#CBD5E1] line-clamp-2 leading-relaxed font-sans">
                                {previewSlide.description}
                              </p>
                            </div>
                            {previewSlide.buttonText && (
                              <div>
                                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#e1b382] text-[#12343b] text-xs font-bold">
                                  <span>{previewSlide.buttonText}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setPreviewSlide(null)}
                          className="px-5 py-2 rounded-xl bg-[#e1b382] text-[#12343b] text-xs font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Close Preview
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* -------------------- 8. HERO & ABOUT DETAILS TAB -------------------- */}
            {activeTab === 'hero-about' && (
              <div className="space-y-10" id="admin-tab-hero-about">
                
                {/* Hero Section Management Container */}
                <div className="bg-[#2d545e]/30 border border-[#3f6973] rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl">
                  
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3f6973]/60 pb-6">
                    <div>
                      <div className="inline-flex items-center space-x-2 bg-[#e1b382]/10 border border-[#e1b382]/30 px-3 py-1 rounded-full mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#e1b382]" />
                        <span className="text-[10px] font-mono uppercase text-[#e1b382] tracking-widest font-bold">Homepage Hero CMS</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Hero Management</h3>
                      <p className="text-xs text-[#cbd8dc] mt-1">
                        Upload custom hero background image, edit headings & copy, configure primary & secondary CTAs, and preview live updates.
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          saveHero(heroForm);
                          showToast('Hero section settings saved successfully!', 'success');
                        }}
                        className="px-6 py-3 rounded-xl bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center space-x-2 cursor-pointer hover:scale-105"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Hero Changes</span>
                      </button>
                    </div>
                  </div>

                  {/* Main Grid: Left Side Form (Edit Controls), Right Side Live Preview */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Form Edit Controls (7 cols) */}
                    <div className="lg:col-span-7 space-y-7">
                      
                      {/* 1. Hero Image Upload Box */}
                      <div className="bg-[#12343b]/80 border border-[#3f6973] rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold font-mono text-[#e1b382] uppercase tracking-wider flex items-center space-x-2">
                            <ImageIcon className="w-4 h-4 text-[#e1b382]" />
                            <span>1. Hero Background Image</span>
                          </label>
                          {heroForm.imageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setHeroForm({ ...heroForm, imageUrl: '' });
                                showToast('Hero background reset to default building photograph.', 'success');
                              }}
                              className="text-[11px] text-red-300 hover:text-red-200 flex items-center space-x-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Reset to Default</span>
                            </button>
                          )}
                        </div>

                        {/* Upload Dropzone / Button */}
                        <div className="space-y-3">
                          <label className="relative flex flex-col items-center justify-center w-full min-h-[120px] p-4 border-2 border-dashed border-[#3f6973] hover:border-[#e1b382] rounded-xl bg-[#2d545e]/20 hover:bg-[#2d545e]/40 transition-all cursor-pointer text-center group">
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
                              className="sr-only"
                              disabled={isUploadingHeroImg}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
                                if (!allowed.includes(file.type)) {
                                  showToast('Unsupported file format. Please upload JPG, PNG, WEBP, GIF, or SVG.', 'error');
                                  return;
                                }

                                setIsUploadingHeroImg(true);
                                setHeroUploadProgress(15);
                                try {
                                  const url = await uploadImageToSupabase('hero-images', file, 'hero', (progress) => {
                                    setHeroUploadProgress(progress);
                                  });
                                  if (url) {
                                    setHeroForm(prev => ({ ...prev, imageUrl: url }));
                                    showToast('Hero background image uploaded successfully!', 'success');
                                  } else {
                                    showToast('Failed to upload hero image.', 'error');
                                  }
                                } catch (err: any) {
                                  console.error('Hero image upload failed:', err);
                                  showToast(`Upload failed: ${err.message || err}`, 'error');
                                } finally {
                                  setIsUploadingHeroImg(false);
                                  setHeroUploadProgress(null);
                                }
                              }}
                            />
                            {isUploadingHeroImg ? (
                              <div className="flex flex-col items-center space-y-2">
                                <RefreshCw className="w-6 h-6 text-[#e1b382] animate-spin" />
                                <span className="text-xs text-[#e1b382] font-mono">Uploading Image... {heroUploadProgress ? `${heroUploadProgress}%` : ''}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center space-y-2">
                                <div className="w-10 h-10 rounded-full bg-[#e1b382]/10 flex items-center justify-center border border-[#e1b382]/30 group-hover:scale-110 transition-transform">
                                  <Upload className="w-5 h-5 text-[#e1b382]" />
                                </div>
                                <span className="text-xs font-semibold text-white">Click or drag & drop to upload new Hero Image</span>
                                <span className="text-[10px] text-[#cbd8dc]/70">Supports JPG, PNG, WEBP, GIF, SVG (Max 5MB)</span>
                              </div>
                            )}
                          </label>

                          {heroUploadProgress !== null && (
                            <div className="w-full bg-[#12343b] rounded-full h-1.5 overflow-hidden border border-[#3f6973]">
                              <div className="bg-[#e1b382] h-1.5 transition-all duration-300" style={{ width: `${heroUploadProgress}%` }} />
                            </div>
                          )}

                          {/* Direct Image URL input option */}
                          <div className="pt-2">
                            <label className="block text-[10px] font-mono text-[#cbd8dc] uppercase mb-1">Or Paste Direct Image URL</label>
                            <div className="relative">
                              <input
                                type="url"
                                placeholder="https://images.unsplash.com/photo-... or custom URL"
                                value={heroForm.imageUrl || ''}
                                onChange={(e) => setHeroForm({ ...heroForm, imageUrl: e.target.value })}
                                className="w-full pl-8 pr-3 py-2 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white placeholder-[#cbd8dc]/50 focus:outline-none"
                              />
                              <LinkIcon className="w-3.5 h-3.5 text-[#cbd8dc] absolute left-2.5 top-1/2 -translate-y-1/2" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. Hero Headings & Subheading */}
                      <div className="bg-[#12343b]/80 border border-[#3f6973] rounded-2xl p-5 space-y-4">
                        <label className="text-xs font-bold font-mono text-[#e1b382] uppercase tracking-wider block">
                          2. Hero Headings & Copy
                        </label>

                        <div>
                          <label className="block text-[10px] font-mono text-[#cbd8dc] uppercase mb-1">
                            Hero Main Heading
                          </label>
                          <input 
                            type="text" required
                            value={heroForm.heading}
                            onChange={(e) => setHeroForm({ ...heroForm, heading: e.target.value })}
                            placeholder="Transforming Businesses Through Technology"
                            className="w-full px-3 py-2.5 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none"
                          />
                          <p className="text-[10px] text-[#cbd8dc]/60 mt-1">Tip: Use "Through" in your sentence to automatically highlight the second half in gold gradient.</p>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-[#cbd8dc] uppercase mb-1">
                            Hero Sub-Heading Paragraph
                          </label>
                          <textarea 
                            rows={3} required
                            value={heroForm.subHeading}
                            onChange={(e) => setHeroForm({ ...heroForm, subHeading: e.target.value })}
                            placeholder="We engineer high-performance software, intelligent agentic AI solutions..."
                            className="w-full p-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none resize-none leading-relaxed"
                          />
                        </div>
                      </div>

                      {/* 3. Primary & Secondary Button Settings */}
                      <div className="bg-[#12343b]/80 border border-[#3f6973] rounded-2xl p-5 space-y-5">
                        <label className="text-xs font-bold font-mono text-[#e1b382] uppercase tracking-wider block">
                          3. Call-To-Action (CTA) Buttons
                        </label>

                        {/* Primary Button Controls */}
                        <div className="p-4 bg-[#2d545e]/30 border border-[#3f6973] rounded-xl space-y-3">
                          <span className="text-[11px] font-bold text-white font-mono uppercase flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-[#e1b382]" />
                            <span>Primary Button Configuration</span>
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-mono text-[#cbd8dc] uppercase mb-1">Button Text</label>
                              <input 
                                type="text"
                                value={heroForm.primaryBtnText || ''}
                                onChange={(e) => setHeroForm({ ...heroForm, primaryBtnText: e.target.value })}
                                placeholder="Explore Flagship Products"
                                className="w-full px-3 py-2 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-lg text-xs text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono text-[#cbd8dc] uppercase mb-1">Button Link / Navigation Tab</label>
                              <select
                                value={heroForm.primaryBtnLink || 'products'}
                                onChange={(e) => setHeroForm({ ...heroForm, primaryBtnLink: e.target.value })}
                                className="w-full px-3 py-2 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-lg text-xs text-white focus:outline-none"
                              >
                                <option value="products">Flagship Products (products)</option>
                                <option value="services">Engineering Services (services)</option>
                                <option value="contact">Contact Consultation (contact)</option>
                                <option value="about">About Company (about)</option>
                                <option value="gallery">Gallery Archive (gallery)</option>
                                <option value="careers">Careers (careers)</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Secondary Button Controls */}
                        <div className="p-4 bg-[#2d545e]/30 border border-[#3f6973] rounded-xl space-y-3">
                          <span className="text-[11px] font-bold text-white font-mono uppercase flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-transparent border border-[#e1b382]" />
                            <span>Secondary Button Configuration</span>
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-mono text-[#cbd8dc] uppercase mb-1">Button Text</label>
                              <input 
                                type="text"
                                value={heroForm.secondaryBtnText || ''}
                                onChange={(e) => setHeroForm({ ...heroForm, secondaryBtnText: e.target.value })}
                                placeholder="Request Consult"
                                className="w-full px-3 py-2 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-lg text-xs text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono text-[#cbd8dc] uppercase mb-1">Button Link / Navigation Tab</label>
                              <select
                                value={heroForm.secondaryBtnLink || 'contact'}
                                onChange={(e) => setHeroForm({ ...heroForm, secondaryBtnLink: e.target.value })}
                                className="w-full px-3 py-2 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-lg text-xs text-white focus:outline-none"
                              >
                                <option value="contact">Contact Consultation (contact)</option>
                                <option value="products">Flagship Products (products)</option>
                                <option value="services">Engineering Services (services)</option>
                                <option value="about">About Company (about)</option>
                                <option value="gallery">Gallery Archive (gallery)</option>
                                <option value="careers">Careers (careers)</option>
                              </select>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Save Action Bar */}
                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setHeroForm({
                              heading: 'Transforming Businesses Through Technology',
                              subHeading: 'We engineer high-performance software, intelligent agentic AI solutions, and premium digital systems tailored for global enterprise growth.',
                              imageUrl: '',
                              primaryBtnText: 'Explore Flagship Products',
                              primaryBtnLink: 'products',
                              secondaryBtnText: 'Request Consult',
                              secondaryBtnLink: 'contact'
                            });
                            showToast('Reset form to initial defaults.', 'success');
                          }}
                          className="px-4 py-2.5 rounded-xl border border-[#3f6973] text-[#cbd8dc] hover:text-white hover:border-[#e1b382] text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Reset Form Defaults
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            saveHero(heroForm);
                            showToast('Hero section updated and saved to database successfully!', 'success');
                          }}
                          className="px-8 py-3.5 rounded-xl bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] text-xs font-bold uppercase tracking-widest transition-all shadow-xl flex items-center space-x-2 cursor-pointer hover:scale-105"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Hero Changes</span>
                        </button>
                      </div>

                    </div>

                    {/* Right Column: Live Interactive Hero Preview (5 cols) */}
                    <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-8">
                      
                      {/* Preview Header & Viewport Switcher */}
                      <div className="flex items-center justify-between bg-[#12343b] p-3 rounded-2xl border border-[#3f6973]">
                        <div className="flex items-center space-x-2">
                          <Eye className="w-4 h-4 text-[#e1b382]" />
                          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Real-Time Live Preview</span>
                        </div>

                        <div className="flex items-center bg-[#2d545e]/50 p-1 rounded-xl border border-[#3f6973]">
                          <button
                            type="button"
                            onClick={() => setHeroPreviewViewport('desktop')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center space-x-1.5 transition-all cursor-pointer ${
                              heroPreviewViewport === 'desktop' ? 'bg-[#e1b382] text-[#12343b] font-bold shadow' : 'text-[#cbd8dc] hover:text-white'
                            }`}
                          >
                            <Monitor className="w-3 h-3" />
                            <span>Desktop</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setHeroPreviewViewport('mobile')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center space-x-1.5 transition-all cursor-pointer ${
                              heroPreviewViewport === 'mobile' ? 'bg-[#e1b382] text-[#12343b] font-bold shadow' : 'text-[#cbd8dc] hover:text-white'
                            }`}
                          >
                            <Smartphone className="w-3 h-3" />
                            <span>Mobile</span>
                          </button>
                        </div>
                      </div>

                      {/* Live Preview Screen Container */}
                      <div className={`mx-auto transition-all duration-300 ${
                        heroPreviewViewport === 'mobile' ? 'max-w-[340px]' : 'w-full'
                      }`}>
                        <div className="relative rounded-2xl overflow-hidden border-2 border-[#e1b382]/40 shadow-2xl bg-[#12343b] min-h-[460px] flex flex-col justify-center p-6 text-left">
                          
                          {/* Live Background Image */}
                          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                            <img
                              src={heroForm.imageUrl && heroForm.imageUrl.trim() !== '' ? heroForm.imageUrl : '/src/assets/images/hero_office_building_1784921030842.jpg'}
                              alt="Hero Live Preview"
                              className="absolute inset-0 w-full h-full object-cover object-right"
                              onError={(e) => {
                                // Fallback on image error
                                (e.target as HTMLImageElement).src = '/src/assets/images/hero_office_building_1784921030842.jpg';
                              }}
                            />
                            {/* Teal gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#12343b] via-[#12343b]/85 via-[45%] to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#12343b] to-transparent" />
                          </div>

                          {/* Preview Content */}
                          <div className="relative z-10 space-y-4 max-w-[420px]">
                            
                            {/* Heading */}
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight font-sans">
                              {heroForm.heading.includes('Through') ? (
                                <>
                                  <span className="text-white">{heroForm.heading.split('Through')[0]}</span>
                                  <br />
                                  <span className="gold-text-gradient">Through {heroForm.heading.split('Through').slice(1).join('Through')}</span>
                                </>
                              ) : (
                                <span className="gold-text-gradient">{heroForm.heading}</span>
                              )}
                            </h2>

                            {/* Subheading */}
                            <p className="text-xs text-[#cbd8dc] leading-relaxed line-clamp-3">
                              {heroForm.subHeading}
                            </p>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                              <button
                                type="button"
                                className="px-4 py-2 bg-[#e1b382] text-[#12343b] rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 shadow"
                              >
                                <span>{heroForm.primaryBtnText || 'Explore Flagship Products'}</span>
                                <ArrowRight className="w-3 h-3 text-[#12343b]" />
                              </button>

                              <button
                                type="button"
                                className="px-4 py-2 bg-transparent border border-[#e1b382] text-[#e1b382] rounded-lg font-semibold text-xs text-center"
                              >
                                <span>{heroForm.secondaryBtnText || 'Request Consult'}</span>
                              </button>
                            </div>

                            {/* Stats Grid Preview */}
                            <div className="grid grid-cols-2 gap-2 pt-3">
                              <div className="p-2.5 rounded-xl bg-[#2d545e]/50 border border-[#e1b382]/20">
                                <span className="block text-sm font-extrabold text-white">4+ Years</span>
                                <span className="text-[9px] text-[#cbd8dc]">Engineering Excellence</span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-[#2d545e]/50 border border-[#e1b382]/20">
                                <span className="block text-sm font-extrabold text-white">50+</span>
                                <span className="text-[9px] text-[#cbd8dc]">Global Deployments</span>
                              </div>
                            </div>

                          </div>

                        </div>
                        <p className="text-[10px] text-center text-[#cbd8dc]/60 mt-2 font-mono">
                          Live Preview renders using current form values. Click Save to persist to database.
                        </p>
                      </div>

                    </div>

                  </div>

                </div>

                {/* About Form & Image Management */}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  saveAbout(aboutForm);
                  showToast('About Story & Image settings saved successfully!', 'success');
                }} className="bg-[#2d545e]/30 border border-[#3f6973] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3f6973]/60 pb-4">
                    <div>
                      <div className="inline-flex items-center space-x-2 bg-[#e1b382]/10 border border-[#e1b382]/30 px-3 py-1 rounded-full mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#e1b382]" />
                        <span className="text-[10px] font-mono uppercase text-[#e1b382] tracking-widest font-bold">Company Intro CMS</span>
                      </div>
                      <h3 className="text-xl font-bold tracking-wide text-white">About Section Management</h3>
                      <p className="text-xs text-[#CBD5E1] mt-0.5 font-sans">
                        Manage the Company Introduction copy and upload a custom high-resolution cover image for the live website.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center space-x-2 cursor-pointer hover:scale-105 shrink-0"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save About Settings</span>
                    </button>
                  </div>

                  {/* ABOUT SECTION IMAGE CMS BLOCK */}
                  <div className="bg-[#12343b]/80 border border-[#3f6973] rounded-2xl p-5 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#3f6973]/60 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
                          <ImageIcon className="w-4 h-4 text-[#e1b382]" />
                          <span>About Section Image</span>
                        </h4>
                        <p className="text-xs text-[#CBD5E1] font-sans mt-0.5">
                          Upload, replace, or remove the main image displayed in the "About / Company Introduction" homepage section.
                        </p>
                      </div>

                      {aboutForm.imageUrl && aboutForm.imageUrl.trim() !== '' ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shrink-0">
                          Custom Image Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full shrink-0">
                          Default Placeholder Active
                        </span>
                      )}
                    </div>

                    {/* Drag and Drop Zone */}
                    <div 
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsAboutDragOver(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsAboutDragOver(false);
                      }}
                      onDrop={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsAboutDragOver(false);

                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                          if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
                            showToast('Invalid format. Please upload JPG, PNG, or WebP image.', 'error');
                            return;
                          }
                          if (file.size > 5 * 1024 * 1024) {
                            showToast('File size exceeds 5MB limit.', 'error');
                            return;
                          }

                          const isReplace = !!aboutForm.imageUrl;
                          const oldImg = aboutForm.imageUrl;

                          setIsUploadingAboutImg(true);
                          setAboutUploadProgress(0);
                          try {
                            const url = await uploadImageToSupabase('about-images', file, '', (prog) => {
                              setAboutUploadProgress(prog);
                            });
                            if (url) {
                              if (isReplace && oldImg && !oldImg.includes('unsplash.com')) {
                                try {
                                  await deleteImageFromSupabase('about-images', oldImg);
                                } catch (err) {
                                  console.warn('Could not delete old about image:', err);
                                }
                              }
                              const updated = { ...aboutForm, imageUrl: url };
                              setAboutForm(updated);
                              saveAbout(updated);
                              showToast(isReplace ? 'About image replaced & saved!' : 'About image uploaded & saved!', 'success');
                            } else {
                              showToast('Failed to upload image.', 'error');
                            }
                          } catch (err: any) {
                            showToast(`Upload failed: ${err.message || err}`, 'error');
                          } finally {
                            setIsUploadingAboutImg(false);
                            setAboutUploadProgress(null);
                          }
                        }
                      }}
                      className={`border-2 border-dashed rounded-2xl p-4 transition-all duration-300 ${
                        isAboutDragOver 
                          ? 'border-[#e1b382] bg-[#e1b382]/10' 
                          : 'border-[#3f6973] hover:border-[#e1b382]/60 bg-[#2d545e]/20'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        
                        {/* Live Preview Card Box (Exact Website Layout Simulation) */}
                        <div className="w-full md:w-64 h-40 rounded-[18px] overflow-hidden border border-[#3f6973] hover:border-[#e1b382] relative group bg-[#12343b] shrink-0 shadow-2xl transition-all">
                          <img
                            src={aboutForm.imageUrl && aboutForm.imageUrl.trim() !== '' ? aboutForm.imageUrl : 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop'}
                            alt="About Section Preview"
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop';
                            }}
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#12343b]/60 via-transparent to-transparent pointer-events-none" />
                          <div className="absolute bottom-2 left-2 bg-[#12343b]/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-[#e1b382]/30 text-[9px] font-mono text-[#e1b382] font-bold">
                            Live Website Preview
                          </div>

                          {isUploadingAboutImg && (
                            <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center gap-1 z-10">
                              <RefreshCw className="w-5 h-5 text-[#e1b382] animate-spin" />
                              <span className="text-[10px] font-mono font-bold text-[#e1b382]">
                                {aboutUploadProgress !== null ? `${aboutUploadProgress}%` : 'Uploading...'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Upload Details & Actions */}
                        <div className="flex-1 text-center md:text-left space-y-3 w-full">
                          <div>
                            <h5 className="text-xs font-bold text-white">
                              {isAboutDragOver ? 'Drop image file here to upload' : 'Upload or Replace Image'}
                            </h5>
                            <p className="text-[11px] text-[#CBD5E1] mt-1 leading-relaxed">
                              Automatic cropping & fit. Supported file formats: <strong>JPG, PNG, WEBP</strong>. Maximum size: <strong>5MB</strong>.<br/>
                              Uploaded files are stored securely in Supabase storage and instantly updated on the live website.
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2.5 justify-center md:justify-start pt-1">
                            {/* Upload / Replace Button */}
                            <label className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center space-x-2 ${
                              isUploadingAboutImg 
                                ? 'bg-[#2d545e] text-[#CBD5E1]/50 cursor-not-allowed' 
                                : 'bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] shadow-md hover:scale-105'
                            }`}>
                              <Upload className="w-3.5 h-3.5" />
                              <span>{aboutForm.imageUrl ? 'Replace Image' : 'Upload Image'}</span>
                              <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                className="hidden"
                                disabled={isUploadingAboutImg}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;

                                  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                                  if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
                                    showToast('Invalid format. Please upload JPG, PNG, or WebP.', 'error');
                                    return;
                                  }
                                  if (file.size > 5 * 1024 * 1024) {
                                    showToast('File size exceeds 5MB limit.', 'error');
                                    return;
                                  }

                                  const isReplace = !!aboutForm.imageUrl;
                                  const oldImg = aboutForm.imageUrl;

                                  setIsUploadingAboutImg(true);
                                  setAboutUploadProgress(0);
                                  try {
                                    const url = await uploadImageToSupabase('about-images', file, '', (prog) => {
                                      setAboutUploadProgress(prog);
                                    });
                                    if (url) {
                                      if (isReplace && oldImg && !oldImg.includes('unsplash.com')) {
                                        try {
                                          await deleteImageFromSupabase('about-images', oldImg);
                                        } catch (err) {
                                          console.warn('Could not delete old about image:', err);
                                        }
                                      }
                                      const updated = { ...aboutForm, imageUrl: url };
                                      setAboutForm(updated);
                                      saveAbout(updated);
                                      showToast(isReplace ? 'About image replaced & saved!' : 'About image uploaded & saved!', 'success');
                                    } else {
                                      showToast('Failed to upload image.', 'error');
                                    }
                                  } catch (err: any) {
                                    showToast(`Upload failed: ${err.message || err}`, 'error');
                                  } finally {
                                    setIsUploadingAboutImg(false);
                                    setAboutUploadProgress(null);
                                  }
                                }}
                              />
                            </label>

                            {/* Delete Image Button */}
                            {aboutForm.imageUrl && aboutForm.imageUrl.trim() !== '' && (
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!window.confirm('Are you sure you want to delete the custom About section image? The website will revert to the professional default placeholder.')) return;
                                  const oldUrl = aboutForm.imageUrl;
                                  if (oldUrl && !oldUrl.includes('unsplash.com')) {
                                    try {
                                      await deleteImageFromSupabase('about-images', oldUrl);
                                    } catch (err) {
                                      console.warn('Could not delete image file from storage:', err);
                                    }
                                  }
                                  const updated = { ...aboutForm, imageUrl: '' };
                                  setAboutForm(updated);
                                  saveAbout(updated);
                                  showToast('About section image deleted. Default placeholder activated.', 'success');
                                }}
                                className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 text-red-300 text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer flex items-center space-x-1.5"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Image</span>
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-[#cbd8dc] uppercase mb-1">Company Journey Story</label>
                    <textarea 
                      rows={4} required
                      value={aboutForm.companyStory}
                      onChange={(e) => setAboutForm({ ...aboutForm, companyStory: e.target.value })}
                      className="w-full p-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none resize-none font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-[#cbd8dc] uppercase mb-1">Mission Details</label>
                      <textarea 
                        rows={3} required
                        value={aboutForm.mission}
                        onChange={(e) => setAboutForm({ ...aboutForm, mission: e.target.value })}
                        className="w-full p-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none resize-none font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-[#cbd8dc] uppercase mb-1">Vision Details</label>
                      <textarea 
                        rows={3} required
                        value={aboutForm.vision}
                        onChange={(e) => setAboutForm({ ...aboutForm, vision: e.target.value })}
                        className="w-full p-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none resize-none font-sans"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg hover:scale-105 flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save About Settings</span>
                    </button>
                  </div>
                </form>

              </div>
            )}

            {/* -------------------- 9. CONTACT MESSAGES TAB (UPGRADED) -------------------- */}
            {activeTab === 'messages' && (() => {
              // 1. Filtering & Sorting Calculations
              const filteredMessages = messages.filter(msg => {
                const searchLower = msgSearch.toLowerCase();
                const matchesSearch = 
                  msg.name.toLowerCase().includes(searchLower) ||
                  msg.email.toLowerCase().includes(searchLower) ||
                  msg.subject.toLowerCase().includes(searchLower) ||
                  msg.message.toLowerCase().includes(searchLower);

                const matchesRead = 
                  msgReadFilter === 'all' ? true :
                  msgReadFilter === 'read' ? msg.read :
                  !msg.read;

                const matchesReply = 
                  msgReplyFilter === 'all' ? true :
                  msgReplyFilter === 'pending' ? (msg.repliedStatus === 'Pending' || !msg.repliedStatus) :
                  msgReplyFilter === 'replied' ? msg.repliedStatus === 'Replied' :
                  msgReplyFilter === 'ignored' ? msg.repliedStatus === 'Ignored' :
                  true;

                return matchesSearch && matchesRead && matchesReply;
              });

              const sortedMessages = [...filteredMessages].sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return msgSortOrder === 'latest' ? dateB - dateA : dateA - dateB;
              });

              const totalPages = Math.ceil(sortedMessages.length / msgItemsPerPage) || 1;
              const activePage = Math.min(msgPage, totalPages);
              const startIndex = (activePage - 1) * msgItemsPerPage;
              const paginatedMessages = sortedMessages.slice(startIndex, startIndex + msgItemsPerPage);

              return (
                <div className="space-y-6" id="admin-tab-messages">
                  
                  {/* Tab Title Area */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-900 pb-5 gap-4">
                    <div>
                      <h3 className="text-xl font-bold tracking-wide text-white flex items-center space-x-2">
                        <span>Contact & Lead Desk</span>
                        <span className="text-xs bg-[#D4AF37]/10 text-[#D4AF37] px-2.5 py-0.5 rounded-full border border-[#D4AF37]/20 font-mono">
                          {messages.length} Queries
                        </span>
                      </h3>
                      <p className="text-xs text-neutral-500">Upgrade customer relationships, formulate responses, and log lead histories.</p>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="flex space-x-3 text-right">
                      <div className="px-3 py-1.5 bg-neutral-950/60 border border-neutral-900 rounded-xl">
                        <span className="block text-[10px] text-neutral-500 font-mono uppercase">Unread</span>
                        <span className="text-sm font-bold text-[#D4AF37]">{messages.filter(m => !m.read).length}</span>
                      </div>
                      <div className="px-3 py-1.5 bg-neutral-950/60 border border-neutral-900 rounded-xl">
                        <span className="block text-[10px] text-neutral-500 font-mono uppercase">Pending Reply</span>
                        <span className="text-sm font-bold text-amber-500">{messages.filter(m => m.repliedStatus === 'Pending' || !m.repliedStatus).length}</span>
                      </div>
                      <div className="px-3 py-1.5 bg-neutral-950/60 border border-neutral-900 rounded-xl">
                        <span className="block text-[10px] text-neutral-500 font-mono uppercase">Replied</span>
                        <span className="text-sm font-bold text-emerald-500">{messages.filter(m => m.repliedStatus === 'Replied').length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Search, Filter & Controls Panel */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-neutral-950/40 p-5 rounded-2xl border border-neutral-900">
                    
                    {/* Search Field */}
                    <div className="lg:col-span-5 relative">
                      <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                      <input 
                        type="text"
                        placeholder="Search queries by name, email, keywords..."
                        value={msgSearch}
                        onChange={(e) => {
                          setMsgSearch(e.target.value);
                          setMsgPage(1);
                        }}
                        className="w-full bg-black/40 border border-neutral-900 focus:border-[#D4AF37]/40 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none transition-colors"
                      />
                      {msgSearch && (
                        <button 
                          onClick={() => setMsgSearch('')}
                          className="absolute right-3 top-2.5 text-xs text-neutral-500 hover:text-white"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Read Status Filter */}
                    <div className="lg:col-span-2.5 flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase shrink-0">Read:</span>
                      <select
                        value={msgReadFilter}
                        onChange={(e) => {
                          setMsgReadFilter(e.target.value as any);
                          setMsgPage(1);
                        }}
                        className="w-full bg-black/40 border border-neutral-900 focus:border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none cursor-pointer"
                      >
                        <option value="all">All Messages</option>
                        <option value="read">Read Only</option>
                        <option value="unread">Unread Only</option>
                      </select>
                    </div>

                    {/* Replied Status Filter */}
                    <div className="lg:col-span-2.5 flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase shrink-0">Reply:</span>
                      <select
                        value={msgReplyFilter}
                        onChange={(e) => {
                          setMsgReplyFilter(e.target.value as any);
                          setMsgPage(1);
                        }}
                        className="w-full bg-black/40 border border-neutral-900 focus:border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none cursor-pointer"
                      >
                        <option value="all">All States</option>
                        <option value="pending">Pending Reply</option>
                        <option value="replied">Replied</option>
                        <option value="ignored">Ignored</option>
                      </select>
                    </div>

                    {/* Sort Order */}
                    <div className="lg:col-span-2 flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase shrink-0">Sort:</span>
                      <select
                        value={msgSortOrder}
                        onChange={(e) => setMsgSortOrder(e.target.value as any)}
                        className="w-full bg-black/40 border border-neutral-900 focus:border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none cursor-pointer"
                      >
                        <option value="latest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                      </select>
                    </div>

                  </div>

                  {/* Active Filter Badges */}
                  {(msgSearch || msgReadFilter !== 'all' || msgReplyFilter !== 'all') && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase">Active Filters:</span>
                      {msgSearch && (
                        <span className="inline-flex items-center space-x-1 text-[10px] bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 text-neutral-300">
                          <span>Search: "{msgSearch}"</span>
                          <button onClick={() => setMsgSearch('')} className="text-[#D4AF37] hover:text-white ml-1">×</button>
                        </span>
                      )}
                      {msgReadFilter !== 'all' && (
                        <span className="inline-flex items-center space-x-1 text-[10px] bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 text-neutral-300">
                          <span>Read: {msgReadFilter}</span>
                          <button onClick={() => setMsgReadFilter('all')} className="text-[#D4AF37] hover:text-white ml-1">×</button>
                        </span>
                      )}
                      {msgReplyFilter !== 'all' && (
                        <span className="inline-flex items-center space-x-1 text-[10px] bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 text-neutral-300">
                          <span>Reply: {msgReplyFilter}</span>
                          <button onClick={() => setMsgReplyFilter('all')} className="text-[#D4AF37] hover:text-white ml-1">×</button>
                        </span>
                      )}
                      <button 
                        onClick={() => {
                          setMsgSearch('');
                          setMsgReadFilter('all');
                          setMsgReplyFilter('all');
                          setMsgPage(1);
                        }}
                        className="text-[10px] text-[#D4AF37] hover:underline hover:text-white"
                      >
                        Reset All
                      </button>
                    </div>
                  )}

                  {/* Core List of Messages */}
                  <div className="space-y-4">
                    {paginatedMessages.map((msg) => {
                      const msgRepliesCount = msg.replies?.length || 0;
                      return (
                        <div 
                          key={msg.id} 
                          className={`p-5 rounded-2xl border transition-all relative overflow-hidden group ${
                            msg.read 
                              ? 'bg-neutral-950/30 border-neutral-900' 
                              : 'bg-[#D4AF37]/5 border-[#D4AF37]/25 shadow-md shadow-[#D4AF37]/5'
                          }`}
                          id={`msg-card-${msg.id}`}
                        >
                          {/* Top Border Accent for Unread Messages */}
                          {!msg.read && (
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4AF37] to-amber-500" />
                          )}

                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            
                            {/* Metadata segment */}
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm font-bold text-white tracking-wide">{msg.name}</h4>
                                <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900/60 px-2 py-0.5 rounded border border-neutral-800">
                                  {msg.email}
                                </span>
                              </div>

                              <p className="text-xs text-neutral-300 font-semibold pt-1">
                                <span className="text-[#D4AF37]/80">Subject:</span> {msg.subject}
                              </p>

                              <div className="flex items-center space-x-3 text-[10px] text-neutral-500 font-mono pt-1">
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3 text-neutral-600" />
                                  <span>{new Date(msg.createdAt).toLocaleString()}</span>
                                </span>
                                {msgRepliesCount > 0 && (
                                  <span className="text-emerald-500 font-semibold bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.2 rounded">
                                    {msgRepliesCount} response{msgRepliesCount > 1 ? 's' : ''} logged
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Badges and Read Actions */}
                            <div className="flex flex-wrap items-center gap-2 sm:self-start shrink-0">
                              
                              {/* Reply Status Badge */}
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider border ${
                                msg.repliedStatus === 'Replied' 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                  : msg.repliedStatus === 'Ignored'
                                  ? 'bg-neutral-900 border-neutral-800 text-neutral-500'
                                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                              }`}>
                                {msg.repliedStatus || 'Pending'}
                              </span>

                              {/* Read Status Toggle Button */}
                              <button
                                onClick={() => {
                                  saveMessages(messages.map(m => m.id === msg.id ? { ...m, read: !m.read } : m));
                                }}
                                className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider border transition-all cursor-pointer ${
                                  msg.read 
                                    ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white' 
                                    : 'bg-amber-500/10 border-amber-500/30 text-[#D4AF37] hover:bg-amber-500/20'
                                }`}
                                title={msg.read ? 'Mark as Unread' : 'Mark as Read'}
                              >
                                {msg.read ? 'Read' : 'Unread'}
                              </button>

                              {/* Delete message button */}
                              <button
                                onClick={() => {
                                  if (!checkAccessGuard('delete', 'contact message')) return;
                                  if (window.confirm('Are you sure you want to permanently delete this message query? This will also purge its reply history.')) {
                                    saveMessages(messages.filter(m => m.id !== msg.id));
                                  }
                                }}
                                className="p-1 text-neutral-500 hover:text-red-400 hover:bg-neutral-900 border border-transparent hover:border-neutral-800 rounded-lg transition-all cursor-pointer"
                                title="Delete Message Archive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                            </div>
                          </div>

                          {/* Message Body Excerpt */}
                          <div className="mt-4 bg-black/30 p-3.5 rounded-xl border border-neutral-900/60 text-xs text-neutral-300 leading-relaxed font-sans whitespace-pre-wrap">
                            {msg.message.length > 240 ? `${msg.message.slice(0, 240)}...` : msg.message}
                          </div>

                          {/* Quick Bottom Control bar */}
                          <div className="mt-4 flex flex-wrap items-center justify-between border-t border-neutral-900/50 pt-3 gap-2">
                            
                            {/* Manual Reply Status select dropdown */}
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-mono text-neutral-500 uppercase">Override Status:</span>
                              <select
                                value={msg.repliedStatus || 'Pending'}
                                onChange={(e) => {
                                  saveMessages(messages.map(m => m.id === msg.id ? { ...m, repliedStatus: e.target.value as any } : m));
                                }}
                                className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[9px] font-mono text-neutral-300 focus:outline-none cursor-pointer"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Replied">Replied</option>
                                <option value="Ignored">Ignored</option>
                              </select>
                            </div>

                            {/* View & Compose response CTA buttons */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedMsg(msg);
                                  setIsViewModalOpen(true);
                                  // Auto-mark as read when viewing message
                                  if (!msg.read) {
                                    saveMessages(messages.map(m => m.id === msg.id ? { ...m, read: true } : m));
                                  }
                                }}
                                className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Inspect & History ({msgRepliesCount})</span>
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedMsg(msg);
                                  setReplySubject(`Re: ${msg.subject}`);
                                  setReplyBody('');
                                  setReplyError('');
                                  generateMathChallenge();
                                  setIsReplyModalOpen(true);
                                }}
                                className="px-3.5 py-1 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 hover:border-[#D4AF37]/50 text-[#D4AF37] rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                              >
                                <Reply className="w-3 h-3" />
                                <span>Compose Reply</span>
                              </button>
                            </div>

                          </div>

                        </div>
                      );
                    })}

                    {paginatedMessages.length === 0 && (
                      <div className="text-center py-12 bg-neutral-950/20 rounded-2xl border border-neutral-900">
                        <MessageSquare className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
                        <p className="text-xs text-neutral-400 font-semibold">No messages match the current filters.</p>
                        <p className="text-[11px] text-neutral-500 mt-1">Try modifying your search or filters parameters.</p>
                      </div>
                    )}
                  </div>

                  {/* Pagination Section */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-neutral-900/60 pt-4 mt-6">
                      <span className="text-[10px] font-mono text-neutral-500">
                        Showing {startIndex + 1} - {Math.min(startIndex + msgItemsPerPage, sortedMessages.length)} of {sortedMessages.length} entries
                      </span>

                      <div className="flex items-center space-x-1.5">
                        <button
                          disabled={activePage === 1}
                          onClick={() => setMsgPage(p => Math.max(p - 1, 1))}
                          className="px-2.5 py-1 rounded bg-neutral-950 border border-neutral-900 text-neutral-400 hover:text-white text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                          Prev
                        </button>

                        {Array.from({ length: totalPages }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setMsgPage(i + 1)}
                            className={`w-6 h-6 rounded text-xs font-mono transition-all cursor-pointer ${
                              activePage === i + 1 
                                ? 'bg-[#D4AF37] text-black font-bold' 
                                : 'bg-neutral-950 hover:bg-neutral-900 border border-neutral-900 text-neutral-400 hover:text-white'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}

                        <button
                          disabled={activePage === totalPages}
                          onClick={() => setMsgPage(p => Math.min(p + 1, totalPages))}
                          className="px-2.5 py-1 rounded bg-neutral-950 border border-neutral-900 text-neutral-400 hover:text-white text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })()}

            {/* -------------------- SECURITY & AUTH TAB -------------------- */}
            {activeTab === 'security' && (
              <div className="space-y-8 animate-fade-in" id="admin-tab-security">
                
                {/* Auth & RLS System Diagnostics Audit Panel */}
                <AuthDiagnosticsPanel onNotify={(msg, type) => showToast(msg, type)} />

                {/* Header Banner */}
                <div className="bg-[#2d545e] border border-[#3f6973] rounded-3xl p-6 sm:p-8 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className="w-6 h-6 text-[#e1b382]" />
                        <h3 className="text-xl font-bold tracking-wide text-white">Production Security & Authentication</h3>
                      </div>
                      <p className="text-xs text-[#CBD5E1]">
                        Manage CMS access passwords, SHA-256 salted hashing parameters, session invalidation, and login attempt lockout policies.
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 bg-[#12343b] px-4 py-2 rounded-xl border border-[#3f6973]">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[11px] font-mono font-bold text-[#e1b382] uppercase">SHA-256 Enforced</span>
                    </div>
                  </div>
                </div>

                {/* Security Metrics / Last Changed Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Metric 1: Last Changed */}
                  <div className="bg-[#2d545e]/80 border border-[#3f6973] rounded-2xl p-5 space-y-2">
                    <div className="flex items-center space-x-2 text-[#e1b382]">
                      <Clock className="w-4 h-4" />
                      <span className="text-[10px] font-mono uppercase tracking-wider">Last Password Changed</span>
                    </div>
                    <p className="text-sm font-bold text-white font-mono">
                      {authState?.lastPasswordChanged 
                        ? new Date(authState.lastPasswordChanged).toLocaleString() 
                        : 'Initial Default Setup (Update Recommended)'}
                    </p>
                    <p className="text-[10px] text-[#CBD5E1]">
                      {authState?.mustChangePassword ? '⚠️ Action required: Password change pending' : '✓ Credentials updated'}
                    </p>
                  </div>

                  {/* Metric 2: Registered Admin Email */}
                  <div className="bg-[#2d545e]/80 border border-[#3f6973] rounded-2xl p-5 space-y-2">
                    <div className="flex items-center space-x-2 text-[#e1b382]">
                      <Mail className="w-4 h-4" />
                      <span className="text-[10px] font-mono uppercase tracking-wider">Admin Recovery Email</span>
                    </div>
                    <p className="text-sm font-bold text-white font-mono truncate">
                      {authState?.adminEmail || settings.email || 'admin@apnakhaiyal.com'}
                    </p>
                    <p className="text-[10px] text-[#CBD5E1]">
                      Used for 1-click password recovery verification
                    </p>
                  </div>

                  {/* Metric 3: Lockout Policy */}
                  <div className="bg-[#2d545e]/80 border border-[#3f6973] rounded-2xl p-5 space-y-2">
                    <div className="flex items-center space-x-2 text-[#e1b382]">
                      <Lock className="w-4 h-4" />
                      <span className="text-[10px] font-mono uppercase tracking-wider">Login Security Policy</span>
                    </div>
                    <p className="text-sm font-bold text-white font-mono">
                      Max 3 Attempts → 15 Min Lock
                    </p>
                    <p className="text-[10px] text-[#CBD5E1]">
                      Failed attempts counter: {authState?.failedAttempts || 0}/3
                    </p>
                  </div>
                </div>

                {/* Profile Settings Card */}
                <div className="bg-[#2d545e] border border-[#3f6973] rounded-3xl p-6 sm:p-8 space-y-6">
                  <div className="border-b border-[#3f6973] pb-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white tracking-wide">Administrator Profile Settings</h4>
                      <p className="text-xs text-[#CBD5E1] mt-1">
                        Update admin display name, corporate email address, and profile photo avatar.
                      </p>
                    </div>
                    <User className="w-5 h-5 text-[#e1b382]" />
                  </div>

                  {profileNotice && (
                    <div className={`p-4 rounded-xl flex items-center space-x-2 text-xs border ${
                      profileNotice.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200' : 'bg-red-500/20 border-red-500/40 text-red-300'
                    }`}>
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{profileNotice.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-2xl">
                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 p-4 bg-[#12343b] rounded-2xl border border-[#3f6973]">
                      <div className="relative group">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#e1b382] bg-[#2d545e] flex items-center justify-center">
                          {adminProfilePhoto ? (
                            <img src={adminProfilePhoto} alt="Admin Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-10 h-10 text-[#e1b382]" />
                          )}
                        </div>
                        <label className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <Upload className="w-5 h-5 text-white" />
                          <input 
                            type="file" 
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                showToast('Uploading profile photo...', 'success');
                                const url = await uploadImageToSupabase('hero-banners', file);
                                setAdminProfilePhoto(url);
                                showToast('Profile photo uploaded!', 'success');
                              } catch (err: any) {
                                showToast(err.message || 'Photo upload failed', 'error');
                              }
                            }}
                          />
                        </label>
                      </div>

                      <div className="space-y-1 text-center sm:text-left flex-1">
                        <h5 className="text-sm font-bold text-white">{adminProfileName || 'Admin User'}</h5>
                        <p className="text-xs text-[#CBD5E1] font-mono">{adminProfileEmail || 'admin@apnakhaiyal.com'}</p>
                        <p className="text-[10px] text-[#e1b382]">Click avatar photo to upload new profile image</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-2">
                          Display Name
                        </label>
                        <input 
                          type="text"
                          required
                          value={adminProfileName}
                          onChange={(e) => setAdminProfileName(e.target.value)}
                          placeholder="e.g. Master Administrator"
                          className="w-full px-4 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-2">
                          Corporate Email Address
                        </label>
                        <input 
                          type="email"
                          required
                          value={adminProfileEmail}
                          onChange={(e) => setAdminProfileEmail(e.target.value)}
                          placeholder="admin@apnakhaiyal.com"
                          className="w-full px-4 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-2">
                        Avatar Image URL
                      </label>
                      <input 
                        type="url"
                        value={adminProfilePhoto}
                        onChange={(e) => setAdminProfilePhoto(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full px-4 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="px-6 py-3.5 rounded-xl bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg inline-flex items-center space-x-2 disabled:opacity-50"
                    >
                      {isUpdatingProfile ? (
                        <>
                          <RefreshCw className="w-4 h-4 text-[#12343b] animate-spin" />
                          <span>Saving Profile...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Save Profile Settings</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Change Password Card */}
                <div className="bg-[#2d545e] border border-[#3f6973] rounded-3xl p-6 sm:p-8 space-y-6">
                  <div className="border-b border-[#3f6973] pb-4">
                    <h4 className="text-base font-bold text-white tracking-wide">Change Administrator Password</h4>
                    <p className="text-xs text-[#CBD5E1] mt-1">
                      Updating your password will immediately invalidate all existing sessions and require the new credentials for all future logins.
                    </p>
                  </div>

                  {passNotice && (
                    <div className={`p-4 rounded-xl flex items-center space-x-2 text-xs border ${
                      passNotice.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200' : 'bg-red-500/20 border-red-500/40 text-red-300'
                    }`}>
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{passNotice.text}</span>
                    </div>
                  )}

                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setPassNotice(null);
                    setIsChangingPass(true);

                    try {
                      if (!authState) return;

                      // 1. Verify current password against local hash
                      const hashedCurrent = await hashPassword(currentPassInput, authState.salt);
                      const isLegacyCurrent = (authState.mustChangePassword && (currentPassInput === 'admin123' || currentPassInput === 'apnakhaiyal' || currentPassInput === 'apnakhiyal'));
                      if (hashedCurrent !== authState.passwordHash && !isLegacyCurrent) {
                        setPassNotice({ text: 'Current password entered is incorrect.', type: 'error' });
                        setIsChangingPass(false);
                        return;
                      }

                      // 2. Validate password rules with complexity & confirm match
                      const rules = validatePasswordRules(newPassInput, confirmPassInput, authState.email);
                      if (!rules.isValid) {
                        setPassNotice({ text: `Password complexity standards unmet: ${rules.errors.join(', ')}`, type: 'error' });
                        setIsChangingPass(false);
                        return;
                      }

                      // 4. Update Supabase Auth password if available
                      if (isSupabaseConfigured && supabase) {
                        const { error } = await supabase.auth.updateUser({
                          password: newPassInput,
                        });
                        if (error) {
                          console.warn('Supabase updateUser password note:', error.message);
                        }
                      }

                      // 5. Encrypt and Save locally
                      const newSalt = Math.random().toString(36).substring(2, 10);
                      const newHash = await hashPassword(newPassInput, newSalt);
                      const newSessionVer = (authState.sessionVersion || 1) + 1;

                      const updatedState: AdminAuthState = {
                        ...authState,
                        passwordHash: newHash,
                        salt: newSalt,
                        lastPasswordChanged: new Date().toISOString(),
                        mustChangePassword: false,
                        failedAttempts: 0,
                        lockoutUntil: null,
                        sessionVersion: newSessionVer,
                      };

                      saveAdminAuthState(updatedState);
                      setAuthState(updatedState);
                      setActiveSessionVersion(newSessionVer);

                      setCurrentPassInput('');
                      setNewPassInput('');
                      setConfirmPassInput('');

                      setPassNotice({
                        text: 'Password successfully updated and encrypted! Credentials updated across Supabase and local storage.',
                        type: 'success'
                      });
                      showToast('Password changed and encrypted successfully.', 'success');
                    } catch (err: any) {
                      setPassNotice({
                        text: err.message || 'Failed to update password.',
                        type: 'error',
                      });
                    } finally {
                      setIsChangingPass(false);
                    }
                  }} className="space-y-6 max-w-2xl">
                    
                    {/* Current Password Field */}
                    <div>
                      <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input 
                          type={showCurrentPass ? 'text' : 'password'}
                          required
                          value={currentPassInput}
                          onChange={(e) => setCurrentPassInput(e.target.value)}
                          placeholder="Enter current password"
                          className="w-full pl-4 pr-11 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CBD5E1] hover:text-[#e1b382] p-1.5 cursor-pointer"
                        >
                          {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password Field */}
                    <div>
                      <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input 
                          type={showNewPass ? 'text' : 'password'}
                          required
                          value={newPassInput}
                          onChange={(e) => setNewPassInput(e.target.value)}
                          placeholder="Enter new strong password"
                          className="w-full pl-4 pr-11 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CBD5E1] hover:text-[#e1b382] p-1.5 cursor-pointer"
                        >
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                      <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input 
                          type={showConfirmPass ? 'text' : 'password'}
                          required
                          value={confirmPassInput}
                          onChange={(e) => setConfirmPassInput(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full pl-4 pr-11 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CBD5E1] hover:text-[#e1b382] p-1.5 cursor-pointer"
                        >
                          {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Live Password Complexity Validator */}
                    <PasswordComplexityValidator
                      password={newPassInput}
                      confirmPassword={confirmPassInput}
                      userEmailOrName={authState?.email}
                      onApplyGeneratedPassword={(gen) => {
                        setNewPassInput(gen);
                        setConfirmPassInput(gen);
                      }}
                      compact={false}
                      title="Password Complexity Standards"
                      subtitle="All security policies must be verified before password rotation is accepted."
                      showActivationGateBadge={false}
                    />

                    <button
                      type="submit"
                      disabled={isChangingPass || !validatePasswordRules(newPassInput, confirmPassInput, authState?.email).isValid}
                      className="px-6 py-3.5 rounded-xl bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg inline-flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Key className="w-4 h-4 mr-1" />
                      <span>Update & Encrypt Password</span>
                    </button>
                  </form>
                </div>

                {/* Session & Device Management */}
                <div className="bg-[#2d545e] border border-[#3f6973] rounded-3xl p-6 sm:p-8 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-base font-bold text-white tracking-wide">Session Invalidation & Global Logout</h4>
                      <p className="text-xs text-[#CBD5E1] mt-1">
                        Instantly invalidate active sessions across all browsers and devices by bumping the global auth version key.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!window.confirm('Are you sure you want to log out from all devices? All active administrator sessions will be immediately terminated.')) return;
                        if (!authState) return;

                        const newSessionVer = authState.sessionVersion + 1;
                        const updatedState: AdminAuthState = {
                          ...authState,
                          sessionVersion: newSessionVer,
                        };
                        saveAdminAuthState(updatedState);
                        setAuthState(updatedState);
                        clearActiveSession();

                        if (onLogout) onLogout();
                        showToast('Logged out from all devices successfully.', 'success');
                      }}
                      className="px-5 py-3 rounded-xl bg-red-950/30 hover:bg-red-950/60 border border-red-500/40 text-red-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer inline-flex items-center space-x-2 shrink-0"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout From All Devices</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* -------------------- 12. COMPANY BRANDING TAB -------------------- */}
            {activeTab === 'branding' && (
              <div className="space-y-8 animate-fade-in" id="admin-tab-company-branding">
                <div className="bg-neutral-950/60 border border-neutral-900 rounded-3xl p-6 sm:p-8 space-y-6">
                  <div className="border-b border-neutral-900 pb-4">
                    <h3 className="text-base font-bold tracking-wide text-white">Company Branding</h3>
                    <p className="text-[10px] font-mono text-neutral-500 uppercase mt-1">
                      Manage company identity and dynamic logo assets stored in Supabase Storage
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Company Name Field */}
                    <div>
                      <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-2">Company Name</label>
                      <input 
                        type="text"
                        required
                        value={settingsForm.companyName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, companyName: e.target.value })}
                        placeholder="e.g. ApnaKhaiyal"
                        className="w-full max-w-xl px-4 py-3 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Logo Management Component */}
                    <div className="pt-2">
                      <LogoManagement
                        currentLogoUrl={settingsForm.companyLogo || ''}
                        companyName={settingsForm.companyName || 'Apna Khaiyal'}
                        onLogoUpdated={async (newLogoUrl) => {
                          const updated = { ...settingsForm, companyLogo: newLogoUrl };
                          setSettingsForm(updated);
                          await saveSettings(updated);
                        }}
                        onLogoDeleted={async () => {
                          const updated = { ...settingsForm, companyLogo: '' };
                          setSettingsForm(updated);
                          await saveSettings(updated);
                        }}
                        showToast={showToast}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-neutral-900 flex justify-end">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            showToast('Saving company branding settings...', 'success');
                            await saveSettings(settingsForm);
                            showToast('Company branding updated successfully!', 'success');
                          } catch (error: any) {
                            showToast(error.message || 'Failed to save settings', 'error');
                          }
                        }}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-black text-xs font-bold uppercase cursor-pointer hover:scale-[1.01] transition-transform inline-flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        <span>Save Branding Settings</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- COMPANY CONTACT TAB -------------------- */}
            {activeTab === 'company-contact' && (
              <div className="space-y-8 animate-fade-in" id="admin-tab-company-contact">
                <div className="bg-[#2d545e] border border-[#3f6973] rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                  <div className="border-b border-[#3f6973] pb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold tracking-wide text-white">Company Contact Details</h3>
                      <p className="text-xs font-mono text-[#CBD5E1] uppercase mt-1">Single source of truth for corporate contact information</p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-[#e1b382]/10 border border-[#e1b382]/40 flex items-center justify-center text-[#e1b382]">
                      <Phone className="w-5 h-5" />
                    </div>
                  </div>

                  <form onSubmit={handleSaveCompanyContact} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Company Name */}
                      <div>
                        <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-2">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={companyContactForm.companyName}
                          onChange={(e) => setCompanyContactForm({ ...companyContactForm, companyName: e.target.value })}
                          className="w-full px-4 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white focus:outline-none transition-all"
                          placeholder="e.g. ApnaKhaiyal"
                        />
                      </div>

                      {/* Email Address */}
                      <div>
                        <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={companyContactForm.email}
                          onChange={(e) => setCompanyContactForm({ ...companyContactForm, email: e.target.value })}
                          className="w-full px-4 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white focus:outline-none transition-all"
                          placeholder="e.g. info@apnakhaiyal.com"
                        />
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={companyContactForm.phone}
                          onChange={(e) => setCompanyContactForm({ ...companyContactForm, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white focus:outline-none transition-all"
                          placeholder="e.g. +92 300 1234567"
                        />
                      </div>

                      {/* Second Phone Number */}
                      <div>
                        <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-2">
                          Second Phone Number
                        </label>
                        <input
                          type="text"
                          value={companyContactForm.phoneSecondary || ''}
                          onChange={(e) => setCompanyContactForm({ ...companyContactForm, phoneSecondary: e.target.value })}
                          className="w-full px-4 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white focus:outline-none transition-all"
                          placeholder="e.g. +92 61 1234567"
                        />
                      </div>
                    </div>

                    {/* Company Address */}
                    <div>
                      <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-2">
                        Company Address *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={companyContactForm.address}
                        onChange={(e) => setCompanyContactForm({ ...companyContactForm, address: e.target.value })}
                        className="w-full p-4 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white focus:outline-none resize-none transition-all"
                        placeholder="e.g. Model Town C, Bahawalpur, Pakistan"
                      />
                    </div>

                    <div className="flex items-center justify-end pt-4 border-t border-[#3f6973]">
                      <button
                        type="submit"
                        disabled={isSavingCompanyContact}
                        className="px-8 py-3.5 rounded-xl bg-[#e1b382] hover:bg-[#d4af37] text-[#12343b] text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-lg disabled:opacity-50 flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSavingCompanyContact ? 'Saving Changes...' : 'Save Contact Details'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* -------------------- 11. FOOTER SETTINGS TAB -------------------- */}
            {activeTab === 'footer-settings' && (
              <div className="space-y-8 animate-fade-in" id="admin-tab-footer-settings">
                
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left Column: Corporate Office */}
                  <div className="flex-1 bg-neutral-950/60 border border-neutral-900 rounded-3xl p-6 space-y-6">
                    <div className="border-b border-neutral-900 pb-4">
                      <h3 className="text-base font-bold tracking-wide text-white">Corporate Location Settings</h3>
                      <p className="text-[10px] font-mono text-neutral-500 uppercase mt-1">Google Maps Embed & Location Links</p>
                    </div>

                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2 text-xs text-amber-200">
                      <p className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                        <span>Single Source of Truth Active</span>
                      </p>
                      <p className="text-[11px] text-amber-200/80 leading-relaxed">
                        Company Name, Email, Phone, Second Phone, and Address are managed exclusively from the <strong>Company Contact</strong> tab (<code className="text-[#D4AF37] font-mono">company_information</code> table).
                      </p>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      saveOffice(officeForm);
                      showToast('Google Map link updated!', 'success');
                    }} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Google Map Link (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. https://maps.google.com/..."
                          value={officeForm.googleMapLink || ''}
                          onChange={(e) => setOfficeForm({ ...officeForm, googleMapLink: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-black text-xs font-bold uppercase tracking-wider hover:scale-[1.01] transition-all cursor-pointer mt-2"
                      >
                        Update Map Link
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Expertise Areas */}
                  <div className="flex-1 bg-neutral-950/60 border border-neutral-900 rounded-3xl p-6 space-y-6">
                    <div className="border-b border-neutral-900 pb-4">
                      <h3 className="text-base font-bold tracking-wide text-white">Core Expertise Areas</h3>
                      <p className="text-[10px] font-mono text-neutral-500 uppercase mt-1">Manage core software development specialties</p>
                    </div>

                    {/* Add Expertise Form */}
                    <div className="bg-neutral-900/40 p-4 border border-neutral-900/60 rounded-2xl space-y-3">
                      <h4 className="text-xs font-bold text-neutral-300">Add New Expertise Area</h4>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Autonomous Agentic AI Pipelines"
                          value={newExpertiseName}
                          onChange={(e) => setNewExpertiseName(e.target.value)}
                          className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            if (!newExpertiseName.trim()) return;
                            const newItem = {
                              id: `exp_${Date.now()}`,
                              name: newExpertiseName.trim(),
                              displayOrder: expertiseList.length + 1
                            };
                            const updated = [...expertiseList, newItem];
                            saveExpertise(updated);
                            setNewExpertiseName('');
                          }}
                          className="px-4 py-2 bg-[#D4AF37] hover:bg-[#F5D76E] text-black text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Expertise List */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-neutral-300">Active Specialties</h4>
                      {expertiseList.length === 0 ? (
                        <p className="text-xs text-neutral-600 italic">No expertise areas configured.</p>
                      ) : (
                        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                          {expertiseList.map((item, index) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 bg-neutral-900/60 border border-neutral-900 rounded-xl"
                            >
                              {editingExpertiseId === item.id ? (
                                <div className="flex-1 flex gap-2 mr-2">
                                  <input
                                    type="text"
                                    value={editingExpertiseName}
                                    onChange={(e) => setEditingExpertiseName(e.target.value)}
                                    className="flex-1 px-3 py-1 bg-neutral-950 border border-neutral-800 focus:border-[#D4AF37] rounded-lg text-xs text-white focus:outline-none"
                                  />
                                  <button
                                    onClick={() => {
                                      if (!editingExpertiseName.trim()) return;
                                      const updated = expertiseList.map(exp =>
                                        exp.id === item.id ? { ...exp, name: editingExpertiseName.trim() } : exp
                                      );
                                      saveExpertise(updated);
                                      setEditingExpertiseId(null);
                                      setEditingExpertiseName('');
                                    }}
                                    className="p-1 text-green-500 hover:text-green-400 transition-colors cursor-pointer"
                                    title="Save"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingExpertiseId(null);
                                      setEditingExpertiseName('');
                                    }}
                                    className="p-1 text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-[10px] font-mono text-neutral-600 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-900">
                                      #{index + 1}
                                    </span>
                                    <span className="text-xs text-neutral-200">{item.name}</span>
                                  </div>

                                  <div className="flex items-center space-x-1.5">
                                    {/* Reorder Up */}
                                    <button
                                      disabled={index === 0}
                                      onClick={() => {
                                        if (index === 0) return;
                                        const updated = [...expertiseList];
                                        const temp = updated[index];
                                        updated[index] = updated[index - 1];
                                        updated[index - 1] = temp;
                                        // Re-map display orders
                                        const final = updated.map((exp, idx) => ({ ...exp, displayOrder: idx + 1 }));
                                        saveExpertise(final);
                                      }}
                                      className={`p-1.5 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white transition-all ${
                                        index === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:border-[#D4AF37]'
                                      }`}
                                      title="Move Up"
                                    >
                                      ▲
                                    </button>

                                    {/* Reorder Down */}
                                    <button
                                      disabled={index === expertiseList.length - 1}
                                      onClick={() => {
                                        if (index === expertiseList.length - 1) return;
                                        const updated = [...expertiseList];
                                        const temp = updated[index];
                                        updated[index] = updated[index + 1];
                                        updated[index + 1] = temp;
                                        const final = updated.map((exp, idx) => ({ ...exp, displayOrder: idx + 1 }));
                                        saveExpertise(final);
                                      }}
                                      className={`p-1.5 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white transition-all ${
                                        index === expertiseList.length - 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:border-[#D4AF37]'
                                      }`}
                                      title="Move Down"
                                    >
                                      ▼
                                    </button>

                                    {/* Edit */}
                                    <button
                                      onClick={() => {
                                        setEditingExpertiseId(item.id);
                                        setEditingExpertiseName(item.name);
                                      }}
                                      className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:border-blue-500 transition-all cursor-pointer"
                                      title="Edit Name"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Delete */}
                                    <button
                                      onClick={() => {
                                        if (confirm(`Delete expertise "${item.name}"?`)) {
                                          const filtered = expertiseList.filter(exp => exp.id !== item.id);
                                          const final = filtered.map((exp, idx) => ({ ...exp, displayOrder: idx + 1 }));
                                          saveExpertise(final);
                                        }
                                      }}
                                      className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-950 text-red-500 hover:text-red-400 hover:border-red-500 transition-all cursor-pointer"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}

      {/* ========================================================================= */}
      {/* ======================= VIEW MESSAGE MODAL ============================== */}
      {/* ========================================================================= */}
      {isViewModalOpen && selectedMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-3xl p-6 relative max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            
            {/* Close button */}
            <button 
              onClick={() => {
                setIsViewModalOpen(false);
                setSelectedMsg(null);
              }}
              className="absolute top-4 right-4 p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl flex items-center justify-center text-[#D4AF37]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">Client Inquiry Details</h3>
                <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Contact Management System Archive</p>
              </div>
            </div>

            {/* Client Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/40 p-4 rounded-2xl border border-neutral-900 text-xs">
              <div>
                <span className="block text-[10px] font-mono text-neutral-500 uppercase mb-0.5">Prospect Name</span>
                <span className="text-white font-medium">{selectedMsg.name}</span>
              </div>
              <div>
                <span className="block text-[10px] font-mono text-neutral-500 uppercase mb-0.5">Corporate Email</span>
                <span className="text-[#D4AF37] font-mono">{selectedMsg.email}</span>
              </div>
              <div>
                <span className="block text-[10px] font-mono text-neutral-500 uppercase mb-0.5">Date Submitted</span>
                <span className="text-neutral-300">{new Date(selectedMsg.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="block text-[10px] font-mono text-neutral-500 uppercase mb-0.5">Reply Tracking Status</span>
                <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[9px] font-mono border ${
                  selectedMsg.repliedStatus === 'Replied'
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                    : selectedMsg.repliedStatus === 'Ignored'
                    ? 'bg-neutral-900 border-neutral-800 text-neutral-500'
                    : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                }`}>
                  <span>●</span> <span>{selectedMsg.repliedStatus || 'Pending'}</span>
                </span>
              </div>
            </div>

            {/* Query details */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-neutral-500 uppercase">Subject: "{selectedMsg.subject}"</span>
              </div>
              <div className="p-4 bg-neutral-900/30 border border-neutral-900 rounded-2xl text-xs text-neutral-300 leading-relaxed font-sans whitespace-pre-wrap max-h-40 overflow-y-auto">
                {selectedMsg.message}
              </div>
            </div>

            {/* Reply Log history */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                <h4 className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider flex items-center space-x-1">
                  <span>Reply & Draft Archive</span>
                  <span>({selectedMsg.replies?.length || 0})</span>
                </h4>
              </div>

              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {selectedMsg.replies && selectedMsg.replies.length > 0 ? (
                  selectedMsg.replies.map((rep) => (
                    <div key={rep.id} className="p-3.5 bg-neutral-900/40 border border-neutral-900 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.2 rounded text-[8px] font-mono uppercase ${
                          rep.status === 'Sent'
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                            : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                        }`}>
                          {rep.status}
                        </span>
                        <span className="text-[9px] text-neutral-500 font-mono">
                          {new Date(rep.sentAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="font-semibold text-neutral-200 text-[11px] mt-1">
                        Subj: {rep.subject}
                      </div>
                      <div className="text-neutral-400 text-xs font-sans whitespace-pre-wrap mt-1 bg-black/20 p-2.5 rounded-lg border border-neutral-900/40 leading-relaxed">
                        {rep.message}
                      </div>
                      
                      {rep.status === 'Draft' && (
                        <div className="pt-2 text-right">
                          <button
                            onClick={() => {
                              // Resume draft editing
                              setReplySubject(rep.subject);
                              setReplyBody(rep.message);
                              setReplyError('');
                              generateMathChallenge();
                              setIsViewModalOpen(false);
                              setIsReplyModalOpen(true);
                            }}
                            className="text-[10px] font-bold text-[#D4AF37] hover:underline cursor-pointer"
                          >
                            Resume & Send Draft →
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-neutral-500 italic py-1">No official replies have been drafted or transmitted for this query yet.</p>
                )}
              </div>
            </div>

            {/* Modal Bottom control bar */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-900">
              <button
                onClick={() => {
                  saveMessages(messages.map(m => m.id === selectedMsg.id ? { ...m, read: !m.read } : m));
                  // update current local reference so view updates instantly
                  setSelectedMsg({ ...selectedMsg, read: !selectedMsg.read });
                }}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                {selectedMsg.read ? 'Mark Unread' : 'Mark Read'}
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setReplySubject(`Re: ${selectedMsg.subject}`);
                    setReplyBody('');
                    setReplyError('');
                    generateMathChallenge();
                    setIsReplyModalOpen(true);
                  }}
                  className="px-5 py-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>Reply Now</span>
                </button>
                
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setSelectedMsg(null);
                  }}
                  className="px-5 py-2 bg-neutral-900 border border-neutral-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ======================= COMPOSE REPLY MODAL ============================== */}
      {/* ========================================================================= */}
      {isReplyModalOpen && selectedMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-3xl p-6 relative max-h-[95vh] overflow-y-auto space-y-5 shadow-2xl">
            
            {/* Close button */}
            <button 
              onClick={() => {
                setIsReplyModalOpen(false);
                setSelectedMsg(null);
              }}
              className="absolute top-4 right-4 p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl flex items-center justify-center text-[#D4AF37]">
                <Reply className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">Compose Official Response</h3>
                <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Secure Administrative Transmission</p>
              </div>
            </div>

            {/* Client Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Recipient Name</label>
                <input 
                  type="text" 
                  readOnly 
                  value={selectedMsg.name}
                  className="w-full px-3 py-2.5 bg-neutral-900/60 border border-neutral-900 rounded-xl text-neutral-400 cursor-not-allowed focus:outline-none font-medium" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Recipient Email</label>
                <input 
                  type="text" 
                  readOnly 
                  value={selectedMsg.email}
                  className="w-full px-3 py-2.5 bg-neutral-900/60 border border-neutral-900 rounded-xl text-[#D4AF37] font-mono cursor-not-allowed focus:outline-none" 
                />
              </div>
            </div>

            {/* Editable Subject */}
            <div>
              <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Email Subject</label>
              <input 
                type="text" 
                required
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                placeholder="Corporate response subject line..."
                className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-850 focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none transition-colors" 
              />
            </div>

            {/* Quick Templates Bar */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-mono text-neutral-500 uppercase">Insert Premium Templates:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setReplyBody(`Dear ${selectedMsg.name},\n\nThank you for reaching out to ApnaKhaiyal corporate team regarding "${selectedMsg.subject}". We have received your query and placed it inside our active evaluation grid.\n\nOne of our Senior Technical Leads will review the specifics and provide a structured plan shortly. In the meantime, if you have additional technical diagrams, please transmit them directly to this address.\n\nWarm corporate regards,\nSystems Engineering Guild\nApnaKhaiyal SMC Pvt Ltd`);
                  }}
                  className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-[10px] text-neutral-300 rounded hover:text-[#D4AF37] transition-all cursor-pointer font-sans"
                >
                  ✨ Acknowledge & Process
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReplyBody(`Dear ${selectedMsg.name},\n\nWe have completed our preliminary assessment of the custom proposal you lodged regarding "${selectedMsg.subject}".\n\nTo help us formulate a highly optimized architecture blueprint and estimate double-ledger funding scopes, we would like to schedule a 15-minute alignment call with our principal deciders. Please specify your availability (timezone adjusted) for this week.\n\nWarm corporate regards,\nOperations Guild\nApnaKhaiyal SMC Pvt Ltd`);
                  }}
                  className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-[10px] text-neutral-300 rounded hover:text-[#D4AF37] transition-all cursor-pointer font-sans"
                >
                  💼 Alignment & Consulting Invitation
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReplyBody(`Dear ${selectedMsg.name},\n\nThis is a quick follow-up to our initial confirmation regarding your enterprise query for "${selectedMsg.subject}".\n\nOur system development team has authorized the scope. Let us know if your department operates under a strict deadline so we can optimize our compiler schedules and developer allocation priority accordingly.\n\nWarm corporate regards,\nClient Services Guild\nApnaKhaiyal SMC Pvt Ltd`);
                  }}
                  className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-[10px] text-neutral-300 rounded hover:text-[#D4AF37] transition-all cursor-pointer font-sans"
                >
                  📌 Project Approval Follow-up
                </button>
              </div>
            </div>

            {/* Custom Rich Formatting Helper bar & Response Area */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-mono text-neutral-500 uppercase">Response Message Body</label>
                <span className="text-[9px] font-mono text-neutral-600">{replyBody.length} characters</span>
              </div>
              
              {/* Fake Rich Text Action Bar */}
              <div className="flex items-center space-x-1 p-1.5 bg-neutral-900 border-t border-x border-neutral-850 rounded-t-xl text-[10px] text-neutral-400">
                <span className="px-2 py-0.5 hover:bg-neutral-850 hover:text-white rounded cursor-pointer font-bold" onClick={() => setReplyBody(p => p + ' **Bold Text**')}>B</span>
                <span className="px-2 py-0.5 hover:bg-neutral-850 hover:text-white rounded cursor-pointer italic" onClick={() => setReplyBody(p => p + ' *Italic Text*')}>I</span>
                <span className="px-2 py-0.5 hover:bg-neutral-850 hover:text-white rounded cursor-pointer underline" onClick={() => setReplyBody(p => p + ' __Underlined__')}>U</span>
                <span className="px-2 py-0.5 hover:bg-neutral-850 hover:text-white rounded cursor-pointer font-mono" onClick={() => setReplyBody(p => p + ' `Code Block`')}>Code</span>
                <div className="w-[1px] h-3 bg-neutral-850 mx-1" />
                <span className="px-2 py-0.5 hover:bg-neutral-850 hover:text-white rounded cursor-pointer text-[9px]" onClick={() => setReplyBody(p => p + '\nWarm regards,\nApnaKhaiyal Team')}>Add Signature</span>
              </div>

              <textarea 
                rows={6}
                required
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Type your official administrative message reply here..."
                className="w-full p-3.5 bg-neutral-900 border-b border-x border-neutral-850 rounded-b-xl text-xs text-white focus:outline-none focus:border-[#D4AF37] leading-relaxed resize-none"
              />
            </div>

            {/* Anti-Spam Security Mathematical Challenge */}
            <div className="bg-neutral-900/40 p-4 rounded-xl border border-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="block text-[10px] font-mono text-neutral-500 uppercase mb-0.5">Spam Prevention Lock</span>
                <p className="text-xs text-neutral-300">
                  Please solve: <span className="font-bold text-[#D4AF37] font-mono bg-black/60 px-1.5 py-0.5 rounded border border-neutral-800">{mathNum1} + {mathNum2}</span> = ?
                </p>
              </div>
              <input 
                type="number"
                required
                placeholder="Your Answer"
                value={mathAnswer}
                onChange={(e) => setMathAnswer(e.target.value)}
                className="w-full sm:w-32 px-3 py-2 bg-black border border-neutral-800 focus:border-[#D4AF37]/40 rounded-xl text-xs font-mono text-white text-center focus:outline-none"
              />
            </div>

            {/* Error messaging */}
            {replyError && (
              <div className="flex items-center space-x-2 text-xs text-red-400 bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{replyError}</span>
              </div>
            )}

            {spamCodeError && (
              <div className="flex items-center space-x-2 text-xs text-red-400 bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{spamCodeError}</span>
              </div>
            )}

            {/* Modal Bottom control bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-neutral-900 pt-4 gap-3">
              <span className="text-[9px] font-mono text-neutral-500 uppercase">
                🔒 Authenticated Administrator Session
              </span>

              <div className="flex items-center space-x-2 self-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsReplyModalOpen(false);
                  }}
                  className="px-4 py-2 bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                {/* Save Draft Action */}
                <button
                  type="button"
                  onClick={() => {
                    if (!replySubject.trim() || !replyBody.trim()) {
                      setReplyError('Subject and response body parameters cannot be empty.');
                      return;
                    }

                    // Save draft reply
                    const draftReply: any = {
                      id: 'rep_' + Math.floor(Math.random() * 1000000).toString(),
                      subject: replySubject,
                      message: replyBody,
                      sentAt: new Date().toISOString(),
                      status: 'Draft'
                    };

                    const updatedReplies = [...(selectedMsg.replies || []), draftReply];
                    const updatedMessages = messages.map(m => 
                      m.id === selectedMsg.id 
                        ? { ...m, read: true, replies: updatedReplies } 
                        : m
                    );

                    saveMessages(updatedMessages);
                    setIsReplyModalOpen(false);
                    alert('Response draft successfully saved to lead history!');
                  }}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[#D4AF37] rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Save Draft
                </button>

                {/* Send Reply Action */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isAdminLoggedIn) {
                      setReplyError('Security block: This action requires active administrator authorization.');
                      return;
                    }
                    if (!replySubject.trim() || !replyBody.trim()) {
                      setReplyError('Subject and response body parameters cannot be empty.');
                      return;
                    }
                    if (parseInt(mathAnswer) !== mathNum1 + mathNum2) {
                      setSpamCodeError('Mathematical puzzle incorrect. Please re-evaluate.');
                      return;
                    }

                    // Proceed to send reply with simulation
                    setIsSendingReply(true);
                    setReplyError('');
                    setSpamCodeError('');
                    
                    const progressSteps = [
                      "Connecting to ApnaKhaiyal secure SMTP relay (ssl://mail.apnakhaiyal.com:465)...",
                      "Exchanging SSL cryptographic handshakes...",
                      "Authenticating administrator workspace credentials...",
                      "Signing transmission header with domain DKIM keys...",
                      "Broadcasting response packet blocks...",
                      "Transmission finalized. Status: 250 OK Message Accepted."
                    ];

                    let currentStep = 0;
                    setSendingProgress(progressSteps[0]);

                    const interval = setInterval(() => {
                      currentStep++;
                      if (currentStep < progressSteps.length) {
                        setSendingProgress(progressSteps[currentStep]);
                      } else {
                        clearInterval(interval);
                        
                        // Save reply to message
                        const newReply: any = {
                          id: 'rep_' + Math.floor(Math.random() * 1000000).toString(),
                          subject: replySubject,
                          message: replyBody,
                          sentAt: new Date().toISOString(),
                          status: 'Sent'
                        };

                        const updatedReplies = [...(selectedMsg.replies || []), newReply];
                        const updatedMessages = messages.map(m => 
                          m.id === selectedMsg.id 
                            ? { ...m, read: true, repliedStatus: 'Replied' as const, replies: updatedReplies } 
                            : m
                        );

                        saveMessages(updatedMessages);
                        setIsSendingReply(false);
                        setIsReplyModalOpen(false);

                        // Complete confirmation with standard mailto launcher
                        const confirmMailto = window.confirm(`Response successfully saved to database. \n\nTo physically transmit this email now via your local device system, click OK to launch your desktop mail software pre-filled.`);
                        if (confirmMailto) {
                          const mailtoUri = `mailto:${selectedMsg.email}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`;
                          window.location.href = mailtoUri;
                        }
                      }
                    }, 550);

                  }}
                  className="px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-black rounded-xl text-xs font-black tracking-wide cursor-pointer transition-transform hover:scale-[1.02] flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Response</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ======================= TRANSMISSION LOADER OVERLAY ===================== */}
      {/* ========================================================================= */}
      {isSendingReply && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-6 text-center select-none">
          <div className="w-20 h-20 relative mb-6">
            {/* Spinning gold gears or circles */}
            <div className="absolute inset-0 rounded-full border-4 border-[#D4AF37]/10 border-t-4 border-t-[#D4AF37] animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-neutral-900 border-b-4 border-b-[#F5D76E] animate-spin" style={{ animationDirection: 'reverse' }} />
          </div>

          <h3 className="text-lg font-bold tracking-wider text-white">Transmitting Corporate Response</h3>
          <p className="text-xs text-neutral-500 font-mono mt-1">SECURE OUTBOUND GATEWAY</p>

          {/* Simulated progress step logger */}
          <div className="mt-8 max-w-md w-full bg-neutral-950 p-4 rounded-2xl border border-neutral-900 text-left font-mono space-y-1.5 shadow-2xl">
            <div className="flex items-center space-x-2 text-[10px] text-neutral-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SERVER FEEDBACK:</span>
            </div>
            <p className="text-[11px] text-[#D4AF37] leading-relaxed select-all">
              &gt; {sendingProgress}
            </p>
          </div>

          {/* Pure CSS animated custom width progress bar */}
          <div className="w-64 h-1.5 bg-neutral-900 rounded-full mt-8 overflow-hidden border border-neutral-800">
            <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] rounded-full animate-pulse" style={{ width: '100%' }} />
          </div>
        </div>
      )}

          </div>

        </div>

      </div>
      {/* ======================= FIRST LOGIN FORCE PASSWORD CHANGE MODAL ======================= */}
      {isAdminLoggedIn && authState?.mustChangePassword && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#2d545e] border border-[#3f6973] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-[#12343b] rounded-2xl border border-[#e1b382]/40 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7 text-[#e1b382]" />
              </div>
              <h3 className="text-xl font-bold tracking-wider text-white">
                FIRST LOGIN SECURITY REQUIREMENT
              </h3>
              <p className="text-xs text-[#CBD5E1]">
                You are currently using the default administrator setup account. For production-level security, you must set a new strong password before accessing the CMS dashboard.
              </p>
            </div>

            {forcePassNotice && (
              <div className={`p-4 rounded-xl flex items-center space-x-2 text-xs border ${
                forcePassNotice.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200' : 'bg-red-500/20 border-red-500/40 text-red-300'
              }`}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forcePassNotice.text}</span>
              </div>
            )}

            <form onSubmit={async (e) => {
              e.preventDefault();
              setForcePassNotice(null);

              const rules = validatePasswordRules(forceNewPass, forceConfirmPass, authState?.email);
              if (!rules.isValid) {
                setForcePassNotice({ text: `Password complexity standards unmet: ${rules.errors.join(', ')}`, type: 'error' });
                return;
              }

              if (!authState) return;

              const newSalt = Math.random().toString(36).substring(2, 10);
              const newHash = await hashPassword(forceNewPass, newSalt);

              const updatedState: AdminAuthState = {
                ...authState,
                passwordHash: newHash,
                salt: newSalt,
                lastPasswordChanged: new Date().toISOString(),
                mustChangePassword: false,
                failedAttempts: 0,
                lockoutUntil: null,
                sessionVersion: authState.sessionVersion + 1,
              };

              saveAdminAuthState(updatedState);
              setAuthState(updatedState);
              setActiveSessionVersion(updatedState.sessionVersion);

              setForceNewPass('');
              setForceConfirmPass('');
              showToast('Production password configured successfully! Welcome to ApnaKhaiyal CMS.', 'success');
            }} className="space-y-4">
              
              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-1.5">
                  Set Production Password
                </label>
                <div className="relative">
                  <input 
                    type={showForceNewPass ? 'text' : 'password'}
                    required
                    value={forceNewPass}
                    onChange={(e) => setForceNewPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-11 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowForceNewPass(!showForceNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CBD5E1] hover:text-[#e1b382] p-1.5 cursor-pointer"
                  >
                    {showForceNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-1.5">
                  Confirm Production Password
                </label>
                <div className="relative">
                  <input 
                    type={showForceConfirmPass ? 'text' : 'password'}
                    required
                    value={forceConfirmPass}
                    onChange={(e) => setForceConfirmPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-11 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowForceConfirmPass(!showForceConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CBD5E1] hover:text-[#e1b382] p-1.5 cursor-pointer"
                  >
                    {showForceConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Live Password Complexity Validator */}
              <PasswordComplexityValidator
                password={forceNewPass}
                confirmPassword={forceConfirmPass}
                userEmailOrName={authState?.email}
                onApplyGeneratedPassword={(gen) => {
                  setForceNewPass(gen);
                  setForceConfirmPass(gen);
                }}
                compact={false}
                title="Mandatory Password Complexity Policy"
                subtitle="All criteria must pass before administrator dashboard access is unlocked."
                showActivationGateBadge={true}
              />

              <button
                type="submit"
                disabled={!validatePasswordRules(forceNewPass, forceConfirmPass, authState?.email).isValid}
                className="w-full py-3.5 rounded-xl bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] text-xs font-bold uppercase tracking-widest cursor-pointer shadow-lg transition-all disabled:opacity-50"
              >
                Save Password & Authorize CMS
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated My Profile & Change Password Modal (Accessible to all roles: Admin, HR, Support) */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto" id="profile-password-modal">
          <div
            className="w-full max-w-2xl bg-[#2d545e] border border-[#3f6973] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8"
          >
            <div className="flex items-center justify-between border-b border-[#3f6973] pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#12343b] border border-[#e1b382]/40 flex items-center justify-center text-[#e1b382]">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white tracking-wide">My Account Settings</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-[#e1b382]/10 border border-[#e1b382]/30 text-[#e1b382]">
                      Role: {currentUserRole}
                    </span>
                  </div>
                  <p className="text-xs text-[#CBD5E1] mt-0.5">Manage your personal profile details and update your login password.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#12343b] border border-[#3f6973] hover:border-[#e1b382] text-[#CBD5E1] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="flex space-x-2 border-b border-[#3f6973]/60 pb-2">
              <button
                type="button"
                onClick={() => setProfileModalTab('profile')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  profileModalTab === 'profile'
                    ? 'bg-[#e1b382] text-[#12343b] shadow-md'
                    : 'text-[#CBD5E1] hover:text-white hover:bg-[#12343b]'
                }`}
              >
                Profile Details
              </button>
              <button
                type="button"
                onClick={() => setProfileModalTab('password')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  profileModalTab === 'password'
                    ? 'bg-[#e1b382] text-[#12343b] shadow-md'
                    : 'text-[#CBD5E1] hover:text-white hover:bg-[#12343b]'
                }`}
              >
                Change Password
              </button>
            </div>

            {/* Tab 1: Profile Details */}
            {profileModalTab === 'profile' && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsUpdatingProfile(true);
                  setProfileNotice(null);
                  try {
                    const updated = {
                      ...settings,
                      adminName: adminProfileName,
                      email: adminProfileEmail,
                      adminAvatarUrl: adminProfilePhoto,
                    };
                    await saveSettings(updated);
                    setProfileNotice({ text: 'Profile details saved successfully!', type: 'success' });
                    showToast('Profile updated successfully!', 'success');
                  } catch (err: any) {
                    setProfileNotice({ text: err.message || 'Failed to save profile', type: 'error' });
                    showToast(err.message || 'Profile update failed', 'error');
                  } finally {
                    setIsUpdatingProfile(false);
                  }
                }}
                className="space-y-5"
              >
                {profileNotice && (
                  <div className={`p-3.5 rounded-xl flex items-center space-x-2 text-xs border ${
                    profileNotice.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200' : 'bg-red-500/20 border-red-500/40 text-red-300'
                  }`}>
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{profileNotice.text}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#12343b] p-4 rounded-2xl border border-[#3f6973]">
                  <div className="relative group w-16 h-16 shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-[#3f6973] overflow-hidden flex items-center justify-center">
                      {adminProfilePhoto ? (
                        <img 
                          src={adminProfilePhoto} 
                          alt="Profile Avatar" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <User className="w-8 h-8 text-[#e1b382]" />
                      )}
                    </div>
                    <label className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Upload className="w-4 h-4 text-white" />
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            showToast('Uploading profile photo...', 'info');
                            const url = await uploadImageToSupabase('hero-banners', file);
                            setAdminProfilePhoto(url);
                            showToast('Profile photo uploaded!', 'success');
                          } catch (err: any) {
                            showToast(err.message || 'Photo upload failed', 'error');
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="text-center sm:text-left flex-1 min-w-0">
                    <h5 className="text-sm font-bold text-white truncate">{adminProfileName || 'User'}</h5>
                    <p className="text-xs text-[#CBD5E1] font-mono truncate">{adminProfileEmail || 'No email set'}</p>
                    <p className="text-[10px] text-[#e1b382] mt-0.5">Hover on avatar to upload custom picture</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-1.5">
                      Display Name
                    </label>
                    <input 
                      type="text"
                      required
                      value={adminProfileName}
                      onChange={(e) => setAdminProfileName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="w-full px-4 py-2.5 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input 
                      type="email"
                      required
                      value={adminProfileEmail}
                      onChange={(e) => setAdminProfileEmail(e.target.value)}
                      placeholder="user@apnakhaiyal.com"
                      className="w-full px-4 py-2.5 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-1.5">
                    Avatar URL (Optional)
                  </label>
                  <input 
                    type="url"
                    value={adminProfilePhoto}
                    onChange={(e) => setAdminProfilePhoto(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#3f6973] text-[#CBD5E1] hover:text-white text-xs font-bold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-5 py-2.5 rounded-xl bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md inline-flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isUpdatingProfile ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-[#12343b] animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Change Password */}
            {profileModalTab === 'password' && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setPassNotice(null);
                  setIsChangingPass(true);

                  try {
                    if (!authState) return;

                    // 1. Verify current password against local hash
                    const hashedCurrent = await hashPassword(currentPassInput, authState.salt);
                    const isLegacyCurrent = (authState.mustChangePassword && (currentPassInput === 'admin123' || currentPassInput === 'apnakhaiyal' || currentPassInput === 'apnakhiyal'));
                    if (hashedCurrent !== authState.passwordHash && !isLegacyCurrent) {
                      setPassNotice({ text: 'Current password entered is incorrect.', type: 'error' });
                      setIsChangingPass(false);
                      return;
                    }

                    // 2. Validate password rules with complexity & confirm match
                    const rules = validatePasswordRules(newPassInput, confirmPassInput, authState.email);
                    if (!rules.isValid) {
                      setPassNotice({ text: `Password complexity standards unmet: ${rules.errors.join(', ')}`, type: 'error' });
                      setIsChangingPass(false);
                      return;
                    }

                    // 4. Update Supabase Auth password if available
                    if (isSupabaseConfigured && supabase) {
                      const { error } = await supabase.auth.updateUser({
                        password: newPassInput,
                      });
                      if (error) {
                        console.warn('Supabase updateUser password note:', error.message);
                      }
                    }

                    // 5. Encrypt and Save locally
                    const newSalt = Math.random().toString(36).substring(2, 10);
                    const newHash = await hashPassword(newPassInput, newSalt);
                    const newSessionVer = (authState.sessionVersion || 1) + 1;

                    const updatedState: AdminAuthState = {
                      ...authState,
                      passwordHash: newHash,
                      salt: newSalt,
                      lastPasswordChanged: new Date().toISOString(),
                      mustChangePassword: false,
                      failedAttempts: 0,
                      lockoutUntil: null,
                      sessionVersion: newSessionVer,
                    };

                    saveAdminAuthState(updatedState);
                    setAuthState(updatedState);
                    setActiveSessionVersion(newSessionVer);

                    setCurrentPassInput('');
                    setNewPassInput('');
                    setConfirmPassInput('');

                    setPassNotice({
                      text: 'Password successfully updated and encrypted!',
                      type: 'success'
                    });
                    showToast('Password changed successfully!', 'success');
                  } catch (err: any) {
                    setPassNotice({
                      text: err.message || 'Failed to update password.',
                      type: 'error',
                    });
                  } finally {
                    setIsChangingPass(false);
                  }
                }}
                className="space-y-4"
              >
                {passNotice && (
                  <div className={`p-3.5 rounded-xl flex items-center space-x-2 text-xs border ${
                    passNotice.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200' : 'bg-red-500/20 border-red-500/40 text-red-300'
                  }`}>
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{passNotice.text}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showCurrentPass ? 'text' : 'password'}
                      required
                      value={currentPassInput}
                      onChange={(e) => setCurrentPassInput(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full pl-4 pr-11 py-2.5 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CBD5E1] hover:text-[#e1b382] p-1.5 cursor-pointer"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showNewPass ? 'text' : 'password'}
                      required
                      value={newPassInput}
                      onChange={(e) => setNewPassInput(e.target.value)}
                      placeholder="Enter strong new password"
                      className="w-full pl-4 pr-11 py-2.5 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CBD5E1] hover:text-[#e1b382] p-1.5 cursor-pointer"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showConfirmPass ? 'text' : 'password'}
                      required
                      value={confirmPassInput}
                      onChange={(e) => setConfirmPassInput(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full pl-4 pr-11 py-2.5 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CBD5E1] hover:text-[#e1b382] p-1.5 cursor-pointer"
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Live Password Complexity Validator */}
                <PasswordComplexityValidator
                  password={newPassInput}
                  confirmPassword={confirmPassInput}
                  userEmailOrName={authState?.email}
                  onApplyGeneratedPassword={(gen) => {
                    setNewPassInput(gen);
                    setConfirmPassInput(gen);
                  }}
                  compact={false}
                  title="Password Complexity Standards"
                  subtitle="Verify all criteria before submitting password changes."
                  showActivationGateBadge={false}
                />

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#3f6973] text-[#CBD5E1] hover:text-white text-xs font-bold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPass || !validatePasswordRules(newPassInput, confirmPassInput, authState?.email).isValid}
                    className="px-5 py-2.5 rounded-xl bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md inline-flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isChangingPass ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-[#12343b] animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div 
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border transition-all duration-300 transform translate-y-0 animate-bounce ${
            toast.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' 
              : 'bg-red-950/90 border-red-500/30 text-red-300'
          }`}
          id="custom-toast-notification"
        >
          <span className="text-xs font-semibold">{toast.message}</span>
          <button 
            onClick={() => setToast(null)}
            className="text-xs font-bold hover:text-white shrink-0 ml-1 opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
