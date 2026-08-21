import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Github, Instagram, Youtube } from 'lucide-react';
import { SystemSettings, ExpertiseItem, CorporateOfficeSettings, CompanyInformation, CompanyContact } from '../types';
import BrandLogo from './BrandLogo';

interface FooterProps {
  settings: SystemSettings;
  companyInformation?: CompanyInformation;
  companyContact?: CompanyContact;
  setCurrentTab: (tab: string) => void;
  expertise: ExpertiseItem[];
  office?: CorporateOfficeSettings;
}

export default function Footer({ settings, companyInformation, companyContact, setCurrentTab, expertise, office }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const activeInfo = companyInformation || companyContact;
  const displayAddress = activeInfo?.address || '';
  const displayPhone = activeInfo?.phone || settings?.phone || '+92 309 0111330';
  const displayEmail = activeInfo?.email || '';
  const displayCompanyName = activeInfo?.companyName || 'ApnaKhaiyal';

  const rawPhone = displayPhone.includes('3001234567') ? '+92 309 0111330' : displayPhone;
  const footerPhoneDigits = rawPhone.replace(/[^\d+]/g, '');
  const footerTelHref = footerPhoneDigits.startsWith('+') ? `tel:${footerPhoneDigits}` : `tel:+${footerPhoneDigits}`;

  const quickLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'services', label: 'Our Services' },
    { id: 'products', label: 'Products' },
    { id: 'gallery', label: 'Media Gallery' },
    { id: 'team', label: 'Our Team' },
    { id: 'careers', label: 'Careers' },
    { id: 'contact', label: 'Contact Us' }
  ];

  const handleLinkClick = (tabId: string) => {
    setCurrentTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#173D46] border-t border-white/10 backdrop-blur-md pt-10 sm:pt-12 pb-8 sm:pb-10 text-[#CBD5E1] font-sans shadow-lg" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Bio & Logo */}
          <div className="space-y-6">
            <div className="select-none cursor-pointer" onClick={() => { setCurrentTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <BrandLogo 
                customLogoUrl={settings.companyLogo} 
                size="md" 
                showTagline={true} 
              />
            </div>
            <p className="text-sm text-[#CBD5E1] leading-relaxed font-sans mt-2">
              APNAKHAIYAL is a premier corporate software house dedicated to transforming global businesses through robust web platforms, native systems, and intelligent Agentic AI solutions.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-4 mt-4">
              {settings.socialLinks?.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  id="footer-social-facebook"
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#12343b] border border-white/10 hover:border-[#E7C66A] text-[#CBD5E1] hover:text-[#E7C66A] transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinks?.twitter && (
                <a
                  href={settings.socialLinks.twitter}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  id="footer-social-twitter"
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#12343b] border border-white/10 hover:border-[#E7C66A] text-[#CBD5E1] hover:text-[#E7C66A] transition-all"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinks?.linkedin && (
                <a
                  href={settings.socialLinks.linkedin}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  id="footer-social-linkedin"
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#12343b] border border-white/10 hover:border-[#E7C66A] text-[#CBD5E1] hover:text-[#E7C66A] transition-all"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinks?.github && (
                <a
                  href={settings.socialLinks.github}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  id="footer-social-github"
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#12343b] border border-white/10 hover:border-[#E7C66A] text-[#CBD5E1] hover:text-[#E7C66A] transition-all"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinks?.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  id="footer-social-instagram"
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#12343b] border border-white/10 hover:border-[#E7C66A] text-[#CBD5E1] hover:text-[#E7C66A] transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinks?.youtube && (
                <a
                  href={settings.socialLinks.youtube}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  id="footer-social-youtube"
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#12343b] border border-white/10 hover:border-[#E7C66A] text-[#CBD5E1] hover:text-[#E7C66A] transition-all"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-widest uppercase border-b border-white/10 pb-3 mb-6">
              Navigation
            </h3>
            <ul className="space-y-3 text-sm">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleLinkClick(link.id)}
                    id={`footer-link-${link.id}`}
                    className="text-[#CBD5E1] hover:text-[#E7C66A] hover:translate-x-1.5 transition-all cursor-pointer inline-flex items-center"
                  >
                    <span className="mr-1.5 text-xs text-[#E7C66A]">▪</span>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Core Expertise Areas */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-widest uppercase border-b border-white/10 pb-3 mb-6">
              Expertise
            </h3>
            <ul className="space-y-3 text-sm text-[#CBD5E1] font-sans">
              {expertise.map((item) => (
                <li key={item.id} className="flex items-center">
                  <span className="text-[#E7C66A] mr-2">✦</span>
                  {item.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-widest uppercase border-b border-white/10 pb-3 mb-6">
              Corporate Office
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-[#E7C66A] shrink-0 mr-3 mt-0.5" />
                <span className="text-[#CBD5E1] leading-relaxed font-sans break-words">{displayAddress}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-[#E7C66A] shrink-0 mr-3" />
                <a 
                  href={footerTelHref} 
                  id="footer-phone" 
                  className="text-[#CBD5E1] hover:text-[#E7C66A] hover:underline transition-colors cursor-pointer break-all xs:break-normal"
                  title="Click to dial company phone number"
                >
                  {rawPhone}
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-[#E7C66A] shrink-0 mr-3" />
                <a href={`mailto:${displayEmail}`} id="footer-email" className="text-[#CBD5E1] hover:text-[#E7C66A] transition-colors break-all xs:break-normal">{displayEmail}</a>
              </div>
              {(() => {
                const targetAddress = displayAddress || companyContact?.address || office?.address || 'Model Town C, Bahawalpur, Pakistan';
                const rawLink = office?.googleMapLink || '';
                const isEmbedUrl = !rawLink || rawLink.includes('output=embed') || rawLink.includes('maps.google.com/maps?') || rawLink.includes('/embed');
                const mapUrl = !isEmbedUrl
                  ? rawLink
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(targetAddress)}`;
                return (
                  <div className="pt-2">
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#E7C66A] hover:text-[#e1b382] hover:underline inline-flex items-center font-medium cursor-pointer"
                      id="footer-gmap-link"
                    >
                      <span className="mr-1">📍</span> View on Google Maps ↗
                    </a>
                  </div>
                );
              })()}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#CBD5E1]">
          <p id="footer-copyright">
            {(settings.copyright ? settings.copyright.replace(/\s*SECP\s*SMC\s*Registration\.?/gi, '').trim() : `© ${currentYear} ${settings.companyName || 'ApnaKhaiyal'}. All rights reserved.`).replace(/ApnaKhiyal/gi, 'ApnaKhaiyal')}
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0 font-sans">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#site-map" className="hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
