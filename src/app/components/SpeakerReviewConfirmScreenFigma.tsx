import { FormData } from '../App';
import FormLayout from './FormLayout';

interface SpeakerReviewConfirmScreenFigmaProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  nextScreen: () => void;
  prevScreen: () => void;
  goToScreen: (screen: number) => void;
  progress: number;
}

export default function SpeakerReviewConfirmScreenFigma({
  formData,
  updateFormData,
  nextScreen,
  prevScreen,
  goToScreen,
  progress,
}: SpeakerReviewConfirmScreenFigmaProps) {
  return (
    <FormLayout
      currentStep={11}
      totalSteps={11}
      onPrev={prevScreen}
      onNext={nextScreen}
      onSaveExit={() => goToScreen(0)}
      progress={progress}
      hideHeader={true}
      hideFooter={true}
    >
      <div className="bg-[#f9fafb] min-h-screen relative w-full">
        {/* Header */}
        <div className="bg-white border-b border-[#e5e7eb] px-6 py-4">
          <h1 className="font-['Arimo',sans-serif] font-bold text-[40px] tracking-[-0.8px]">VOXD</h1>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border-b border-black px-6 py-3">
          <div className="flex justify-between items-center mb-2">
            <p className="font-['Inter',sans-serif] text-[16px]">Profile Completion</p>
            <p className="font-['Inter',sans-serif] text-[16px] text-[#0b3b2e]">86%</p>
          </div>
          <div className="bg-[#e5e7eb] h-[12px] rounded-full overflow-hidden">
            <div className="bg-[#0b3b2e] h-full rounded-full" style={{ width: '86%' }} />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[672px] mx-auto my-12 bg-white rounded-[16px] border border-[#e5e7eb] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-6">
          {/* Header */}
          <div className="mb-2">
            <h2 className="font-['Arimo',sans-serif] font-bold text-[32px] tracking-[-0.32px]">Review & Confirm</h2>
          </div>

          <p className="text-[#4a5565] text-[16px] mb-8">
            Review your profile summary and accept our terms to complete your registration.
          </p>

          {/* Profile Summary Box */}
          <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-[10px] p-6 mb-8">
            <h3 className="font-['Arimo',sans-serif] font-bold text-[24px] mb-4">Profile Summary</h3>

            <div className="space-y-2">
              {/* Basic information completed */}
              <div className="flex gap-2">
                <span className="text-[#0b3b2e] text-[16px]">✓</span>
                <p className="text-[#364153] text-[16px]">Basic information completed</p>
              </div>

              {/* 1 topic selected */}
              <div className="flex gap-2">
                <span className="text-[#0b3b2e] text-[16px]">✓</span>
                <p className="text-[#364153] text-[16px]">1 topic selected</p>
              </div>

              {/* Video introduction (optional) */}
              <div className="flex gap-2">
                <span className="text-[#99a1af] text-[16px]">○</span>
                <p className="text-[#364153] text-[16px]">Video introduction (optional)</p>
              </div>

              {/* 1 availability period defined */}
              <div className="flex gap-2">
                <span className="text-[#0b3b2e] text-[16px]">✓</span>
                <p className="text-[#364153] text-[16px]">1 availability period defined</p>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="space-y-4 mb-4">
            {/* Terms checkbox */}
            <label className="flex gap-3 items-start">
              <div className="w-5 h-5 mt-1 border-2 border-gray-300 rounded" />
              <span className="font-['Inter',sans-serif] font-medium text-[14px]">
                I have read and agree to the{' '}
                <a href="#" className="text-[#0b3b2e] underline">Terms & Conditions</a>{' '}
                <span className="text-[#e7000b]">*</span>
              </span>
            </label>

            {/* Newsletter checkbox */}
            <label className="flex gap-3 items-start">
              <div className="w-5 h-5 mt-1 border-2 border-gray-300 rounded" />
              <span className="font-['Inter',sans-serif] font-medium text-[14px]">
                I want to receive the VOXD newsletter
              </span>
            </label>
          </div>

          {/* Error/Warning Box */}
          <div className="bg-[#fffbeb] border border-[#fee685] rounded-[10px] p-4">
            <p className="text-[#973c00] text-[16px]">
              You must accept the Terms & Conditions to complete your registration.
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="bg-white border-t border-[#e5e7eb] px-[111px] py-4">
          <div className="flex justify-between">
            <button
              onClick={prevScreen}
              className="border-2 border-[#d1d5dc] rounded-[12px] px-8 py-3.5 font-['Inter',sans-serif] font-medium text-[16px] text-[#4a5565] hover:border-[#0b3b2e] hover:text-[#0b3b2e] transition-all"
            >
              Back
            </button>
            <button
              onClick={nextScreen}
              className="bg-[#0b3b2e] rounded-[12px] px-8 py-3.5 font-['Inter',sans-serif] font-medium text-[16px] text-white hover:bg-[#0b3b2e]/90 shadow-lg hover:shadow-xl transition-all"
            >
              Submit Profile
            </button>
          </div>
        </div>
      </div>
    </FormLayout>
  );
}