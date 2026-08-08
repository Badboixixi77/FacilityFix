export const dynamic = 'force-dynamic';

import DashboardLayout from '@/components/dashboard-layout';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Settings, ShieldCheck, Mail, Building, Phone, Link2, Clock, Bell, CreditCard, Save, ArrowUpRight } from 'lucide-react';
import { updateOrganization } from '@/actions/crud';

export default async function SettingsPage() {
  const session = await getAuthUser();
  if (!session || !session.memberOfOrgId) {
    redirect('/login');
  }

  const isManagerOrAdmin = session.memberRole === 'ORG_ADMIN' || session.memberRole === 'FACILITY_MANAGER';
  if (!isManagerOrAdmin) {
    redirect('/dashboard');
  }

  const orgId = session.memberOfOrgId;

  // Fetch active organization details
  const organization = await db.organization.findUnique({
    where: { id: orgId },
  });

  if (!organization) {
    redirect('/dashboard');
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2">
            <Settings className="h-6.5 w-6.5 text-blue-600" />
            Organization & SLA Settings
          </h1>
          <p className="text-sm text-slate-500">
            Configure default facility info, copy tenant request portals, view SLA rules, and manage subscription billing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Settings Tabs List */}
          <div className="space-y-3">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-xs font-bold space-y-1">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-2">Management Tabs</span>
              <a href="#profile" className="flex items-center gap-2.5 p-2.5 text-blue-600 bg-blue-50/50 rounded-xl transition">
                <Building className="h-4 w-4" />
                Organization Profile
              </a>
              <a href="#portal" className="flex items-center gap-2.5 p-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition">
                <Link2 className="h-4 w-4" />
                Request Portal Link
              </a>
              <a href="#sla" className="flex items-center gap-2.5 p-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition">
                <Clock className="h-4 w-4" />
                SLA Deadlines Rules
              </a>
              <a href="#notifications" className="flex items-center gap-2.5 p-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition">
                <Bell className="h-4 w-4" />
                Notification Routing
              </a>
              <a href="#billing" className="flex items-center gap-2.5 p-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition">
                <CreditCard className="h-4 w-4" />
                Billing & Subscription
              </a>
            </div>

            <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-sm text-xs space-y-2">
              <span className="font-extrabold text-white flex items-center gap-1">
                <ShieldCheck className="h-4.5 w-4.5" />
                Enterprise Mode
              </span>
              <p className="leading-relaxed opacity-90">
                You are currently running in local sandboxed development mode. Subscriptions are simulated.
              </p>
            </div>
          </div>

          {/* Settings Forms container */}
          <div className="md:col-span-2 space-y-8">
            {/* Profile form */}
            <section id="profile" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <Building className="h-4.5 w-4.5 text-blue-600" />
                Organization Profile Details
              </h3>

              <form action={updateOrganization as any} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 mb-1.5">Organization Name *</label>
                    <input
                      required
                      type="text"
                      name="name"
                      defaultValue={organization.name}
                      className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1.5">Industry / Domain</label>
                    <input
                      type="text"
                      name="industry"
                      defaultValue={organization.industry || ''}
                      placeholder="e.g. Property Management"
                      className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1.5">Physical Registered Address</label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={organization.address || ''}
                    placeholder="Full headquarters address"
                    className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 mb-1.5">Corporate Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={organization.phone || ''}
                      placeholder="+1 (555) 000-0000"
                      className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1.5">Support Email Address</label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={organization.email || ''}
                      placeholder="support@company.com"
                      className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition flex items-center gap-1.5 shadow"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </form>
            </section>

            {/* Public Portal Link */}
            <section id="portal" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <Link2 className="h-4.5 w-4.5 text-blue-600" />
                Tenant / Public Submission Portal
              </h3>
              
              <div className="space-y-3 text-xs">
                <p className="text-slate-600 leading-relaxed font-semibold">
                  Share this copyable public link with your residents, office employees, or paste it as QR codes around hallways. Requesters can file complaints instantly without a full login.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between font-mono text-[11px] text-blue-700 font-bold overflow-x-auto select-all">
                  <span>/request/{organization.slug}</span>
                </div>

                <div className="flex justify-end pt-1">
                  <a
                    href={`/request/${organization.slug}`}
                    target="_blank"
                    className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2 px-4 rounded-xl transition flex items-center gap-1.5 text-xs shadow-sm"
                  >
                    Open Public Portal
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </section>

            {/* SLA Policies */}
            <section id="sla" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-orange-500" />
                Active SLA Deadlines Rules
              </h3>

              <div className="space-y-4 text-xs font-semibold text-slate-700">
                <p className="text-slate-500">
                  Target completion policies are triggered automatically at the moment of filing based on selected priority:
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Low Priority</span>
                    <span className="font-bold text-slate-800 text-sm block mt-1">Due in 7 Days</span>
                    <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">Janitorial, loose carpet</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Medium Priority</span>
                    <span className="font-bold text-blue-600 text-sm block mt-1">Due in 3 Days</span>
                    <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">Leaky faucet, door locks</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">High Priority</span>
                    <span className="font-bold text-orange-600 text-sm block mt-1">Due in 24 Hours</span>
                    <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">AC outage, elevator scrape</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Urgent Priority</span>
                    <span className="font-bold text-red-600 text-sm block mt-1">Due in 4 Hours</span>
                    <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">Water flooding, server heat</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Notification settings */}
            <section id="notifications" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 opacity-75">
              <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <Bell className="h-4.5 w-4.5 text-slate-500" />
                Notification Routing (Placeholder)
              </h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Connect external notification channels. Get pinged on Slack, Microsoft Teams, or WhatsApp whenever a critical ticket breaches SLA guidelines.
              </p>
            </section>

            {/* Billing placeholder */}
            <section id="billing" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-blue-600" />
                Billing & Plan Details
              </h3>

              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold">
                <div>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Your Plan</span>
                  <span className="text-sm font-black text-slate-900 block mt-0.5">Business Plan ($49/mo)</span>
                  <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">Unlimited requests • 20 technicians • Reports</span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 rounded-lg uppercase tracking-wider text-[10px]">
                  Active / Simulated
                </span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
