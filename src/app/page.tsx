"use client";

import { useState } from "react";
import { Code2, ShieldAlert, BookOpen, Bug, Activity, Play, AlertCircle } from "lucide-react";
import AuditTab, { AuditResult } from "@/components/AuditTab";
import TranslateTab, { TranslateResult } from "@/components/TranslateTab";
import BreakItTab from "@/components/BreakItTab";

export default function EchoDashboard() {
  const [codeSnippet, setCodeSnippet] = useState("");
  const [activeTab, setActiveTab] = useState<"audit" | "translate" | "break">("audit");
  
  const [loading, setLoading] = useState(false);
  const [auditData, setAuditData] = useState<AuditResult | null>(null);
  const [translateData, setTranslateData] = useState<TranslateResult | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!codeSnippet.trim()) {
      setError("Please paste a code snippet to analyze.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // We run both Audit and Translate simultaneously to save time
      const [auditRes, translateRes] = await Promise.all([
        fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "audit", code: codeSnippet }),
        }),
        fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "translate", code: codeSnippet }),
        })
      ]);

      const auditJson = await auditRes.json();
      const translateJson = await translateRes.json();

      if (!auditRes.ok) throw new Error(auditJson.error || "Failed to audit code.");
      if (!translateRes.ok) throw new Error(translateJson.error || "Failed to translate code.");

      setAuditData(auditJson);
      setTranslateData(translateJson);
      // We don't pre-fetch BreakIt because the user might not want to take the quiz yet.
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Echo</h1>
            <span className="hidden sm:inline-block px-2 py-1 text-xs font-medium bg-gray-800 text-gray-400 rounded-full ml-2 border border-gray-700">
              Reverse-Engineering Engine
            </span>
          </div>
          
          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Play className="w-4 h-4" />}
            {loading ? "Analyzing..." : "Analyze Code"}
          </button>
        </div>
      </header>

      {/* Main Split Pane Layout */}
      <main className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-4rem)]">
        
        {/* Left Pane: Code Input */}
        <section className="flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl relative">
          <div className="h-12 border-b border-gray-800 flex items-center px-4 justify-between bg-gray-900/80">
            <div className="flex items-center gap-2 text-gray-400">
              <Code2 className="w-4 h-4" />
              <span className="text-sm font-medium">Input Snippet</span>
            </div>
            {error && (
              <div className="flex items-center gap-1 text-red-400 text-xs font-medium bg-red-400/10 px-2 py-1 rounded">
                <AlertCircle className="w-3 h-3" />
                {error}
              </div>
            )}
            <div className="flex gap-1.5 ml-auto">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-700" />
            </div>
          </div>
          <textarea
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder="// Paste your AI-generated code here to reverse-engineer it..."
            className="flex-1 w-full bg-transparent text-gray-300 p-6 font-mono text-sm leading-relaxed focus:outline-none resize-none"
            spellCheck="false"
          />
        </section>

        {/* Right Pane: Tabbed Interface */}
        <section className="flex flex-col bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
          {/* Tabs Navigation */}
          <div className="flex p-2 gap-2 bg-gray-900/80 border-b border-gray-800 shrink-0">
            <TabButton 
              active={activeTab === "audit"} 
              onClick={() => setActiveTab("audit")}
              icon={<ShieldAlert className="w-4 h-4" />}
              label="Audit"
            />
            <TabButton 
              active={activeTab === "translate"} 
              onClick={() => setActiveTab("translate")}
              icon={<BookOpen className="w-4 h-4" />}
              label="Enterprise Translate"
            />
            <TabButton 
              active={activeTab === "break"} 
              onClick={() => setActiveTab("break")}
              icon={<Bug className="w-4 h-4" />}
              label="Break It"
            />
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            {activeTab === "audit" && <AuditTab data={auditData} loading={loading} />}
            {activeTab === "translate" && <TranslateTab data={translateData} loading={loading} />}
            {activeTab === "break" && <BreakItTab originalCode={codeSnippet} />}
          </div>
        </section>
      </main>
    </div>
  );
}

function TabButton({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string; 
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        active 
          ? "bg-gray-800 text-white shadow-sm ring-1 ring-white/10" 
          : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
