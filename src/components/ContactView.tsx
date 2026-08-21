import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { SystemSettings, ContactMessage, CompanyInformation, CompanyContact, ProductItem } from '../types';

interface ContactViewProps {
  settings: SystemSettings;
  companyInformation?: CompanyInformation;
  companyContact?: CompanyContact;
  onSendMessage: (msg: ContactMessage) => void;
  initialProductName?: string;
  products?: ProductItem[];
}

export default function ContactView({ 
  settings, 
  companyInformation, 
  companyContact, 
  onSendMessage,
  initialProductName = '',
  products = []
}: ContactViewProps) {
  // Contact details from single source of truth (company_information table)
  const activeInfo = companyInformation || companyContact;
  const displayAddress = activeInfo?.address || '';
  const displayPhone = activeInfo?.phone || settings?.phone || '+92 309 0111330';
  const displayEmail = activeInfo?.email || '';

  // Clean phone string for tel: link while maintaining dynamic database binding
  const rawPhone = displayPhone.includes('3001234567') ? '+92 309 0111330' : displayPhone;
  const digitsOnly = rawPhone.replace(/[^\d+]/g, '');
  const telHref = digitsOnly.startsWith('+') ? `tel:${digitsOnly}` : `tel:+${digitsOnly}`;

  // Form input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [productInterestedIn, setProductInterestedIn] = useState(initialProductName);
  const [subject, setSubject] = useState(initialProductName ? `Demo Request: ${initialProductName}` : '');
  const [message, setMessage] = useState(
    initialProductName 
      ? `Hello, I would like to schedule a product demo and explore implementation details for ${initialProductName}.`
      : ''
  );
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Update field if initialProductName changes
  useEffect(() => {
    if (initialProductName) {
      setProductInterestedIn(initialProductName);
      setSubject(`Demo Request: ${initialProductName}`);
      setMessage(`Hello, I would like to schedule a product demo and explore implementation details for ${initialProductName}.`);
      // Scroll smoothly to contact form section
      const formElement = document.getElementById('contact-form-card');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [initialProductName]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      setFormError('Please complete all required form fields before submitting.');
      return;
    }

    const compiledSubject = productInterestedIn && !subject.toLowerCase().includes(productInterestedIn.toLowerCase())
      ? `[${productInterestedIn}] ${subject}`
      : subject;

    const compiledMessage = productInterestedIn
      ? `Product / System Interested In: ${productInterestedIn}\n\n${message}`
      : message;

    const newMsg: ContactMessage = {
      id: `msg_${Date.now()}`,
      name,
      email,
      subject: compiledSubject,
      message: compiledMessage,
      read: false,
      repliedStatus: 'Pending',
      createdAt: new Date().toISOString()
    };

    onSendMessage(newMsg);
    
    // Reset Form
    setName('');
    setEmail('');
    setProductInterestedIn('');
    setSubject('');
    setMessage('');
    setFormError('');
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
    }, 5000);
  };

  return (
    <div className="bg-[#12343b] text-white min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 font-sans" id="contact-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Secure Consultations
          </h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto mt-3 text-sm font-sans">
            Reach out to our executive architects for secure enterprise deployments, technical feasibility reviews, and license quotes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-10">
          
          {/* Left Block: Contact Details */}
          <div className="lg:col-span-5 space-y-8">
            <h3 className="text-2xl font-bold tracking-wide text-white border-b border-[#3f6973] pb-3">
              Corporate Desk
            </h3>
            <p className="text-[#94A3B8] text-sm leading-relaxed font-sans">
              Our corporate office is structured to support enterprise development parameters. Contact us through secure lines or schedule an onsite Model Town C, Bahawalpur meeting.
            </p>

            <div className="space-y-6">
              
              {/* Address card */}
              <div className="flex items-start space-x-4 premium-card p-5 rounded-2xl group transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-[#12343b] flex items-center justify-center shrink-0 border border-[#3f6973]">
                  <MapPin className="w-5 h-5 text-[#e1b382]" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-widest block leading-none">Registered HQ</span>
                  <span className="text-white text-sm leading-relaxed font-sans block break-words">{displayAddress}</span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayAddress || 'Model Town C, Bahawalpur, Pakistan')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#e1b382] hover:text-[#F5D76E] hover:underline inline-flex items-center font-medium pt-1 cursor-pointer"
                    id="contact-address-card-gmap-link"
                  >
                    <span>View on Google Maps ↗</span>
                  </a>
                </div>
              </div>

              {/* Phone card */}
              <div className="flex items-start space-x-4 premium-card p-5 rounded-2xl group transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-[#12343b] flex items-center justify-center shrink-0 border border-[#3f6973]">
                  <Phone className="w-5 h-5 text-[#e1b382]" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-widest block leading-none">Secure Phone</span>
                  <a 
                    href={telHref} 
                    id="contact-phone" 
                    className="text-white hover:text-[#e1b382] hover:underline transition-colors text-sm font-sans block cursor-pointer break-all xs:break-normal"
                    title="Click to dial company phone number"
                  >
                    {rawPhone}
                  </a>
                </div>
              </div>

              {/* Email card */}
              <div className="flex items-start space-x-4 premium-card p-5 rounded-2xl group transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-[#12343b] flex items-center justify-center shrink-0 border border-[#3f6973]">
                  <Mail className="w-5 h-5 text-[#e1b382]" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-widest block leading-none">Technical Inbox</span>
                  <a href={`mailto:${displayEmail}`} id="contact-email" className="text-white hover:text-[#e1b382] transition-colors text-sm font-sans block break-all xs:break-normal">{displayEmail}</a>
                </div>
              </div>

            </div>
          </div>

          {/* Right Block: Interactive Form */}
          <div className="lg:col-span-7 premium-card p-6 sm:p-8 rounded-3xl relative border border-[#3f6973]" id="contact-form-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold tracking-wide text-white">
                Write to Our Executive Team
              </h3>
              {productInterestedIn && (
                <span className="inline-flex items-center text-[11px] font-mono font-semibold px-3 py-1 rounded-full bg-[#e1b382]/20 border border-[#e1b382]/40 text-[#e1b382]" id="selected-product-badge">
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  <span>Demo Mode</span>
                </span>
              )}
            </div>

            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center space-x-2 text-xs text-emerald-300"
                id="contact-form-success"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Your query has been logged securely in ApnaKhaiyal database! Our Lead Project Manager will contact you.</span>
              </motion.div>
            )}

            {formError && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-xl flex items-center space-x-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" id="main-contact-form">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full name */}
                <div>
                  <label className="block text-xs font-mono text-[#94A3B8] uppercase tracking-wider mb-2">
                    Full Name *
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    id="contact-form-name-input"
                    className="w-full px-4 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white placeholder-[#94A3B8]/60 focus:outline-none transition-all"
                  />
                </div>

                {/* Email address */}
                <div>
                  <label className="block text-xs font-mono text-[#94A3B8] uppercase tracking-wider mb-2">
                    Email Address *
                  </label>
                  <input 
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="contact-form-email-input"
                    className="w-full px-4 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white placeholder-[#94A3B8]/60 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Product Interested In */}
                <div>
                  <label className="block text-xs font-mono text-[#94A3B8] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Product Interested In</span>
                    {productInterestedIn && (
                      <span className="text-[10px] text-[#e1b382] font-semibold lowercase">selected</span>
                    )}
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      list="available-products-list"
                      placeholder="e.g. Apna Khaiyal HMS or ERP"
                      value={productInterestedIn}
                      onChange={(e) => setProductInterestedIn(e.target.value)}
                      id="contact-form-product-input"
                      className="w-full px-4 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white placeholder-[#94A3B8]/60 focus:outline-none transition-all"
                    />
                    {products && products.length > 0 && (
                      <datalist id="available-products-list">
                        {products.map(p => (
                          <option key={p.id} value={p.name}>{p.name} ({p.category})</option>
                        ))}
                      </datalist>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-mono text-[#94A3B8] uppercase tracking-wider mb-2">
                    Subject *
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Custom ERP licensing query"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    id="contact-form-subject-input"
                    className="w-full px-4 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white placeholder-[#94A3B8]/60 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-mono text-[#94A3B8] uppercase tracking-wider mb-2">
                  Query Message *
                </label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Tell us about your organization scales and systems milestones..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  id="contact-form-message-input"
                  className="w-full p-4 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white placeholder-[#94A3B8]/60 focus:outline-none transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                id="contact-form-submit-btn"
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-[#e1b382] hover:bg-[#d4af37] text-[#12343b] hover:text-[#12343b] text-xs font-bold tracking-widest uppercase flex items-center justify-center space-x-2 shadow-lg cursor-pointer transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Secure Request</span>
              </button>

            </form>
          </div>

        </div>

        {/* Embedded Google Map */}
        {(() => {
          const mapAddress = displayAddress || 'Model Town C, Bahawalpur, Pakistan';
          const iframeSrc = (settings.googleMapsEmbedUrl && settings.googleMapsEmbedUrl.includes('output=embed'))
            ? settings.googleMapsEmbedUrl
            : `https://maps.google.com/maps?q=${encodeURIComponent(mapAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

          return (
            <div className="rounded-3xl overflow-hidden border border-[#3f6973] aspect-video max-h-[450px] relative shadow-2xl group" id="contact-gmap-wrapper">
              <iframe
                src={iframeSrc}
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'contrast(105%) opacity(85%)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Google Maps Embed - ${mapAddress}`}
              />
              <div className="absolute top-4 right-4 z-10">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#12343b]/90 hover:bg-[#12343b] border border-[#e1b382]/50 hover:border-[#e1b382] text-xs font-bold text-[#e1b382] hover:text-[#F5D76E] shadow-xl backdrop-blur-md flex items-center space-x-2 transition-all cursor-pointer"
                  id="contact-map-external-link"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>View on Google Maps ↗</span>
                </a>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
