import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicyScreen() {
  const navigate = useNavigate();

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
          VOXD AI – Privacy Policy
        </h1>

        <div className="space-y-8 text-[#333] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
          <section>
            <h2 className="text-lg font-semibold text-[#0B3B2E] mb-2">1. Controller</h2>
            <p>
              Ksenija Korolova, Dufourstrasse 46, 8702 Zollikon, Switzerland
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B3B2E] mb-2">2. Data Collected</h2>
            <p>
              Profile data, optional video, usage data, communications.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B3B2E] mb-2">3. AI Processing</h2>
            <p>
              Data is processed using OpenAI APIs to generate embeddings for matchmaking.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B3B2E] mb-2">4. Data Sharing</h2>
            <p>
              Processors include Supabase and OpenAI.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B3B2E] mb-2">5. Rights</h2>
            <p>
              Users may access, delete, or correct their data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B3B2E] mb-2">6. International Transfers</h2>
            <p>
              Safeguards are applied for cross-border transfers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B3B2E] mb-2">7. Retention</h2>
            <p>
              Data is retained until account deletion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B3B2E] mb-2">8. Contact</h2>
            <p>
              <a
                href="mailto:privacy@voxdai.com"
                className="text-[#0B3B2E] underline hover:opacity-80 transition-opacity"
              >
                privacy@voxdai.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
