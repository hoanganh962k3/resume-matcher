'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BackgroundContainer from '@/components/common/background-container';
import { fetchMyResumes, fetchJobsForResume } from '@/lib/api/resume';
import { getUserInfo } from '@/lib/api/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FileText,
  Briefcase,
  ChevronRight,
  Loader2,
  User,
  Calendar,
  ArrowLeft,
  GitCompare,
} from 'lucide-react';

interface ProcessedData {
  personal_data?: any;
  job_title?: string;
  job_summary?: string;
  processed_at?: string | null;
}

interface ResumeData {
  resume_id: string;
  raw_resume: {
    id: number;
    content: string;
    created_at: string | null;
  };
  processed_resume: ProcessedData | null;
}

interface JobData {
  job_id: string;
  raw_job: {
    id: number;
    content: string;
    created_at: string | null;
  };
  processed_job: ProcessedData | null;
}

export default function PrecheckPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [comparingJobId, setComparingJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const user = getUserInfo();
    if (!user) {
      router.push('/login');
      return;
    }
    setUserName(user.name);
    loadResumes();
  }, [router]);

  const loadResumes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMyResumes();
      setResumes(data);
    } catch (err) {
      console.error('Error loading resumes:', err);
      setError('Failed to load your resumes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeClick = async (resumeId: string) => {
    if (selectedResumeId === resumeId) {
      // Collapse if clicking the same resume
      setSelectedResumeId(null);
      setJobs([]);
      setSelectedJobIds([]);
      return;
    }

    try {
      setLoadingJobs(true);
      setSelectedResumeId(resumeId);
      setSelectedJobIds([]);
      setError(null);
      const jobData = await fetchJobsForResume(resumeId);
      setJobs(jobData);
    } catch (err) {
      console.error('Error loading jobs:', err);
      setError('Failed to load jobs for this resume.');
      setJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleCompareClick = async (resumeId: string, jobId: string) => {
    // Fetch and prepare data for dashboard
    setComparingJobId(jobId);
    setError(null);
    try {
      const { improveResume } = await import('@/lib/api/resume');
      const preview = await improveResume(resumeId, jobId);

      // Store in sessionStorage for dashboard to access
      sessionStorage.setItem(
        'resumeMatcher:selectedJobAnalysis',
        JSON.stringify({
          data: preview.data,
        })
      );

      // Navigate to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to prepare comparison:', err);
      setError('Failed to prepare comparison. Please try again.');
      setComparingJobId(null);
    }
  };

  const toggleJobSelection = (jobId: string) => {
    setSelectedJobIds((prev) => {
      if (prev.includes(jobId)) {
        // Remove the job if already selected
        return prev.filter((id) => id !== jobId);
      } else if (prev.length < 3) {
        // Add the job only if less than 3 jobs are selected
        return [...prev, jobId];
      }
      // Don't add if 3 jobs are already selected
      return prev;
    });
  };

  const handleCompareMultiple = () => {
    if (!selectedResumeId || selectedJobIds.length === 0) return;

    const jobIdsParam = selectedJobIds.join(',');
    router.push(`/compare?resume_id=${selectedResumeId}&job_ids=${jobIdsParam}`);
  };

  const getPersonalName = (resume: ResumeData): string => {
    const personalData = resume.processed_resume?.personal_data;
    if (personalData?.name) return personalData.name;
    if (personalData?.full_name) return personalData.full_name;
    if (personalData?.firstName && personalData?.lastName) {
      return `${personalData.firstName} ${personalData.lastName}`;
    }
    if (personalData?.firstName) return personalData.firstName;
    return 'Unnamed Resume';
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <BackgroundContainer className="min-h-screen" innerClassName="bg-zinc-950 overflow-auto">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
            <p className="text-gray-400">Loading your resumes...</p>
          </div>
        </div>
      </BackgroundContainer>
    );
  }

  return (
    <BackgroundContainer className="min-h-screen" innerClassName="bg-zinc-950 overflow-auto">
      <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              className="mb-4 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <User className="h-4 w-4" />
                  <span>Welcome back, {userName}</span>
                </div>
                <h1 className="text-4xl font-bold mb-2 text-white">
                  Your Resumes & Job Applications
                </h1>
                <p className="text-gray-400">
                  Select a resume to view associated job applications and compare matches.
                </p>
              </div>
              {resumes.length > 0 && (
                <Button
                  onClick={() => router.push('/resume?replace=1')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Upload New Resume
                </Button>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {resumes.length === 0 ? (
            <Card className="bg-gray-900/70 border-gray-800/50">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                <h3 className="text-lg font-semibold mb-2 text-white">No Resumes Found</h3>
                <p className="text-gray-400 mb-4">You haven&apos;t uploaded any resumes yet.</p>
                <Button onClick={() => router.push('/resume')}>Upload Your First Resume</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {resumes.map((resume) => (
                <Card
                  key={resume.resume_id}
                  className={`transition-all cursor-pointer hover:shadow-lg bg-gray-900/70 border-gray-800/50 ${
                    selectedResumeId === resume.resume_id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <CardHeader
                    onClick={() => handleResumeClick(resume.resume_id)}
                    className="cursor-pointer hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-white">
                          <FileText className="h-5 w-5" />
                          {getPersonalName(resume)}
                        </CardTitle>
                        <CardDescription className="mt-2 flex items-center gap-4 text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Uploaded: {formatDate(resume.raw_resume.created_at)}
                          </span>
                          {resume.processed_resume?.processed_at && (
                            <span className="text-green-400">✓ Processed</span>
                          )}
                        </CardDescription>
                      </div>
                      <ChevronRight
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          selectedResumeId === resume.resume_id ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </CardHeader>

                  {selectedResumeId === resume.resume_id && (
                    <CardContent className="pt-0">
                      <div className="border-t border-gray-800 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold flex items-center gap-2 text-white">
                            <Briefcase className="h-4 w-4" />
                            Associated Job Applications ({jobs.length})
                          </h4>
                          {selectedJobIds.length >= 2 && (
                            <Button
                              onClick={handleCompareMultiple}
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <GitCompare className="h-4 w-4 mr-2" />
                              Compare {selectedJobIds.length} Jobs
                            </Button>
                          )}
                        </div>

                        {loadingJobs ? (
                          <div className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-400" />
                            <p className="text-sm text-gray-400">Loading jobs...</p>
                          </div>
                        ) : jobs.length === 0 ? (
                          <div className="text-center py-8 text-gray-400">
                            <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No job applications found for this resume.</p>
                          </div>
                        ) : (
                          <>
                            {jobs.length >= 2 && (
                              <div className="mb-3 text-xs text-gray-500">
                                Select multiple jobs to compare them side-by-side (maximum 3 jobs)
                                {selectedJobIds.length > 0 && (
                                  <span className="ml-2 text-blue-400">
                                    {selectedJobIds.length}/3 selected
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="space-y-3">
                              {jobs.map((job) => (
                                <div
                                  key={job.job_id}
                                  className={`flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors ${
                                    selectedJobIds.includes(job.job_id)
                                      ? 'ring-2 ring-blue-500'
                                      : ''
                                  }`}
                                >
                                  {jobs.length >= 2 && (
                                    <Checkbox
                                      checked={selectedJobIds.includes(job.job_id)}
                                      onCheckedChange={() => toggleJobSelection(job.job_id)}
                                      disabled={!selectedJobIds.includes(job.job_id) && selectedJobIds.length >= 3}
                                      className="border-gray-600"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white">
                                      {job.processed_job?.job_title || 'Job Position'}
                                    </p>
                                    <p className="text-sm text-gray-400 line-clamp-1">
                                      {job.processed_job?.job_summary || 'Job description...'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Applied: {formatDate(job.raw_job.created_at)}
                                    </p>
                                  </div>
                                  <Button
                                    onClick={() => handleCompareClick(resume.resume_id, job.job_id)}
                                    size="sm"
                                    className="shrink-0 bg-blue-600 hover:bg-blue-700"
                                    disabled={comparingJobId === job.job_id}
                                  >
                                    {comparingJobId === job.job_id ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Loading...
                                      </>
                                    ) : (
                                      'View Match'
                                    )}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </BackgroundContainer>
  );
}
