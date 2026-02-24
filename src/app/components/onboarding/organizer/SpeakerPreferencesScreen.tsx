import { useState } from 'react';
import { Switch } from '../../ui/switch';
import { Slider } from '../../ui/slider';
import { Input } from '../../ui/input';
import { FormData } from "@/types/formData.ts";
import FormLayout from '../shared/FormLayout';

interface SpeakerPreferencesScreenProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  nextScreen: () => void;
  prevScreen: () => void;
  goToScreen: (screen: number) => void;
  progress: number;
  isSaving?: boolean;
  prevDisabled?: boolean;
}

const speakerFormatOptions = [
  'Keynote',
  'Panel',
  'Workshop',
  'Fireside chat',
  'Podcast guest',
  'Moderator',
];

const languageOptions = [
  'English',
  'Spanish',
  'French',
  'German',
  'Mandarin',
  'Portuguese',
  'Japanese',
  'Korean',
  'Arabic',
  'Hindi',
];

const leadTimeOptions = ['0–2 weeks', '3–4 weeks', '1–3 months', '3+ months'];

export default function SpeakerPreferencesScreen({
  formData,
  updateFormData,
  nextScreen,
  prevScreen,
  goToScreen,
  progress,
  isSaving = false,
  prevDisabled = false,
}: SpeakerPreferencesScreenProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleNext = () => {
    const newErrors: { [key: string]: string } = {};

    if (formData.speakerFormats.length === 0) {
      newErrors.speakerFormats = 'Please select at least one speaker format';
    }

    if (formData.languages.length === 0) {
      newErrors.languages = 'Please select at least one language';
    }

    if (!formData.leadTime) {
      newErrors.leadTime = 'Please select availability lead time';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      nextScreen();
    }
  };

  const toggleOption = (array: string[], value: string, key: string) => {
    const updated = array.includes(value)
      ? array.filter((item) => item !== value)
      : [...array, value];
    updateFormData({ [key]: updated });
    setErrors({ ...errors, [key]: '' });
  };

  return (
    <FormLayout
      currentStep={4}
      totalSteps={5}
      onNext={handleNext}
      onPrev={prevScreen}
      onSaveExit={() => goToScreen(0)}
      prevDisabled={prevDisabled}
      progress={progress}
      title="Speaker Preferences"
      subtitle="Define what you're looking for to get better matches"
      isLoading={isSaving}
    >
      <div>
        <label className="block mb-2">
          Speaker formats <span className="text-[#d4183d]">*</span>
        </label>
        <p className="text-[#717182] mb-3" style={{ fontSize: '14px' }}>
          What types of speaking roles are you typically looking to fill?
        </p>
        <div className="flex flex-wrap gap-2">
          {speakerFormatOptions.map((format) => (
            <button
              key={format}
              onClick={() => toggleOption(formData.speakerFormats, format, 'speakerFormats')}
              className={`px-4 py-2 rounded-full border transition-colors ${
                formData.speakerFormats.includes(format)
                  ? 'bg-[#0B3B2E] text-white border-[#0B3B2E]'
                  : 'bg-white text-black border-[#e9ebef] hover:border-[#0B3B2E]'
              }`}
              style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
            >
              {format}
            </button>
          ))}
        </div>
        {errors.speakerFormats && (
          <p className="text-[#d4183d] mt-2" style={{ fontSize: '14px' }}>{errors.speakerFormats}</p>
        )}
      </div>

      <div>
        <label className="block mb-2">
          Languages needed <span className="text-[#d4183d]">*</span>
        </label>
        <p className="text-[#717182] mb-3" style={{ fontSize: '14px' }}>
          Which languages should speakers be able to present in?
        </p>
        <div className="flex flex-wrap gap-2">
          {languageOptions.map((language) => (
            <button
              key={language}
              onClick={() => toggleOption(formData.languages, language, 'languages')}
              className={`px-4 py-2 rounded-full border transition-colors ${
                formData.languages.includes(language)
                  ? 'bg-[#0B3B2E] text-white border-[#0B3B2E]'
                  : 'bg-white text-black border-[#e9ebef] hover:border-[#0B3B2E]'
              }`}
              style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
            >
              {language}
            </button>
          ))}
        </div>
        {errors.languages && (
          <p className="text-[#d4183d] mt-2" style={{ fontSize: '14px' }}>{errors.languages}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="block">Diversity goals (optional)</label>
            <p className="text-[#717182] mt-1" style={{ fontSize: '14px' }}>
              Set targets for speaker diversity at your events
            </p>
          </div>
          <Switch
            checked={formData.diversityGoals}
            onCheckedChange={(checked) => updateFormData({ diversityGoals: checked })}
          />
        </div>

        {formData.diversityGoals && (
          <div className="bg-[#f3f3f5] p-4 rounded-lg">
            <label htmlFor="diversityTargets" className="block mb-2">
              Describe your diversity goals
            </label>
            <Input
              id="diversityTargets"
              placeholder="e.g., 50% women speakers, diverse representation across panels"
              value={formData.diversityTargets}
              onChange={(e) => updateFormData({ diversityTargets: e.target.value })}
              className="bg-white border-none"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block mb-3">Budget range (optional)</label>
        <p className="text-[#717182] mb-4" style={{ fontSize: '14px' }}>
          Helps speakers understand what to expect
        </p>

        <div className="space-y-4">
          <div className="flex gap-4">
            {[
              { value: 'unpaid', label: 'Unpaid' },
              { value: 'travel', label: 'Travel covered' },
              { value: 'paid', label: 'Paid' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => toggleOption(formData.budgetRange, value, 'budgetRange')}
                className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                  formData.budgetRange.includes(value)
                    ? 'bg-[#0B3B2E] text-white border-[#0B3B2E]'
                    : 'bg-white text-black border-[#e9ebef] hover:border-[#0B3B2E]'
                }`}
                style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
              >
                {label}
              </button>
            ))}
          </div>

          {formData.budgetRange.includes('paid') && (
            <div className="bg-[#f3f3f5] p-4 rounded-lg">
              <label className="block mb-4">
                Budget range: CHF {formData.budgetMin.toLocaleString()} – CHF {formData.budgetMax.toLocaleString()}
              </label>
              <Slider
                value={[formData.budgetMin, formData.budgetMax]}
                onValueChange={([min, max]) =>
                  updateFormData({ budgetMin: min, budgetMax: max })
                }
                min={0}
                max={100000}
                step={500}
                className="mb-2"
              />
              <div className="flex justify-between text-[#717182]" style={{ fontSize: '12px' }}>
                <span>CHF 0</span>
                <span>CHF 100,000+</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block mb-2">
          Availability lead time <span className="text-[#d4183d]">*</span>
        </label>
        <p className="text-[#717182] mb-3" style={{ fontSize: '14px' }}>
          How far in advance do you typically book speakers?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {leadTimeOptions.map((time) => (
            <button
              key={time}
              onClick={() => {
                updateFormData({ leadTime: time });
                setErrors({ ...errors, leadTime: '' });
              }}
              className={`px-4 py-3 rounded-lg border transition-colors ${
                formData.leadTime === time
                  ? 'bg-[#0B3B2E] text-white border-[#0B3B2E]'
                  : 'bg-white text-black border-[#e9ebef] hover:border-[#0B3B2E]'
              }`}
              style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
            >
              {time}
            </button>
          ))}
        </div>
        {errors.leadTime && (
          <p className="text-[#d4183d] mt-2" style={{ fontSize: '14px' }}>{errors.leadTime}</p>
        )}
      </div>
    </FormLayout>
  );
}
