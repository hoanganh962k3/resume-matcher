'use client';

import React from 'react';
import {
  Activity,
  SchedulePeriod,
  Certification,
  ProjectRecommendation,
  Priority,
  ActivityType,
} from '@/lib/api/schedule';
import {
  BookOpen,
  Code,
  FileText,
  GraduationCap,
  Video,
  Wrench,
  Calendar,
  Target,
  CheckCircle2,
  Clock,
  Award,
  TrendingUp,
  Users,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface LearningScheduleDisplayProps {
  scheduleData: {
    scheduleType: 'weekly' | 'monthly';
    totalDurationWeeks: number;
    overview: {
      skillsToLearn: string[];
      skillsToImprove: string[];
      estimatedTimePerWeek: string;
    };
    schedule: SchedulePeriod[];
    recommendations: {
      certifications: Certification[];
      projects: ProjectRecommendation[];
      networking: string[];
    };
    progressTracking: {
      weeklyCheckpoints: string[];
      successMetrics: string[];
    };
  };
}

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'Course':
      return <GraduationCap className="h-5 w-5" />;
    case 'Tutorial':
      return <BookOpen className="h-5 w-5" />;
    case 'Practice Project':
      return <Code className="h-5 w-5" />;
    case 'Reading':
      return <FileText className="h-5 w-5" />;
    case 'Certification':
      return <Award className="h-5 w-5" />;
    case 'Hands-on Practice':
      return <Wrench className="h-5 w-5" />;
    default:
      return <BookOpen className="h-5 w-5" />;
  }
};

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case 'High':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'Medium':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'Low':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

const ActivityCard: React.FC<{ activity: Activity }> = ({ activity }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-purple-500/30 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-purple-400 mt-1">{getActivityIcon(activity.activityType)}</div>
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-1">{activity.title}</h4>
            <p className="text-sm text-gray-400 mb-2">{activity.description}</p>

            <div className="flex flex-wrap gap-2 mb-2">
              <span
                className={`text-xs px-2 py-1 rounded border ${getPriorityColor(activity.priority)}`}
              >
                {activity.priority} Priority
              </span>
              <span className="text-xs px-2 py-1 rounded bg-gray-700/50 text-gray-300 border border-gray-600">
                <Clock className="inline h-3 w-3 mr-1" />
                {activity.estimatedHours}h
              </span>
              <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {activity.activityType}
              </span>
            </div>

            {activity.resources.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Hide Resources
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Show {activity.resources.length} Resource
                      {activity.resources.length > 1 ? 's' : ''}
                    </>
                  )}
                </button>

                {expanded && (
                  <div className="mt-2 space-y-2">
                    {activity.resources.map((resource, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Video className="h-4 w-4 text-gray-500" />
                        {resource.url ? (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                          >
                            {resource.name}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-gray-300">{resource.name}</span>
                        )}
                        <span className="text-xs text-gray-500">({resource.type})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PeriodCard: React.FC<{ period: SchedulePeriod; index: number }> = ({ period, index }) => {
  const [expanded, setExpanded] = React.useState(index === 0); // First period expanded by default

  const totalHours = period.activities.reduce((sum, activity) => sum + activity.estimatedHours, 0);

  return (
    <div className="bg-gray-900/80 rounded-lg border border-gray-700 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-purple-400" />
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">{period.period}</h3>
            <p className="text-sm text-purple-400">Focus: {period.focus}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {period.activities.length} activities • {totalHours}h total
          </span>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-6 pb-6 space-y-4">
          {period.learningGoals.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-400" />
                Learning Goals
              </h4>
              <ul className="space-y-1">
                {period.learningGoals.map((goal, idx) => (
                  <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Activities</h4>
            <div className="space-y-3">
              {period.activities.map((activity, idx) => (
                <ActivityCard key={idx} activity={activity} />
              ))}
            </div>
          </div>

          {period.milestones.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-400" />
                Milestones
              </h4>
              <ul className="space-y-1">
                {period.milestones.map((milestone, idx) => (
                  <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-yellow-400">★</span>
                    {milestone}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const LearningScheduleDisplay: React.FC<LearningScheduleDisplayProps> = ({ scheduleData }) => {
  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg p-6 border border-purple-500/30">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-purple-400" />
          Learning Plan Overview
        </h2>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-900/50 rounded p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Schedule Type</div>
            <div className="text-lg font-semibold text-white capitalize">
              {scheduleData.scheduleType}
            </div>
          </div>
          <div className="bg-gray-900/50 rounded p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Duration</div>
            <div className="text-lg font-semibold text-white">
              {scheduleData.totalDurationWeeks} weeks
            </div>
          </div>
          <div className="bg-gray-900/50 rounded p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Time Commitment</div>
            <div className="text-lg font-semibold text-white">
              {scheduleData.overview.estimatedTimePerWeek}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {scheduleData.overview.skillsToLearn.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-green-400 mb-2">Skills to Learn</h3>
              <div className="flex flex-wrap gap-2">
                {scheduleData.overview.skillsToLearn.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {scheduleData.overview.skillsToImprove.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-blue-400 mb-2">Skills to Improve</h3>
              <div className="flex flex-wrap gap-2">
                {scheduleData.overview.skillsToImprove.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Periods */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Learning Schedule</h2>
        <div className="space-y-3">
          {scheduleData.schedule.map((period, idx) => (
            <PeriodCard key={idx} period={period} index={idx} />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="grid md:grid-cols-2 gap-6">
        {scheduleData.recommendations.certifications.length > 0 && (
          <div className="bg-gray-900/80 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-400" />
              Recommended Certifications
            </h3>
            <div className="space-y-3">
              {scheduleData.recommendations.certifications.map((cert, idx) => (
                <div key={idx} className="bg-gray-800/50 rounded p-3 border border-gray-700">
                  <div className="font-semibold text-white mb-1">{cert.name}</div>
                  <div className="text-sm text-gray-400 mb-1">{cert.provider}</div>
                  <div className="text-xs text-gray-500 mb-2">{cert.relevance}</div>
                  <div className="text-xs text-purple-400">
                    Est. {cert.estimatedTimeMonths} month{cert.estimatedTimeMonths > 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {scheduleData.recommendations.projects.length > 0 && (
          <div className="bg-gray-900/80 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Code className="h-5 w-5 text-purple-400" />
              Portfolio Projects
            </h3>
            <div className="space-y-3">
              {scheduleData.recommendations.projects.map((project, idx) => (
                <div key={idx} className="bg-gray-800/50 rounded p-3 border border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-white">{project.title}</div>
                    <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {project.complexity}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mb-2">{project.description}</div>
                  <div className="flex flex-wrap gap-1">
                    {project.skillsApplied.map((skill, skillIdx) => (
                      <span
                        key={skillIdx}
                        className="text-xs px-2 py-0.5 rounded bg-gray-700/50 text-gray-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {scheduleData.recommendations.networking.length > 0 && (
        <div className="bg-gray-900/80 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            Networking Recommendations
          </h3>
          <ul className="space-y-2">
            {scheduleData.recommendations.networking.map((item, idx) => (
              <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Progress Tracking */}
      <div className="bg-gray-900/80 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-green-400" />
          Progress Tracking
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Weekly Checkpoints</h4>
            <ul className="space-y-1">
              {scheduleData.progressTracking.weeklyCheckpoints.map((checkpoint, idx) => (
                <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  {checkpoint}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Success Metrics</h4>
            <ul className="space-y-1">
              {scheduleData.progressTracking.successMetrics.map((metric, idx) => (
                <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                  <Award className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  {metric}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningScheduleDisplay;
