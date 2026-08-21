import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Trash2, 
  Check, 
  Copy, 
  RefreshCw, 
  Image as ImageIcon, 
  ShieldCheck, 
  Eye, 
  Building2, 
  Sparkles,
  Info,
  AlertCircle,
  ExternalLink,
  Maximize2,
  X,
  CheckCircle2,
  Grid
} from 'lucide-react';
import { uploadImageToSupabase, deleteImageFromSupabase } from '../lib/db';

interface LogoManagementProps {
  currentLogoUrl?: string;
  companyName?: string;
  onLogoUpdated: (newLogoUrl: string) => Promise<void>;
  onLogoDeleted: () => Promise<void>;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  className?: string;
}

export default function LogoManagement({
  currentLogoUrl = '',
  companyName = 'Apna Khaiyal',
  onLogoUpdated,
  onLogoDeleted,
  showToast,
  className = '',
}: LogoManagementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewBg, setPreviewBg] = useState<'teal' | 'dark' | 'light' | 'grid'>('teal');
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasLogo = Boolean(currentLogoUrl && currentLogoUrl.trim() !== '');

  useEffect(() => {
    setImageError(false);
    setImgDimensions(null);
  }, [currentLogoUrl]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    setImgDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'File size exceeds the 5MB limit. Please select a smaller image.';
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return 'Unsupported file format. Please upload JPG, PNG, WEBP, GIF, or SVG.';
    }

    return null;
  };

  const handleFileUpload = async (file: File) => {
    const errorMsg = validateFile(file);
    if (errorMsg) {
      showToast(errorMsg, 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Delete old logo if it exists
      if (hasLogo) {
        setUploadProgress(20);
        try {
          await deleteImageFromSupabase('team-images', currentLogoUrl);
        } catch (e) {
          console.warn('Note on deleting previous logo:', e);
        }
      }

      setUploadProgress(40);
      // Upload to Supabase Storage
      const uploadedUrl = await uploadImageToSupabase(
        'team-images',
        file,
        'company-logo',
        (prog) => setUploadProgress(40 + Math.round(prog * 0.5))
      );

      setUploadProgress(90);
      // Update site settings in DB
      await onLogoUpdated(uploadedUrl);
      setUploadProgress(100);

      showToast('Company logo updated and saved successfully! The site header now displays your new logo.', 'success');
    } catch (err: any) {
      console.error('Logo upload error:', err);
      showToast(err.message || 'Failed to upload logo. Please try again.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to remove the current company logo? The header will revert to the clean company name.')) {
      return;
    }

    setIsDeleting(true);
    try {
      if (hasLogo) {
        await deleteImageFromSupabase('team-images', currentLogoUrl);
      }
      await onLogoDeleted();
      showToast('Company logo removed successfully.', 'success');
    } catch (err: any) {
      console.error('Logo deletion error:', err);
      showToast(err.message || 'Failed to remove logo.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const copyUrlToClipboard = () => {
    if (!currentLogoUrl) return;
    navigator.clipboard.writeText(currentLogoUrl);
    setCopied(true);
    showToast('Logo URL copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`space-y-6 ${className}`} id="logo-management-container">
      {/* Component Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-neutral-900/80 rounded-2xl border border-neutral-800 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
            <ImageIcon className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Logo Management
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 uppercase">
                Supabase Storage
              </span>
            </h3>
            <p className="text-xs text-neutral-400 font-sans mt-0.5">
              Upload, preview, and verify your official company logo stored in Supabase Storage and displayed across the website.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="inline-flex items-center text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-800/40">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            Direct Storage Sync Active
          </span>
        </div>
      </div>

      {/* -------------------- DEDICATED LOGO PREVIEW BOX -------------------- */}
      <div className="p-6 bg-neutral-900/90 rounded-2xl border border-[#D4AF37]/30 shadow-2xl space-y-5" id="logo-preview-box">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                Currently Uploaded Logo Preview
                {hasLogo && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                    LIVE ASSET
                  </span>
                )}
              </h4>
              <p className="text-xs text-neutral-400">
                Direct visual verification of the image stored in Supabase Storage URL
              </p>
            </div>
          </div>

          {/* Background Canvas Contrast Switcher */}
          <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-[11px] self-start sm:self-auto">
            <span className="text-[10px] font-mono text-neutral-500 px-2 uppercase">Canvas:</span>
            <button
              type="button"
              onClick={() => setPreviewBg('teal')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${previewBg === 'teal' ? 'bg-[#173D46] text-white font-semibold shadow-md' : 'text-neutral-400 hover:text-white'}`}
            >
              Header Teal
            </button>
            <button
              type="button"
              onClick={() => setPreviewBg('grid')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${previewBg === 'grid' ? 'bg-neutral-800 text-amber-300 font-semibold shadow-md' : 'text-neutral-400 hover:text-white'}`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setPreviewBg('dark')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${previewBg === 'dark' ? 'bg-neutral-800 text-white font-semibold shadow-md' : 'text-neutral-400 hover:text-white'}`}
            >
              Dark
            </button>
            <button
              type="button"
              onClick={() => setPreviewBg('light')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${previewBg === 'light' ? 'bg-slate-200 text-slate-900 font-semibold shadow-md' : 'text-neutral-400 hover:text-white'}`}
            >
              Light
            </button>
          </div>
        </div>

        {/* Featured Image Display Frame */}
        <div 
          className={`relative rounded-2xl border border-neutral-800 p-8 min-h-[180px] flex items-center justify-center transition-all duration-300 overflow-hidden ${
            previewBg === 'teal' 
              ? 'bg-[#173D46]' 
              : previewBg === 'dark' 
              ? 'bg-neutral-950' 
              : previewBg === 'light' 
              ? 'bg-slate-100' 
              : 'bg-[#111] bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:12px_12px]'
          }`}
        >
          {hasLogo ? (
            <div className="flex flex-col items-center justify-center space-y-3 max-w-full">
              {!imageError ? (
                <div className="relative group">
                  <img
                    src={currentLogoUrl}
                    alt={`${companyName} Logo`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    referrerPolicy="no-referrer"
                    className="max-h-36 max-w-full object-contain filter drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={() => setIsZoomModalOpen(true)}
                    className="absolute -top-2 -right-2 p-1.5 bg-neutral-900/90 text-neutral-200 hover:text-amber-300 rounded-full border border-neutral-700 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Expand View"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="text-center p-4 space-y-2 text-amber-400">
                  <AlertCircle className="w-8 h-8 mx-auto text-amber-400" />
                  <p className="text-xs font-semibold">Image failed to render from Supabase Storage URL.</p>
                  <p className="text-[11px] font-mono text-neutral-400 break-all max-w-md">{currentLogoUrl}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 px-4 space-y-3 max-w-md">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-neutral-300">No Custom Logo Currently Stored</p>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  The website navigation header is currently displaying the clean fallback brand name <strong className="text-amber-300 font-mono">{companyName}</strong>. Upload a logo file below to store it in Supabase Storage.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Logo Specifications & Metadata Bar */}
        {hasLogo && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-neutral-950/80 rounded-xl border border-neutral-800 text-xs">
            <div className="md:col-span-8 space-y-1">
              <p className="text-[10px] font-mono uppercase text-neutral-500 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Supabase Storage Public URL
              </p>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-2 bg-neutral-900 rounded-lg border border-neutral-800 font-mono text-[11px] text-emerald-300 truncate">
                  {currentLogoUrl}
                </code>
                <button
                  type="button"
                  onClick={copyUrlToClipboard}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg font-semibold transition-colors shrink-0 flex items-center space-x-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
                  <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <a
                  href={currentLogoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors shrink-0"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 md:border-l border-neutral-800 pt-2 md:pt-0 md:pl-4">
              <div className="text-right">
                <p className="text-[10px] font-mono text-neutral-500 uppercase">Resolution</p>
                <p className="text-xs font-mono font-bold text-amber-300">
                  {imgDimensions ? `${imgDimensions.width} × ${imgDimensions.height} px` : 'Detecting...'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-mono text-neutral-500 uppercase">Status</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  200 OK
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* -------------------- UPLOAD & FILE PICKER SECTION -------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: File Dropzone & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 bg-neutral-900/60 rounded-2xl border border-neutral-800 space-y-5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase text-neutral-400 font-semibold tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#D4AF37]" />
                Upload / Replace Logo File
              </label>
              <span className="text-[10px] font-mono text-neutral-500">Max Size: 5MB</span>
            </div>

            {/* Drag & Drop File Picker Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center group ${
                isDragging
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10 scale-[1.01]'
                  : isUploading
                  ? 'border-neutral-700 bg-neutral-950/50 cursor-wait'
                  : 'border-neutral-800 hover:border-[#D4AF37]/60 bg-neutral-950/40 hover:bg-neutral-950/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                className="hidden"
                onChange={handleFileSelect}
                disabled={isUploading}
              />

              {isUploading ? (
                <div className="w-full max-w-xs space-y-3 py-4">
                  <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">Uploading to Supabase Storage...</p>
                    <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden p-0.5">
                      <div
                        className="bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] h-full rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-[10px] font-mono text-neutral-400">{uploadProgress}% complete</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 py-2">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto group-hover:border-[#D4AF37]/40 group-hover:bg-[#D4AF37]/10 transition-colors">
                    <Upload className="w-6 h-6 text-neutral-400 group-hover:text-[#D4AF37] transition-colors" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white">
                      Drag & Drop new logo image file here
                    </p>
                    <p className="text-xs text-neutral-400 font-sans mt-1">
                      or <span className="text-[#D4AF37] underline font-semibold">click to select file</span> from device
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                    {['PNG', 'JPG', 'WEBP', 'SVG'].map((fmt) => (
                      <span key={fmt} className="px-2 py-0.5 rounded-md bg-neutral-800 text-[10px] font-mono text-neutral-400">
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Specs & Guidelines */}
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 text-xs text-neutral-400 space-y-2">
              <div className="flex items-center text-amber-400 font-semibold text-[11px] uppercase font-mono space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Optimal Format Recommendations</span>
              </div>
              <ul className="list-disc list-inside text-[11px] space-y-1 text-neutral-400 font-sans leading-relaxed">
                <li><strong className="text-neutral-300">Transparent PNG or SVG</strong> yields the cleanest presentation over colored headers.</li>
                <li>Recommended aspect ratio: <strong className="text-neutral-300">Horizontal / Wide (16:9 or 3:1)</strong> or <strong className="text-neutral-300">Square</strong>.</li>
                <li>Minimum height: <strong className="text-neutral-300">96px to 200px</strong> for crisp display on high-DPI retina screens.</li>
              </ul>
            </div>

            {/* Action Bar: Delete Button */}
            {hasLogo && (
              <div className="flex items-center justify-end pt-2 border-t border-neutral-800/80">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-900/40 text-xs font-semibold transition-all inline-flex items-center space-x-1.5 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>Remove Custom Logo</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Header Mockup Context (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 bg-neutral-900/60 rounded-2xl border border-neutral-800 space-y-5 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <label className="text-xs font-mono uppercase text-neutral-400 font-semibold tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                Website Header Rendering
              </label>

              <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                Demonstrates how your custom logo integrates with top navigation controls across desktop and mobile screens.
              </p>

              {/* Mock Header Canvas Container */}
              <div className="rounded-2xl overflow-hidden border border-neutral-800 shadow-xl">
                <div className="bg-neutral-950 px-4 py-2 border-b border-neutral-800 flex items-center justify-between">
                  <div className="flex space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500">{companyName} Header Bar</span>
                </div>

                <div className="p-6 bg-[#173D46] transition-colors duration-300 flex items-center justify-between">
                  {/* Brand Logo in Mock Header */}
                  <div className="flex items-center space-x-3 max-w-[220px]">
                    {hasLogo ? (
                      <img
                        src={currentLogoUrl}
                        alt="Header Logo Preview"
                        referrerPolicy="no-referrer"
                        className="h-12 w-auto max-w-full object-contain filter drop-shadow-md transition-all"
                      />
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-xl font-bold tracking-wide leading-none text-[#E7C66A]">
                          {companyName}
                        </span>
                        <span className="text-[10px] font-semibold tracking-widest text-[#22c55e] uppercase mt-1">
                          Anytime Anywhere
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Mock Nav Menu Items */}
                  <div className="hidden sm:flex items-center space-x-3 text-xs font-medium text-neutral-200">
                    <span>Home</span>
                    <span>Services</span>
                    <span className="px-3 py-1.5 rounded-xl bg-[#D4AF37] text-black font-bold text-[11px]">
                      Admin
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Status Footer Info */}
            <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex items-center space-x-3">
              <Info className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <div className="text-[11px] text-neutral-400 font-sans leading-snug">
                {hasLogo ? (
                  <span>
                    Active custom logo loaded directly from <strong className="text-emerald-400 font-mono">Supabase Storage</strong>.
                  </span>
                ) : (
                  <span>
                    No custom logo uploaded. Header is displaying the clean <strong className="text-amber-300 font-mono">text brand fallback</strong>.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Expand Zoom Modal */}
      {isZoomModalOpen && currentLogoUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Full-Size Logo Inspection</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomModalOpen(false)}
                className="p-2 text-neutral-400 hover:text-white rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-8 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-center min-h-[300px]">
              <img
                src={currentLogoUrl}
                alt="Full Size Logo"
                referrerPolicy="no-referrer"
                className="max-h-[60vh] max-w-full object-contain filter drop-shadow-2xl"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={copyUrlToClipboard}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied URL!' : 'Copy Storage URL'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsZoomModalOpen(false)}
                className="px-5 py-2 bg-[#D4AF37] hover:bg-[#c29f2f] text-neutral-950 font-bold rounded-xl text-xs transition-colors"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

