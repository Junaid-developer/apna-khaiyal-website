# Project Rules & Architectural Guidelines

1. **Supabase as Single Source of Truth**:
   - Always query, mutate, and sync all application and CMS data with Supabase.
   - When Supabase credentials (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) are present, all operations must read from and write directly to Supabase tables.

2. **No Mock Data in Production Flow**:
   - Never rely on hardcoded mock values or simulated placeholders for active application state. Real data fetched directly from the database MUST be rendered.

3. **No Local State Storage for Production Data**:
   - Do not bypass backend persistence by keeping production data purely in volatile component state or standard local storage without syncing to Supabase.

4. **Automated Schema & SQL Migrations**:
   - Whenever a new feature or database modification is introduced, provide explicit, well-structured SQL migration scripts for Supabase tables, indexes, RLS policies, or permissions.

5. **Full CMS Editability**:
   - Maintain complete administrative editability from the Admin Panel for all website content (Products, Services, Gallery, Team, Careers, Hero Slides, Company Info, Reviews, SEO, and System Settings).
