import * as legacy from './db_legacy';
import type { CareerOpportunity, JobApplication } from '../types';

export * from './db_legacy';

const CAREER_TOMBSTONES_KEY = 'apnakhaiyal_deleted_careers';
const APPLICATION_TOMBSTONES_KEY = 'apnakhaiyal_deleted_applications';

const readTombstones = (key: string): string[] => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value.filter(Boolean) : [];
  } catch { return []; }
};

const addTombstones = (key: string, ids: string[]) => {
  if (!ids.length) return;
  localStorage.setItem(key, JSON.stringify(Array.from(new Set([...readTombstones(key), ...ids]))));
};

const filterTombstones = <T extends { id?: string }>(items: T[], key: string): T[] => {
  const deleted = new Set(readTombstones(key));
  return items.filter(item => item?.id && !deleted.has(item.id));
};

const persistCareerList = async (items: CareerOpportunity[]) => {
  const careers = Array.isArray(items) ? items.filter((job: any) => job?.id) : [];
  localStorage.setItem('apnakhaiyal_careers', JSON.stringify(careers));

  if (legacy.supabase && legacy.isSupabaseConfigured) {
    try {
      const { data: existing, error: existingErr } = await legacy.supabase.from('careers').select('id');
      if (!existingErr) {
        const incomingIds = new Set(careers.map((job: any) => job.id));
        const removedIds = (existing || []).map((row: any) => row.id).filter((id: string) => !incomingIds.has(id));
        addTombstones(CAREER_TOMBSTONES_KEY, removedIds);
        if (removedIds.length) await legacy.supabase.from('careers').delete().in('id', removedIds);
      }
      if (careers.length) {
        const rows = careers.map((job: any, index: number) => ({
          id: job.id, title: job.title || '', type: job.type || 'job',
          department: job.department || 'General', location: job.location || '',
          description: job.description || '', requirements: Array.isArray(job.requirements) ? job.requirements : [],
          responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : (Array.isArray(job.benefits) ? job.benefits : []),
          benefits: Array.isArray(job.benefits) ? job.benefits : [], experience: job.experience || '',
          is_active: job.active !== false, active: job.active !== false, isActive: job.active !== false,
          displayOrder: job.displayOrder ?? index + 1, updated_at: new Date().toISOString()
        }));
        await legacy.supabase.from('careers').upsert(rows, { onConflict: 'id' });
      }
    } catch (error) { console.warn('[Careers] Supabase persistence fallback:', error); }
  }
  return careers;
};

const persistApplicationList = async (items: JobApplication[]) => {
  const applications = Array.isArray(items) ? items : [];
  localStorage.setItem('apnakhaiyal_applications', JSON.stringify(applications));
  if (legacy.supabase && legacy.isSupabaseConfigured) {
    try {
      const { data: existing, error: existingErr } = await legacy.supabase.from('job_applications').select('id');
      if (!existingErr) {
        const rows = applications.map((item: any) => ({
          id: item.id, job_id: item.jobId || null, job_title: item.jobTitle || 'General Application',
          applicant_name: item.fullName || '', email: item.email || '', phone: item.phone || '',
          cover_note: item.coverLetter || '', resume_url: item.resumeUrl || '', status: item.status || 'New',
          created_at: item.appliedAt || new Date().toISOString()
        })).filter((row: any) => row.id && row.applicant_name && row.email);
        const incomingIds = new Set(rows.map((row: any) => row.id));
        const removedIds = (existing || []).map((row: any) => row.id).filter((id: string) => !incomingIds.has(id));
        addTombstones(APPLICATION_TOMBSTONES_KEY, removedIds);
        if (removedIds.length) await legacy.supabase.from('job_applications').delete().in('id', removedIds);
        if (rows.length) await legacy.supabase.from('job_applications').upsert(rows, { onConflict: 'id' });
      }
    } catch (error) { console.warn('[Applications] Supabase persistence fallback:', error); }
  }
  return applications;
};

const wrappedSyncAllFromSupabase = async () => {
  const data = await legacy.syncAllFromSupabase();
  if (!data) return data;

  if (Array.isArray(data.careers)) {
    let localCareers: CareerOpportunity[] = [];
    try {
      const stored = JSON.parse(localStorage.getItem('apnakhaiyal_careers') || '[]');
      if (Array.isArray(stored)) localCareers = stored;
    } catch {}
    const byId = new Map<string, CareerOpportunity>();
    for (const job of data.careers as CareerOpportunity[]) if (job?.id) byId.set(job.id, job);
    for (const job of localCareers) if (job?.id) byId.set(job.id, job);
    data.careers = filterTombstones(Array.from(byId.values()), CAREER_TOMBSTONES_KEY);
    localStorage.setItem('apnakhaiyal_careers', JSON.stringify(data.careers));
  }

  if (Array.isArray(data.applications)) {
    let localApplications: JobApplication[] = [];
    try {
      const stored = JSON.parse(localStorage.getItem('apnakhaiyal_applications') || '[]');
      if (Array.isArray(stored)) localApplications = stored;
    } catch {}
    const byId = new Map<string, JobApplication>();
    for (const item of data.applications as JobApplication[]) if (item?.id) byId.set(item.id, item);
    for (const item of localApplications) if (item?.id) byId.set(item.id, item);
    data.applications = filterTombstones(Array.from(byId.values()), APPLICATION_TOMBSTONES_KEY);
    localStorage.setItem('apnakhaiyal_applications', JSON.stringify(data.applications));
  }
  return data;
};

export const syncAllFromSupabase = wrappedSyncAllFromSupabase;

export const dbStore = {
  ...legacy.dbStore,
  getCareers: () => filterTombstones(legacy.dbStore.getCareers(), CAREER_TOMBSTONES_KEY),
  getApplications: () => filterTombstones(legacy.dbStore.getApplications(), APPLICATION_TOMBSTONES_KEY),
  saveCareers: persistCareerList,
  saveApplications: persistApplicationList,
};
