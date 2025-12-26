'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useResumePreview } from '@/components/common/resume_previewer_context';
import { uploadJobDescriptions, improveResume, fetchResume, fetchJob } from '@/lib/api/resume';
import JobPreview from '@/components/dashboard/job-preview';
import { Plus, Trash2, GitCompare } from 'lucide-react';

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';
type ImprovementStatus = 'idle' | 'improving' | 'error';

interface JobEntry {
  id: string;
  text: string;
  jobId: string | null;
  jobData: any;
  status: SubmissionStatus;
}

export default function JobDescriptionUploadTextArea() {
  const MAX_JOBS = 3;
  const [jobs, setJobs] = useState<JobEntry[]>([
    {
      id: '1',
      text: '',
      jobId: null,
      jobData: null,
      status: 'idle',
    },
  ]);
  const [flash, setFlash] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [improvementStatus, setImprovementStatus] = useState<ImprovementStatus>('idle');
  const [selectedJobIndex, setSelectedJobIndex] = useState(0);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [isViewingResume, setIsViewingResume] = useState(false);

  const { setImprovedData } = useResumePreview();
  const searchParams = useSearchParams();
  const resumeIdFromQuery = searchParams.get('resume_id');
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [resumeReady, setResumeReady] = useState(false);
  const router = useRouter();

  // Load jobs from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('resumeMatcher:savedJobs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setJobs(parsed);
        }
      }
    } catch (error) {
      console.warn('Unable to load saved jobs from localStorage', error);
    }
  }, []);

  // Save jobs to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('resumeMatcher:savedJobs', JSON.stringify(jobs));
    } catch (error) {
      console.warn('Unable to save jobs to localStorage', error);
    }
  }, [jobs]);

  useEffect(() => {
    let resolvedId: string | null = null;
    let resolvedName: string | null = null;

    if (resumeIdFromQuery) {
      resolvedId = resumeIdFromQuery;
      try {
        localStorage.setItem('resumeMatcher:lastResumeId', resumeIdFromQuery);
        resolvedName = localStorage.getItem('resumeMatcher:lastResumeName');
      } catch (error) {
        console.warn('Unable to persist resume ID in job upload view', error);
      }
    } else {
      try {
        resolvedId = localStorage.getItem('resumeMatcher:lastResumeId');
        resolvedName = localStorage.getItem('resumeMatcher:lastResumeName');
      } catch (error) {
        console.warn('Unable to load resume ID from localStorage', error);
      }
    }
    setResumeId(resolvedId);
    setResumeName(resolvedName);
    setResumeReady(true);
  }, [resumeIdFromQuery]);

  // Fetch job data when any job's jobId changes
  useEffect(() => {
    jobs.forEach((job, index) => {
      if (job.jobId && !job.jobData) {
        const loadJobData = async () => {
          try {
            console.log('Fetching job data for ID:', job.jobId);
            const jobResponse = await fetchJob(job.jobId!);
            console.log('Job data received:', jobResponse);
            setJobs((prev) =>
              prev.map((j, i) => (i === index ? { ...j, jobData: jobResponse.processed_job } : j))
            );
          } catch (err) {
            console.error('Failed to load job preview:', err);
            setFlash({ type: 'error', message: 'Could not load job preview.' });
          }
        };
        loadJobData();
      }
    });
  }, [jobs]);

  const handleChange = useCallback((index: number, value: string) => {
    setJobs((prev) =>
      prev.map((job, i) => (i === index ? { ...job, text: value, status: 'idle' } : job))
    );
    setFlash(null);
  }, []);

  const addJob = useCallback(() => {
    if (jobs.length >= MAX_JOBS) return;
    setJobs((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: '',
        jobId: null,
        jobData: null,
        status: 'idle',
      },
    ]);
  }, [jobs.length]);

  const removeJob = useCallback(
    (index: number) => {
      if (jobs.length === 1) return;
      setJobs((prev) => prev.filter((_, i) => i !== index));
      if (selectedJobIndex >= index && selectedJobIndex > 0) {
        setSelectedJobIndex((prev) => prev - 1);
      }
    },
    [jobs.length, selectedJobIndex]
  );

  const handleUpload = useCallback(
    async (index: number) => {
      const job = jobs[index];
      const trimmed = job.text.trim();
      if (!trimmed) {
        setFlash({ type: 'error', message: 'Job description cannot be empty.' });
        return;
      }
      if (!resumeId) {
        setFlash({ type: 'error', message: 'Missing resume ID.' });
        return;
      }

      setJobs((prev) =>
        prev.map((j, i) => (i === index ? { ...j, status: 'submitting' as SubmissionStatus } : j))
      );

      try {
        const id = await uploadJobDescriptions([trimmed], resumeId);
        setJobs((prev) =>
          prev.map((j, i) =>
            i === index ? { ...j, jobId: id, status: 'success' as SubmissionStatus } : j
          )
        );
        setFlash({ type: 'success', message: `Job ${index + 1} submitted successfully!` });
      } catch (err) {
        console.error(err);
        setJobs((prev) =>
          prev.map((j, i) => (i === index ? { ...j, status: 'error' as SubmissionStatus } : j))
        );
        setFlash({ type: 'error', message: (err as Error).message });
      }
    },
    [jobs, resumeId]
  );

  const handleImprove = useCallback(
    async (jobId: string) => {
      if (!jobId || !resumeId) return;

      setImprovementStatus('improving');
      try {
        const preview = await improveResume(resumeId, jobId);
        setImprovedData(preview);
        router.push('/dashboard');
      } catch (err) {
        console.error(err);
        setImprovementStatus('error');
        setFlash({ type: 'error', message: (err as Error).message });
      }
    },
    [resumeId, setImprovedData, router]
  );

  const handleCompareAll = useCallback(() => {
    const submittedJobs = jobs.filter((j) => j.jobId);
    if (submittedJobs.length < 2) {
      setFlash({ type: 'error', message: 'Please submit at least 2 jobs to compare.' });
      return;
    }
    // TODO: Implement comparison page
    const jobIds = submittedJobs.map((j) => j.jobId).join(',');
    router.push(`/compare?resume_id=${resumeId}&job_ids=${jobIds}`);
  }, [jobs, resumeId, router]);

  const handleViewResume = useCallback(async () => {
    if (!resumeId) return;
    setIsViewingResume(true);
    try {
      const { raw_resume } = await fetchResume(resumeId);
      const resumeContent = raw_resume?.content ?? '';
      if (!resumeContent) {
        throw new Error('Resume content is unavailable.');
      }
      const contentType = raw_resume?.content_type?.toLowerCase() ?? 'md';
      const blobType = contentType === 'html' ? 'text/html' : 'text/plain';
      const blob = new Blob([resumeContent], {
        type: `${blobType};charset=utf-8`,
      });
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.click();
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      console.error('Unable to open resume', err);
      setFlash({
        type: 'error',
        message: (err as Error)?.message || 'Unable to open resume.',
      });
    } finally {
      setIsViewingResume(false);
    }
  }, [resumeId, setFlash]);

  const handleSwitchResume = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('resumeMatcher:lastResumeId');
        localStorage.removeItem('resumeMatcher:lastResumeName');
      }
    } catch (error) {
      console.warn('Unable to clear stored resume ID', error);
    }
    router.push('/resume?replace=1');
  }, [router]);

  const submittedJobsCount = jobs.filter((j) => j.jobId).length;

  return (
    <div className="w-full space-y-6">
      {/* Header Section with Resume Info */}
      <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-600">
        {resumeReady && !resumeId && (
          <div className="p-3 mb-4 text-sm rounded-md bg-red-900/20 border border-red-800/40 text-red-300">
            <p>No resume is currently stored. Please upload a resume first.</p>
            <button
              type="button"
              onClick={handleSwitchResume}
              className="mt-2 inline-flex items-center gap-1 text-red-200 underline hover:text-red-100"
            >
              Upload resume
            </button>
          </div>
        )}
        {flash && (
          <div
            className={`p-3 mb-4 text-sm rounded-md ${
              flash.type === 'error'
                ? 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-300'
                : 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800/30 dark:text-green-300'
            }`}
            role="alert"
          >
            <p>{flash.message}</p>
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-gray-400">
          {resumeId ? (
            <div className="text-left leading-tight">
              <p className="text-gray-200 font-semibold">
                Current resume:{' '}
                <button
                  type="button"
                  onClick={handleViewResume}
                  disabled={isViewingResume}
                  className={`underline ${
                    isViewingResume
                      ? 'text-gray-400 cursor-wait'
                      : 'text-blue-300 hover:text-blue-200'
                  }`}
                >
                  {isViewingResume ? 'Opening…' : resumeName || 'Unnamed file'}
                </button>
              </p>
              <p className="text-[11px] text-gray-500">ID: {resumeId}</p>
            </div>
          ) : (
            <p>Resume information not available.</p>
          )}
          <button
            type="button"
            onClick={handleSwitchResume}
            className="text-blue-300 hover:text-blue-200 underline"
          >
            Use a different resume
          </button>
        </div>
      </div>

      {/* Compare Button - Show when 2+ jobs submitted */}
      {submittedJobsCount >= 2 && (
        <div className="flex justify-center">
          <Button
            onClick={handleCompareAll}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded flex items-center gap-2"
          >
            <GitCompare className="h-5 w-5" />
            Compare All {submittedJobsCount} Jobs
          </Button>
        </div>
      )}

      {/* Job Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {jobs.map((job, index) => (
          <button
            key={job.id}
            onClick={() => setSelectedJobIndex(index)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${
              selectedJobIndex === index
                ? 'bg-gray-800 text-white border-t-2 border-x-2 border-blue-500'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Job {index + 1} {job.status === 'success' && '✓'}
          </button>
        ))}
        {jobs.length < MAX_JOBS && (
          <button
            onClick={addJob}
            className="px-4 py-2 rounded-t-lg font-medium bg-gray-700/30 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300 transition-colors flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Job
          </button>
        )}
      </div>

      {/* Current Job Content */}
      {jobs.map((job, index) => (
        <div key={job.id} className={`${selectedJobIndex === index ? 'block' : 'hidden'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {/* Left Column: Input */}
            <div className="p-4 w-full space-y-4">
              <div className="relative">
                <label
                  htmlFor={`jobDescription-${index}`}
                  className="bg-zinc-950/80 text-white absolute start-1 top-0 z-10 block -translate-y-1/2 px-2 text-xs font-medium"
                >
                  Job Description {index + 1} <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id={`jobDescription-${index}`}
                  rows={15}
                  value={job.text}
                  onChange={(e) => handleChange(index, e.target.value)}
                  required
                  aria-required="true"
                  placeholder="Paste the job description here..."
                  className="w-full bg-gray-800/30 focus:ring-1 border rounded-md dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/50 border-gray-300 min-h-[300px]"
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleUpload(index)}
                    disabled={
                      !job.text.trim() || job.status === 'submitting' || !resumeId || !resumeReady
                    }
                    className={`font-semibold py-2 px-6 rounded flex items-center justify-center min-w-[90px] ${
                      !job.text.trim() || job.status === 'submitting' || !resumeId || !resumeReady
                        ? 'bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600'
                    }`}
                  >
                    {job.status === 'submitting' ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        <span>Submitting...</span>
                      </>
                    ) : job.status === 'success' ? (
                      <span>Submitted!</span>
                    ) : (
                      <span>Submit</span>
                    )}
                  </Button>

                  {job.status === 'success' && job.jobId && (
                    <Button
                      onClick={() => handleImprove(job.jobId!)}
                      disabled={improvementStatus === 'improving'}
                      className="font-semibold py-2 px-6 rounded min-w-[90px] bg-green-600 hover:bg-green-700 text-white"
                    >
                      {improvementStatus === 'improving' ? 'Improving...' : 'Improve'}
                    </Button>
                  )}
                </div>

                {jobs.length > 1 && (
                  <Button
                    onClick={() => removeJob(index)}
                    variant="outline"
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Right Column: Job Preview */}
            <div className="p-4 w-full">
              <JobPreview jobData={job.jobData} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
