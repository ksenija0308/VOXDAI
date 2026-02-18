import { useState } from 'react';
import { X as XIcon, Calendar as CalendarIcon, Clock, MapPin, FileText, Download, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { createBooking } from '@/utils/booking';

interface BookSpeakerModalProps {
  speakerProfileId: string;
  speakerName: string;
  speakerTopic: string;
  onClose: () => void;
}

export default function BookSpeakerModal({ speakerProfileId, speakerName, speakerTopic, onClose }: BookSpeakerModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [eventTitle, setEventTitle] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDuration, setEventDuration] = useState('45');
  const [eventTime, setEventTime] = useState('10:00');
  const [eventNotes, setEventNotes] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleGoogleCalendar = () => {
    if (!selectedDate) {
      alert('Please select a date first');
      return;
    }

    const startDate = new Date(selectedDate);
    const [hours, minutes] = eventTime.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + parseInt(eventDuration));

    const formatGoogleDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const title = eventTitle || `Speaking Engagement with ${speakerName}`;
    const description = `Topic: ${speakerTopic}\n\n${eventNotes}`;
    const location = eventLocation;

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}&sf=true&output=xml`;

    window.open(googleCalendarUrl, '_blank');
  };

  const handleCalendly = () => {
    // In a real implementation, this would use the Calendly API
    // For now, we'll open a mock Calendly link
    const calendlyUrl = `https://calendly.com/schedule?name=${encodeURIComponent(speakerName)}`;
    window.open(calendlyUrl, '_blank');
  };

  const handleICalDownload = () => {
    if (!selectedDate) {
      alert('Please select a date first');
      return;
    }

    const startDate = new Date(selectedDate);
    const [hours, minutes] = eventTime.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + parseInt(eventDuration));

    const formatICalDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const title = eventTitle || `Speaking Engagement with ${speakerName}`;
    const description = `Topic: ${speakerTopic}\\n\\n${eventNotes}`;
    const location = eventLocation;

    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//VOXD//Event Booking//EN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@voxd.com`,
      `DTSTAMP:${formatICalDate(new Date())}`,
      `DTSTART:${formatICalDate(startDate)}`,
      `DTEND:${formatICalDate(endDate)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${speakerName.replace(/\s+/g, '-')}-booking.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Revoke object URL to prevent memory leak
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#e9ebef] p-4 sm:p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="mb-1" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>
              Book Speaker
            </h2>
            <p className="text-[#717182]" style={{ fontSize: '14px' }}>
              {speakerName} • {speakerTopic}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#717182] hover:text-black transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Event Details Section */}
          <div>
            <h3 className="mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
              Event Details
            </h3>

            <div className="space-y-4">
              {/* Event Title */}
              <div>
                <label className="block mb-2 text-[#717182]" style={{ fontSize: '14px' }}>
                  Event Title
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder={`Speaking Engagement with ${speakerName}`}
                  className="w-full p-3 border-2 border-[#e9ebef] rounded-lg focus:outline-none focus:border-[#0B3B2E] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                />
              </div>

              {/* Date Selection */}
              <div>
                <label className="block mb-2 text-[#717182]" style={{ fontSize: '14px' }}>
                  Event Date *
                </label>
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="w-full p-3 border-2 border-[#e9ebef] rounded-lg hover:border-[#0B3B2E] transition-colors text-left flex items-center justify-between"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                >
                  <span className={selectedDate ? 'text-black' : 'text-[#717182]'}>
                    {selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : 'Select a date'}
                  </span>
                  <CalendarIcon className="w-5 h-5 text-[#717182]" />
                </button>
                
                {showCalendar && (
                  <div className="mt-2 p-4 border-2 border-[#e9ebef] rounded-lg bg-white">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setShowCalendar(false);
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </div>
                )}
              </div>

              {/* Time and Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-[#717182]" style={{ fontSize: '14px' }}>
                    <Clock className="w-4 h-4 inline mr-1" />
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full p-3 border-2 border-[#e9ebef] rounded-lg focus:outline-none focus:border-[#0B3B2E] transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-[#717182]" style={{ fontSize: '14px' }}>
                    Duration (minutes)
                  </label>
                  <select
                    value={eventDuration}
                    onChange={(e) => setEventDuration(e.target.value)}
                    className="w-full p-3 border-2 border-[#e9ebef] rounded-lg focus:outline-none focus:border-[#0B3B2E] transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block mb-2 text-[#717182]" style={{ fontSize: '14px' }}>
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="e.g., Virtual (Zoom) or San Francisco, CA"
                  className="w-full p-3 border-2 border-[#e9ebef] rounded-lg focus:outline-none focus:border-[#0B3B2E] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block mb-2 text-[#717182]" style={{ fontSize: '14px' }}>
                  <FileText className="w-4 h-4 inline mr-1" />
                  Additional Notes
                </label>
                <textarea
                  value={eventNotes}
                  onChange={(e) => setEventNotes(e.target.value)}
                  placeholder="Add any additional details about the event..."
                  rows={4}
                  className="w-full p-3 border-2 border-[#e9ebef] rounded-lg focus:outline-none focus:border-[#0B3B2E] transition-colors resize-none"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                />
              </div>
            </div>
          </div>

          {/* Calendar Integration Options */}
          <div className="border-t border-[#e9ebef] pt-6">
            <h3 className="mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
              Add to Calendar
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Google Calendar */}
              <Button
                onClick={handleGoogleCalendar}
                variant="outline"
                className="border-2 border-[#e9ebef] hover:border-[#0B3B2E] hover:bg-[#f3f3f5] h-auto py-4 flex-col gap-2"
              >
                <ExternalLink className="w-5 h-5 text-[#0B3B2E]" />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
                  Google Calendar
                </span>
              </Button>

              {/* Calendly */}
              <Button
                onClick={handleCalendly}
                variant="outline"
                className="border-2 border-[#e9ebef] hover:border-[#0B3B2E] hover:bg-[#f3f3f5] h-auto py-4 flex-col gap-2"
              >
                <ExternalLink className="w-5 h-5 text-[#0B3B2E]" />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
                  Calendly
                </span>
              </Button>

              {/* iCal Download */}
              <Button
                onClick={handleICalDownload}
                variant="outline"
                className="border-2 border-[#e9ebef] hover:border-[#0B3B2E] hover:bg-[#f3f3f5] h-auto py-4 flex-col gap-2"
              >
                <Download className="w-5 h-5 text-[#0B3B2E]" />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
                  Download .ics
                </span>
              </Button>
            </div>

            <p className="mt-4 text-[#717182] text-center" style={{ fontSize: '13px' }}>
              Select a calendar option to send an invite to {speakerName}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-[#e9ebef] p-4 sm:p-6 flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-2 border-[#e9ebef] hover:bg-[#f3f3f5]"
          >
            Cancel
          </Button>
          <Button
            disabled={isSending}
            onClick={async () => {
              if (!selectedDate) {
                toast.error('Please select a date first');
                return;
              }

              const startDate = new Date(selectedDate);
              const [hours, minutes] = eventTime.split(':');
              startDate.setHours(parseInt(hours), parseInt(minutes), 0);

              const endDate = new Date(startDate);
              endDate.setMinutes(endDate.getMinutes() + parseInt(eventDuration));

              const title = eventTitle || `Speaking Engagement with ${speakerName}`;
              const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

              setIsSending(true);
              try {
                await createBooking({
                  speakerProfileId,
                  title,
                  startsAt: startDate.toISOString(),
                  endsAt: endDate.toISOString(),
                  timezone,
                  location: eventLocation || undefined,
                  notes: eventNotes || undefined,
                });
                toast.success(`Booking request sent to ${speakerName}!`);
                onClose();
              } catch (err: any) {
                toast.error(err?.message || 'Failed to send booking request. Please try again.');
              } finally {
                setIsSending(false);
              }
            }}
            className="bg-[#0B3B2E] text-white hover:bg-black"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Booking Request'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}