import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchDashboardAnalyticsData, 
  fetchAdminUsers, 
  fetchContentAuditLogs, 
  fetchCompanyInformation, 
  fetchCompanyContact,
  syncAllFromSupabase,
  DashboardAnalyticsData 
} from './db';
import { getRolePermissions, UserRoleType } from './rbac';

// Query Keys
export const ADMIN_QUERY_KEYS = {
  dashboardAnalytics: (role: string) => ['dashboardAnalytics', role] as const,
  roleFilteredCmsData: (role: string) => ['roleFilteredCmsData', role] as const,
  adminUsers: ['adminUsers'] as const,
  auditLogs: (limit: number) => ['auditLogs', limit] as const,
  companyInfo: ['companyInfo'] as const,
  companyContact: ['companyContact'] as const,
  diagnostics: ['rbacDiagnostics'] as const,
};

/**
 * Hook to perform centralized role checks for the active user session.
 */
export function useRoleCheck(userRole: string = 'Admin') {
  const perms = getRolePermissions(userRole);
  return {
    role: perms.role,
    isHR: perms.role === 'HR',
    isFullAdmin: perms.isFullAdmin,
    allowedModules: perms.allowedModules,
    canRead: perms.canRead,
    canWrite: perms.canWrite,
    canDelete: perms.canDelete,
    isModuleAllowed: (moduleName: string) => perms.allowedModules.includes(moduleName.toLowerCase().trim()),
  };
}

/**
 * Data fetching hook with a centralized role check.
 * If the logged-in user is 'HR', API queries filter out restricted tables (products, services, gallery, reviews, hero_slides)
 * automatically, displaying a consistent 'Permission Restricted' UI notification state without blank screens or 403 errors.
 */
export function useRoleFilteredDataQuery(userRole: string = 'Admin', enabled: boolean = true) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.roleFilteredCmsData(userRole),
    queryFn: async () => {
      try {
        const data = await syncAllFromSupabase(userRole);
        const rolePerms = getRolePermissions(userRole);
        const hasRestrictedError = data?.hasRestrictedTables || Boolean(data?.isRestricted) || rolePerms.role === 'HR';
        return {
          ...(data || {}),
          userRole: rolePerms.role,
          isHR: rolePerms.role === 'HR',
          isFullAdmin: rolePerms.isFullAdmin,
          isRestricted: hasRestrictedError,
          permissionNotice: data?.permissionNotice || (hasRestrictedError ? "Permission Restricted: Please contact your administrator" : null),
          permissionRestrictedTables: data?.permissionRestrictedTables || (rolePerms.role === 'HR' ? ['products', 'services', 'gallery', 'reviews', 'hero_slides'] : [])
        };
      } catch (err: any) {
        console.error('[useRoleFilteredDataQuery Exception]:', err);
        return {
          isRestricted: true,
          permissionNotice: 'Permission Restricted: Please contact your administrator',
          permissionRestrictedTables: ['all'],
          userRole
        };
      }
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch and cache Dashboard Analytics metrics with automatic role-aware caching
 */
export function useDashboardAnalyticsQuery(userRole: string = 'Admin', enabled: boolean = true) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.dashboardAnalytics(userRole),
    queryFn: async (): Promise<(DashboardAnalyticsData & { isRestricted?: boolean }) | null> => {
      try {
        const data = await fetchDashboardAnalyticsData(userRole);
        return data;
      } catch (err: any) {
        console.error('[useDashboardAnalyticsQuery Exception]:', err);
        return {
          isRestricted: true,
          totalProducts: 0,
          totalServices: 0,
          totalHeroSlides: 0,
          totalGalleryImages: 0,
          totalTeamMembers: 0,
          totalCareers: 0,
          totalJobApplications: 0,
          totalContactMessages: 0,
          totalReviews: 0,
          pendingReviews: 0,
          approvedReviews: 0,
          totalAdminUsers: 1,
          unreadMessagesCount: 0,
          openJobApplicationsCount: 0,
          rawProducts: [],
          rawServices: [],
          rawHeroSlides: [],
          rawGallery: [],
          rawTeam: [],
          rawCareers: [],
          rawJobApplications: [],
          rawContactMessages: [],
          rawReviews: [],
          rawAdmins: [],
          permissionRestrictedTables: ['all'],
          userRole
        };
      }
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch and cache Admin Users list
 */
export function useAdminUsersQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.adminUsers,
    queryFn: async () => {
      try {
        const admins = await fetchAdminUsers();
        return admins || [];
      } catch (err: any) {
        console.error('[useAdminUsersQuery Exception]:', err);
        return [];
      }
    },
    enabled,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

/**
 * Hook to fetch and cache Audit Logs
 */
export function useContentAuditLogsQuery(limit: number = 30, enabled: boolean = true) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.auditLogs(limit),
    queryFn: async () => {
      try {
        const logs = await fetchContentAuditLogs(limit);
        return logs || [];
      } catch (err: any) {
        console.error('[useContentAuditLogsQuery Exception]:', err);
        return [];
      }
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch and cache Company Information
 */
export function useCompanyInfoQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.companyInfo,
    queryFn: async () => {
      try {
        const info = await fetchCompanyInformation();
        return info;
      } catch (err: any) {
        console.error('[useCompanyInfoQuery Exception]:', err);
        return null;
      }
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch and cache Company Contact details
 */
export function useCompanyContactQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.companyContact,
    queryFn: async () => {
      try {
        const contact = await fetchCompanyContact();
        return contact;
      } catch (err: any) {
        console.error('[useCompanyContactQuery Exception]:', err);
        return null;
      }
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Custom hook providing cache invalidation helpers after mutations (inserts/updates/deletes)
 */
export function useAdminCacheInvalidator() {
  const queryClient = useQueryClient();

  return {
    invalidateDashboard: (role?: string) => {
      if (role) {
        queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.dashboardAnalytics(role) });
      } else {
        queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
      }
    },
    invalidateAdminUsers: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.adminUsers });
    },
    invalidateAuditLogs: () => {
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
    invalidateCompanyInfo: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.companyInfo });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.companyContact });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries();
    }
  };
}
