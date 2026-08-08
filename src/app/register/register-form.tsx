'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/actions/auth';
import { User, Mail, Lock, Building, Loader2, AlertCircle, Shield } from 'lucide-react';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ORG_ADMIN' | 'REQUESTER'>('ORG_ADMIN');
  const [organizationName, setOrganizationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (role === 'ORG_ADMIN' && !organizationName.trim()) {
      setLoading(false);
      setError('Organization name is required for administrators.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('role', role);
    if (role === 'ORG_ADMIN') {
      formData.append('organizationName', organizationName);
    }

    const result = await register(null, formData);

    if (result.success) {
      router.push('/dashboard');
      router.refresh();
    } else {
      setLoading(false);
      setError(result.message || 'Registration failed. Check inputs.');
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          What is your role?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('ORG_ADMIN')}
            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
              role === 'ORG_ADMIN'
                ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/10'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <span className="font-bold text-sm text-slate-900 block">Organization Admin</span>
            <span className="text-xs text-slate-500 mt-1">Manage buildings, categories, staff, and view analytics reports.</span>
          </button>
          
          <button
            type="button"
            onClick={() => setRole('REQUESTER')}
            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
              role === 'REQUESTER'
                ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/10'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <span className="font-bold text-sm text-slate-900 block">Tenant / Requester</span>
            <span className="text-xs text-slate-500 mt-1">Submit maintenance complaints and track repair work status.</span>
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
          Full name
        </label>
        <div className="mt-1.5 relative rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <User className="h-5 w-5" />
          </div>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm placeholder-slate-400 transition"
            placeholder="John Doe"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
          Email address
        </label>
        <div className="mt-1.5 relative rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Mail className="h-5 w-5" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm placeholder-slate-400 transition"
            placeholder="john.doe@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
          Password
        </label>
        <div className="mt-1.5 relative rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Lock className="h-5 w-5" />
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm placeholder-slate-400 transition"
            placeholder="Min. 6 characters"
          />
        </div>
      </div>

      {role === 'ORG_ADMIN' && (
        <div className="pt-2 animate-fadeIn">
          <label htmlFor="organizationName" className="block text-sm font-semibold text-slate-700">
            Organization / Company name
          </label>
          <div className="mt-1.5 relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Building className="h-5 w-5" />
            </div>
            <input
              id="organizationName"
              name="organizationName"
              type="text"
              required={role === 'ORG_ADMIN'}
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm placeholder-slate-400 transition"
              placeholder="e.g. Skyline Apartments, Acme Corp"
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            We will set up standard maintenance categories for this organization automatically!
          </p>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </div>
    </form>
  );
}
