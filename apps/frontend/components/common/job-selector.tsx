'use client';

import { useState, useEffect } from 'react';
import { fetchJobsForResume, fetchAllJobsForUser } from '@/lib/api/resume';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Briefcase, Loader2 } from 'lucide-react';

interface JobSelectorProps {
  resumeId?: string;
  onJobSelect: (jobId: string, jobData: any) => void;
  selectedJobId?: string;
  excludeJobIds?: string[];
  fetchAllUserJobs?: boolean; // New prop to determine whether to fetch all user jobs
}

export default function JobSelector({
  resumeId,
  onJobSelect,
  selectedJobId,
  excludeJobIds = [],
  fetchAllUserJobs = false,
}: JobSelectorProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, [resumeId, fetchAllUserJobs]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      let data: any[];
      if (fetchAllUserJobs) {
        // Fetch all jobs for the user
        data = await fetchAllJobsForUser();
      } else if (resumeId) {
        // Fetch jobs for a specific resume
        data = await fetchJobsForResume(resumeId);
      } else {
        data = [];
      }

      setJobs(data);

      // Auto-select if only one job exists
      if (data.length === 1 && !selectedJobId) {
        onJobSelect(data[0].job_id, data[0]);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleJobChange = (jobId: string) => {
    const job = jobs.find((j) => j.job_id === jobId);
    if (job) {
      onJobSelect(jobId, job);
    }
  };

  const getJobLabel = (job: any) => {
    const processedJob = job.processed_job;
    const title = processedJob?.job_title || 'Untitled Job';
    const company =
      processedJob?.company_profile?.company_name || processedJob?.company_profile || '';
    const date = new Date(job.raw_job.created_at).toLocaleDateString();

    if (company) {
      return `${title} at ${company} - ${date}`;
    }
    return `${title} - ${date}`;
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
        <span className="text-gray-300">
          {fetchAllUserJobs ? 'Loading your jobs...' : 'Loading jobs for this resume...'}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 rounded-lg border border-red-800">
        <p className="text-red-400">{error}</p>
        <Button onClick={loadJobs} variant="outline" size="sm" className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <p className="text-gray-300">
          {fetchAllUserJobs
            ? 'No jobs found. Upload a job description below.'
            : 'No jobs found for this resume. Upload a job description below.'}
        </p>
      </div>
    );
  }

  // Filter out jobs that are already selected in other tabs
  const availableJobs = jobs.filter((j) => !excludeJobIds.includes(j.job_id));

  if (availableJobs.length === 0) {
    return (
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <p className="text-gray-300">All jobs have been used. Add a new job description below.</p>
      </div>
    );
  }

  const getJobDisplayText = (job: any) => {
    const processedJob = job.processed_job;
    const title = processedJob?.job_title || 'Untitled Job';
    const company =
      processedJob?.company_profile?.company_name || processedJob?.company_profile || '';

    if (company) {
      return `${title} at ${company}`;
    }
    return title;
  };

  return (
    <div className="w-full space-y-2">
      <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
        <Briefcase className="h-4 w-4" />
        Select a Job Description
      </label>

      {/* Show currently selected job */}
      {selectedJobId && (
        <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-md">
          <p className="text-xs text-blue-300 mb-1">Currently Selected:</p>
          <p className="text-sm text-white font-medium">
            {getJobDisplayText(jobs.find((j) => j.job_id === selectedJobId))}
          </p>
        </div>
      )}

      <Select value={selectedJobId} onValueChange={handleJobChange}>
        <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
          <SelectValue
            placeholder={
              fetchAllUserJobs
                ? 'Choose from your uploaded jobs...'
                : 'Choose from jobs associated with this resume...'
            }
          />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          {availableJobs.map((job) => (
            <SelectItem
              key={job.job_id}
              value={job.job_id}
              className="text-gray-200 hover:bg-gray-700"
            >
              {getJobLabel(job)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-400">
        {availableJobs.length} job{availableJobs.length !== 1 ? 's' : ''} available
      </p>
    </div>
  );
}
