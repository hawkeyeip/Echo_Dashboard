import { ShieldAlert, AlertTriangle } from "lucide-react";

export type AuditResult = {
  lineByLine: { line: number; code: string; explanation: string }[];
  vulnerability: {
    title: string;
    description: string;
    severity: "high" | "medium" | "low";
  };
};

export default function AuditTab({ data, loading }: { data: AuditResult | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p>Auditing code logic...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Run an analysis to see the audit results.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Vulnerability Alert */}
      {data.vulnerability && (
        <div className={`p-4 rounded-xl border ${
          data.vulnerability.severity === 'high' ? 'bg-red-950/30 border-red-900/50 text-red-200' :
          data.vulnerability.severity === 'medium' ? 'bg-orange-950/30 border-orange-900/50 text-orange-200' :
          'bg-yellow-950/30 border-yellow-900/50 text-yellow-200'
        }`}>
          <div className="flex items-center gap-2 font-semibold mb-2">
            <AlertTriangle className="w-5 h-5" />
            Vulnerability Detected: {data.vulnerability.title}
          </div>
          <p className="text-sm opacity-90">{data.vulnerability.description}</p>
        </div>
      )}

      {/* Line by Line Analysis */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-200 mb-4">
          <ShieldAlert className="w-5 h-5 text-indigo-400" />
          Line-by-Line Execution Flow
        </h3>
        <div className="space-y-4">
          {data.lineByLine.map((item, i) => (
            <div key={i} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-start gap-4">
                <span className="text-xs font-mono text-gray-500 mt-1 select-none w-6 text-right">
                  {item.line}
                </span>
                <div className="flex-1 space-y-2">
                  <pre className="text-sm font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap">
                    {item.code}
                  </pre>
                  <p className="text-sm text-indigo-300">
                    {item.explanation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
