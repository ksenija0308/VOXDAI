import { useState, useEffect } from 'react';
import { COOKIE_CONSENT_KEY, setConsent } from '../../cookies/consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    setConsent(true, true);
    setVisible(false);
  };

  const handleRejectNonEssential = () => {
    setConsent(false, false);
    setVisible(false);
  };
  if (!visible) return null;

  return (
      <div className="fixed bottom-0 right-0 min-[600px]:bottom-[10px] min-[600px]:right-[10px] bg-white max-w-[600px] w-auto rounded-[8px] text-[12px] shadow-[0px_7px_29px_rgba(100,100,111,0.2)] z-[9999]">
        <div
            className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6"
            style={{fontFamily: 'Inter, sans-serif'}}
        >
          <h3 className="text-base sm:text-lg font-semibold text-[#0B3B2E] mb-2">
          Cookies & Privacy Settings
        </h3>

        <p className="text-[12px] text-[#717182] leading-relaxed mb-1">
          We use cookies and similar technologies to operate and secure the VOXD AI platform, analyse usage, and improve our services.
        </p>

        <p className="text-[12px] text-[#717182] leading-relaxed mb-1">
          You can accept all cookies, reject non-essential cookies, or manage your preferences at any time.
        </p>

        <p className="text-[12px] text-[#717182] leading-relaxed mb-5">
          For more information, please see our{' '}
          <a href="/cookie-settings" className="text-[#0B3B2E] underline hover:opacity-80 transition-opacity">
            Cookie Policy
          </a>
          {' '}and{' '}
          <a href="/privacy-policy" className="text-[#0B3B2E] underline hover:opacity-80 transition-opacity">
            Privacy Policy
          </a>
          .
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAcceptAll}
            className="px-6 py-2.5 bg-[#0B3B2E] text-white text-sm font-medium rounded-lg hover:bg-[#0B3B2E]/90 transition-colors cursor-pointer"
          >
            Accept all
          </button>
          <button
            onClick={handleRejectNonEssential}
            className="px-6 py-2.5 bg-white text-[#0B3B2E] text-sm font-medium rounded-lg border border-[#0B3B2E] hover:bg-[#0B3B2E]/5 transition-colors cursor-pointer"
          >
            Reject non-essential
          </button>
        </div>
      </div>
    </div>
  );
}
