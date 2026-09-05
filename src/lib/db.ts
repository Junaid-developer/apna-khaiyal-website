import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getRolePermissions, checkUserRoleAccess } from './rbac';
import {
  formatWhatsAppNumber,
  getCEOWhatsAppNumber,
  getCEOWhatsAppUrl,
  getWhatsAppLink
} from './utils';
export { formatWhatsAppNumber, getCEOWhatsAppNumber, getCEOWhatsAppUrl, getWhatsAppLink };

// Career persistence fix: the existing saveCareers implementation merged the incoming
// client list with old database records. That made deleted jobs come back after refresh.
// Keep this helper close to the persistence layer so the Admin Panel can save the exact
// current list, including deletions.

// NOTE: This patch is intentionally limited to the career persistence function below.
