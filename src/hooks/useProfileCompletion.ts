import { useMemo } from 'react';
import { FormData } from '@/types/formData';
import { ProfileSection } from '@/types/dashboard';

export function useProfileCompletion(profileData: FormData) {
  return useMemo(() => {
    const p = profileData as any;

    const filled = (...keys: string[]): boolean => {
      for (const key of keys) {
        const val = p[key];
        if (val === null || val === undefined) continue;
        if (typeof val === 'string' && val.trim().length > 0) return true;
        if (Array.isArray(val) && val.length > 0) return true;
        if (val instanceof File) return true;
      }
      return false;
    };

    let profileSections: ProfileSection[];
    let profileCompletion: number;

    if (profileData.userType === 'organizer') {
      const basicChecks = {
        name: filled('organisationName', 'organisation_name', 'full_name'),
        website: filled('website'),
        country: filled('country'),
        city: filled('city'),
        industries: filled('industries'),
        tagline: filled('tagline'),
      };
      const eventChecks = {
        eventTypes: filled('eventTypes', 'event_types'),
        frequency: filled('frequency'),
        eventSizes: filled('eventSizes', 'event_sizes'),
        formats: filled('formats'),
        speakerFormats: filled('speakerFormats', 'speaker_formats'),
        languages: filled('languages'),
        leadTime: filled('leadTime', 'lead_time'),
      };
      const hasLogo = filled('logo', 'profile_photo');

      const allFields = [...Object.values(basicChecks), ...Object.values(eventChecks), hasLogo];
      profileCompletion = Math.round((allFields.filter(Boolean).length / allFields.length) * 100);

      profileSections = [
        { name: 'Basic information', complete: Object.values(basicChecks).every(Boolean) },
        { name: 'Event preferences', complete: Object.values(eventChecks).every(Boolean) },
        { name: 'Add logo', complete: hasLogo, recommended: true },
      ];
    } else {
      const basicChecks = {
        name: filled('full_name', 'firstName'),
        title: filled('professionalTitle', 'professional_title', 'professional_headline'),
        location: filled('speakerLocation', 'speaker_country'),
        city: filled('speakerCity', 'speaker_city'),
        bio: filled('bio'),
        languages: filled('speakerLanguages', 'speaker_languages'),
      };
      const topicsChecks = {
        topics: filled('topics', 'customTopics', 'custom_topics'),
        formats: filled('speakingFormats', 'speaking_formats'),
        experience: filled('yearsOfExperience', 'years_of_experience'),
      };
      const hasPhoto = filled('profilePhoto', 'profile_photo');

      const allFields = [...Object.values(basicChecks), ...Object.values(topicsChecks), hasPhoto];
      profileCompletion = Math.round((allFields.filter(Boolean).length / allFields.length) * 100);

      profileSections = [
        { name: 'Basic information', complete: Object.values(basicChecks).every(Boolean) },
        { name: 'Topics & experience', complete: Object.values(topicsChecks).every(Boolean) },
        { name: 'Profile photo', complete: hasPhoto, recommended: true },
      ];
    }

    return { profileCompletion, profileSections };
  }, [profileData]);
}
