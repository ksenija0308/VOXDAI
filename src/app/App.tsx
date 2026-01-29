import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen';
import SignUpScreen from './components/SignUpScreen';
import SignInForm from './components/SignInForm';
import DashboardScreen from './components/DashboardScreen';
import OrganizerWizard from './components/OrganizerWizard';
import SpeakerWizard from './components/SpeakerWizard';
import ProtectedRoute from './components/ProtectedRoute';
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

function AppContent() {
  const navigate = useNavigate();
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
          // Check if this is an OAuth sign-up callback
          const signupUserType = authAPI.getAndClearSignupUserType();

          if (signupUserType) {
            setFormData(prev => ({ ...prev, userType: signupUserType }));

            // Save user type to Supabase user metadata
            try {
              await authAPI.updateUserMetadata({ userType: signupUserType });
            } catch (error) {
              console.error('Failed to update user metadata:', error);
            }

            toast.success('Account created successfully! Please complete your profile.');
            // Navigate to first profile creation screen
            if (signupUserType === 'organizer') {
              navigate('/onboarding/organizer/basics', { replace: true });
            } else {
              navigate('/onboarding/speaker/basics', { replace: true });
            }
            return;
          }

          // Not a sign-up callback, check for existing profile
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
                navigate('/dashboard', { replace: true });
              } else {
                // Profile doesn't exist, go to profile creation
                if (userType === 'organizer') {
                  navigate('/onboarding/organizer/basics', { replace: true });
                } else {
                  navigate('/onboarding/speaker/basics', { replace: true });
                }
              }
            } catch (err) {
              if (userType === 'organizer') {
                navigate('/onboarding/organizer/basics', { replace: true });
              } else {
                navigate('/onboarding/speaker/basics', { replace: true });
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // Silently fail - user can still use the app
      }
    };

    loadProfile();
  }, [navigate]);

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
        toast.loading('Uploading logo...', { id: 'upload-logo' });
        logoUrl = await fileAPI.upload(dataToSave.logo, 'logo');
        toast.success('Logo uploaded!', { id: 'upload-logo' });
      }

      if (dataToSave.profilePhoto instanceof File) {
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
      return true;
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(`Failed to save profile: ${error.message}`, { id: 'save-profile' });
      return false;
    } finally {
      if (showLoading) setIsSaving(false);
    }
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

  // Handle logout
  const handleLogout = async () => {
    try {
      await authAPI.signOut();
      // Reset form data to initial state
      setFormData({
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

      // Navigate back to welcome screen
      navigate('/', { replace: true });
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to log out');
    }
  };

  // Handle sign-in success
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
            navigate('/dashboard', { replace: true });
          } else {
            // Profile doesn't exist, go to profile creation
            if (userType === 'organizer') {
              navigate('/onboarding/organizer/basics', { replace: true });
            } else {
              navigate('/onboarding/speaker/basics', { replace: true });
            }
          }
        } catch (err) {
          // Profile doesn't exist, go to first profile creation screen
          if (userType === 'organizer') {
            navigate('/onboarding/organizer/basics', { replace: true });
          } else {
            navigate('/onboarding/speaker/basics', { replace: true });
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={
          <WelcomeScreen
            formData={formData}
            updateFormData={updateFormData}
            nextScreen={() => navigate('/signup')}
            onShowSignIn={() => navigate('/login')}
          />
        } />
        <Route path="/signup" element={
          <SignUpScreen
            formData={formData}
            updateFormData={updateFormData}
            nextScreen={() => {
              // After signup, navigate to appropriate onboarding
              if (formData.userType === 'organizer') {
                navigate('/onboarding/organizer/basics');
              } else if (formData.userType === 'speaker') {
                navigate('/onboarding/speaker/basics');
              }
            }}
            onShowSignIn={() => navigate('/login')}
          />
        } />
        <Route path="/login" element={
          <SignInForm
            onSignInSuccess={handleSignInSuccess}
            onNavigateToSignUp={(userType) => {
              setFormData(prev => ({ ...prev, userType }));
              navigate('/signup');
            }}
          />
        } />

        {/* Protected routes */}
        <Route path="/onboarding/organizer/:step" element={
          <ProtectedRoute>
            <OrganizerWizard
              formData={formData}
              updateFormData={updateFormData}
              calculateProgress={calculateProgress}
              isSaving={isSaving}
              saveProfile={saveProfile}
            />
          </ProtectedRoute>
        } />
        <Route path="/onboarding/speaker/:step" element={
          <ProtectedRoute>
            <SpeakerWizard
              formData={formData}
              updateFormData={updateFormData}
              calculateProgress={calculateProgress}
              isSaving={isSaving}
              saveProfile={saveProfile}
            />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardScreen formData={formData} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
