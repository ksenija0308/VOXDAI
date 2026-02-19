import { Search, FileText, TrendingUp, Mail, CircleCheck, X as XIcon, Sparkles, Send, Filter, Video, Clock, DollarSign, LogOut, User, Bell } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { FormData } from "@/types/formData.ts";
import { useState, useEffect, useMemo, useRef } from 'react';
import SpeakerProfileView from './SpeakerProfileView';
import EventBriefForm from './EventBriefForm';
import BookSpeakerModal from './BookSpeakerModal';
import { organizerAPI, speakerAPI, authAPI, searchAPI, conversationAPI } from '@/utils/api';
import { trackRecentMatchView, loadRecentMatches } from '@/utils/recentMatches';
import { useLogoContext } from '@/context/LogoContext';
import { getSignedUrl } from '@/lib/storage';
import { supabase } from '@/lib/supabaseClient';
import { useConversationRealtime } from '@/hooks/useConversationRealtime';
import { toast } from 'sonner';
import { fetchOutreachCounts } from '@/features/outreach/outreachCounts';

interface Message {
  id: number;
  sender: 'user' | 'speaker';
  content: string;
  timestamp: string;
}

interface Conversation {
  conversationId: string;
  speakerId: string;
  speakerName: string;
  speakerTopic: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Message[];
}

interface DashboardScreenProps {
  formData: FormData;
  onLogout?: () => void;
}

export default function DashboardScreen({ formData, onLogout }: DashboardScreenProps) {
  const navigate = useNavigate();
  const { logoUrl } = useLogoContext();
  const [profileData, setProfileData] = useState<FormData>(formData);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { profileCompletion, profileSections } = useMemo(() => {
    const p = profileData as any;

    const filled = (...keys: string[]): boolean => {
      for (const key of keys) {
        const val = p[key];
        if (val === null || val === undefined) continue;
        if (typeof val === 'string' && val.trim().length > 0) return true;
        if (Array.isArray(val) && val.length > 0) return true;
        if (val instanceof File) return true;
      }
      return false;
    };

    if (profileData.userType === 'organizer') {
      const basicChecks = {
        name: filled('organisationName', 'organisation_name', 'full_name'),
        website: filled('website'),
        country: filled('country'),
        city: filled('city'),
        industries: filled('industries'),
        tagline: filled('tagline'),
      };
      const eventChecks = {
        eventTypes: filled('eventTypes', 'event_types'),
        frequency: filled('frequency'),
        eventSizes: filled('eventSizes', 'event_sizes'),
        formats: filled('formats'),
        speakerFormats: filled('speakerFormats', 'speaker_formats'),
        languages: filled('languages'),
        leadTime: filled('leadTime', 'lead_time'),
      };
      const hasLogo = filled('logo', 'profile_photo');

      const allFields = [...Object.values(basicChecks), ...Object.values(eventChecks), hasLogo];
      const completion = Math.round((allFields.filter(Boolean).length / allFields.length) * 100);

      return {
        profileCompletion: completion,
        profileSections: [
          { name: 'Basic information', complete: Object.values(basicChecks).every(Boolean) },
          { name: 'Event preferences', complete: Object.values(eventChecks).every(Boolean) },
          { name: 'Add logo', complete: hasLogo, recommended: true },
        ],
      };
    } else {
      const basicChecks = {
        name: filled('full_name', 'firstName'),
        title: filled('professionalTitle', 'professional_title', 'professional_headline'),
        location: filled('speakerLocation', 'speaker_country'),
        city: filled('speakerCity', 'speaker_city'),
        tagline: filled('speakerTagline', 'speaker_tagline'),
        languages: filled('speakerLanguages', 'speaker_languages'),
      };
      const topicsChecks = {
        topics: filled('topics', 'customTopics', 'custom_topics'),
        formats: filled('speakingFormats', 'speaking_formats'),
        experience: filled('yearsOfExperience', 'years_of_experience'),
        bio: filled('bio'),
      };
      const hasPhoto = filled('profilePhoto', 'profile_photo');

      const allFields = [...Object.values(basicChecks), ...Object.values(topicsChecks), hasPhoto];
      const completion = Math.round((allFields.filter(Boolean).length / allFields.length) * 100);

      return {
        profileCompletion: completion,
        profileSections: [
          { name: 'Basic information', complete: Object.values(basicChecks).every(Boolean) },
          { name: 'Topics & experience', complete: Object.values(topicsChecks).every(Boolean) },
          { name: 'Profile photo', complete: hasPhoto, recommended: true },
        ],
      };
    }
  }, [profileData]);
  const [searchQuery, setSearchQuery] = useState('');

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

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
      } catch (error) {
        setProfileData(formData);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
    // Only run on mount - formData.userType determines which API to call
    // We intentionally don't include formData to avoid re-fetching on every prop change
  }, [formData.userType]); // eslint-disable-line react-hooks/exhaustive-deps
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    name: string;
    topic: string;
    match: number;
    expertise: string;
    availability: string;
    hasVideo: boolean;
    speakingFormat: string[];
    experienceLevel: string;
    language: string[];
    feeRange: string;
    location: string;
    llmExplanation: string;
    bio: string;
    profilePhoto: string | null;
    profilePhotoPath: string | null;
  }> | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserIdRef = useRef<string | undefined>();
  const [viewingSpeaker, setViewingSpeaker] = useState<{
    id: string;
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
    llmExplanation?: string;
    bio?: string;
    profilePhoto?: string | null;
  } | null>(null);
  const [showEventBrief, setShowEventBrief] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [bookingSpeaker, setBookingSpeaker] = useState<{ id: string; name: string; topic: string } | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    hasVideo: false,
    speakingFormats: [] as string[],
    experienceLevel: 'all',
    availability: 'all',
    languages: [] as string[],
    feeRange: 'all'
  });


  const [recentMatches, setRecentMatches] = useState<Array<{
    id: string;
    name: string;
    topic: string;
    match: number;
    expertise: string;
    availability: string;
    hasVideo: boolean;
    speakingFormat: string[];
    experienceLevel: string;
    language: string[];
    feeRange: string;
    location: string;
    llmExplanation: string;
    bio: string;
    profilePhoto: string | null;
    profilePhotoPath: string | null;
  }>>([]);

  // Load unread count on mount
  useEffect(() => {
    conversationAPI.loadUnreadCount()
      .then(count => setTotalUnread(count))
      .catch(err => console.error('Failed to load unread count:', err));
  }, []);

  // Load recent matches from database on mount
  useEffect(() => {
    const fetchRecentMatches = async () => {
      try {
        const viewerRole = formData.userType === 'speaker' ? 'speaker' as const : 'organizer' as const;
        const matches = await loadRecentMatches(viewerRole);
        if (matches.length > 0) {
          setRecentMatches(matches as any);
        }
      } catch (error) {
        console.error('Failed to load recent matches:', error);
      }
    };

    fetchRecentMatches();
  }, [formData.userType]);

  // Realtime listener for new messages in chat popup
  useConversationRealtime(activeConversation, (newMsg) => {
    const currentUserId = currentUserIdRef.current;

    // Skip own messages — already added optimistically in handleSendMessage
    if (newMsg.sender_id === currentUserId) return;

    const mapped: Message = {
      id: newMsg.id,
      sender: newMsg.sender_id === currentUserId ? 'user' as const : 'speaker' as const,
      content: newMsg.body,
      timestamp: new Date(newMsg.created_at).toLocaleTimeString(),
    };

    setConversations(prev => prev.map(c => {
      if (c.conversationId !== newMsg.conversation_id) return c;
      if (c.messages.some(m => m.id === newMsg.id)) return c;
      return {
        ...c,
        messages: [...c.messages, mapped],
        lastMessage: mapped.content,
        timestamp: mapped.timestamp,
      };
    }));

    // Mark as read immediately since the chat popup is open, then refresh count
    conversationAPI.markRead(newMsg.conversation_id)
      .then(() => conversationAPI.loadUnreadCount())
      .then(count => setTotalUnread(count))
      .catch(() => {});
  });

  // Auto-scroll chat popup to bottom when messages change
  const activeConvData = conversations.find(c => c.conversationId === activeConversation);
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvData?.messages]);

  // Load messages when a conversation is opened in popup
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const currentUserId = auth.user?.id;
        currentUserIdRef.current = currentUserId;

        const msgs = await conversationAPI.loadMessages(activeConversation);

        const otherMsg = msgs.find((m: any) => m.sender_id !== currentUserId);
        const otherName = otherMsg?.sender?.display_name || null;

        const mapped: Message[] = msgs.map((m: any) => ({
          id: m.id,
          sender: m.sender_id === currentUserId ? 'user' as const : 'speaker' as const,
          content: m.body,
          timestamp: new Date(m.created_at).toLocaleTimeString(),
        }));

        setConversations(prev => prev.map(c => {
          if (c.conversationId === activeConversation) {
            return {
              ...c,
              speakerName: otherName || c.speakerName,
              messages: mapped,
              lastMessage: mapped.length > 0 ? mapped[mapped.length - 1].content : c.lastMessage,
            };
          }
          return c;
        }));
      } catch (error) {
        console.error('Failed to load messages:', error);
      }

      try {
        await conversationAPI.markRead(activeConversation);
      } catch (error) {
        console.error('markRead failed:', error);
      }
      try {
        const count = await conversationAPI.loadUnreadCount();
        setTotalUnread(count);
      } catch (error) {
        console.error('Failed to refresh unread count:', error);
      }
    };

    fetchMessages();
  }, [activeConversation]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation) return;

    const text = messageInput;
    setMessageInput('');

    const newMessage: Message = {
      id: Date.now(),
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString()
    };

    setConversations(prev => prev.map(conversation => {
      if (conversation.conversationId === activeConversation) {
        return {
          ...conversation,
          messages: [...conversation.messages, newMessage],
          lastMessage: newMessage.content,
          timestamp: newMessage.timestamp,
        };
      }
      return conversation;
    }));

    try {
      await conversationAPI.sendMessage(activeConversation, text);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const [outreachCounts, setOutreachCounts] = useState({ contacted: 0, confirmed: 0, declined: 0 });

  useEffect(() => {
    fetchOutreachCounts()
      .then(setOutreachCounts)
      .catch((err) => console.error('Failed to load outreach counts:', err));
  }, []);

  const pipelineStages = [
    { name: 'Pending', count: outreachCounts.contacted, color: '#717182' },
    { name: 'Confirmed', count: outreachCounts.confirmed, color: '#0B3B2E' },
    { name: 'Declined', count: outreachCounts.declined, color: '#d4183d' },
  ];

  // Real API search function
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    try {
      const response = formData.userType === 'speaker'
        ? await searchAPI.searchOrganizers(searchQuery)
        : await searchAPI.searchSpeakers(searchQuery);

      // API returns { ok, results: [{ id, score, profile, llmScore, llmScoreExplanation }] }
      const results = response?.results || [];

      // Transform API results to match the expected format
      const transformedResults = await Promise.all(results.map(async (result: any) => {
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
          language: speaker.languages || ['English'],
          feeRange: speaker.speaking_fee_range || (speaker.fee_min != null && speaker.fee_max != null ? `$${speaker.fee_min} - $${speaker.fee_max}` : 'Contact for pricing'),
          location: speaker.speaker_city && speaker.speaker_location ? `${speaker.speaker_city}, ${speaker.speaker_location}` : speaker.speaker_location || '',
          llmExplanation: result.llmScoreExplanation || '',
          bio: speaker.bio || '',
          profilePhoto: profilePhotoUrl,
          profilePhotoPath: speaker.profile_photo || null,
        };
      }));

      setSearchResults(transformedResults);
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error(`Failed to search: ${error.message}`);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#e9ebef]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>VOXD</h2>
          <div className="flex items-center gap-4">
            <button
              className="text-[#717182] hover:text-black relative"
              onClick={() => navigate('/dashboard/messages')}
            >
              <Mail className="w-5 h-5" />
              {totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  {totalUnread}
                </span>
              )}
            </button>
            <NotificationBell />
            <div className="relative user-menu-container">
              <button
                className="w-10 h-10 bg-[#0B3B2E] rounded-full flex items-center justify-center text-white hover:bg-black transition-colors overflow-hidden"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  profileData.organisationName?.charAt(0)?.toUpperCase() || profileData.full_name?.charAt(0)?.toUpperCase() || profileData.firstName?.charAt(0)?.toUpperCase() || 'U'
                )}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-[#e9ebef] rounded-lg shadow-lg overflow-hidden z-50">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/profile');
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-[#f3f3f5] transition-colors flex items-center gap-3"
                  >
                    <User className="w-4 h-4 text-[#717182]" />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
                      Profile
                    </span>
                  </button>
                  <button
                    onClick={async () => {
                      if (onLogout) {
                        try {
                          await authAPI.signOut();
                          onLogout();
                        } catch (error: any) {
                          console.error('Logout error:', error);
                          toast.error(`Failed to logout: ${error.message}`);
                        }
                      }
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-[#f3f3f5] transition-colors flex items-center gap-3"
                  >
                    <LogOut className="w-4 h-4 text-[#717182]" />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
                      Logout
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#0B3B2E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#717182]">Loading your profile...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Welcome */}
            <div className="mb-8">
              <h1 className="mb-2" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>
                Welcome back, {profileData.organisationName || `${profileData.full_name}` || 'User'}
              </h1>
              <p className="text-[#717182]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {profileData.userType === 'speaker'
                  ? 'Manage your profile and discover speaking opportunities'
                  : 'Manage your events and connect with speakers'}
              </p>
            </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="md:col-span-2 p-6 border-2 border-black rounded-lg bg-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
                  {profileData.userType === 'speaker' ? 'AI Event Matchmaking' : 'AI Speaker Matchmaking'}
                </h3>
                <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                  {profileData.userType === 'speaker'
                    ? 'Describe the type of events you want to speak at'
                    : 'Describe who you\'re looking for in plain English'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={profileData.userType === 'speaker'
                    ? "E.g., I'm looking for tech conferences focused on AI and innovation happening in Europe. Ideally 500+ attendees with networking opportunities..."
                    : "E.g., I need a speaker who can talk about AI ethics and governance for our tech conference in March. They should have experience speaking to technical audiences..."}
                  className="w-full p-4 border-2 border-[#e9ebef] rounded-lg resize-none focus:outline-none focus:border-[#0B3B2E] transition-colors"
                  rows={3}
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isSearching}
                  className="bg-black text-white hover:bg-[#0B3B2E] gap-2 px-6"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Sparkles className="w-4 h-4" />
                  {isSearching ? 'Finding matches...' : 'Find matches'}
                </Button>

                {searchResults && (
                  <Button
                    onClick={() => {
                      setSearchResults(null);
                      setSearchQuery('');
                    }}
                    variant="ghost"
                    className="gap-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Clear results
                  </Button>
                )}
              </div>

              {/* Search Results */}
              {isSearching && (
                <div className="mt-4 p-8 bg-[#f3f3f5] rounded-lg text-center">
                  <Sparkles className="w-8 h-8 text-[#0B3B2E] animate-pulse mx-auto mb-2" />
                  <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                    Our AI is analyzing thousands of speaker profiles...
                  </p>
                </div>
              )}

              {searchResults && !isSearching && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
                      Top {searchResults.filter(result => {
                        // Apply filters
                        if (filters.hasVideo && !result.hasVideo) return false;
                        if (filters.speakingFormats.length > 0 && !filters.speakingFormats.some(format => result.speakingFormat.includes(format))) return false;
                        if (filters.experienceLevel !== 'all' && result.experienceLevel !== filters.experienceLevel) return false;
                        if (filters.feeRange !== 'all' && result.feeRange !== filters.feeRange) return false;
                        return true;
                      }).length} matches
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                        Sorted by relevance
                      </p>
                      <Button
                        onClick={() => setShowFilters(!showFilters)}
                        variant="outline"
                        className="border-2 border-[#e9ebef] hover:border-[#0B3B2E] gap-2"
                        style={{ fontSize: '14px' }}
                      >
                        <Filter className="w-4 h-4" />
                        Filters
                        {(filters.hasVideo || filters.speakingFormats.length > 0 || filters.experienceLevel !== 'all' || filters.feeRange !== 'all') && (
                          <span className="ml-1 w-5 h-5 bg-[#0B3B2E] text-white rounded-full text-xs flex items-center justify-center">
                            {[
                              filters.hasVideo,
                              filters.speakingFormats.length > 0,
                              filters.experienceLevel !== 'all',
                              filters.feeRange !== 'all'
                            ].filter(Boolean).length}
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Filter Panel */}
                  {showFilters && (
                    <div className="p-4 bg-white border-2 border-[#e9ebef] rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
                          Filter Results
                        </h4>
                        <button
                          onClick={() => {
                            setFilters({
                              hasVideo: false,
                              speakingFormats: [],
                              experienceLevel: 'all',
                              availability: 'all',
                              languages: [],
                              feeRange: 'all'
                            });
                          }}
                          className="text-[#717182] hover:text-[#0B3B2E]"
                          style={{ fontSize: '14px' }}
                        >
                          Clear all
                        </button>
                      </div>

                      {/* Has Video Filter */}
                      <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.hasVideo}
                            onChange={(e) => setFilters({ ...filters, hasVideo: e.target.checked })}
                            className="w-4 h-4 accent-[#0B3B2E]"
                          />
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4 text-[#717182]" />
                            <span style={{ fontSize: '14px' }}>Has video profile</span>
                          </div>
                        </label>
                      </div>

                      {/* Speaking Format Filter */}
                      <div>
                        <label className="block mb-2" style={{ fontSize: '14px', fontWeight: '500' }}>
                          Speaking Format
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['Keynote', 'Workshop', 'Panel', 'Fireside Chat'].map(format => (
                            <button
                              key={format}
                              onClick={() => {
                                if (filters.speakingFormats.includes(format)) {
                                  setFilters({
                                    ...filters,
                                    speakingFormats: filters.speakingFormats.filter(f => f !== format)
                                  });
                                } else {
                                  setFilters({
                                    ...filters,
                                    speakingFormats: [...filters.speakingFormats, format]
                                  });
                                }
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

                      {/* Experience Level Filter */}
                      <div>
                        <label className="flex items-center gap-2 mb-2" style={{ fontSize: '14px', fontWeight: '500' }}>
                          <Clock className="w-4 h-4 text-[#717182]" />
                          Experience Level
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['all', '0-2 years', '3-5 years', '5-10 years', '10+ years'].map(level => (
                            <button
                              key={level}
                              onClick={() => setFilters({ ...filters, experienceLevel: level })}
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

                      {/* Fee Range Filter */}
                      <div>
                        <label className="flex items-center gap-2 mb-2" style={{ fontSize: '14px', fontWeight: '500' }}>
                          <DollarSign className="w-4 h-4 text-[#717182]" />
                          Fee Range
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['all', 'Low', 'Medium', 'High'].map(range => (
                            <button
                              key={range}
                              onClick={() => setFilters({ ...filters, feeRange: range })}
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
                  )}

                  {searchResults.filter(result => {
                    // Apply filters
                    if (filters.hasVideo && !result.hasVideo) return false;
                    if (filters.speakingFormats.length > 0 && !filters.speakingFormats.some(format => result.speakingFormat.includes(format))) return false;
                    if (filters.experienceLevel !== 'all' && result.experienceLevel !== filters.experienceLevel) return false;
                    if (filters.feeRange !== 'all' && result.feeRange !== filters.feeRange) return false;
                    return true;
                  }).map((result, index) => (
                    <div key={index} className="p-4 bg-[#f3f3f5] rounded-lg border-2 border-transparent hover:border-[#0B3B2E] transition-colors">
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
                              <h4 style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
                                {result.name}
                              </h4>
                              <span className="px-2 py-0.5 bg-[#0B3B2E] text-white rounded-full" style={{ fontSize: '12px' }}>
                                {result.match}% match
                              </span>
                            </div>
                            <p className="text-[#0B3B2E] mb-1" style={{ fontSize: '14px', fontWeight: '500' }}>
                              {result.topic}
                            </p>
                            {result.location && (
                              <p className="text-[#717182] mb-1" style={{ fontSize: '13px' }}>
                                {result.location}
                              </p>
                            )}
                            <p className="text-[#717182] mb-1" style={{ fontSize: '13px' }}>
                              {result.expertise}
                            </p>
                            <div className="flex items-center gap-3 mb-1">
                              <p className="text-[#717182]" style={{ fontSize: '13px' }}>
                                {result.availability}
                              </p>
                              {result.feeRange !== 'Contact for pricing' && (
                                <p className="text-[#717182]" style={{ fontSize: '13px' }}>
                                  {result.feeRange}
                                </p>
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
                              <p className="text-[#717182] italic mt-1" style={{ fontSize: '12px' }}>
                                {result.llmExplanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="bg-black text-white hover:bg-[#0B3B2E] flex-1"
                          style={{ fontSize: '14px' }}
                          onClick={() => {
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
                            }).then(() => {
                              return loadRecentMatches(viewerRole);
                            }).then((matches) => {
                              if (matches.length > 0) {
                                setRecentMatches(matches as any);
                              }
                            }).catch(err => console.error('Failed to track match view:', err));
                          }}
                        >
                          View full profile
                        </Button>
                        <Button
                          variant="outline"
                          className="border-2 border-black hover:bg-[#f3f3f5]"
                          style={{ fontSize: '14px' }}
                          onClick={async () => {
                            try {
                              const conv = formData.userType === 'speaker'
                                ? await conversationAPI.getOrCreateConversationOrganizer(result.id)
                                : await conversationAPI.getOrCreateConversation(result.id);
                              const conversationId = conv.id ?? conv.conversation_id;

                              const existingConv = conversations.find(c => c.conversationId === conversationId);

                              if (!existingConv) {
                                setConversations(prev => [...prev, {
                                  conversationId,
                                  speakerId: result.id,
                                  speakerName: result.name,
                                  speakerTopic: result.topic,
                                  lastMessage: '',
                                  timestamp: 'Now',
                                  unread: 0,
                                  messages: []
                                }]);
                              }

                              setActiveConversation(conversationId);
                              setIsChatOpen(true);
                            } catch (error: any) {
                              console.error('Failed to create conversation:', error);
                              toast.error('Failed to start conversation. Please try again.');
                            }
                          }}
                        >
                          Contact
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {formData.userType !== 'speaker' && (
            <button className="p-6 border-2 border-[#e9ebef] rounded-lg hover:border-[#0B3B2E] transition-colors text-left"
              onClick={() => setShowEventBrief(true)}>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-[#0B3B2E] rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
                  Create Event Brief
                </h3>
              </div>
              <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                Post your event details to attract speakers
              </p>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Completeness */}
          <div className="lg:col-span-1">
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
          </div>

          {/* Recent Matches & Pipeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Matches */}
            <div className="bg-white border border-[#e9ebef] p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
                  Recent Matches
                </h3>
                <TrendingUp className="w-5 h-5 text-[#0B3B2E]" />
              </div>

              {recentMatches.length === 0 ? (
                <p className="text-[#717182] text-center py-6" style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                  No matches yet. Use AI Speaker Matchmaking above to find speakers.
                </p>
              ) : (
              <div className="space-y-4">
                {recentMatches.map((match, index) => (
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
                          <p className="text-[#717182]" style={{ fontSize: '13px' }}>
                            {match.expertise}
                          </p>
                        )}
                        {match.llmExplanation && (
                          <p className="text-[#717182] italic mt-1" style={{ fontSize: '12px' }}>
                            {match.llmExplanation}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        className="border-2 border-black hover:bg-[#f3f3f5] flex-1 min-w-[140px]"
                        style={{ fontSize: '14px' }}
                        onClick={async () => {
                          try {
                            const conv = formData.userType === 'speaker'
                              ? await conversationAPI.getOrCreateConversationOrganizer(match.id)
                              : await conversationAPI.getOrCreateConversation(match.id);
                            const conversationId = conv.id ?? conv.conversation_id;

                            const existingConv = conversations.find(c => c.conversationId === conversationId);

                            if (!existingConv) {
                              setConversations(prev => [...prev, {
                                conversationId,
                                speakerId: match.id,
                                speakerName: match.name,
                                speakerTopic: match.topic,
                                lastMessage: '',
                                timestamp: 'Now',
                                unread: 0,
                                messages: []
                              }]);
                            }

                            setActiveConversation(conversationId);
                            setIsChatOpen(true);
                          } catch (error: any) {
                            console.error('Failed to create conversation:', error);
                            toast.error('Failed to start conversation. Please try again.');
                          }
                        }}
                      >
                        Contact
                      </Button>
                      {formData.userType !== 'speaker' && (
                      <Button
                        className="bg-[#0B3B2E] text-white hover:bg-black flex-1 min-w-[140px]"
                        style={{ fontSize: '14px' }}
                        onClick={() => setBookingSpeaker({ id: match.id, name: match.name, topic: match.topic })}
                      >
                        Book Speaker
                      </Button>
                      )}
                      <Button
                        variant="outline"
                        className="border-2 border-[#e9ebef] hover:border-[#0B3B2E] flex-1 min-w-[140px]"
                        style={{ fontSize: '14px' }}
                        onClick={() => {
                          setViewingSpeaker({
                            id: match.id,
                            name: match.name,
                            topic: match.topic,
                            match: match.match,
                            expertise: match.expertise,
                            availability: match.availability,
                            hasVideo: match.hasVideo,
                            speakingFormat: match.speakingFormat,
                            experienceLevel: match.experienceLevel,
                            language: match.language,
                            feeRange: match.feeRange,
                            location: match.location,
                            bio: match.bio,
                            profilePhoto: match.profilePhoto,
                          });
                          const viewerRole = formData.userType === 'speaker' ? 'speaker' as const : 'organizer' as const;
                          const targetRole = viewerRole === 'organizer' ? 'speaker' as const : 'organizer' as const;
                          trackRecentMatchView({
                            viewerRole,
                            targetRole,
                            targetProfileId: match.id,
                            matchScore: match.match,
                          }).then(() => {
                            return loadRecentMatches(viewerRole);
                          }).then((matches) => {
                            if (matches.length > 0) {
                              setRecentMatches(matches as any);
                            }
                          }).catch(err => console.error('Failed to track match view:', err));
                        }}
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>

            {/* Outreach Pipeline */}
            <div className="bg-white border border-[#e9ebef] p-6 rounded-lg">
              <h3 className="mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
                Outreach Pipeline
              </h3>

              <div className="grid grid-cols-3 gap-4">
                {pipelineStages.map((stage, index) => (
                  <div key={index} className="text-center">
                    <div
                      className="w-full h-20 rounded-lg flex items-center justify-center mb-2"
                      style={{ backgroundColor: `${stage.color}15` }}
                    >
                      <span
                        className="text-3xl"
                        style={{ color: stage.color, fontWeight: 'bold', fontFamily: 'Helvetica, Arial, sans-serif' }}
                      >
                        {stage.count}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                      {stage.name}
                    </p>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full mt-6"
                style={{ fontFamily: 'Inter, sans-serif' }}
                onClick={() => navigate('/dashboard/outreach')}
              >
                View all outreach
              </Button>
            </div>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Chat Popup */}
      {isChatOpen && activeConversation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-end">
          <div className="bg-white w-full md:w-[500px] h-[600px] md:rounded-tl-lg shadow-2xl flex flex-col">
            {/* Chat Header */}
            <div className="border-b border-[#e9ebef] p-4">
              <div className="flex items-center gap-3">
                <button
                  className="text-[#717182] hover:text-black"
                  onClick={() => {
                    setIsChatOpen(false);
                    setActiveConversation(null);
                  }}
                >
                  <XIcon className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 bg-[#0B3B2E] rounded-full flex items-center justify-center text-white">
                  {conversations.find(conv => conv.conversationId === activeConversation)?.speakerName.charAt(0)}
                </div>
                <div>
                  <h4 style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
                    {conversations.find(conv => conv.conversationId === activeConversation)?.speakerName}
                  </h4>
                  <p className="text-[#717182]" style={{ fontSize: '13px' }}>
                    {conversations.find(conv => conv.conversationId === activeConversation)?.speakerTopic}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversations.find(conv => conv.conversationId === activeConversation)?.messages.map(message => (
                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${message.sender === 'user' ? 'bg-[#0B3B2E] text-white' : 'bg-[#f3f3f5]'}`}>
                    <p style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                      {message.content}
                    </p>
                    <p className={`mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-[#717182]'}`} style={{ fontSize: '11px' }}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={chatMessagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-[#e9ebef] p-4">
              <div className="flex items-end gap-2">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 p-3 border-2 border-[#e9ebef] rounded-lg resize-none focus:outline-none focus:border-[#0B3B2E] transition-colors"
                  rows={2}
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="p-3 bg-[#0B3B2E] text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Speaker Profile View */}
      {viewingSpeaker && (
        <SpeakerProfileView
          speaker={viewingSpeaker}
          onClose={() => setViewingSpeaker(null)}
          onContact={async () => {
            try {
              const conv = formData.userType === 'speaker'
                ? await conversationAPI.getOrCreateConversationOrganizer(viewingSpeaker.id)
                : await conversationAPI.getOrCreateConversation(viewingSpeaker.id);
              const conversationId = conv.id ?? conv.conversation_id;
              setViewingSpeaker(null);
              navigate(`/dashboard/messages?conversationId=${conversationId}`);
            } catch (error: any) {
              console.error('Failed to create conversation:', error);
              toast.error('Failed to start conversation. Please try again.');
            }
          }}
        />
      )}

      {/* Event Brief Form */}
      {showEventBrief && (
        <EventBriefForm
          onClose={() => setShowEventBrief(false)}
        />
      )}

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
