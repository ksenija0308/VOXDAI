import { useNavigate, useParams } from 'react-router-dom';
import { FormData } from '../App';
import OrganiserBasicsScreen from './OrganiserBasicsScreen';
import AboutScreen from './AboutScreen';
import EventTypesScreen from './EventTypesScreen';
import SpeakerPreferencesScreen from './SpeakerPreferencesScreen';
import SuccessScreen from './SuccessScreen';

interface OrganizerWizardProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  calculateProgress: () => number;
  isSaving: boolean;
  saveProfile: (data: FormData, showLoading: boolean) => Promise<boolean>;
  clearOnboardingData: () => void;
}

export default function OrganizerWizard({
  formData,
  updateFormData,
  calculateProgress,
  isSaving,
  saveProfile,
  clearOnboardingData,
}: OrganizerWizardProps) {
  const { step = 'basics' } = useParams<{ step: string }>();
  const navigate = useNavigate();

  const nextScreen = async () => {
    const stepOrder = ['basics', 'about', 'events', 'preferences', 'success'];
    const currentIndex = stepOrder.indexOf(step);

    // Check if we're moving to success screen
    if (step === 'preferences') {
      const saved = await saveProfile(formData, true);
      if (saved) {
        // Clear localStorage after successful save
        clearOnboardingData();
        navigate(`/onboarding/organizer/${stepOrder[currentIndex + 1]}`, { replace: true });
      }
    } else if (currentIndex < stepOrder.length - 1) {
      navigate(`/onboarding/organizer/${stepOrder[currentIndex + 1]}`, { replace: true });
    } else {
      // From success screen, go to dashboard
      // Set flag in sessionStorage to bypass profile check
      sessionStorage.setItem('voxd_profile_completed', 'true');
      navigate('/dashboard', { replace: true });
    }
  };

  const prevScreen = () => {
    const stepOrder = ['basics', 'about', 'events', 'preferences', 'success'];
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex > 0) {
      navigate(`/onboarding/organizer/${stepOrder[currentIndex - 1]}`, { replace: true });
    }
  };

  const goToScreen = (screenIndex: number) => {
    const stepOrder = ['basics', 'about', 'events', 'preferences', 'success'];
    if (screenIndex >= 0 && screenIndex < stepOrder.length) {
      navigate(`/onboarding/organizer/${stepOrder[screenIndex]}`, { replace: true });
    }
  };

  // Render appropriate screen based on step
  const stepOrder = ['basics', 'about', 'events', 'preferences', 'success'];
  const currentIndex = stepOrder.indexOf(step);
  const isFirstStep = currentIndex === 0;

  switch (step) {
    case 'basics':
      return (
        <OrganiserBasicsScreen
          formData={formData}
          updateFormData={updateFormData}
          nextScreen={nextScreen}
          prevScreen={prevScreen}
          goToScreen={goToScreen}
          progress={calculateProgress()}
          prevDisabled={isFirstStep}
        />
      );
    case 'about':
      return (
        <AboutScreen
          formData={formData}
          updateFormData={updateFormData}
          nextScreen={nextScreen}
          prevScreen={prevScreen}
          goToScreen={goToScreen}
          progress={calculateProgress()}
          prevDisabled={isFirstStep}
        />
      );
    case 'events':
      return (
        <EventTypesScreen
          formData={formData}
          updateFormData={updateFormData}
          nextScreen={nextScreen}
          prevScreen={prevScreen}
          goToScreen={goToScreen}
          progress={calculateProgress()}
          prevDisabled={isFirstStep}
        />
      );
    case 'preferences':
      return (
        <SpeakerPreferencesScreen
          formData={formData}
          updateFormData={updateFormData}
          nextScreen={nextScreen}
          prevScreen={prevScreen}
          goToScreen={goToScreen}
          progress={calculateProgress()}
          isSaving={isSaving}
          prevDisabled={isFirstStep}
        />
      );
    case 'success':
      return <SuccessScreen nextScreen={nextScreen} formData={formData} />;
    default:
      // Unknown step, redirect to basics
      navigate('/onboarding/organizer/basics', { replace: true });
      return null;
  }
}
