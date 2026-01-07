'use client';

import { useState, useEffect } from 'react';
import { fetchMyResumes } from '@/lib/api/resume';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Loader2 } from 'lucide-react';

interface ResumeSelectorProps {
  onResumeSelect: (resumeId: string, resumeData: any) => void;
  selectedResumeId?: string;
}

export default function ResumeSelector({ onResumeSelect, selectedResumeId }: ResumeSelectorProps) {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMyResumes();
      setResumes(data);
    } catch (err) {
      console.error('Failed to load resumes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeChange = (resumeId: string) => {
    const resume = resumes.find((r) => r.resume_id === resumeId);
    if (resume) {
      onResumeSelect(resumeId, resume);
    }
  };

  const getResumeLabel = (resume: any) => {
    const personalData = resume.processed_resume?.personal_data;
    const name = personalData?.name || 
                 personalData?.full_name || 
                 (personalData?.firstName && personalData?.lastName 
                   ? `${personalData.firstName} ${personalData.lastName}` 
                   : personalData?.firstName) || 
                 'Unnamed Resume';
    const title = personalData?.title;
    const nameWithTitle = title ? `${name} (${title})` : name;
    const date = new Date(resume.raw_resume.created_at).toLocaleDateString();
    return `${nameWithTitle} - ${date}`;
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
        <span className="text-gray-300">Loading your resumes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 rounded-lg border border-red-800">
        <p className="text-red-400">{error}</p>
        <Button onClick={loadResumes} variant="outline" size="sm" className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <p className="text-gray-300">No resumes found. Upload your first resume below.</p>
      </div>
    );
  }

  const getResumeDisplayText = (resume: any) => {
    const personalData = resume.processed_resume?.personal_data;
    const name = personalData?.name || 
           personalData?.full_name || 
           (personalData?.firstName && personalData?.lastName 
             ? `${personalData.firstName} ${personalData.lastName}` 
             : personalData?.firstName) || 
           'Unnamed Resume';
    const title = personalData?.title;
    return title ? `${name} (${title})` : name;
  };

  return (
    <div className="w-full space-y-2">
      <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Select a Resume
      </label>

      {/* Show currently selected resume */}
      {selectedResumeId && (
        <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-md">
          <p className="text-xs text-blue-300 mb-1">Currently Selected:</p>
          <p className="text-sm text-white font-medium">
            {getResumeDisplayText(resumes.find((r) => r.resume_id === selectedResumeId))}
          </p>
        </div>
      )}

      <Select value={selectedResumeId} onValueChange={handleResumeChange}>
        <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
          <SelectValue placeholder="Choose from your uploaded resumes..." />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          {resumes.map((resume) => (
            <SelectItem
              key={resume.resume_id}
              value={resume.resume_id}
              className="text-gray-200 hover:bg-gray-700"
            >
              {getResumeLabel(resume)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-400">
        {resumes.length} resume{resumes.length !== 1 ? 's' : ''} available
      </p>
    </div>
  );
}
