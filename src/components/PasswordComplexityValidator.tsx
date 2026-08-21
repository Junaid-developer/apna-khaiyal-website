import React, { useState } from 'react';
import { 
  Check, 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  Copy, 
  Info,
  Lock,
  Unlock
} from 'lucide-react';
import { 
  validatePasswordRules, 
  calculatePasswordStrength, 
  generateSecurePassword,
  PasswordValidationResult 
} from '../lib/authSecurity';

interface PasswordComplexityValidatorProps {
  password: string;
  confirmPassword?: string;
  userEmailOrName?: string;
  onApplyGeneratedPassword?: (generated: string) => void;
  showGenerator?: boolean;
  compact?: boolean;
  title?: string;
  subtitle?: string;
  showActivationGateBadge?: boolean;
}

export const PasswordComplexityValidator: React.FC<PasswordComplexityValidatorProps> = ({
  password,
  confirmPassword,
  userEmailOrName,
  onApplyGeneratedPassword,
  showGenerator = true,
  compact = false,
  title = 'Password Complexity Policy',
  subtitle = 'New administrator accounts must satisfy all complexity criteria before activation.',
  showActivationGateBadge = true,
}) => {
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [lastGenerated, setLastGenerated] = useState<string>('');

  const rules: PasswordValidationResult = validatePasswordRules(
    password,
    confirmPassword,
    userEmailOrName
  );
  const strength = calculatePasswordStrength(password);

  const handleGenerate = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const newPass = generateSecurePassword(16);
    setLastGenerated(newPass);
    if (onApplyGeneratedPassword) {
      onApplyGeneratedPassword(newPass);
    }
    // Copy to clipboard
    try {
      navigator.clipboard.writeText(newPass);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    } catch {
      // Clipboard fallback
    }
  };

  const checklistItems = [
    {
      id: 'min-length',
      label: 'Minimum 8 characters (12+ recommended)',
      passed: rules.hasMinLength,
    },
    {
      id: 'uppercase',
      label: 'At least one uppercase letter (A-Z)',
      passed: rules.hasUppercase,
    },
    {
      id: 'lowercase',
      label: 'At least one lowercase letter (a-z)',
      passed: rules.hasLowercase,
    },
    {
      id: 'number',
      label: 'At least one number (0-9)',
      passed: rules.hasNumber,
    },
    {
      id: 'special',
      label: 'At least one special character (!@#$%^&*)',
      passed: rules.hasSpecialChar,
    },
    {
      id: 'no-common',
      label: 'No predictable words or username substrings',
      passed: rules.hasNoForbiddenWords,
    },
  ];

  if (confirmPassword !== undefined) {
    checklistItems.push({
      id: 'match',
      label: 'Password and confirmation match exactly',
      passed: !!rules.isMatchesConfirm,
    });
  }

  const allPassed = rules.isValid;

  return (
    <div className={`rounded-2xl border transition-all duration-300 ${
      allPassed 
        ? 'bg-[#12343b]/95 border-emerald-500/50 shadow-emerald-950/20' 
        : 'bg-[#12343b]/95 border-[#3f6973] shadow-lg'
    } p-4 sm:p-5 space-y-4`} id="password-complexity-validator-card">
      
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#3f6973]/70 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
            allPassed 
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
              : 'bg-[#2d545e] border-[#3f6973] text-[#e1b382]'
          }`}>
            {allPassed ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
              {title}
            </h4>
            {!compact && (
              <p className="text-[11px] text-[#CBD5E1] font-sans mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {showGenerator && onApplyGeneratedPassword && (
          <button
            type="button"
            onClick={handleGenerate}
            className="px-3 py-1.5 rounded-xl bg-[#2d545e] hover:bg-[#3f6973] border border-[#e1b382]/40 text-[#e1b382] hover:text-white text-[11px] font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center justify-center space-x-1.5 shrink-0 self-start sm:self-auto shadow-sm"
            title="Generate a cryptographically secure 16-character password"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#e1b382]" />
            <span>Generate Strong Password</span>
          </button>
        )}
      </div>

      {/* Copied Notification Toastlet */}
      {copiedNotification && (
        <div className="p-2.5 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-[11px] text-emerald-200 flex items-center justify-between animate-fadeIn">
          <span className="flex items-center space-x-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Generated password copied to clipboard and applied!</span>
          </span>
          <span className="font-mono text-[10px] text-emerald-400 font-bold">100% Secure</span>
        </div>
      )}

      {/* Live Strength Meter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#CBD5E1] text-[11px]">Complexity Rating:</span>
          <div className="flex items-center space-x-2">
            <span className={`font-bold text-[11px] ${
              strength.score >= 80 ? 'text-emerald-400' : strength.score >= 50 ? 'text-[#e1b382]' : 'text-rose-400'
            }`}>
              {password.length === 0 ? 'Empty' : strength.label} ({password ? strength.score : 0}%)
            </span>
            <span className="text-[10px] text-[#CBD5E1]">
              ({rules.passedCount}/{rules.totalCount} rules met)
            </span>
          </div>
        </div>

        {/* Visual Multi-Segment Bar */}
        <div className="grid grid-cols-4 gap-1.5 h-2">
          <div className={`rounded-full transition-all duration-300 ${
            strength.score >= 25 ? (strength.score < 50 ? 'bg-red-500' : strength.score < 80 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-[#2d545e]'
          }`} />
          <div className={`rounded-full transition-all duration-300 ${
            strength.score >= 50 ? (strength.score < 80 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-[#2d545e]'
          }`} />
          <div className={`rounded-full transition-all duration-300 ${
            strength.score >= 75 ? 'bg-emerald-500' : 'bg-[#2d545e]'
          }`} />
          <div className={`rounded-full transition-all duration-300 ${
            strength.score >= 95 ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50' : 'bg-[#2d545e]'
          }`} />
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        {checklistItems.map((item) => (
          <div
            key={item.id}
            className={`flex items-center space-x-2 p-2 rounded-xl border text-[11px] font-mono transition-all duration-200 ${
              item.passed
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-[#2d545e]/40 border-[#3f6973]/50 text-neutral-400'
            }`}
          >
            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
              item.passed ? 'bg-emerald-500 text-[#12343b]' : 'bg-neutral-800 text-neutral-500'
            }`}>
              {item.passed ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-3 h-3 stroke-[2]" />}
            </div>
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Account Activation Gate Badge */}
      {showActivationGateBadge && (
        <div className={`pt-2 border-t border-[#3f6973]/60 flex items-center justify-between text-xs`}>
          <div className="flex items-center space-x-2">
            {allPassed ? (
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-rose-400" />
            )}
            <span className="font-mono text-[11px] text-[#CBD5E1]">
              Activation Security Gate:
            </span>
          </div>

          <div>
            {allPassed ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Unlock className="w-3 h-3 text-emerald-400" />
                <span>Verified • Ready to Activate</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                <Lock className="w-3 h-3 text-rose-400" />
                <span>Policy Incomplete • Activation Blocked</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
