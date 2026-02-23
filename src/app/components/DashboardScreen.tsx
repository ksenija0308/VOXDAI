import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { FormData } from '@/types/formData';
import { SearchResult, ViewingSpeaker } from '@/types/dashboard';
import { organizerAPI, speakerAPI, conversationAPI } from '@/api';
import { trackRecentMatchView, loadRecentMatches } from '@/utils/recentMatches';
import { fetchOutreachCounts } from '@/features/outreach/outreachCounts';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { useDashboardSearch } from '@/hooks/useDashboardSearch';
import { useDashboardChat } from '@/hooks/useDashboardChat';
import DashboardHeader from './dashboard/DashboardHeader';
import SearchSection from './dashboard/SearchSection';
import ProfileCompleteness from './dashboard/ProfileCompleteness';
import RecentMatches from './dashboard/RecentMatches';
import OutreachPipeline from './dashboard/OutreachPipeline';
import ChatPopup from './dashboard/ChatPopup';
import SpeakerProfileView from './SpeakerProfileView';
import EventBriefForm from './EventBriefForm';
import BookSpeakerModal from './BookSpeakerModal';
import { toast } from 'sonner';

interface DashboardScreenProps {
  formData: FormData;
  onLogout?: () => void;
}

export default function DashboardScreen({ formData, onLogout }: DashboardScreenProps) {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<FormData>(formData);
  const [isLoading, setIsLoading] = useState(true);

  // Profile
  const { profileCompletion, profileSections } = useProfileCompletion(profileData);

  // Search
  const search = useDashboardSearch(formData.userType);

  // Chat
  const chat = useDashboardChat(formData.userType);

  // Recent matches
  const [recentMatches, setRecentMatches] = useState<SearchResult[]>([]);
  const [recentMatchesVisible, setRecentMatchesVisible] = useState(5);

  // Modals
  const [viewingSpeaker, setViewingSpeaker] = useState<ViewingSpeaker | null>(null);
  const [showEventBrief, setShowEventBrief] = useState(false);
  const [bookingSpeaker, setBookingSpeaker] = useState<{ id: string; name: string; topic: string } | null>(null);

  // Outreach
  const [outreachCounts, setOutreachCounts] = useState({ contacted: 0, confirmed: 0, declined: 0 });

  // Load profile from backend on mount
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const profile = formData.userType === 'organizer'
          ? await organizerAPI.getProfile()
          : await speakerAPI.getProfile();
        if (profile) {
          setProfileData({ ...formData, ...profile });
        }
      } catch {
        setProfileData(formData);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [formData.userType]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load recent matches on mount
  useEffect(() => {
    const viewerRole = formData.userType === 'speaker' ? 'speaker' as const : 'organizer' as const;
    loadRecentMatches(viewerRole)
      .then(matches => { if (matches.length > 0) setRecentMatches(matches as any); })
      .catch(err => console.error('Failed to load recent matches:', err));
  }, [formData.userType]);

  // Load outreach counts on mount
  useEffect(() => {
    fetchOutreachCounts()
      .then(setOutreachCounts)
      .catch(err => console.error('Failed to load outreach counts:', err));
  }, []);

  const pipelineStages = [
    { name: 'Pending', count: outreachCounts.contacted, color: '#717182' },
    { name: 'Confirmed', count: outreachCounts.confirmed, color: '#0B3B2E' },
    { name: 'Declined', count: outreachCounts.declined, color: '#d4183d' },
  ];

  const handleViewProfile = (result: SearchResult) => {
    setViewingSpeaker({
      id: result.id,
      name: result.name,
      topic: result.topic,
      match: result.match,
      expertise: result.expertise,
      availability: result.availability,
      hasVideo: result.hasVideo,
      speakingFormat: result.speakingFormat,
      experienceLevel: result.experienceLevel,
      language: result.language,
      feeRange: result.feeRange,
      location: result.location,
      bio: result.bio,
      profilePhoto: result.profilePhoto,
    });
    const viewerRole = formData.userType === 'speaker' ? 'speaker' as const : 'organizer' as const;
    const targetRole = viewerRole === 'organizer' ? 'speaker' as const : 'organizer' as const;
    trackRecentMatchView({
      viewerRole,
      targetRole,
      targetProfileId: result.id,
      matchScore: result.match,
    })
      .then(() => loadRecentMatches(viewerRole))
      .then(matches => { if (matches.length > 0) setRecentMatches(matches as any); })
      .catch(err => console.error('Failed to track match view:', err));
  };

  const handleContact = (result: SearchResult) => {
    chat.openConversation(result.id, result.name, result.topic);
  };

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        profileData={profileData}
        totalUnread={chat.totalUnread}
        onLogout={onLogout}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#0B3B2E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#717182]">Loading your profile...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Welcome */}
            <div className="mb-8">
              <h1 className="mb-2" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>
                Welcome back, {profileData.organisationName || profileData.full_name || 'User'}
              </h1>
              <p className="text-[#717182]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {profileData.userType === 'speaker'
                  ? 'Manage your profile and discover speaking opportunities'
                  : 'Manage your events and connect with speakers'}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <SearchSection
                userType={formData.userType}
                searchQuery={search.searchQuery}
                onSearchQueryChange={search.setSearchQuery}
                searchResults={search.searchResults}
                isSearching={search.isSearching}
                showAllResults={search.showAllResults}
                onToggleShowAll={() => search.setShowAllResults(!search.showAllResults)}
                showFilters={search.showFilters}
                onToggleFilters={() => search.setShowFilters(!search.showFilters)}
                filters={search.filters}
                onFiltersChange={search.setFilters}
                onResetFilters={search.resetFilters}
                activeFilterCount={search.activeFilterCount}
                onSearch={search.handleSearch}
                onClearResults={search.clearResults}
                filterResults={search.filterResults}
                onViewProfile={handleViewProfile}
                onContact={handleContact}
              />

              {formData.userType !== 'speaker' && (
                <button
                  className="p-6 border-2 border-[#e9ebef] rounded-lg hover:border-[#0B3B2E] transition-colors text-left"
                  onClick={() => setShowEventBrief(true)}
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-[#0B3B2E] rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>Create Event Brief</h3>
                  </div>
                  <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                    Post your event details to attract speakers
                  </p>
                </button>
              )}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ProfileCompleteness
                  profileCompletion={profileCompletion}
                  profileSections={profileSections}
                />
              </div>

              <div className="lg:col-span-2 space-y-6">
                <RecentMatches
                  recentMatches={recentMatches}
                  recentMatchesVisible={recentMatchesVisible}
                  onLoadMore={() => setRecentMatchesVisible(prev => prev + 5)}
                  userType={formData.userType}
                  onContact={handleContact}
                  onBookSpeaker={(match) => setBookingSpeaker({ id: match.id, name: match.name, topic: match.topic })}
                  onViewProfile={handleViewProfile}
                />
                <OutreachPipeline stages={pipelineStages} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Chat Popup */}
      {chat.isChatOpen && chat.activeConversation && (
        <ChatPopup
          activeConversation={chat.activeConversation}
          conversations={chat.conversations}
          messageInput={chat.messageInput}
          onMessageInputChange={chat.setMessageInput}
          onSendMessage={chat.handleSendMessage}
          onClose={chat.closeChat}
          chatMessagesEndRef={chat.chatMessagesEndRef}
        />
      )}

      {/* Speaker Profile View */}
      {viewingSpeaker && (
        <SpeakerProfileView
          speaker={viewingSpeaker}
          profileType={formData.userType === 'speaker' ? 'organizer' : 'speaker'}
          onClose={() => setViewingSpeaker(null)}
          onContact={async () => {
            try {
              const conv = formData.userType === 'speaker'
                ? await conversationAPI.getOrCreateConversationOrganizer(viewingSpeaker.id)
                : await conversationAPI.getOrCreateConversation(viewingSpeaker.id);
              const conversationId = conv.id ?? conv.conversation_id;
              setViewingSpeaker(null);
              navigate(`/dashboard/messages?conversationId=${conversationId}&participantName=${encodeURIComponent(viewingSpeaker.name)}`);
            } catch (error: any) {
              console.error('Failed to create conversation:', error);
              toast.error('Failed to start conversation. Please try again.');
            }
          }}
        />
      )}

      {/* Event Brief Form */}
      {showEventBrief && <EventBriefForm onClose={() => setShowEventBrief(false)} />}

      {/* Book Speaker Modal */}
      {bookingSpeaker && (
        <BookSpeakerModal
          speakerProfileId={bookingSpeaker.id}
          speakerName={bookingSpeaker.name}
          speakerTopic={bookingSpeaker.topic}
          onClose={() => setBookingSpeaker(null)}
        />
      )}
    </div>
  );
}
