import { useState } from 'react';
import { FormData } from "@/types/formData.ts";
import FormLayout from './FormLayout';
import svgPaths from '../../imports/svg-5axqc4zoph';

interface SpeakerBasicsScreenProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  nextScreen: () => void;
  prevScreen: () => void;
  goToScreen: (screen: number) => void;
  progress: number;
  prevDisabled?: boolean;
}

export default function SpeakerBasicsScreen({
  formData,
  updateFormData,
  nextScreen,
  prevScreen,
  goToScreen,
  progress,
  prevDisabled = false,
}: SpeakerBasicsScreenProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleLinkedInImport = async () => {
    setIsImporting(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Fill form with sample LinkedIn data
    updateFormData({
      firstName: 'Sarah',
      lastName: 'Johnson',
      professionalTitle: 'Technology Innovation Speaker | AI & Digital Transformation Expert',
      bio: 'Sarah Johnson is a globally recognized speaker and thought leader in technology innovation, artificial intelligence, and digital transformation. With over 15 years of experience leading digital initiatives at Fortune 500 companies, she brings real-world insights and actionable strategies to every presentation.\n\nAs former Chief Innovation Officer at TechCorp Global, Sarah spearheaded the company\'s AI transformation journey, resulting in a 40% increase in operational efficiency. Her engaging speaking style combines data-driven insights with compelling storytelling, making complex technical concepts accessible to diverse audiences.\n\nSarah has delivered keynotes at major industry conferences including Web Summit, CES, and SXSW, reaching audiences of over 50,000 attendees worldwide. Her TED talk on "The Human Side of AI" has been viewed over 2 million times.\n\nShe holds an MBA from Stanford Graduate School of Business and a Master\'s degree in Computer Science from MIT.',
      speakerLocation: 'United States',
      speakerCity: 'San Francisco',
    });

    setIsImporting(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData({ profilePhoto: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <FormLayout
      title=""
      currentStep={2}
      totalSteps={11}
      onNext={nextScreen}
      onPrev={prevScreen}
      onSaveExit={() => goToScreen(0)}
      prevDisabled={prevDisabled}
      progress={progress}
      hideHeader={true}
      hideFooter={true}
    >
      <div className="bg-gradient-to-br from-[#f9fafb] via-white to-[#f9fafb] min-h-screen relative w-full">
        {/* Minimal Header */}
        <div className="absolute top-8 left-8">
          <h1 className="font-['Arimo',sans-serif] font-bold text-[40px] tracking-[-0.8px]">VOXD</h1>
        </div>

        {/* Content */}
        <div className="max-w-[720px] mx-auto pt-32 pb-24 px-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-[24px] border border-[#e5e7eb]/50 shadow-[0px_20px_60px_-15px_rgba(0,0,0,0.08)] p-10">
            {/* Header */}
            <div className="mb-3">
              <h2 className="font-['Arimo',sans-serif] font-bold text-[32px] tracking-[-0.32px]">Basic Information</h2>
            </div>

            <p className="text-[#4a5565] text-[16px] mb-10">
              Tell us about yourself. You can import your information from LinkedIn or fill it manually.
            </p>

            {/* Import from LinkedIn */}
            <div className="bg-gradient-to-br from-[#0077b5] to-[#005582] border-0 rounded-[16px] p-5 mb-10 flex items-center justify-between shadow-[0px_8px_24px_-6px_rgba(0,119,181,0.3)] hover:shadow-[0px_12px_32px_-6px_rgba(0,119,181,0.4)] transition-all">
              <div>
                <h3 className="font-['Arimo',sans-serif] font-bold text-[24px] text-white">Import from LinkedIn</h3>
                <p className="text-white/80 text-[16px]">Automatically fill your profile with LinkedIn data</p>
              </div>
              <button
                className="bg-white text-[#0077b5] px-5 py-2.5 rounded-[12px] flex items-center gap-2 disabled:opacity-50 hover:bg-[#f0f9ff] transition-colors shadow-sm"
                onClick={handleLinkedInImport}
                disabled={isImporting}
              >
                {isImporting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-['Inter',sans-serif] font-semibold text-[16px]">Importing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                      <path d="M8 10V2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                      <path d={svgPaths.p23ad1400} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                      <path d={svgPaths.p19411800} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    </svg>
                    <span className="font-['Inter',sans-serif] font-semibold text-[16px]">Import</span>
                  </>
                )}
              </button>
            </div>

            {/* Profile Photo */}
            <div className="mb-10">
              <label className="block mb-3 font-['Inter',sans-serif] font-medium text-[14px]">
                Profile Photo <span className="text-[#e7000b]">*</span>
              </label>

              <div className="flex gap-6 items-start">
                {/* Photo Upload Circle */}
                <div className="relative group">
                  <label className="cursor-pointer">
                    <div className="w-32 h-32 rounded-full border-2 border-[#d1d5dc] overflow-hidden bg-gray-100 flex items-center justify-center group-hover:border-[#0b3b2e] transition-colors">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <img
                          src="a154ef5f8e9c9bba91eca0a43f8beb65ca7469a1.png"
                          alt="Default profile"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  {/* Upload icon button */}
                  <div className="absolute bottom-0 right-0 bg-[#0b3b2e] rounded-full w-10 h-10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                      <path d="M8 2V10" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                      <path d={svgPaths.p26e09a00} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                      <path d={svgPaths.p23ad1400} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    </svg>
                  </div>
                </div>

                {/* Photo Instructions */}
                <div>
                  <p className="text-[#4a5565] text-[16px] mb-2">
                    Upload a professional photo that represents you well. Recommended size: 400x400px.
                  </p>
                  <p className="text-[#6a7282] text-[16px]">
                    Accepted formats: JPG, PNG, GIF (max 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div className="mb-6">
              <label className="block mb-3 font-['Inter',sans-serif] font-medium text-[14px]">
                Full Name <span className="text-[#e7000b]">*</span>
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => updateFormData({ full_name: e.target.value })}
                placeholder="Sarah Johnson"
                className="w-full px-4 py-3.5 border border-[#d1d5dc] rounded-[12px] font-['Inter',sans-serif] text-[16px] text-[rgba(0,0,0,0.5)] focus:border-[#0b3b2e] focus:ring-2 focus:ring-[#0b3b2e]/10 transition-all outline-none"
              />
            </div>

            {/* Professional Headline */}
            <div className="mb-6">
              <label className="block mb-3 font-['Inter',sans-serif] font-medium text-[14px]">
                Professional Headline <span className="text-[#e7000b]">*</span>
              </label>
              <input
                type="text"
                value={formData.professionalTitle}
                onChange={(e) => updateFormData({ professionalTitle: e.target.value })}
                placeholder="Technology Innovation Speaker | AI & Digital Transformation Expert"
                className="w-full px-4 py-3.5 border border-[#d1d5dc] rounded-[12px] font-['Inter',sans-serif] text-[16px] text-[rgba(0,0,0,0.5)] focus:border-[#0b3b2e] focus:ring-2 focus:ring-[#0b3b2e]/10 transition-all outline-none"
              />
              <p className="text-[#6a7282] text-[16px] mt-2">
                A concise tagline that describes your expertise
              </p>
            </div>

            {/* Biography */}
            <div className="mb-8">
              <label className="block mb-3 font-['Inter',sans-serif] font-medium text-[14px]">
                Biography <span className="text-[#e7000b]">*</span>
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => updateFormData({ bio: e.target.value })}
                placeholder="Tell event organizers about your background, experience, and what makes you unique as a speaker..."
                rows={8}
                className="w-full px-4 py-3.5 border border-[#d1d5dc] rounded-[12px] font-['Inter',sans-serif] text-[16px] text-[rgba(0,0,0,0.5)] resize-none focus:border-[#0b3b2e] focus:ring-2 focus:ring-[#0b3b2e]/10 transition-all outline-none"
              />

              {/* Character count and Auto-fill button */}
              <div className="flex justify-between items-center mt-3">
                <p className="text-[#6a7282] text-[16px]">
                  {formData.bio.length} characters (recommended: up to 1000)
                </p>
                <button className="flex items-center gap-2 text-[#0b3b2e] font-['Inter',sans-serif] font-medium text-[16px] hover:text-[#0b3b2e]/80 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                    <path d={svgPaths.pca5b500} stroke="#0B3B2E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d="M13.3333 1.33333V4" stroke="#0B3B2E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d="M14.6667 2.66667H12" stroke="#0B3B2E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d={svgPaths.p22966600} stroke="#0B3B2E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                  </svg>
                  Auto-fill Biography
                </button>
              </div>
            </div>

            {/* Pro Tip Box */}
            <div className="bg-gradient-to-br from-[rgba(11,59,46,0.04)] to-[rgba(11,59,46,0.08)] border border-[rgba(11,59,46,0.15)] rounded-[16px] p-5">
              <p className="text-[#0b3b2e] text-[16px]">
                <span className="font-['Inter',sans-serif] font-bold">Pro Tip:</span>{' '}
                Detailed biographies help event organisers understand your unique value. Aim for a comprehensive profile that showcases your expertise, experience, and speaking style!
              </p>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-between mt-8">
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
              Continue
            </button>
          </div>
        </div>
      </div>
    </FormLayout>
  );
}
