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
  displayOrder: Number.isFinite(job?.displayOrder)
    ? job.displayOrder
    : (Number.isFinite(job?.display_order) ? job.display_order : index),
});

const persistCareerList = async (items: CareerOpportunity[]) => {
  const careers = (Array.isArray(items) ? items : []).map((job: any, index: number) => normalizeCareer(job, index));
  localStorage.setItem(CAREERS_CACHE_KEY, JSON.stringify(careers));

  if (!legacy.supabase || !legacy.isSupabaseConfigured) return careers;

  const payload = { key: 'careers', value: careers, updated_at: new Date().toISOString() };

  try {
    const { error } = await legacy.supabase
      .from('site_settings')
      .upsert(payload, { onConflict: 'key' });
    if (error) throw error;

    const { data, error: verifyError } = await legacy.supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'careers')
      .maybeSingle();
    if (verifyError) throw verifyError;
    if (!data || !Array.isArray((data as any).value)) {
      throw new Error('Careers save verification failed: saved record was not returned.');
    }

    const verified = (data as any).value.map((job: any, index: number) => normalizeCareer(job, index));
    localStorage.setItem(CAREERS_CACHE_KEY, JSON.stringify(verified));
    return verified;
  } catch (error) {
    console.error('[Careers] Durable persistence failed:', error);
    throw error;
  }
};

const persistApplicationList = async (items: JobApplication[]) => {
  const applications = Array.isArray(items) ? items : [];
  localStorage.setItem(APPLICATIONS_CACHE_KEY, JSON.stringify(applications));

  if (!legacy.supabase || !legacy.isSupabaseConfigured) return applications;

  // Careers are stored in site_settings, not public.careers. Therefore the
  // frontend job id is not a public.careers UUID and must never be sent to the
  // job_applications.job_id foreign key. Keep the human-readable job_title so
  // the admin panel still shows exactly which position was applied for.
  const rows = applications.map((item: any) => ({
    id: typeof item.id === 'string' && item.id.trim() ? item.id : crypto.randomUUID(),
    job_id: null,
    job_title: item.jobTitle || 'General Application',
    applicant_name: item.fullName || item.applicantName || '',
    email: item.email || item.applicantEmail || '',
    phone: item.phone || '',
    cover_note: item.coverLetter || item.cover_note || '',
    resume_url: item.resumeUrl || item.resume_url || '',
    status: item.status || 'New',
    created_at: item.appliedAt || new Date().toISOString()
  })).filter((row: any) => row.id && row.applicant_name && row.email);

  try {
    if (rows.length) {
      const { error } = await legacy.supabase
        .from('job_applications')
        .upsert(rows, { onConflict: 'id' });
      if (error) throw error;
    }
    return applications;
  } catch (error) {
    console.error('[Applications] Supabase persistence failed:', error);
    throw error;
  }
};

const readCareerSettings = async () => {
  if (!legacy.supabase || !legacy.isSupabaseConfigured) return null;
  try {
    const { data, error } = await legacy.supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'careers')
      .maybeSingle();
    if (error) {
      console.error('[Careers] Supabase load failed:', error);
      return null;
    }
    if (data && Array.isArray((data as any).value)) return (data as any).value;
  } catch (error) {
    console.error('[Careers] Careers read failed:', error);
  }
  return null;
};

const wrappedSyncAllFromSupabase = async () => {
  const data = await legacy.syncAllFromSupabase();
  if (!data) return data;

  if (legacy.supabase && legacy.isSupabaseConfigured) {
    const savedCareers = await readCareerSettings();
    if (savedCareers) {
      data.careers = savedCareers.map((item: any, index: number) => normalizeCareer(item, index));
      localStorage.setItem(CAREERS_CACHE_KEY, JSON.stringify(data.careers));
    }

    try {
      const { data: applicationRows, error: applicationError } = await legacy.supabase
        .from('job_applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (applicationError) throw applicationError;

      data.applications = (applicationRows || []).map((item: any) => ({
        id: item.id || '',
        jobId: item.job_id || '',
        jobTitle: item.job_title || 'General Application',
        fullName: item.applicant_name || '',
        email: item.email || '',
        phone: item.phone || '',
        coverLetter: item.cover_note || '',
        resumeUrl: item.resume_url || '',
        status: item.status || 'New',
        appliedAt: item.created_at || ''
      })).filter((item: JobApplication) => item.id);
      localStorage.setItem(APPLICATIONS_CACHE_KEY, JSON.stringify(data.applications));
    } catch (error) {
      console.error('[Applications] Direct Supabase sync failed:', error);
      // Keep the last known local applications if the admin read is temporarily
      // blocked by an RLS/session issue instead of replacing them with [].
      const cachedApplications = readLocalList<JobApplication>(APPLICATIONS_CACHE_KEY);
      if (cachedApplications.length > 0) data.applications = cachedApplications;
    }
  }

  return data;
};

export const syncAllFromSupabase = wrappedSyncAllFromSupabase;

export const dbStore = {
  ...legacy.dbStore,
  getCareers: () => legacy.isSupabaseConfigured ? readLocalList<CareerOpportunity>(CAREERS_CACHE_KEY) : legacy.dbStore.getCareers(),
  getApplications: () => legacy.isSupabaseConfigured ? readLocalList<JobApplication>(APPLICATIONS_CACHE_KEY) : legacy.dbStore.getApplications(),
  saveCareers: persistCareerList,
  saveApplications: persistApplicationList,
};