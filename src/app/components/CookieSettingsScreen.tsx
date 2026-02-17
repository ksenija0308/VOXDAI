import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEffectiveConsent, setConsent } from '../../cookies/consent';

export default function CookieSettingsScreen() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const effective = getEffectiveConsent();
    setAnalytics(effective.analytics);
    setMarketing(effective.marketing);
  }, []);

  const handleSave = () => {
    setConsent(analytics, marketing);
    navigate(-1);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 text-sm text-[#717182] hover:text-[#0B3B2E] transition-colors cursor-pointer"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          &larr; Back
        </button>

        <h1
          className="text-3xl sm:text-4xl font-bold text-[#0B3B2E] mb-10"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Cookie Settings
        </h1>

        <div className="space-y-8" style={{ fontFamily: 'Inter, sans-serif' }}>
          {/* Strictly Necessary */}
          <div className="border border-[#e5e5e5] rounded-lg p-5 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-[#0B3B2E]">Strictly Necessary Cookies</h2>
              <span className="text-xs font-medium text-[#0B3B2E] bg-[#0B3B2E]/10 px-3 py-1 rounded-full">
                Always active
              </span>
            </div>
            <p className="text-sm text-[#717182] leading-relaxed">
              These cookies are required for the platform to function securely (e.g. login, session management, fraud prevention).
            </p>
          </div>

          {/* Analytics */}
          <div className="border border-[#e5e5e5] rounded-lg p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-[#0B3B2E] mb-2">Analytics Cookies</h2>
            <p className="text-sm text-[#717182] leading-relaxed mb-4">
              Help us understand how the platform is used (e.g. Google Analytics).
            </p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="w-4 h-4 accent-[#0B3B2E] cursor-pointer"
              />
              <span className="text-sm text-[#333]">Enable analytics cookies</span>
            </label>
          </div>

          {/* Marketing */}
          <div className="border border-[#e5e5e5] rounded-lg p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-[#0B3B2E] mb-2">Marketing Cookies</h2>
            <p className="text-sm text-[#717182] leading-relaxed mb-4">
              Used to measure marketing performance and show relevant content (e.g. LinkedIn Pixel).
            </p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="w-4 h-4 accent-[#0B3B2E] cursor-pointer"
              />
              <span className="text-sm text-[#333]">Enable marketing cookies</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-[#0B3B2E] text-white text-sm font-medium rounded-lg hover:bg-[#0B3B2E]/90 transition-colors cursor-pointer"
            >
              Save preferences
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 bg-white text-[#0B3B2E] text-sm font-medium rounded-lg border border-[#0B3B2E] hover:bg-[#0B3B2E]/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
