import { useState } from 'react';
import { Linkedin, Instagram, Youtube, Twitter } from 'lucide-react';
import { Input } from '../../ui/input';
import { Checkbox } from '../../ui/checkbox';
import { Switch } from '../../ui/switch';
import { FormData } from "@/types/formData.ts";
import FormLayout from '../shared/FormLayout';

interface AboutScreenProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  nextScreen: () => void;
  prevScreen: () => void;
  goToScreen: (screen: number) => void;
  progress: number;
  prevDisabled?: boolean;
}

export default function AboutScreen({
  formData,
  updateFormData,
  nextScreen,
  prevScreen,
  goToScreen,
  progress,
  prevDisabled = false,
}: AboutScreenProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNext = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Primary contact name is required';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Primary contact email is required';
    } else if (!validateEmail(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    if (!formData.authorised) {
      newErrors.authorised = 'You must confirm you are authorised to book speakers';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      nextScreen();
    }
  };

  return (
    <FormLayout
      currentStep={2}
      totalSteps={5}
      onNext={handleNext}
      onPrev={prevScreen}
      onSaveExit={() => goToScreen(0)}
      prevDisabled={prevDisabled}
      progress={progress}
      title="About"
      subtitle="Share contact details so speakers can reach you easily"
    >
      <div>
        <label htmlFor="contactName" className="block mb-2">
          Primary contact name <span className="text-[#d4183d]">*</span>
        </label>
        <Input
          id="contactName"
          placeholder="e.g., Jane Smith"
          value={formData.contactName}
          onChange={(e) => {
            updateFormData({ contactName: e.target.value });
            setErrors({ ...errors, contactName: '' });
          }}
          className="bg-[#f3f3f5] border-none"
        />
        {errors.contactName && (
          <p className="text-[#d4183d] mt-1" style={{ fontSize: '14px' }}>{errors.contactName}</p>
        )}
      </div>

      <div>
        <label htmlFor="contactEmail" className="block mb-2">
          Primary contact email <span className="text-[#d4183d]">*</span>
        </label>
        <Input
          id="contactEmail"
          type="email"
          placeholder="e.g., jane@techsummit.com"
          value={formData.contactEmail}
          onChange={(e) => {
            updateFormData({ contactEmail: e.target.value });
            setErrors({ ...errors, contactEmail: '' });
          }}
          className="bg-[#f3f3f5] border-none"
        />
        {errors.contactEmail && (
          <p className="text-[#d4183d] mt-1" style={{ fontSize: '14px' }}>{errors.contactEmail}</p>
        )}
      </div>

      <div>
        <label htmlFor="contactPhone" className="block mb-2">
          Primary contact phone (optional)
        </label>
        <Input
          id="contactPhone"
          type="tel"
          placeholder="e.g., +1 (555) 123-4567"
          value={formData.contactPhone}
          onChange={(e) => updateFormData({ contactPhone: e.target.value })}
          className="bg-[#f3f3f5] border-none"
        />
      </div>

      <div>
        <label className="block mb-2">Calendar link (optional)</label>
        <p className="text-[#717182] mb-3" style={{ fontSize: '14px' }}>
          Connect your calendar to make scheduling easier
        </p>

        <div className="space-y-3">
          <select
            value={formData.calendarType}
            onChange={(e) => updateFormData({ calendarType: e.target.value as any })}
            className="w-full h-10 px-3 rounded-md bg-[#f3f3f5] border-none"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <option value="">Select calendar type</option>
            <option value="calendly">Calendly</option>
            <option value="google">Google Calendar</option>
            <option value="ical">iCal</option>
          </select>

          {formData.calendarType && (
            <Input
              placeholder={`Paste your ${formData.calendarType === 'calendly' ? 'Calendly' : formData.calendarType === 'google' ? 'Google Calendar' : 'iCal'} link`}
              value={formData.calendarLink}
              onChange={(e) => updateFormData({ calendarLink: e.target.value })}
              className="bg-[#f3f3f5] border-none"
            />
          )}
        </div>
      </div>

      <div>
        <label className="block mb-2">Social links (optional)</label>
        <p className="text-[#717182] mb-3" style={{ fontSize: '14px' }}>
          Add your organisation's social media profiles
        </p>

        <div className="space-y-3">
          <div className="relative">
            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#717182]" />
            <Input
              placeholder="LinkedIn URL"
              value={formData.linkedIn}
              onChange={(e) => updateFormData({ linkedIn: e.target.value })}
              className="pl-11 bg-[#f3f3f5] border-none"
            />
          </div>

          <div className="relative">
            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#717182]" />
            <Input
              placeholder="Instagram URL"
              value={formData.instagram}
              onChange={(e) => updateFormData({ instagram: e.target.value })}
              className="pl-11 bg-[#f3f3f5] border-none"
            />
          </div>

          <div className="relative">
            <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#717182]" />
            <Input
              placeholder="YouTube URL"
              value={formData.youtube}
              onChange={(e) => updateFormData({ youtube: e.target.value })}
              className="pl-11 bg-[#f3f3f5] border-none"
            />
          </div>

          <div className="relative">
            <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#717182]" />
            <Input
              placeholder="X (Twitter) URL"
              value={formData.twitter}
              onChange={(e) => updateFormData({ twitter: e.target.value })}
              className="pl-11 bg-[#f3f3f5] border-none"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-[#e9ebef] pt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <label htmlFor="showInSpeakerSearch" className="block cursor-pointer">
              Allow speakers to find me
            </label>
            <p className="text-[#717182] mt-1" style={{ fontSize: '14px' }}>
              Make your profile visible in speaker search results
            </p>
          </div>
          <Switch
            id="showInSpeakerSearch"
            checked={formData.showInSpeakerSearch}
            onCheckedChange={(checked) => {
              updateFormData({ showInSpeakerSearch: checked });
            }}
          />
        </div>
      </div>

      <div className="border-t border-[#e9ebef] pt-6">
        <div className="flex items-start gap-3">
          <Checkbox
            id="authorised"
            checked={formData.authorised}
            onCheckedChange={(checked) => {
              updateFormData({ authorised: checked as boolean });
              setErrors({ ...errors, authorised: '' });
            }}
            className="mt-1"
          />
          <label htmlFor="authorised" className="cursor-pointer">
            I'm authorised to book speakers on behalf of this organisation{' '}
            <span className="text-[#d4183d]">*</span>
          </label>
        </div>
        {errors.authorised && (
          <p className="text-[#d4183d] mt-2" style={{ fontSize: '14px' }}>{errors.authorised}</p>
        )}
      </div>
    </FormLayout>
  );
}
