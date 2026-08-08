import Link from 'next/link';
import { getAuthUser } from '@/lib/auth';
import { 
  Wrench, 
  CheckCircle, 
  Clock, 
  Users, 
  Building2, 
  FileText, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  MessageSquare, 
  MapPin, 
  TrendingUp, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default async function LandingPage() {
  const session = await getAuthUser();

  const targetSectors = [
    { name: 'Apartments & Condos', desc: 'Manage tenant repairs, leakages, and common area upkeep.' },
    { name: 'Offices & Co-working', desc: 'Keep IT networks, meeting rooms, and office equipment running smoothly.' },
    { name: 'Schools & Universities', desc: 'Track classroom lightings, safety, and campus repairs.' },
    { name: 'Hospitals & Clinics', desc: 'Ensure absolute compliance and resolve critical HVAC and medical area issues.' },
    { name: 'Hotels & Hospitality', desc: 'Keep guest rooms perfect, elevators running, and quick room turns.' },
    { name: 'Factories & Warehouses', desc: 'Monitor assembly lines, heavy equipment failures, and safety hazards.' }
  ];

  const features = [
    { title: 'Public Submission Portals', desc: 'Tenants and employees can file requests using a QR code or slug, without accessing full admin panel.', icon: Layers },
    { title: 'Automated SLA & Priority', desc: 'Set due dates automatically based on priority rules: Urgent (4h), High (24h), Medium (3d), Low (7d).', icon: Clock },
    { title: 'Technician Assignment', desc: 'Instantly route issues to internal technicians or external vendors with automatic email and system logs.', icon: Wrench },
    { title: 'Activity Audits & Comments', desc: 'Track every state transition from OPEN to RESOLVED. Comment in real-time to solve issues together.', icon: MessageSquare },
    { title: 'Visual Analytics & Reports', desc: 'View monthly counts, SLA compliance lists, problematic buildings, and technician workloads.', icon: TrendingUp },
    { title: 'Role-Based Access (RBAC)', desc: 'Preconfigured dashboard access for Super Admins, Org Admins, Facility Managers, Technicians, and Requesters.', icon: Users }
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      desc: 'Perfect for small buildings or getting started.',
      features: [
        '1 Building',
        '20 requests / month',
        '1 Technician account',
        'Basic status tracking',
        'Email support'
      ],
      cta: 'Start for Free',
      popular: false
    },
    {
      name: 'Starter',
      price: '$19',
      period: 'month',
      desc: 'Ideal for independent property managers.',
      features: [
        '3 Buildings',
        '500 requests / month',
        '5 Technician accounts',
        'SLA tracking & alerts',
        'Priority email support'
      ],
      cta: 'Upgrade to Starter',
      popular: false
    },
    {
      name: 'Business',
      price: '$49',
      period: 'month',
      desc: 'Complete suite for active organizations.',
      features: [
        'Unlimited requests',
        '20 Technician accounts',
        'Dynamic reports & charts',
        'Custom categories & spaces',
        'Full SLA monitoring',
        '1-hour SLA support'
      ],
      cta: 'Try Business Free',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'quote',
      desc: 'For multi-location corporations and institutions.',
      features: [
        'Multi-organization setups',
        'Unlimited technicians',
        'Custom API integration',
        'Dedicated success manager',
        '99.9% uptime SLA guarantee'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-950">FacilityFix</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 hover:text-slate-900">
            <a href="#problem" className="hover:text-blue-600 transition">The Problem</a>
            <a href="#features" className="hover:text-blue-600 transition">Features</a>
            <a href="#sectors" className="hover:text-blue-600 transition">Sectors</a>
            <a href="#pricing" className="hover:text-blue-600 transition">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            {session ? (
              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-slate-700 hover:text-blue-600 text-sm font-medium transition"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="h-3 w-3" />
            Empowering Modern Facility Teams
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Track, assign, and resolve facility maintenance requests{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">from one dashboard.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
            Stop losing complaints in WhatsApp and spreadsheets. Streamline communication, track SLAs automatically, assign work to technicians, and get insightful repair metrics.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register?demo=true"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 group"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login?demo=true"
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold px-8 py-4 rounded-xl border border-slate-700 transition flex items-center justify-center gap-2"
            >
              Explore Seeded Demo
            </Link>
          </div>

          <div className="mt-6 text-sm text-slate-400 flex items-center justify-center gap-6">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>Instant setup</span>
            </div>
          </div>
        </div>
      </section>

      {/* Target Sectors Grid */}
      <section id="sectors" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              One Maintenance Platform. Every Industry.
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              FacilityFix is engineered to fit into any facility model. Built to handle standard spaces, technicians, and priorities.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {targetSectors.map((sector, index) => (
              <div key={index} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{sector.name}</h3>
                <p className="text-sm text-slate-600">{sector.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section id="problem" className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-red-600 uppercase tracking-widest block mb-2">The Maintenance Nightmare</span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
                Still managing repairs through WhatsApp & paper logs?
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                When facility managers rely on chaotic channels to manage buildings, critical things break. Unresolved leaks damage floors, slow response times frustrate residents, and technicians lose track of who is fixing what.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  'Lost maintenance complaints and slow resolution times.',
                  'No technician workload tracking or accountability.',
                  'Zero repair history or analytics of recurring issues.',
                  'Unmonitored SLAs leading to expensive facility shutdowns.'
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 bg-slate-800/50 rounded-bl-3xl border-l border-b border-slate-700/50">
                <FileText className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
                The FacilityFix Guarantee
              </h3>
              <p className="text-slate-300 text-sm mb-6">
                We organize chaos. From a single request, the system triggers active timers, sets priority, alerts your team, and helps your tenants track issues from start to completion.
              </p>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Response Speedup</span>
                  <span className="text-emerald-400 font-semibold">+68% faster</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Issue Visibility</span>
                  <span className="text-emerald-400 font-semibold">100% tracked</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-slate-400">Tenant Satisfaction</span>
                  <span className="text-emerald-400 font-semibold">4.8 / 5.0 Average</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">Features & Capabilities</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Everything you need to run a flawless operation
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Forget basic forms. Our maintenance workflows are custom-tailored for actual multi-tenant buildings, schools, and offices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition">
                  <div className="bg-blue-600 text-white p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4 shadow-sm">
                    <IconComp className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dynamic CTA with Public Link */}
      <section className="py-12 bg-blue-50 border-y border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-3 rounded-xl">
              <ExternalLink className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Try our public tenant request portal</h4>
              <p className="text-sm text-slate-600">Simulate how a resident or employee submits a request without logging in.</p>
            </div>
          </div>
          <Link
            href="/request/metro-heights"
            className="w-full md:w-auto bg-white hover:bg-slate-50 text-blue-600 font-semibold border border-blue-200 text-sm px-6 py-3 rounded-xl transition shadow-sm text-center"
          >
            Submit Request to "Metro Heights"
          </Link>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">Subscription Plans</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Simple, transparent pricing for all sizes
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Whether you are an independent landlord or a hospital administrator, choose a plan that scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingPlans.map((plan, idx) => (
              <div 
                key={idx} 
                className={`p-8 rounded-3xl bg-white border flex flex-col ${
                  plan.popular ? 'border-blue-500 shadow-lg relative ring-4 ring-blue-500/10' : 'border-slate-200 shadow-sm'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-950">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{plan.desc}</p>
                </div>
                
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-slate-950">{plan.price}</span>
                  <span className="text-sm text-slate-500">/ {plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition ${
                    plan.popular 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' 
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Wrench className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg text-white">FacilityFix</span>
          </div>
          <div className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} FacilityFix Inc. All rights reserved. Built as a portfolio SaaS product.
          </div>
        </div>
      </footer>
    </div>
  );
}
