'use client';

import JobDescriptionUploadTextArea from '@/components/jd-upload/text-area';
import BackgroundContainer from '@/components/common/background-container';
import UserMenu from '@/components/settings/user-menu';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

function JobDescriptionsContent() {
  const router = useRouter();

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
          <h1 className="text-5xl sm:text-6xl font-bold text-white">Provide Job Description</h1>
          <p className="text-gray-300 text-lg sm:text-xl max-w-2xl">
            Paste your job description below. We&apos;ll compare it against your résumé and surface
            the best match.
          </p>
        </div>
        <div className="flex justify-center">
          <Suspense fallback={<div className="text-gray-300">Loading input...</div>}>
            <JobDescriptionUploadTextArea />
          </Suspense>
        </div>
      </div>
    </BackgroundContainer>
  );
}

export default function ProvideJobDescriptionsPage() {
  return (
    <Suspense fallback={
      <BackgroundContainer innerClassName="items-center justify-center">
        <div className="text-gray-300">Loading...</div>
      </BackgroundContainer>
    }>
      <JobDescriptionsContent />
    </Suspense>
  );
}
