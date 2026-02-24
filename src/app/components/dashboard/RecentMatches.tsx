import { TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { SearchResult } from '@/types/dashboard';

interface RecentMatchesProps {
  recentMatches: SearchResult[];
  recentMatchesVisible: number;
  onLoadMore: () => void;
  userType: string;
  onContact: (match: SearchResult) => void;
  onBookSpeaker: (match: SearchResult) => void;
  onViewProfile: (match: SearchResult) => void;
}

export default function RecentMatches({
  recentMatches,
  recentMatchesVisible,
  onLoadMore,
  userType,
  onContact,
  onBookSpeaker,
  onViewProfile,
}: RecentMatchesProps) {
  return (
    <div className="bg-white border border-[#e9ebef] p-6 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>Recent Matches</h3>
        <TrendingUp className="w-5 h-5 text-[#0B3B2E]" />
      </div>

      {recentMatches.length === 0 ? (
        <p className="text-[#717182] text-center py-6" style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
          {userType === 'speaker'
            ? 'No matches yet. Use AI Matchmaking to find organizations.'
            : 'No matches yet. Use AI Speaker Matchmaking above to find speakers.'}
        </p>
      ) : (
        <div className="space-y-4">
          {recentMatches.slice(0, recentMatchesVisible).map((match, index) => (
            <div key={index} className="p-4 bg-[#f3f3f5] rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                {match.profilePhoto ? (
                  <img src={match.profilePhoto} alt={match.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 bg-[#0B3B2E] rounded-full flex items-center justify-center text-white shrink-0">
                    {match.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p style={{ fontWeight: '500' }}>{match.name}</p>
                    <span className="px-2 py-0.5 bg-[#0B3B2E] text-white rounded-full" style={{ fontSize: '12px' }}>
                      {match.match}% match
                    </span>
                  </div>
                  <p className="text-[#0B3B2E] mb-1" style={{ fontSize: '14px', fontWeight: '500' }}>
                    {match.topic}
                  </p>
                  {match.expertise && (
                    <p className="text-[#717182]" style={{ fontSize: '13px' }}>{match.expertise}</p>
                  )}
                  {match.llmExplanation && (
                    <p className="text-[#717182] italic mt-1" style={{ fontSize: '12px' }}>{match.llmExplanation}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="border-2 border-black hover:bg-[#f3f3f5] flex-1 min-w-[140px]"
                  style={{ fontSize: '14px' }}
                  onClick={() => onContact(match)}
                >
                  Contact
                </Button>
                {userType !== 'speaker' && (
                  <Button
                    className="bg-[#0B3B2E] text-white hover:bg-black flex-1 min-w-[140px]"
                    style={{ fontSize: '14px' }}
                    onClick={() => onBookSpeaker(match)}
                  >
                    Book Speaker
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="border-2 border-[#e9ebef] hover:border-[#0B3B2E] flex-1 min-w-[140px]"
                  style={{ fontSize: '14px' }}
                  onClick={() => onViewProfile(match)}
                >
                  View Profile
                </Button>
              </div>
            </div>
          ))}
          {recentMatches.length > recentMatchesVisible && (
            <Button
              onClick={onLoadMore}
              variant="outline"
              className="w-full border-2 border-[#e9ebef] hover:border-[#0B3B2E]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Load more ({Math.min(5, recentMatches.length - recentMatchesVisible)} more)
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
