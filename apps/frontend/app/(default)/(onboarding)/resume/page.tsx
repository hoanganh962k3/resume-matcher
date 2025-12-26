'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BackgroundContainer from '@/components/common/background-container';
import FileUpload from '@/components/common/file-upload';
import ApiKeyMenu from '@/components/settings/api-key-menu';
import ResumePreview from '@/components/dashboard/resume-preview';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function UploadResume() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checking, setChecking] = useState(true);
  const [uploadedResumeData, setUploadedResumeData] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const allowReplace = searchParams.get('replace') === '1';

  const handleResumeProcessed = (resumeData: any) => {
    console.log('Resume processed callback received:', resumeData);
    setUploadedResumeData(resumeData);
    setIsUploading(false);
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
        <div className="self-end">
          <ApiKeyMenu />
        </div>

        <h1 className="text-4xl font-bold text-center text-white mb-2">Upload Your Resume</h1>
        <p className="text-center text-gray-300 mb-8 max-w-xl">
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
        {uploadedResumeData && (
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
