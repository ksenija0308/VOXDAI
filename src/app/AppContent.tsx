import { useNavigate } from 'react-router-dom';
import { useFormContext } from '../context/FormContext';
import AppRoutes from '../routes/AppRoutes';
import { authAPI } from '../utils/api';
import { toast } from 'sonner';

export default function AppContent() {
  const navigate = useNavigate();
  const {
    formData,
    setFormData,
    updateFormData,
    calculateProgress,
    isSaving,
    saveProfile,
    resetFormData,
  } = useFormContext();

  // Handle logout
  const handleLogout = async () => {
    try {
      await authAPI.signOut();
      resetFormData();
      navigate('/', { replace: true });
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <AppRoutes
      formData={formData}
      updateFormData={updateFormData}
      setFormData={setFormData}
      calculateProgress={calculateProgress}
      isSaving={isSaving}
      saveProfile={saveProfile}
      handleLogout={handleLogout}
    />
  );
}
