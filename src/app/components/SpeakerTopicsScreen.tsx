import { useState } from 'react';
import { Plus } from 'lucide-react';
import { FormData } from '../App';
import FormLayout from './FormLayout';

interface SpeakerTopicsScreenProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  nextScreen: () => void;
  prevScreen: () => void;
  goToScreen: (screen: number) => void;
  progress: number;
}

const suggestedTopics = [
  'Artificial Intelligence',
  'Machine Learning',
  'Digital Transformation',
  'Leadership',
  'Entrepreneurship',
  'Marketing',
  'Sales',
  'Innovation',
  'Technology',
  'Sustainability',
  'Healthcare',
  'Finance',
  'Education',
  'Customer Experience',
  'Diversity & Inclusion',
];

export default function SpeakerTopicsScreen({
  formData,
  updateFormData,
  nextScreen,
  prevScreen,
  goToScreen,
  progress,
}: SpeakerTopicsScreenProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [customTopic, setCustomTopic] = useState('');

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    const totalTopics = formData.topics.length + formData.customTopics.length;
    if (totalTopics === 0) {
      newErrors.topics = 'Please select or add at least one topic to continue.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      nextScreen();
    }
  };

  const toggleTopic = (topic: string) => {
    const newTopics = formData.topics.includes(topic)
      ? formData.topics.filter((t) => t !== topic)
      : [...formData.topics, topic];
    updateFormData({ topics: newTopics });
    // Clear error when user makes a selection
    if (errors.topics) {
      setErrors({});
    }
  };

  const handleAddCustomTopic = () => {
    if (customTopic.trim() && !formData.customTopics.includes(customTopic.trim())) {
      updateFormData({ customTopics: [...formData.customTopics, customTopic.trim()] });
      setCustomTopic('');
      // Clear error when user adds a topic
      if (errors.topics) {
        setErrors({});
      }
    }
  };

  const handleRemoveCustomTopic = (topic: string) => {
    updateFormData({ customTopics: formData.customTopics.filter((t) => t !== topic) });
  };

  return (
    <FormLayout
      currentStep={3}
      totalSteps={8}
      onPrev={prevScreen}
      onNext={handleContinue}
      onSaveExit={() => goToScreen(0)}
      progress={progress}
      title="Topics & Expertise"
      subtitle="Select the topics you speak about. This helps event organizers find you for relevant events. The more precise, niche topics you would add, the easier it would be to match you with the right opportunities."
    >
      <div>
        {/* Add Custom Topic */}
        <div className="mb-6">
          <label className="block mb-2">Add Custom Topic</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomTopic();
                }
              }}
              className="flex-1 px-4 py-3 border border-[#d1d5dc] rounded-lg focus:outline-none focus:border-[#0B3B2E]"
              placeholder="Enter a custom topic"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
            />
            <button
              onClick={handleAddCustomTopic}
              disabled={!customTopic.trim()}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors ${
                customTopic.trim()
                  ? 'bg-[#0B3B2E] text-white hover:bg-[#0a3328]'
                  : 'bg-[#d1d5dc] text-[#6a7282] cursor-not-allowed'
              }`}
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '500' }}
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        {/* Custom Topics Display */}
        {formData.customTopics.length > 0 && (
          <div className="mb-6">
            <label className="block mb-3">Your Custom Topics</label>
            <div className="flex flex-wrap gap-2">
              {formData.customTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleRemoveCustomTopic(topic)}
                  className="px-4 py-2 rounded-full bg-[#0B3B2E] text-white border border-[#0B3B2E] hover:bg-[#0a3328] transition-colors flex items-center gap-2"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '500' }}
                >
                  {topic}
                  <span className="text-xs">✕</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Topics */}
        <div className="mb-6">
          <label className="block mb-3">Suggested Topics</label>
          <div className="flex flex-wrap gap-2">
            {suggestedTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={`px-4 py-2 rounded-full border transition-colors ${
                  formData.topics.includes(topic)
                    ? 'bg-[#0B3B2E] text-white border-[#0B3B2E]'
                    : 'bg-white text-black border-[#d1d5dc] hover:border-[#0B3B2E]'
                }`}
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '500' }}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {errors.topics && (
          <div className="bg-[#fffbeb] border border-[#fee685] rounded-lg p-4 mb-6">
            <p className="text-[#973c00]" style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>
              {errors.topics}
            </p>
          </div>
        )}
      </div>
    </FormLayout>
  );
}