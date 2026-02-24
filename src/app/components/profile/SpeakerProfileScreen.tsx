import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Pencil, Save, X, User, Briefcase, Calendar, Upload, Video, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { FormData } from '@/types/formData';
import { speakerAPI, authAPI, fileAPI } from '@/api';
import { useVideoPlaybackUrl } from '@/hooks/useVideoPlaybackUrl';
import { useLogoContext } from '@/context/LogoContext';
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

const languageOptions = [
  'English', 'Spanish', 'French', 'German', 'Mandarin',
  'Portuguese', 'Japanese', 'Korean', 'Arabic', 'Hindi',
];

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
  speakerLanguages: profile.speaker_languages ?? [],
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
  const { logoUrl, refreshLogo } = useLogoContext();
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { playbackUrl: videoPlaybackUrl, isLoading: isVideoLoading } = useVideoPlaybackUrl(profileData.videoIntroUrl);

  // Video recording state
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [isVideoPreviewing, setIsVideoPreviewing] = useState(false);
  const [videoRecordingTime, setVideoRecordingTime] = useState(0);
  const [videoRecordedBlob, setVideoRecordedBlob] = useState<Blob | null>(null);
  const [videoCameraError, setVideoCameraError] = useState('');
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [videoUploadSuccess, setVideoUploadSuccess] = useState(false);
  const [videoUploadError, setVideoUploadError] = useState('');
  const [newVideoPlaybackUrl, setNewVideoPlaybackUrl] = useState('');
  const recordVideoRef = useRef<HTMLVideoElement>(null);
  const videoMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordedVideoUrlRef = useRef<string | null>(null);

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
    setErrors({});
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditData({});
    setErrors({});
    setPhotoPreview(null);
    setPhotoRemoved(false);
    setCustomTopicInput('');
    setShowAddPeriod(false);
    resetVideoRecordingState();
  };

  const validateSection = (section: string, merged: FormData): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    if (section === 'basics') {
      if (!String(merged.full_name || '').trim()) newErrors.full_name = 'Full name is required';
      if (!String(merged.professionalTitle || '').trim()) newErrors.professionalTitle = 'Professional title is required';
      if (!String(merged.bio || '').trim()) newErrors.bio = 'Biography is required';
      if (!String(merged.speakerLocation || '').trim()) newErrors.speakerLocation = 'Country is required';
      if (!String(merged.speakerCity || '').trim()) newErrors.speakerCity = 'City is required';
      if (!merged.speakerLanguages || merged.speakerLanguages.length === 0) newErrors.speakerLanguages = 'Select at least one language';
    }
    if (section === 'topics') {
      if (!merged.topics || merged.topics.length === 0) newErrors.topics = 'Select at least one topic';
    }
    if (section === 'experience') {
      if (!merged.speakingFormats || merged.speakingFormats.length === 0) newErrors.speakingFormats = 'Select at least one speaking format';
    }
    if (section === 'availability') {
      if (!String(merged.geographicReach || '').trim()) newErrors.geographicReach = 'Geographic reach is required';
      if (!merged.preferredEventTypes || merged.preferredEventTypes.length === 0) newErrors.preferredEventTypes = 'Select at least one event type';
      if (!merged.availabilityPeriods || merged.availabilityPeriods.length === 0) newErrors.availabilityPeriods = 'Add at least one availability period';
    }
    return newErrors;
  };

  const handleSave = async () => {
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
        // Refresh the global logo/photo context if photo was changed
        if ('profilePhoto' in editData) {
          if (editData.profilePhoto === null) {
            setPhotoUrl(null);
          }
          refreshLogo('speaker');
        }
        setEditingSection(null);
        setEditData({});
        setPhotoPreview(null);
        setPhotoRemoved(false);
        setCustomTopicInput('');
        setShowAddPeriod(false);
        resetVideoRecordingState();
      } else {
        toast.error('Failed to save profile');
      }
    } catch (error: any) {
      toast.error(`Failed to save: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Video recording handlers
  const stopVideoCamera = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(track => track.stop());
      videoStreamRef.current = null;
    }
  };

  const resetVideoRecordingState = () => {
    stopVideoCamera();
    if (videoTimerRef.current) clearInterval(videoTimerRef.current);
    if (recordedVideoUrlRef.current) URL.revokeObjectURL(recordedVideoUrlRef.current);
    setIsVideoRecording(false);
    setIsVideoPreviewing(false);
    setVideoRecordingTime(0);
    setVideoRecordedBlob(null);
    setVideoCameraError('');
    setIsVideoUploading(false);
    setVideoUploadSuccess(false);
    setVideoUploadError('');
    setNewVideoPlaybackUrl('');
  };

  const handleStartVideoRecording = async () => {
    try {
      setVideoCameraError('');

      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        setVideoCameraError('Camera access requires HTTPS.');
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setVideoCameraError('Your browser doesn\'t support camera recording.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true,
      });

      videoStreamRef.current = stream;
      setIsVideoRecording(true);
      setVideoRecordingTime(0);

      // Wait for React to render the video element
      await new Promise(resolve => setTimeout(resolve, 0));

      if (recordVideoRef.current) {
        recordVideoRef.current.srcObject = stream;
        recordVideoRef.current.muted = true;
        await recordVideoRef.current.play();
      }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
        ? 'video/webm;codecs=vp8,opus'
        : 'video/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      videoMediaRecorderRef.current = mediaRecorder;
      videoChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) videoChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: mimeType });
        setVideoRecordedBlob(blob);
        setIsVideoPreviewing(true);

        if (recordVideoRef.current) {
          recordVideoRef.current.srcObject = null;
          if (recordedVideoUrlRef.current) URL.revokeObjectURL(recordedVideoUrlRef.current);
          const url = URL.createObjectURL(blob);
          recordedVideoUrlRef.current = url;
          recordVideoRef.current.src = url;
          recordVideoRef.current.muted = false;
          recordVideoRef.current.controls = true;
        }

        stopVideoCamera();
        uploadRecordedVideo(blob);
      };

      mediaRecorder.start(1000);

      videoTimerRef.current = setInterval(() => {
        setVideoRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        setVideoCameraError('Camera permission was denied. Please allow access and try again.');
      } else if (error instanceof Error && error.name === 'NotFoundError') {
        setVideoCameraError('No camera detected. Please connect a camera and try again.');
      } else {
        setVideoCameraError('Unable to access camera.');
      }
    }
  };

  const handleStopVideoRecording = () => {
    if (videoMediaRecorderRef.current && isVideoRecording) {
      videoMediaRecorderRef.current.stop();
      setIsVideoRecording(false);
      if (videoTimerRef.current) {
        clearInterval(videoTimerRef.current);
        videoTimerRef.current = null;
      }
    }
  };

  const uploadRecordedVideo = async (blob: Blob) => {
    setIsVideoUploading(true);
    setVideoUploadError('');
    setVideoUploadSuccess(false);

    try {
      const accessToken = await authAPI.getAccessToken();
      if (!accessToken) throw new Error('Not authenticated');

      const res = await fetch('https://api.voxdai.com/functions/v1/generate-upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          folder: 'intro',
          fileName: `${Date.now()}.webm`,
          contentType: 'video/webm',
        }),
      });

      if (!res.ok) throw new Error('Failed to generate upload URL');

      const { signedUrl, key } = await res.json();
      if (!signedUrl) throw new Error('No upload URL returned');

      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'video/webm' },
        body: blob,
      });

      if (!uploadRes.ok) throw new Error('Failed to upload video');

      updateEditData('videoIntroUrl', key);
      setVideoUploadSuccess(true);

      // Fetch playback URL for the newly uploaded video
      const playRes = await fetch('https://api.voxdai.com/functions/v1/generate-play-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ key }),
      });

      if (playRes.ok) {
        const playData = await playRes.json();
        if (playData.signedUrl) {
          setNewVideoPlaybackUrl(playData.signedUrl);
        }
      }
    } catch (error) {
      console.error('Video upload error:', error);
      setVideoUploadError(error instanceof Error ? error.message : 'Failed to upload video');
    } finally {
      setIsVideoUploading(false);
    }
  };

  const formatVideoTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    if (errors.availabilityPeriods) setErrors(prev => ({ ...prev, availabilityPeriods: '' }));
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

  const renderSingleSelect = (field: keyof FormData, options: string[]) => {
    const current = getDisplayValue(field);
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => { updateEditData(field, option); if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' })); }}
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
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : photoUrl ? (
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
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Full Name <span className="text-[#d4183d]">*</span></label>
                    <Input
                      value={String(getDisplayValue('full_name') || '')}
                      onChange={(e) => { updateEditData('full_name', e.target.value); setErrors(prev => ({ ...prev, full_name: '' })); }}
                      placeholder="e.g., Alex Carter"
                      className={`text-sm ${errors.full_name ? 'border-[#d4183d]' : ''}`}
                    />
                    {errors.full_name && <p className="text-[#d4183d] text-xs mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{errors.full_name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Professional Title <span className="text-[#d4183d]">*</span></label>
                    <Input
                      value={String(getDisplayValue('professionalTitle') || '')}
                      onChange={(e) => { updateEditData('professionalTitle', e.target.value); setErrors(prev => ({ ...prev, professionalTitle: '' })); }}
                      placeholder="e.g., Growth and Motivation Strategist"
                      className={`text-sm ${errors.professionalTitle ? 'border-[#d4183d]' : ''}`}
                    />
                    {errors.professionalTitle && <p className="text-[#d4183d] text-xs mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{errors.professionalTitle}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Biography <span className="text-[#d4183d]">*</span></label>
                    <textarea
                      value={String(getDisplayValue('bio') || '')}
                      onChange={(e) => { updateEditData('bio', e.target.value); setErrors(prev => ({ ...prev, bio: '' })); }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#0B3B2E] text-sm resize-none ${errors.bio ? 'border-[#d4183d]' : 'border-[#e9ebef]'}`}
                      rows={6}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    {errors.bio && <p className="text-[#d4183d] text-xs mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{errors.bio}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Country <span className="text-[#d4183d]">*</span></label>
                      <Input
                        value={String(getDisplayValue('speakerLocation') || '')}
                        onChange={(e) => { updateEditData('speakerLocation', e.target.value); setErrors(prev => ({ ...prev, speakerLocation: '' })); }}
                        placeholder="e.g., Germany"
                        className={`text-sm ${errors.speakerLocation ? 'border-[#d4183d]' : ''}`}
                      />
                      {errors.speakerLocation && <p className="text-[#d4183d] text-xs mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{errors.speakerLocation}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-[#717182] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>City <span className="text-[#d4183d]">*</span></label>
                      <Input
                        value={String(getDisplayValue('speakerCity') || '')}
                        onChange={(e) => { updateEditData('speakerCity', e.target.value); setErrors(prev => ({ ...prev, speakerCity: '' })); }}
                        placeholder="e.g., Berlin"
                        className={`text-sm ${errors.speakerCity ? 'border-[#d4183d]' : ''}`}
                      />
                      {errors.speakerCity && <p className="text-[#d4183d] text-xs mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{errors.speakerCity}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Languages <span className="text-[#d4183d]">*</span></label>
                    {renderToggleButtons('speakerLanguages', languageOptions)}
                    {errors.speakerLanguages && <p className="text-[#d4183d] text-xs mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>{errors.speakerLanguages}</p>}
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
                  {renderArrayField('Languages', 'speakerLanguages')}
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
                    <label className="block text-sm text-[#717182] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Suggested Topics <span className="text-[#d4183d]">*</span></label>
                    {renderToggleButtons('topics', topicOptions)}
                    {errors.topics && <p className="text-[#d4183d] text-xs mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>{errors.topics}</p>}
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
                    <label className="block text-sm text-[#717182] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Speaking Formats <span className="text-[#d4183d]">*</span></label>
                    {renderToggleButtons('speakingFormats', speakingFormatOptions)}
                    {errors.speakingFormats && <p className="text-[#d4183d] text-xs mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>{errors.speakingFormats}</p>}
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

                  <div className="border-t border-[#e9ebef] pt-4">
                    <label className="block text-sm text-[#717182] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>Or record a new video</label>

                    {videoCameraError && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                        <p className="text-red-600 text-sm">{videoCameraError}</p>
                        <button
                          onClick={handleStartVideoRecording}
                          className="text-red-600 text-sm font-medium hover:text-red-700 ml-3 whitespace-nowrap"
                        >
                          Try Again
                        </button>
                      </div>
                    )}

                    {!isVideoRecording && !isVideoPreviewing && (
                      <button
                        onClick={handleStartVideoRecording}
                        className="flex items-center gap-2 bg-[#0b3b2e] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#0b3b2e]/90 transition-all"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        <Video className="w-4 h-4" />
                        Start Recording
                      </button>
                    )}

                    {(isVideoRecording || isVideoPreviewing) && (
                      <div className="border border-[#e9ebef] rounded-lg overflow-hidden bg-black">
                        {newVideoPlaybackUrl && !isVideoRecording ? (
                          <video
                            controls
                            src={newVideoPlaybackUrl}
                            className="w-full aspect-video bg-black"
                          />
                        ) : (
                          <video
                            ref={recordVideoRef}
                            className="w-full aspect-video bg-black"
                            playsInline
                          />
                        )}
                      </div>
                    )}

                    {isVideoRecording && (
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-sm font-medium text-[#0b3b2e]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Recording: {formatVideoTime(videoRecordingTime)}
                          </span>
                        </div>
                        <button
                          onClick={handleStopVideoRecording}
                          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                            <rect x="4" y="4" width="8" height="8" rx="1" />
                          </svg>
                          Stop Recording
                        </button>
                      </div>
                    )}

                    {isVideoPreviewing && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isVideoUploading ? (
                              <>
                                <svg className="w-4 h-4 text-[#0b3b2e] animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <span className="text-sm text-[#0b3b2e]" style={{ fontFamily: 'Inter, sans-serif' }}>Uploading video...</span>
                              </>
                            ) : videoUploadSuccess ? (
                              <>
                                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24">
                                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="text-sm text-[#0b3b2e]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                  Video uploaded ({formatVideoTime(videoRecordingTime)})
                                </span>
                              </>
                            ) : (
                              <span className="text-sm text-[#0b3b2e]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                Video recorded ({formatVideoTime(videoRecordingTime)})
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              resetVideoRecordingState();
                              updateEditData('videoIntroUrl', profileData.videoIntroUrl);
                            }}
                            disabled={isVideoUploading}
                            className={`flex items-center gap-1.5 border border-[#d1d5dc] text-[#4a5565] px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              isVideoUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#0b3b2e] hover:text-[#0b3b2e]'
                            }`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16">
                              <path d="M2 8a6 6 0 0 1 10.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                              <path d="M12.5 1v3h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Retake
                          </button>
                        </div>

                        {videoUploadError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                            <p className="text-red-600 text-sm">{videoUploadError}</p>
                            <button
                              onClick={() => videoRecordedBlob && uploadRecordedVideo(videoRecordedBlob)}
                              className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-700 transition-all"
                            >
                              Retry
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {videoPlaybackUrl ? (
                    <video
                      controls
                      src={videoPlaybackUrl}
                      className="w-full rounded-lg aspect-video bg-black"
                    />
                  ) : isVideoLoading ? (
                    <div className="flex items-center justify-center aspect-video bg-[#f9fafb] rounded-lg border border-[#e5e7eb]">
                      <p className="text-sm text-[#717182]" style={{ fontFamily: 'Inter, sans-serif' }}>Loading video...</p>
                    </div>
                  ) : profileData.videoIntroUrl && !profileData.videoIntroUrl.startsWith('videos/') ? (
                    renderField('Video URL', 'videoIntroUrl')
                  ) : (
                    <p className="text-sm text-[#717182]" style={{ fontFamily: 'Inter, sans-serif' }}>No video introduction added yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* Section 5: Availability & Preferences */}
            <div className="bg-white border border-[#e9ebef] rounded-lg p-6">
              {renderSectionHeader('Availability & Preferences', 'availability', <MapPin className="w-5 h-5 text-white" />)}

              {isEditing('availability') ? (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm text-[#717182] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Geographic Reach <span className="text-[#d4183d]">*</span></label>
                    {renderSingleSelect('geographicReach', geographicOptions)}
                    {errors.geographicReach && <p className="text-[#d4183d] text-xs mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>{errors.geographicReach}</p>}
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
                    <label className="block text-sm text-[#717182] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Preferred Event Types <span className="text-[#d4183d]">*</span></label>
                    {renderToggleButtons('preferredEventTypes', preferredEventTypeOptions)}
                    {errors.preferredEventTypes && <p className="text-[#d4183d] text-xs mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>{errors.preferredEventTypes}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-[#717182] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Availability Periods <span className="text-[#d4183d]">*</span></label>
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
                    {errors.availabilityPeriods && <p className="text-[#d4183d] text-xs mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>{errors.availabilityPeriods}</p>}
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
