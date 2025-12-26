'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from 'lucide-react';

interface InsightsPanelProps {
  details?: string;
  commentary?: string;
  resumeId?: string;
  jobId?: string;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ details, commentary, resumeId, jobId }) => {
  const hasContent = Boolean(details?.trim()) || Boolean(commentary?.trim());
  const router = useRouter();

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-gray-800/50 flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Key Insights</h2>
        <p className="text-gray-400 text-sm">
          Use these takeaways to refine your source résumé while keeping your experience factual.
        </p>
      </div>

      {details ? (
        <div className="bg-gray-800/70 rounded-md p-3 text-sm text-gray-300">
          <p className="font-semibold text-blue-300 uppercase tracking-wide text-xs mb-1">
            Key Insight
          </p>
          <p>{details}</p>
        </div>
      ) : null}

      {commentary ? (
        <div className="bg-gray-800/50 rounded-md p-3 text-sm text-gray-300">
          <p className="font-semibold text-purple-300 uppercase tracking-wide text-xs mb-1">
            Strategy
          </p>
          <p className="mb-3">{commentary}</p>
          {resumeId && jobId && (
            <button
              onClick={() => router.push(`/learning-schedule?resumeId=${resumeId}&jobId=${jobId}`)}
              className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-purple-500 to-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md"
            >
              <Calendar className="h-3 w-3 mr-1.5" />
              Generate Learning Schedule
            </button>
          )}
        </div>
      ) : null}

      {!hasContent && (
        <div className="bg-gray-800/40 border border-gray-700 rounded-md p-4 text-sm text-gray-300">
          Insights will appear here after your résumé has been analyzed.
        </div>
      )}
    </div>
  );
};

export default InsightsPanel;
