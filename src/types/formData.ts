export interface FormData {
  // User type
  userType: 'organizer' | 'speaker' | '';

  // Screen 1 - Sign Up
  email: string;
  password: string;
  acceptTerms: boolean;

  // Screen 2 - Organiser Basics
  organisationName: string;
  website: string;
  country: string;
  city: string;
  industries: string[];
  logo: File | string | null;
  tagline: string;

  // Screen 3 - About
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  calendarLink: string;
  calendarType: 'calendly' | 'google' | 'ical' | '';
  linkedIn: string;
  instagram: string;
  youtube: string;
  twitter: string;
  authorised: boolean;
  showInSpeakerSearch: boolean;

  // Screen 4 - Event Types & Frequency
  eventTypes: string[];
  frequency: string[];
  eventSizes: string[];
  formats: string[];
  locations: string[]

  // Screen 5 - Speaker Preferences
  speakerFormats: string[];
  diversityGoals: boolean;
  diversityTargets: string;
  languages: string[];
  budgetRange: string;
  budgetMin: number;
  budgetMax: number;
  leadTime: string;

  // Screen 6 - Review & Publish
  visibility: 'public' | 'invite-only' | 'private';

  // Speaker Profile Fields
  // Speaker Basics
  confirmedOver18: boolean;
  firstName: string;
  full_name: string;
  lastName: string;
  professionalTitle: string;
  speakerLocation: string;
  speakerCity: string;
  profilePhoto: File | string | null;
  speakerTagline: string;

  // Speaker Topics & Expertise
  topics: string[];
  customTopics: string[];

  // Speaker Experience
  speakingFormats: string[];
  yearsOfExperience: string;
  pastEngagements: number;
  notableClients: string;

  // Speaker Bio & Portfolio
  bio: string;
  speakerWebsite: string;
  speakerLinkedIn: string;
  speakerTwitter: string;
  speakerInstagram: string;
  speakerYoutube: string;
  demoVideoUrl: string;

  // Speaker Availability & Preferences
  speakerLanguages: string[];
  geographicReach: string;
  willingToTravel: boolean;
  preferredEventTypes: string[];
  preferredAudienceSizes: string[];

  // Speaker Requirements & Pricing
  speakingFeeRange: string;
  feeMin: number;
  feeMax: number;
  technicalRequirements: string;
  specialAccommodations: string;

  // Speaker Video Introduction (optional)
  videoIntroUrl: string;
  videoIntroFile: File | null;

  // Speaker Availability Periods
  availabilityPeriods: Array<{
    id: string;
    startDate: string;
    endDate: string;
    ongoing: boolean;
  }>;

  // Review & Confirm
  acceptedTerms: boolean;
  subscribeNewsletter: boolean;
}

export const initialFormData: FormData = {
  userType: '',
  email: '',
  password: '',
  acceptTerms: false,
  organisationName: '',
  website: '',
  country: '',
  city: '',
  industries: [],
  logo: null,
  tagline: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  calendarLink: '',
  calendarType: '',
  linkedIn: '',
  instagram: '',
  youtube: '',
  twitter: '',
  authorised: false,
  showInSpeakerSearch: false,
  eventTypes: [],
  frequency: [],
  eventSizes: [],
  formats: [],
  locations: [],
  speakerFormats: [],
  diversityGoals: false,
  diversityTargets: '',
  languages: [],
  budgetRange: 'unpaid',
  budgetMin: 0,
  budgetMax: 10000,
  leadTime: '',
  visibility: 'public',
  confirmedOver18: false,
  firstName: '',
  full_name: '',
  lastName: '',
  professionalTitle: '',
  speakerLocation: '',
  speakerCity: '',
  profilePhoto: null,
  speakerTagline: '',
  topics: [],
  customTopics: [],
  speakingFormats: [],
  yearsOfExperience: '',
  pastEngagements: 0,
  notableClients: '',
  bio: '',
  speakerWebsite: '',
  speakerLinkedIn: '',
  speakerTwitter: '',
  speakerInstagram: '',
  speakerYoutube: '',
  demoVideoUrl: '',
  speakerLanguages: [],
  geographicReach: '',
  willingToTravel: false,
  preferredEventTypes: [],
  preferredAudienceSizes: [],
  speakingFeeRange: '',
  feeMin: 0,
  feeMax: 10000,
  technicalRequirements: '',
  specialAccommodations: '',
  videoIntroUrl: '',
  videoIntroFile: null,
  availabilityPeriods: [],
  acceptedTerms: false,
  subscribeNewsletter: false,
};
