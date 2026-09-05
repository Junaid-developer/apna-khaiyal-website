import * as legacy from './db_legacy';
import type { CareerOpportunity, JobApplication } from '../types';

export * from './db_legacy';

const CAREER_TOMBSTONES_KEY = 'apnakhaiyal_deleted_careers';
const APPLICATION_TOMBSTONES_KEY = 'apnakhaiyal_deleted_applications';

const readTombstones = (key: string): string[] => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value.filter(Boolean) : [];
  } catch {
    return [];
  }
};

const addTombstones = (key: string, ids: string[]) => {
  if (!ids.length) return;
  const merged = Array.from(new Set([...readTombstones(key), ...ids]));
  localStorage.setItem(key, JSON.stringify(merged));
};

const filterTombstones = <T extends { id?: string }>(items: T[], key: string): T[] => {
  const deleted = new Set(readTombstones(key));
  return items.filter(item => item?.id && !deleted.has(item.id));
};

const persistCareerList = async (items: CareerOpportunity[]) => {
  const careers = Array.isArray(items) ? items.filter((job: any) => job?.id) : [];
  if (legacy.supabase && legacy.isSupabaseConfigured) {
    try {
      const { data: existing, error: existingErr } = await legacy.supabase.from('careers').select('id');
      if (!existingErr) {
        const incomingIds = new Set(careers.map((job: any) => job.id));
        const removedIds = (existing || []).map((row: any) => row.id).filter((id: string) => !incomingIds.has(id));
        addTombstones(CAREER_TOMBSTONES_KEY, removedIds);
        if (removedIds.length) {
          // Try the real delete as well. The tombstone below is the fallback for the
          // site's custom admin authentication when Supabase RLS blocks the DELETE.
          await legacy.supabase.from('careers').delete().in('id', removedIds);
        }
      }
      if (careers.length) {
        const rows = careers.map((job: any, index: number) => ({
          id: job.id,
          title: job.title || '',
          type: job.type || 'job',
          department: job.department || 'General',
          location: job.location || '',
          description: job.description || '',
          requirements: Array.isArray(job.requirements) ? job.requirements : [],
          responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : (Array.isArray(job.benefits) ? job.benefits : []),
          benefits: Array.isArray(job.benefits) ? job.benefits : [],
          experience: job.experience || '',
          is_active: job.active !== false,
          active: job.active !== false,
          isActive: job.active !== false,
          displayOrder: job.displayOrder ?? index + 1,
          updated_at: new Date().toISOString()
        }));
        await legacy.supabase.from('careers').upsert(rows, { onConflict: 'id' });
      }
    } catch (error) {
      console.warn('[Careers] Supabase persistence fallback:', error);
    }
  }
  localStorage.setItem('apnakhaiyal_careers', JSON.stringify(careers));
  return careers;
};

const persistApplicationList = async (items: JobApplication[]) => {
  const applications = Array.isArray(items) ? items : [];
  if (legacy.supabase && legacy.isSupabaseConfigured) {
    try {
      const { data: existing, error: existingErr } = await legacy.supabase.from('job_applications').select('id');
      if (!existingErr) {
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
        const removedIds = (existing || []).map((row: any) => row.id).filter((id: string) => !incomingIds.has(id));
        addTombstones(APPLICATION_TOMBSTONES_KEY, removedIds);
        if (removedIds.length) {
          await legacy.supabase.from('job_applications').delete().in('id', removedIds);
        }
        if (rows.length) {
          await legacy.supabase.from('job_applications').upsert(rows, { onConflict: 'id' });
        }
      }
    } catch (error) {
      console.warn('[Applications] Supabase persistence fallback:', error);
    }
  }
  localStorage.setItem('apnakhaiyal_applications', JSON.stringify(applications));
  return applications;
};

const wrappedSyncAllFromSupabase = async () => {
  const data = await legacy.syncAllFromSupabase();
  if (!data) return data;
  if (Array.isArray(data.careers)) {
    data.careers = filterTombstones(data.careers as CareerOpportunity[], CAREER_TOMBSTONES_KEY);
  }
  if (Array.isArray(data.applications)) {
    data.applications = filterTombstones(data.applications as JobApplication[], APPLICATION_TOMBSTONES_KEY);
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
