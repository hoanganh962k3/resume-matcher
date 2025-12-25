import React, { useState } from 'react';

interface ResumePreviewProps {
	resumeData: any;
}

export default function ResumePreview({ resumeData }: ResumePreviewProps) {
	const [expandedExperience, setExpandedExperience] = useState<Record<number, boolean>>({});
	const [showAllSkills, setShowAllSkills] = useState(false);
	
	if (!resumeData) {
		return (
			<div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600">
				<h3 className="text-xl font-semibold text-white mb-4">Resume Preview</h3>
				<p className="text-gray-400 text-center py-8">
					Upload your resume to see the preview here
				</p>
			</div>
		);
	}

	const { personalInfo, workExperience, education, additional } = resumeData;

	return (
		<div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600 overflow-auto max-h-[70vh]">
			<h3 className="text-xl font-semibold text-white mb-4">Resume Preview</h3>
			<div className="space-y-4 text-gray-300">
				{/* Personal Info */}
				{personalInfo && (
					<div>
						<p className="text-lg font-semibold text-white">
							{personalInfo.firstName} {personalInfo.lastName}
						</p>
						{personalInfo.email && (
							<p className="text-sm text-gray-400">{personalInfo.email}</p>
						)}
						{personalInfo.phone && (
							<p className="text-sm text-gray-400">{personalInfo.phone}</p>
						)}
						{personalInfo.location && (
							<p className="text-sm text-gray-400">
								{personalInfo.location.city}, {personalInfo.location.country}
							</p>
						)}
					</div>
				)}

				{/* Experience */}
				{workExperience && workExperience.length > 0 && (
					<div className="pt-4 border-t border-gray-600">
						<strong className="text-white block mb-2">Experience:</strong>
						<div className="space-y-3">
							{workExperience.map((exp: any, index: number) => (
								<div key={index} className="text-sm">
									<p className="font-medium text-white">{exp.jobTitle || exp.position}</p>
									<p className="text-gray-400">
										{exp.company} {exp.location && `• ${exp.location}`}
									</p>
									<p className="text-gray-500 text-xs">
										{exp.startDate} - {exp.endDate || 'Present'}
									</p>
									{exp.responsibilities && (
										<ul className="list-disc list-inside mt-1 text-gray-300 space-y-1">
											{exp.responsibilities.slice(0, 2).map((resp: string, i: number) => (
												<li key={i} className="text-xs">{resp}</li>
											))}
											{exp.responsibilities.length > 2 && (
												<li className="text-xs text-gray-400">+{exp.responsibilities.length - 2} more</li>
											)}
										</ul>
									)}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Education */}
				{education && education.length > 0 && (
					<div className="pt-4 border-t border-gray-600">
						<strong className="text-white block mb-2">Education:</strong>
						<div className="space-y-3">
							{education.map((edu: any, index: number) => (
								<div key={index} className="text-sm">
									<p className="font-medium text-white">{edu.degree}</p>
									<p className="text-gray-400">{edu.institution}</p>
									{edu.graduationDate && (
										<p className="text-gray-500 text-xs">{edu.graduationDate}</p>
									)}
									{edu.gpa && (
										<p className="text-gray-400 text-xs">GPA: {edu.gpa}</p>
									)}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Skills */}
				{additional?.skills && additional.skills.length > 0 && (
					<div className="pt-4 border-t border-gray-600">
						<strong className="text-white">Skills:</strong>
						<div className="flex flex-wrap gap-2 mt-2">
							{additional.skills.slice(0, 10).map((skill: any, index: number) => (
								<span
									key={index}
									className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-sm"
								>
									{skill.skillName || skill}
								</span>
							))}
							{additional.skills.length > 10 && (
								<span className="px-2 py-1 text-gray-400 text-sm">
									+{additional.skills.length - 10} more
								</span>
							)}
						</div>
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
