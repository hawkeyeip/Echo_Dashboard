import { useState } from "react";
import { Bug, Terminal, CheckCircle2, XCircle, Send } from "lucide-react";

export type BreakResult = {
  brokenCode: string;
  simulatedError: string;
  bugType: string;
};

export type VerifyResult = {
  correct: boolean;
  feedback: string;
};

export default function BreakItTab({ originalCode }: { originalCode: string }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BreakResult | null>(null);
  const [answer, setAnswer] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState("");

  const handleBreakIt = async () => {
    if (!originalCode.trim()) {
      setError("Please provide a code snippet in the left pane first.");
      return;
    }
    
    setLoading(true);
    setError("");
    setVerifyResult(null);
    setAnswer("");
    
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "break", code: originalCode }),
      });
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        setError(json.error || "Failed to inject bug.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!answer.trim() || !data) return;
    
    setVerifying(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "verify", 
          code: data.brokenCode, 
          originalCode,
          answer 
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setVerifyResult(json);
      } else {
        setError(json.error || "Failed to verify answer.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  if (!data && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-6">
        <div className="p-4 bg-gray-800/50 rounded-full border border-gray-700">
          <Bug className="w-8 h-8 text-indigo-400" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-gray-200">Test Your Knowledge</h3>
          <p className="text-sm max-w-sm">
            Generate a realistic, junior-level bug in your code and see if you can identify how to fix it.
          </p>
        </div>
        <button 
          onClick={handleBreakIt}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
        >
          Inject Bug
        </button>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p>Injecting a subtle bug...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 flex flex-col h-full">
      {/* Simulated Terminal */}
      <div className="bg-black rounded-xl border border-gray-800 overflow-hidden shrink-0">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-gray-800">
          <Terminal className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-mono text-gray-400">Terminal - Simulated Error</span>
        </div>
        <div className="p-4 overflow-x-auto">
          <pre className="text-sm font-mono text-red-400 whitespace-pre-wrap">
            {data?.simulatedError}
          </pre>
        </div>
      </div>

      {/* Broken Code Display */}
      <div className="flex-1 min-h-0 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden flex flex-col">
        <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Broken Code Snippet
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          <pre className="text-sm font-mono text-gray-300">
            {data?.brokenCode}
          </pre>
        </div>
      </div>

      {/* Quiz Input */}
      <div className="shrink-0 space-y-3">
        {verifyResult ? (
          <div className={`p-4 rounded-xl border ${verifyResult.correct ? 'bg-green-950/30 border-green-900/50 text-green-200' : 'bg-red-950/30 border-red-900/50 text-red-200'}`}>
            <div className="flex items-center gap-2 font-semibold mb-2">
              {verifyResult.correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              {verifyResult.correct ? "Spot On!" : "Not Quite."}
            </div>
            <p className="text-sm opacity-90">{verifyResult.feedback}</p>
            <button 
              onClick={handleBreakIt}
              className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors border border-gray-700"
            >
              Try Another Bug
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              placeholder="Explain how to fix this bug..."
              className="flex-1 bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={verifying}
            />
            <button
              onClick={handleVerify}
              disabled={verifying || !answer.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {verifying ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
              Verify
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
