import { supabase, isSupabaseConfigured } from './db';

export interface RLSTestResult {
  tableName: string;
  passed: boolean;
  httpStatus: number | string;
  postgresErrorCode: string;
  errorMessage: string;
  errorDetails: string;
  errorHint: string;
  rowCount: number;
  latencyMs: number;
  recommendation: string;
}

export interface FullRLSReport {
  timestamp: string;
  authSessionActive: boolean;
  userUid: string | null;
  userEmail: string | null;
  userRole: string | null;
  totalTables: number;
  passedCount: number;
  failedCount: number;
  results: RLSTestResult[];
}

export const ALL_CMS_TABLES = [
  'products',
  'product_images',
  'services',
  'hero_slides',
  'gallery',
  'team_members',
  'reviews',
  'careers',
  'job_applications',
  'contact_messages',
  'development_process',
  'industries',
  'technology_stack'
];

/**
 * Executes a SELECT query on each public database table using the current
 * authenticated user's credentials to test RLS policies and log exact status/errors.
 */
export async function testCurrentRLSPolicies(): Promise<FullRLSReport> {
  const timestamp = new Date().toISOString();
  
  if (!supabase || !isSupabaseConfigured) {
    return {
      timestamp,
      authSessionActive: false,
      userUid: null,
      userEmail: null,
      userRole: null,
      totalTables: ALL_CMS_TABLES.length,
      passedCount: 0,
      failedCount: ALL_CMS_TABLES.length,
      results: ALL_CMS_TABLES.map(tableName => ({
        tableName,
        passed: false,
        httpStatus: 0,
        postgresErrorCode: 'NO_SUPABASE_CLIENT',
        errorMessage: 'Supabase client is not configured or missing credentials.',
        errorDetails: 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be defined.',
        errorHint: 'Check .env config file.',
        rowCount: 0,
        latencyMs: 0,
        recommendation: 'Configure Supabase environment credentials.'
      }))
    };
  }

  let authSessionActive = false;
  let userUid: string | null = null;
  let userEmail: string | null = null;
  let userRole: string | null = null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      authSessionActive = true;
      userUid = session.user.id;
      userEmail = session.user.email || null;
      userRole = session.user.role || 'authenticated';
    }
  } catch (authErr) {
    console.warn('[RLS Diagnostic] Auth session check failed:', authErr);
  }

  const results: RLSTestResult[] = [];

  for (const tableName of ALL_CMS_TABLES) {
    const startTime = performance.now();
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: false })
        .limit(1);

      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      if (error) {
        // Postgres / PostgREST error object parsing
        const code = error.code || 'UNKNOWN';
        const msg = error.message || 'Unknown error occurred during SELECT';
        const details = error.details || '';
        const hint = error.hint || '';

        // Derive HTTP status heuristic
        let httpStatus: number | string = 403; // default assumption for RLS violation
        if (code === '42501' || msg.toLowerCase().includes('permission denied') || msg.toLowerCase().includes('row-level security')) {
          httpStatus = 403; // RLS / Permission Denied
        } else if (code === 'PGRST301' || msg.toLowerCase().includes('jwt')) {
          httpStatus = 401; // Unauthorized JWT
        } else if (code === '42P01' || msg.toLowerCase().includes('does not exist')) {
          httpStatus = 404; // Table / Relation Not Found
        } else if (code.startsWith('PGRST')) {
          httpStatus = 'PostgREST ' + code;
        }

        let recommendation = 'Review RLS policy SELECT permissions for authenticated users.';
        if (httpStatus === 403 || code === '42501') {
          recommendation = `403 Forbidden: Table '${tableName}' has RLS enabled but lacks a SELECT policy for user '${userEmail || 'anon'}'. Run: CREATE POLICY "Allow SELECT" ON ${tableName} FOR SELECT USING (true);`;
        } else if (httpStatus === 404 || code === '42P01') {
          recommendation = `404 Not Found: Table '${tableName}' does not exist in public schema. Run table creation SQL.`;
        } else if (httpStatus === 401) {
          recommendation = '401 Unauthorized: Invalid or expired JWT token. Refresh session login.';
        }

        results.push({
          tableName,
          passed: false,
          httpStatus,
          postgresErrorCode: code,
          errorMessage: msg,
          errorDetails: details,
          errorHint: hint,
          rowCount: 0,
          latencyMs,
          recommendation
        });
      } else {
        const rowCount = typeof count === 'number' ? count : (Array.isArray(data) ? (data as any[]).length : 0);
        results.push({
          tableName,
          passed: true,
          httpStatus: 200,
          postgresErrorCode: '200 OK',
          errorMessage: 'SELECT operation successful.',
          errorDetails: '',
          errorHint: '',
          rowCount,
          latencyMs,
          recommendation: 'RLS SELECT policy is healthy and granting access.'
        });
      }
    } catch (err: any) {
      const endTime = performance.now();
      results.push({
        tableName,
        passed: false,
        httpStatus: 500,
        postgresErrorCode: 'EXCEPTION',
        errorMessage: err?.message || String(err),
        errorDetails: err?.stack || '',
        errorHint: '',
        rowCount: 0,
        latencyMs: Math.round(endTime - startTime),
        recommendation: 'Unexpected exception thrown during client fetch.'
      });
    }
  }

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;

  const report: FullRLSReport = {
    timestamp,
    authSessionActive,
    userUid,
    userEmail,
    userRole,
    totalTables: ALL_CMS_TABLES.length,
    passedCount,
    failedCount,
    results
  };

  // Log directly to Browser Console in a neat, inspectable format
  console.group(`[RLS Policy Diagnostic Report] ${new Date().toLocaleTimeString()}`);
  console.log(`Auth Active: ${authSessionActive} | User: ${userEmail} (${userUid}) | Role: ${userRole}`);
  console.log(`Summary: ${passedCount}/${ALL_CMS_TABLES.length} tables passed (${failedCount} failed)`);
  console.table(results.map(r => ({
    Table: r.tableName,
    Status: r.passed ? 'PASSED (200)' : `FAILED (${r.httpStatus})`,
    'Postgres Code': r.postgresErrorCode,
    'Row Count': r.rowCount,
    'Latency (ms)': r.latencyMs,
    Error: r.errorMessage
  })));
  console.groupEnd();

  return report;
}
