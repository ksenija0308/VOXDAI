import { useState } from 'react';
import { SearchResult, SearchResults, SearchFilters, DEFAULT_FILTERS } from '@/types/dashboard';
import { searchAPI } from '@/utils/api';
import { getSignedUrl } from '@/lib/storage';
import { toast } from 'sonner';

export function useDashboardSearch(userType: string) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ ...DEFAULT_FILTERS });

  const clearResults = () => {
    setSearchResults(null);
    setSearchQuery('');
    setShowAllResults(false);
  };

  const resetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowAllResults(false);

    try {
      const response = userType === 'speaker'
        ? await searchAPI.searchOrganizers(searchQuery)
        : await searchAPI.searchSpeakers(searchQuery);

      const topResultsRaw = response?.top_results || response?.results || [];
      const allResultsRaw = response?.all_results || topResultsRaw;

      const transformResult = async (result: any): Promise<SearchResult> => {
        const speaker = result.profile || {};
        const matchScore = Math.round((result.llmScore ?? result.score ?? 0.5) * 100);

        let profilePhotoUrl: string | null = null;
        if (speaker.profile_photo && typeof speaker.profile_photo === 'string') {
          try {
            profilePhotoUrl = await getSignedUrl(speaker.profile_photo);
          } catch {
            profilePhotoUrl = null;
          }
        }

        return {
          id: result.id || speaker.id,
          name: speaker.full_name || 'Unknown Speaker',
          topic: speaker.topics?.[0] || speaker.professional_headline || 'No topic specified',
          match: matchScore,
          expertise: speaker.professional_headline || speaker.speaker_tagline || speaker.bio || 'No expertise provided',
          availability: speaker.availability_periods?.length ? 'Available' : 'Contact for availability',
          hasVideo: !!speaker.video_intro || !!speaker.video_intro_url || !!speaker.demo_video_url,
          speakingFormat: speaker.speaking_formats || [],
          experienceLevel: speaker.years_of_experience || 'Not specified',
          language: speaker.speaker_languages || speaker.languages || ['English'],
          feeRange: speaker.speaking_fee_range || (speaker.fee_min != null && speaker.fee_max != null ? `$${speaker.fee_min} - $${speaker.fee_max}` : 'Contact for pricing'),
          location: speaker.speaker_city && speaker.speaker_country ? `${speaker.speaker_city}, ${speaker.speaker_country}` : speaker.speaker_country || speaker.speaker_location || '',
          llmExplanation: result.llmScoreExplanation || '',
          bio: speaker.bio || '',
          profilePhoto: profilePhotoUrl,
          profilePhotoPath: speaker.profile_photo || null,
        };
      };

      const [topResults, allResults] = await Promise.all([
        Promise.all(topResultsRaw.map(transformResult)),
        Promise.all(allResultsRaw.map(transformResult)),
      ]);

      setSearchResults({ topResults, allResults });
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error(`Failed to search: ${error.message}`);
      setSearchResults({ topResults: [], allResults: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const filterResults = (results: SearchResult[]): SearchResult[] => {
    return results.filter(result => {
      if (filters.hasVideo && !result.hasVideo) return false;
      if (filters.speakingFormats.length > 0 && !filters.speakingFormats.some(format => result.speakingFormat.includes(format))) return false;
      if (filters.experienceLevel !== 'all' && result.experienceLevel !== filters.experienceLevel) return false;
      if (filters.feeRange !== 'all' && result.feeRange !== filters.feeRange) return false;
      return true;
    });
  };

  const activeFilterCount = [
    filters.hasVideo,
    filters.speakingFormats.length > 0,
    filters.experienceLevel !== 'all',
    filters.feeRange !== 'all',
  ].filter(Boolean).length;

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    showAllResults,
    setShowAllResults,
    showFilters,
    setShowFilters,
    filters,
    setFilters,
    handleSearch,
    clearResults,
    resetFilters,
    filterResults,
    activeFilterCount,
  };
}
