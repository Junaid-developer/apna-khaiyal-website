import * as legacy from './db_legacy';
import type { CareerOpportunity, JobApplication } from '../types';

export * from './db_legacy';

// Careers and job applications use Supabase as the source of truth when configured.
// Old local tombstones and local snapshots must never be merged back into live data.
const CAREERS_CACHE_KEY = 'apnakhaiyal_careers';
const APPLICATIONS_CACHE_KEY = 'apnakhaiyal_applications';
const OLD_CAREER_TOMBSTONES_KEY = 'apnakhaiyal_deleted_careers';
const OLD_APPLICATION_TOMBSTONES_KEY = 'apnakhaiyal_deleted_applications';

if (legacy.isSupabaseConfigured) {
  try {
    localStorage.removeItem(CAREERS_CACHE_KEY);
    localStorage.removeItem(APPLICATIONS_CACHE_KEY);
    localStorage.removeItem(OLD_CAREER_TOMBSTONES_KEY);
    localStorage.removeItem(OLD_APPLICATION_TOMBSTONES_KEY);
  } catch {
    // Ignore storage access errors; Supabase remains authoritative.
  }
}

const readLocalList = <T>(key: string): T[] => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const persistCareerList = async (items: CareerOpportunity[]) => {
  const input = Array.isArray(items) ? items : [];
  const careers = input.map((job: any, index: number) => ({
    ...job,
    id: job?.id || `career_${Date.now()}_${index}`,
  }));
  const previousCareers = readLocalList<CareerOpportunity>(CAREERS_CACHE_KEY);
  localStorage.setItem(CAREERS_CACHE_KEY, JSON.stringify(careers));

  if (!legacy.supabase || !legacy.isSupabaseConfigured) return careers;

  const incomingIds = new Set(careers.map((job: any) => job.id));
  const removedIds = previousCareers
    .map((job: any) => job?.id)
    .filter((id): id is string => !!id && !incomingIds.has(id));

  const rows = careers.map((job: any) => ({
    id: job.id,
    title: job.title || '',
    type: job.type || 'job',
    department: job.department || 'General',
    location: job.location || '',
    description: job.description || '',
    requirements: Array.isArray(job.requirements) ? job.requirements : [],
    responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : (Array.isArray(job.benefits) ? job.benefits : []),
    experience: job.experience || '',
    is_active: job.active !== false,
    active: job.active !== false,
    benefits: Array.isArray(job.benefits) ? job.benefits : [],
    displayOrder: Number.isFinite(job.displayOrder) ? job.displayOrder : 0,
    isActive: job.active !== false,
    updated_at: new Date().toISOString()
  }));

  try {
    if (removedIds.length) {
      const { error } = await legacy.supabase.from('careers').delete().in('id', removedIds);
      if (error) throw error;
    }

    if (rows.length) {
      // Do not use upsert for a brand-new job. Supabase RLS can reject the UPDATE
      // half of an upsert even when INSERT is allowed. Insert new IDs directly,
      // and only UPDATE rows that already exist.
      const { data: existingRows, error: existingError } = await legacy.supabase
        .from('careers')
        .select('id')
        .in('id', rows.map((row: any) => row.id));
      if (existingError) throw existingError;

      const existingIds = new Set((existingRows || []).map((row: any) => row.id));
      const newRows = rows.filter((row: any) => !existingIds.has(row.id));
      const existingCareerRows = rows.filter((row: any) => existingIds.has(row.id));

      if (newRows.length) {
        const { error } = await legacy.supabase.from('careers').insert(newRows);
        if (error) throw error;
      }

      for (const row of existingCareerRows) {
        const { id, ...changes } = row;
        const { error } = await legacy.supabase.from('careers').update(changes).eq('id', id);
        if (error) throw error;
      }
    }

    return careers;
  } catch (error) {
    console.error('[Careers] Supabase persistence failed:', error);
    throw error;
  }
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
      const { data: careerRows, error: careerError } = await legacy.supabase.from('careers').select('*').order('displayOrder', { ascending: true });
      if (careerError) throw careerError;
      data.careers = (careerRows || []).map((item: any) => ({
        id: item.id || '', title: item.title || '', type: item.type || 'job', department: item.department || 'General',
        location: item.location || '', description: item.description || '', requirements: Array.isArray(item.requirements) ? item.requirements : [],
        responsibilities: Array.isArray(item.responsibilities) ? item.responsibilities : [], benefits: Array.isArray(item.benefits) ? item.benefits : [],
        experience: item.experience || '', active: item.active ?? item.is_active ?? item.isActive ?? true,
        displayOrder: item.displayOrder ?? item.display_order ?? 0
      })).filter((item: CareerOpportunity) => item.id);
      localStorage.setItem(CAREERS_CACHE_KEY, JSON.stringify(data.careers));
    } catch (error) {
      console.error('[Careers] Direct Supabase sync failed:', error);
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