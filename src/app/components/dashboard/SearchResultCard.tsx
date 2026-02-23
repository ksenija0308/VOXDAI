import { Button } from '../ui/button';
import { SearchResult } from '@/types/dashboard';

interface SearchResultCardProps {
  result: SearchResult;
  onViewProfile: () => void;
  onContact: () => void;
}

export default function SearchResultCard({ result, onViewProfile, onContact }: SearchResultCardProps) {
  return (
    <div className="p-4 bg-[#f3f3f5] rounded-lg border-2 border-transparent hover:border-[#0B3B2E] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          {result.profilePhoto ? (
            <img src={result.profilePhoto} alt={result.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-12 h-12 bg-[#0B3B2E] rounded-full flex items-center justify-center text-white shrink-0">
              {result.name.charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>{result.name}</h4>
              <span className="px-2 py-0.5 bg-[#0B3B2E] text-white rounded-full" style={{ fontSize: '12px' }}>
                {result.match}% match
              </span>
            </div>
            <p className="text-[#0B3B2E] mb-1" style={{ fontSize: '14px', fontWeight: '500' }}>{result.topic}</p>
            {result.location && (
              <p className="text-[#717182] mb-1" style={{ fontSize: '13px' }}>{result.location}</p>
            )}
            <p className="text-[#717182] mb-1" style={{ fontSize: '13px' }}>{result.expertise}</p>
            <div className="flex items-center gap-3 mb-1">
              <p className="text-[#717182]" style={{ fontSize: '13px' }}>{result.availability}</p>
              {result.feeRange !== 'Contact for pricing' && (
                <p className="text-[#717182]" style={{ fontSize: '13px' }}>{result.feeRange}</p>
              )}
            </div>
            {result.speakingFormat.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1">
                {result.speakingFormat.map((format, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white border border-[#e9ebef] rounded text-[#717182]" style={{ fontSize: '12px' }}>
                    {format}
                  </span>
                ))}
              </div>
            )}
            {result.llmExplanation && (
              <p className="text-[#717182] italic mt-1" style={{ fontSize: '12px' }}>{result.llmExplanation}</p>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          className="bg-black text-white hover:bg-[#0B3B2E] flex-1"
          style={{ fontSize: '14px' }}
          onClick={onViewProfile}
        >
          View full profile
        </Button>
        <Button
          variant="outline"
          className="border-2 border-black hover:bg-[#f3f3f5]"
          style={{ fontSize: '14px' }}
          onClick={onContact}
        >
          Contact
        </Button>
      </div>
    </div>
  );
}
