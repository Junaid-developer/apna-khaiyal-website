// Production-level Security & Password Authentication Module for ApnaKhaiyal

export interface AdminAuthState {
  passwordHash: string;
  salt: string;
  lastPasswordChanged: string | null; // ISO string timestamp
  mustChangePassword: boolean;        // Force password change on first login
  failedAttempts: number;            // Counter for failed login attempts
  lockoutUntil: number | null;       // Timestamp when lockout expires
  sessionVersion: number;            // Session invalidation counter
  adminEmail: string;                // Corporate email for password recovery
}

const AUTH_STORAGE_KEY = 'apnakhaiyal_admin_auth';
const OLD_AUTH_STORAGE_KEY = 'apnakhiyal_admin_auth';
const CURRENT_SESSION_KEY = 'apnakhaiyal_admin_session';
const OLD_CURRENT_SESSION_KEY = 'apnakhiyal_admin_session';

// Helper to generate a random salt
function generateSalt(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

// SHA-256 Hash algorithm using standard Web Crypto API
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt + 'apnakhaiyal_sec_pepper_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Initialize or load the stored admin auth state
export async function getAdminAuthState(): Promise<AdminAuthState> {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(OLD_AUTH_STORAGE_KEY);
  if (stored) {
    try {
      const parsed: AdminAuthState = JSON.parse(stored);
      return parsed;
    } catch {
      // Fallback if JSON corrupted
    }
  }

  // First Installation Initialization
  const salt = generateSalt();
  const defaultHash = await hashPassword('', salt);

  const defaultState: AdminAuthState = {
    passwordHash: defaultHash,
    salt,
    lastPasswordChanged: null,
    mustChangePassword: false,
    failedAttempts: 0,
    lockoutUntil: null,
    sessionVersion: 1,
    adminEmail: '',
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultState));
  return defaultState;
}

export function saveAdminAuthState(state: AdminAuthState): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}

// Password Validation & Complexity Rules Check
export interface PasswordValidationResult {
  isValid: boolean;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  hasNoForbiddenWords: boolean;
  isMatchesConfirm?: boolean;
  errors: string[];
  passedCount: number;
  totalCount: number;
  score: number;
}

const FORBIDDEN_WORDS = [
  'password',
  'admin',
  '123456',
  '12345678',
  'qwerty',
  'apnakhaiyal',
  'apnakhiyal',
  'administrator',
  'root',
  'welcome',
  'pass123'
];

export function validatePasswordRules(
  password: string,
  confirmPassword?: string,
  userEmailOrName?: string
): PasswordValidationResult {
  const cleanPass = password || '';
  const hasMinLength = cleanPass.length >= 8;
  const hasUppercase = /[A-Z]/.test(cleanPass);
  const hasLowercase = /[a-z]/.test(cleanPass);
  const hasNumber = /[0-9]/.test(cleanPass);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(cleanPass);

  // Check forbidden dictionary terms and user-specific words
  const lowerPass = cleanPass.toLowerCase();
  let hasForbidden = false;
  for (const word of FORBIDDEN_WORDS) {
    if (lowerPass === word || (cleanPass.length < 12 && lowerPass.includes(word))) {
      hasForbidden = true;
      break;
    }
  }

  if (userEmailOrName) {
    const cleanUser = userEmailOrName.split('@')[0].toLowerCase().trim();
    if (cleanUser.length >= 3 && lowerPass.includes(cleanUser)) {
      hasForbidden = true;
    }
  }

  const hasNoForbiddenWords = !hasForbidden;

  const isMatchesConfirm =
    confirmPassword !== undefined
      ? cleanPass.length > 0 && cleanPass === confirmPassword
      : undefined;

  const errors: string[] = [];
  if (!hasMinLength) errors.push('At least 8 characters long');
  if (!hasUppercase) errors.push('At least one uppercase letter (A-Z)');
  if (!hasLowercase) errors.push('At least one lowercase letter (a-z)');
  if (!hasNumber) errors.push('At least one number (0-9)');
  if (!hasSpecialChar) errors.push('At least one special character (!@#$%^&*()_+-=)');
  if (!hasNoForbiddenWords) errors.push('Must not contain common words, usernames, or predictable phrases');
  if (confirmPassword !== undefined && !isMatchesConfirm) {
    errors.push('Password and confirmation must match exactly');
  }

  let passedCount = 0;
  if (hasMinLength) passedCount++;
  if (hasUppercase) passedCount++;
  if (hasLowercase) passedCount++;
  if (hasNumber) passedCount++;
  if (hasSpecialChar) passedCount++;
  if (hasNoForbiddenWords) passedCount++;

  const totalCount = 6;
  const score = Math.round((passedCount / totalCount) * 100);

  const isValid =
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialChar &&
    hasNoForbiddenWords &&
    (confirmPassword === undefined || isMatchesConfirm === true);

  return {
    isValid,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    hasNoForbiddenWords,
    isMatchesConfirm,
    errors,
    passedCount,
    totalCount,
    score,
  };
}

// Generate a cryptographically secure, complex password that instantly satisfies all security requirements
export function generateSecurePassword(length = 16): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%^&*()_+-=~';
  const allChars = uppercase + lowercase + numbers + symbols;

  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);

  // Ensure at least one from each required class
  let pass = '';
  pass += uppercase[array[0] % uppercase.length];
  pass += lowercase[array[1] % lowercase.length];
  pass += numbers[array[2] % numbers.length];
  pass += symbols[array[3] % symbols.length];

  for (let i = 4; i < length; i++) {
    pass += allChars[array[i] % allChars.length];
  }

  // Shuffle the characters randomly
  return pass
    .split('')
    .sort(() => (window.crypto.getRandomValues(new Uint8Array(1))[0] % 2 === 0 ? 1 : -1))
    .join('');
}

// Strength meter rating (0 to 100)
export interface PasswordStrength {
  score: number; // 0 to 100
  label: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  color: string; // Tailwind color class
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: 'Very Weak', color: 'bg-red-500' };
  }

  let score = 0;
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 15;
  if (/[a-z]/.test(password)) score += 12.5;
  if (/[A-Z]/.test(password)) score += 12.5;
  if (/[0-9]/.test(password)) score += 12.5;
  if (/[^A-Za-z0-9]/.test(password)) score += 12.5;

  if (score <= 30) {
    return { score, label: 'Weak', color: 'bg-red-500' };
  } else if (score <= 60) {
    return { score, label: 'Medium', color: 'bg-amber-500' };
  } else if (score <= 80) {
    return { score, label: 'Strong', color: 'bg-[#e1b382]' };
  } else {
    return { score: 100, label: 'Very Strong', color: 'bg-emerald-500' };
  }
}

// Verify active session version
export function getActiveSessionVersion(): number {
  const val = sessionStorage.getItem(CURRENT_SESSION_KEY) || sessionStorage.getItem(OLD_CURRENT_SESSION_KEY);
  return val ? parseInt(val, 10) : 0;
}

export function setActiveSessionVersion(version: number): void {
  sessionStorage.setItem(CURRENT_SESSION_KEY, version.toString());
}

export function clearActiveSession(): void {
  sessionStorage.removeItem(CURRENT_SESSION_KEY);
  sessionStorage.removeItem(OLD_CURRENT_SESSION_KEY);
  sessionStorage.removeItem('isAdminLoggedIn');
}
