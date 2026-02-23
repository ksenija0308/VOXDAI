import { useNavigate } from 'react-router-dom';

export default function TermsOfServiceScreen() {
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
          VOXD AI – Terms and Conditions
        </h1>

        <div className="space-y-8 text-[#333] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
          <section>
            <h2 className="text-lg font-semibold text-[#0B3B2E] mb-2">1. Eligibility</h2>
            <p>
              The platform is available only to users aged 18 years or older.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B3B2E] mb-2">2. Platform Role</h2>
            <p>
              VOXD AI operates as a matchmaking and booking facilitation platform only. It is not a party to any agreements between speakers and organisers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B3B2E] mb-2">3. AI-Based Matching and Transparency</h2>
            <p>
              VOXD AI uses fully automated artificial intelligence systems, including embeddings and algorithmic matching, to recommend potential matches. No human review is involved. Matches have no legal or contractual effect, and no outcome is guaranteed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B3B2E] mb-2">4. No Guarantee of Matches or Engagements</h2>
            <p>
              VOXD AI does not guarantee that a suitable match, engagement, or booking will occur.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B3B2E] mb-2">5. Content Licence</h2>
            <p>
              Users grant VOXD AI a non-exclusive licence to display and process submitted content. Use for marketing requires explicit user approval.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B3B2E] mb-2">6. Payments</h2>
            <p>
              Future payments may be processed via Stripe Connect. VOXD AI acts as a platform only.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B3B2E] mb-2">7. Liability</h2>
            <p>
              VOXD AI disclaims liability to the maximum extent permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B3B2E] mb-2">8. Governing Law & Arbitration</h2>
            <p>
              Swiss law applies. Disputes are resolved by arbitration in Switzerland.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
