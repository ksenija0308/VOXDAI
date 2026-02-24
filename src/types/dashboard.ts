export interface Message {
  id: number;
  sender: 'user' | 'speaker';
  content: string;
  timestamp: string;
}

export interface Conversation {
  conversationId: string;
  speakerId: string;
  speakerName: string;
  speakerTopic: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Message[];
}

export interface SearchResult {
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
  videoIntroUrl: string;
}

export interface SearchFilters {
  hasVideo: boolean;
  speakingFormats: string[];
  experienceLevel: string;
  availability: string;
  languages: string[];
  feeRange: string;
}

export interface SearchResults {
  topResults: SearchResult[];
  allResults: SearchResult[];
}

export interface ProfileSection {
  name: string;
  complete: boolean;
  recommended?: boolean;
}

export interface ViewingSpeaker {
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
  videoIntroUrl?: string;
}

export const DEFAULT_FILTERS: SearchFilters = {
  hasVideo: false,
  speakingFormats: [],
  experienceLevel: 'all',
  availability: 'all',
  languages: [],
  feeRange: 'all',
};
