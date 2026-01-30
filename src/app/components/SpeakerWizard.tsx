import { useNavigate, useParams } from 'react-router-dom';
import { FormData } from '../App';
import SpeakerBasicsScreen from './SpeakerBasicsScreen';
import SpeakerTopicsScreen from './SpeakerTopicsScreen';
import SpeakerExperienceScreen from './SpeakerExperienceScreen';
import SpeakerVideoIntroductionScreen from './SpeakerVideoIntroductionScreen';
import SpeakerAvailabilityScreen from './SpeakerAvailabilityScreen';
import SuccessScreen from './SuccessScreen';

interface SpeakerWizardProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  calculateProgress: () => number;
  isSaving: boolean;
  saveProfile: (data: FormData, showLoading: boolean) => Promise<boolean>;
  clearOnboardingData: () => void;
}

export default function SpeakerWizard({
  formData,
  updateFormData,
  calculateProgress,
  isSaving,
  saveProfile,
  clearOnboardingData,
}: SpeakerWizardProps) {
  const { step = 'basics' } = useParams<{ step: string }>();
  const navigate = useNavigate();

  const nextScreen = async () => {
    const stepOrder = ['basics', 'topics', 'experience', 'video', 'availability', 'success'];
    const currentIndex = stepOrder.indexOf(step);

    // Check if we're moving to success screen
    if (step === 'availability') {
      const saved = await saveProfile(formData, true);
      if (saved) {
        // Clear localStorage after successful save
        clearOnboardingData();
        navigate(`/onboarding/speaker/${stepOrder[currentIndex + 1]}`, { replace: true });
      }
    } else if (currentIndex < stepOrder.length - 1) {
      navigate(`/onboarding/speaker/${stepOrder[currentIndex + 1]}`, { replace: true });
    } else {
      // From success screen, go to dashboard
      // Set flag in sessionStorage to bypass profile check
      sessionStorage.setItem('voxd_profile_completed', 'true');
      navigate('/dashboard', { replace: true });
    }
  };

  const prevScreen = () => {
    const stepOrder = ['basics', 'topics', 'experience', 'video', 'availability', 'success'];
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex > 0) {
      navigate(`/onboarding/speaker/${stepOrder[currentIndex - 1]}`, { replace: true });
    }
  };

  const goToScreen = (screenIndex: number) => {
    const stepOrder = ['basics', 'topics', 'experience', 'video', 'availability', 'success'];
    if (screenIndex >= 0 && screenIndex < stepOrder.length) {
      navigate(`/onboarding/speaker/${stepOrder[screenIndex]}`, { replace: true });
    }
  };

  // Render appropriate screen based on step
  const stepOrder = ['basics', 'topics', 'experience', 'video', 'availability', 'success'];
  const currentIndex = stepOrder.indexOf(step);
  const isFirstStep = currentIndex === 0;

  switch (step) {
    case 'basics':
      return (
        <SpeakerBasicsScreen
          formData={formData}
          updateFormData={updateFormData}
          nextScreen={nextScreen}
          prevScreen={prevScreen}
          goToScreen={goToScreen}
          progress={calculateProgress()}
          prevDisabled={isFirstStep}
        />
      );
    case 'topics':
      return (
        <SpeakerTopicsScreen
          formData={formData}
          updateFormData={updateFormData}
          nextScreen={nextScreen}
          prevScreen={prevScreen}
          goToScreen={goToScreen}
          progress={calculateProgress()}
          prevDisabled={isFirstStep}
        />
      );
    case 'experience':
      return (
        <SpeakerExperienceScreen
          formData={formData}
          updateFormData={updateFormData}
          nextScreen={nextScreen}
          prevScreen={prevScreen}
          goToScreen={goToScreen}
          progress={calculateProgress()}
          prevDisabled={isFirstStep}
        />
      );
    case 'video':
      return (
        <SpeakerVideoIntroductionScreen
          formData={formData}
          updateFormData={updateFormData}
          nextScreen={nextScreen}
          prevScreen={prevScreen}
          goToScreen={goToScreen}
          progress={calculateProgress()}
          prevDisabled={isFirstStep}
        />
      );
    case 'availability':
      return (
        <SpeakerAvailabilityScreen
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
      navigate('/onboarding/speaker/basics', { replace: true });
      return null;
  }
}
