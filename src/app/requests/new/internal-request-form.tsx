'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createMaintenanceRequest } from '@/actions/requests';
import { Building, Location, Category, User as PrismaUser } from '@prisma/client';
import { 
  Building2, 
  MapPin, 
  Tag, 
  AlertOctagon, 
  User as UserIcon, 
  Mail, 
  Phone, 
  FileText, 
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  ArrowLeft,
  X
} from 'lucide-react';
import Link from 'next/link';

interface InternalRequestFormProps {
  buildings: Building[];
  locations: Location[];
  categories: Category[];
  currentUser: PrismaUser;
}

export default function InternalRequestForm({
  buildings,
  locations,
  categories,
  currentUser,
}: InternalRequestFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  
  const [requesterName, setRequesterName] = useState(currentUser.name);
  const [requesterEmail, setRequesterEmail] = useState(currentUser.email);
  const [requesterPhone, setRequesterPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoggedForSelf, setIsLoggedForSelf] = useState(true);

  // Filter locations by building
  const filteredLocations = locations.filter((loc) => loc.buildingId === buildingId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!buildingId) return setError('Please select a building.');
    if (!locationId) return setError('Please select a specific room/unit.');
    if (!categoryId) return setError('Please select a category.');

    startTransition(async () => {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('categoryId', categoryId);
      formData.append('buildingId', buildingId);
      formData.append('locationId', locationId);
      formData.append('priority', priority);
      formData.append('requesterName', requesterName);
      formData.append('requesterEmail', requesterEmail);
      formData.append('requesterPhone', requesterPhone);
      formData.append('imageUrl', imageUrl);

      const res = await createMaintenanceRequest(formData);

      if (res.success) {
        router.push(`/requests/${res.requestId}`);
        router.refresh();
      } else {
        setError(res.error || 'Failed to submit request.');
      }
    });
  }

  function toggleLoggingForSelf(self: boolean) {
    setIsLoggedForSelf(self);
    if (self) {
      setRequesterName(currentUser.name);
      setRequesterEmail(currentUser.email);
    } else {
      setRequesterName('');
      setRequesterEmail('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
          <X className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* Target requester toggle */}
      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">Who is filing this request?</span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => toggleLoggingForSelf(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              isLoggedForSelf 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Filing for Myself
          </button>
          <button
            type="button"
            onClick={() => toggleLoggingForSelf(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              !isLoggedForSelf 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Filing on behalf of Tenant/Other
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Building */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-slate-400" />
            Building / Block
          </label>
          <select
            required
            value={buildingId}
            onChange={(e) => {
              setBuildingId(e.target.value);
              setLocationId('');
            }}
            className="block w-full py-2.5 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs transition"
          >
            <option value="">-- Select Building --</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Location (Depends on Building) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-slate-400" />
            Specific Room / Area
          </label>
          <select
            required
            disabled={!buildingId}
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="block w-full py-2.5 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs disabled:bg-slate-100 disabled:text-slate-500 transition"
          >
            <option value="">
              {!buildingId ? 'Select Building first' : '-- Select Room/Unit --'}
            </option>
            {filteredLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} {loc.roomOrUnit ? `(${loc.roomOrUnit})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Tag className="h-4 w-4 text-slate-400" />
            Category
          </label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="block w-full py-2.5 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs transition"
          >
            <option value="">-- Select Category --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <AlertOctagon className="h-4 w-4 text-slate-400" />
            Priority
          </label>
          <select
            required
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="block w-full py-2.5 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs transition"
          >
            <option value="LOW">LOW (Due in 7 days)</option>
            <option value="MEDIUM">MEDIUM (Due in 3 days)</option>
            <option value="HIGH">HIGH (Due in 24 hours)</option>
            <option value="URGENT">URGENT (Due in 4 hours)</option>
          </select>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-slate-400" />
          Brief Summary / Title
        </label>
        <input
          required
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs transition"
          placeholder="e.g. Broken wall socket in lobby"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-slate-400" />
          Detailed Description
        </label>
        <textarea
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs transition"
          placeholder="Provide symptoms, specific warnings, or repair requirements..."
        />
      </div>

      {/* Photo URL */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <ImageIcon className="h-4 w-4 text-slate-400" />
          Attach Photo URL (Optional)
        </label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs transition font-mono"
          placeholder="https://images.unsplash.com/... or leave blank"
        />
      </div>

      {/* Requester Profile Contact details */}
      <div className="border-t border-slate-100 pt-6">
        <h4 className="font-extrabold text-slate-900 text-sm mb-3">Requester Contact Information</h4>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <UserIcon className="h-4 w-4 text-slate-400" />
                Full Name
              </label>
              <input
                required
                type="text"
                disabled={isLoggedForSelf}
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs disabled:bg-slate-100 disabled:text-slate-500 transition"
                placeholder="Requester's name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-slate-400" />
                Email Address
              </label>
              <input
                required
                type="email"
                disabled={isLoggedForSelf}
                value={requesterEmail}
                onChange={(e) => setRequesterEmail(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs disabled:bg-slate-100 disabled:text-slate-500 transition"
                placeholder="requester@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-slate-400" />
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={requesterPhone}
              onChange={(e) => setRequesterPhone(e.target.value)}
              className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs transition"
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Link
          href="/requests"
          className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Filing Ticket...
            </>
          ) : (
            'File Maintenance Ticket'
          )}
        </button>
      </div>
    </form>
  );
}
