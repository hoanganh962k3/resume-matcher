import React, { useState } from 'react';
import { CheckCircle, XCircle, TrendingUp } from 'lucide-react';

interface SkillComparison {
	skill: string;
	resume_mentions: number;
	job_mentions: number;
	match_status: 'perfect' | 'partial' | 'missing';
}

interface JobComparisonCardProps {
	jobTitle: string;
	company: string;
	originalScore: number;
	newScore: number;
	matchedSkills: string[];
	missingSkills: string[];
	skillComparison?: SkillComparison[];
	isProcessing?: boolean;
	onClick?: () => void;
}

export default function JobComparisonCard({
	jobTitle,
	company,
	originalScore,
	newScore,
	matchedSkills,
	missingSkills,
	skillComparison = [],
	isProcessing = false,
	onClick
}: JobComparisonCardProps) {
	const [showAllMatched, setShowAllMatched] = useState(false);
	const [showAllMissing, setShowAllMissing] = useState(false);
	
	const scoreImprovement = newScore - originalScore;
	const originalPct = Math.round(originalScore * 100);
	const newPct = Math.round(newScore * 100);

	if (isProcessing) {
		return (
			<div className="bg-gray-900/70 p-6 rounded-lg border border-gray-800/50">
				<div className="flex items-center justify-center py-8">
					<svg
						className="animate-spin h-8 w-8 text-blue-500"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
					<span className="ml-3 text-gray-300">Analyzing job...</span>
				</div>
			</div>
		);
	}

	return (
		<div 
			className="bg-gray-900/70 p-6 rounded-lg border border-gray-800/50 transition-all hover:border-gray-700"
		>
			{/* Header */}
			<div className="mb-6">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<h3 className="text-xl font-semibold text-white mb-1">{jobTitle}</h3>
						<p className="text-gray-400">{company}</p>
					</div>

					<div className="text-2xl font-bold text-white">{originalPct}%</div>
				</div>
				<div className="bg-gray-800/50 p-4 rounded-lg">
					<div className="text-xs text-gray-400 mb-1">Improved Score</div>
					<div className="text-2xl font-bold text-green-400">{newPct}%</div>
					{scoreImprovement > 0 && (
						<div className="flex items-center text-xs text-green-400 mt-1">
							<TrendingUp className="h-3 w-3 mr-1" />
							+{Math.round(scoreImprovement * 100)}%
						</div>
					)}
				</div>
			</div>

			{/* Match Progress Bar */}
			<div className="mb-6">
				<div className="flex justify-between text-xs text-gray-400 mb-2">
					<span>Match Quality</span>
					<span>{newPct}%</span>
				</div>
				<div className="w-full bg-gray-800 rounded-full h-2">
					<div
						className={`h-2 rounded-full transition-all ${
							newPct >= 80 ? 'bg-green-500' : newPct >= 60 ? 'bg-yellow-500' : 'bg-red-500'
						}`}
						style={{ width: `${newPct}%` }}
					/>
				</div>
			</div>

			{/* Matched Skills */}
			<div className="mb-4">
				<div className="flex items-center text-sm font-medium text-gray-300 mb-2">
					<CheckCircle className="h-4 w-4 mr-2 text-green-400" />
					Matched Skills ({matchedSkills.length})
				</div>
				<div className="flex flex-wrap gap-1">
				{(showAllMatched ? matchedSkills : matchedSkills.slice(0, 10)).map((skill, idx) => (
					<span key={idx} className="px-2 py-1 bg-green-600/20 text-green-300 rounded text-xs">
						{skill}
					</span>
				))}
				{matchedSkills.length > 10 && (
					<button
						onClick={(e) => { e.stopPropagation(); setShowAllMatched(!showAllMatched); }}
						className="px-2 py-1 text-blue-400 hover:text-blue-300 text-xs underline cursor-pointer"
					>
						{showAllMatched ? 'Show less' : `+${matchedSkills.length - 10} more`}
					</button>
				)}
			</div>
		</div>

			{/* Missing Skills */}
			{missingSkills.length > 0 && (
				<div className="mb-4">
					<div className="flex items-center text-sm font-medium text-gray-300 mb-2">
						<XCircle className="h-4 w-4 mr-2 text-red-400" />
						Missing Skills ({missingSkills.length})
					</div>
					<div className="flex flex-wrap gap-1">
						{(showAllMissing ? missingSkills : missingSkills.slice(0, 8)).map((skill, idx) => (
							<span key={idx} className="px-2 py-1 bg-red-600/20 text-red-300 rounded text-xs">
								{skill}
							</span>
						))}
						{missingSkills.length > 8 && (
							<button
								onClick={(e) => { e.stopPropagation(); setShowAllMissing(!showAllMissing); }}
								className="px-2 py-1 text-blue-400 hover:text-blue-300 text-xs underline cursor-pointer"
							>
								{showAllMissing ? 'Show less' : `+${missingSkills.length - 8} more`}
							</button>
						)}
					</div>
				</div>
			)}

			{/* Skill Comparison Details */}
			{skillComparison.length > 0 && (
				<div className="mt-4 pt-4 border-t border-gray-800">
					<div className="text-xs font-medium text-gray-400 mb-2">Top Skills Analysis</div>
					<div className="space-y-2">
						{skillComparison.slice(0, 5).map((item, idx) => (
							<div key={idx} className="flex justify-between items-center text-xs">
								<span className="text-gray-300">{item.skill}</span>
								<div className="flex items-center gap-2">
									<span className="text-gray-500">
										Resume: {item.resume_mentions}
									</span>
									<span className="text-gray-500">|</span>
									<span className="text-gray-400">
										Job: {item.job_mentions}
									</span>
									<span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${
										item.match_status === 'perfect' ? 'bg-green-600/20 text-green-400' :
										item.match_status === 'partial' ? 'bg-yellow-600/20 text-yellow-400' :
										'bg-red-600/20 text-red-400'
									}`}>
										{item.match_status}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* View Details Button */}
			{onClick && (
				<div className="mt-4 pt-4 border-t border-gray-800">
					<button
						onClick={onClick}
						className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
					>
						View Detailed Analysis
					</button>
				</div>
			)}
		</div>
	);
}
