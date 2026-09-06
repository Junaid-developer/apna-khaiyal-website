import * as legacy from './db_legacy';
import type { CareerOpportunity, JobApplication } from '../types';

export * from './db_legacy';

const CAREERS_CACHE_KEY = 'apnakhaiyal_careers';
const APPLICATIONS_CACHE_KEY = 'apnakhaiyal_applications';

const readLocalList = <T>(key: string): T[] => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch { return []; }
};

const normalizeCareer = (job: any, index: number): CareerOpportunity => ({
  id: typeof job?.id === 'string' && job.id.trim() ? job.id : crypto.randomUUID(), title: job?.title || '', type: job?.type || 'job', department: job?.department || 'General', location: job?.location || '', description: job?.description || '', requirements: Array.isArray(job?.requirements) ? job.requirements : [], responsibilities: Array.isArray(job?.responsibilities) ? job.responsibilities : [], benefits: Array.isArray(job?.benefits) ? job.benefits : [], experience: job?.experience || '', active: job?.active ?? job?.is_active ?? job?.isActive ?? true, displayOrder: Number.isFinite(job?.displayOrder) ? job.displayOrder : Number.isFinite(job?.display_order) ? job.display_order : index,
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
  } catch (error) { console.error('[Careers] Durable persistence failed:', error); throw error; }
};

const isUuid = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const toApplicationRow = (item: JobApplication) => {
  const application: any = item || {};
  return { id: isUuid(application.id) ? application.id : crypto.randomUUID(), job_id: application.jobId || null, job_title: application.jobTitle || 'General Application', applicant_name: application.fullName || application.applicantName || '', email: application.email || application.applicantEmail || '', phone: application.phone || '', experience: application.experience || '', cover_note: application.coverLetter || application.cover_note || '', resume_url: application.resumeUrl || application.resume_url || '', status: application.status || 'New', created_at: application.appliedAt || new Date().toISOString() };
};

const persistResumeToStorage = async (resumeUrl: string, applicationId: string): Promise<string> => {
  if (!resumeUrl || !resumeUrl.startsWith('data:')) return resumeUrl;
  if (!legacy.supabase || !legacy.isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const match = resumeUrl.match(/^data:([^;,]+)(;base64)?,(.*)$/s);
  if (!match) throw new Error('Invalid resume file data. Please upload the resume again.');
  const contentType = match[1] || 'application/octet-stream';
  const encoded = match[3] || '';
  let blob: Blob;
  try {
    blob = await fetch(resumeUrl).then(response => {
      if (!response.ok) throw new Error('Unable to decode the uploaded resume.');
      return response.blob();
    });
    if (!blob.type && contentType) blob = new Blob([blob], { type: contentType });
  } catch {
    try {
      if (match[2]) {
        const binary = atob(encoded); const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        blob = new Blob([bytes], { type: contentType });
      } else blob = new Blob([decodeURIComponent(encoded)], { type: contentType });
    } catch { throw new Error('Unable to read the uploaded resume. Please select the file again.'); }
  }
  const extensionByType: Record<string, string> = { 'application/pdf': 'pdf', 'application/msword': 'doc', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx' };
  const extension = extensionByType[contentType] || 'bin';
  const filePath = `applications/${applicationId}.${extension}`;
  const { data, error } = await legacy.supabase.storage.from('documents').upload(filePath, blob, { cacheControl: '3600', contentType, upsert: false });
  if (error || !data) { console.error('[Applications] Resume storage upload failed:', error); throw new Error(error?.message || 'Unable to upload resume. Please try again.'); }
  const { data: publicUrlData } = legacy.supabase.storage.from('documents').getPublicUrl(filePath);
  const publicUrl = publicUrlData?.publicUrl;
  if (!publicUrl) throw new Error('Resume uploaded but its public URL could not be created.');
  return publicUrl;
};

// Module-level idempotency lock: even if React receives several rapid submit
events before its state rerenders, only the first application write is allowed
to reach Storage/Supabase. Concurrent callers share the same in-flight result.
let activeApplicationWrite: Promise<JobApplication> | null = null;

const persistApplication = (item: JobApplication): Promise<JobApplication> => {
  if (activeApplicationWrite) return activeApplicationWrite;

  const write = (async () => {
    const application: any = item || {};
    if (!application.fullName && !application.applicantName) throw new Error('Applicant name is required.');
    if (!application.email && !application.applicantEmail) throw new Error('Applicant email is required.');
    if (!legacy.supabase || !legacy.isSupabaseConfigured) throw new Error('Supabase is not configured in the deployed website.');
    const row = toApplicationRow(application);
    row.resume_url = await persistResumeToStorage(row.resume_url, row.id);

    const { error } = await legacy.supabase.from('job_applications').insert(row);
    if (error) throw error;

    const cachedApplication: JobApplication = { ...(application as JobApplication), id: row.id, resumeUrl: row.resume_url };
    const cached = readLocalList<JobApplication>(APPLICATIONS_CACHE_KEY);
    try { localStorage.setItem(APPLICATIONS_CACHE_KEY, JSON.stringify([cachedApplication, ...cached.filter(existing => existing.id !== cachedApplication.id)])); } catch {}
    return cachedApplication;
  })();

  activeApplicationWrite = write;
  write.then(
    () => { if (activeApplicationWrite === write) activeApplicationWrite = null; },
    () => { if (activeApplicationWrite === write) activeApplicationWrite = null; }
  );

  return write;
};

const deleteApplications = async (ids: string[]) => {
  const uniqueIds = Array.from(new Set(ids.filter(isUuid)));
  if (!legacy.supabase || !legacy.isSupabaseConfigured) throw new Error('Supabase is not configured.');
  if (uniqueIds.length) {
    const { error } = await legacy.supabase.from('job_applications').delete().in('id', uniqueIds);
    if (error) throw error;
  }
  const cached = readLocalList<JobApplication>(APPLICATIONS_CACHE_KEY);
  try { localStorage.setItem(APPLICATIONS_CACHE_KEY, JSON.stringify(uniqueIds.length ? cached.filter(item => !uniqueIds.includes(item.id)) : [])); } catch {}
};

const readCareerSettings = async () => {
  if (!legacy.supabase || !legacy.isSupabaseConfigured) return null;
  try { const { data, error } = await legacy.supabase.from('site_settings').select('value').eq('key', 'careers').maybeSingle(); if (error) return null; return data && Array.isArray((data as any).value) ? (data as any).value : null; } catch { return null; }
};

const wrappedSyncAllFromSupabase = async () => {
  let hasAuthenticatedSession = false;
  if (legacy.supabase && legacy.isSupabaseConfigured) { try { const { data: { session } } = await legacy.supabase.auth.getSession(); hasAuthenticatedSession = Boolean(session?.user); } catch { hasAuthenticatedSession = false; } }
  const data = await legacy.syncAllFromSupabase(hasAuthenticatedSession ? 'Admin' : 'Public');
  if (!data) return data;
  if (legacy.supabase && legacy.isSupabaseConfigured) {
    const savedCareers = await readCareerSettings();
    if (savedCareers) { data.careers = savedCareers.map((item: any, index: number) => normalizeCareer(item, index)); try { localStorage.setItem(CAREERS_CACHE_KEY, JSON.stringify(data.careers)); } catch {} }
    if (hasAuthenticatedSession) {
      try {
        const { data: applicationRows, error: applicationError } = await legacy.supabase.from('job_applications').select('*').order('created_at', { ascending: false });
        if (applicationError) throw applicationError;
        const seen = new Set<string>();
        data.applications = (applicationRows || []).map((item: any) => ({ id: item.id || '', jobId: item.job_id || '', jobTitle: item.job_title || 'General Application', fullName: item.applicant_name || '', email: item.email || '', phone: item.phone || '', experience: item.experience || '', coverLetter: item.cover_note || '', resumeUrl: item.resume_url || '', status: item.status || 'New', appliedAt: item.created_at || '' })).filter((item: JobApplication) => { if (!item.id || seen.has(item.id)) return false; seen.add(item.id); return true; });
        try { localStorage.setItem(APPLICATIONS_CACHE_KEY, JSON.stringify(data.applications)); } catch {}
      } catch (error) { console.error('[Applications] Direct Supabase sync failed:', error); data.applications = []; }
    } else data.applications = [];
  } else data.applications = [];
  return data;
};

export const syncAllFromSupabase = wrappedSyncAllFromSupabase;

export const dbStore = {
  ...legacy.dbStore,
  getCareers: () => legacy.isSupabaseConfigured ? readLocalList<CareerOpportunity>(CAREERS_CACHE_KEY) : legacy.dbStore.getCareers(),
  getApplications: () => legacy.isSupabaseConfigured ? readLocalList<JobApplication>(APPLICATIONS_CACHE_KEY) : legacy.dbStore.getApplications(),
  saveCareers: persistCareerList,
  deleteApplications,
  addApplication: async (item: JobApplication) => persistApplication(item),
  saveApplications: async (items: JobApplication[]) => {
    const list = Array.isArray(items) ? items.filter(Boolean) : [];
    const cached = readLocalList<JobApplication>(APPLICATIONS_CACHE_KEY);
    if (list.length === 1 && isUuid(list[0].id) && !cached.some(existing => existing.id === list[0].id)) return [await persistApplication(list[0])];

    // For admin deletions, compare against the live Supabase table instead of
    // relying on localStorage. This prevents stale/missing cache entries from
    // making submitted applications impossible to delete.
    const incomingIds = new Set(list.map(item => item.id).filter(isUuid));
    if (legacy.supabase && legacy.isSupabaseConfigured) {
      const { data: liveRows, error: liveError } = await legacy.supabase.from('job_applications').select('id');
      if (liveError) throw liveError;
      const liveIds = (liveRows || []).map((row: any) => row.id).filter(isUuid);
      const removedIds = liveIds.filter(id => !incomingIds.has(id));
      if (removedIds.length) await deleteApplications(removedIds);
    } else {
      const cachedIds = new Set(cached.map(item => item.id).filter(isUuid));
      const removedIds = Array.from(cachedIds).filter(id => !incomingIds.has(id));
      if (removedIds.length) await deleteApplications(removedIds);
    }

    if (!list.length) return [];
    const saved: JobApplication[] = [];
    for (const item of list) saved.push(await persistApplication(item));
    return saved;
  },
};
