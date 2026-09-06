import { useState, useRef, DragEvent, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, ArrowRight, Check, Sparkles, Upload, FileText, CheckCircle2, User, Mail, Phone, AlertCircle } from 'lucide-react';
import { CareerOpportunity, JobApplication } from '../types';

interface CareersViewProps {
  opportunities: CareerOpportunity[];
  onAddApplication: (app: JobApplication) => void | Promise<void>;
}

export default function CareersView({ opportunities, onAddApplication }: CareersViewProps) {
  const [selectedJob, setSelectedJob] = useState<CareerOpportunity | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [resumeBase64, setResumeBase64] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // A ref is intentionally used in addition to React state. React state updates
  // are asynchronous, so several very-fast native click events can otherwise
  // enter the handler before the disabled attribute is rendered.
  const submitLockRef = useRef(false);

  const safeOpportunities = Array.isArray(opportunities) ? opportunities : [];
  const activeJobs = safeOpportunities.filter(op => op && op.active && op.type === 'job');
  const activeInternships = safeOpportunities.filter(op => op && op.active && op.type === 'internship');

  const processFile = (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFormError('File exceeds 5MB size limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setResumeBase64(e.target.result as string);
        setResumeName(file.name);
        setFormError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };
  const handleTriggerFileSelect = () => fileInputRef.current?.click();

  const handleOpenApply = (job: CareerOpportunity) => {
    // Never allow an old submission lock to leak into a newly opened form.
    submitLockRef.current = false;
    setSelectedJob(job);
    setIsApplyModalOpen(true);
    setFormSubmitted(false);
    setIsSubmitting(false);
    setFormError('');
    setFullName(''); setEmail(''); setPhone(''); setCoverLetter(''); setResumeName(''); setResumeBase64('');
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Synchronous first-line guard: this blocks duplicate submits even before
    // React has a chance to render the disabled button.
    if (submitLockRef.current) return;

    if (!fullName.trim() || !email.trim() || !phone.trim() || !resumeBase64) {
      setFormError('Please fill out all required fields and upload your resume.');
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);
    setFormError('');

    const newApp: JobApplication = {
      id: crypto.randomUUID(),
      jobId: selectedJob?.id || 'general',
      jobTitle: selectedJob?.title || 'General Application',
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      resumeUrl: resumeBase64,
      coverLetter: coverLetter.trim(),
      appliedAt: new Date().toISOString()
    };

    try {
      await onAddApplication(newApp);
      setFormSubmitted(true);
      setFormError('');
    } catch (error) {
      console.error('[Careers] Application submission failed:', error);
      const message = error instanceof Error ? error.message : 'Unable to submit your application right now. Please try again.';
      setFormError(message);
      // Unlock only on failure. A successful submission stays locked so it
      // cannot accidentally be inserted a second time.
      submitLockRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#12343b] text-white min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 font-sans" id="careers-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">Build the Future of Enterprise Technology</h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto mt-3 text-sm font-sans">Work with world-class engineers designing high-yield financial structures, native mobile systems, and autonomous agentic AI.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center mb-12 sm:mb-16">
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-[#3f6973] relative z-10 shadow-2xl bg-[#2d545e]/50">
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop" alt="Our Engineering Team" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-all duration-700" loading="lazy" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop'; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12343b] via-transparent to-transparent opacity-80" />
            </div>
            <div className="absolute inset-0 bg-[#e1b382]/10 blur-2xl rounded-3xl pointer-events-none -z-0" />
          </div>
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-wide text-white">Why Join ApnaKhaiyal?</h3>
            <p className="text-[#94A3B8] text-sm leading-relaxed font-sans">We prioritize complete ownership and outcome-based targets. At ApnaKhaiyal, you will have the technical freedom to select your stack, architect features, and deploy services directly to production.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Full Autonomy|Outcome-based KPIs and direct developer ownership.','Premium Health Care|Top-tier health coverages for you and your dependents.','Dedicated Growth Budgets|Annual allowances for tutorials, textbooks, and cloud certifications.','Profit Dividends|A share in the enterprise licensing margins we deliver.'].map(item => { const [title, desc] = item.split('|'); return <div key={title} className="premium-card p-4 rounded-xl flex items-start space-x-3"><Check className="w-5 h-5 text-[#e1b382] shrink-0 mt-0.5" /><div><h4 className="text-sm font-semibold text-white">{title}</h4><p className="text-xs text-[#94A3B8] mt-1 font-sans">{desc}</p></div></div>; })}
            </div>
          </div>
        </div>

        <div className="space-y-16">
          <div>
            <h3 className="text-xl font-bold tracking-wide text-white border-b border-[#3f6973] pb-3 mb-6 flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-full bg-[#e1b382]" /><span>Permanent Openings</span></h3>
            <div className="space-y-4" id="permanent-jobs-list">
              {activeJobs.map(job => <div key={job.id} onClick={() => handleOpenApply(job)} className="premium-card p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group cursor-pointer hover:border-[#e1b382]/50 transition-all"><div className="space-y-2"><div className="flex items-center space-x-3 flex-wrap gap-2"><h4 className="text-base sm:text-lg font-bold text-white group-hover:text-[#e1b382] transition-colors">{job.title}</h4><span className="text-[10px] font-mono font-bold tracking-widest text-[#F1F5F9] uppercase bg-[#12343b] border border-[#3f6973] px-2 py-0.5 rounded">{job.department}</span></div><p className="text-xs text-[#94A3B8] font-sans max-w-2xl">{job.description}</p><span className="text-[11px] font-mono text-[#e1b382] block">{job.location}</span></div><button type="button" onClick={(e) => { e.stopPropagation(); handleOpenApply(job); }} id={`apply-btn-${job.id}`} className="px-6 py-3 rounded-full bg-[#e1b382] hover:bg-[#d4af37] text-[#12343b] font-bold text-xs tracking-wide uppercase transition-all whitespace-nowrap cursor-pointer shadow-md">Apply Now</button></div>)}
              {activeJobs.length === 0 && <p className="text-xs text-[#94A3B8] font-sans">No permanent job vacancies are currently listed. Please contact us for general applications.</p>}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-wide text-white border-b border-[#3f6973] pb-3 mb-6 flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-full bg-[#e1b382]" /><span>Internship Programs (Paid)</span></h3>
            <div className="space-y-4" id="internships-list">
              {activeInternships.map(job => <div key={job.id} onClick={() => handleOpenApply(job)} className="premium-card p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group cursor-pointer hover:border-[#e1b382]/50 transition-all"><div className="space-y-2"><div className="flex items-center space-x-3 flex-wrap gap-2"><h4 className="text-base sm:text-lg font-bold text-white group-hover:text-[#e1b382] transition-colors">{job.title}</h4><span className="text-[10px] font-mono font-bold tracking-widest text-[#F1F5F9] uppercase bg-[#12343b] border border-[#3f6973] px-2 py-0.5 rounded">{job.department}</span></div><p className="text-xs text-[#94A3B8] font-sans max-w-2xl">{job.description}</p><span className="text-[11px] font-mono text-[#e1b382] block">{job.location}</span></div><button type="button" onClick={(e) => { e.stopPropagation(); handleOpenApply(job); }} id={`apply-btn-${job.id}`} className="px-6 py-3 rounded-full bg-[#e1b382] hover:bg-[#d4af37] text-[#12343b] font-bold text-xs tracking-wide uppercase transition-all whitespace-nowrap cursor-pointer shadow-md">Apply Now</button></div>)}
              {activeInternships.length === 0 && <p className="text-xs text-[#94A3B8] font-sans">No internship slots are currently listed.</p>}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isApplyModalOpen && selectedJob && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md" id="job-application-modal"><motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="premium-card rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto bg-[#2d545e] border border-[#3f6973]" onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => { submitLockRef.current = false; setIsApplyModalOpen(false); }} className="absolute top-4 right-4 text-[#94A3B8] hover:text-white" aria-label="Close form">✕</button>
            {!formSubmitted ? <form onSubmit={handleFormSubmit} className="space-y-5">
              <div><span className="text-[10px] font-mono text-[#e1b382] tracking-wider uppercase block">Application Form</span><h4 className="text-xl font-bold tracking-wide text-white leading-tight mt-1">{selectedJob.title}</h4><p className="text-xs text-[#94A3B8] font-sans mt-1">{selectedJob.department} · {selectedJob.location}</p></div>
              {formError && <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl flex items-center space-x-2 text-xs text-red-300"><AlertCircle className="w-4 h-4 shrink-0" /><span>{formError}</span></div>}
              <div className="space-y-4">
                <div><label className="block text-xs font-mono text-[#94A3B8] uppercase mb-1.5">Full Name *</label><div className="relative"><User className="absolute left-3 top-3 w-4 h-4 text-[#94A3B8]" /><input type="text" required placeholder="Enter your name" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white placeholder-[#94A3B8]/60 focus:outline-none transition-all" /></div></div>
                <div><label className="block text-xs font-mono text-[#94A3B8] uppercase mb-1.5">Email Address *</label><div className="relative"><Mail className="absolute left-3 top-3 w-4 h-4 text-[#94A3B8]" /><input type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white placeholder-[#94A3B8]/60 focus:outline-none transition-all" /></div></div>
                <div><label className="block text-xs font-mono text-[#94A3B8] uppercase mb-1.5">Phone Number *</label><div className="relative"><Phone className="absolute left-3 top-3 w-4 h-4 text-[#94A3B8]" /><input type="tel" required placeholder="+92 300 0000000" value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white placeholder-[#94A3B8]/60 focus:outline-none transition-all" /></div></div>
                <div><label className="block text-xs font-mono text-[#94A3B8] uppercase mb-1.5">Short Cover Letter</label><textarea rows={3} placeholder="Briefly pitch why you would like to join our technical guild..." value={coverLetter} onChange={e => setCoverLetter(e.target.value)} className="w-full p-4 bg-[#12343b] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white placeholder-[#94A3B8]/60 focus:outline-none transition-all resize-none" /></div>
                <div><label className="block text-xs font-mono text-[#94A3B8] uppercase mb-1.5">Upload Resume / CV *</label><div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={handleTriggerFileSelect} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isDragging ? 'border-[#e1b382] bg-[#e1b382]/10' : resumeName ? 'border-emerald-400 bg-emerald-500/10' : 'border-[#3f6973] hover:border-[#e1b382] bg-[#12343b]/60'}`}><input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.doc,.docx" className="hidden" />{resumeName ? <div className="flex flex-col items-center space-y-2"><FileText className="w-8 h-8 text-emerald-400" /><span className="text-xs font-semibold text-white">{resumeName}</span><span className="text-[10px] text-[#94A3B8]">File loaded successfully. Click to replace.</span></div> : <div className="flex flex-col items-center space-y-2"><Upload className="w-8 h-8 text-[#e1b382]" /><span className="text-xs font-semibold text-white">Drag & drop your resume PDF here</span><span className="text-[10px] text-[#94A3B8]">or click to browse local files (PDF, DOCX up to 5MB)</span></div>}</div></div>
              </div>
              <button type="submit" id="submit-job-app-btn" disabled={isSubmitting} aria-busy={isSubmitting} className={`w-full py-3.5 rounded-xl bg-[#e1b382] hover:bg-[#d4af37] text-[#12343b] text-xs font-bold tracking-widest uppercase transition-all shadow-md ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>{isSubmitting ? 'Submitting Application...' : 'Submit Corporate Application'}</button>
            </form> : <div className="text-center py-8 space-y-4"><div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40"><CheckCircle2 className="w-8 h-8 text-emerald-300" /></div><h4 className="text-xl font-bold tracking-wide text-white">Application Received</h4><p className="text-xs text-[#94A3B8] font-sans max-w-sm mx-auto leading-relaxed">Thank you for applying to ApnaKhaiyal. Your application record is securely cataloged inside our database. Our Head of Engineering will contact you if your matrix aligns.</p><button type="button" onClick={() => { submitLockRef.current = false; setIsApplyModalOpen(false); }} className="px-6 py-2.5 rounded-full bg-[#12343b] hover:bg-[#e1b382] text-[#94A3B8] hover:text-[#12343b] border border-[#3f6973] hover:border-[#e1b382] text-xs font-semibold tracking-wider transition-all mt-4 cursor-pointer">Dismiss Portal</button></div>}
          </motion.div></motion.div>}
        </AnimatePresence>
      </div>
    </div>
  );
}
