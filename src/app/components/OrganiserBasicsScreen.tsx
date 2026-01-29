import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FormData } from '../App';
import FormLayout from './FormLayout';

interface OrganiserBasicsScreenProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  nextScreen: () => void;
  prevScreen: () => void;
  goToScreen: (screen: number) => void;
  progress: number;
}

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Marketing',
  'Manufacturing',
  'Retail',
  'Entertainment',
  'Non-profit',
  'Government',
  'Consulting',
  'Real Estate',
  'Robotics',
  'Blockchain',
  'Other',
];

const countries = [
  'Switzerland',
  'Germany', 
  'Austria',
  'Belgium',
  'Bulgaria',
  'Croatia',
  'Cyprus',
  'Czechia',
  'Denmark',
  'Estonia',
  'Finland',
  'France',
  'Greece',
  'Hungary',
  'Ireland',
  'Italy',
  'Latvia',
  'Lithuania',
  'Luxembourg',
  'Malta',
  'Netherlands',
  'Poland',
  'Portugal',
  'Romania',
  'Slovakia',
  'Slovenia',
  'Spain',
  'Sweden',
  'Other',
];

export default function OrganiserBasicsScreen({
  formData,
  updateFormData,
  nextScreen,
  prevScreen,
  goToScreen,
  progress,
}: OrganiserBasicsScreenProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleNext = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.organisationName.trim()) {
      newErrors.organisationName = 'Organisation name is required';
    }

    if (!formData.website.trim()) {
      newErrors.website = 'Website is required';
    } else if (!validateUrl(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (formData.industries.length === 0) {
      newErrors.industries = 'Please select at least one industry';
    }

    if (!formData.tagline.trim()) {
      newErrors.tagline = 'Tagline is required';
    } else if (formData.tagline.length > 80) {
      newErrors.tagline = 'Tagline exceeds 80 character limit';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      nextScreen();
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData({ logo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    updateFormData({ logo: null });
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleIndustry = (industry: string) => {
    const updated = formData.industries.includes(industry)
      ? formData.industries.filter(i => i !== industry)
      : [...formData.industries, industry];
    updateFormData({ industries: updated });
    setErrors({ ...errors, industries: '' });
  };

  return (
    <FormLayout
      currentStep={1}
      totalSteps={5}
      onNext={handleNext}
      onPrev={prevScreen}
      onSaveExit={() => goToScreen(0)}
      progress={progress}
      title="Organiser Basics"
      subtitle="Tell us about your organisation to help speakers understand who you are"
    >
      <div>
        <label htmlFor="organisationName" className="block mb-2">
          Organisation/Brand name <span className="text-[#d4183d]">*</span>
        </label>
        <Input
          id="organisationName"
          placeholder="e.g., Tech Summit Global"
          value={formData.organisationName}
          onChange={(e) => {
            updateFormData({ organisationName: e.target.value });
            setErrors({ ...errors, organisationName: '' });
          }}
          className="bg-[#f3f3f5] border-none"
        />
        {errors.organisationName && (
          <p className="text-[#d4183d] mt-1" style={{ fontSize: '14px' }}>{errors.organisationName}</p>
        )}
      </div>

      <div>
        <label htmlFor="website" className="block mb-2">
          Website <span className="text-[#d4183d]">*</span>
        </label>
        <Input
          id="website"
          placeholder="e.g., www.techsummit.com"
          value={formData.website}
          onChange={(e) => {
            updateFormData({ website: e.target.value });
            setErrors({ ...errors, website: '' });
          }}
          className="bg-[#f3f3f5] border-none"
        />
        {errors.website && (
          <p className="text-[#d4183d] mt-1" style={{ fontSize: '14px' }}>{errors.website}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="country" className="block mb-2">
            Country <span className="text-[#d4183d]">*</span>
          </label>
          <select
            id="country"
            value={formData.country}
            onChange={(e) => {
              updateFormData({ country: e.target.value });
              setErrors({ ...errors, country: '' });
            }}
            className="w-full h-10 px-3 rounded-md bg-[#f3f3f5] border-none"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <option value="">Select country</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="text-[#d4183d] mt-1" style={{ fontSize: '14px' }}>{errors.country}</p>
          )}
        </div>

        <div>
          <label htmlFor="city" className="block mb-2">
            City <span className="text-[#d4183d]">*</span>
          </label>
          <Input
            id="city"
            placeholder="e.g., San Francisco"
            value={formData.city}
            onChange={(e) => {
              updateFormData({ city: e.target.value });
              setErrors({ ...errors, city: '' });
            }}
            className="bg-[#f3f3f5] border-none"
          />
          {errors.city && (
            <p className="text-[#d4183d] mt-1" style={{ fontSize: '14px' }}>{errors.city}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block mb-2">
          Industry <span className="text-[#d4183d]">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {industries.map((industry) => (
            <button
              key={industry}
              onClick={() => toggleIndustry(industry)}
              className={`px-4 py-2 rounded-full border transition-colors ${
                formData.industries.includes(industry)
                  ? 'bg-[#0B3B2E] text-white border-[#0B3B2E]'
                  : 'bg-white text-black border-[#e9ebef] hover:border-[#0B3B2E]'
              }`}
              style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
            >
              {industry}
            </button>
          ))}
        </div>
        {errors.industries && (
          <p className="text-[#d4183d] mt-2" style={{ fontSize: '14px' }}>{errors.industries}</p>
        )}
      </div>

      <div>
        <label className="block mb-2">Logo (optional)</label>
        <p className="text-[#717182] mb-3" style={{ fontSize: '14px' }}>
          Upload your organisation logo to build trust with speakers
        </p>
        {logoPreview ? (
          <div className="relative inline-block">
            <img src={logoPreview} alt="Logo preview" className="w-32 h-32 object-cover rounded-lg border border-[#e9ebef]" />
            <button
              onClick={removeLogo}
              className="absolute -top-2 -right-2 w-6 h-6 bg-[#d4183d] text-white rounded-full flex items-center justify-center hover:bg-[#b0142f]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#e9ebef] rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#0B3B2E] transition-colors"
          >
            <Upload className="w-8 h-8 text-[#717182] mb-2" />
            <p className="text-[#717182]" style={{ fontSize: '14px' }}>
              Click to upload or drag and drop
            </p>
            <p className="text-[#717182] mt-1" style={{ fontSize: '12px' }}>
              PNG, JPG up to 5MB
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleLogoUpload}
          className="hidden"
        />
      </div>

      <div>
        <label htmlFor="tagline" className="block mb-2">
          Short tagline <span className="text-[#d4183d]">*</span>
        </label>
        <p className="text-[#717182] mb-3" style={{ fontSize: '14px' }}>
          A concise description that captures your organisation's mission or focus
        </p>
        <Input
          id="tagline"
          placeholder="e.g., Connecting tech leaders for innovation"
          value={formData.tagline}
          onChange={(e) => {
            updateFormData({ tagline: e.target.value });
            setErrors({ ...errors, tagline: '' });
          }}
          maxLength={80}
          className="bg-[#f3f3f5] border-none"
        />
        <div className="flex justify-between mt-1">
          {errors.tagline ? (
            <p className="text-[#d4183d]" style={{ fontSize: '14px' }}>{errors.tagline}</p>
          ) : (
            <span />
          )}
          <span className="text-[#717182]" style={{ fontSize: '14px' }}>
            {formData.tagline.length}/80
          </span>
        </div>
      </div>
    </FormLayout>
  );
}