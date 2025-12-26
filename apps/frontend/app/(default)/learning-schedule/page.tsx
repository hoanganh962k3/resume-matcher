'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BackgroundContainer from '@/components/common/background-container';
import LearningScheduleDisplay from '@/components/learning-schedule/learning-schedule-display';
import { Button } from '@/components/ui/button';
import { generateLearningSchedule, LearningSchedule, ScheduleType } from '@/lib/api/schedule';
import { ArrowLeft, Calendar, Clock, Loader2 } from 'lucide-react';

export default function LearningSchedulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [scheduleData, setScheduleData] = useState<LearningSchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduleType, setScheduleType] = useState<ScheduleType>('weekly');
  const [timeframeValue, setTimeframeValue] = useState<number>(8); // Number of weeks or months
  const [durationWeeks, setDurationWeeks] = useState<number>(8);

  const resumeId = searchParams.get('resumeId');
  const jobId = searchParams.get('jobId');

  // Update durationWeeks when scheduleType or timeframeValue changes
  useEffect(() => {
    if (scheduleType === 'weekly') {
      setDurationWeeks(timeframeValue);
    } else {
      // Convert months to weeks (assuming 4 weeks per month)
      setDurationWeeks(timeframeValue * 4);
    }
  }, [scheduleType, timeframeValue]);

  // Handle schedule type change and reset timeframe
  const handleScheduleTypeChange = (newType: ScheduleType) => {
    setScheduleType(newType);
    if (newType === 'weekly') {
      setTimeframeValue(8); // Default 8 weeks
    } else {
      setTimeframeValue(2); // Default 2 months
    }
  };

  useEffect(() => {
    // Auto-generate if IDs are provided and no data yet
    if (resumeId && jobId && !scheduleData && !loading && !error) {
      handleGenerateSchedule();
    }
  }, [resumeId, jobId]);

  const handleGenerateSchedule = async () => {
    if (!resumeId || !jobId) {
      setError('Missing resume ID or job ID. Please go back to the dashboard.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const schedule = await generateLearningSchedule({
        resumeId,
        jobId,
        scheduleType,
        durationWeeks,
      });
      setScheduleData(schedule);
    } catch (err) {
      console.error('Failed to generate schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate learning schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <BackgroundContainer className="min-h-screen !h-auto" innerClassName="bg-zinc-950 !h-auto">
      <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl pb-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={handleBack}
              variant="ghost"
              className="mb-4 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>

            <h1 className="text-3xl font-bold text-white mb-2">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                Learning Schedule
              </span>
            </h1>
            <p className="text-gray-400">
              Personalized learning plan to bridge skill gaps and land your target job
            </p>
          </div>

          {/* Configuration */}
          {!scheduleData && !loading && (
            <div className="bg-gray-900/80 rounded-lg p-6 border border-gray-700 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Configure Your Schedule</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Schedule Type
                  </label>
                  <select
                    value={scheduleType}
                    onChange={(e) => handleScheduleTypeChange(e.target.value as ScheduleType)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="weekly">Weekly Schedule</option>
                    <option value="monthly">Monthly Schedule</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Weekly: Detailed week-by-week breakdown | Monthly: High-level monthly overview
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    {scheduleType === 'weekly' ? 'Number of Weeks' : 'Number of Months'}
                  </label>
                  {scheduleType === 'weekly' ? (
                    <select
                      value={timeframeValue}
                      onChange={(e) => setTimeframeValue(parseInt(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value={4}>4 weeks (~1 month)</option>
                      <option value={8}>8 weeks (~2 months)</option>
                      <option value={12}>12 weeks (~3 months)</option>
                      <option value={16}>16 weeks (~4 months)</option>
                      <option value={24}>24 weeks (~6 months)</option>
                    </select>
                  ) : (
                    <select
                      value={timeframeValue}
                      onChange={(e) => setTimeframeValue(parseInt(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value={1}>1 month</option>
                      <option value={2}>2 months</option>
                      <option value={3}>3 months</option>
                      <option value={6}>6 months</option>
                      <option value={9}>9 months</option>
                      <option value={12}>12 months</option>
                    </select>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {scheduleType === 'weekly'
                      ? 'Choose based on learning intensity: 4-8 weeks for quick skills, 12-24 weeks for career change'
                      : 'Total duration: 1-12 months depending on career goals'}
                  </p>
                  {scheduleType === 'monthly' && (
                    <p className="text-xs text-purple-400 mt-1">
                      📅 Total weeks: {durationWeeks} weeks
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleGenerateSchedule}
                disabled={!resumeId || !jobId}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Generate Learning Schedule
              </Button>

              {(!resumeId || !jobId) && (
                <p className="text-sm text-yellow-400 mt-2">
                  ⚠️ Missing resume or job ID. Please upload and process both first.
                </p>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-gray-900/80 rounded-lg p-12 border border-gray-700 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Generating Your Learning Schedule
              </h3>
              <p className="text-gray-400">
                Analyzing skill gaps and creating a personalized plan...
              </p>
              <p className="text-sm text-gray-500 mt-2">This may take 10-30 seconds</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-900/20 rounded-lg p-6 border border-red-500/30 mb-6">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Error</h3>
              <p className="text-gray-300 mb-4">{error}</p>
              <Button
                onClick={handleGenerateSchedule}
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Schedule Display */}
          {scheduleData && !loading && (
            <>
              <div className="mb-4 flex justify-end gap-2">
                <Button
                  onClick={() => {
                    setScheduleData(null);
                    setError(null);
                  }}
                  variant="outline"
                  size="sm"
                  className="border-gray-700 text-gray-400 hover:text-white"
                >
                  Regenerate Schedule
                </Button>
              </div>
              <LearningScheduleDisplay scheduleData={scheduleData} />
            </>
          )}
        </div>
      </div>
    </BackgroundContainer>
  );
}
