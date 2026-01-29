import { useState } from 'react';
import { FormData } from '../App';
import FormLayout from './FormLayout';
import svgPaths from '../../imports/svg-zbs72l16lo';
import { Calendar, X } from 'lucide-react';

interface SpeakerAvailabilityPeriodsScreenFigmaProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  nextScreen: () => void;
  prevScreen: () => void;
  goToScreen: (screen: number) => void;
  progress: number;
}

export default function SpeakerAvailabilityPeriodsScreenFigma({
  formData,
  updateFormData,
  nextScreen,
  prevScreen,
  goToScreen,
  progress,
}: SpeakerAvailabilityPeriodsScreenFigmaProps) {
  const [showForm, setShowForm] = useState(formData.availabilityPeriods.length === 0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isOngoing, setIsOngoing] = useState(false);
  const [errors, setErrors] = useState<{ startDate?: string; endDate?: string }>({});

  const handleAddPeriod = () => {
    const newErrors: { startDate?: string; endDate?: string } = {};

    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!isOngoing && !endDate) {
      newErrors.endDate = 'End date is required unless ongoing';
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
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
      setShowForm(false);
      setErrors({});
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
      currentStep={10}
      totalSteps={11}
      onPrev={prevScreen}
      onNext={nextScreen}
      onSaveExit={() => goToScreen(0)}
      progress={progress}
      hideHeader={true}
      hideFooter={true}
    >
      <div className="bg-[#f9fafb] min-h-screen relative w-full">
        {/* Header */}
        <div className="bg-white border-b border-[#e5e7eb] px-6 py-4">
          <h1 className="font-['Arimo',sans-serif] font-bold text-[40px] tracking-[-0.8px]">VOXD</h1>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border-b border-[#e5e7eb] px-6 py-3">
          <div className="flex justify-between items-center mb-2">
            <p className="font-['Inter',sans-serif] text-[16px]">Profile Completion</p>
            <p className="font-['Inter',sans-serif] text-[16px] text-[#0b3b2e]">{progress}%</p>
          </div>
          <div className="bg-[#e5e7eb] h-[12px] rounded-full overflow-hidden">
            <div className="bg-[#0b3b2e] h-full rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[672px] mx-auto my-12 bg-white rounded-[16px] border border-[#e5e7eb] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-6">
          {/* Header */}
          <div className="mb-2">
            <h2 className="font-['Arimo',sans-serif] font-bold text-[32px] tracking-[-0.32px]">Availability Periods</h2>
          </div>

          <p className="text-[#4a5565] text-[16px] mb-8">
            Define time periods when you're available for speaking engagements. Event organizers will know when they can send you requests during these periods.
          </p>

          {/* Current Status Box */}
          <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-[10px] p-4 mb-8 flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 20 20">
              <path d="M6.66667 1.66667V5" stroke="#0B3B2E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              <path d="M13.3333 1.66667V5" stroke="#0B3B2E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              <path d={svgPaths.p1da67b80} stroke="#0B3B2E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              <path d="M2.5 8.33333H17.5" stroke="#0B3B2E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            </svg>
            <div className="flex-1">
              <p className="font-['Inter',sans-serif] text-[16px]">{formData.availabilityPeriods.length} period{formData.availabilityPeriods.length !== 1 ? 's' : ''} defined</p>
              <p className="font-['Inter',sans-serif] text-[16px] text-[#4a5565]">
                {formData.availabilityPeriods.length === 0 
                  ? "Add time ranges when you're available to speak"
                  : "Manage your availability periods below"}
              </p>
            </div>
          </div>

          {/* Existing Periods List */}
          {formData.availabilityPeriods.length > 0 && (
            <div className="mb-6 space-y-3">
              {formData.availabilityPeriods.map((period) => (
                <div
                  key={period.id}
                  className="bg-white border border-[#e5e7eb] rounded-[10px] p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#0b3b2e]" />
                    <div>
                      <p className="font-['Inter',sans-serif] text-[16px]">
                        {formatDate(period.startDate)} - {period.ongoing ? 'Ongoing' : formatDate(period.endDate)}
                      </p>
                      {period.ongoing && (
                        <p className="font-['Inter',sans-serif] text-[14px] text-[#4a5565]">No end date</p>
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
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-[#0b3b2e] text-white px-6 py-3 rounded-[10px] font-['Inter',sans-serif] font-medium text-[16px] hover:bg-[#0a3025] transition-colors mb-6"
            >
              Add Availability Period
            </button>
          )}

          {/* Add New Period Form */}
          {showForm && (
            <div className="bg-[rgba(11,59,46,0.05)] border-2 border-[#0b3b2e] rounded-[10px] p-6 mb-6">
              <h3 className="font-['Arimo',sans-serif] font-bold text-[24px] mb-4">Add New Availability Period</h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Start Date */}
                <div>
                  <label className="block mb-2 font-['Inter',sans-serif] font-medium text-[14px]">
                    Start Date <span className="text-[#e7000b]">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white border border-[#d1d5dc] rounded-[6.8px] h-[51px] px-4 font-['Inter',sans-serif] text-[16px] focus:outline-none focus:border-[#0b3b2e] focus:ring-1 focus:ring-[#0b3b2e]"
                  />
                  {errors.startDate && (
                    <p className="text-[#e7000b] text-[14px] mt-1">{errors.startDate}</p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label className="block mb-2 font-['Inter',sans-serif] font-medium text-[14px]">
                    End Date {!isOngoing && <span className="text-[#e7000b]">*</span>}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isOngoing}
                    className={`w-full border border-[#d1d5dc] rounded-[6.8px] h-[51px] px-4 font-['Inter',sans-serif] text-[16px] mb-3 focus:outline-none focus:border-[#0b3b2e] focus:ring-1 focus:ring-[#0b3b2e] ${
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
                          setErrors({ ...errors, endDate: undefined });
                        }
                      }}
                      className="w-[16px] h-[16px] border border-[#d1d5dc] rounded cursor-pointer accent-[#0b3b2e]"
                    />
                    <span className="font-['Inter',sans-serif] font-medium text-[14px] text-[#4a5565]">Ongoing</span>
                  </label>
                  {errors.endDate && (
                    <p className="text-[#e7000b] text-[14px] mt-1">{errors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddPeriod}
                  className={`px-6 py-3 rounded-[10px] font-['Inter',sans-serif] font-medium text-[16px] transition-colors ${
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
                    setShowForm(false);
                    setStartDate('');
                    setEndDate('');
                    setIsOngoing(false);
                    setErrors({});
                  }}
                  className="border-2 border-[#0b3b2e] px-6 py-3 rounded-[10px] font-['Inter',sans-serif] font-medium text-[16px] text-[#0b3b2e] hover:bg-[#0b3b2e] hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="bg-white border-t border-[#e5e7eb] px-[111px] py-4">
          <div className="flex justify-between max-w-[1200px] mx-auto">
            <button
              onClick={prevScreen}
              className="border-2 border-[#0b3b2e] rounded-[10px] px-6 py-3 font-['Inter',sans-serif] font-medium text-[16px] text-[#0b3b2e] hover:bg-[#0b3b2e] hover:text-white transition-colors"
            >
              Back
            </button>
            <button
              onClick={nextScreen}
              className={`rounded-[10px] px-6 py-3 font-['Inter',sans-serif] font-medium text-[16px] transition-colors ${
                formData.availabilityPeriods.length > 0
                  ? 'bg-[#0b3b2e] text-white hover:bg-[#0a3025]'
                  : 'bg-[#d1d5dc] text-[#6a7282] opacity-60 cursor-not-allowed'
              }`}
              disabled={formData.availabilityPeriods.length === 0}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </FormLayout>
  );
}
