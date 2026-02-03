import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  fetchOrganizationProfile,
  saveOrganizationProfile,
  OrganizationProfilePayload,
  AvailabilityPeriod,
} from './api';

const SPEAKING_FORMAT_OPTIONS = [
  'Keynote',
  'Panel',
  'Workshop',
  'Breakout Session',
  'Fireside Chat',
  'Q&A',
];

const EVENT_TYPE_OPTIONS = [
  'Conference',
  'Summit',
  'Webinar',
  'Workshop',
  'Corporate Event',
  'Community Event',
];

const YEARS_OPTIONS = [
  { value: '0-1', label: '0-1 years' },
  { value: '1-3', label: '1-3 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '5-10', label: '5-10 years' },
  { value: '10+', label: '10+ years' },
];

export default function CompleteOrganizationProfile() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OrganizationProfilePayload>({
    fullName: '',
    professionalHeadline: '',
    topics: [],
    speakingFormats: [],
    yearsOfExperience: undefined,
    pastEngagements: null,
    notableClients: '',
    videoIntro: null,
    geographicReach: '',
    preferredEventTypes: [],
    availabilityPeriods: [],
    profilePhoto: null,
    videoIntroFile: null,
  });

  const [topicInput, setTopicInput] = useState('');
  const [customFormatInput, setCustomFormatInput] = useState('');
  const [customEventTypeInput, setCustomEventTypeInput] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await fetchOrganizationProfile();
      if (profile) {
        setFormData({
          fullName: profile.full_name || '',
          professionalHeadline: profile.professional_headline || '',
          topics: profile.topics || [],
          speakingFormats: profile.speaking_formats || [],
          yearsOfExperience: profile.years_of_experience as any,
          pastEngagements: profile.past_engagements || null,
          notableClients: profile.notable_clients || '',
          videoIntro: profile.video_intro || null,
          geographicReach: profile.geographic_reach || '',
          preferredEventTypes: profile.preferred_event_types || [],
          availabilityPeriods: profile.availability_periods || [],
          profilePhoto: profile.profile_photo || null,
          videoIntroFile: null,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    setLoading(true);
    try {
      await saveOrganizationProfile(formData);
      toast.success('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const addTopic = () => {
    if (topicInput.trim() && !formData.topics?.includes(topicInput.trim())) {
      setFormData({
        ...formData,
        topics: [...(formData.topics || []), topicInput.trim()],
      });
      setTopicInput('');
    }
  };

  const removeTopic = (topic: string) => {
    setFormData({
      ...formData,
      topics: formData.topics?.filter((t) => t !== topic),
    });
  };

  const toggleSpeakingFormat = (format: string) => {
    const formats = formData.speakingFormats || [];
    if (formats.includes(format)) {
      setFormData({
        ...formData,
        speakingFormats: formats.filter((f) => f !== format),
      });
    } else {
      setFormData({
        ...formData,
        speakingFormats: [...formats, format],
      });
    }
  };

  const addCustomFormat = () => {
    if (
      customFormatInput.trim() &&
      !formData.speakingFormats?.includes(customFormatInput.trim())
    ) {
      setFormData({
        ...formData,
        speakingFormats: [...(formData.speakingFormats || []), customFormatInput.trim()],
      });
      setCustomFormatInput('');
    }
  };

  const toggleEventType = (eventType: string) => {
    const types = formData.preferredEventTypes || [];
    if (types.includes(eventType)) {
      setFormData({
        ...formData,
        preferredEventTypes: types.filter((t) => t !== eventType),
      });
    } else {
      setFormData({
        ...formData,
        preferredEventTypes: [...types, eventType],
      });
    }
  };

  const addCustomEventType = () => {
    if (
      customEventTypeInput.trim() &&
      !formData.preferredEventTypes?.includes(customEventTypeInput.trim())
    ) {
      setFormData({
        ...formData,
        preferredEventTypes: [
          ...(formData.preferredEventTypes || []),
          customEventTypeInput.trim(),
        ],
      });
      setCustomEventTypeInput('');
    }
  };

  const addAvailabilityPeriod = () => {
    setFormData({
      ...formData,
      availabilityPeriods: [
        ...(formData.availabilityPeriods || []),
        {
          from: '',
          to: '',
          timezone: 'Europe/Kiev',
          note: '',
        },
      ],
    });
  };

  const updateAvailabilityPeriod = (
    index: number,
    field: keyof AvailabilityPeriod,
    value: string
  ) => {
    const periods = [...(formData.availabilityPeriods || [])];
    periods[index] = { ...periods[index], [field]: value };
    setFormData({ ...formData, availabilityPeriods: periods });
  };

  const removeAvailabilityPeriod = (index: number) => {
    setFormData({
      ...formData,
      availabilityPeriods: formData.availabilityPeriods?.filter((_, i) => i !== index),
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'photo') {
        setFormData({ ...formData, profilePhoto: file });
      } else {
        setFormData({ ...formData, videoIntroFile: file });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6">Complete Your Organization Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Professional Headline</label>
            <input
              type="text"
              value={formData.professionalHeadline}
              onChange={(e) =>
                setFormData({ ...formData, professionalHeadline: e.target.value })
              }
              placeholder="e.g., Event Organizer at TechConf"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'photo')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {typeof formData.profilePhoto === 'string' && formData.profilePhoto && (
              <p className="text-sm text-gray-500 mt-1">Current photo uploaded</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Topics of Interest</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                placeholder="Add topic"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addTopic}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.topics?.map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {topic}
                  <button
                    type="button"
                    onClick={() => removeTopic(topic)}
                    className="hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Speaking Formats</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {SPEAKING_FORMAT_OPTIONS.map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => toggleSpeakingFormat(format)}
                  className={`px-4 py-2 rounded-md border ${
                    formData.speakingFormats?.includes(format)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customFormatInput}
                onChange={(e) => setCustomFormatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFormat())}
                placeholder="Add custom format"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addCustomFormat}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Add Custom
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Years of Speaking Experience</label>
            <select
              value={formData.yearsOfExperience || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  yearsOfExperience: e.target.value as any,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select experience</option>
              {YEARS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Past Engagements</label>
            <input
              type="number"
              value={formData.pastEngagements || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pastEngagements: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              placeholder="Number of past engagements"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notable Clients/Events</label>
            <textarea
              value={formData.notableClients || ''}
              onChange={(e) => setFormData({ ...formData, notableClients: e.target.value })}
              placeholder="List notable clients or events you've organized"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Video Introduction</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleFileChange(e, 'video')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {formData.videoIntro && (
              <p className="text-sm text-gray-500 mt-1">Current video uploaded</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Geographic Reach</label>
            <input
              type="text"
              value={formData.geographicReach}
              onChange={(e) => setFormData({ ...formData, geographicReach: e.target.value })}
              placeholder="e.g., North America, Europe, Global"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Preferred Event Types</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {EVENT_TYPE_OPTIONS.map((eventType) => (
                <button
                  key={eventType}
                  type="button"
                  onClick={() => toggleEventType(eventType)}
                  className={`px-4 py-2 rounded-md border ${
                    formData.preferredEventTypes?.includes(eventType)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {eventType}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customEventTypeInput}
                onChange={(e) => setCustomEventTypeInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), addCustomEventType())
                }
                placeholder="Add custom event type"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addCustomEventType}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Add Custom
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Availability Periods</label>
              <button
                type="button"
                onClick={addAvailabilityPeriod}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
              >
                + Add Period
              </button>
            </div>
            <div className="space-y-3">
              {formData.availabilityPeriods?.map((period, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-md">
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">From</label>
                      <input
                        type="date"
                        value={period.from}
                        onChange={(e) => updateAvailabilityPeriod(index, 'from', e.target.value)}
                        className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">To</label>
                      <input
                        type="date"
                        value={period.to}
                        onChange={(e) => updateAvailabilityPeriod(index, 'to', e.target.value)}
                        className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="block text-xs font-medium mb-1">Timezone</label>
                    <input
                      type="text"
                      value={period.timezone}
                      onChange={(e) =>
                        updateAvailabilityPeriod(index, 'timezone', e.target.value)
                      }
                      className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-xs font-medium mb-1">Note (optional)</label>
                    <input
                      type="text"
                      value={period.note || ''}
                      onChange={(e) => updateAvailabilityPeriod(index, 'note', e.target.value)}
                      placeholder="Any additional notes"
                      className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAvailabilityPeriod(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove Period
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
