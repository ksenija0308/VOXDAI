import { Pencil, Globe, Lock, Users } from 'lucide-react';
import { FormData } from '../App';
import FormLayout from './FormLayout';

interface ReviewPublishScreenProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  nextScreen: () => void;
  prevScreen: () => void;
  goToScreen: (screen: number) => void;
  progress: number;
}

export default function ReviewPublishScreen({
  formData,
  updateFormData,
  nextScreen,
  prevScreen,
  goToScreen,
  progress,
}: ReviewPublishScreenProps) {
  return (
    <FormLayout
      currentStep={5}
      totalSteps={5}
      onNext={nextScreen}
      onPrev={prevScreen}
      onSaveExit={() => goToScreen(0)}
      progress={progress}
      title="Review & Publish"
      subtitle="Review your profile before publishing"
      nextLabel="Finish registration"
    >
      <div className="space-y-6">
        {/* Organiser Basics */}
        <div className="bg-[#f3f3f5] p-6 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
              Organiser Basics
            </h3>
            <button
              onClick={() => goToScreen(1)}
              className="text-[#0B3B2E] hover:underline flex items-center gap-1"
              style={{ fontSize: '14px' }}
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                Organisation
              </p>
              <p>{formData.organisationName}</p>
            </div>
            <div>
              <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                Website
              </p>
              <p>{formData.website}</p>
            </div>
            <div>
              <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                Location
              </p>
              <p>
                {formData.city}, {formData.country}
              </p>
            </div>
            <div>
              <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                Industries
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {formData.industries.map((industry) => (
                  <span
                    key={industry}
                    className="px-3 py-1 bg-white rounded-full border border-[#e9ebef]"
                    style={{ fontSize: '14px' }}
                  >
                    {industry}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                Tagline
              </p>
              <p>{formData.tagline}</p>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-[#f3f3f5] p-6 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>About</h3>
            <button
              onClick={() => goToScreen(2)}
              className="text-[#0B3B2E] hover:underline flex items-center gap-1"
              style={{ fontSize: '14px' }}
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                Primary contact
              </p>
              <p>{formData.contactName}</p>
              <p className="text-[#717182]">{formData.contactEmail}</p>
              {formData.contactPhone && <p className="text-[#717182]">{formData.contactPhone}</p>}
            </div>
            {formData.calendarLink && (
              <div>
                <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                  Calendar
                </p>
                <p className="text-[#0B3B2E] underline truncate">{formData.calendarLink}</p>
              </div>
            )}
            {(formData.linkedIn || formData.instagram || formData.youtube || formData.twitter) && (
              <div>
                <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                  Social links
                </p>
                <div className="space-y-1">
                  {formData.linkedIn && <p className="text-[#0B3B2E] underline truncate">LinkedIn</p>}
                  {formData.instagram && <p className="text-[#0B3B2E] underline truncate">Instagram</p>}
                  {formData.youtube && <p className="text-[#0B3B2E] underline truncate">YouTube</p>}
                  {formData.twitter && <p className="text-[#0B3B2E] underline truncate">X</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Event Types & Frequency */}
        <div className="bg-[#f3f3f5] p-6 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
              Event Types & Frequency
            </h3>
            <button
              onClick={() => goToScreen(3)}
              className="text-[#0B3B2E] hover:underline flex items-center gap-1"
              style={{ fontSize: '14px' }}
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                Event types
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {formData.eventTypes.map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1 bg-white rounded-full border border-[#e9ebef]"
                    style={{ fontSize: '14px' }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                Frequency
              </p>
              <p>{formData.frequency.join(', ')}</p>
            </div>
            <div>
              <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                Event size
              </p>
              <p>{formData.eventSizes.join(', ')}</p>
            </div>
            <div>
              <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                Format
              </p>
              <p>{formData.formats.join(', ')}</p>
            </div>
            {formData.locations.length > 0 && (
              <div>
                <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                  Locations
                </p>
                <p>{formData.locations.join(', ')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Speaker Preferences */}
        <div className="bg-[#f3f3f5] p-6 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
              Speaker Preferences
            </h3>
            <button
              onClick={() => goToScreen(4)}
              className="text-[#0B3B2E] hover:underline flex items-center gap-1"
              style={{ fontSize: '14px' }}
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                Speaker formats
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {formData.speakerFormats.map((format) => (
                  <span
                    key={format}
                    className="px-3 py-1 bg-white rounded-full border border-[#e9ebef]"
                    style={{ fontSize: '14px' }}
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                Languages
              </p>
              <p>{formData.languages.join(', ')}</p>
            </div>
            {formData.diversityGoals && formData.diversityTargets && (
              <div>
                <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                  Diversity goals
                </p>
                <p>{formData.diversityTargets}</p>
              </div>
            )}
            <div>
              <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                Budget range
              </p>
              <p>
                {formData.budgetRange === 'unpaid'
                  ? 'Unpaid'
                  : formData.budgetRange === 'travel'
                  ? 'Travel covered'
                  : `$${formData.budgetMin.toLocaleString()} – $${formData.budgetMax.toLocaleString()}`}
              </p>
            </div>
            <div>
              <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                Lead time
              </p>
              <p>{formData.leadTime}</p>
            </div>
          </div>
        </div>

        {/* Visibility Settings */}
        <div className="border-t border-[#e9ebef] pt-6">
          <label className="block mb-4">
            Profile visibility
          </label>
          <div className="space-y-3">
            <button
              onClick={() => updateFormData({ visibility: 'public' })}
              className={`w-full p-4 rounded-lg border flex items-start gap-4 transition-colors ${
                formData.visibility === 'public'
                  ? 'border-[#0B3B2E] bg-[#0B3B2E]/5'
                  : 'border-[#e9ebef] hover:border-[#0B3B2E]'
              }`}
            >
              <Globe className="w-5 h-5 mt-0.5 text-[#0B3B2E]" />
              <div className="text-left flex-1">
                <p style={{ fontWeight: '500' }}>Public</p>
                <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                  Visible to all speakers on the platform
                </p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  formData.visibility === 'public' ? 'border-[#0B3B2E]' : 'border-[#e9ebef]'
                }`}
              >
                {formData.visibility === 'public' && (
                  <div className="w-3 h-3 rounded-full bg-[#0B3B2E]" />
                )}
              </div>
            </button>

            <button
              onClick={() => updateFormData({ visibility: 'invite-only' })}
              className={`w-full p-4 rounded-lg border flex items-start gap-4 transition-colors ${
                formData.visibility === 'invite-only'
                  ? 'border-[#0B3B2E] bg-[#0B3B2E]/5'
                  : 'border-[#e9ebef] hover:border-[#0B3B2E]'
              }`}
            >
              <Users className="w-5 h-5 mt-0.5 text-[#0B3B2E]" />
              <div className="text-left flex-1">
                <p style={{ fontWeight: '500' }}>Invite-only</p>
                <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                  Only speakers you invite can view your profile
                </p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  formData.visibility === 'invite-only' ? 'border-[#0B3B2E]' : 'border-[#e9ebef]'
                }`}
              >
                {formData.visibility === 'invite-only' && (
                  <div className="w-3 h-3 rounded-full bg-[#0B3B2E]" />
                )}
              </div>
            </button>

            <button
              onClick={() => updateFormData({ visibility: 'private' })}
              className={`w-full p-4 rounded-lg border flex items-start gap-4 transition-colors ${
                formData.visibility === 'private'
                  ? 'border-[#0B3B2E] bg-[#0B3B2E]/5'
                  : 'border-[#e9ebef] hover:border-[#0B3B2E]'
              }`}
            >
              <Lock className="w-5 h-5 mt-0.5 text-[#0B3B2E]" />
              <div className="text-left flex-1">
                <p style={{ fontWeight: '500' }}>Private</p>
                <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                  Hidden from all speakers, for internal use only
                </p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  formData.visibility === 'private' ? 'border-[#0B3B2E]' : 'border-[#e9ebef]'
                }`}
              >
                {formData.visibility === 'private' && (
                  <div className="w-3 h-3 rounded-full bg-[#0B3B2E]" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </FormLayout>
  );
}