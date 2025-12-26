const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type ScheduleType = 'weekly' | 'monthly';
export type ActivityType =
  | 'Course'
  | 'Tutorial'
  | 'Practice Project'
  | 'Reading'
  | 'Certification'
  | 'Hands-on Practice';
export type Priority = 'High' | 'Medium' | 'Low';
export type ResourceType = 'Platform' | 'Documentation' | 'Book' | 'Video' | 'Article';
export type Complexity = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Resource {
  name: string;
  type: ResourceType;
  url?: string;
}

export interface Activity {
  activityType: ActivityType;
  title: string;
  description: string;
  resources: Resource[];
  estimatedHours: number;
  priority: Priority;
}

export interface SchedulePeriod {
  period: string;
  focus: string;
  learningGoals: string[];
  activities: Activity[];
  milestones: string[];
}

export interface Overview {
  skillsToLearn: string[];
  skillsToImprove: string[];
  estimatedTimePerWeek: string;
}

export interface Certification {
  name: string;
  provider: string;
  relevance: string;
  estimatedTimeMonths: number;
}

export interface ProjectRecommendation {
  title: string;
  description: string;
  skillsApplied: string[];
  complexity: Complexity;
}

export interface Recommendations {
  certifications: Certification[];
  projects: ProjectRecommendation[];
  networking: string[];
}

export interface ProgressTracking {
  weeklyCheckpoints: string[];
  successMetrics: string[];
}

export interface LearningSchedule {
  scheduleType: ScheduleType;
  totalDurationWeeks: number;
  overview: Overview;
  schedule: SchedulePeriod[];
  recommendations: Recommendations;
  progressTracking: ProgressTracking;
}

export interface LearningScheduleRequest {
  resumeId: string;
  jobId: string;
  scheduleType?: ScheduleType;
  durationWeeks?: number;
}

export async function generateLearningSchedule(
  request: LearningScheduleRequest
): Promise<LearningSchedule> {
  const res = await fetch(`${API_URL}/api/v1/schedule/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const errorMessage = errorData?.detail || `Failed to generate schedule (status ${res.status})`;
    throw new Error(errorMessage);
  }

  const data: LearningSchedule = await res.json();
  return data;
}
