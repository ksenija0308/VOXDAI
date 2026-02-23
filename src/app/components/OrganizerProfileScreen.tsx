import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Pencil, Save, X, Briefcase, Phone, Calendar, User, Upload, Linkedin, Instagram, Youtube, Twitter } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { FormData } from '@/types/formData';
import { organizerAPI, authAPI, fileAPI } from '@/api';
import { useLogoContext } from '@/context/LogoContext';
import { toast } from 'sonner';

interface OrganizerProfileScreenProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  saveProfile: (data: FormData, showLoading: boolean) => Promise<boolean>;
  onLogout?: () => void;
}

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing',
  'Manufacturing', 'Retail', 'Entertainment', 'Non-profit', 'Government',
  'Consulting', 'Real Estate', 'Robotics', 'Blockchain', 'Other',
];

const countries = [
  'Switzerland', 'Germany', 'Austria', 'Belgium', 'Bulgaria', 'Croatia',
  'Cyprus', 'Czechia', 'Denmark', 'Estonia', 'Finland', 'France',
  'Greece', 'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania',
  'Luxembourg', 'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania',
  'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Other',
];

const eventTypeOptions = [
  'Conference', 'Meetup', 'Corporate event', 'Workshop', 'Webinar',
  'Podcast', 'Panel', 'Internal training', 'Other',
];

const frequencyOptions = ['Weekly', 'Monthly', 'Quarterly', 'Bi-annually', 'Annually', 'Ad-hoc'];
const eventSizeOptions = ['10–30', '30–80', '80–200', '200–1000', '1000+'];
const formatOptions = ['In-person', 'Online', 'Hybrid'];

const speakerFormatOptions = ['Keynote', 'Panel', 'Workshop', 'Fireside chat', 'Podcast guest', 'Moderator'];
const languageOptions = ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Portuguese', 'Japanese', 'Korean', 'Arabic', 'Hindi'];
const leadTimeOptions = ['0–2 weeks', '3–4 weeks', '1–3 months', '3+ months'];

export default function OrganizerProfileScreen({ formData, updateFormData, saveProfile, onLogout }: OrganizerProfileScreenProps) {
  const navigate = useNavigate();
  const { logoUrl, refreshLogo } = useLogoContext();
  const [profileData, setProfileData] = useState<FormData>(formData);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<FormData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Map snake_case API response to camelCase FormData keys
  const mapProfileToFormData = (profile: any): Partial<FormData> => ({
    organisationName: profile.organisation_name ?? '',
    website: profile.website ?? '',
    country: profile.country ?? '',
    city: profile.city ?? '',
    industries: profile.industries ?? [],
    logo: profile.logo ?? null,
    tagline: profile.tagline ?? '',
    contactName: profile.contact_name ?? '',
    contactEmail: profile.contact_email ?? '',
    contactPhone: profile.contact_phone ?? '',
    calendarLink: profile.calendar_link ?? '',
    calendarType: profile.calendar_type ?? '',
    linkedIn: profile.linked_in ?? '',
    instagram: profile.instagram ?? '',
    youtube: profile.youtube ?? '',
    twitter: profile.twitter ?? '',
    authorised: profile.authorised ?? false,
    eventTypes: profile.event_types ?? [],
    frequency: profile.frequency ?? [],
    eventSizes: profile.event_sizes ?? [],
    formats: profile.formats ?? [],
    locations: profile.locations ?? [],
    speakerFormats: profile.speaker_formats ?? [],
    diversityGoals: profile.diversity_goals ?? false,
    diversityTargets: profile.diversity_targets ?? '',
    languages: profile.languages ?? [],
    budgetRange: profile.budget_range ?? '',
    budgetMin: profile.budget_min ?? 0,
    budgetMax: profile.budget_max ?? 10000,
    leadTime: profile.lead_time ?? '',
    showInSpeakerSearch: profile.show_in_speaker_search ?? false,
  });

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const profile = await organizerAPI.getProfile();
        if (profile) {
          const mapped = mapProfileToFormData(profile);
          setProfileData({ ...formData, ...mapped });
          refreshLogo();
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
    setErrors({});
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditData({});
    setErrors({});
    setLocationInput('');
    setLogoPreview(null);
    setLogoRemoved(false);
  };

  const validateSection = (section: string, merged: FormData): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    if (section === 'basics') {
      if (!String(merged.organisationName || '').trim()) newErrors.organisationName = 'Organisation name is required';
      if (!String(merged.tagline || '').trim()) newErrors.tagline = 'Tagline is required';
      if (!String(merged.country || '').trim()) newErrors.country = 'Country is required';
      if (!String(merged.city || '').trim()) newErrors.city = 'City is required';
      if (!merged.industries || merged.industries.length === 0) newErrors.industries = 'Select at least one industry';
    }
    if (section === 'contact') {
      if (!String(merged.contactName || '').trim()) newErrors.contactName = 'Contact name is required';
      if (!String(merged.contactEmail || '').trim()) newErrors.contactEmail = 'Contact email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(merged.contactEmail))) newErrors.contactEmail = 'Enter a valid email address';
    }
    if (section === 'events') {
      if (!merged.eventTypes || merged.eventTypes.length === 0) newErrors.eventTypes = 'Select at least one event type';
      if (!merged.frequency || merged.frequency.length === 0) newErrors.frequency = 'Select at least one frequency';
      if (!merged.eventSizes || merged.eventSizes.length === 0) newErrors.eventSizes = 'Select at least one event size';
      if (!merged.formats || merged.formats.length === 0) newErrors.formats = 'Select at least one format';
    }
    if (section === 'preferences') {
      if (!merged.speakerFormats || merged.speakerFormats.length === 0) newErrors.speakerFormats = 'Select at least one speaker format';
      if (!merged.languages || merged.languages.length === 0) newErrors.languages = 'Select at least one language';
    }
    return newErrors;
  };

  const handleSave = async () => {
    // Validate before saving
    if (editingSection) {
      const merged = { ...profileData, ...editData } as FormData;
      const validationErrors = validateSection(editingSection, merged);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    setIsSaving(true);
    try {
      const saveData = { ...editData };

      // If a new logo File was selected, upload it first
      if (saveData.logo instanceof File) {
        const storagePath = await fileAPI.upload(saveData.logo, 'logo');
        saveData.logo = storagePath;
      }

      const updatedData = { ...profileData, ...saveData };
      setProfileData(updatedData);
      updateFormData(saveData);
      const saved = await saveProfile(updatedData, false);
      if (saved) {
        setEditingSection(null);
        setEditData({});
        setLocationInput('');
        setLogoPreview(null);
        setLogoRemoved(false);
        refreshLogo();
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
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateEditData('logo', file);
      setLogoRemoved(false);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    updateEditData('logo', null);
    setLogoPreview(null);
    setLogoRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addLocation = () => {
    if (locationInput.trim()) {
      const current = getArrayValue('locations');
      if (!current.includes(locationInput.trim())) {
        updateEditData('locations', [...current, locationInput.trim()]);
      }
      setLocationInput('');
    }
  };

  const removeLocation = (location: string) => {
    const current = getArrayValue('locations');
    updateEditData('locations', current.filter(l => l !== location));
  };

  const isEditing = (section: string) => editingSection === section;

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

  const linkFields: Set<keyof FormData> = new Set([
    'website', 'calendarLink', 'linkedIn', 'instagram', 'youtube', 'twitter',
  ]);

  const ensureUrl = (url: string): string => {
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
  };

  const renderField = (label: string, field: keyof FormData) => {
    const value = profileData[field];
    const str = String(value || '');
    const isLink = linkFields.has(field) && str && str !== '—';
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
              {typeof item === 'string' ? item : String(item)}
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
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  profileData.organisationName?.charAt(0)?.toUpperCase() || 'U'
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
            View and edit your organizer profile information
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

            {/* Section 1: Organiser Basics */}
            <div className="bg-white border border-[#e9ebef] rounded-lg p-6">
              {renderSectionHeader('Organiser Basics', 'basics', <Briefcase className="w-5 h-5 text-white" />)}

              {isEditing('basics') ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Logo
                    </label>
                    {!logoRemoved && (logoPreview || logoUrl) ? (
                      <div className="relative inline-block">
                        <img
                          src={logoPreview || logoUrl!}
                          alt="Logo preview"
                          className="w-24 h-24 object-cover rounded-lg border border-[#e9ebef]"
                        />
                        <button
                          onClick={removeLogo}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-[#d4183d] text-white rounded-full flex items-center justify-center hover:bg-[#b0142f]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-[#e9ebef] rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#0B3B2E] transition-colors"
                      >
                        <Upload className="w-6 h-6 text-[#717182] mb-1" />
                        <p className="text-[#717182]" style={{ fontSize: '13px' }}>Click to upload</p>
                        <p className="text-[#717182]" style={{ fontSize: '11px' }}>PNG, JPG up to 5MB</p>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" onChange={handleLogoUpload} className="hidden" />
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Organisation/Brand name <span className="text-[#d4183d]">*</span>
                    </label>
                    <Input
                      value={String(getDisplayValue('organisationName') || '')}
                      onChange={(e) => { updateEditData('organisationName', e.target.value); setErrors(prev => ({ ...prev, organisationName: '' })); }}
                      placeholder="e.g., Tech Summit Global"
                      className={`text-sm ${errors.organisationName ? 'border-[#d4183d]' : ''}`}
                    />
                    {errors.organisationName && <p className="text-[#d4183d] text-xs mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{errors.organisationName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Short tagline <span className="text-[#d4183d]">*</span>
                    </label>
                    <Input
                      value={String(getDisplayValue('tagline') || '')}
                      onChange={(e) => { updateEditData('tagline', e.target.value); setErrors(prev => ({ ...prev, tagline: '' })); }}
                      placeholder="e.g., Connecting tech leaders for innovation"
                      maxLength={80}
                      className={`text-sm ${errors.tagline ? 'border-[#d4183d]' : ''}`}
                    />
                    <div className="flex justify-between mt-1">
                      {errors.tagline ? <p className="text-[#d4183d] text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>{errors.tagline}</p> : <span />}
                      <span className="text-[#717182]" style={{ fontSize: '12px' }}>
                        {String(getDisplayValue('tagline') || '').length}/80
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Website
                    </label>
                    <Input
                      value={String(getDisplayValue('website') || '')}
                      onChange={(e) => updateEditData('website', e.target.value)}
                      placeholder="e.g., www.techsummit.com"
                      className="text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Country <span className="text-[#d4183d]">*</span>
                      </label>
                      <select
                        value={String(getDisplayValue('country') || '')}
                        onChange={(e) => { updateEditData('country', e.target.value); setErrors(prev => ({ ...prev, country: '' })); }}
                        className={`w-full h-10 px-3 rounded-md bg-[#f3f3f5] border-none text-sm ${errors.country ? 'ring-1 ring-[#d4183d]' : ''}`}
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        <option value="">Select country</option>
                        {countries.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      {errors.country && <p className="text-[#d4183d] text-xs mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{errors.country}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        City <span className="text-[#d4183d]">*</span>
                      </label>
                      <Input
                        value={String(getDisplayValue('city') || '')}
                        onChange={(e) => { updateEditData('city', e.target.value); setErrors(prev => ({ ...prev, city: '' })); }}
                        placeholder="e.g., San Francisco"
                        className={`text-sm ${errors.city ? 'border-[#d4183d]' : ''}`}
                      />
                      {errors.city && <p className="text-[#d4183d] text-xs mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{errors.city}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Industry <span className="text-[#d4183d]">*</span>
                    </label>
                    {renderToggleButtons('industries', industries)}
                    {errors.industries && <p className="text-[#d4183d] text-xs mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>{errors.industries}</p>}
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Organisation logo"
                        className="w-24 h-24 object-cover rounded-lg border border-[#e9ebef]"
                      />
                    ) : (
                      <span className="text-sm text-[#717182]">No logo uploaded</span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    {renderField('Organisation Name', 'organisationName')}
                    {renderField('Tagline', 'tagline')}
                    {renderField('Website', 'website')}
                    {renderField('Country', 'country')}
                    {renderField('City', 'city')}
                  </div>
                  {renderArrayField('Industries', 'industries')}
                </>
              )}
            </div>

            {/* Section 2: About / Contact & Social */}
            <div className="bg-white border border-[#e9ebef] rounded-lg p-6">
              {renderSectionHeader('Contact & Social', 'contact', <Phone className="w-5 h-5 text-white" />)}

              {isEditing('contact') ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Primary contact name <span className="text-[#d4183d]">*</span>
                    </label>
                    <Input
                      value={String(getDisplayValue('contactName') || '')}
                      onChange={(e) => { updateEditData('contactName', e.target.value); setErrors(prev => ({ ...prev, contactName: '' })); }}
                      placeholder="e.g., Jane Smith"
                      className={`text-sm ${errors.contactName ? 'border-[#d4183d]' : ''}`}
                    />
                    {errors.contactName && <p className="text-[#d4183d] text-xs mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{errors.contactName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Primary contact email <span className="text-[#d4183d]">*</span>
                    </label>
                    <Input
                      type="email"
                      value={String(getDisplayValue('contactEmail') || '')}
                      onChange={(e) => { updateEditData('contactEmail', e.target.value); setErrors(prev => ({ ...prev, contactEmail: '' })); }}
                      placeholder="e.g., jane@techsummit.com"
                      className={`text-sm ${errors.contactEmail ? 'border-[#d4183d]' : ''}`}
                    />
                    {errors.contactEmail && <p className="text-[#d4183d] text-xs mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{errors.contactEmail}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Primary contact phone
                    </label>
                    <Input
                      type="tel"
                      value={String(getDisplayValue('contactPhone') || '')}
                      onChange={(e) => updateEditData('contactPhone', e.target.value)}
                      placeholder="e.g., +1 (555) 123-4567"
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Calendar link
                    </label>
                    <div className="space-y-2">
                      <select
                        value={String(getDisplayValue('calendarType') || '')}
                        onChange={(e) => updateEditData('calendarType', e.target.value)}
                        className="w-full h-10 px-3 rounded-md bg-[#f3f3f5] border-none text-sm"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        <option value="">Select calendar type</option>
                        <option value="calendly">Calendly</option>
                        <option value="google">Google Calendar</option>
                        <option value="ical">iCal</option>
                      </select>
                      {getDisplayValue('calendarType') && (
                        <Input
                          value={String(getDisplayValue('calendarLink') || '')}
                          onChange={(e) => updateEditData('calendarLink', e.target.value)}
                          placeholder={`Paste your ${getDisplayValue('calendarType') === 'calendly' ? 'Calendly' : getDisplayValue('calendarType') === 'google' ? 'Google Calendar' : 'iCal'} link`}
                          className="text-sm"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Social links
                    </label>
                    <div className="space-y-3">
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717182]" />
                        <Input
                          value={String(getDisplayValue('linkedIn') || '')}
                          onChange={(e) => updateEditData('linkedIn', e.target.value)}
                          placeholder="LinkedIn URL"
                          className="pl-10 text-sm"
                        />
                      </div>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717182]" />
                        <Input
                          value={String(getDisplayValue('instagram') || '')}
                          onChange={(e) => updateEditData('instagram', e.target.value)}
                          placeholder="Instagram URL"
                          className="pl-10 text-sm"
                        />
                      </div>
                      <div className="relative">
                        <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717182]" />
                        <Input
                          value={String(getDisplayValue('youtube') || '')}
                          onChange={(e) => updateEditData('youtube', e.target.value)}
                          placeholder="YouTube URL"
                          className="pl-10 text-sm"
                        />
                      </div>
                      <div className="relative">
                        <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717182]" />
                        <Input
                          value={String(getDisplayValue('twitter') || '')}
                          onChange={(e) => updateEditData('twitter', e.target.value)}
                          placeholder="X (Twitter) URL"
                          className="pl-10 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#e9ebef] pt-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="authorised-edit"
                        checked={!!getDisplayValue('authorised')}
                        onCheckedChange={(checked) => updateEditData('authorised', checked as boolean)}
                        className="mt-1"
                      />
                      <label htmlFor="authorised-edit" className="cursor-pointer text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                        I'm authorised to book speakers on behalf of this organisation
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>

            {/* Section 3: Event Types & Frequency */}
            <div className="bg-white border border-[#e9ebef] rounded-lg p-6">
              {renderSectionHeader('Event Types & Frequency', 'events', <Calendar className="w-5 h-5 text-white" />)}

              {isEditing('events') ? (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm text-[#717182] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Event types <span className="text-[#d4183d]">*</span>
                    </label>
                    {renderToggleButtons('eventTypes', eventTypeOptions)}
                    {errors.eventTypes && <p className="text-[#d4183d] text-xs mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>{errors.eventTypes}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Frequency <span className="text-[#d4183d]">*</span>
                    </label>
                    {renderToggleButtons('frequency', frequencyOptions)}
                    {errors.frequency && <p className="text-[#d4183d] text-xs mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>{errors.frequency}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Typical event size <span className="text-[#d4183d]">*</span>
                    </label>
                    {renderToggleButtons('eventSizes', eventSizeOptions)}
                    {errors.eventSizes && <p className="text-[#d4183d] text-xs mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>{errors.eventSizes}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Format <span className="text-[#d4183d]">*</span>
                    </label>
                    {renderToggleButtons('formats', formatOptions)}
                    {errors.formats && <p className="text-[#d4183d] text-xs mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>{errors.formats}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Typical location(s)
                    </label>
                    <p className="text-[#717182] mb-2" style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
                      Press Enter to add each location
                    </p>
                    <Input
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLocation(); } }}
                      onBlur={addLocation}
                      placeholder="e.g., San Francisco, New York"
                      className="text-sm"
                    />
                    {getArrayValue('locations').length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {getArrayValue('locations').map((location) => (
                          <div key={location} className="flex items-center gap-2 px-3 py-1 bg-[#e9ebef] rounded-full">
                            <span style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>{location}</span>
                            <button onClick={() => removeLocation(location)} className="hover:text-[#d4183d]">
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
                  {renderArrayField('Event Types', 'eventTypes')}
                  {renderArrayField('Frequency', 'frequency')}
                  {renderArrayField('Event Sizes', 'eventSizes')}
                  {renderArrayField('Formats', 'formats')}
                  {renderArrayField('Locations', 'locations')}
                </>
              )}
            </div>

            {/* Section 4: Speaker Preferences */}
            <div className="bg-white border border-[#e9ebef] rounded-lg p-6">
              {renderSectionHeader('Speaker Preferences', 'preferences', <User className="w-5 h-5 text-white" />)}

              {isEditing('preferences') ? (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm text-[#717182] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Speaker formats <span className="text-[#d4183d]">*</span>
                    </label>
                    {renderToggleButtons('speakerFormats', speakerFormatOptions)}
                    {errors.speakerFormats && <p className="text-[#d4183d] text-xs mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>{errors.speakerFormats}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Languages needed <span className="text-[#d4183d]">*</span>
                    </label>
                    {renderToggleButtons('languages', languageOptions)}
                    {errors.languages && <p className="text-[#d4183d] text-xs mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>{errors.languages}</p>}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <label className="block text-sm text-[#717182]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Diversity goals
                        </label>
                        <p className="text-[#717182] mt-1" style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
                          Set targets for speaker diversity at your events
                        </p>
                      </div>
                      <Switch
                        checked={!!getDisplayValue('diversityGoals')}
                        onCheckedChange={(checked) => updateEditData('diversityGoals', checked)}
                      />
                    </div>
                    {getDisplayValue('diversityGoals') && (
                      <div className="bg-[#f3f3f5] p-4 rounded-lg">
                        <Input
                          value={String(getDisplayValue('diversityTargets') || '')}
                          onChange={(e) => updateEditData('diversityTargets', e.target.value)}
                          placeholder="e.g., 50% women speakers, diverse representation across panels"
                          className="bg-white border-none text-sm"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Budget range
                    </label>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        {(['unpaid', 'travel', 'paid'] as const).map((option) => (
                          <button
                            key={option}
                            onClick={() => updateEditData('budgetRange', option)}
                            className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                              getDisplayValue('budgetRange') === option
                                ? 'bg-[#0B3B2E] text-white border-[#0B3B2E]'
                                : 'bg-white text-black border-[#e9ebef] hover:border-[#0B3B2E]'
                            }`}
                            style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
                          >
                            {option === 'unpaid' ? 'Unpaid' : option === 'travel' ? 'Travel covered' : 'Paid'}
                          </button>
                        ))}
                      </div>
                      {getDisplayValue('budgetRange') === 'paid' && (
                        <div className="bg-[#f3f3f5] p-4 rounded-lg">
                          <label className="block mb-4 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Budget range: CHF {(Number(getDisplayValue('budgetMin')) || 0).toLocaleString()} – CHF {(Number(getDisplayValue('budgetMax')) || 10000).toLocaleString()}
                          </label>
                          <Slider
                            value={[Number(getDisplayValue('budgetMin')) || 0, Number(getDisplayValue('budgetMax')) || 10000]}
                            onValueChange={([min, max]) => {
                              updateEditData('budgetMin', min);
                              updateEditData('budgetMax', max);
                            }}
                            min={0}
                            max={100000}
                            step={500}
                            className="mb-2"
                          />
                          <div className="flex justify-between text-[#717182]" style={{ fontSize: '12px' }}>
                            <span>CHF 0</span>
                            <span>CHF 100,000+</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Availability lead time
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {leadTimeOptions.map((time) => (
                        <button
                          key={time}
                          onClick={() => updateEditData('leadTime', time)}
                          className={`px-4 py-3 rounded-lg border transition-colors ${
                            getDisplayValue('leadTime') === time
                              ? 'bg-[#0B3B2E] text-white border-[#0B3B2E]'
                              : 'bg-white text-black border-[#e9ebef] hover:border-[#0B3B2E]'
                          }`}
                          style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
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
                    {profileData.diversityGoals && profileData.diversityTargets && (
                      <p className="text-sm text-[#717182] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {profileData.diversityTargets}
                      </p>
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
