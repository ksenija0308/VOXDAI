import { useState, useEffect, useCallback } from 'react';
import { FormData, initialFormData } from '../types/formData';
import { organizerAPI, speakerAPI, fileAPI } from '../utils/api';
import { toast } from 'sonner';

const STORAGE_KEY = 'voxdai_onboarding_data';

export function useFormData() {
  const [formData, setFormData] = useState<FormData>(() => {
    // Restore from localStorage on mount
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...initialFormData, ...parsed };
      }
    } catch (error) {
      console.error('Failed to restore form data from localStorage:', error);
    }
    return initialFormData;
  });
  const [isSaving, setIsSaving] = useState(false);

  // Save to localStorage whenever formData changes
  useEffect(() => {
    try {
      // Exclude File objects from localStorage (can't be serialized)
      const dataToStore = {
        ...formData,
        logo: typeof formData.logo === 'string' ? formData.logo : null,
        profilePhoto: typeof formData.profilePhoto === 'string' ? formData.profilePhoto : null,
        videoIntroFile: null,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Failed to save form data to localStorage:', error);
    }
  }, [formData]);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    // Data will be automatically saved to localStorage via useEffect above
  };

  // Save profile to backend
  const saveProfile = async (dataToSave: FormData, showLoading = true) => {
    if (showLoading) setIsSaving(true);

    try {
      // Upload files first if they exist
      let logoUrl: string | null = null;
      let photoUrl: string | null = null;

      if (dataToSave.logo instanceof File) {
        if (showLoading) toast.loading('Uploading logo...', { id: 'upload-logo' });
        logoUrl = await fileAPI.upload(dataToSave.logo, 'logo');
        if (showLoading) toast.success('Logo uploaded!', { id: 'upload-logo' });

        // Update formData to replace File with URL to avoid re-uploading
        setFormData(prev => ({ ...prev, logo: logoUrl }));
      }

      if (dataToSave.profilePhoto instanceof File) {
        if (showLoading) toast.loading('Uploading profile photo...', { id: 'upload-photo' });
        photoUrl = await fileAPI.upload(dataToSave.profilePhoto, 'photo');
        if (showLoading) toast.success('Photo uploaded!', { id: 'upload-photo' });

        // Update formData to replace File with URL to avoid re-uploading
        setFormData(prev => ({ ...prev, profilePhoto: photoUrl }));
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

      let savedProfile;
      if (dataToSave.userType === 'organizer') {
        savedProfile = await organizerAPI.saveProfile(profileData);
      } else if (dataToSave.userType === 'speaker') {
        savedProfile = await speakerAPI.saveProfile(profileData);
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

  const calculateProgress = useCallback((): number => {
    if (formData.userType === 'organizer') {
      const fields = {
        email: formData.email,
        password: formData.password,
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
  }, [formData]);

  const resetFormData = () => {
    setFormData(initialFormData);
    // Clear localStorage when resetting
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  };

  const clearOnboardingData = () => {
    // Clear localStorage after successful onboarding completion
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear onboarding data:', error);
    }
  };

  return {
    formData,
    setFormData,
    updateFormData,
    saveProfile,
    calculateProgress,
    isSaving,
    resetFormData,
    clearOnboardingData,
  };
}
