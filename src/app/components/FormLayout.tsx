import { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface FormLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSaveExit: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  prevDisabled?: boolean;
  progress: number;
  title: string;
  subtitle?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
  isLoading?: boolean;
}

const steps = [
  { number: 1, label: 'Basics' },
  { number: 2, label: 'About' },
  { number: 3, label: 'Events' },
  { number: 4, label: 'Preferences' },
  { number: 5, label: 'Review' },
];

export default function FormLayout({
  children,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSaveExit,
  nextLabel = 'Continue',
  nextDisabled = false,
  prevDisabled = false,
  progress,
  title,
  subtitle,
  hideHeader = false,
  hideFooter = false,
  isLoading = false,
}: FormLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      {!hideHeader && (
        <div className="border-b border-[#e9ebef]">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', color: '#0B3B2E' }}>VOXD</h2>
            </div>
            <Button
              variant="ghost"
              onClick={onSaveExit}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Save & exit
            </Button>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="border-b border-[#e9ebef]">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
              Profile completion
            </span>
            <span style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
              {progress}%
            </span>
          </div>
          <div className="relative w-full h-2 bg-[#e9ebef] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#0B3B2E] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="border-b border-[#e9ebef]">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      step.number < currentStep
                        ? 'bg-[#0B3B2E] border-[#0B3B2E]'
                        : step.number === currentStep
                        ? 'border-[#0B3B2E] bg-white'
                        : 'border-[#e9ebef] bg-white'
                    }`}
                  >
                    {step.number < currentStep ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <span
                        className={step.number === currentStep ? 'text-[#0B3B2E]' : 'text-[#717182]'}
                        style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}
                      >
                        {step.number}
                      </span>
                    )}
                  </div>
                  <span
                    className={`mt-2 text-center ${
                      step.number <= currentStep ? 'text-black' : 'text-[#717182]'
                    }`}
                    style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    step.number < currentStep ? 'bg-[#0B3B2E]' : 'bg-[#e9ebef]'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="mb-2" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-[#717182]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {subtitle}
            </p>
          )}
        </div>

        <div className="space-y-6 mb-12">{children}</div>

        {/* Navigation */}
        {!hideFooter && (
          <div className="flex items-center justify-between pt-6 border-t border-[#e9ebef]">
            <button
              onClick={onPrev}
              disabled={prevDisabled}
              className={`border-2 rounded-[12px] px-8 py-3.5 font-['Inter',sans-serif] font-medium text-[16px] transition-all ${
                prevDisabled
                  ? 'border-[#e9ebef] text-[#d1d5dc] cursor-not-allowed'
                  : 'border-[#d1d5dc] text-[#4a5565] hover:border-[#0b3b2e] hover:text-[#0b3b2e]'
              }`}
            >
              Back
            </button>
            <button
              onClick={onNext}
              disabled={nextDisabled || isLoading}
              className={`rounded-[12px] px-8 py-3.5 font-['Inter',sans-serif] font-medium text-[16px] text-white shadow-lg hover:shadow-xl transition-all ${
                nextDisabled || isLoading
                  ? 'bg-[#d1d5dc] cursor-not-allowed'
                  : 'bg-[#0b3b2e] hover:bg-[#0b3b2e]/90'
              }`}
            >
              {isLoading ? 'Saving...' : nextLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}