import { CircleCheck, Search, FileText, LayoutDashboard } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect, useMemo } from 'react';
import EventBriefForm from './EventBriefForm';
import { FormData } from '../App';

interface SuccessScreenProps {
  nextScreen: () => void;
  formData?: FormData;
}

export default function SuccessScreen({ nextScreen, formData }: SuccessScreenProps) {
  const [showEventBrief, setShowEventBrief] = useState(false);
  const isSpeaker = formData?.userType === 'speaker';
  
  // Create profile photo URL with proper cleanup
  const profilePhotoUrl = useMemo(() => {
    if (formData?.profilePhoto instanceof File) {
      return URL.createObjectURL(formData.profilePhoto);
    }
    return null;
  }, [formData?.profilePhoto]);

  // Cleanup object URL on unmount or when photo changes
  useEffect(() => {
    return () => {
      if (profilePhotoUrl) {
        URL.revokeObjectURL(profilePhotoUrl);
      }
    };
  }, [profilePhotoUrl]);
  
  // Get user's name
  const getUserName = () => {
    if (isSpeaker && formData?.firstName && formData?.lastName) {
      return `${formData.firstName} ${formData.lastName}`;
    }
    if (!isSpeaker && formData?.organisationName) {
      return formData.organisationName;
    }
    return 'User';
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e7eb]">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', color: '#0B3B2E' }}>VOXD</h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white rounded-[16px] border border-[#e5e7eb] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-12 text-center">
          
          {/* Success Checkmark */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-[#0B3B2E] rounded-full flex items-center justify-center">
              <CircleCheck className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Profile Photo */}
          {profilePhotoUrl && (
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#0B3B2E] shadow-lg">
                <img 
                  src={profilePhotoUrl} 
                  alt={getUserName()}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Success Message */}
          <h1 className="mb-4" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>
            Profile Published Successfully!
          </h1>

          <p className="text-[#4a5565] mb-2 text-[20px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
            Welcome, {getUserName()}!
          </p>

          <p className="text-[#717182] mb-10 max-w-lg mx-auto" style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>
            {isSpeaker 
              ? "Your speaker profile is now live. Event organizers can discover you and you can start receiving speaking opportunities."
              : "Your event organiser profile is now live. Speakers can discover your organisation and you can start building your speaker network."
            }
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <button
              className="bg-[#0b3b2e] rounded-[12px] px-8 py-3.5 font-['Inter',sans-serif] font-medium text-[16px] text-white hover:bg-[#0b3b2e]/90 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              onClick={nextScreen}
            >
              <LayoutDashboard className="w-5 h-5" />
              Go to Dashboard
            </button>

            {!isSpeaker && (
              <>
                <button
                  className="border-2 border-[#d1d5dc] rounded-[12px] px-8 py-3.5 font-['Inter',sans-serif] font-medium text-[16px] text-[#4a5565] hover:border-[#0b3b2e] hover:text-[#0b3b2e] transition-all flex items-center justify-center gap-2"
                  onClick={nextScreen}
                >
                  <Search className="w-5 h-5" />
                  Find a Speaker
                </button>

                <button
                  className="border-2 border-[#d1d5dc] rounded-[12px] px-8 py-3.5 font-['Inter',sans-serif] font-medium text-[16px] text-[#4a5565] hover:border-[#0b3b2e] hover:text-[#0b3b2e] transition-all flex items-center justify-center gap-2"
                  onClick={() => setShowEventBrief(true)}
                >
                  <FileText className="w-5 h-5" />
                  Create Event Brief
                </button>
              </>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-[#f9fafb] border border-[#e5e7eb] p-6 rounded-[12px] text-left">
            <h3 className="mb-4 text-[18px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: '600' }}>
              Next steps
            </h3>
            <ul className="space-y-3 text-[#4a5565]" style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
              {isSpeaker ? (
                <>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#0B3B2E] rounded-full mt-1.5 shrink-0" />
                    <span>Browse event opportunities and connect with organizers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#0B3B2E] rounded-full mt-1.5 shrink-0" />
                    <span>Upload demo videos to showcase your speaking style</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#0B3B2E] rounded-full mt-1.5 shrink-0" />
                    <span>Keep your calendar updated with your availability</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#0B3B2E] rounded-full mt-1.5 shrink-0" />
                    <span>Browse our speaker directory to find your ideal match</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#0B3B2E] rounded-full mt-1.5 shrink-0" />
                    <span>Create detailed event briefs to attract the right speakers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#0B3B2E] rounded-full mt-1.5 shrink-0" />
                    <span>Complete optional profile sections to improve matching quality</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Event Brief Form Modal */}
      {showEventBrief && (
        <EventBriefForm onClose={() => setShowEventBrief(false)} />
      )}
    </div>
  );
}