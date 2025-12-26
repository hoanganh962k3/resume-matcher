'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BackgroundContainer from '@/components/common/background-container';
import JobComparisonCard from '@/components/compare/job-comparison-card';
import { Button } from '@/components/ui/button';
import { improveResume } from '@/lib/api/resume';
import { ArrowLeft, Download, Share2 } from 'lucide-react';

interface JobComparison {
  jobId: string;
  jobTitle: string;
  company: string;
  originalScore: number;
  newScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  skillComparison: any[];
  data: any;
}

function ComparePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [jobIds, setJobIds] = useState<string[]>([]);
  const [comparisons, setComparisons] = useState<JobComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleViewJobDetails = (comparison: JobComparison) => {
    // Store the selected job's data in sessionStorage for dashboard to access
    try {
      sessionStorage.setItem(
        'resumeMatcher:selectedJobAnalysis',
        JSON.stringify({
          data: comparison.data,
        })
      );
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to store job analysis:', err);
    }
  };

  useEffect(() => {
    const resume = searchParams.get('resume_id');
    const jobs = searchParams.get('job_ids');

    if (!resume || !jobs) {
      setError('Missing resume or job IDs');
      setLoading(false);
      return;
    }

    setResumeId(resume);
    setJobIds(jobs.split(','));
  }, [searchParams]);

  useEffect(() => {
    if (!resumeId || jobIds.length === 0) return;

    const fetchComparisons = async () => {
      // Create cache key based on resume and job IDs
      const cacheKey = `resumeMatcher:comparison:${resumeId}:${jobIds.sort().join(',')}`;

      // Try to load from sessionStorage first (clears on app close)
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const cachedData = JSON.parse(cached);
          console.log('Loading comparison from session cache');
          setComparisons(cachedData.comparisons);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Failed to load cached comparison:', err);
      }

      setLoading(true);
      const results: JobComparison[] = [];

      for (const jobId of jobIds) {
        try {
          const data = await improveResume(resumeId, jobId);

          // Extract matched and missing skills from skill_comparison
          const skillComp = data.data.skill_comparison || [];
          const matchedSkills = skillComp
            .filter((s: any) => s.resume_mentions > 0)
            .map((s: any) => s.skill);
          const missingSkills = skillComp
            .filter((s: any) => s.resume_mentions === 0 && s.job_mentions > 0)
            .map((s: any) => s.skill);

          // Try to extract job title from job description
          const jobDesc = data.data.job_description || '';
          const firstLine = jobDesc.split('\n').find((line) => line.trim());
          const jobTitle = firstLine?.slice(0, 60) || 'Job Position';

          results.push({
            jobId,
            jobTitle,
            company: 'Company', // Could extract from job description
            originalScore: data.data.original_score || 0,
            newScore: data.data.new_score || 0,
            matchedSkills,
            missingSkills,
            skillComparison: skillComp.map((s: any) => ({
              skill: s.skill,
              resume_mentions: s.resume_mentions,
              job_mentions: s.job_mentions,
              match_status:
                s.resume_mentions >= s.job_mentions
                  ? 'perfect'
                  : s.resume_mentions > 0
                    ? 'partial'
                    : 'missing',
            })),
            data: data.data,
          });
        } catch (err) {
          console.error(`Error analyzing job ${jobId}:`, err);
        }
      }

      setComparisons(results);
      setLoading(false);

      // Save to sessionStorage (clears on app close)
      try {
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({
            comparisons: results,
          })
        );
      } catch (err) {
        console.warn('Failed to cache comparison results:', err);
      }
    };

    fetchComparisons();
  }, [resumeId, jobIds]);

  const handleBack = () => {
    router.push('/jobs');
  };

  const handleRefresh = () => {
    // Clear cache and re-fetch
    if (resumeId && jobIds.length > 0) {
      const cacheKey = `resumeMatcher:comparison:${resumeId}:${jobIds.sort().join(',')}`;
      try {
        sessionStorage.removeItem(cacheKey);
      } catch (err) {
        console.warn('Failed to clear cache:', err);
      }
      window.location.reload();
    }
  };

  const handleExport = () => {
    // Create a summary of comparisons
    const summary = comparisons.map((c) => ({
      job: c.jobTitle,
      company: c.company,
      originalScore: `${Math.round(c.originalScore * 100)}%`,
      improvedScore: `${Math.round(c.newScore * 100)}%`,
      matchedSkills: c.matchedSkills.length,
      missingSkills: c.missingSkills.length,
    }));

    const json = JSON.stringify(summary, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'job-comparison-results.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getBestMatch = () => {
    if (comparisons.length === 0) return null;
    return comparisons.reduce((best, current) =>
      current.newScore > best.newScore ? current : best
    );
  };

  const bestMatch = getBestMatch();

  if (loading) {
    return (
      <BackgroundContainer className="min-h-screen" innerClassName="overflow-auto">
        <div className="flex flex-col items-center justify-center h-full">
          <svg
            className="animate-spin h-12 w-12 text-blue-500 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-300 text-lg">
            Analyzing {jobIds.length} job{jobIds.length > 1 ? 's' : ''}...
          </p>
          <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
        </div>
      </BackgroundContainer>
    );
  }

  if (error || comparisons.length === 0) {
    return (
      <BackgroundContainer className="min-h-screen" innerClassName="overflow-auto">
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-red-400 text-lg mb-4">{error || 'No comparison data available'}</div>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </BackgroundContainer>
    );
  }

  return (
    <BackgroundContainer className="min-h-screen" innerClassName="overflow-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Job Comparison Results</h1>
            <p className="text-gray-400">
              Comparing {comparisons.length} job{comparisons.length > 1 ? 's' : ''} against your
              resume
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleRefresh} variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Best Match Highlight */}
        {bestMatch && comparisons.length > 1 && (
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🏆</div>
              <div>
                <div className="text-sm text-gray-300">Best Match</div>
                <div className="text-lg font-semibold text-white">
                  {bestMatch.jobTitle} - {Math.round(bestMatch.newScore * 100)}% match
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {comparisons.map((comparison) => (
            <JobComparisonCard
              key={comparison.jobId}
              jobTitle={comparison.jobTitle}
              company={comparison.company}
              originalScore={comparison.originalScore}
              newScore={comparison.newScore}
              matchedSkills={comparison.matchedSkills}
              missingSkills={comparison.missingSkills}
              skillComparison={comparison.skillComparison}
              onClick={() => handleViewJobDetails(comparison)}
            />
          ))}
        </div>

        {/* Summary Stats */}
        <div className="bg-gray-900/70 p-6 rounded-lg border border-gray-800/50">
          <h2 className="text-xl font-semibold text-white mb-4">Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-400">Jobs Analyzed</div>
              <div className="text-2xl font-bold text-white">{comparisons.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Avg Match Score</div>
              <div className="text-2xl font-bold text-blue-400">
                {Math.round(
                  (comparisons.reduce((sum, c) => sum + c.newScore, 0) / comparisons.length) * 100
                )}
                %
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Total Matched Skills</div>
              <div className="text-2xl font-bold text-green-400">
                {comparisons.reduce((sum, c) => sum + c.matchedSkills.length, 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Skills to Learn</div>
              <div className="text-2xl font-bold text-yellow-400">
                {comparisons.reduce((sum, c) => sum + c.missingSkills.length, 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => {
              // Clear saved jobs and comparison data when uploading new resume
              try {
                localStorage.removeItem('resumeMatcher:savedJobs');
                sessionStorage.clear();
              } catch (err) {
                console.warn('Failed to clear storage:', err);
              }
              router.push('/resume?replace=1');
            }}
            variant="outline"
          >
            Upload New Resume
          </Button>
        </div>
      </div>
    </BackgroundContainer>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <BackgroundContainer className="min-h-screen" innerClassName="overflow-auto">
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-300">Loading comparison...</div>
          </div>
        </BackgroundContainer>
      }
    >
      <ComparePageContent />
    </Suspense>
  );
}
