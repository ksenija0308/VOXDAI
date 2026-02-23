import { Video, Clock, DollarSign } from 'lucide-react';
import { SearchFilters as SearchFiltersType, DEFAULT_FILTERS } from '@/types/dashboard';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  onReset: () => void;
}

export default function SearchFilters({ filters, onFiltersChange, onReset }: SearchFiltersProps) {
  return (
    <div className="p-4 bg-white border-2 border-[#e9ebef] rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h4 style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>Filter Results</h4>
        <button
          onClick={onReset}
          className="text-[#717182] hover:text-[#0B3B2E]"
          style={{ fontSize: '14px' }}
        >
          Clear all
        </button>
      </div>

      {/* Has Video */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.hasVideo}
            onChange={(e) => onFiltersChange({ ...filters, hasVideo: e.target.checked })}
            className="w-4 h-4 accent-[#0B3B2E]"
          />
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-[#717182]" />
            <span style={{ fontSize: '14px' }}>Has video profile</span>
          </div>
        </label>
      </div>

      {/* Speaking Format */}
      <div>
        <label className="block mb-2" style={{ fontSize: '14px', fontWeight: '500' }}>Speaking Format</label>
        <div className="flex flex-wrap gap-2">
          {['Keynote', 'Workshop', 'Panel', 'Fireside Chat'].map(format => (
            <button
              key={format}
              onClick={() => {
                const newFormats = filters.speakingFormats.includes(format)
                  ? filters.speakingFormats.filter(f => f !== format)
                  : [...filters.speakingFormats, format];
                onFiltersChange({ ...filters, speakingFormats: newFormats });
              }}
              className={`px-3 py-1.5 rounded border transition-colors ${
                filters.speakingFormats.includes(format)
                  ? 'bg-[#0B3B2E] text-white border-[#0B3B2E]'
                  : 'bg-white text-black border-[#e9ebef] hover:border-[#0B3B2E]'
              }`}
              style={{ fontSize: '13px' }}
            >
              {format}
            </button>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <label className="flex items-center gap-2 mb-2" style={{ fontSize: '14px', fontWeight: '500' }}>
          <Clock className="w-4 h-4 text-[#717182]" />
          Experience Level
        </label>
        <div className="flex flex-wrap gap-2">
          {['all', '0-2 years', '3-5 years', '5-10 years', '10+ years'].map(level => (
            <button
              key={level}
              onClick={() => onFiltersChange({ ...filters, experienceLevel: level })}
              className={`px-3 py-1.5 rounded border transition-colors ${
                filters.experienceLevel === level
                  ? 'bg-[#0B3B2E] text-white border-[#0B3B2E]'
                  : 'bg-white text-black border-[#e9ebef] hover:border-[#0B3B2E]'
              }`}
              style={{ fontSize: '13px' }}
            >
              {level === 'all' ? 'All Levels' : level}
            </button>
          ))}
        </div>
      </div>

      {/* Fee Range */}
      <div>
        <label className="flex items-center gap-2 mb-2" style={{ fontSize: '14px', fontWeight: '500' }}>
          <DollarSign className="w-4 h-4 text-[#717182]" />
          Fee Range
        </label>
        <div className="flex flex-wrap gap-2">
          {['all', 'Low', 'Medium', 'High'].map(range => (
            <button
              key={range}
              onClick={() => onFiltersChange({ ...filters, feeRange: range })}
              className={`px-3 py-1.5 rounded border transition-colors ${
                filters.feeRange === range
                  ? 'bg-[#0B3B2E] text-white border-[#0B3B2E]'
                  : 'bg-white text-black border-[#e9ebef] hover:border-[#0B3B2E]'
              }`}
              style={{ fontSize: '13px' }}
            >
              {range === 'all' ? 'Any Range' : range}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
