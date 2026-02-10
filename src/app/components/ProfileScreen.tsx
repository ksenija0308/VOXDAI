import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, LogOut, User, Pencil, Save, X, Globe, Phone, MapPin, Briefcase, Calendar, DollarSign, Languages, Video } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { FormData } from '@/types/formData';
import { organizerAPI, speakerAPI, authAPI } from '@/utils/api';
import { toast } from 'sonner';

interface ProfileScreenProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  saveProfile: (data: FormData, showLoading: boolean) => Promise<boolean>;
  onLogout?: () => void;
}

export default function ProfileScreen({ formData, updateFormData, saveProfile, onLogout }: ProfileScreenProps) {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<FormData>(formData);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<FormData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Load profile from backend
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const profile = formData.userType === 'organizer'
          ? await organizerAPI.getProfile()
          : await speakerAPI.getProfile();

        if (profile) {
          setProfileData({ ...formData, ...profile });
        }
      } catch (error) {
        setProfileData(formData);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [formData.userType]); // eslint-disable-line react-hooks/exhaustive-deps

  const startEditing = (section: string) => {
    setEditingSection(section);
    setEditData({});
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditData({});
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedData = { ...profileData, ...editData };
      setProfileData(updatedData);
      updateFormData(editData);
      const saved = await saveProfile(updatedData, false);
      if (saved) {
        toast.success('Profile updated successfully');
        setEditingSection(null);
        setEditData({});
      } else {
        toast.error('Failed to save profile');
      }
    } catch (error: any) {
      toast.error(`Failed to save: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const updateEditData = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const getDisplayValue = (field: keyof FormData) => {
    if (editingSection && field in editData) {
      return (editData as any)[field];
    }
    return profileData[field];
  };

  const isOrganizer = profileData.userType === 'organizer';

  const renderSectionHeader = (title: string, sectionKey: string, icon: React.ReactNode) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0B3B2E] rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-lg" style={{ fontFamily: 'Inter, sans-serif', fontWeight: '600' }}>{title}</h3>
      </div>
      {editingSection === sectionKey ? (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={cancelEditing}
            className="flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1 bg-[#0B3B2E] hover:bg-black text-white"
          >
            <Save className="w-3 h-3" /> {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => startEditing(sectionKey)}
          className="flex items-center gap-1"
        >
          <Pencil className="w-3 h-3" /> Edit
        </Button>
      )}
    </div>
  );

  const renderField = (label: string, field: keyof FormData, type: string = 'text') => {
    const value = getDisplayValue(field);
    const isEditing = editingSection !== null;

    if (isEditing && editingSection) {
      return (
        <div className="mb-4">
          <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
            {label}
          </label>
          {type === 'textarea' ? (
            <textarea
              value={String(value || '')}
              onChange={(e) => updateEditData(field, e.target.value)}
              className="w-full px-3 py-2 border border-[#e9ebef] rounded-lg focus:outline-none focus:border-[#0B3B2E] text-sm resize-none"
              rows={3}
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          ) : (
            <Input
              value={String(value || '')}
              onChange={(e) => updateEditData(field, e.target.value)}
              className="text-sm"
            />
          )}
        </div>
      );
    }

    return (
      <div className="mb-4">
        <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
          {label}
        </label>
        <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
          {Array.isArray(value) ? (value as string[]).join(', ') || '—' : String(value || '—')}
        </p>
      </div>
    );
  };

  const renderArrayField = (label: string, field: keyof FormData) => {
    const value = getDisplayValue(field) as string[];
    return (
      <div className="mb-4">
        <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
          {label}
        </label>
        <div className="flex flex-wrap gap-2">
          {(value && value.length > 0) ? value.map((item, i) => (
            <span key={i} className="px-3 py-1 bg-[#f3f3f5] rounded-full text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              {item}
            </span>
          )) : (
            <span className="text-sm text-[#717182]">—</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#e9ebef]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>VOXD</h2>
          <div className="flex items-center gap-4">
            <div className="relative user-menu-container">
              <button
                className="w-10 h-10 bg-[#0B3B2E] rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {profileData.organisationName?.charAt(0)?.toUpperCase() || profileData.firstName?.charAt(0)?.toUpperCase() || 'U'}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-[#e9ebef] rounded-lg shadow-lg overflow-hidden z-50">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/dashboard');
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-[#f3f3f5] transition-colors flex items-center gap-3"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#717182]" />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>Dashboard</span>
                  </button>
                  <button
                    onClick={async () => {
                      if (onLogout) {
                        try {
                          await authAPI.signOut();
                          onLogout();
                        } catch (error: any) {
                          toast.error(`Failed to logout: ${error.message}`);
                        }
                      }
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-[#f3f3f5] transition-colors flex items-center gap-3"
                  >
                    <LogOut className="w-4 h-4 text-[#717182]" />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back to Dashboard */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-[#717182] hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>Back to Dashboard</span>
        </button>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl mb-1" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>
            My Profile
          </h1>
          <p className="text-[#717182]" style={{ fontFamily: 'Inter, sans-serif' }}>
            View and edit your profile information
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#0B3B2E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#717182]">Loading your profile...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {isOrganizer ? (
              <>
                {/* Organizer: Basic Information */}
                <div className="bg-white border border-[#e9ebef] rounded-lg p-6">
                  {renderSectionHeader('Basic Information', 'basics', <Briefcase className="w-5 h-5 text-white" />)}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    {renderField('Organisation Name', 'organisationName')}
                    {renderField('Tagline', 'tagline')}
                    {renderField('Website', 'website')}
                    {renderField('Country', 'country')}
                    {renderField('City', 'city')}
                  </div>
                  {renderArrayField('Industries', 'industries')}
                </div>

                {/* Organizer: Contact & Social */}
                <div className="bg-white border border-[#e9ebef] rounded-lg p-6">
                  {renderSectionHeader('Contact & Social', 'contact', <Phone className="w-5 h-5 text-white" />)}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    {renderField('Contact Name', 'contactName')}
                    {renderField('Contact Email', 'contactEmail')}
                    {renderField('Contact Phone', 'contactPhone')}
                    {renderField('Calendar Link', 'calendarLink')}
                    {renderField('LinkedIn', 'linkedIn')}
                    {renderField('Instagram', 'instagram')}
                    {renderField('YouTube', 'youtube')}
                    {renderField('Twitter / X', 'twitter')}
                  </div>
                  <div className="border-t border-[#e9ebef] pt-4 mt-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <label htmlFor="showInSpeakerSearch" className="block cursor-pointer" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
                          Allow speakers to find me
                        </label>
                        <p className="text-[#717182] mt-1" style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
                          Make your profile visible in speaker search results
                        </p>
                      </div>
                      <Switch
                        id="showInSpeakerSearch"
                        checked={profileData.showInSpeakerSearch}
                        onCheckedChange={async (checked) => {
                          setProfileData(prev => ({ ...prev, showInSpeakerSearch: checked }));
                          updateFormData({ showInSpeakerSearch: checked });
                          try {
                            await organizerAPI.toggleSpeakerVisibility(checked);
                          } catch (error: any) {
                            toast.error('Failed to update visibility');
                            setProfileData(prev => ({ ...prev, showInSpeakerSearch: !checked }));
                            updateFormData({ showInSpeakerSearch: !checked });
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Organizer: Event Types */}
                <div className="bg-white border border-[#e9ebef] rounded-lg p-6">
                  {renderSectionHeader('Event Types & Frequency', 'events', <Calendar className="w-5 h-5 text-white" />)}
                  {renderArrayField('Event Types', 'eventTypes')}
                  {renderArrayField('Frequency', 'frequency')}
                  {renderArrayField('Event Sizes', 'eventSizes')}
                  {renderArrayField('Formats', 'formats')}
                  {renderArrayField('Locations', 'locations')}
                </div>

                {/* Organizer: Speaker Preferences */}
                <div className="bg-white border border-[#e9ebef] rounded-lg p-6">
                  {renderSectionHeader('Speaker Preferences', 'preferences', <User className="w-5 h-5 text-white" />)}
                  {renderArrayField('Speaker Formats', 'speakerFormats')}
                  {renderArrayField('Languages', 'languages')}
                  {renderField('Budget Range', 'budgetRange')}
                  {renderField('Lead Time', 'leadTime')}
                  <div className="mb-4">
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Diversity Goals
                    </label>
                    <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {profileData.diversityGoals ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Speaker: Basic Information */}
                <div className="bg-white border border-[#e9ebef] rounded-lg p-6">
                  {renderSectionHeader('Basic Information', 'basics', <User className="w-5 h-5 text-white" />)}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    {renderField('First Name', 'firstName')}
                    {renderField('Last Name', 'lastName')}
                    {renderField('Professional Title', 'professionalTitle')}
                    {renderField('Tagline', 'speakerTagline')}
                    {renderField('Location', 'speakerLocation')}
                    {renderField('City', 'speakerCity')}
                  </div>
                </div>

                {/* Speaker: Topics & Expertise */}
                <div className="bg-white border border-[#e9ebef] rounded-lg p-6">
                  {renderSectionHeader('Topics & Expertise', 'topics', <Briefcase className="w-5 h-5 text-white" />)}
                  {renderArrayField('Topics', 'topics')}
                  {renderArrayField('Custom Topics', 'customTopics')}
                </div>

                {/* Speaker: Experience */}
                <div className="bg-white border border-[#e9ebef] rounded-lg p-6">
                  {renderSectionHeader('Experience', 'experience', <Calendar className="w-5 h-5 text-white" />)}
                  {renderArrayField('Speaking Formats', 'speakingFormats')}
                  {renderField('Years of Experience', 'yearsOfExperience')}
                  {renderField('Notable Clients', 'notableClients')}
                </div>

                {/* Speaker: Bio & Links */}
                <div className="bg-white border border-[#e9ebef] rounded-lg p-6">
                  {renderSectionHeader('Bio & Links', 'bio', <Globe className="w-5 h-5 text-white" />)}
                  {renderField('Bio', 'bio', 'textarea')}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    {renderField('Website', 'speakerWebsite')}
                    {renderField('LinkedIn', 'speakerLinkedIn')}
                    {renderField('Twitter / X', 'speakerTwitter')}
                    {renderField('Instagram', 'speakerInstagram')}
                    {renderField('YouTube', 'speakerYoutube')}
                    {renderField('Demo Video URL', 'demoVideoUrl')}
                  </div>
                </div>

                {/* Speaker: Availability & Pricing */}
                <div className="bg-white border border-[#e9ebef] rounded-lg p-6">
                  {renderSectionHeader('Availability & Pricing', 'availability', <DollarSign className="w-5 h-5 text-white" />)}
                  {renderField('Geographic Reach', 'geographicReach')}
                  <div className="mb-4">
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Willing to Travel
                    </label>
                    <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {profileData.willingToTravel ? 'Yes' : 'No'}
                    </p>
                  </div>
                  {renderArrayField('Preferred Event Types', 'preferredEventTypes')}
                  {renderArrayField('Preferred Audience Sizes', 'preferredAudienceSizes')}
                  {renderField('Speaking Fee Range', 'speakingFeeRange')}
                  {renderField('Technical Requirements', 'technicalRequirements')}
                  {renderField('Special Accommodations', 'specialAccommodations')}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
