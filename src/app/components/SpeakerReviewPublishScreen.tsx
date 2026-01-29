import { useState, useEffect, useMemo } from 'react';
import { FormData } from '../App';
import FormLayout from './FormLayout';

interface SpeakerReviewPublishScreenProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  nextScreen: () => void;
  prevScreen: () => void;
  goToScreen: (screen: number) => void;
  progress: number;
}

export default function SpeakerReviewPublishScreen({
  formData,
  updateFormData,
  nextScreen,
  prevScreen,
  goToScreen,
  progress,
}: SpeakerReviewPublishScreenProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Create profile photo URL with proper cleanup
  const profilePhotoUrl = useMemo(() => {
    if (formData.profilePhoto instanceof File) {
      return URL.createObjectURL(formData.profilePhoto);
    }
    return null;
  }, [formData.profilePhoto]);

  // Cleanup object URL on unmount or when photo changes
  useEffect(() => {
    return () => {
      if (profilePhotoUrl) {
        URL.revokeObjectURL(profilePhotoUrl);
      }
    };
  }, [profilePhotoUrl]);

  const handlePublish = () => {
    if (!formData.visibility) {
      setErrors({ visibility: 'Please select a visibility option' });
      return;
    }
    nextScreen();
  };

  return (
    <FormLayout
      currentStep={8}
      totalSteps={8}
      onPrev={prevScreen}
      onNext={handlePublish}
      nextLabel="Publish Profile"
      onSaveExit={() => goToScreen(0)}
      progress={progress}
      title="Review & Publish"
      subtitle="Review your profile and choose how you want to be discovered"
    >
      <div>
        {/* Profile Summary */}
        <div className="mb-8">
          <h3 
            className="mb-4"
            style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', fontSize: '20px' }}
          >
            Profile Summary
          </h3>

          {/* Basic Info */}
          <div className="bg-[#f9fafb] rounded-lg p-6 mb-4">
            <div className="flex items-start gap-4 mb-4">
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#d1d5dc] flex items-center justify-center">
                  <span className="text-2xl text-[#6a7282]">
                    {formData.firstName?.[0]}{formData.lastName?.[0]}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h4 
                  style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', fontSize: '18px' }}
                  className="mb-1"
                >
                  {formData.firstName} {formData.lastName}
                </h4>
                <p className="text-[#717182] mb-2" style={{ fontSize: '14px' }}>
                  {formData.professionalTitle}
                </p>
                <p className="text-[#4a5565]" style={{ fontSize: '14px' }}>
                  {formData.speakerCity}, {formData.speakerLocation}
                </p>
              </div>
              <button
                onClick={() => goToScreen(2)}
                className="text-[#0B3B2E] hover:underline"
                style={{ fontSize: '14px', fontWeight: '500' }}
              >
                Edit
              </button>
            </div>
            <p className="text-[#4a5565]" style={{ fontSize: '14px' }}>
              "{formData.speakerTagline}"
            </p>
          </div>

          {/* Topics */}
          <div className="bg-[#f9fafb] rounded-lg p-6 mb-4">
            <div className="flex justify-between items-start mb-3">
              <h4 style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', fontSize: '16px' }}>
                Topics & Expertise
              </h4>
              <button
                onClick={() => goToScreen(3)}
                className="text-[#0B3B2E] hover:underline"
                style={{ fontSize: '14px', fontWeight: '500' }}
              >
                Edit
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {[...formData.topics, ...formData.customTopics].map((topic) => (
                <span
                  key={topic}
                  className="px-3 py-1 bg-[#0B3B2E] text-white rounded-full"
                  style={{ fontSize: '14px' }}
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="bg-[#f9fafb] rounded-lg p-6 mb-4">
            <div className="flex justify-between items-start mb-3">
              <h4 style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', fontSize: '16px' }}>
                Speaking Experience
              </h4>
              <button
                onClick={() => goToScreen(4)}
                className="text-[#0B3B2E] hover:underline"
                style={{ fontSize: '14px', fontWeight: '500' }}
              >
                Edit
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-[#4a5565]" style={{ fontSize: '14px' }}>
                <strong>Years of Experience:</strong> {formData.yearsOfExperience}
              </p>
              <p className="text-[#4a5565]" style={{ fontSize: '14px' }}>
                <strong>Formats:</strong> {formData.speakingFormats.join(', ')}
              </p>
              {formData.pastEngagements > 0 && (
                <p className="text-[#4a5565]" style={{ fontSize: '14px' }}>
                  <strong>Past Engagements:</strong> {formData.pastEngagements}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="bg-[#f9fafb] rounded-lg p-6 mb-4">
            <div className="flex justify-between items-start mb-3">
              <h4 style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', fontSize: '16px' }}>
                Professional Bio
              </h4>
              <button
                onClick={() => goToScreen(5)}
                className="text-[#0B3B2E] hover:underline"
                style={{ fontSize: '14px', fontWeight: '500' }}
              >
                Edit
              </button>
            </div>
            <p className="text-[#4a5565]" style={{ fontSize: '14px', lineHeight: '1.6' }}>
              {formData.bio.substring(0, 200)}
              {formData.bio.length > 200 ? '...' : ''}
            </p>
          </div>

          {/* Fee Range */}
          <div className="bg-[#f9fafb] rounded-lg p-6 mb-4">
            <div className="flex justify-between items-start mb-3">
              <h4 style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', fontSize: '16px' }}>
                Speaking Fee
              </h4>
              <button
                onClick={() => goToScreen(7)}
                className="text-[#0B3B2E] hover:underline"
                style={{ fontSize: '14px', fontWeight: '500' }}
              >
                Edit
              </button>
            </div>
            <p className="text-[#4a5565]" style={{ fontSize: '14px' }}>
              {formData.speakingFeeRange}
            </p>
          </div>
        </div>

        {/* Visibility Settings */}
        <div className="mb-6">
          <h3 
            className="mb-2"
            style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', fontSize: '20px' }}
          >
            Profile Visibility
          </h3>
          <p className="text-[#717182] mb-4" style={{ fontSize: '14px' }}>
            Choose who can see your speaker profile
          </p>

          <div className="space-y-3">
            {/* Public */}
            <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-[#0B3B2E] transition-colors">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={formData.visibility === 'public'}
                onChange={(e) => updateFormData({ visibility: e.target.value as 'public' | 'invite-only' | 'private' })}
                className="mt-1"
              />
              <div className="flex-1">
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '500' }} className="mb-1">
                  Public
                </p>
                <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                  Your profile is visible to all event organizers on VOXD
                </p>
              </div>
            </label>

            {/* Invite Only */}
            <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-[#0B3B2E] transition-colors">
              <input
                type="radio"
                name="visibility"
                value="invite-only"
                checked={formData.visibility === 'invite-only'}
                onChange={(e) => updateFormData({ visibility: e.target.value as 'public' | 'invite-only' | 'private' })}
                className="mt-1"
              />
              <div className="flex-1">
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '500' }} className="mb-1">
                  Invite Only
                </p>
                <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                  Only organizers you've connected with can see your full profile
                </p>
              </div>
            </label>

            {/* Private */}
            <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-[#0B3B2E] transition-colors">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={formData.visibility === 'private'}
                onChange={(e) => updateFormData({ visibility: e.target.value as 'public' | 'invite-only' | 'private' })}
                className="mt-1"
              />
              <div className="flex-1">
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '500' }} className="mb-1">
                  Private
                </p>
                <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                  Your profile is hidden from search. You can still reach out to organizers.
                </p>
              </div>
            </label>
          </div>

          {errors.visibility && (
            <p className="text-[#d4183d] mt-2" style={{ fontSize: '14px' }}>{errors.visibility}</p>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-lg p-4">
          <p className="text-[#0c4a6e]" style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
            🎉 You're almost done! Once you publish, event organizers can discover and contact you for speaking opportunities.
          </p>
        </div>
      </div>
    </FormLayout>
  );
}