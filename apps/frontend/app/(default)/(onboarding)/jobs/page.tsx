'use client';

import JobDescriptionUploadTextArea from '@/components/jd-upload/text-area';
import BackgroundContainer from '@/components/common/background-container';
import UserMenu from '@/components/settings/user-menu';
import JobSelector from '@/components/common/job-selector';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/api/auth';

function JobDescriptionsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined);
  const [selectedJobData, setSelectedJobData] = useState<any>(null);
  const [usedJobIds, setUsedJobIds] = useState<string[]>([]);

  useEffect(() => {
    // Get resumeId from localStorage
    try {
      const stored = localStorage.getItem('resumeMatcher:lastResumeId');
      setResumeId(stored);
    } catch (error) {
      console.warn('Unable to read resume ID from localStorage', error);
    }
  }, []);

  // Callback to receive currently used job IDs from the JobDescriptionUploadTextArea component
  const handleUsedJobsChange = useCallback((jobIds: string[]) => {
    setUsedJobIds(jobIds);
  }, []);

  const handleJobSelect = (jobId: string, jobData: any) => {
    console.log('Job selected:', jobId, jobData);
    setSelectedJobId(jobId);

    // Transform the API response to the format expected by JobPreview
    // The jobData from the API has structure: { job_id, raw_job, processed_job }
    if (jobData?.processed_job) {
      const processed = jobData.processed_job;
      // JobPreview expects the processed_job data directly
      setSelectedJobData(processed);
      console.log('Formatted job data for preview:', processed);
    } else {
      console.warn('No processed_job data available for selected job');
      setSelectedJobData(null);
    }

    // Store in localStorage for use in other pages
    try {
      localStorage.setItem('resumeMatcher:lastJobId', jobId);
    } catch (error) {
      console.warn('Unable to persist job ID', error);
    }
  };

  return (
    <BackgroundContainer innerClassName="items-stretch justify-start py-16 overflow-auto">
      <div className="flex w-full max-w-7xl flex-col gap-10 mx-auto">
        <div className="w-full flex justify-between items-start">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <UserMenu />
        </div>

        <div className="flex flex-col items-center text-center gap-6">
          <h1 className="text-5xl sm:text-6xl font-bold text-white">Manage Job Descriptions</h1>
          <p className="text-gray-300 text-lg sm:text-xl max-w-2xl">
            Select from your previously uploaded job descriptions or add a new one below.
          </p>
        </div>

        {/* Job Selector - Only show for logged in users */}
        {user && (
          <div className="w-full mb-6 max-w-3xl mx-auto">
            <JobSelector
              fetchAllUserJobs={true}
              onJobSelect={handleJobSelect}
              selectedJobId={selectedJobId}
              excludeJobIds={usedJobIds}
            />
          </div>
        )}

        {/* Divider */}
        {user && (
          <div className="w-full flex items-center gap-4 my-4 max-w-3xl mx-auto">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-gray-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>
        )}

        {/* Upload New Job Section */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">Add New Job Description</h2>
          <p className="text-gray-400 max-w-2xl">
            Paste your job description below. We&apos;ll compare it against your résumé and surface
            the best match.
          </p>
        </div>

        <div className="flex justify-center">
          <Suspense fallback={<div className="text-gray-300">Loading input...</div>}>
            <JobDescriptionUploadTextArea
              selectedJobId={selectedJobId}
              selectedJobData={selectedJobData}
              onUsedJobsChange={handleUsedJobsChange}
            />
          </Suspense>
        </div>
      </div>
    </BackgroundContainer>
  );
}

export default function ProvideJobDescriptionsPage() {
  return (
    <Suspense
      fallback={
        <BackgroundContainer innerClassName="items-center justify-center">
          <div className="text-gray-300">Loading...</div>
        </BackgroundContainer>
      }
    >
      <JobDescriptionsContent />
    </Suspense>
  );
}
