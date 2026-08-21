export type UserRoleType = 'Admin' | 'Super Admin' | 'HR' | 'Support' | 'Editor' | 'None';

export interface RolePermissions {
  role: UserRoleType;
  allowedModules: string[];
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  isFullAdmin: boolean;
}

export function normalizeUserRole(rawRole?: string | null): UserRoleType {
  if (!rawRole) return 'Admin';
  const cleaned = String(rawRole).trim().toLowerCase();
  
  if (cleaned.includes('super') || cleaned === 'admin' || cleaned === 'administrator' || cleaned === 'owner') {
    return 'Admin';
  }
  if (cleaned === 'hr' || cleaned.includes('human resource') || cleaned === 'recruiter') {
    return 'HR';
  }
  if (cleaned === 'support' || cleaned === 'helpdesk') {
    return 'Support';
  }
  if (cleaned === 'editor' || cleaned === 'content') {
    return 'Editor';
  }
  return 'None';
}

export function getRolePermissions(rawRole?: string | null): RolePermissions {
  const normalized = normalizeUserRole(rawRole);

  if (normalized === 'Admin') {
    return {
      role: 'Admin',
      allowedModules: [
        'dashboard',
        'products',
        'services',
        'hero-slider',
        'hero-about',
        'process',
        'industries',
        'techstack',
        'gallery',
        'team',
        'reviews',
        'careers',
        'job-applications',
        'messages',
        'seo',
        'security',
        'branding',
        'company-contact',
        'footer-settings',
        'users-management',
        'history'
      ],
      canRead: true,
      canWrite: true,
      canDelete: true,
      isFullAdmin: true
    };
  }

  if (normalized === 'HR') {
    return {
      role: 'HR',
      allowedModules: [
        'dashboard',
        'careers',
        'job-applications',
        'messages',
        'team'
      ],
      canRead: true,
      canWrite: true,
      canDelete: false,
      isFullAdmin: false
    };
  }

  // Any other role = denied / read-only inquiry access
  return {
    role: normalized,
    allowedModules: ['dashboard'],
    canRead: false,
    canWrite: false,
    canDelete: false,
    isFullAdmin: false
  };
}

export function checkUserRoleAccess(
  rawRole: string | undefined | null,
  moduleName: string,
  action: 'read' | 'write' | 'delete' = 'read'
): boolean {
  const perms = getRolePermissions(rawRole);
  
  if (perms.role === 'Admin') return true;
  
  const isModuleAllowed = perms.allowedModules.includes(moduleName);
  
  if (!isModuleAllowed) return false;
  
  if (action === 'read') return perms.canRead;
  if (action === 'write') return perms.canWrite;
  if (action === 'delete') return perms.canDelete;

  return false;
}
