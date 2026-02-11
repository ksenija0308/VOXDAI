import { ArrowLeft, Calendar, MapPin, DollarSign, Globe, Video, Clock } from 'lucide-react';
import { Button } from './ui/button';

interface SpeakerProfileProps {
  speaker: {
    name: string;
    topic: string;
    match?: number;
    expertise?: string;
    availability?: string;
    hasVideo?: boolean;
    speakingFormat?: string[];
    experienceLevel?: string;
    language?: string[];
    feeRange?: string;
    location?: string;
    bio?: string;
    profilePhoto?: string | null;
  };
  onClose: () => void;
  onContact: () => void;
}

export default function SpeakerProfileView({ speaker, onClose, onContact }: SpeakerProfileProps) {
console.log('speaker', speaker)
  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-[#717182] hover:text-black"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          {speaker.match != null && (
            <span className="px-3 py-1 bg-[#0B3B2E] text-white rounded-full" style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
              {speaker.match}% match
            </span>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white border-2 border-[#e9ebef] rounded-lg p-8 mb-6">
          {/* Speaker Header */}
          <div className="flex items-start gap-6 mb-8">
            {speaker.profilePhoto ? (
              <img src={speaker.profilePhoto} alt={speaker.name} className="w-24 h-24 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-24 h-24 bg-[#0B3B2E] rounded-lg flex items-center justify-center text-white shrink-0" style={{ fontSize: '32px', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>
                {speaker.name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <h1 className="mb-2" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>
                {speaker.name}
              </h1>
              {speaker.expertise && (
                <p className="text-[#717182] mb-3" style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>
                  {speaker.expertise}
                </p>
              )}
              <div className="flex items-center gap-4 flex-wrap">
                {speaker.location && (
                  <div className="flex items-center gap-2 text-[#717182]">
                    <MapPin className="w-4 h-4" />
                    <span style={{ fontSize: '14px' }}>{speaker.location}</span>
                  </div>
                )}
                {speaker.experienceLevel && speaker.experienceLevel !== 'Not specified' && (
                  <div className="flex items-center gap-2 text-[#717182]">
                    <Clock className="w-4 h-4" />
                    <span style={{ fontSize: '14px' }}>{speaker.experienceLevel} experience</span>
                  </div>
                )}
                {speaker.hasVideo && (
                  <div className="flex items-center gap-2 text-[#0B3B2E]">
                    <Video className="w-4 h-4" />
                    <span style={{ fontSize: '14px' }}>Video intro available</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* About */}
          {speaker.bio && (
            <div className="mb-8">
              <h2 className="mb-4" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', fontSize: '20px' }}>
                About
              </h2>
              <p className="text-[#717182] leading-relaxed" style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>
                {speaker.bio}
              </p>
            </div>
          )}

          {/* Topics & Expertise */}
          <div className="mb-8">
            <h2 className="mb-4" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', fontSize: '20px' }}>
              Topic
            </h2>
            <div className="flex flex-wrap gap-3">
              <span
                className="px-4 py-2 bg-[#0B3B2E] text-white rounded"
                style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
              >
                {speaker.topic}
              </span>
            </div>
          </div>

          {/* Speaking Formats */}
          {speaker.speakingFormat && speaker.speakingFormat.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', fontSize: '20px' }}>
                Speaking Formats
              </h2>
              <div className="flex flex-wrap gap-3">
                {speaker.speakingFormat.map((format, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 border-2 border-[#e9ebef] rounded"
                    style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {speaker.language && speaker.language.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 flex items-center gap-2" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', fontSize: '20px' }}>
                <Globe className="w-5 h-5" />
                Languages
              </h2>
              <div className="flex flex-wrap gap-3">
                {speaker.language.map((lang, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 border-2 border-[#e9ebef] rounded"
                    style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Speaking Availability & Fee */}
          <div className="mb-8">
            <h2 className="mb-4 flex items-center gap-2" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', fontSize: '20px' }}>
              <Calendar className="w-5 h-5" />
              Speaking Availability
            </h2>
            <div className="space-y-3">
              {speaker.availability && (
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${speaker.availability === 'Available' ? 'bg-green-500' : 'bg-[#717182]'}`}></div>
                  <span style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>
                    {speaker.availability}
                  </span>
                </div>
              )}
              {speaker.feeRange && (
                <div className="flex items-center gap-2 text-[#717182]">
                  <DollarSign className="w-4 h-4" />
                  <span style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                    {speaker.feeRange}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Booking CTA */}
          <div className="bg-[#0B3B2E] rounded-lg p-8 text-center text-white">
            <h3 className="mb-2" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', fontSize: '22px' }}>
              Interested in booking this speaker?
            </h3>
            <p className="mb-6" style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>
              Contact us to check availability and discuss your event requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onContact}
                className="bg-white text-[#0B3B2E] hover:bg-[#f3f3f5] px-8 py-6"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}
              >
                Contact for Booking
              </Button>
              <Button
                onClick={onClose}
                className="bg-white text-[#0B3B2E] hover:bg-[#f3f3f5] px-8 py-6"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[#717182]" style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
          Powered by VOXD Speaker Platform
        </p>
      </div>
    </div>
  );
}
