import { Search, Sparkles, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { SearchResult, SearchResults, SearchFilters as SearchFiltersType } from '@/types/dashboard';
import SearchFiltersPanel from './SearchFilters';
import SearchResultCard from './SearchResultCard';

interface SearchSectionProps {
  userType: string;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchResults: SearchResults | null;
  isSearching: boolean;
  showAllResults: boolean;
  onToggleShowAll: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
  onSearch: () => void;
  onClearResults: () => void;
  filterResults: (results: SearchResult[]) => SearchResult[];
  onViewProfile: (result: SearchResult) => void;
  onContact: (result: SearchResult) => void;
}

export default function SearchSection({
  userType,
  searchQuery,
  onSearchQueryChange,
  searchResults,
  isSearching,
  showAllResults,
  onToggleShowAll,
  showFilters,
  onToggleFilters,
  filters,
  onFiltersChange,
  onResetFilters,
  activeFilterCount,
  onSearch,
  onClearResults,
  filterResults,
  onViewProfile,
  onContact,
}: SearchSectionProps) {
  const isSpeaker = userType === 'speaker';

  return (
    <div className="md:col-span-2 p-6 border-2 border-black rounded-lg bg-white">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
          <Search className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="mb-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
            {isSpeaker ? 'AI Event Matchmaking' : 'AI Speaker Matchmaking'}
          </h3>
          <p className="text-[#717182]" style={{ fontSize: '14px' }}>
            {isSpeaker
              ? 'Describe the type of events you want to speak at'
              : "Describe who you're looking for in plain English"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <textarea
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder={isSpeaker
            ? "E.g., I'm looking for tech conferences focused on AI and innovation happening in Europe. Ideally 500+ attendees with networking opportunities..."
            : "E.g., I need a speaker who can talk about AI ethics and governance for our tech conference in March. They should have experience speaking to technical audiences..."}
          className="w-full p-4 border-2 border-[#e9ebef] rounded-lg resize-none focus:outline-none focus:border-[#0B3B2E] transition-colors"
          rows={3}
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
        />

        <div className="flex items-center gap-3">
          <Button
            onClick={onSearch}
            disabled={!searchQuery.trim() || isSearching}
            className="bg-black text-white hover:bg-[#0B3B2E] gap-2 px-6"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <Sparkles className="w-4 h-4" />
            {isSearching ? 'Finding matches...' : 'Find matches'}
          </Button>
          {searchResults && (
            <Button onClick={onClearResults} variant="ghost" className="gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Clear results
            </Button>
          )}
        </div>

        {/* Loading */}
        {isSearching && (
          <div className="mt-4 p-8 bg-[#f3f3f5] rounded-lg text-center">
            <Sparkles className="w-8 h-8 text-[#0B3B2E] animate-pulse mx-auto mb-2" />
            <p className="text-[#717182]" style={{ fontSize: '14px' }}>
              Our AI is analyzing thousands of speaker profiles...
            </p>
          </div>
        )}

        {/* Results */}
        {searchResults && !isSearching && (
          <div className="mt-4 space-y-3">
            {(() => {
              const currentResults = showAllResults ? searchResults.allResults : searchResults.topResults;
              const filtered = filterResults(currentResults);

              return (
                <>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
                      {showAllResults ? 'All' : 'Top'} {filtered.length} matches
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-[#717182]" style={{ fontSize: '14px' }}>Sorted by relevance</p>
                      <Button
                        onClick={onToggleFilters}
                        variant="outline"
                        className="border-2 border-[#e9ebef] hover:border-[#0B3B2E] gap-2"
                        style={{ fontSize: '14px' }}
                      >
                        <Filter className="w-4 h-4" />
                        Filters
                        {activeFilterCount > 0 && (
                          <span className="ml-1 w-5 h-5 bg-[#0B3B2E] text-white rounded-full text-xs flex items-center justify-center">
                            {activeFilterCount}
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>

                  {showFilters && (
                    <SearchFiltersPanel
                      filters={filters}
                      onFiltersChange={onFiltersChange}
                      onReset={onResetFilters}
                    />
                  )}

                  {filtered.map((result, index) => (
                    <SearchResultCard
                      key={index}
                      result={result}
                      onViewProfile={() => onViewProfile(result)}
                      onContact={() => onContact(result)}
                    />
                  ))}

                  {searchResults.allResults.length > searchResults.topResults.length && (
                    <Button
                      onClick={onToggleShowAll}
                      variant="outline"
                      className="w-full border-2 border-[#e9ebef] hover:border-[#0B3B2E]"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {showAllResults
                        ? 'Show less'
                        : `Load more (${searchResults.allResults.length - searchResults.topResults.length} lower-ranked matches)`}
                    </Button>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
