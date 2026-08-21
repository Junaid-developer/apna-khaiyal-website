import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  Database, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Copy, 
  Check, 
  Terminal,
  Search,
  ExternalLink
} from 'lucide-react';
import { 
  testCurrentRLSPolicies, 
  FullRLSReport, 
  RLSTestResult 
} from '../lib/rlsDiagnosticUtility';

interface RLSDiagnosticsUtilityPanelProps {
  onNotify?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const RLSDiagnosticsUtilityPanel: React.FC<RLSDiagnosticsUtilityPanelProps> = ({ onNotify }) => {
  const [report, setReport] = useState<FullRLSReport | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'passed' | 'failed'>('all');
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const runDiagnosticSuite = async () => {
    setIsTesting(true);
    try {
      const res = await testCurrentRLSPolicies();
      setReport(res);
      if (onNotify) {
        if (res.failedCount === 0) {
          onNotify(`All ${res.totalTables} RLS table SELECT tests passed successfully!`, 'success');
        } else {
          onNotify(`RLS Audit Completed: ${res.failedCount} table(s) reported RLS policy errors.`, 'error');
        }
      }
    } catch (err: any) {
      console.error('RLS Diagnostic execution error:', err);
      if (onNotify) onNotify(`Diagnostic suite failed: ${err?.message || String(err)}`, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    runDiagnosticSuite();
  }, []);

  const copyReportToJson = () => {
    if (!report) return;
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopiedReport(true);
    if (onNotify) onNotify('Diagnostic report copied to clipboard as JSON!', 'info');
    setTimeout(() => setCopiedReport(false), 3000);
  };

  const filteredResults = (report?.results || []).filter(r => {
    const matchesSearch = r.tableName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      r.errorMessage.toLowerCase().includes(filterQuery.toLowerCase()) ||
      r.postgresErrorCode.toLowerCase().includes(filterQuery.toLowerCase());
    
    if (filterStatus === 'passed') return matchesSearch && r.passed;
    if (filterStatus === 'failed') return matchesSearch && !r.passed;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 bg-[#2d545e] border border-[#3f6973] rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3f6973] pb-6">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2 rounded-xl bg-[#12343b] border border-[#e1b382]/40 text-[#e1b382]">
              <Database className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold tracking-wider text-white">
              RLS POLICY DIAGNOSTIC UTILITY
            </h2>
          </div>
          <p className="text-xs text-[#CBD5E1]">
            Attempts a simple <code className="text-[#e1b382] font-mono">SELECT</code> operation on each database table with the current authenticated session credentials to detect specific RLS blocking rules (403 vs 404 vs 200).
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={copyReportToJson}
            disabled={!report}
            className="px-4 py-2.5 bg-[#12343b] hover:bg-[#173d46] border border-[#3f6973] hover:border-[#e1b382] rounded-xl text-xs font-semibold text-[#CBD5E1] hover:text-white transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {copiedReport ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#e1b382]" />}
            <span>{copiedReport ? 'Copied' : 'Export JSON'}</span>
          </button>

          <button
            onClick={runDiagnosticSuite}
            disabled={isTesting}
            className="px-5 py-2.5 bg-[#e1b382] hover:bg-[#d4af37] text-[#12343b] font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Testing RLS...' : 'Run RLS Diagnostic'}</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-[#12343b]/80 border border-[#3f6973] rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#CBD5E1] block">Auth Session</span>
              <p className="text-sm font-bold text-white mt-0.5">
                {report.authSessionActive ? (
                  <span className="text-emerald-400 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Active</span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Anonymous</span>
                )}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-[#CBD5E1] truncate block max-w-[120px]">
                {report.userEmail || 'Anon user'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-[#12343b]/80 border border-[#3f6973] rounded-2xl">
            <span className="text-[10px] font-mono uppercase text-[#CBD5E1] block">Total Tables Audited</span>
            <p className="text-xl font-black text-white mt-0.5">{report.totalTables} Tables</p>
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
            <span className="text-[10px] font-mono uppercase text-emerald-300 block">Passed (200 OK)</span>
            <p className="text-xl font-black text-emerald-400 mt-0.5">{report.passedCount} / {report.totalTables}</p>
          </div>

          <div className={`p-4 rounded-2xl border ${report.failedCount > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-[#12343b]/80 border-[#3f6973]'}`}>
            <span className={`text-[10px] font-mono uppercase block ${report.failedCount > 0 ? 'text-red-300' : 'text-[#CBD5E1]'}`}>
              Failed (RLS Blocked)
            </span>
            <p className={`text-xl font-black mt-0.5 ${report.failedCount > 0 ? 'text-red-400' : 'text-[#CBD5E1]'}`}>
              {report.failedCount} Tables
            </p>
          </div>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#12343b]/60 p-3 rounded-2xl border border-[#3f6973]">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#CBD5E1] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search table or error code..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#2d545e] border border-[#3f6973] focus:border-[#e1b382] rounded-xl text-xs text-white placeholder-[#CBD5E1]/60 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {(['all', 'passed', 'failed'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                filterStatus === st 
                  ? 'bg-[#e1b382] text-[#12343b]' 
                  : 'bg-[#2d545e] text-[#CBD5E1] hover:text-white border border-[#3f6973]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table Results */}
      <div className="overflow-x-auto rounded-2xl border border-[#3f6973] bg-[#12343b]/90">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#3f6973] bg-[#173d46] text-[11px] font-mono uppercase tracking-wider text-[#e1b382]">
              <th className="p-3.5 pl-4">Table Name</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Postgres Code</th>
              <th className="p-3.5">Rows</th>
              <th className="p-3.5">Latency</th>
              <th className="p-3.5 pr-4">Error / Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3f6973]/50 text-xs">
            {filteredResults.length > 0 ? (
              filteredResults.map((res) => (
                <tr key={res.tableName} className="hover:bg-[#2d545e]/40 transition-colors">
                  <td className="p-3.5 pl-4 font-mono font-bold text-white flex items-center space-x-2">
                    <Database className="w-3.5 h-3.5 text-[#e1b382] shrink-0" />
                    <span>{res.tableName}</span>
                  </td>

                  <td className="p-3.5">
                    {res.passed ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>200 OK</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                        <XCircle className="w-3 h-3" />
                        <span>{res.httpStatus}</span>
                      </span>
                    )}
                  </td>

                  <td className="p-3.5 font-mono text-[#CBD5E1]">
                    {res.postgresErrorCode}
                  </td>

                  <td className="p-3.5 font-mono text-white">
                    {res.rowCount}
                  </td>

                  <td className="p-3.5 font-mono text-[#CBD5E1]">
                    {res.latencyMs} ms
                  </td>

                  <td className="p-3.5 pr-4">
                    {res.passed ? (
                      <span className="text-emerald-300/80 font-mono text-[11px]">SELECT query granted by active RLS policies.</span>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-red-300 font-semibold text-[11px]">{res.errorMessage}</p>
                        <p className="text-[10px] text-[#CBD5E1] font-mono bg-[#12343b] p-2 rounded-lg border border-red-500/20">
                          {res.recommendation}
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#CBD5E1] font-mono text-xs">
                  {isTesting ? 'Running RLS diagnostic SELECT suite...' : 'No tables match the active filter query.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RLSDiagnosticsUtilityPanel;
