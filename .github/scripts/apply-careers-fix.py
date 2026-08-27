from pathlib import Path

db = Path('src/lib/db.ts')
s = db.read_text()
start = s.index('    // 6.5. Careers')
end = s.index('    // 7. Job Applications', start)
new_block = '''    // 6.5. Careers
    if (!isTableAllowed('careers')) {
      console.warn(`[RBAC Data Fetch Guard] Filtered out restricted table 'careers' for role '${rolePerms.role}'`);
      permissionRestrictedTables.push('careers');
      result.careers = getStored('careers', DEFAULT_CAREERS);
    } else {
      const { data: rawCareers, error: careersErr } = await supabase.from('careers').select('*');
      console.log('[Supabase Sync Inspection] Raw careers data from Supabase:', rawCareers);

      // Normalization check: verify if the returned data is an object, wrapped property, or single item instead of an array
      let normalizedCareersList: any[] = [];
      if (careersErr) {
        console.warn('[Supabase Sync] careers query notice:', careersErr.message);
      } else if (Array.isArray(rawCareers)) {
        normalizedCareersList = rawCareers;
      } else if (rawCareers && typeof rawCareers === 'object') {
        if (Array.isArray((rawCareers as any).data)) {
          normalizedCareersList = (rawCareers as any).data;
        } else if (Array.isArray((rawCareers as any).value)) {
          normalizedCareersList = (rawCareers as any).value;
        } else if ((rawCareers as any).id || (rawCareers as any).title) {
          normalizedCareersList = [rawCareers];
        }
      }

      // The dedicated `careers` table's column schema (is_active/responsibilities/experience)
      // does not match the fields the Admin Panel writes (active/benefits), so admin saves of
      // new/edited jobs land reliably in `website_settings` (key: 'careers') but not always in
      // this table. Treat an empty/errored `careers` table read as inconclusive and fall back to
      // the website_settings / site_settings mirror (and finally local storage) instead of
      // treating "no rows from this table" as "no careers exist" — this is what was overwriting
      // saved jobs with stale/empty data on refresh.
      if (normalizedCareersList.length === 0) {
        try {
          const { data: setRow } = await supabase.from('website_settings').select('value').eq('key', 'careers').maybeSingle();
          if (setRow && Array.isArray((setRow as any).value) && (setRow as any).value.length > 0) {
            normalizedCareersList = (setRow as any).value;
          } else {
            const { data: siteSetRow } = await supabase.from('site_settings').select('value').eq('key', 'careers').maybeSingle();
            if (siteSetRow && Array.isArray((siteSetRow as any).value) && (siteSetRow as any).value.length > 0) {
              normalizedCareersList = (siteSetRow as any).value;
            }
          }
        } catch (careersFallbackErr) {
          console.warn('[Supabase Sync] careers website_settings fallback notice:', careersFallbackErr);
        }
      }

      if (normalizedCareersList.length > 0) {
        const mappedCareers = normalizedCareersList.map((item: any) => ({
          id: item.id || '',
          title: item.title || item.job_title || '',
          type: item.type === 'internship' ? 'internship' : 'job',
          department: item.department || 'General',
          location: item.location || 'Bahawalpur, Pakistan',
          description: item.description || '',
          requirements: Array.isArray(item.requirements)
            ? item.requirements
            : (typeof item.requirements === 'string' ? JSON.parse(item.requirements || '[]') : []),
          benefits: Array.isArray(item.benefits)
            ? item.benefits
            : (Array.isArray(item.responsibilities)
                ? item.responsibilities
                : (typeof item.benefits === 'string' ? JSON.parse(item.benefits || '[]') : [])),
          active: item.active !== undefined ? item.active : (item.is_active !== undefined ? item.is_active : true)
        }));
        setStored('careers', mappedCareers);
        result.careers = mappedCareers;
      } else {
        // Nothing found in the careers table or its website_settings/site_settings mirror —
        // fall back to whatever is in local storage rather than forcing an empty state.
        result.careers = getStored('careers', DEFAULT_CAREERS);
      }
    }
'''
db.write_text(s[:start] + new_block + s[end:])

cv = Path('src/components/CareersView.tsx')
s = cv.read_text()
old = "  const activeJobs = opportunities.filter(op => op.active && op.type === 'job');\n  const activeInternships = opportunities.filter(op => op.active && op.type === 'internship');"
new = """  // Guard against a non-array/undefined opportunities prop (e.g. during initial data
  // loading) so the public Careers page never renders blank — it just shows the
  // existing empty-state messaging below until data arrives.
  const safeOpportunities = Array.isArray(opportunities) ? opportunities : [];
  const activeJobs = safeOpportunities.filter(op => op && op.active && op.type === 'job');
  const activeInternships = safeOpportunities.filter(op => op && op.active && op.type === 'internship');"""
if old not in s:
    raise SystemExit('CareersView expected lines not found; aborting')
cv.write_text(s.replace(old, new, 1))
print('CAREERS_PATCH_APPLIED')
