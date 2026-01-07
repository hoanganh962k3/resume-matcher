import React from 'react';

interface PersonalData {
  firstName?: string;
  lastName?: string;
  title?: string | null;
  email?: string;
  phone?: string;
  linkedin?: string;
  portfolio?: string;
  location?: {
    city?: string;
    country?: string;
  };
}

interface Experience {
  jobTitle?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string[];
  technologiesUsed?: string[];
}

interface Project {
  projectName?: string;
  description?: string;
  technologiesUsed?: string[];
  link?: string;
  startDate?: string;
  endDate?: string;
}

interface Skill {
  category?: string;
  skillName?: string;
}

interface ResearchWork {
  title?: string | null;
  publication?: string | null;
  date?: string | null;
  link?: string | null;
  description?: string | null;
}

interface Education {
  institution?: string;
  degree?: string;
  fieldOfStudy?: string | null;
  startDate?: string;
  endDate?: string;
  grade?: string;
  description?: string;
}

interface ResumeData {
  UUID?: string;
  'Personal Data'?: PersonalData;
  Experiences?: Experience[];
  Projects?: Project[];
  Skills?: Skill[];
  'Research Work'?: ResearchWork[];
  Achievements?: string[];
  Education?: Education[];
  'Extracted Keywords'?: string[];
}

interface ResumePreviewProps {
  resumeData: ResumeData | null | undefined;
}

export default function ResumePreview({ resumeData }: ResumePreviewProps) {
  if (!resumeData) {
    return (
      <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600">
        <h3 className="text-xl font-semibold text-white mb-4">Resume Preview</h3>
        <p className="text-gray-400 text-center py-8">Upload your resume to see the preview here</p>
      </div>
    );
  }

  const personalData = resumeData['Personal Data'];
  const experiences = resumeData.Experiences;
  const projects = resumeData.Projects;
  const skills = resumeData.Skills;
  const researchWork = resumeData['Research Work'];
  const achievements = resumeData.Achievements;
  const education = resumeData.Education;

  // Helper function to format dates
  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate) return '';
    const start = startDate.substring(0, 7); // YYYY-MM
    const end = endDate === 'Present' ? 'Present' : endDate?.substring(0, 7);
    return `${start} - ${end || 'Present'}`;
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600 overflow-auto max-h-[70vh]">
      <h3 className="text-xl font-semibold text-white mb-4">Resume Preview</h3>
      <div className="space-y-4 text-gray-300">
        {/* Personal Data */}
        {personalData && (
          <div>
            {(personalData.firstName || personalData.lastName) && (
              <p className="text-lg font-semibold text-white">
                {[personalData.firstName, personalData.lastName].filter(Boolean).join(' ')}
              </p>
            )}
            {personalData.title && (
              <p className="text-sm text-gray-400 italic">{personalData.title}</p>
            )}
            {personalData.email && <p className="text-sm text-gray-400">{personalData.email}</p>}
            {personalData.phone && <p className="text-sm text-gray-400">{personalData.phone}</p>}
            {personalData.location && (
              <p className="text-sm text-gray-400">
                {[personalData.location.city, personalData.location.country].filter(Boolean).join(', ')}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {personalData.linkedin && (
                <a href={personalData.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
                  LinkedIn
                </a>
              )}
              {personalData.portfolio && (
                <a href={personalData.portfolio} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
                  Portfolio
                </a>
              )}
            </div>
          </div>
        )}

        {/* Experience */}
        {experiences && experiences.length > 0 && (
          <div className="pt-4 border-t border-gray-600">
            <strong className="text-white block mb-2">Experience:</strong>
            <div className="space-y-3">
              {experiences.map((exp, index) => {
                const hasJobTitle = exp.jobTitle;
                const hasCompany = exp.company;
                const hasDates = exp.startDate || exp.endDate;
                const descriptions = exp.description || [];
                const technologies = exp.technologiesUsed || [];
                
                // Skip rendering if no meaningful data exists
                if (!hasJobTitle && !hasCompany && !hasDates && !descriptions.length && !technologies.length) {
                  return null;
                }
                
                return (
                  <div key={index} className="text-sm">
                    {hasJobTitle && (
                      <p className="font-medium text-white">{exp.jobTitle}</p>
                    )}
                    {hasCompany && (
                      <p className="text-gray-400">
                        {exp.company} {exp.location && `• ${exp.location}`}
                      </p>
                    )}
                    {hasDates && (
                      <p className="text-gray-500 text-xs">{formatDateRange(exp.startDate, exp.endDate)}</p>
                    )}
                    {descriptions.length > 0 && (
                      <ul className="list-disc list-inside mt-1 text-gray-300 space-y-1">
                        {descriptions.slice(0, 2).map((desc, i) => (
                          <li key={i} className="text-xs">
                            {desc}
                          </li>
                        ))}
                        {descriptions.length > 2 && (
                          <li className="text-xs text-gray-400">
                            +{descriptions.length - 2} more
                          </li>
                        )}
                      </ul>
                    )}
                    {technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {technologies.map((tech, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-purple-600/20 text-purple-300 rounded text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div className="pt-4 border-t border-gray-600">
            <strong className="text-white block mb-2">Education:</strong>
            <div className="space-y-3">
              {education.map((edu, index) => (
                <div key={index} className="text-sm">
                  <p className="font-medium text-white">{edu.degree}</p>
                  <p className="text-gray-400">{edu.institution}</p>
                  {edu.fieldOfStudy && (
                    <p className="text-gray-400 text-xs">{edu.fieldOfStudy}</p>
                  )}
                  {(edu.startDate || edu.endDate) && (
                    <p className="text-gray-500 text-xs">{formatDateRange(edu.startDate, edu.endDate)}</p>
                  )}
                  {edu.grade && (
                    <p className="text-gray-400 text-xs">Grade: {edu.grade}</p>
                  )}
                  {edu.description && (
                    <p className="text-gray-400 text-xs mt-1">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div className="pt-4 border-t border-gray-600">
            <strong className="text-white block mb-2">Projects:</strong>
            <div className="space-y-3">
              {projects.map((project, index) => (
                <div key={index} className="text-sm">
                  <p className="font-medium text-white">{project.projectName}</p>
                  {(project.startDate || project.endDate) && (
                    <p className="text-gray-500 text-xs">{formatDateRange(project.startDate, project.endDate)}</p>
                  )}
                  {project.description && (
                    <p className="text-gray-300 text-xs mt-1">{project.description}</p>
                  )}
                  {project.technologiesUsed && project.technologiesUsed.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologiesUsed.map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-blue-600/20 text-blue-300 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {project.link && (
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-blue-400 hover:underline mt-1 inline-block"
                    >
                      View Project
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div className="pt-4 border-t border-gray-600">
            <strong className="text-white block mb-2">Skills:</strong>
            <div className="space-y-2">
              {Object.entries(
                skills.reduce((acc, skill) => {
                  const category = skill.category || 'Other';
                  if (!acc[category]) acc[category] = [];
                  if (skill.skillName) acc[category].push(skill.skillName);
                  return acc;
                }, {} as Record<string, string[]>)
              ).map(([category, skillNames]) => (
                <div key={category}>
                  <p className="text-xs font-medium text-gray-400 mb-1">{category}:</p>
                  <div className="flex flex-wrap gap-1">
                    {skillNames.map((skillName, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-600/20 text-green-300 rounded text-xs"
                      >
                        {skillName}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Research Work */}
        {researchWork && researchWork.length > 0 && (
          <div className="pt-4 border-t border-gray-600">
            <strong className="text-white block mb-2">Research Work:</strong>
            <div className="space-y-3">
              {researchWork.map((research, index) => (
                <div key={index} className="text-sm">
                  {research.title && (
                    <p className="font-medium text-white">{research.title}</p>
                  )}
                  {research.publication && (
                    <p className="text-gray-400 italic text-xs">{research.publication}</p>
                  )}
                  {research.date && (
                    <p className="text-gray-500 text-xs">{research.date}</p>
                  )}
                  {research.description && (
                    <p className="text-gray-300 text-xs mt-1">{research.description}</p>
                  )}
                  {research.link && (
                    <a 
                      href={research.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-blue-400 hover:underline mt-1 inline-block"
                    >
                      View Research
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {achievements && achievements.length > 0 && (
          <div className="pt-4 border-t border-gray-600">
            <strong className="text-white block mb-2">Achievements:</strong>
            <ul className="list-disc list-inside space-y-1">
              {achievements.map((achievement, index) => (
                <li key={index} className="text-sm text-gray-300">
                  {achievement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Success Message */}
        <div className="mt-4 pt-4 border-t border-gray-600">
          <p className="text-green-400 text-sm">✓ Resume processed successfully</p>
          <p className="text-gray-400 text-sm mt-1">Ready to add job descriptions</p>
        </div>
      </div>
    </div>
  );
}
