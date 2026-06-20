import { BookOpen, Lightbulb } from "lucide-react";

export type TranslateResult = {
  summary: string;
  concepts: { term: string; definition: string; context: string }[];
};

export default function TranslateTab({ data, loading }: { data: TranslateResult | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p>Translating to enterprise terminology...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Run an analysis to see the enterprise translation.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Summary */}
      <div className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 p-6 rounded-xl border border-indigo-900/50">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-indigo-300 mb-3">
          <BookOpen className="w-5 h-5" />
          Architectural Summary
        </h3>
        <p className="text-gray-300 leading-relaxed">
          {data.summary}
        </p>
      </div>

      {/* Concepts Dictionary */}
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-4 px-1">Key Concepts</h3>
        <div className="grid gap-4">
          {data.concepts.map((concept, i) => (
            <div key={i} className="bg-gray-800/40 p-5 rounded-lg border border-gray-700/50 hover:bg-gray-800/60 transition-colors">
              <div className="flex items-start gap-3 mb-2">
                <Lightbulb className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-100">{concept.term}</h4>
                  <p className="text-sm text-gray-400 mt-1">{concept.definition}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">In Context:</span>
                <p className="text-sm text-gray-300 mt-1 italic">
                  "{concept.context}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
