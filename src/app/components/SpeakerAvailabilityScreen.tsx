import { useState } from 'react';
import { FormData } from '../App';
import FormLayout from './FormLayout';
import { Calendar, X } from 'lucide-react';
import svgPaths from '../../imports/svg-zbs72l16lo';

interface SpeakerAvailabilityScreenProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  nextScreen: () => void;
  prevScreen: () => void;
  goToScreen: (screen: number) => void;
  progress: number;
  isSaving?: boolean;
}

const geographicOptions = [
  'Local (within my city)',
  'Regional (within my country)',
  'Continental (within my continent)',
  'Global (anywhere in the world)',
];

const eventTypeOptions = [
  'Conference',
  'Corporate Event',
  'Workshop/Training',
  'Summit',
  'Webinar',
  'Podcast',
  'Panel Discussion',
  'University/Academic',
  'Charity/Non-profit',
];

export default function SpeakerAvailabilityScreen({
  formData,
  updateFormData,
  nextScreen,
  prevScreen,
  goToScreen,
  progress,
  isSaving = false,
}: SpeakerAvailabilityScreenProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPeriodForm, setShowPeriodForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isOngoing, setIsOngoing] = useState(false);
  const [periodErrors, setPeriodErrors] = useState<{ startDate?: string; endDate?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.geographicReach) {
      newErrors.geographicReach = 'Please select a geographic reach option';
    }

    if (formData.preferredEventTypes.length === 0) {
      newErrors.preferredEventTypes = 'Please select at least one preferred event type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      nextScreen();
    }
  };

  const toggleOption = (array: string[], value: string, field: keyof FormData) => {
    const newArray = array.includes(value)
      ? array.filter((item) => item !== value)
      : [...array, value];
    updateFormData({ [field]: newArray });
  };

  const handleAddPeriod = () => {
    const newPeriodErrors: { startDate?: string; endDate?: string } = {};

    if (!startDate) {
      newPeriodErrors.startDate = 'Start date is required';
    }

    if (!isOngoing && !endDate) {
      newPeriodErrors.endDate = 'End date is required unless ongoing';
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newPeriodErrors.endDate = 'End date must be after start date';
    }

    setPeriodErrors(newPeriodErrors);

    if (Object.keys(newPeriodErrors).length === 0) {
      const newPeriod = {
        id: Date.now().toString(),
        startDate,
        endDate: isOngoing ? '' : endDate,
        ongoing: isOngoing,
      };

      updateFormData({
        availabilityPeriods: [...formData.availabilityPeriods, newPeriod],
      });

      // Reset form
      setStartDate('');
      setEndDate('');
      setIsOngoing(false);
      setShowPeriodForm(false);
      setPeriodErrors({});
    }
  };

  const handleRemovePeriod = (id: string) => {
    updateFormData({
      availabilityPeriods: formData.availabilityPeriods.filter(period => period.id !== id),
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <FormLayout
      currentStep={6}
      totalSteps={8}
      onPrev={prevScreen}
      onNext={handleContinue}
      onSaveExit={() => goToScreen(0)}
      progress={progress}
      title="Availability & Preferences"
      subtitle="Help organizers understand where and when you're available to speak"
      isLoading={isSaving}
    >
      <div>
        {/* Geographic Reach */}
        <div className="mb-6">
          <label className="block mb-2">
            Geographic Reach <span className="text-[#d4183d]">*</span>
          </label>
          <p className="text-[#717182] mb-3" style={{ fontSize: '14px' }}>
            Where are you willing to speak?
          </p>
          <div className="flex flex-wrap gap-2">
            {geographicOptions.map((option) => (
              <button
                key={option}
                onClick={() => updateFormData({ geographicReach: option })}
                className={`px-4 py-2 rounded-full border transition-colors ${
                  formData.geographicReach === option
                    ? 'bg-[#0B3B2E] text-white border-[#0B3B2E]'
                    : 'bg-white text-black border-[#d1d5dc] hover:border-[#0B3B2E]'
                }`}
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '500' }}
              >
                {option}
              </button>
            ))}
          </div>
          {errors.geographicReach && (
            <p className="text-[#d4183d] mt-2" style={{ fontSize: '14px' }}>{errors.geographicReach}</p>
          )}
        </div>

        {/* Willing to Travel */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.willingToTravel}
              onChange={(e) => updateFormData({ willingToTravel: e.target.checked })}
              className="w-5 h-5 border-2 border-[#d1d5dc] rounded cursor-pointer"
            />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px' }}>
              I'm willing to travel for speaking engagements
            </span>
          </label>
        </div>

        {/* Preferred Event Types */}
        <div className="mb-8">
          <label className="block mb-2">
            Preferred Event Types <span className="text-[#d4183d]">*</span>
          </label>
          <p className="text-[#717182] mb-3" style={{ fontSize: '14px' }}>
            What types of events do you prefer to speak at? Select all that apply
          </p>
          <div className="flex flex-wrap gap-2">
            {eventTypeOptions.map((type) => (
              <button
                key={type}
                onClick={() => toggleOption(formData.preferredEventTypes, type, 'preferredEventTypes')}
                className={`px-4 py-2 rounded-full border transition-colors ${
                  formData.preferredEventTypes.includes(type)
                    ? 'bg-[#0B3B2E] text-white border-[#0B3B2E]'
                    : 'bg-white text-black border-[#d1d5dc] hover:border-[#0B3B2E]'
                }`}
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '500' }}
              >
                {type}
              </button>
            ))}
          </div>
          {errors.preferredEventTypes && (
            <p className="text-[#d4183d] mt-2" style={{ fontSize: '14px' }}>{errors.preferredEventTypes}</p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[#e9ebef] my-8" />

        {/* Availability Periods Section */}
        <div className="mb-6">
          <h3 className="mb-2" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', fontSize: '20px' }}>
            Availability Periods
          </h3>
          <p className="text-[#717182] mb-4" style={{ fontSize: '14px' }}>
            Define time periods when you're available for speaking engagements. Event organizers will know when they can send you requests during these periods.
          </p>

          {/* Current Status Box */}
          <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-[10px] p-4 mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 20 20">
              <path d="M6.66667 1.66667V5" stroke="#0B3B2E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              <path d="M13.3333 1.66667V5" stroke="#0B3B2E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              <path d={svgPaths.p1da67b80} stroke="#0B3B2E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              <path d="M2.5 8.33333H17.5" stroke="#0B3B2E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            </svg>
            <div className="flex-1">
              <p className="font-['Inter',sans-serif] text-[16px]">
                {formData.availabilityPeriods.length} period{formData.availabilityPeriods.length !== 1 ? 's' : ''} defined
              </p>
              <p className="font-['Inter',sans-serif] text-[14px] text-[#717182]">
                {formData.availabilityPeriods.length === 0 
                  ? "Add time ranges when you're available to speak"
                  : "Manage your availability periods below"}
              </p>
            </div>
          </div>

          {/* Existing Periods List */}
          {formData.availabilityPeriods.length > 0 && (
            <div className="mb-4 space-y-3">
              {formData.availabilityPeriods.map((period) => (
                <div
                  key={period.id}
                  className="bg-white border border-[#e5e7eb] rounded-[8px] p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#0b3b2e]" />
                    <div>
                      <p className="font-['Inter',sans-serif] text-[16px]">
                        {formatDate(period.startDate)} - {period.ongoing ? 'Ongoing' : formatDate(period.endDate)}
                      </p>
                      {period.ongoing && (
                        <p className="font-['Inter',sans-serif] text-[14px] text-[#717182]">No end date</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemovePeriod(period.id)}
                    className="text-[#d4183d] hover:text-[#a0132e] transition-colors"
                    aria-label="Remove period"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Period Button (when form hidden) */}
          {!showPeriodForm && (
            <button
              onClick={() => setShowPeriodForm(true)}
              className="w-full bg-[#0b3b2e] text-white px-6 py-3 rounded-[8px] font-['Inter',sans-serif] font-medium text-[16px] hover:bg-[#0a3025] transition-colors"
            >
              Add Availability Period
            </button>
          )}

          {/* Add New Period Form */}
          {showPeriodForm && (
            <div className="bg-[rgba(11,59,46,0.05)] border-2 border-[#0b3b2e] rounded-[10px] p-6">
              <h4 className="font-['Inter',sans-serif] font-semibold text-[18px] mb-4">Add New Availability Period</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Start Date */}
                <div>
                  <label className="block mb-2 font-['Inter',sans-serif] font-medium text-[14px]">
                    Start Date <span className="text-[#d4183d]">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white border border-[#d1d5dc] rounded-[6px] h-[48px] px-4 font-['Inter',sans-serif] text-[16px] focus:outline-none focus:border-[#0b3b2e] focus:ring-1 focus:ring-[#0b3b2e]"
                  />
                  {periodErrors.startDate && (
                    <p className="text-[#d4183d] text-[14px] mt-1">{periodErrors.startDate}</p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label className="block mb-2 font-['Inter',sans-serif] font-medium text-[14px]">
                    End Date {!isOngoing && <span className="text-[#d4183d]">*</span>}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isOngoing}
                    className={`w-full border border-[#d1d5dc] rounded-[6px] h-[48px] px-4 font-['Inter',sans-serif] text-[16px] mb-3 focus:outline-none focus:border-[#0b3b2e] focus:ring-1 focus:ring-[#0b3b2e] ${
                      isOngoing ? 'bg-[#f9fafb] cursor-not-allowed' : 'bg-white'
                    }`}
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOngoing}
                      onChange={(e) => {
                        setIsOngoing(e.target.checked);
                        if (e.target.checked) {
                          setEndDate('');
                          setPeriodErrors({ ...periodErrors, endDate: undefined });
                        }
                      }}
                      className="w-[16px] h-[16px] border border-[#d1d5dc] rounded cursor-pointer accent-[#0b3b2e]"
                    />
                    <span className="font-['Inter',sans-serif] text-[14px] text-[#4a5565]">Ongoing</span>
                  </label>
                  {periodErrors.endDate && (
                    <p className="text-[#d4183d] text-[14px] mt-1">{periodErrors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddPeriod}
                  className={`px-6 py-3 rounded-[8px] font-['Inter',sans-serif] font-medium text-[16px] transition-colors ${
                    startDate && (isOngoing || endDate)
                      ? 'bg-[#0b3b2e] text-white hover:bg-[#0a3025]'
                      : 'bg-[#d1d5dc] text-[#6a7282] cursor-not-allowed opacity-50'
                  }`}
                  disabled={!startDate || (!isOngoing && !endDate)}
                >
                  Add Period
                </button>
                <button
                  onClick={() => {
                    setShowPeriodForm(false);
                    setStartDate('');
                    setEndDate('');
                    setIsOngoing(false);
                    setPeriodErrors({});
                  }}
                  className="border-2 border-[#0b3b2e] px-6 py-3 rounded-[8px] font-['Inter',sans-serif] font-medium text-[16px] text-[#0b3b2e] hover:bg-[#0b3b2e] hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </FormLayout>
  );
}
