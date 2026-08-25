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
  const activeInfo = companyInformation || companyContact;
  const displayAddress = activeInfo?.address || 'Model Town C, Bahawalpur, Pakistan';
  const displayPhone = activeInfo?.phone || settings?.phone || '+92 309 0111330';
  const displayEmail = activeInfo?.email || settings?.email || '';

  const phoneNumbers = [displayPhone, activeInfo?.phoneSecondary || '']
    .flatMap((phone) => phone.split(/[\n,;]+/))
    .map((phone) => phone.trim())
    .filter(Boolean)
    .map((phone) => phone.includes('3001234567') ? '+92 309 0111330' : phone);

  const makeTelHref = (phone: string) => {
    const digitsOnly = phone.replace(/[^\d+]/g, '');
    return digitsOnly.startsWith('+') ? `tel:${digitsOnly}` : `tel:+${digitsOnly}`;
  };

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [productInterestedIn, setProductInterestedIn] = useState(initialProductName);
  const [subject, setSubject] = useState(initialProductName ? `Demo Request: ${initialProductName}` : '');
  const [message, setMessage] = useState(initialProductName
    ? `Hello, I would like to schedule a product demo and explore implementation details for ${initialProductName}.`
    : '');
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (initialProductName) {
      setProductInterestedIn(initialProductName);
      setSubject(`Demo Request: ${initialProductName}`);
      setMessage(`Hello, I would like to schedule a product demo and explore implementation details for ${initialProductName}.`);
      setTimeout(() => {
        document.getElementById('contact-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
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
    setName('');
    setEmail('');
    setProductInterestedIn('');
    setSubject('');
    setMessage('');
    setFormError('');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <div className="bg-[#12343b] text-white min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 font-sans" id="contact-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">Secure Consultations</h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto mt-3 text-sm">
            Reach out to our executive team for secure enterprise deployments, technical feasibility reviews, and license quotes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-10">
          <div className="lg:col-span-5 space-y-8">
            <h3 className="text-2xl font-bold tracking-wide text-white border-b border-[#3f6973] pb-3">Corporate Desk</h3>
            <p className="text-[#94A3B8] text-sm leading-relaxed">
              Our corporate office is structured to support enterprise development. Contact us through secure lines or schedule an onsite meeting.
            </p>

            <div className="space-y-6">
              <div className="flex items-start space-x-4 premium-card p-5 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-[#12343b] flex items-center justify-center shrink-0 border border-[#3f6973]"><MapPin className="w-5 h-5 text-[#e1b382]" /></div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-widest block">Registered HQ</span>
                  <span className="text-white text-sm leading-relaxed block">{displayAddress}</span>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayAddress)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#e1b382] hover:underline">View on Google Maps ↗</a>
                </div>
              </div>

              <div className="flex items-start space-x-4 premium-card p-5 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-[#12343b] flex items-center justify-center shrink-0 border border-[#3f6973]"><Phone className="w-5 h-5 text-[#e1b382]" /></div>
                <div className="space-y-2 min-w-0">
                  <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-widest block">Secure Phone</span>
                  {phoneNumbers.map((phone, index) => (
                    <a key={`${phone}-${index}`} href={makeTelHref(phone)} className="text-white hover:text-[#e1b382] hover:underline transition-colors text-sm block">{phone}</a>
                  ))}
                </div>
              </div>

              <div className="flex items-start space-x-4 premium-card p-5 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-[#12343b] flex items-center justify-center shrink-0 border border-[#3f6973]"><Mail className="w-5 h-5 text-[#e1b382]" /></div>
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-widest block">Technical Inbox</span>
                  <a href={`mailto:${displayEmail}`} className="text-white hover:text-[#e1b382] transition-colors text-sm break-all">{displayEmail}</a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 premium-card p-6 sm:p-8 rounded-3xl relative border border-[#3f6973]" id="contact-form-card">
            <div className="flex items-center justify-between mb-6 gap-4">
              <h3 className="text-xl font-bold tracking-wide text-white">Write to Our Executive Team</h3>
              {productInterestedIn && <span className="inline-flex items-center text-[11px] font-mono font-semibold px-3 py-1 rounded-full bg-[#e1b382]/20 border border-[#e1b382]/40 text-[#e1b382]"><Sparkles className="w-3 h-3 mr-1.5" />Demo Mode</span>}
            </div>

            {isSuccess && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-xs text-emerald-300"><CheckCircle2 className="w-4 h-4 shrink-0" /><span>Your query has been logged securely. Our team will contact you.</span></motion.div>}
            {formError && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-xl flex items-center gap-2 text-xs text-red-300"><AlertCircle className="w-4 h-4 shrink-0" /><span>{formError}</span></div>}

            <form onSubmit={handleSubmit} className="space-y-5" id="main-contact-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono text-[#94A3B8] uppercase tracking-wider mb-2">Full Name *</label>
                  <input type="text" required placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} id="contact-form-name-input" className="w-full px-4 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white placeholder-[#94A3B8]/60 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#94A3B8] uppercase tracking-wider mb-2">Email Address *</label>
                  <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} id="contact-form-email-input" className="w-full px-4 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white placeholder-[#94A3B8]/60 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#94A3B8] uppercase tracking-wider mb-2">Product Interested In</label>
                <select value={productInterestedIn} onChange={(e) => { const value = e.target.value; setProductInterestedIn(value); if (value) { setSubject(`Demo Request: ${value}`); setMessage(`Hello, I would like to schedule a product demo and explore implementation details for ${value}.`); } }} className="w-full px-4 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white focus:outline-none">
                  <option value="">Select a product or system</option>
                  {products.map((product) => <option key={product.id} value={product.name}>{product.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#94A3B8] uppercase tracking-wider mb-2">Subject *</label>
                <input type="text" required placeholder="How can we help?" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white placeholder-[#94A3B8]/60 focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#94A3B8] uppercase tracking-wider mb-2">Message *</label>
                <textarea required rows={6} placeholder="Tell us about your requirements..." value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-4 py-3 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white placeholder-[#94A3B8]/60 focus:outline-none resize-y" />
              </div>

              <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#e1b382] text-[#12343b] font-bold hover:bg-[#F5D76E] transition-colors" id="contact-form-submit"><Send className="w-4 h-4" />Send Secure Inquiry</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
