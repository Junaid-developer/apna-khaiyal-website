import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SystemSettings, CompanyInformation, CompanyContact } from '../types';
import BrandLogo from './BrandLogo';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  settings: SystemSettings;
  companyInformation?: CompanyInformation;
  companyContact?: CompanyContact;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  settings,
  companyInformation,
  companyContact,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'products', label: 'Products' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'team', label: 'Our Team' },
    { id: 'careers', label: 'Careers' },
    { id: 'contact', label: 'Contact' }
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeInfo = companyInformation || companyContact;
  const displayCompanyName = activeInfo?.companyName || "ApnaKhaiyal";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#173D46]/90 backdrop-blur-md border-b border-white/10 shadow-lg" id="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Brand Name */}
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer group py-1" 
            onClick={() => handleNavClick('home')}
            id="header-brand-container"
          >
            <BrandLogo 
              customLogoUrl={settings.companyLogo} 
              size="md" 
              showTagline={true} 
            />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {menuItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  id={`nav-link-${item.id}`}
                  className={`px-3 py-2 text-sm font-medium tracking-wide transition-colors relative cursor-pointer ${
                    isActive
                      ? 'text-[#E7C66A] font-semibold'
                      : 'text-[#CBD5E1] hover:text-[#E7C66A]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavLine"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-[#E7C66A] to-[#d4af37]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Action Controls: Mobile Menu Trigger */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Mobile Hamburger Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              id="mobile-menu-trigger"
              className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl text-[#CBD5E1] hover:text-[#E7C66A] hover:bg-[#12343b] transition-all focus:outline-none cursor-pointer border border-white/10"
              aria-label="Toggle Menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 text-[#E7C66A]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Slide Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-[#173D46] border-b border-white/10 overflow-hidden shadow-xl"
            id="mobile-nav-drawer"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {menuItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    id={`mobile-link-${item.id}`}
                    className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium tracking-wide transition-all ${
                      isActive
                        ? 'bg-[#E7C66A]/10 text-[#E7C66A] border-l-4 border-[#E7C66A] pl-3 font-bold'
                        : 'text-[#CBD5E1] hover:text-white hover:bg-[#12343b]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
