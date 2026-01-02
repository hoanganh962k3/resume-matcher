'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import BackgroundContainer from '@/components/common/background-container';

export default function Hero() {
  // Clear all workflow data when landing on home page (fresh start)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Clear session storage (temporary comparison/dashboard data)
        sessionStorage.clear();

        // Clear workflow-specific localStorage (resume and job data for fresh start)
        localStorage.removeItem('resumeMatcher:lastResumeId');
        localStorage.removeItem('resumeMatcher:lastResumeName');
        localStorage.removeItem('resumeMatcher:savedJobs');

        console.log('Workflow data cleared - starting fresh from home');
      } catch (err) {
        console.warn('Failed to clear storage:', err);
      }
    }
  }, []);

  return (
    <BackgroundContainer>
      <div className="relative mb-4 h-[30vh] w-full ">
        <h1 className="text-center text-8xl font-semibold text-white">Resume Matcher</h1>
      </div>
      <p className="mb-12 text-center text-lg text-gray-300 md:text-xl">
        Increase your interview chances with a perfectly tailored resume.
      </p>
      <Link
        href="/login"
        className="inline-flex h-12 items-center justify-center rounded-md bg-blue-600 px-8 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        Get Started
      </Link>
    </BackgroundContainer>
  );
}
