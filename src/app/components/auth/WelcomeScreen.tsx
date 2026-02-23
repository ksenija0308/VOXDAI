import { Button } from '../ui/button';
import { Users, Mic, Sparkles, Search, MessageCircle, Calendar, CircleCheck, Globe, TrendingUp, Shield, Zap, Star, ArrowRight, X, Mail } from 'lucide-react';
import { FormData } from "@/types/formData.ts";
import { useState, useEffect } from 'react';
import voxdLogo from '../../../assets/9f82f23acc7a74a7bee4d1a8435c26568326a05d.png';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface WelcomeScreenProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  nextScreen: () => void;
  onShowSignIn?: () => void;
}

export default function WelcomeScreen({ updateFormData, nextScreen, onShowSignIn }: WelcomeScreenProps) {
  const [currentEventType, setCurrentEventType] = useState(0);
  const eventTypes = ['conference', 'podcast', 'corporate event', 'meetup'];
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEventType((prev) => (prev + 1) % eventTypes.length);
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSelectUserType = (type: 'organizer' | 'speaker') => {
    updateFormData({ userType: type });
    nextScreen();
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3a218522/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(contactFormData)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Contact form error details:', data);
        const errorMsg = data.details?.message || data.error || 'Failed to send message';
        throw new Error(errorMsg);
      }

      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setShowContactForm(false);
      setContactFormData({
        firstName: '',
        lastName: '',
        email: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending contact form:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-[#e9ebef] z-50">
        <div className="mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={voxdLogo}
              alt="VOXD Logo"
              className="h-6 sm:h-8"
            />
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <a href="#features" className="hidden sm:inline text-[#717182] hover:text-[#0B3B2E] transition-colors" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>Features</a>
            <a href="#how-it-works" className="hidden sm:inline text-[#717182] hover:text-[#0B3B2E] transition-colors" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>How It Works</a>
            <Button
              variant="outline"
              className="border-[#0B3B2E] cursor-pointer text-[#0B3B2E] hover:bg-[#0B3B2E] hover:text-white text-sm sm:text-base px-3 sm:px-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
              onClick={() => onShowSignIn?.()}
            >
              Sign in
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 bg-gradient-to-br from-[#f9fafb] via-white to-[#f3f4f6]">
        <div className="max-w-7xl mx-auto">
          <div className="items-center">
            {/* Left: Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-[#0B3B2E]/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#0B3B2E]" />
                <span className="text-[#0B3B2E]" style={{ fontSize: '12px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>
                  AI-Powered Speaker Matching
                </span>
              </div>

              <h1
                className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl leading-tight"
                style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}
              >
                Find the best match for your{' '}
                <span
                  className="text-[#0B3B2E] inline-block transition-all duration-500"
                  style={{ minWidth: 'auto' }}
                  key={currentEventType}
                >
                  {eventTypes[currentEventType]}
                </span>
              </h1>

              <p
                className="text-[#717182] mb-6 sm:mb-8 text-base sm:text-lg max-w-xl"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.8' }}
              >
                The platform that makes finding and booking professional speakers effortless.
                Whether you're organizing a conference or building your speaking career, VOXD is your trusted partner.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
                <Button
                  onClick={() => handleSelectUserType('organizer')}
                  className="bg-[#0B3B2E] cursor-pointer text-white hover:bg-[#0B3B2E]/90 h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: '600' }}
                >
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  I'm an Event Organizer
                </Button>
                <Button
                  onClick={() => handleSelectUserType('speaker')}
                  variant="outline"
                  className="border-2 cursor-pointer border-[#0B3B2E] text-[#0B3B2E] hover:bg-[#0B3B2E] hover:text-white h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: '600' }}
                >
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  I'm a Speaker
                </Button>
              </div>
            </div>

            {/* Right: Visual - Hidden on mobile */}
            <div className="relative hidden lg:block mt-8 lg:mt-0">
              <div className="relative bg-gradient-to-br from-[#0B3B2E] to-[#164d3c] rounded-3xl p-8 shadow-2xl">
                {/* Mock interface preview */}
                <div className="bg-white rounded-2xl p-6 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#0B3B2E]/10 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-[#0B3B2E]/20 rounded w-32 mb-2"></div>
                      <div className="h-2 bg-[#0B3B2E]/10 rounded w-24"></div>
                    </div>
                    <div className="px-4 py-2 bg-[#0B3B2E] text-white rounded-lg text-xs">
                      98% Match
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-[#0B3B2E]/10 rounded"></div>
                    <div className="h-2 bg-[#0B3B2E]/10 rounded w-5/6"></div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#0B3B2E]/10 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-[#0B3B2E]/20 rounded w-32 mb-2"></div>
                      <div className="h-2 bg-[#0B3B2E]/10 rounded w-24"></div>
                    </div>
                    <div className="px-4 py-2 bg-[#0B3B2E] text-white rounded-lg text-xs">
                      96% Match
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-[#0B3B2E]/10 rounded"></div>
                    <div className="h-2 bg-[#0B3B2E]/10 rounded w-4/5"></div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl p-4 shadow-xl">
                  <Sparkles className="w-6 h-6 text-[#0B3B2E]" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-xl">
                  <CircleCheck className="w-6 h-6 text-[#0B3B2E]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4"
              style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}
            >
              Everything You Need in One Platform
            </h2>
            <p
              className="text-[#717182] text-base sm:text-lg max-w-2xl mx-auto px-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Powerful features designed to make speaker discovery and event management seamless
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Sparkles,
                title: 'AI Agent does the Matching',
                description: 'Our intelligent algorithm finds the perfect speakers based on your event requirements, audience, and budget.'
              },
              {
                icon: Search,
                title: 'Advanced Search',
                description: 'Filter by topic, experience, location, fee range, and availability to find exactly what you need.'
              },
              {
                icon: MessageCircle,
                title: 'Built-in Messaging',
                description: 'Communicate directly with speakers and organizers. Keep all conversations in one place.'
              },
              {
                icon: Calendar,
                title: 'Smart Scheduling',
                description: 'Check real-time availability and book speakers instantly with integrated calendar tools.'
              },
              {
                icon: Shield,
                title: 'Verified Profiles',
                description: 'All speakers are verified with video introductions, past client reviews, and credentials.'
              },
              {
                icon: Globe,
                title: 'Global Reach',
                description: 'Access speakers from around the world or find local talent. Filter by language and location.'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 sm:p-8 border-2 border-[#e9ebef] rounded-2xl hover:border-[#0B3B2E] hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#0B3B2E] rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3
                  className="mb-2 sm:mb-3 text-lg sm:text-xl"
                  style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-[#717182]"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '1.7' }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-[#f9fafb] to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4"
              style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}
            >
              How It Works
            </h2>
            <p
              className="text-[#717182] text-base sm:text-lg max-w-2xl mx-auto px-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Get started in minutes and find your perfect match
            </p>
          </div>

          {/* Organizers Flow */}
          <div className="mb-12 sm:mb-20">
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-[#0B3B2E]" />
              <h3
                className="text-2xl sm:text-3xl"
                style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}
              >
                For Event Organizers
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { step: '1', title: 'Create Your Profile', desc: 'Tell us about your organization and event types' },
                { step: '2', title: 'Describe Your Event', desc: 'Share event details, audience, and budget' },
                { step: '3', title: 'Get AI Matches', desc: 'Receive personalized speaker recommendations' },
                { step: '4', title: 'Book & Confirm', desc: 'Message speakers and finalize bookings' }
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="bg-white border-2 border-[#e9ebef] rounded-2xl p-5 sm:p-6 hover:border-[#0B3B2E] transition-all h-full">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0B3B2E] rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                      <span className="text-white font-bold text-lg sm:text-xl">{item.step}</span>
                    </div>
                    <h4
                      className="mb-2 text-base sm:text-lg"
                      style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}
                    >
                      {item.title}
                    </h4>
                    <p
                      className="text-[#717182]"
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px' }}
                    >
                      {item.desc}
                    </p>
                  </div>
                  {index < 3 && (
                    <ArrowRight className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-[#0B3B2E] w-6 h-6" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Speakers Flow */}
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <Mic className="w-6 h-6 sm:w-8 sm:h-8 text-[#0B3B2E]" />
              <h3
                className="text-2xl sm:text-3xl"
                style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}
              >
                For Speakers
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { step: '1', title: 'Build Your Profile', desc: 'Showcase your expertise, experience, and topics' },
                { step: '2', title: 'Set Preferences', desc: 'Define your availability, fees, and event types' },
                { step: '3', title: 'Get Discovered', desc: 'AI matches you with relevant opportunities' },
                { step: '4', title: 'Connect & Speak', desc: 'Engage with organizers and grow your career' }
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="bg-white border-2 border-[#e9ebef] rounded-2xl p-5 sm:p-6 hover:border-[#0B3B2E] transition-all h-full">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0B3B2E] rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                      <span className="text-white font-bold text-lg sm:text-xl">{item.step}</span>
                    </div>
                    <h4
                      className="mb-2 text-base sm:text-lg"
                      style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}
                    >
                      {item.title}
                    </h4>
                    <p
                      className="text-[#717182]"
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px' }}
                    >
                      {item.desc}
                    </p>
                  </div>
                  {index < 3 && (
                    <ArrowRight className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-[#0B3B2E] w-6 h-6" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 items-center">
            <div>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6"
                style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}
              >
                Why Choose VOXD?
              </h2>
              <p
                className="text-[#717182] text-base sm:text-lg mb-6 sm:mb-8"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.8' }}
              >
                We're not just another booking platform. VOXD uses cutting-edge AI to understand
                your unique needs and match you with the perfect speakers or events.
              </p>

              <div className="space-y-4 sm:space-y-6">
                {[
                  { icon: Zap, title: 'Save Time', desc: 'Find speakers in minutes, not weeks' },
                  { icon: Star, title: 'Quality Guaranteed', desc: 'All speakers verified with reviews and credentials' },
                  { icon: TrendingUp, title: 'Grow Your Network', desc: 'Build lasting relationships in the speaking industry' },
                  { icon: Shield, title: 'Secure & Transparent', desc: 'Protected payments and clear pricing' }
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0B3B2E]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#0B3B2E]" />
                    </div>
                    <div>
                      <h4
                        className="mb-1 text-base sm:text-lg"
                        style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}
                      >
                        {benefit.title}
                      </h4>
                      <p
                        className="text-[#717182]"
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                      >
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0B3B2E] to-[#164d3c] rounded-3xl p-6 sm:p-8 md:p-12 text-white mt-8 lg:mt-0">
              <h3
                className="text-2xl sm:text-3xl mb-5 sm:mb-6"
                style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}
              >
                Trusted by Leading Organizations
              </h3>
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-5 sm:p-6">
                  <p
                    className="mb-3 sm:mb-4 italic"
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '1.7' }}
                  >
                    "VOXD transformed how we find speakers. The AI matching saved us countless hours
                    and delivered speakers that perfectly aligned with our audience."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full"></div>
                    <div>
                      <div className="font-semibold text-sm sm:text-base">Sarah Chen</div>
                      <div className="text-white/80 text-xs sm:text-sm">Conference Director, TechSummit</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-5 sm:p-6">
                  <p
                    className="mb-3 sm:mb-4 italic"
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '1.7' }}
                  >
                    "As a speaker, VOXD has connected me with opportunities I never would have found.
                    The platform is intuitive and the organizers are always professional."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full"></div>
                    <div>
                      <div className="font-semibold text-sm sm:text-base">Dr. Michael Rodriguez</div>
                      <div className="text-white/80 text-xs sm:text-sm">Keynote Speaker, AI & Innovation</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-[#0B3B2E] to-[#164d3c]">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6"
            style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}
          >
            Ready to Get Started?
          </h2>
          <p
            className="text-base sm:text-lg md:text-xl mb-8 sm:mb-10 text-white/90 px-4"
            style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.8' }}
          >
            Join thousands of speakers and event organizers who trust VOXD to make
            meaningful connections. Create your free profile today.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-lg mx-auto">
            <Button
              onClick={() => handleSelectUserType('organizer')}
              className="bg-white cursor-pointer text-[#0B3B2E] hover:bg-white/90 h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: '600' }}
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Start as Organizer
            </Button>
            <Button
              onClick={() => handleSelectUserType('speaker')}
              variant="outline"
              className="border-2 cursor-pointer border-white text-white bg-white/10 hover:bg-white hover:text-[#0B3B2E] h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: '600' }}
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Start as Speaker
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0B3B2E] rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2
                      className="text-xl sm:text-2xl md:text-3xl"
                      style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}
                    >
                      Contact Us
                    </h2>
                    <p
                      className="text-[#717182]"
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px' }}
                    >
                      We'd love to hear from you
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-[#f3f4f6] flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-[#717182]" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleContactSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block mb-1.5 sm:mb-2 text-xs sm:text-sm"
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: '600' }}
                    >
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      required
                      value={contactFormData.firstName}
                      onChange={(e) => setContactFormData({ ...contactFormData, firstName: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-[#e9ebef] rounded-xl focus:border-[#0B3B2E] focus:outline-none transition-colors text-sm"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block mb-1.5 sm:mb-2 text-xs sm:text-sm"
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: '600' }}
                    >
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      required
                      value={contactFormData.lastName}
                      onChange={(e) => setContactFormData({ ...contactFormData, lastName: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-[#e9ebef] rounded-xl focus:border-[#0B3B2E] focus:outline-none transition-colors text-sm"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block mb-1.5 sm:mb-2 text-xs sm:text-sm"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: '600' }}
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={contactFormData.email}
                    onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-[#e9ebef] rounded-xl focus:border-[#0B3B2E] focus:outline-none transition-colors text-sm"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block mb-1.5 sm:mb-2 text-xs sm:text-sm"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: '600' }}
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={contactFormData.message}
                    onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-[#e9ebef] rounded-xl focus:border-[#0B3B2E] focus:outline-none transition-colors resize-none text-sm"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#0B3B2E] text-white hover:bg-[#0B3B2E]/90 h-11 sm:h-12 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: '600' }}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    variant="outline"
                    className="border-2 border-[#e9ebef] text-[#717182] hover:border-[#0B3B2E] hover:text-[#0B3B2E] h-11 sm:h-12 text-sm sm:text-base"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: '600' }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white text-black py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <img
                  src={voxdLogo}
                  alt="VOXD Logo"
                  className="h-6 sm:h-8"
                />
              </div>
              <p
                className="text-[#717182]"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px' }}
              >
                Connecting the world's best speakers with meaningful events.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base" style={{ fontFamily: 'Inter, sans-serif' }}>Product</h4>
              <ul className="space-y-2 text-[#717182]" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>
                <li><a href="#" className="hover:text-[#0B3B2E] transition-colors">Features</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base" style={{ fontFamily: 'Inter, sans-serif' }}>Company</h4>
              <ul className="space-y-2 text-[#717182]" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>
                <li><a href="#features" className="hover:text-[#0B3B2E] transition-colors">About Us</a></li>
                <li>
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="hover:text-[#0B3B2E] text-[13px] weight-400 transition-colors"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base" style={{ fontFamily: 'Inter, sans-serif' }}>Legal</h4>
              <ul className="space-y-2 text-[#717182]" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>
                <li><a href="/privacy-policy" className="hover:text-[#0B3B2E] transition-colors">Privacy Policy</a></li>
                <li><a href="/terms-of-service" className="hover:text-[#0B3B2E] transition-colors">Terms of Service</a></li>
                <li><a href="/cookie-settings" className="hover:text-[#0B3B2E] transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-black/10 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p
              className="text-[#717182] text-center md:text-left"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px' }}
            >
              © 2026 VOXD. All rights reserved.
            </p>
            <div className="flex gap-4 sm:gap-6">
              <a href="https://www.linkedin.com/company/voxd-ai/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="text-[#717182] hover:text-[#0B3B2E] transition-colors text-sm">LinkedIn</a>
              <a href="https://www.instagram.com/voxd.ai?igsh=MWR3b3RtcHFrNTB5Mg%3D%3D" target="_blank" rel="noopener noreferrer" className="text-[#717182] hover:text-[#0B3B2E] transition-colors text-sm">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
