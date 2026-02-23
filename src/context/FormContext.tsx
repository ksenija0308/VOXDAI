import { createContext, useContext, ReactNode } from 'react';
import { FormData } from '../types/formData';
import { useFormData } from '../hooks/useFormData';
import { useLogoContext } from './LogoContext';
import { useAuthSession } from '../hooks/useAuthSession';

interface FormContextType {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  updateFormData: (data: Partial<FormData>) => void;
  saveProfile: (data: FormData, showLoading: boolean) => Promise<boolean>;
  calculateProgress: () => number;
  isSaving: boolean;
  resetFormData: () => void;
  clearOnboardingData: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within FormProvider');
  }
  return context;
}

interface FormProviderProps {
  children: ReactNode;
}

export function FormProvider({ children }: FormProviderProps) {
  const formMethods = useFormData();
  const { refreshLogo } = useLogoContext();

  // Auth session handling (OAuth callbacks, session restoration, profile loading)
  useAuthSession({
    setFormData: formMethods.setFormData,
    refreshLogo,
  });

  return (
    <FormContext.Provider value={formMethods}>
      {children}
    </FormContext.Provider>
  );
}
