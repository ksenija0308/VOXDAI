import { useNavigate } from 'react-router-dom';
import { CircleCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { ProfileSection } from '@/types/dashboard';

interface ProfileCompletenessProps {
  profileCompletion: number;
  profileSections: ProfileSection[];
}

export default function ProfileCompleteness({ profileCompletion, profileSections }: ProfileCompletenessProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f3f3f5] p-6 rounded-lg">
      <h3 className="mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
        Profile Completeness
      </h3>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontSize: '14px' }}>Overall progress</span>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>{profileCompletion}%</span>
        </div>
        <div className="relative w-full h-2 bg-white rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0B3B2E] transition-all duration-300"
            style={{ width: `${profileCompletion}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {profileSections.map((section, index) => (
          <div key={index} className="flex items-start gap-2">
            {section.complete ? (
              <CircleCheck className="w-5 h-5 text-[#0B3B2E] mt-0.5" />
            ) : (
              <div className="w-5 h-5 border-2 border-[#e9ebef] rounded-full mt-0.5" />
            )}
            <div className="flex-1">
              <p style={{ fontSize: '14px' }}>{section.name}</p>
              <p className="text-[#717182]" style={{ fontSize: '12px' }}>
                {section.complete ? 'Complete' : section.recommended ? 'Recommended' : 'Incomplete'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        className="w-full mt-4"
        style={{ fontFamily: 'Inter, sans-serif' }}
        onClick={() => navigate('/profile')}
      >
        Complete profile
      </Button>
    </div>
  );
}
