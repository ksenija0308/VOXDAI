import { Search, FileText, TrendingUp, Mail, CircleCheck, X as XIcon, Sparkles, Send, Filter, Video, Clock, DollarSign, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { FormData } from "@/types/formData.ts";
import { useState, useEffect } from 'react';
import SpeakerProfileView from './SpeakerProfileView';
import EventBriefForm from './EventBriefForm';
import BookSpeakerModal from './BookSpeakerModal';
import { organizerAPI, speakerAPI, authAPI, searchAPI } from '@/utils/api';
import { useLogoContext } from '@/context/LogoContext';
import { getSignedUrl } from '@/lib/storage';
import { toast } from 'sonner';

interface DashboardScreenProps {
  formData: FormData;
  onLogout?: () => void;
}

interface Message {
  id: number;
  sender: 'user' | 'speaker';
  content: string;
  timestamp: string;
}

interface Conversation {
  speakerId: string;
  speakerName: string;
  speakerTopic: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Message[];
}

export default function DashboardScreen({ formData, onLogout }: DashboardScreenProps) {
  const navigate = useNavigate();
  const { logoUrl } = useLogoContext();
  const [profileData, setProfileData] = useState<FormData>(formData);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const profileCompletion = 85; // Mock completion percentage
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

    console.log('profileData', profileData)

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
  }> | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [viewingSpeaker, setViewingSpeaker] = useState<{
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
  const [bookingSpeaker, setBookingSpeaker] = useState<{ name: string; topic: string } | null>(null);
console.log('search results', searchResults)
  // Filter states
  const [filters, setFilters] = useState({
    hasVideo: false,
    speakingFormats: [] as string[],
    experienceLevel: 'all',
    availability: 'all',
    languages: [] as string[],
    feeRange: 'all'
  });

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      speakerId: 'sarah-chen',
      speakerName: 'Dr. Sarah Chen',
      speakerTopic: 'AI & Machine Learning',
      lastMessage: 'I would love to speak at your conference! Let me know the details.',
      timestamp: '2 hours ago',
      unread: 2,
      messages: [
        {
          id: 1,
          sender: 'user',
          content: 'Hi Dr. Chen, we would love to have you speak at our upcoming AI conference in March.',
          timestamp: '10:30 AM'
        },
        {
          id: 2,
          sender: 'speaker',
          content: 'Thank you for reaching out! I\'d be very interested. Could you share more details about the event?',
          timestamp: '11:15 AM'
        },
        {
          id: 3,
          sender: 'user',
          content: 'Of course! It\'s a 2-day conference with 500+ attendees, mostly tech professionals. We\'re looking for a 45-minute keynote on AI ethics.',
          timestamp: '11:30 AM'
        },
        {
          id: 4,
          sender: 'speaker',
          content: 'I would love to speak at your conference! Let me know the details.',
          timestamp: '2:45 PM'
        }
      ]
    },
    {
      speakerId: 'marcus-johnson',
      speakerName: 'Marcus Johnson',
      speakerTopic: 'Leadership & Culture',
      lastMessage: 'That sounds perfect. What are the next steps?',
      timestamp: '1 day ago',
      unread: 0,
      messages: [
        {
          id: 1,
          sender: 'user',
          content: 'Hi Marcus, your profile caught my attention. Would you be available for a leadership workshop in April?',
          timestamp: 'Yesterday 3:20 PM'
        },
        {
          id: 2,
          sender: 'speaker',
          content: 'That sounds perfect. What are the next steps?',
          timestamp: 'Yesterday 4:05 PM'
        }
      ]
    },
    {
      speakerId: 'elena-rodriguez',
      speakerName: 'Elena Rodriguez',
      speakerTopic: 'Sustainability',
      lastMessage: 'Thank you for considering me!',
      timestamp: '3 days ago',
      unread: 1,
      messages: [
        {
          id: 1,
          sender: 'user',
          content: 'Hi Elena, we\'re organizing a sustainability summit and would love to have you as a speaker.',
          timestamp: 'Mon 2:15 PM'
        },
        {
          id: 2,
          sender: 'speaker',
          content: 'Thank you for considering me!',
          timestamp: 'Mon 3:30 PM'
        }
      ]
    }
  ]);

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
  }>>(() => {
    try {
      const saved = localStorage.getItem('voxd_recent_matches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const pipelineStages = [
    { name: 'Contacted', count: 8, color: '#717182' },
    { name: 'Interested', count: 5, color: '#0B3B2E' },
    { name: 'Confirmed', count: 2, color: '#0B3B2E' },
    { name: 'Declined', count: 1, color: '#d4183d' },
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
        };
      }));

      setSearchResults(transformedResults);

      // Save to recent matches (persisted in localStorage)
      setRecentMatches(transformedResults);
      try {
        localStorage.setItem('voxd_recent_matches', JSON.stringify(transformedResults));
      } catch { /* ignore storage errors */ }
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error(`Failed to search: ${error.message}`);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      sender: 'user',
      content: messageInput,
      timestamp: new Date().toLocaleTimeString()
    };

    const updatedConversations = conversations.map(conversation => {
      if (conversation.speakerId === activeConversation) {
        return {
          ...conversation,
          messages: [...conversation.messages, newMessage],
          lastMessage: newMessage.content,
          timestamp: newMessage.timestamp,
          unread: conversation.unread + 1
        };
      }
      return conversation;
    });

    setConversations(updatedConversations);
    setMessageInput('');
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
              onClick={() => setIsChatOpen(!isChatOpen)}
            >
              <Mail className="w-5 h-5" />
              {conversations.some(conv => conv.unread > 0) && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  {conversations.reduce((sum, conv) => sum + conv.unread, 0)}
                </span>
              )}
            </button>
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
                Manage your events and connect with speakers
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
                  AI Speaker Matchmaking
                </h3>
                <p className="text-[#717182]" style={{ fontSize: '14px' }}>
                  Describe who you're looking for in plain English
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="E.g., I need a speaker who can talk about AI ethics and governance for our tech conference in March. They should have experience speaking to technical audiences..."
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
                          onClick={() => setViewingSpeaker({
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
                          })}
                        >
                          View full profile
                        </Button>
                        <Button
                          variant="outline"
                          className="border-2 border-black hover:bg-[#f3f3f5]"
                          style={{ fontSize: '14px' }}
                          onClick={() => {
                            // Create a new conversation with this speaker
                            const newConvId = result.name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');
                            const existingConv = conversations.find(conv => conv.speakerId === newConvId);

                            if (!existingConv) {
                              setConversations([...conversations, {
                                speakerId: newConvId,
                                speakerName: result.name,
                                speakerTopic: result.topic,
                                lastMessage: '',
                                timestamp: 'Now',
                                unread: 0,
                                messages: []
                              }]);
                            }

                            setActiveConversation(newConvId);
                            setIsChatOpen(true);
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
                <div className="flex items-start gap-2">
                  <CircleCheck className="w-5 h-5 text-[#0B3B2E] mt-0.5" />
                  <div className="flex-1">
                    <p style={{ fontSize: '14px' }}>Basic information</p>
                    <p className="text-[#717182]" style={{ fontSize: '12px' }}>Complete</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CircleCheck className="w-5 h-5 text-[#0B3B2E] mt-0.5" />
                  <div className="flex-1">
                    <p style={{ fontSize: '14px' }}>Event preferences</p>
                    <p className="text-[#717182]" style={{ fontSize: '12px' }}>Complete</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 border-2 border-[#e9ebef] rounded-full mt-0.5" />
                  <div className="flex-1">
                    <p style={{ fontSize: '14px' }}>Add logo</p>
                    <p className="text-[#717182]" style={{ fontSize: '12px' }}>Recommended</p>
                  </div>
                </div>
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
                        onClick={() => {
                          const speakerId = match.name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');
                          const existingConv = conversations.find(conv => conv.speakerId === speakerId);

                          if (!existingConv) {
                            setConversations([...conversations, {
                              speakerId: speakerId,
                              speakerName: match.name,
                              speakerTopic: match.topic,
                              lastMessage: '',
                              timestamp: 'Now',
                              unread: 0,
                              messages: []
                            }]);
                          }

                          setActiveConversation(speakerId);
                          setIsChatOpen(true);
                        }}
                      >
                        Contact
                      </Button>
                      <Button
                        className="bg-[#0B3B2E] text-white hover:bg-black flex-1 min-w-[140px]"
                        style={{ fontSize: '14px' }}
                        onClick={() => setBookingSpeaker({ name: match.name, topic: match.topic })}
                      >
                        Book Speaker
                      </Button>
                      <Button
                        variant="outline"
                        className="border-2 border-[#e9ebef] hover:border-[#0B3B2E] flex-1 min-w-[140px]"
                        style={{ fontSize: '14px' }}
                        onClick={() => setViewingSpeaker({
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
                        })}
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

              <div className="grid grid-cols-4 gap-4">
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
              >
                View all outreach
              </Button>
            </div>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Chat Panel */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-end">
          <div className="bg-white w-full md:w-[500px] h-[600px] md:rounded-tl-lg shadow-2xl flex flex-col">
            {/* Chat Header */}
            <div className="border-b border-[#e9ebef] p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500', fontSize: '18px' }}>
                  Messages
                </h3>
                <button
                  className="text-[#717182] hover:text-black"
                  onClick={() => {
                    setIsChatOpen(false);
                    setActiveConversation(null);
                  }}
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conversations List or Active Chat */}
            {!activeConversation ? (
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.speakerId}
                    className="w-full p-4 border-b border-[#e9ebef] hover:bg-[#f3f3f5] transition-colors text-left"
                    onClick={() => setActiveConversation(conversation.speakerId)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-[#0B3B2E] rounded-full flex items-center justify-center text-white shrink-0">
                        {conversation.speakerName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
                            {conversation.speakerName}
                          </h4>
                          <span className="text-[#717182]" style={{ fontSize: '12px' }}>
                            {conversation.timestamp}
                          </span>
                        </div>
                        <p className="text-[#717182] mb-1" style={{ fontSize: '13px' }}>
                          {conversation.speakerTopic}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-[#717182] truncate" style={{ fontSize: '14px' }}>
                            {conversation.lastMessage}
                          </p>
                          {conversation.unread > 0 && (
                            <span className="ml-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center shrink-0">
                              {conversation.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <>
                {/* Active Conversation Header */}
                <div className="border-b border-[#e9ebef] p-4">
                  <div className="flex items-center gap-3">
                    <button
                      className="text-[#717182] hover:text-black"
                      onClick={() => setActiveConversation(null)}
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 bg-[#0B3B2E] rounded-full flex items-center justify-center text-white">
                      {conversations.find(conv => conv.speakerId === activeConversation)?.speakerName.charAt(0)}
                    </div>
                    <div>
                      <h4 style={{ fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
                        {conversations.find(conv => conv.speakerId === activeConversation)?.speakerName}
                      </h4>
                      <p className="text-[#717182]" style={{ fontSize: '13px' }}>
                        {conversations.find(conv => conv.speakerId === activeConversation)?.speakerTopic}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {conversations.find(conv => conv.speakerId === activeConversation)?.messages.map(message => (
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
                </div>

                {/* Message Input */}
                <div className="border-t border-[#e9ebef] p-4">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => {
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
              </>
            )}
          </div>
        </div>
      )}

      {/* Speaker Profile View */}
      {viewingSpeaker && (
        <SpeakerProfileView
          speaker={viewingSpeaker}
          onClose={() => setViewingSpeaker(null)}
          onContact={() => {
            const speakerId = viewingSpeaker.name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');
            const existingConv = conversations.find(conv => conv.speakerId === speakerId);

            if (!existingConv) {
              setConversations([...conversations, {
                speakerId: speakerId,
                speakerName: viewingSpeaker.name,
                speakerTopic: viewingSpeaker.topic,
                lastMessage: '',
                timestamp: 'Now',
                unread: 0,
                messages: []
              }]);
            }

            setActiveConversation(speakerId);
            setViewingSpeaker(null);
            setIsChatOpen(true);
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
          speakerName={bookingSpeaker.name}
          speakerTopic={bookingSpeaker.topic}
          onClose={() => setBookingSpeaker(null)}
        />
      )}
    </div>
  );
}
