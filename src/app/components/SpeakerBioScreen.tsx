import { useState } from 'react';
import { FormData } from '../App';
import FormLayout from './FormLayout';

interface SpeakerBioScreenProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  nextScreen: () => void;
  prevScreen: () => void;
  goToScreen: (screen: number) => void;
  progress: number;
}

export default function SpeakerBioScreen({
  formData,
  updateFormData,
  nextScreen,
  prevScreen,
  goToScreen,
  progress,
}: SpeakerBioScreenProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.bio.trim()) {
      newErrors.bio = 'Professional bio is required';
    } else if (formData.bio.length < 100) {
      newErrors.bio = 'Bio must be at least 100 characters';
    } else if (formData.bio.length > 1000) {
      newErrors.bio = 'Bio must be 1000 characters or less';
    }

    // Validate URLs if provided
    const urlPattern = /^https?:\/\/.+/;
    
    if (formData.speakerWebsite && !urlPattern.test(formData.speakerWebsite)) {
      newErrors.speakerWebsite = 'Please enter a valid URL (starting with http:// or https://)';
    }

    if (formData.speakerLinkedIn && !formData.speakerLinkedIn.includes('linkedin.com')) {
      newErrors.speakerLinkedIn = 'Please enter a valid LinkedIn URL';
    }

    if (formData.demoVideoUrl && !urlPattern.test(formData.demoVideoUrl)) {
      newErrors.demoVideoUrl = 'Please enter a valid URL (starting with http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      nextScreen();
    }
  };

  return (
    <FormLayout
      currentStep={5}
      totalSteps={8}
      onPrev={prevScreen}
      onNext={handleContinue}
      onSaveExit={() => goToScreen(0)}
      progress={progress}
      title="Bio & Portfolio"
      subtitle="Share your story and online presence to help organizers learn more about you"
    >
      <div>
        {/* Professional Bio */}
        <div className="mb-6">
          <label className="block mb-2">
            Professional Bio <span className="text-[#d4183d]">*</span>
          </label>
          <p className="text-[#717182] mb-3" style={{ fontSize: '14px' }}>
            Write a compelling bio that highlights your expertise, achievements, and what makes you a great speaker (100-1000 characters)
          </p>
          <textarea
            value={formData.bio}
            onChange={(e) => updateFormData({ bio: e.target.value })}
            rows={8}
            maxLength={1000}
            className="w-full px-4 py-3 border border-[#d1d5dc] rounded-lg focus:outline-none focus:border-[#0B3B2E] resize-none"
            placeholder="Share your professional background, key achievements, speaking style, and what audiences can expect from your talks..."
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
          />
          <div className="flex justify-between mt-2">
            <div>
              {errors.bio && (
                <p className="text-[#d4183d]" style={{ fontSize: '14px' }}>{errors.bio}</p>
              )}
            </div>
            <p className="text-[#99a1af]" style={{ fontSize: '14px' }}>
              {formData.bio.length}/1000
            </p>
          </div>
        </div>

        {/* Website */}
        <div className="mb-6">
          <label className="block mb-2">Website (optional)</label>
          <p className="text-[#717182] mb-3" style={{ fontSize: '14px' }}>
            Your personal website or portfolio
          </p>
          <input
            type="url"
            value={formData.speakerWebsite}
            onChange={(e) => updateFormData({ speakerWebsite: e.target.value })}
            className="w-full px-4 py-3 border border-[#d1d5dc] rounded-lg focus:outline-none focus:border-[#0B3B2E]"
            placeholder="https://www.yourwebsite.com"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
          />
          {errors.speakerWebsite && (
            <p className="text-[#d4183d] mt-2" style={{ fontSize: '14px' }}>{errors.speakerWebsite}</p>
          )}
        </div>

        {/* Demo Video */}
        <div className="mb-6">
          <label className="block mb-2">Demo Video URL (optional)</label>
          <p className="text-[#717182] mb-3" style={{ fontSize: '14px' }}>
            Link to a video showing you speaking (YouTube, Vimeo, etc.)
          </p>
          <input
            type="url"
            value={formData.demoVideoUrl}
            onChange={(e) => updateFormData({ demoVideoUrl: e.target.value })}
            className="w-full px-4 py-3 border border-[#d1d5dc] rounded-lg focus:outline-none focus:border-[#0B3B2E]"
            placeholder="https://www.youtube.com/watch?v=..."
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
          />
          {errors.demoVideoUrl && (
            <p className="text-[#d4183d] mt-2" style={{ fontSize: '14px' }}>{errors.demoVideoUrl}</p>
          )}
        </div>

        {/* Social Media Links */}
        <div className="mb-6">
          <label className="block mb-3">Social Media (optional)</label>
          <p className="text-[#717182] mb-4" style={{ fontSize: '14px' }}>
            Connect your social profiles to increase your credibility
          </p>

          {/* LinkedIn */}
          <div className="mb-4">
            <label className="block text-sm mb-2">LinkedIn</label>
            <input
              type="url"
              value={formData.speakerLinkedIn}
              onChange={(e) => updateFormData({ speakerLinkedIn: e.target.value })}
              className="w-full px-4 py-3 border border-[#d1d5dc] rounded-lg focus:outline-none focus:border-[#0B3B2E]"
              placeholder="https://www.linkedin.com/in/yourprofile"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
            />
            {errors.speakerLinkedIn && (
              <p className="text-[#d4183d] mt-2" style={{ fontSize: '14px' }}>{errors.speakerLinkedIn}</p>
            )}
          </div>

          {/* Twitter */}
          <div className="mb-4">
            <label className="block text-sm mb-2">Twitter / X</label>
            <input
              type="text"
              value={formData.speakerTwitter}
              onChange={(e) => updateFormData({ speakerTwitter: e.target.value })}
              className="w-full px-4 py-3 border border-[#d1d5dc] rounded-lg focus:outline-none focus:border-[#0B3B2E]"
              placeholder="@yourusername or https://twitter.com/yourusername"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
            />
          </div>

          {/* Instagram */}
          <div className="mb-4">
            <label className="block text-sm mb-2">Instagram</label>
            <input
              type="text"
              value={formData.speakerInstagram}
              onChange={(e) => updateFormData({ speakerInstagram: e.target.value })}
              className="w-full px-4 py-3 border border-[#d1d5dc] rounded-lg focus:outline-none focus:border-[#0B3B2E]"
              placeholder="@yourusername or https://instagram.com/yourusername"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
            />
          </div>

          {/* YouTube */}
          <div className="mb-4">
            <label className="block text-sm mb-2">YouTube</label>
            <input
              type="text"
              value={formData.speakerYoutube}
              onChange={(e) => updateFormData({ speakerYoutube: e.target.value })}
              className="w-full px-4 py-3 border border-[#d1d5dc] rounded-lg focus:outline-none focus:border-[#0B3B2E]"
              placeholder="https://youtube.com/@yourchannel"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
            />
          </div>
        </div>
      </div>
    </FormLayout>
  );
}