import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Pencil, Save, X, User, Briefcase, Calendar, Upload, Video, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { FormData } from '@/types/formData';
import { speakerAPI, authAPI, fileAPI } from '@/utils/api';
import { getSignedUrl } from '@/lib/storage';
import { toast } from 'sonner';

interface SpeakerProfileScreenProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  saveProfile: (data: FormData, showLoading: boolean) => Promise<boolean>;
  onLogout?: () => void;
}

const topicOptions = [
  'Artificial Intelligence', 'Machine Learning', 'Digital Transformation',
  'Leadership', 'Entrepreneurship', 'Marketing', 'Sales', 'Innovation',
  'Technology', 'Sustainability', 'Healthcare', 'Finance', 'Education',
  'Customer Experience', 'Diversity & Inclusion',
];

const speakingFormatOptions = [
  'Keynote', 'Panel Discussion', 'Workshop', 'Fireside Chat',
  'Breakout Session', 'Webinar', 'Moderation', 'MC/Host',
];

const experienceOptions = ['0-2 years', '3-5 years', '6-10 years', '10+ years'];

const geographicOptions = [
  'Local (within my city)', 'Regional (within my country)',
  'Continental (within my continent)', 'Global (anywhere in the world)',
];

const preferredEventTypeOptions = [
  'Conference', 'Corporate Event', 'Workshop/Training', 'Summit',
  'Webinar', 'Podcast', 'Panel Discussion', 'University/Academic', 'Charity/Non-profit',
];

// Map snake_case API response to camelCase FormData keys
const mapProfileToFormData = (profile: any): Partial<FormData> => ({
  full_name: profile.full_name ?? '',
  professionalTitle: profile.professional_title ?? '',
  speakerTagline: profile.professional_headline ?? '',
  speakerLocation: profile.speaker_country ?? '',
  speakerCity: profile.speaker_city ?? '',
  profilePhoto: profile.profile_photo ?? null,
  bio: profile.bio ?? '',
  topics: profile.topics ?? [],
  customTopics: profile.custom_topics ?? [],
  speakingFormats: profile.speaking_formats ?? [],
  yearsOfExperience: profile.years_of_experience ?? '',
  pastEngagements: profile.past_engagements ?? 0,
  notableClients: profile.notable_clients ?? '',
  videoIntroUrl: profile.video_intro_url ?? '',
  geographicReach: profile.geographic_reach ?? '',
  willingToTravel: profile.willing_to_travel ?? false,
  preferredEventTypes: profile.preferred_event_types ?? [],
  availabilityPeriods: profile.availability_periods ?? [],
  speakingFeeRange: profile.speaking_fee_range ?? '',
  technicalRequirements: profile.technical_requirements ?? '',
  specialAccommodations: profile.special_accommodations ?? '',
});

export default function SpeakerProfileScreen({ formData, updateFormData, saveProfile, onLogout }: SpeakerProfileScreenProps) {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<FormData>(formData);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<FormData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [customTopicInput, setCustomTopicInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Availability period editing state
  const [showAddPeriod, setShowAddPeriod] = useState(false);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [periodOngoing, setPeriodOngoing] = useState(false);

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

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const profile = await speakerAPI.getProfile();
        if (profile) {
          const mapped = mapProfileToFormData(profile);
          setProfileData({ ...formData, ...mapped });

          if (profile.profile_photo && typeof profile.profile_photo === 'string') {
            try {
              const url = await getSignedUrl(profile.profile_photo);
              setPhotoUrl(url);
            } catch {
              setPhotoUrl(null);
            }
          }
        }
      } catch (error) {
        setProfileData(formData);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startEditing = (section: string) => {
    setEditingSection(section);
    setEditData({});
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditData({});
    setPhotoPreview(null);
    setPhotoRemoved(false);
    setCustomTopicInput('');
    setShowAddPeriod(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const saveData = { ...editData };

      if (saveData.profilePhoto instanceof File) {
        const storagePath = await fileAPI.upload(saveData.profilePhoto, 'photo');
        saveData.profilePhoto = storagePath as any;
        try {
          const url = await getSignedUrl(storagePath);
          setPhotoUrl(url);
        } catch { /* non-critical */ }
      }

      const updatedData = { ...profileData, ...saveData };
      setProfileData(updatedData);
      updateFormData(saveData);
      const saved = await saveProfile(updatedData, false);
      if (saved) {
        toast.success('Profile updated successfully');
        setEditingSection(null);
        setEditData({});
        setPhotoPreview(null);
        setPhotoRemoved(false);
        setCustomTopicInput('');
        setShowAddPeriod(false);
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

  const getArrayValue = (field: keyof FormData): string[] => {
    const val = getDisplayValue(field);
    return Array.isArray(val) ? val : [];
  };

  const toggleOption = (field: keyof FormData, value: string) => {
    const current = getArrayValue(field);
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    updateEditData(field, updated);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateEditData('profilePhoto', file);
      setPhotoRemoved(false);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    updateEditData('profilePhoto', null);
    setPhotoPreview(null);
    setPhotoRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addCustomTopic = () => {
    if (customTopicInput.trim()) {
      const current = getArrayValue('customTopics');
      if (!current.includes(customTopicInput.trim())) {
        updateEditData('customTopics', [...current, customTopicInput.trim()]);
      }
      setCustomTopicInput('');
    }
  };

  const removeCustomTopic = (topic: string) => {
    const current = getArrayValue('customTopics');
    updateEditData('customTopics', current.filter(t => t !== topic));
  };

  const addAvailabilityPeriod = () => {
    if (!periodStart) return;
    if (!periodOngoing && !periodEnd) return;
    if (!periodOngoing && periodEnd && periodEnd <= periodStart) return;

    const periods = getDisplayValue('availabilityPeriods') as FormData['availabilityPeriods'];
    const current = Array.isArray(periods) ? periods : [];
    const newPeriod = {
      id: String(Date.now()),
      startDate: periodStart,
      endDate: periodOngoing ? '' : periodEnd,
      ongoing: periodOngoing,
    };
    updateEditData('availabilityPeriods', [...current, newPeriod]);
    setPeriodStart('');
    setPeriodEnd('');
    setPeriodOngoing(false);
    setShowAddPeriod(false);
  };

  const removeAvailabilityPeriod = (id: string) => {
    const periods = getDisplayValue('availabilityPeriods') as FormData['availabilityPeriods'];
    const current = Array.isArray(periods) ? periods : [];
    updateEditData('availabilityPeriods', current.filter(p => p.id !== id));
  };

  const isEditing = (section: string) => editingSection === section;

  const ensureUrl = (url: string): string => {
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
  };

  const renderSectionHeader = (title: string, sectionKey: string, icon: React.ReactNode) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0B3B2E] rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-lg" style={{ fontFamily: 'Inter, sans-serif', fontWeight: '600' }}>{title}</h3>
      </div>
      {isEditing(sectionKey) ? (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={cancelEditing} className="flex items-center gap-1">
            <X className="w-3 h-3" /> Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="flex items-center gap-1 bg-[#0B3B2E] hover:bg-black text-white">
            <Save className="w-3 h-3" /> {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => startEditing(sectionKey)} className="flex items-center gap-1">
          <Pencil className="w-3 h-3" /> Edit
        </Button>
      )}
    </div>
  );

  const renderField = (label: string, field: keyof FormData) => {
    const value = profileData[field];
    const str = String(value || '');
    const isLink = field === 'videoIntroUrl' && str && str !== '—';
    return (
      <div className="mb-4">
        <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</label>
        {isLink ? (
          <a
            href={ensureUrl(str)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#0B3B2E] underline hover:text-black break-all"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {str}
          </a>
        ) : (
          <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            {str || '—'}
          </p>
        )}
      </div>
    );
  };

  const renderArrayField = (label: string, field: keyof FormData) => {
    const value = profileData[field];
    const arr = Array.isArray(value) ? value : [];
    return (
      <div className="mb-4">
        <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</label>
        <div className="flex flex-wrap gap-2">
          {arr.length > 0 ? arr.map((item, i) => (
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

  const renderToggleButtons = (field: keyof FormData, options: string[]) => {
    const current = getArrayValue(field);
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => toggleOption(field, option)}
            className={`px-4 py-2 rounded-full border transition-colors ${
              current.includes(option)
                ? 'bg-[#0B3B2E] text-white border-[#0B3B2E]'
                : 'bg-white text-black border-[#e9ebef] hover:border-[#0B3B2E]'
            }`}
            style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
          >
            {option}
          </button>
        ))}
      </div>
    );
  };

  const renderSingleSelect = (field: keyof FormData, options: string[]) => {
    const current = getDisplayValue(field);
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => updateEditData(field, option)}
            className={`px-4 py-2 rounded-full border transition-colors ${
              current === option
                ? 'bg-[#0B3B2E] text-white border-[#0B3B2E]'
                : 'bg-white text-black border-[#e9ebef] hover:border-[#0B3B2E]'
            }`}
            style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
          >
            {option}
          </button>
        ))}
      </div>
    );
  };

  const displayPhotoSrc = photoPreview || photoUrl;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#e9ebef]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>VOXD</h2>
          <div className="flex items-center gap-4">
            <div className="relative user-menu-container">
              <button
                className="w-10 h-10 bg-[#0B3B2E] rounded-full flex items-center justify-center text-white hover:bg-black transition-colors overflow-hidden"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  profileData.full_name?.charAt(0)?.toUpperCase() || profileData.firstName?.charAt(0)?.toUpperCase() || 'U'
                )}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-[#e9ebef] rounded-lg shadow-lg overflow-hidden z-50">
                  <button
                    onClick={() => { setShowUserMenu(false); navigate('/dashboard'); }}
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
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-[#717182] hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>Back to Dashboard</span>
        </button>

        <div className="mb-8">
          <h1 className="text-2xl mb-1" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>
            My Profile
          </h1>
          <p className="text-[#717182]" style={{ fontFamily: 'Inter, sans-serif' }}>
            View and edit your speaker profile information
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

            {/* Section 1: Speaker Basics */}
            <div className="bg-white border border-[#e9ebef] rounded-lg p-6">
              {renderSectionHeader('Speaker Basics', 'basics', <User className="w-5 h-5 text-white" />)}

              {isEditing('basics') ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Profile Photo
                    </label>
                    {!photoRemoved && displayPhotoSrc ? (
                      <div className="relative inline-block">
                        <img src={displayPhotoSrc} alt="Profile" className="w-24 h-24 object-cover rounded-full border border-[#e9ebef]" />
                        <button
                          onClick={removePhoto}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-[#d4183d] text-white rounded-full flex items-center justify-center hover:bg-[#b0142f]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 border-2 border-dashed border-[#e9ebef] rounded-full flex flex-col items-center justify-center cursor-pointer hover:border-[#0B3B2E] transition-colors"
                      >
                        <Upload className="w-5 h-5 text-[#717182] mb-1" />
                        <p className="text-[#717182]" style={{ fontSize: '10px' }}>Upload</p>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" onChange={handlePhotoUpload} className="hidden" />
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Full Name</label>
                    <Input
                      value={String(getDisplayValue('full_name') || '')}
                      onChange={(e) => updateEditData('full_name', e.target.value)}
                      placeholder="e.g., Alex Carter"
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Professional Title</label>
                    <Input
                      value={String(getDisplayValue('professionalTitle') || '')}
                      onChange={(e) => updateEditData('professionalTitle', e.target.value)}
                      placeholder="e.g., Growth and Motivation Strategist"
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Biography</label>
                    <textarea
                      value={String(getDisplayValue('bio') || '')}
                      onChange={(e) => updateEditData('bio', e.target.value)}
                      className="w-full px-3 py-2 border border-[#e9ebef] rounded-lg focus:outline-none focus:border-[#0B3B2E] text-sm resize-none"
                      rows={6}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Country</label>
                      <Input
                        value={String(getDisplayValue('speakerLocation') || '')}
                        onChange={(e) => updateEditData('speakerLocation', e.target.value)}
                        placeholder="e.g., Germany"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>City</label>
                      <Input
                        value={String(getDisplayValue('speakerCity') || '')}
                        onChange={(e) => updateEditData('speakerCity', e.target.value)}
                        placeholder="e.g., Berlin"
                        className="text-sm"
                      />
                    </div>
                  </div>

                </div>
              ) : (
                <>
                  <div className="mb-4">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Profile" className="w-24 h-24 object-cover rounded-full border border-[#e9ebef]" />
                    ) : (
                      <div className="w-24 h-24 bg-[#f3f3f5] rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-[#717182]" />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    {renderField('Full Name', 'full_name')}
                    {renderField('Professional Title', 'professionalTitle')}
                    {renderField('Country', 'speakerLocation')}
                    {renderField('City', 'speakerCity')}
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Biography</label>
                    <p className="text-sm whitespace-pre-wrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {profileData.bio || '—'}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Section 2: Topics & Expertise */}
            <div className="bg-white border border-[#e9ebef] rounded-lg p-6">
              {renderSectionHeader('Topics & Expertise', 'topics', <Briefcase className="w-5 h-5 text-white" />)}

              {isEditing('topics') ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#717182] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Suggested Topics</label>
                    {renderToggleButtons('topics', topicOptions)}
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Custom Topics</label>
                    <div className="flex gap-2">
                      <Input
                        value={customTopicInput}
                        onChange={(e) => setCustomTopicInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTopic(); } }}
                        placeholder="Add a custom topic"
                        className="text-sm"
                      />
                      <Button onClick={addCustomTopic} size="sm" className="bg-[#0B3B2E] hover:bg-black text-white">Add</Button>
                    </div>
                    {getArrayValue('customTopics').length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {getArrayValue('customTopics').map((topic) => (
                          <div key={topic} className="flex items-center gap-2 px-3 py-1 bg-[#e9ebef] rounded-full">
                            <span style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>{topic}</span>
                            <button onClick={() => removeCustomTopic(topic)} className="hover:text-[#d4183d]">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {renderArrayField('Topics', 'topics')}
                  {renderArrayField('Custom Topics', 'customTopics')}
                </>
              )}
            </div>

            {/* Section 3: Experience */}
            <div className="bg-white border border-[#e9ebef] rounded-lg p-6">
              {renderSectionHeader('Experience', 'experience', <Calendar className="w-5 h-5 text-white" />)}

              {isEditing('experience') ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#717182] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Speaking Formats</label>
                    {renderToggleButtons('speakingFormats', speakingFormatOptions)}
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Years of Experience</label>
                    {renderSingleSelect('yearsOfExperience', experienceOptions)}
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Past Engagements</label>
                    <Input
                      type="number"
                      value={String(getDisplayValue('pastEngagements') || '')}
                      onChange={(e) => updateEditData('pastEngagements', parseInt(e.target.value) || 0)}
                      placeholder="Number of past speaking engagements"
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Notable Clients or Events</label>
                    <textarea
                      value={String(getDisplayValue('notableClients') || '')}
                      onChange={(e) => updateEditData('notableClients', e.target.value)}
                      className="w-full px-3 py-2 border border-[#e9ebef] rounded-lg focus:outline-none focus:border-[#0B3B2E] text-sm resize-none"
                      rows={3}
                      placeholder="e.g., Google, TEDx"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {renderArrayField('Speaking Formats', 'speakingFormats')}
                  {renderField('Years of Experience', 'yearsOfExperience')}
                  <div className="mb-4">
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Past Engagements</label>
                    <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {profileData.pastEngagements || '—'}
                    </p>
                  </div>
                  {renderField('Notable Clients', 'notableClients')}
                </>
              )}
            </div>

            {/* Section 4: Video Introduction */}
            <div className="bg-white border border-[#e9ebef] rounded-lg p-6">
              {renderSectionHeader('Video Introduction', 'video', <Video className="w-5 h-5 text-white" />)}

              {isEditing('video') ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Video URL</label>
                    <Input
                      value={String(getDisplayValue('videoIntroUrl') || '')}
                      onChange={(e) => updateEditData('videoIntroUrl', e.target.value)}
                      placeholder="YouTube, Vimeo, or Loom link"
                      className="text-sm"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {renderField('Video URL', 'videoIntroUrl')}
                </>
              )}
            </div>

            {/* Section 5: Availability & Preferences */}
            <div className="bg-white border border-[#e9ebef] rounded-lg p-6">
              {renderSectionHeader('Availability & Preferences', 'availability', <MapPin className="w-5 h-5 text-white" />)}

              {isEditing('availability') ? (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm text-[#717182] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Geographic Reach</label>
                    {renderSingleSelect('geographicReach', geographicOptions)}
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="willingToTravel-edit"
                      checked={!!getDisplayValue('willingToTravel')}
                      onCheckedChange={(checked) => updateEditData('willingToTravel', checked as boolean)}
                      className="mt-1"
                    />
                    <label htmlFor="willingToTravel-edit" className="cursor-pointer text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                      I'm willing to travel for speaking engagements
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Preferred Event Types</label>
                    {renderToggleButtons('preferredEventTypes', preferredEventTypeOptions)}
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Availability Periods</label>
                    {(() => {
                      const periods = getDisplayValue('availabilityPeriods') as FormData['availabilityPeriods'];
                      const currentPeriods = Array.isArray(periods) ? periods : [];
                      return (
                        <>
                          {currentPeriods.length > 0 && (
                            <div className="space-y-2 mb-3">
                              {currentPeriods.map((period) => (
                                <div key={period.id} className="flex items-center justify-between px-3 py-2 bg-[#f3f3f5] rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[#717182]" />
                                    <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                                      {period.startDate} — {period.ongoing ? 'Ongoing' : period.endDate}
                                    </span>
                                  </div>
                                  <button onClick={() => removeAvailabilityPeriod(period.id)} className="hover:text-[#d4183d]">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          {showAddPeriod ? (
                            <div className="border border-[#e9ebef] rounded-lg p-4 space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Start Date</label>
                                  <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="text-sm" />
                                </div>
                                <div>
                                  <label className="block text-xs text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>End Date</label>
                                  <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} disabled={periodOngoing} className="text-sm" />
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="periodOngoing"
                                  checked={periodOngoing}
                                  onCheckedChange={(checked) => setPeriodOngoing(checked as boolean)}
                                />
                                <label htmlFor="periodOngoing" className="text-sm cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>Ongoing</label>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={addAvailabilityPeriod} className="bg-[#0B3B2E] hover:bg-black text-white">Add</Button>
                                <Button size="sm" variant="outline" onClick={() => setShowAddPeriod(false)}>Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => setShowAddPeriod(true)} className="flex items-center gap-1">
                              + Add Availability Period
                            </Button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <>
                  {renderField('Geographic Reach', 'geographicReach')}
                  <div className="mb-4">
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Willing to Travel</label>
                    <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {profileData.willingToTravel ? 'Yes' : 'No'}
                    </p>
                  </div>
                  {renderArrayField('Preferred Event Types', 'preferredEventTypes')}
                  <div className="mb-4">
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Availability Periods</label>
                    {profileData.availabilityPeriods && profileData.availabilityPeriods.length > 0 ? (
                      <div className="space-y-2">
                        {profileData.availabilityPeriods.map((period) => (
                          <div key={period.id} className="flex items-center gap-2 px-3 py-2 bg-[#f3f3f5] rounded-lg">
                            <Calendar className="w-4 h-4 text-[#717182]" />
                            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {period.startDate} — {period.ongoing ? 'Ongoing' : period.endDate}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-[#717182]">—</span>
                    )}
                  </div>
                </>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
