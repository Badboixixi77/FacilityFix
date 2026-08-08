export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import PublicRequestForm from './public-request-form';
import { Wrench, ShieldCheck, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface PublicRequestPageProps {
  params: {
    organizationSlug: string;
  };
}

export default async function PublicRequestPage({ params }: PublicRequestPageProps) {
  const { organizationSlug } = params;

  // Fetch organization
  const organization = await db.organization.findUnique({
    where: { slug: organizationSlug },
    include: {
      buildings: {
        orderBy: { name: 'asc' },
      },
      locations: {
        orderBy: { name: 'asc' },
      },
      categories: {
        orderBy: { name: 'asc' },
      },
    },
  });

  if (!organization) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
          <HelpCircle className="h-12 w-12" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Organization Not Found</h1>
        <p className="text-slate-600 max-w-md mb-6">
          The public portal slug <code className="font-mono bg-slate-150 px-1.5 py-0.5 rounded text-red-600">"{organizationSlug}"</code> is not registered on FacilityFix.
        </p>
        <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition">
          Return to Landing Page
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-blue-600 text-white p-3 rounded-2xl mb-4 shadow-sm">
            <Wrench className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">FacilityFix</h1>
          <p className="mt-1 text-slate-600 font-semibold text-sm uppercase tracking-wider">
            {organization.name} • Portal
          </p>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            Submit a maintenance request directly to the facilities team. No account or login required.
          </p>
        </div>

        <div className="bg-white shadow sm:rounded-3xl border border-slate-200 overflow-hidden">
          {/* Form Header Info Banner */}
          <div className="bg-blue-50 border-b border-slate-200 px-6 py-4 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700 font-medium">
              Your contact details will only be used by the facilities team to communicate progress or clarify location details.
            </div>
          </div>

          <div className="px-6 py-8">
            <PublicRequestForm 
              orgSlug={organizationSlug}
              buildings={organization.buildings}
              locations={organization.locations}
              categories={organization.categories}
            />
          </div>
        </div>

        <div className="text-center mt-8 text-xs text-slate-400">
          Powered by <span className="font-semibold">FacilityFix Maintenance SaaS</span>
        </div>
      </div>
    </div>
  );
}
