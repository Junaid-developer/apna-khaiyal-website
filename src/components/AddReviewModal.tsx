import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Upload, CheckCircle2, User, Building2, Mail, Globe, Sparkles, RefreshCw, Trash2, ShieldCheck } from 'lucide-react';
import { ClientReview } from '../types';
import { uploadImageToSupabase } from '../lib/db';

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (review: ClientReview) => void;
}

export default function AddReviewModal({ isOpen, onClose, onSubmitReview }: AddReviewModalProps) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  
  const [photoUrl, setPhotoUrl] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handlePhotoUpload = async (file: File) => {
    // Validate File Type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('Invalid image format. Please upload JPG, PNG, or WebP.');
      return;
    }
    // Validate File Size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image file exceeds the 5MB size limit.');
      return;
    }

    setErrorMessage('');
    setIsUploadingPhoto(true);
    try {
      const url = await uploadImageToSupabase('review-images', file, 'profiles');
      setPhotoUrl(url);
    } catch (err: any) {
      console.error('Photo upload failed:', err);
      setErrorMessage(err.message || 'Failed to upload profile photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    // Validate File Type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('Invalid logo format. Please upload JPG, PNG, WebP, or SVG.');
      return;
    }
    // Validate File Size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Logo file exceeds the 5MB size limit.');
      return;
    }

    setErrorMessage('');
    setIsUploadingLogo(true);
    try {
      const url = await uploadImageToSupabase('review-images', file, 'logos');
      setCompanyLogoUrl(url);
    } catch (err: any) {
      console.error('Logo upload failed:', err);
      setErrorMessage(err.message || 'Failed to upload company logo.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!company.trim()) {
      setErrorMessage('Please enter your company name.');
      return;
    }
    if (!reviewText.trim()) {
      setErrorMessage('Please write your review feedback.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const newReview: ClientReview = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      company: company.trim(),
      designation: designation.trim(),
      email: email.trim(),
      country: country.trim(),
      rating: rating,
      review: reviewText.trim(),
      photoUrl: photoUrl.trim(),
      companyLogoUrl: companyLogoUrl.trim(),
      status: 'pending', // SAVED AS PENDING - NOT PUBLISHED AUTOMATICALLY
      featured: false,
      displayOrder: 999,
      createdAt: new Date().toISOString(),
    };

    try {
      await onSubmitReview(newReview);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Submit review error:', err);
      setErrorMessage('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCompany('');
    setDesignation('');
    setEmail('');
    setCountry('');
    setRating(5);
    setReviewText('');
    setPhotoUrl('');
    setCompanyLogoUrl('');
    setIsSubmitted(false);
    setErrorMessage('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-[#12343b] border border-[#3f6973] rounded-3xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between p-6 bg-[#2d545e]/60 border-b border-[#3f6973]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#12343b] border border-[#e1b382]/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-[#e1b382]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">Share Your Feedback</h3>
                <p className="text-xs text-[#CBD5E1]">Submit your client testimonial & evaluation</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-[#CBD5E1] hover:text-white hover:bg-[#12343b] transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                  <h4 className="text-xl font-bold text-white">Review Submitted Successfully!</h4>
                  <p className="text-sm text-[#CBD5E1] leading-relaxed">
                    Thank you! Your review has been submitted and is awaiting approval.
                  </p>
                  <div className="p-3 bg-[#2d545e]/50 border border-[#3f6973] rounded-xl text-xs text-[#e1b382] font-mono mt-4 flex items-center justify-center space-x-2">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Our team will verify and feature your review shortly.</span>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={handleClose}
                    className="px-8 py-3 rounded-xl bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg"
                  >
                    Close Window
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMessage && (
                  <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300">
                    {errorMessage}
                  </div>
                )}

                {/* Star Rating Selector */}
                <div className="bg-[#2d545e]/40 p-4 rounded-2xl border border-[#3f6973] text-center space-y-2">
                  <label className="block text-xs font-mono text-[#e1b382] uppercase tracking-wider font-bold">
                    Select Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center justify-center space-x-2 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 transition-transform transform hover:scale-125 focus:outline-none cursor-pointer"
                        title={`${star} Star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            (hoverRating !== null ? star <= hoverRating : star <= rating)
                              ? 'text-[#e1b382] fill-[#e1b382]'
                              : 'text-neutral-600 fill-transparent'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#CBD5E1] font-mono">
                    {rating === 5 && 'Outstanding - Exceptional Enterprise Experience'}
                    {rating === 4 && 'Very Good - High Quality Delivery'}
                    {rating === 3 && 'Good - Satisfactory Work'}
                    {rating === 2 && 'Fair - Met Basic Requirements'}
                    {rating === 1 && 'Needs Improvement'}
                  </p>
                </div>

                {/* Name & Company Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-widest mb-1">
                      Full Name <span className="text-[#e1b382]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sarah Jenkins"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#2d545e]/50 border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white placeholder-[#CBD5E1]/50 focus:outline-none transition-all"
                      />
                      <User className="w-4 h-4 text-[#CBD5E1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-widest mb-1">
                      Company Name <span className="text-[#e1b382]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Nexus Healthcare"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#2d545e]/50 border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white placeholder-[#CBD5E1]/50 focus:outline-none transition-all"
                      />
                      <Building2 className="w-4 h-4 text-[#CBD5E1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                {/* Designation & Country Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-widest mb-1">
                      Designation <span className="text-[10px] text-[#CBD5E1]/60">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chief Technology Officer"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#2d545e]/50 border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white placeholder-[#CBD5E1]/50 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-widest mb-1">
                      Email Address <span className="text-[10px] text-[#CBD5E1]/60">(Optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="sarah@nexus.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-[#2d545e]/50 border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white placeholder-[#CBD5E1]/50 focus:outline-none transition-all"
                      />
                      <Mail className="w-3.5 h-3.5 text-[#CBD5E1] absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-widest mb-1">
                      Country <span className="text-[10px] text-[#CBD5E1]/60">(Optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. United States"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-[#2d545e]/50 border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white placeholder-[#CBD5E1]/50 focus:outline-none transition-all"
                      />
                      <Globe className="w-3.5 h-3.5 text-[#CBD5E1] absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                {/* Review Textarea */}
                <div>
                  <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-widest mb-1">
                    Your Testimonial Review <span className="text-[#e1b382]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your experience collaborating with ApnaKhaiyal, system performance, team professionalism, and delivered solutions..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full p-4 bg-[#2d545e]/50 border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-sm text-white placeholder-[#CBD5E1]/50 focus:outline-none transition-all leading-relaxed"
                  />
                </div>

                {/* Image Uploads Grid (Profile Photo & Company Logo) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  
                  {/* Profile Photo Upload */}
                  <div className="bg-[#2d545e]/30 border border-[#3f6973] rounded-2xl p-4 space-y-3">
                    <label className="block text-xs font-mono text-[#e1b382] uppercase tracking-wider font-bold">
                      Profile Photo <span className="text-[10px] text-[#CBD5E1]/60 font-normal">(Optional)</span>
                    </label>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-[#12343b] border border-[#3f6973] overflow-hidden flex items-center justify-center shrink-0 relative">
                        {photoUrl ? (
                          <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <User className="w-6 h-6 text-[#CBD5E1]" />
                        )}
                        {isUploadingPhoto && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <RefreshCw className="w-4 h-4 text-[#e1b382] animate-spin" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <label className="px-3 py-1.5 rounded-lg bg-[#e1b382]/10 hover:bg-[#e1b382]/20 border border-[#e1b382]/30 text-[#e1b382] text-xs font-bold uppercase tracking-wider cursor-pointer inline-flex items-center space-x-1.5 transition-all">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{photoUrl ? 'Change Photo' : 'Upload Photo'}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handlePhotoUpload(file);
                            }}
                          />
                        </label>
                        {photoUrl && (
                          <button
                            type="button"
                            onClick={() => setPhotoUrl('')}
                            className="text-[10px] text-red-400 hover:text-red-300 block font-mono"
                          >
                            Remove photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Company Logo Upload */}
                  <div className="bg-[#2d545e]/30 border border-[#3f6973] rounded-2xl p-4 space-y-3">
                    <label className="block text-xs font-mono text-[#e1b382] uppercase tracking-wider font-bold">
                      Company Logo <span className="text-[10px] text-[#CBD5E1]/60 font-normal">(Optional)</span>
                    </label>

                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-12 rounded-xl bg-[#12343b] border border-[#3f6973] p-1 flex items-center justify-center shrink-0 relative">
                        {companyLogoUrl ? (
                          <img src={companyLogoUrl} alt="Logo" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <Building2 className="w-6 h-6 text-[#CBD5E1]" />
                        )}
                        {isUploadingLogo && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-xl">
                            <RefreshCw className="w-4 h-4 text-[#e1b382] animate-spin" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <label className="px-3 py-1.5 rounded-lg bg-[#e1b382]/10 hover:bg-[#e1b382]/20 border border-[#e1b382]/30 text-[#e1b382] text-xs font-bold uppercase tracking-wider cursor-pointer inline-flex items-center space-x-1.5 transition-all">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{companyLogoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleLogoUpload(file);
                            }}
                          />
                        </label>
                        {companyLogoUrl && (
                          <button
                            type="button"
                            onClick={() => setCompanyLogoUrl('')}
                            className="text-[10px] text-red-400 hover:text-red-300 block font-mono"
                          >
                            Remove logo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Submit Action Button */}
                <div className="pt-4 border-t border-[#3f6973] flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-5 py-3 rounded-xl border border-[#3f6973] text-[#CBD5E1] hover:text-white hover:bg-[#2d545e]/50 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploadingPhoto || isUploadingLogo}
                    className="px-7 py-3 rounded-xl bg-[#e1b382] hover:bg-[#c89666] text-[#12343b] font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#12343b]" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Submit Review</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
