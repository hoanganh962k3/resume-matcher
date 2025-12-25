import React from 'react';
import { Building2, MapPin, Calendar, Briefcase, Tag } from 'lucide-react';

interface JobPreviewProps {
	jobData: {
		job_title: string;
		company_profile?: any;
		location?: any;
		date_posted?: string | null;
		employment_type?: string | null;
		job_summary: string;
		key_responsibilities?: any;
		qualifications?: any;
		extracted_keywords?: any;
	} | null;
}

export default function JobPreview({ jobData }: JobPreviewProps) {
	if (!jobData) {
		return (
			<div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600">
				<h3 className="text-xl font-semibold text-white mb-4">Job Preview</h3>
				<p className="text-gray-400 text-center py-8">
					Job preview will appear here after submission
				</p>
			</div>
		);
	}

	// Parse JSON fields if they're strings
	const companyProfile = typeof jobData.company_profile === 'string' 
		? JSON.parse(jobData.company_profile) 
		: jobData.company_profile;
	const location = typeof jobData.location === 'string' 
		? JSON.parse(jobData.location) 
		: jobData.location;
	const keyResponsibilities = typeof jobData.key_responsibilities === 'string'
		? JSON.parse(jobData.key_responsibilities)
		: jobData.key_responsibilities;
	const qualifications = typeof jobData.qualifications === 'string'
		? JSON.parse(jobData.qualifications)
		: jobData.qualifications;
	const extractedKeywords = typeof jobData.extracted_keywords === 'string'
		? JSON.parse(jobData.extracted_keywords)
		: jobData.extracted_keywords;

	const companyName = companyProfile?.companyName || companyProfile?.company_name || 'Company Name Not Available';
	const locationStr = location
		? `${location.city || ''}${location.city && location.country ? ', ' : ''}${location.country || ''}`
		: 'Location Not Specified';

	const responsibilities = keyResponsibilities?.key_responsibilities || keyResponsibilities || [];
	const quals = qualifications?.required || qualifications?.qualifications || qualifications || [];
	const keywords = extractedKeywords?.extracted_keywords || extractedKeywords || [];

	return (
		<div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600 overflow-auto max-h-[70vh]">
			<h2 className="text-2xl font-bold text-white mb-4">{jobData.job_title}</h2>
			<div className="flex flex-col gap-2 text-sm text-gray-400 mb-6">
				<div className="flex items-center gap-2">
					<Building2 className="h-4 w-4" />
					<span>{companyName}</span>
				</div>
				{locationStr && (
					<div className="flex items-center gap-2">
						<MapPin className="h-4 w-4" />
						<span>{locationStr}</span>
					</div>
				)}
				{jobData.date_posted && (
					<div className="flex items-center gap-2">
						<Calendar className="h-4 w-4" />
						<span>Posted: {new Date(jobData.date_posted).toLocaleDateString()}</span>
					</div>
				)}
				{jobData.employment_type && (
					<div className="flex items-center gap-2">
						<Briefcase className="h-4 w-4" />
						<span>{jobData.employment_type}</span>
					</div>
				)}
			</div>

			<div className="space-y-6">
				{/* Job Summary */}
				{jobData.job_summary && (
					<div>
						<h3 className="text-lg font-semibold text-white mb-2">Summary</h3>
						<p className="text-gray-300 text-sm leading-relaxed">{jobData.job_summary}</p>
					</div>
				)}

				{/* Key Responsibilities */}
				{responsibilities && responsibilities.length > 0 && (
					<div>
						<h3 className="text-lg font-semibold text-white mb-2">Key Responsibilities</h3>
						<ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
							{responsibilities.slice(0, 5).map((resp: string, idx: number) => (
								<li key={idx}>{resp}</li>
							))}
							{responsibilities.length > 5 && (
								<li className="text-gray-400">+{responsibilities.length - 5} more...</li>
							)}
						</ul>
					</div>
				)}

				{/* Qualifications */}
				{quals && quals.length > 0 && (
					<div>
						<h3 className="text-lg font-semibold text-white mb-2">Qualifications</h3>
						<ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
							{quals.slice(0, 5).map((qual: string, idx: number) => (
								<li key={idx}>{qual}</li>
							))}
							{quals.length > 5 && (
								<li className="text-gray-400">+{quals.length - 5} more...</li>
							)}
						</ul>
					</div>
				)}

				{/* Extracted Keywords */}
				{keywords && keywords.length > 0 && (
					<div>
						<h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
							<Tag className="h-5 w-5" />
							Key Skills & Technologies
						</h3>
						<div className="flex flex-wrap gap-2">
							{keywords.slice(0, 15).map((keyword: string, idx: number) => (
								<span
									key={idx}
									className="px-3 py-1 bg-blue-600/20 border border-blue-500/40 rounded-full text-blue-300 text-xs"
								>
									{keyword}
								</span>
							))}
							{keywords.length > 15 && (
								<span className="px-3 py-1 text-gray-400 text-xs">
									+{keywords.length - 15} more
								</span>
							)}
						</div>
					</div>
				)}

				<div className="mt-4 pt-4 border-t border-gray-600">
					<p className="text-green-400 text-sm">✓ Job processed successfully</p>
					<p className="text-gray-400 text-sm mt-1">Ready to improve resume</p>
				</div>
			</div>
		</div>
	);
}
