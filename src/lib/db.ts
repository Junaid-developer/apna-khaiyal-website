import * as legacy from './db_legacy';
import type { CareerOpportunity, JobApplication } from '../types';

export * from './db_legacy';

const persistCareerList = async (items: CareerOpportunity[]) => {
  const careers = Array.isArray(items) ? items.filter((job: any) => job?.id) : [];
  if (legacy.supabase && legacy.isSupabaseConfigured) {
    const { data: existing, error: existingErr } = await legacy.supabase.from('careers').select('id');
    if (existingErr) throw existingErr;
    const incomingIds = new Set(careers.map((job: any) => job.id));
    const removedIds = (existing || []).map((row: any) => row.id).filter((id: string) => !incomingIds.has(id));
    if (removedIds.length) {
      const { error } = await legacy.supabase.from('careers').delete().in('id', removedIds);
      if (error) throw error;
      const { data: stillThere } = await legacy.supabase.from('careers').select('id').in('id', removedIds);
      if (stillThere?.length) throw new Error('Career deletion was not persisted');
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
      const { error } = await legacy.supabase.from('careers').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
    }
  }
  localStorage.setItem('apnakhaiyal_careers', JSON.stringify(careers));
  return careers;
};

const persistApplicationList = async (items: JobApplication[]) => {
  const applications = Array.isArray(items) ? items : [];
  if (legacy.supabase && legacy.isSupabaseConfigured) {
    const { data: existing, error: existingErr } = await legacy.supabase.from('job_applications').select('id');
    if (existingErr) throw existingErr;
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
    if (removedIds.length) {
      const { error } = await legacy.supabase.from('job_applications').delete().in('id', removedIds);
      if (error) throw error;
      const { data: stillThere } = await legacy.supabase.from('job_applications').select('id').in('id', removedIds);
      if (stillThere?.length) throw new Error('Application deletion was not persisted');
    }
    if (rows.length) {
      const { error } = await legacy.supabase.from('job_applications').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
    }
  }
  localStorage.setItem('apnakhaiyal_applications', JSON.stringify(applications));
  return applications;
};

export const dbStore = {
  ...legacy.dbStore,
  saveCareers: persistCareerList,
  saveApplications: persistApplicationList,
};
