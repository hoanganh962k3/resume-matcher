'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BackgroundContainer from '@/components/common/background-container';
import FileUpload from '@/components/common/file-upload';
import UserMenu from '@/components/settings/user-menu';
import ResumePreview from '@/components/dashboard/resume-preview';
import ResumeSelector from '@/components/common/resume-selector';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/api/auth';

function UploadResumeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);
  const [uploadedResumeData, setUploadedResumeData] = useState<any>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const allowReplace = searchParams.get('replace') === '1';

  const handleResumeProcessed = (resumeData: any) => {
    console.log('Resume processed callback received:', resumeData);
    setUploadedResumeData(resumeData);
    setSelectedResumeId(resumeData?.resume_id);
    setIsUploading(false);
  };

  const handleResumeSelect = (resumeId: string, resumeData: any) => {
    console.log('Resume selected:', resumeId);
    setSelectedResumeId(resumeId);

    // Transform the API response to match the structured_resume format
    if (resumeData?.processed_resume) {
      const processed = resumeData.processed_resume;
      const formattedData = {
        UUID: processed.UUID,
        'Personal Data': processed.personal_data,
        Experiences: processed.experiences,
        Projects: processed.projects,
        Skills: processed.skills,
        'Research Work': processed.research_work,
        Achievements: processed.achievements,
        Education: processed.education,
        'Extracted Keywords': processed.extracted_keywords,
      };
      console.log('Formatted resume data for preview:', formattedData);
      setUploadedResumeData(formattedData);
    } else {
      console.warn('No processed_resume data available for selected resume');
      setUploadedResumeData(null);
    }

    // Store in localStorage for use in other pages
    try {
      localStorage.setItem('resumeMatcher:lastResumeId', resumeId);
      // Store resume name if available
      const personalData = resumeData?.processed_resume?.personal_data;
      if (personalData?.name) {
        localStorage.setItem('resumeMatcher:lastResumeName', personalData.name);
      }
    } catch (error) {
      console.warn('Unable to persist resume ID', error);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('resumeMatcher:lastResumeId');
      if (stored && !allowReplace) {
        router.replace('/jobs');
        return;
      }
    } catch (error) {
      console.warn('Unable to read resume ID from localStorage', error);
    }
    setChecking(false);
  }, [router, allowReplace]);

  if (checking) {
    return (
      <BackgroundContainer innerClassName="justify-center">
        <div className="text-gray-300">Checking resume status…</div>
      </BackgroundContainer>
    );
  }

  return (
    <BackgroundContainer innerClassName="justify-start pt-8 pb-8 overflow-y-auto">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6 px-4 pb-8">
        <div className="w-full flex justify-between items-start">
          {allowReplace && (
            <Button
              onClick={() => router.back()}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          {!allowReplace && <div />}
          <UserMenu />
        </div>

        <h1 className="text-4xl font-bold text-center text-white mb-2">Manage Your Resumes</h1>
        <p className="text-center text-gray-300 mb-8 max-w-xl">
          Select from your previously uploaded resumes or upload a new one below.
        </p>

        {/* Resume Selector - Only show for logged in users */}
        {user && (
          <div className="w-full mb-6">
            <ResumeSelector
              onResumeSelect={handleResumeSelect}
              selectedResumeId={selectedResumeId}
            />
          </div>
        )}

        {/* Divider */}
        {user && (
          <div className="w-full flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-gray-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>
        )}

        {/* Upload New Resume Section */}
        <h2 className="text-2xl font-semibold text-white mb-4">Upload New Resume</h2>
        <p className="text-center text-gray-400 mb-6 max-w-xl">
          Drag and drop your resume file below or click to browse. Supported formats: PDF, DOC, DOCX
          (up to 2 MB).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* Upload Section */}
          <div className="w-full">
            <FileUpload onResumeProcessed={handleResumeProcessed} />
            {isUploading && (
              <div className="mt-4 text-center text-blue-400">Processing resume...</div>
            )}
          </div>

          {/* Preview Section */}
          <ResumePreview resumeData={uploadedResumeData} />
        </div>

        {/* Continue Button */}
        {(uploadedResumeData || selectedResumeId) && (
          <Button
            onClick={() => router.push('/jobs')}
            className="mt-6 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2"
          >
            Continue to Job Descriptions
            <ArrowRight className="h-5 w-5" />
          </Button>
        )}
      </div>
    </BackgroundContainer>
  );
}

export default function UploadResume() {
  return (
    <Suspense
      fallback={
        <BackgroundContainer innerClassName="justify-center">
          <div className="text-gray-300">Loading...</div>
        </BackgroundContainer>
      }
    >
      <UploadResumeContent />
    </Suspense>
  );
}
