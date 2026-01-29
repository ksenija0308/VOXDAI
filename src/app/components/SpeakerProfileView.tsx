import { ArrowLeft, Calendar, Users, Tag } from 'lucide-react';
import { Button } from './ui/button';

interface SpeakerProfileProps {
  speaker: {
    name: string;
    topic: string;
    match?: number;
  };
  onClose: () => void;
  onContact: () => void;
}

export default function SpeakerProfileView({ speaker, onClose, onContact }: SpeakerProfileProps) {
  // Mock speaker data - in a real app, this would be fetched based on the speaker
  const profileData = {
    name: speaker.name,
    title: speaker.topic,
    subtitle: 'Expert Speaker',
    audienceSize: '1,000+',
    topicsCount: '5',
    about: `With over 15 years of experience in ${speaker.topic.toLowerCase()}, I help organizations navigate digital transformation and leverage AI for business growth. I have spoken at 50+ conferences worldwide, reaching audiences of tech leaders, entrepreneurs, and innovators.`,
    topics: [
      speaker.topic,
      'Digital Transformation',
      'Future of Work',
      'Innovation Strategy'
    ],
    availability: 'Hybrid State',
    speakingFormats: ['Keynote', 'Workshop', 'Panel Discussion'],
    experience: '15+ years',
    eventsSpoken: '50+',
    rating: '4.9/5'
  };

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
          <button
            className="text-[#717182] hover:text-black"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
          >
            View Profile Preview
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white border-2 border-[#e9ebef] rounded-lg p-8 mb-6">
          {/* Speaker Header */}
          <div className="flex items-start gap-6 mb-8">
            <div className="w-24 h-24 bg-[#0B3B2E] rounded-lg flex items-center justify-center text-white shrink-0" style={{ fontSize: '32px', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>
              {profileData.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="mb-2" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>
                {profileData.name}
              </h1>
              <p className="text-[#717182] mb-4" style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>
                {profileData.title} | {profileData.subtitle}
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-[#717182]">
                  <Users className="w-4 h-4" />
                  <span style={{ fontSize: '14px' }}>{profileData.audienceSize} audience</span>
                </div>
                <div className="flex items-center gap-2 text-[#717182]">
                  <Tag className="w-4 h-4" />
                  <span style={{ fontSize: '14px' }}>{profileData.topicsCount} topics</span>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="mb-8">
            <h2 className="mb-4" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', fontSize: '20px' }}>
              About
            </h2>
            <p className="text-[#717182] leading-relaxed" style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>
              {profileData.about}
            </p>
          </div>

          {/* Topics & Expertise */}
          <div className="mb-8">
            <h2 className="mb-4" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', fontSize: '20px' }}>
              Topics & Expertise
            </h2>
            <div className="flex flex-wrap gap-3">
              {profileData.topics.map((topic, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-[#0B3B2E] text-white rounded"
                  style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Speaking Availability */}
          <div className="mb-8">
            <h2 className="mb-4 flex items-center gap-2" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', fontSize: '20px' }}>
              <Calendar className="w-5 h-5" />
              Speaking Availability
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#0B3B2E] rounded-full"></div>
              <span style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>
                {profileData.availability}
              </span>
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
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-6"
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
