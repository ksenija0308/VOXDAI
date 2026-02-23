import { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '../../ui/input';
import { FormData } from '@/types/formData';
import FormLayout from '../shared/FormLayout';

interface EventTypesScreenProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  nextScreen: () => void;
  prevScreen: () => void;
  goToScreen: (screen: number) => void;
  progress: number;
  prevDisabled?: boolean;
}

const eventTypeOptions = [
  'Conference',
  'Meetup',
  'Corporate event',
  'Workshop',
  'Webinar',
  'Podcast',
  'Panel',
  'Internal training',
  'Other',
];

const frequencyOptions = ['Weekly', 'Monthly', 'Quarterly', 'Bi-annually', 'Annually', 'Ad-hoc'];

const eventSizeOptions = ['10–30', '30–80', '80–200', '200–1000', '1000+'];

const formatOptions = ['In-person', 'Online', 'Hybrid'];

export default function EventTypesScreen({
  formData,
  updateFormData,
  nextScreen,
  prevScreen,
  goToScreen,
  progress,
  prevDisabled = false,
}: EventTypesScreenProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [locationInput, setLocationInput] = useState('');

  const handleNext = () => {
    const newErrors: { [key: string]: string } = {};

    if (formData.eventTypes.length === 0) {
      newErrors.eventTypes = 'Please select at least one event type';
    }

    if (formData.frequency.length === 0) {
      newErrors.frequency = 'Please select at least one frequency';
    }

    if (formData.eventSizes.length === 0) {
      newErrors.eventSizes = 'Please select at least one event size';
    }

    if (formData.formats.length === 0) {
      newErrors.formats = 'Please select at least one format';
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

  const addLocation = () => {
    if (locationInput.trim() && !formData.locations.includes(locationInput.trim())) {
      updateFormData({ locations: [...formData.locations, locationInput.trim()] });
      setLocationInput('');
    }
  };

  const removeLocation = (location: string) => {
    updateFormData({ locations: formData.locations.filter((l) => l !== location) });
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLocation();
    }
  };

  return (
    <FormLayout
      currentStep={3}
      totalSteps={5}
      onNext={handleNext}
      onPrev={prevScreen}
      onSaveExit={() => goToScreen(0)}
      prevDisabled={prevDisabled}
      progress={progress}
      title="Event Types & Frequency"
      subtitle="Help speakers understand what kind of events you organize"
    >
      <div>
        <label className="block mb-2">
          Event types <span className="text-[#d4183d]">*</span>
        </label>
        <p className="text-[#717182] mb-3" style={{ fontSize: '14px' }}>
          Select all that apply. This helps match you with speakers who have relevant experience.
        </p>
        <div className="flex flex-wrap gap-2">
          {eventTypeOptions.map((type) => (
            <button
              key={type}
              onClick={() => toggleOption(formData.eventTypes, type, 'eventTypes')}
              className={`px-4 py-2 rounded-full border transition-colors ${
                formData.eventTypes.includes(type)
                  ? 'bg-[#0B3B2E] text-white border-[#0B3B2E]'
                  : 'bg-white text-black border-[#e9ebef] hover:border-[#0B3B2E]'
              }`}
              style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
            >
              {type}
            </button>
          ))}
        </div>
        {errors.eventTypes && (
          <p className="text-[#d4183d] mt-2" style={{ fontSize: '14px' }}>{errors.eventTypes}</p>
        )}
      </div>

      <div>
        <label className="block mb-2">
          Frequency <span className="text-[#d4183d]">*</span>
        </label>
        <p className="text-[#717182] mb-3" style={{ fontSize: '14px' }}>
          How often do you organize events?
        </p>
        <div className="flex flex-wrap gap-2">
          {frequencyOptions.map((freq) => (
            <button
              key={freq}
              onClick={() => toggleOption(formData.frequency, freq, 'frequency')}
              className={`px-4 py-2 rounded-full border transition-colors ${
                formData.frequency.includes(freq)
                  ? 'bg-[#0B3B2E] text-white border-[#0B3B2E]'
                  : 'bg-white text-black border-[#e9ebef] hover:border-[#0B3B2E]'
              }`}
              style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
            >
              {freq}
            </button>
          ))}
        </div>
        {errors.frequency && (
          <p className="text-[#d4183d] mt-2" style={{ fontSize: '14px' }}>{errors.frequency}</p>
        )}
      </div>

      <div>
        <label className="block mb-2">
          Typical event size <span className="text-[#d4183d]">*</span>
        </label>
        <p className="text-[#717182] mb-3" style={{ fontSize: '14px' }}>
          Number of attendees
        </p>
        <div className="flex flex-wrap gap-2">
          {eventSizeOptions.map((size) => (
            <button
              key={size}
              onClick={() => toggleOption(formData.eventSizes, size, 'eventSizes')}
              className={`px-4 py-2 rounded-full border transition-colors ${
                formData.eventSizes.includes(size)
                  ? 'bg-[#0B3B2E] text-white border-[#0B3B2E]'
                  : 'bg-white text-black border-[#e9ebef] hover:border-[#0B3B2E]'
              }`}
              style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
            >
              {size}
            </button>
          ))}
        </div>
        {errors.eventSizes && (
          <p className="text-[#d4183d] mt-2" style={{ fontSize: '14px' }}>{errors.eventSizes}</p>
        )}
      </div>

      <div>
        <label className="block mb-2">
          Format <span className="text-[#d4183d]">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {formatOptions.map((format) => (
            <button
              key={format}
              onClick={() => toggleOption(formData.formats, format, 'formats')}
              className={`px-4 py-2 rounded-full border transition-colors ${
                formData.formats.includes(format)
                  ? 'bg-[#0B3B2E] text-white border-[#0B3B2E]'
                  : 'bg-white text-black border-[#e9ebef] hover:border-[#0B3B2E]'
              }`}
              style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
            >
              {format}
            </button>
          ))}
        </div>
        {errors.formats && (
          <p className="text-[#d4183d] mt-2" style={{ fontSize: '14px' }}>{errors.formats}</p>
        )}
      </div>

      <div>
        <label htmlFor="locations" className="block mb-2">
          Typical location(s) (optional)
        </label>
        <p className="text-[#717182] mb-3" style={{ fontSize: '14px' }}>
          Add cities or regions where you typically host events. Press Enter to add each location.
        </p>
        <Input
          id="locations"
          placeholder="e.g., San Francisco, New York"
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          onKeyDown={handleLocationKeyDown}
          onBlur={addLocation}
          className="bg-[#f3f3f5] border-none"
        />
        {formData.locations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.locations.map((location) => (
              <div
                key={location}
                className="flex items-center gap-2 px-3 py-1 bg-[#e9ebef] rounded-full"
              >
                <span style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                  {location}
                </span>
                <button
                  onClick={() => removeLocation(location)}
                  className="hover:text-[#d4183d]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </FormLayout>
  );
}