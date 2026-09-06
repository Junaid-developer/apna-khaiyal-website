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

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const toApplicationRow = (item: JobApplication, preserveId = true) => {
  const application: any = item || {};
  const databaseId = preserveId && isUuid(application.id) ? application.id : crypto.randomUUID();
  return {
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
};

const persistApplication = async (item: JobApplication) => {
  const application: any = item || {};
  const row = toApplicationRow(application, true);

  if (!row.applicant_name || !row.email) throw new Error('Applicant name and email are required.');
  if (!legacy.supabase || !legacy.isSupabaseConfigured) {
    throw new Error('Supabase is not configured in the deployed website.');
  }

  const { error } = await legacy.supabase.from('job_applications').upsert(row, { onConflict: 'id' });
  if (error) {
    console.error('[Applications] Supabase upsert failed:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }

  const cachedApplication: JobApplication = { ...(application as JobApplication), id: row.id, resumeUrl: '' };
  const cached = readLocalList<JobApplication>(APPLICATIONS_CACHE_KEY);
  const merged = [cachedApplication, ...cached.filter(existing => existing.id !== cachedApplication.id)];
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
  let hasAuthenticatedSession = false;

  if (legacy.supabase && legacy.isSupabaseConfigured) {
    try {
      const { data: { session } } = await legacy.supabase.auth.getSession();
      hasAuthenticatedSession = Boolean(session?.user);
    } catch {
      hasAuthenticatedSession = false;
    }
  }

  // Public visitors must never query job_applications because applicant data is
  // intentionally protected by RLS. Authenticated admin sessions can load it.
  const data = await legacy.syncAllFromSupabase(hasAuthenticatedSession ? 'Admin' : 'Public');
  if (!data) return data;

  if (legacy.supabase && legacy.isSupabaseConfigured) {
    const savedCareers = await readCareerSettings();
    if (savedCareers) {
      data.careers = savedCareers.map((item: any, index: number) => normalizeCareer(item, index));
      localStorage.setItem(CAREERS_CACHE_KEY, JSON.stringify(data.careers));
    }

    if (hasAuthenticatedSession) {
      try {
        // Repair any application that exists in this browser's old local cache
        // but was never durably written because of the earlier persistence bug.
        // This is append-only: nothing is deleted from Supabase here.
        const remoteBeforeRepair = await legacy.supabase
          .from('job_applications')
          .select('id');
        const remoteIdsBeforeRepair = new Set((remoteBeforeRepair.data || []).map((row: any) => row.id));
        const cachedOnlyApplications = cachedApplicationsBeforeSync.filter(item => item.id && !remoteIdsBeforeRepair.has(item.id));

        for (const cachedApplication of cachedOnlyApplications) {
          const repairRow = toApplicationRow(cachedApplication, true);
          if (!repairRow.applicant_name || !repairRow.email) continue;
          const { error: repairError } = await legacy.supabase
            .from('job_applications')
            .upsert(repairRow, { onConflict: 'id' });
          if (repairError) {
            console.warn('[Applications] Cached application repair skipped:', repairError.message);
          }
        }

        const { data: applicationRows, error: applicationError } = await legacy.supabase
          .from('job_applications')
          .select('*')
          .order('created_at', { ascending: false });
        if (applicationError) throw applicationError;

        const remoteApplications = (applicationRows || []).map((item: any) => ({
          id: item.id || '',
          jobId: item.job_id || '',
          jobTitle: item.job_title || 'General Application',
          fullName: item.applicant_name || '',
          email: item.email || '',
          phone: item.phone || '',
          experience: item.experience || '',
          coverLetter: item.cover_note || '',
          resumeUrl: item.resume_url || '',
          status: item.status || 'New',
          appliedAt: item.created_at || '',
        })).filter((item: JobApplication) => item.id);

        data.applications = remoteApplications;
        try { localStorage.setItem(APPLICATIONS_CACHE_KEY, JSON.stringify(remoteApplications)); } catch {}
      } catch (error) {
        console.error('[Applications] Direct Supabase sync failed:', error);
        if (cachedApplicationsBeforeSync.length > 0) data.applications = cachedApplicationsBeforeSync;
      }
    } else if (cachedApplicationsBeforeSync.length > 0) {
      data.applications = cachedApplicationsBeforeSync;
    }
  } else if (cachedApplicationsBeforeSync.length > 0) {
    data.applications = cachedApplicationsBeforeSync;
  }

  return data;
};

export const syncAllFromSupabase = wrappedSyncAllFromSupabase;

export const dbStore = {
  ...legacy.dbStore,
  getCareers: () => legacy.isSupabaseConfigured ? readLocalList<CareerOpportunity>(CAREERS_CACHE_KEY) : legacy.dbStore.getCareers(),
  getApplications: () => legacy.isSupabaseConfigured ? readLocalList<JobApplication>(APPLICATIONS_CACHE_KEY) : legacy.dbStore.getApplications(),
  saveCareers: persistCareerList,
  saveApplications: async (items: JobApplication[]) => {
    const list = Array.isArray(items) ? items.filter(Boolean) : [];
    if (!list.length) return [];

    // Persist every supplied application by stable id. This keeps the API
    // append-safe even if an admin component passes its complete list.
    const saved: JobApplication[] = [];
    for (const item of list) {
      saved.push(await persistApplication(item));
    }
    return saved;
  },
};