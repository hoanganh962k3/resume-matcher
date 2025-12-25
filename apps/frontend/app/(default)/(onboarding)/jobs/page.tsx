import JobDescriptionUploadTextArea from '@/components/jd-upload/text-area';
import BackgroundContainer from '@/components/common/background-container';
import ApiKeyMenu from '@/components/settings/api-key-menu';
import { Suspense } from 'react';

const ProvideJobDescriptionsPage = () => {
	return (
		<BackgroundContainer innerClassName="items-stretch justify-start py-8 overflow-y-auto">
			<div className="flex w-full max-w-7xl flex-col gap-8 mx-auto px-4 pb-8">
				<div className="self-end">
					<ApiKeyMenu />
				</div>
				<div className="flex flex-col items-center text-center gap-4">
					<h1 className="text-4xl font-bold text-white">
						Provide Job Description
					</h1>
					<p className="text-gray-300 text-lg max-w-2xl">
						Paste your job description below. We'll analyze it and show you how well your resume matches.
					</p>
				</div>
				<Suspense fallback={<div className="text-gray-300 text-center">Loading...</div>}>
					<JobDescriptionUploadTextArea />
				</Suspense>
			</div>
		</BackgroundContainer>
	);
};

export default ProvideJobDescriptionsPage;
