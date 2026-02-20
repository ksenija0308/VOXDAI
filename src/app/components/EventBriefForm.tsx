import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Calendar as CalendarComponent } from './ui/calendar';
import { X as XIcon, Calendar, MapPin, Briefcase, Tag, Building2, Linkedin, Check, Copy, Clock, ChevronDown } from 'lucide-react';

interface EventBriefFormProps {
  onClose: () => void;
  organizerName?: string;
}

interface EventBriefData {
  eventName: string;
  tagline: string;
  eventLocation: string;
  topics: string;
  eventDate: string;
  eventTime: string;
}

export default function EventBriefForm({ onClose, organizerName = 'Your Organization' }: EventBriefFormProps) {
  const [step, setStep] = useState<'form' | 'share'>('form');
  const [copied, setCopied] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<EventBriefData>({
    eventName: '',
    tagline: '',
    eventLocation: '',
    topics: '',
    eventDate: '',
    eventTime: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EventBriefData, string>>>({});

  const updateField = (field: keyof EventBriefData, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof EventBriefData, string>> = {};

    if (!formData.eventName.trim()) newErrors.eventName = 'Event name is required';
    if (!formData.tagline.trim()) newErrors.tagline = 'Tagline is required';
    if (!formData.eventLocation.trim()) newErrors.eventLocation = 'Event location is required';
    if (!formData.topics.trim()) newErrors.topics = 'Topics are required';
    if (!formData.eventDate) newErrors.eventDate = 'Event date is required';
    if (!formData.eventTime) newErrors.eventTime = 'Event time is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setStep('share');
    }
  };

  const generateLinkedInPost = () => {
    const formattedDate = new Date(formData.eventDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    return `🎤 Exciting Speaking Opportunity! 

We're thrilled to announce that ${formData.tagline} is now accepting speaker applications!

📅 Event: ${formData.eventName}
📍 Location: ${formData.eventLocation}
🗓️ Date: ${formattedDate}
💡 Topics: ${formData.topics}

Whether you're a thought leader in the corporate world or an independent expert, we're looking for compelling voices to share insights and inspire our audience.

This is a fantastic opportunity to:
✨ Showcase your expertise on a prestigious platform
🤝 Network with industry leaders and innovators
🎯 Expand your professional reach and influence
📈 Position yourself as a go-to expert in your field

Ready to take the stage? 

👉 Apply to speak at: https://www.voxdai.com/

We welcome speakers from all backgrounds—from seasoned corporate executives to entrepreneurial trailblazers. If you have valuable insights to share, we want to hear from you!

#SpeakingOpportunity #CallForSpeakers #ProfessionalDevelopment #ThoughtLeadership #VOXDAI`;
  };

  const handleCopyPost = () => {
    navigator.clipboard.writeText(generateLinkedInPost());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareToLinkedIn = () => {
    const post = generateLinkedInPost();
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://www.voxdai.com/')}&text=${encodeURIComponent(post)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e9ebef]">
          <div>
            <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', fontSize: '24px' }}>
              {step === 'form' ? 'Create Event Brief' : 'Share on LinkedIn'}
            </h2>
            <p className="text-[#717182] mt-1" style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
              {step === 'form'
                ? 'Fill in the details to create your speaking opportunity brief'
                : 'Share this opportunity with your LinkedIn network'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#717182] hover:text-black transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form Step */}
        {step === 'form' && (
          <div className="p-6 space-y-6 max-h-[calc(100vh-280px)] overflow-y-auto" style={{ overflow: datePickerOpen || timePickerOpen ? 'visible' : undefined }}>
            {/* Event Name */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-[#717182]" />
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
                  Event Name <span className="text-[#d4183d]">*</span>
                </span>
              </label>
              <Input
                placeholder="e.g., Annual Innovation Summit 2025"
                value={formData.eventName}
                onChange={(e) => updateField('eventName', e.target.value)}
                className={errors.eventName ? 'border-[#d4183d]' : ''}
              />
              {errors.eventName && (
                <p className="text-[#d4183d] mt-1" style={{ fontSize: '12px' }}>{errors.eventName}</p>
              )}
            </div>

            {/* Tagline */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-[#717182]" />
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
                  Tagline <span className="text-[#d4183d]">*</span>
                </span>
              </label>
              <Input
                placeholder="e.g., Tech Leaders Conference"
                value={formData.tagline}
                onChange={(e) => updateField('tagline', e.target.value)}
                className={errors.tagline ? 'border-[#d4183d]' : ''}
              />
              {errors.tagline && (
                <p className="text-[#d4183d] mt-1" style={{ fontSize: '12px' }}>{errors.tagline}</p>
              )}
            </div>

            {/* Event Location */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-[#717182]" />
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
                  Event Location <span className="text-[#d4183d]">*</span>
                </span>
              </label>
              <Input
                placeholder="e.g., Zurich, Switzerland or Virtual Event"
                value={formData.eventLocation}
                onChange={(e) => updateField('eventLocation', e.target.value)}
                className={errors.eventLocation ? 'border-[#d4183d]' : ''}
              />
              {errors.eventLocation && (
                <p className="text-[#d4183d] mt-1" style={{ fontSize: '12px' }}>{errors.eventLocation}</p>
              )}
            </div>

            {/* Topics/Themes */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-[#717182]" />
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
                  General Topics/Themes <span className="text-[#d4183d]">*</span>
                </span>
              </label>
              <Input
                placeholder="e.g., AI, Digital Transformation, Leadership, Innovation"
                value={formData.topics}
                onChange={(e) => updateField('topics', e.target.value)}
                className={errors.topics ? 'border-[#d4183d]' : ''}
              />
              {errors.topics && (
                <p className="text-[#d4183d] mt-1" style={{ fontSize: '12px' }}>{errors.topics}</p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-[#717182]" />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
                    Event Date <span className="text-[#d4183d]">*</span>
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setDatePickerOpen(!datePickerOpen)}
                  className={`flex items-center w-full h-9 rounded-md border bg-white px-3 py-2 text-sm ${
                    !formData.eventDate ? 'text-[#717182]' : 'text-black'
                  } ${errors.eventDate ? 'border-[#d4183d]' : 'border-[#e9ebef]'} hover:border-[#0B3B2E] transition-colors`}
                >
                  <Calendar className="mr-2 h-4 w-4 text-[#717182] shrink-0" />
                  <span className="flex-1 text-left">
                    {formData.eventDate
                      ? format(new Date(formData.eventDate + 'T00:00:00'), 'MMMM d, yyyy')
                      : 'Select date'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-[#717182] shrink-0" />
                </button>
                {datePickerOpen && (
                  <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setDatePickerOpen(false)} />
                    <div ref={datePickerRef} className="absolute top-0 left-0 mt-1 z-[70] bg-white rounded-md border border-[#e9ebef] shadow-lg">
                      <CalendarComponent
                        mode="single"
                        selected={formData.eventDate ? new Date(formData.eventDate + 'T00:00:00') : undefined}
                        onSelect={(date) => {
                          if (date) {
                            updateField('eventDate', format(date, 'yyyy-MM-dd'));
                          }
                          setDatePickerOpen(false);
                        }}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </div>
                  </>
                )}
                {errors.eventDate && (
                  <p className="text-[#d4183d] mt-1" style={{ fontSize: '12px' }}>{errors.eventDate}</p>
                )}
              </div>
              <div className="relative">
                <label className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#717182]" />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
                    Event Time <span className="text-[#d4183d]">*</span>
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setTimePickerOpen(!timePickerOpen)}
                  className={`flex items-center w-full h-9 rounded-md border bg-white px-3 py-2 text-sm ${
                    !formData.eventTime ? 'text-[#717182]' : 'text-black'
                  } ${errors.eventTime ? 'border-[#d4183d]' : 'border-[#e9ebef]'} hover:border-[#0B3B2E] transition-colors`}
                >
                  <Clock className="mr-2 h-4 w-4 text-[#717182] shrink-0" />
                  <span className="flex-1 text-left">
                    {formData.eventTime
                      ? (() => {
                          const [h, m] = formData.eventTime.split(':').map(Number);
                          const period = h >= 12 ? 'PM' : 'AM';
                          const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
                          return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
                        })()
                      : 'Select time'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-[#717182] shrink-0" />
                </button>
                {timePickerOpen && (
                  <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setTimePickerOpen(false)} />
                    <div ref={timePickerRef} className="absolute top-full left-0 mt-1 z-[70] bg-white rounded-md border border-[#e9ebef] shadow-lg w-full max-h-60 overflow-y-auto">
                      {Array.from({ length: 48 }, (_, i) => {
                        const hours = Math.floor(i / 2);
                        const minutes = i % 2 === 0 ? '00' : '30';
                        const value = `${String(hours).padStart(2, '0')}:${minutes}`;
                        const period = hours >= 12 ? 'PM' : 'AM';
                        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                        const label = `${displayHours}:${minutes} ${period}`;
                        const isSelected = formData.eventTime === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              updateField('eventTime', value);
                              setTimePickerOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-[#f3f3f5] transition-colors ${
                              isSelected ? 'bg-[#0B3B2E] text-white hover:bg-[#0B3B2E]' : 'text-black'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
                {errors.eventTime && (
                  <p className="text-[#d4183d] mt-1" style={{ fontSize: '12px' }}>{errors.eventTime}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Share Step */}
        {step === 'share' && (
          <div className="p-6 space-y-6">
            <div className="bg-[#f3f3f5] rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-[#0077B5] rounded flex items-center justify-center shrink-0">
                  <Linkedin className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', fontSize: '16px' }}>
                    LinkedIn Post Preview
                  </h3>
                  <p className="text-[#717182] mt-1" style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                    Share this speaking opportunity with your network
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 mb-4 border border-[#e9ebef] max-h-[400px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-[#1d1d1f]" style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                  {generateLinkedInPost()}
                </pre>
              </div>

              <div className="flex items-center gap-2 p-3 bg-[#0B3B2E]/10 rounded-lg border border-[#0B3B2E]/20">
                <div className="flex-1">
                  <p style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif', color: '#0B3B2E', fontWeight: '500' }}>
                    🔗 Link directs to: https://www.voxdai.com/
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#f9f9f9] rounded-lg p-4 border border-[#e9ebef]">
              <h4 className="mb-2" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', fontSize: '14px' }}>
                Event Summary
              </h4>
              <div className="space-y-2 text-[#717182]" style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                <p><strong className="text-black">Event:</strong> {formData.eventName}</p>
                <p><strong className="text-black">Conference:</strong> {formData.tagline}</p>
                <p><strong className="text-black">Location:</strong> {formData.eventLocation}</p>
                <p><strong className="text-black">Date:</strong> {new Date(formData.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {formData.eventTime ? (() => { const [h, m] = formData.eventTime.split(':').map(Number); const period = h >= 12 ? 'PM' : 'AM'; const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h; return `${displayH}:${String(m).padStart(2, '0')} ${period}`; })() : formData.eventTime}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-[#e9ebef] bg-[#f9f9f9]">
          {step === 'form' ? (
            <>
              <Button
                onClick={onClose}
                variant="outline"
                className="border-[#e9ebef] text-[#717182] hover:border-[#0B3B2E] hover:text-black"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-[#0B3B2E] text-white hover:bg-[#0B3B2E]/90 px-8"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}
              >
                Continue to Share
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setStep('form')}
                variant="outline"
                className="border-[#e9ebef] text-[#717182] hover:border-[#0B3B2E] hover:text-black"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                ← Back to Edit
              </Button>
              <div className="flex gap-3">
                <Button
                  onClick={handleCopyPost}
                  variant="outline"
                  className="border-[#0B3B2E] text-[#0B3B2E] hover:bg-[#0B3B2E]/10"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Post
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleShareToLinkedIn}
                  className="bg-[#0077B5] text-white hover:bg-[#006097] px-6"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  Share on LinkedIn
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
