import { useState, useEffect, useRef } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import SignUpScreen from './components/SignUpScreen';
import SignInForm from './components/SignInForm';
import OrganiserBasicsScreen from './components/OrganiserBasicsScreen';
import AboutScreen from './components/AboutScreen';
import EventTypesScreen from './components/EventTypesScreen';
import SpeakerPreferencesScreen from './components/SpeakerPreferencesScreen';
import SuccessScreen from './components/SuccessScreen';
import DashboardScreen from './components/DashboardScreen';
import SpeakerBasicsScreen from './components/SpeakerBasicsScreen';
import SpeakerTopicsScreen from './components/SpeakerTopicsScreen';
import SpeakerExperienceScreen from './components/SpeakerExperienceScreen';
import SpeakerVideoIntroductionScreen from './components/SpeakerVideoIntroductionScreen';
import SpeakerAvailabilityScreen from './components/SpeakerAvailabilityScreen';
import { organizerAPI, speakerAPI, fileAPI, authAPI } from '../utils/api';
import { Toaster } from './components/ui/toaster';
import { toast } from 'sonner';

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
  logo: File | null;
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
  firstName: string;
  lastName: string;
  professionalTitle: string;
  speakerLocation: string;
  speakerCity: string;
  profilePhoto: File | null;
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

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [showSignIn, setShowSignIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
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
    firstName: '',
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
  });

  // Use ref to persist timeout across renders
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Use ref to always have latest formData for autosave
  const formDataRef = useRef<FormData>(formData);

  // Keep ref in sync with state
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

  // Load profile on mount if user is authenticated
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const session = await authAPI.getSession();
        if (session) {
          // Try to load existing profile
          const userType = session.user?.user_metadata?.userType;
          if (userType) {
            setFormData(prev => ({ ...prev, userType }));
            
            try {
              const profile = userType === 'organizer' 
                ? await organizerAPI.getProfile()
                : await speakerAPI.getProfile();
              
              if (profile) {
                setFormData(prev => ({ ...prev, ...profile }));
                // If profile exists, go to dashboard
                setCurrentScreen(userType === 'organizer' ? 7 : 8);
              }
            } catch (err) {
              // Profile doesn't exist yet, that's ok
              console.log('No existing profile found');
            }
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // Silently fail - user can still use the app
      }
    };

    loadProfile();
  }, []);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    // Auto-save to backend (debounced in production)
    saveProfileDebounced(data);
  };

  // Debounced autosave function
  const saveProfileDebounced = (data: Partial<FormData>) => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    autosaveTimeoutRef.current = setTimeout(async () => {
      try {
        // Use ref to get latest formData to avoid stale closure
        await saveProfile({ ...formDataRef.current, ...data }, false);
        console.log('Autosaved successfully');
      } catch (error) {
        console.error('Autosave failed:', error);
      }
    }, 2000); // Save 2 seconds after last change
  };

  // Save profile to backend
  const saveProfile = async (dataToSave: FormData, showLoading = true) => {
    if (showLoading) setIsSaving(true);
    
    try {
      // Upload files first if they exist
      let logoUrl = null;
      let photoUrl = null;

      if (dataToSave.logo instanceof File) {
        console.log('Uploading logo...');
        toast.loading('Uploading logo...', { id: 'upload-logo' });
        logoUrl = await fileAPI.upload(dataToSave.logo, 'logo');
        toast.success('Logo uploaded!', { id: 'upload-logo' });
      }

      if (dataToSave.profilePhoto instanceof File) {
        console.log('Uploading profile photo...');
        toast.loading('Uploading profile photo...', { id: 'upload-photo' });
        photoUrl = await fileAPI.upload(dataToSave.profilePhoto, 'photo');
        toast.success('Photo uploaded!', { id: 'upload-photo' });
      }

      // Prepare profile data (convert File objects to URLs)
      const profileData = {
        ...dataToSave,
        logo: logoUrl || (typeof dataToSave.logo === 'string' ? dataToSave.logo : null),
        profilePhoto: photoUrl || (typeof dataToSave.profilePhoto === 'string' ? dataToSave.profilePhoto : null),
        videoIntroFile: null, // Don't save file objects
      };

      // Save to appropriate endpoint based on user type
      if (showLoading) {
        toast.loading('Saving profile...', { id: 'save-profile' });
      }
      
      if (dataToSave.userType === 'organizer') {
        await organizerAPI.saveProfile(profileData);
      } else if (dataToSave.userType === 'speaker') {
        await speakerAPI.saveProfile(profileData);
      }

      if (showLoading) {
        toast.success('Profile saved successfully!', { id: 'save-profile' });
      }
      console.log('Profile saved successfully!');
      return true;
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(`Failed to save profile: ${error.message}`, { id: 'save-profile' });
      return false;
    } finally {
      if (showLoading) setIsSaving(false);
    }
  };

  const nextScreen = async () => {
    // Check if we're moving to the success screen
    const isMovingToSuccess = 
      (formData.userType === 'organizer' && currentScreen === 5) ||
      (formData.userType === 'speaker' && currentScreen === 6);

    if (isMovingToSuccess) {
      // Save profile before showing success screen
      const saved = await saveProfile(formData, true);
      if (saved) {
        setCurrentScreen(prev => Math.min(prev + 1, 10));
      }
    } else {
      setCurrentScreen(prev => Math.min(prev + 1, 10));
    }
  };

  const prevScreen = () => {
    setCurrentScreen(prev => Math.max(prev - 1, 0))
  };

  const goToScreen = (screen: number) => {
    setCurrentScreen(screen);
  };

  const calculateProgress = (): number => {
    if (formData.userType === 'organizer') {
      const fields = {
        email: formData.email,
        password: formData.password,
        acceptTerms: formData.acceptTerms,
        organisationName: formData.organisationName,
        website: formData.website,
        country: formData.country,
        city: formData.city,
        industries: formData.industries.length > 0,
        tagline: formData.tagline,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        authorised: formData.authorised,
        eventTypes: formData.eventTypes.length > 0,
        frequency: formData.frequency.length > 0,
        eventSizes: formData.eventSizes.length > 0,
        formats: formData.formats.length > 0,
        speakerFormats: formData.speakerFormats.length > 0,
        languages: formData.languages.length > 0,
        leadTime: formData.leadTime,
      };
      
      const totalFields = Object.keys(fields).length;
      const completedFields = Object.values(fields).filter(Boolean).length;
      return Math.round((completedFields / totalFields) * 100);
    } else {
      // Speaker progress calculation
      const fields = {
        email: formData.email,
        password: formData.password,
        acceptTerms: formData.acceptTerms,
        firstName: formData.firstName,
        lastName: formData.lastName,
        professionalTitle: formData.professionalTitle,
        speakerLocation: formData.speakerLocation,
        speakerCity: formData.speakerCity,
        speakerTagline: formData.speakerTagline,
        topics: formData.topics.length > 0 || formData.customTopics.length > 0,
        speakingFormats: formData.speakingFormats.length > 0,
        yearsOfExperience: formData.yearsOfExperience,
        bio: formData.bio.length >= 100,
        geographicReach: formData.geographicReach,
        preferredEventTypes: formData.preferredEventTypes.length > 0,
        preferredAudienceSizes: formData.preferredAudienceSizes.length > 0,
        speakingFeeRange: formData.speakingFeeRange,
      };
      
      const totalFields = Object.keys(fields).length;
      const completedFields = Object.values(fields).filter(Boolean).length;
      return Math.round((completedFields / totalFields) * 100);
    }
  };

  // Define organizer and speaker flows
  const organizerScreens = [
    <WelcomeScreen
      formData={formData}
      updateFormData={updateFormData}
      nextScreen={nextScreen}
      onShowSignIn={() => setShowSignIn(true)}
    />,
    <SignUpScreen
      formData={formData}
      updateFormData={updateFormData}
      nextScreen={nextScreen}
      onShowSignIn={() => setShowSignIn(true)}
    />,
    <OrganiserBasicsScreen 
      formData={formData} 
      updateFormData={updateFormData} 
      nextScreen={nextScreen} 
      prevScreen={prevScreen}
      goToScreen={goToScreen}
      progress={calculateProgress()}
    />,
    <AboutScreen 
      formData={formData} 
      updateFormData={updateFormData} 
      nextScreen={nextScreen} 
      prevScreen={prevScreen}
      goToScreen={goToScreen}
      progress={calculateProgress()}
    />,
    <EventTypesScreen 
      formData={formData} 
      updateFormData={updateFormData} 
      nextScreen={nextScreen} 
      prevScreen={prevScreen}
      goToScreen={goToScreen}
      progress={calculateProgress()}
    />,
    <SpeakerPreferencesScreen 
      formData={formData} 
      updateFormData={updateFormData} 
      nextScreen={nextScreen} 
      prevScreen={prevScreen}
      goToScreen={goToScreen}
      progress={calculateProgress()}
      isSaving={isSaving}
    />,
    <SuccessScreen nextScreen={nextScreen} formData={formData} />,
    <DashboardScreen formData={formData} />,
  ];

  const speakerScreens = [
    <WelcomeScreen
      formData={formData}
      updateFormData={updateFormData}
      nextScreen={nextScreen}
      onShowSignIn={() => setShowSignIn(true)}
    />,
    <SignUpScreen
      formData={formData}
      updateFormData={updateFormData}
      nextScreen={nextScreen}
      onShowSignIn={() => setShowSignIn(true)}
    />,
    <SpeakerBasicsScreen 
      formData={formData} 
      updateFormData={updateFormData} 
      nextScreen={nextScreen} 
      prevScreen={prevScreen}
      goToScreen={goToScreen}
      progress={calculateProgress()}
    />,
    <SpeakerTopicsScreen 
      formData={formData} 
      updateFormData={updateFormData} 
      nextScreen={nextScreen} 
      prevScreen={prevScreen}
      goToScreen={goToScreen}
      progress={calculateProgress()}
    />,
    <SpeakerExperienceScreen 
      formData={formData} 
      updateFormData={updateFormData} 
      nextScreen={nextScreen} 
      prevScreen={prevScreen}
      goToScreen={goToScreen}
      progress={calculateProgress()}
    />,
    <SpeakerVideoIntroductionScreen 
      formData={formData} 
      updateFormData={updateFormData} 
      nextScreen={nextScreen} 
      prevScreen={prevScreen}
      goToScreen={goToScreen}
      progress={calculateProgress()}
    />,
    <SpeakerAvailabilityScreen 
      formData={formData} 
      updateFormData={updateFormData} 
      nextScreen={nextScreen} 
      prevScreen={prevScreen}
      goToScreen={goToScreen}
      progress={calculateProgress()}
      isSaving={isSaving}
    />,
    <SuccessScreen nextScreen={nextScreen} formData={formData} />,
    <DashboardScreen formData={formData} />,
  ];

  // Choose screens based on userType
  const screens = formData.userType === 'speaker' ? speakerScreens : organizerScreens;

  // Handle sign-in flow
  const handleSignInSuccess = async () => {
    try {
      // Get session to determine user type
      const session = await authAPI.getSession();
      const userType = session?.user?.user_metadata?.userType;

      if (userType) {
        setFormData(prev => ({ ...prev, userType }));

        // Try to load existing profile
        try {
          const profile = userType === 'organizer'
            ? await organizerAPI.getProfile()
            : await speakerAPI.getProfile();

          if (profile) {
            setFormData(prev => ({ ...prev, ...profile }));
            // Go to dashboard
            setCurrentScreen(userType === 'organizer' ? 7 : 8);
          }
        } catch (err) {
          // Profile doesn't exist, go to first profile creation screen
          setCurrentScreen(2);
        }
      }

      setShowSignIn(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    }
  };

  // Show sign-in form if requested
  if (showSignIn) {
    return (
      <div className="min-h-screen bg-white">
        <Toaster position="top-right" />
        <SignInForm
          onSignInSuccess={handleSignInSuccess}
          onNavigateToSignUp={(userType) => {
            // Set user type and navigate to sign up screen
            setFormData(prev => ({ ...prev, userType }));
            setShowSignIn(false);
            setCurrentScreen(1); // Go to SignUpScreen
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />
      {screens[currentScreen]}
    </div>
  );
}