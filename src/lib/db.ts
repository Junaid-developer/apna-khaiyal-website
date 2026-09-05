import * as legacy from './db_legacy';
import type { CareerOpportunity, JobApplication } from '../types';

export * from './db_legacy';

const CAREERS_CACHE_KEY = 'apnakhaiyal_careers';
const APPLICATIONS_CACHE_KEY = 'apnakhaiyal_applications';

const readLocalList = <T>(key: string): T[] => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

// SIMPLE CAREERS STORAGE:
// Keep Careers in the existing website_settings table only. This avoids the
// dedicated careers table/RLS/auth complexity that was causing refresh loss.
const persistCareerList = async (items: CareerOpportunity[]) => {
  const careers = (Array.isArray(items) ? items : []).map((job: any, index: number) => ({
    ...job,
    id: job?.id || `career_${Date.now()}_${index}`,
  }));

  localStorage.setItem(CAREERS_CACHE_KEY, JSON.stringify(careers));

  if (!legacy.supabase || !legacy.isSupabaseConfigured) return careers;

  const { error } = await legacy.supabase
    .from('website_settings')
    .upsert({ key: 'careers', value: careers, updated_at: new Date().toISOString() }, { onConflict: 'key' });

  if (error) {
    console.error('[Careers] Save failed:', error);
    throw error;
  }

  return careers;
};

const persistApplicationList = async (items: JobApplication[]) => {
  const applications = Array.isArray(items) ? items : [];
  const previousApplications = readLocalList<JobApplication>(APPLICATIONS_CACHE_KEY);
  localStorage.setItem(APPLICATIONS_CACHE_KEY, JSON.stringify(applications));

  if (!legacy.supabase || !legacy.isSupabaseConfigured) return applications;

  const rows = applications.map((item: any) => ({
    id: item.id,
    job_id: item.jobId || null,
    job_title: item.jobTitle || 'General Application',
    applicant_name: item.fullName || '',
    email: item.email || '',
    phone: item.phone || '',
    cover_note: item.coverLetter || '',
    resume_url: item.resumeUrl || '',
    status: item.status || 'New',
    created_at: item.appliedAt || new Date().toISOString()
  })).filter((row: any) => row.id && row.applicant_name && row.email);

  const incomingIds = new Set(rows.map((row: any) => row.id));
  const removedIds = previousApplications.map((item: any) => item?.id).filter((id): id is string => !!id && !incomingIds.has(id));

  try {
    if (removedIds.length) {
      const { error } = await legacy.supabase.from('job_applications').delete().in('id', removedIds);
      if (error) throw error;
    }
    if (rows.length) {
      const { error } = await legacy.supabase.from('job_applications').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
    }
    return applications;
  } catch (error) {
    console.error('[Applications] Supabase persistence failed:', error);
    throw error;
  }
};

const wrappedSyncAllFromSupabase = async () => {
  const data = await legacy.syncAllFromSupabase();
  if (!data) return data;

  if (legacy.supabase && legacy.isSupabaseConfigured) {
    try {
      // Careers are read from the same simple website_settings record used by saveCareers.
      const { data: careerSetting, error } = await legacy.supabase
        .from('website_settings')
        .select('value')
        .eq('key', 'careers')
        .maybeSingle();
      if (error) throw error;

      if (careerSetting && Array.isArray((careerSetting as any).value)) {
        data.careers = (careerSetting as any).value.map((item: any, index: number) => ({
          id: item?.id || `career_${index}`,
          title: item?.title || '',
          type: item?.type || 'job',
          department: item?.department || 'General',
          location: item?.location || '',
          description: item?.description || '',
          requirements: Array.isArray(item?.requirements) ? item.requirements : [],
          responsibilities: Array.isArray(item?.responsibilities) ? item.responsibilities : [],
          benefits: Array.isArray(item?.benefits) ? item.benefits : [],
          experience: item?.experience || '',
          active: item?.active ?? item?.is_active ?? item?.isActive ?? true,
          displayOrder: item?.displayOrder ?? item?.display_order ?? index
        }));
        localStorage.setItem(CAREERS_CACHE_KEY, JSON.stringify(data.careers));
      }
    } catch (error) {
      console.error('[Careers] Website settings sync failed:', error);
    }

    try {
      const { data: applicationRows, error: applicationError } = await legacy.supabase.from('job_applications').select('*').order('created_at', { ascending: false });
      if (applicationError) throw applicationError;
      data.applications = (applicationRows || []).map((item: any) => ({
        id: item.id || '', jobId: item.job_id || item.jobId || '', jobTitle: item.job_title || item.jobTitle || 'General Application',
        fullName: item.applicant_name || item.fullName || '', email: item.email || '', phone: item.phone || '',
        coverLetter: item.cover_note || item.coverLetter || '', resumeUrl: item.resume_url || item.resumeUrl || '', status: item.status || 'New',
        appliedAt: item.created_at || item.appliedAt || ''
      })).filter((item: JobApplication) => item.id);
      localStorage.setItem(APPLICATIONS_CACHE_KEY, JSON.stringify(data.applications));
    } catch (error) {
      console.error('[Applications] Direct Supabase sync failed:', error);
    }
  }

  return data;
};

export const syncAllFromSupabase = wrappedSyncAllFromSupabase;

export const dbStore = {
  ...legacy.dbStore,
  getCareers: () => legacy.isSupabaseConfigured ? [] : legacy.dbStore.getCareers(),
  getApplications: () => legacy.isSupabaseConfigured ? [] : legacy.dbStore.getApplications(),
  saveCareers: persistCareerList,
  saveApplications: persistApplicationList,
};
