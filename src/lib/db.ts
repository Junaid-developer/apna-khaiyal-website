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

const normalizeCareer = (job: any, index: number): CareerOpportunity => ({
  id: typeof job?.id === 'string' && job.id.trim() ? job.id : crypto.randomUUID(),
  title: job?.title || '',
  type: job?.type || 'job',
  department: job?.department || 'General',
  location: job?.location || '',
  description: job?.description || '',
  requirements: Array.isArray(job?.requirements) ? job.requirements : [],
  responsibilities: Array.isArray(job?.responsibilities) ? job.responsibilities : [],
  benefits: Array.isArray(job?.benefits) ? job.benefits : [],
  experience: job?.experience || '',
  active: job?.active ?? job?.is_active ?? job?.isActive ?? true,
  displayOrder: Number.isFinite(job?.displayOrder) ? job.displayOrder : Number.isFinite(job?.display_order) ? job.display_order : index,
});

const persistCareerList = async (items: CareerOpportunity[]) => {
  const careers = (Array.isArray(items) ? items : []).map((job: any, index: number) => normalizeCareer(job, index));
  localStorage.setItem(CAREERS_CACHE_KEY, JSON.stringify(careers));
  if (!legacy.supabase || !legacy.isSupabaseConfigured) return careers;
  const payload = { key: 'careers', value: careers, updated_at: new Date().toISOString() };
  try {
    const { error } = await legacy.supabase.from('site_settings').upsert(payload, { onConflict: 'key' });
    if (error) throw error;
    const { data, error: verifyError } = await legacy.supabase.from('site_settings').select('value').eq('key', 'careers').maybeSingle();
    if (verifyError) throw verifyError;
    if (!data || !Array.isArray((data as any).value)) throw new Error('Careers save verification failed: saved record was not returned.');
    const verified = (data as any).value.map((job: any, index: number) => normalizeCareer(job, index));
    localStorage.setItem(CAREERS_CACHE_KEY, JSON.stringify(verified));
    return verified;
  } catch (error) {
    console.error('[Careers] Durable persistence failed:', error);
    throw error;
  }
};

const persistApplication = async (item: JobApplication) => {
  const application: any = item || {};
  const databaseId = crypto.randomUUID();
  const row = {
    id: databaseId,
    job_id: application.jobId || null,
    job_title: application.jobTitle || 'General Application',
    applicant_name: application.fullName || application.applicantName || '',
    email: application.email || application.applicantEmail || '',
    phone: application.phone || '',
    experience: application.experience || '',
    cover_note: application.coverLetter || application.cover_note || '',
    resume_url: typeof application.resumeUrl === 'string' && application.resumeUrl.startsWith('data:') ? '' : application.resumeUrl || application.resume_url || '',
    status: application.status || 'New',
    created_at: application.appliedAt || new Date().toISOString(),
  };

  if (!row.applicant_name || !row.email) throw new Error('Applicant name and email are required.');
  if (!legacy.supabase || !legacy.isSupabaseConfigured) {
    throw new Error('Supabase is not configured in the deployed website.');
  }

  // Use the exact same Supabase client that the rest of the app uses.
  // This avoids a second client being created from a different/stale set of Vercel env vars.
  const { error } = await legacy.supabase.from('job_applications').insert(row);
  if (error) {
    console.error('[Applications] Supabase insert failed:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }

  const cachedApplication: JobApplication = { ...(application as JobApplication), id: databaseId, resumeUrl: '' };
  const cached = readLocalList<JobApplication>(APPLICATIONS_CACHE_KEY);
  const merged = [cachedApplication, ...cached.filter(existing => existing.id !== databaseId)];
  try {
    localStorage.setItem(APPLICATIONS_CACHE_KEY, JSON.stringify(merged));
  } catch (cacheError) {
    console.warn('[Applications] Local cache could not be updated; Supabase record is already saved:', cacheError);
  }
  return cachedApplication;
};

const readCareerSettings = async () => {
  if (!legacy.supabase || !legacy.isSupabaseConfigured) return null;
  try {
    const { data, error } = await legacy.supabase.from('site_settings').select('value').eq('key', 'careers').maybeSingle();
    if (error) return null;
    return data && Array.isArray((data as any).value) ? (data as any).value : null;
  } catch { return null; }
};

const wrappedSyncAllFromSupabase = async () => {
  const cachedApplicationsBeforeSync = readLocalList<JobApplication>(APPLICATIONS_CACHE_KEY);
  const data = await legacy.syncAllFromSupabase();
  if (!data) return data;
  if (legacy.supabase && legacy.isSupabaseConfigured) {
    const savedCareers = await readCareerSettings();
    if (savedCareers) {
      data.careers = savedCareers.map((item: any, index: number) => normalizeCareer(item, index));
      localStorage.setItem(CAREERS_CACHE_KEY, JSON.stringify(data.careers));
    }
    try {
      const { data: applicationRows, error: applicationError } = await legacy.supabase.from('job_applications').select('*').order('created_at', { ascending: false });
      if (applicationError) throw applicationError;
      const remoteApplications = (applicationRows || []).map((item: any) => ({
        id: item.id || '', jobId: item.job_id || '', jobTitle: item.job_title || 'General Application', fullName: item.applicant_name || '', email: item.email || '', phone: item.phone || '', experience: item.experience || '', coverLetter: item.cover_note || '', resumeUrl: item.resume_url || '', status: item.status || 'New', appliedAt: item.created_at || '',
      })).filter((item: JobApplication) => item.id);
      const remoteIds = new Set(remoteApplications.map((item: JobApplication) => item.id));
      const pendingLocalApplications = cachedApplicationsBeforeSync.filter(item => item.id && !remoteIds.has(item.id));
      data.applications = [...pendingLocalApplications, ...remoteApplications];
      try { localStorage.setItem(APPLICATIONS_CACHE_KEY, JSON.stringify(data.applications)); } catch {}
    } catch (error) {
      console.error('[Applications] Direct Supabase sync failed:', error);
      if (cachedApplicationsBeforeSync.length > 0) data.applications = cachedApplicationsBeforeSync;
    }
  } else if (cachedApplicationsBeforeSync.length > 0) data.applications = cachedApplicationsBeforeSync;
  return data;
};

export const syncAllFromSupabase = wrappedSyncAllFromSupabase;

export const dbStore = {
  ...legacy.dbStore,
  getCareers: () => legacy.isSupabaseConfigured ? readLocalList<CareerOpportunity>(CAREERS_CACHE_KEY) : legacy.dbStore.getCareers(),
  getApplications: () => legacy.isSupabaseConfigured ? readLocalList<JobApplication>(APPLICATIONS_CACHE_KEY) : legacy.dbStore.getApplications(),
  saveCareers: persistCareerList,
  saveApplications: async (items: JobApplication[]) => {
    const list = Array.isArray(items) ? items : [];
    if (!list.length) return [];
    await persistApplication(list[list.length - 1]);
    return list;
  },
};