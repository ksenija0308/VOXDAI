import { useState } from 'react';
import { FormData } from '../App';
import FormLayout from './FormLayout';

interface SpeakerExperienceScreenProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  nextScreen: () => void;
  prevScreen: () => void;
  goToScreen: (screen: number) => void;
  progress: number;
}

const speakingFormatOptions = [
  'Keynote',
  'Panel Discussion',
  'Workshop',
  'Fireside Chat',
  'Breakout Session',
  'Webinar',
  'Moderation',
  'MC/Host',
];

const experienceOptions = [
  '0-2 years',
  '3-5 years',
  '6-10 years',
  '10+ years',
];

export default function SpeakerExperienceScreen({
  formData,
  updateFormData,
  nextScreen,
  prevScreen,
  goToScreen,
  progress,
}: SpeakerExperienceScreenProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (formData.speakingFormats.length === 0) {
      newErrors.speakingFormats = 'Please select at least one speaking format';
    }

    if (!formData.yearsOfExperience) {
      newErrors.yearsOfExperience = 'Please select your years of experience';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      nextScreen();
    }
  };

  const toggleFormat = (format: string) => {
    const newFormats = formData.speakingFormats.includes(format)
      ? formData.speakingFormats.filter((f) => f !== format)
      : [...formData.speakingFormats, format];
    updateFormData({ speakingFormats: newFormats });
  };

  return (
    <FormLayout
      currentStep={4}
      totalSteps={8}
      onPrev={prevScreen}
      onNext={handleContinue}
      onSaveExit={() => goToScreen(0)}
      progress={progress}
      title="Speaking Experience"
      subtitle="Tell us about your speaking experience to help organizers understand your expertise"
    >
      <div>
        {/* Speaking Formats */}
        <div className="mb-6">
          <label className="block mb-2">
            Speaking Formats <span className="text-[#d4183d]">*</span>
          </label>
          <p className="text-[#717182] mb-3" style={{ fontSize: '14px' }}>
            Select all formats you're comfortable with
          </p>
          <div className="flex flex-wrap gap-2">
            {speakingFormatOptions.map((format) => (
              <button
                key={format}
                onClick={() => toggleFormat(format)}
                className={`px-4 py-2 rounded-full border transition-colors ${
                  formData.speakingFormats.includes(format)
                    ? 'bg-[#0B3B2E] text-white border-[#0B3B2E]'
                    : 'bg-white text-black border-[#d1d5dc] hover:border-[#0B3B2E]'
                }`}
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '500' }}
              >
                {format}
              </button>
            ))}
          </div>
          {errors.speakingFormats && (
            <p className="text-[#d4183d] mt-2" style={{ fontSize: '14px' }}>{errors.speakingFormats}</p>
          )}
        </div>

        {/* Years of Experience */}
        <div className="mb-6">
          <label className="block mb-2">
            Years of Speaking Experience <span className="text-[#d4183d]">*</span>
          </label>
          <p className="text-[#717182] mb-3" style={{ fontSize: '14px' }}>
            How long have you been speaking professionally?
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {experienceOptions.map((option) => (
              <button
                key={option}
                onClick={() => updateFormData({ yearsOfExperience: option })}
                className={`px-4 py-3 rounded-lg border transition-colors ${
                  formData.yearsOfExperience === option
                    ? 'bg-[#0B3B2E] text-white border-[#0B3B2E]'
                    : 'bg-white text-black border-[#d1d5dc] hover:border-[#0B3B2E]'
                }`}
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '500' }}
              >
                {option}
              </button>
            ))}
          </div>
          {errors.yearsOfExperience && (
            <p className="text-[#d4183d] mt-2" style={{ fontSize: '14px' }}>{errors.yearsOfExperience}</p>
          )}
        </div>

        {/* Past Engagements */}
        <div className="mb-6">
          <label className="block mb-2">Number of Past Speaking Engagements (optional)</label>
          <p className="text-[#717182] mb-3" style={{ fontSize: '14px' }}>
            Approximately how many times have you spoken at events?
          </p>
          <input
            type="number"
            min="0"
            value={formData.pastEngagements || ''}
            onChange={(e) => updateFormData({ pastEngagements: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-[#d1d5dc] rounded-lg focus:outline-none focus:border-[#0B3B2E]"
            placeholder="e.g., 25"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
          />
        </div>

        {/* Notable Clients */}
        <div className="mb-6">
          <label className="block mb-2">Notable Clients or Events (optional)</label>
          <p className="text-[#717182] mb-3" style={{ fontSize: '14px' }}>
            List well-known organizations or events where you've spoken
          </p>
          <textarea
            value={formData.notableClients}
            onChange={(e) => updateFormData({ notableClients: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border border-[#d1d5dc] rounded-lg focus:outline-none focus:border-[#0B3B2E] resize-none"
            placeholder="e.g., TEDx, Google, Microsoft, Web Summit, SXSW..."
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
          />
          <p className="text-[#99a1af] mt-2" style={{ fontSize: '14px' }}>
            This helps build credibility with event organizers
          </p>
        </div>
      </div>
    </FormLayout>
  );
}