'use client';

import { useState, useTransition } from 'react';
import { createMaintenanceRequest } from '@/actions/requests';
import { Building, Location, Category } from '@prisma/client';
import { 
  Building2, 
  MapPin, 
  Tag, 
  AlertOctagon, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  Plus
} from 'lucide-react';
import Link from 'next/link';

interface PublicRequestFormProps {
  orgSlug: string;
  buildings: Building[];
  locations: Location[];
  categories: Category[];
}

export default function PublicRequestForm({
  orgSlug,
  buildings,
  locations,
  categories,
}: PublicRequestFormProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [requesterPhone, setRequesterPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Dynamically filter locations by building ID
  const filteredLocations = locations.filter((loc) => loc.buildingId === buildingId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!buildingId) return setError('Please select a building.');
    if (!locationId) return setError('Please select a specific location/room.');
    if (!categoryId) return setError('Please select a maintenance category.');

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

      const res = await createMaintenanceRequest(formData, orgSlug);

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || 'Failed to submit request.');
      }
    });
  }

  // Pre-fill fields for reviewer convenience
  const handlePreFill = () => {
    setTitle('Heaters blowing cold air');
    setDescription('In Unit 4B, the wall-mounted heating unit is turning on but only blowing cold air. It was working fine yesterday but stopped heating up this morning.');
    setRequesterName('Jane Resident');
    setRequesterEmail('jane.smith@example.com');
    setRequesterPhone('+1 (555) 321-0099');
    
    // Auto-select first building, category, and matching location if possible
    if (buildings.length > 0) {
      setBuildingId(buildings[0].id);
      const matchedLocs = locations.filter(l => l.buildingId === buildings[0].id);
      if (matchedLocs.length > 0) {
        setLocationId(matchedLocs[0].id);
      }
    }
    if (categories.length > 0) {
      const hvacCat = categories.find(c => c.name.toLowerCase().includes('hvac')) || categories[0];
      setCategoryId(hvacCat.id);
    }
    setPriority('MEDIUM');
    setImageUrl('https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=800');
  };

  if (success) {
    return (
      <div className="text-center py-8 animate-fadeIn">
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Request Submitted!</h2>
        <p className="text-slate-600 text-sm max-w-sm mx-auto mb-6">
          Your maintenance ticket has been registered in the system. The facility team has been notified and will review your request.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs text-slate-500 mb-6">
          <span className="font-bold text-slate-700 block mb-1">What happens next?</span>
          <ul className="list-decimal pl-4 space-y-1">
            <li>An administrator reviews your request and assigns a technician.</li>
            <li>You will receive progress logs and status updates.</li>
            <li>The assigned technician will resolve the issue and upload proof.</li>
          </ul>
        </div>
        <button
          onClick={() => {
            setSuccess(false);
            setTitle('');
            setDescription('');
            setBuildingId('');
            setLocationId('');
            setCategoryId('');
            setRequesterName('');
            setRequesterEmail('');
            setRequesterPhone('');
            setImageUrl('');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition shadow-sm"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
          <AlertOctagon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* Pre-fill Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handlePreFill}
          className="text-xs bg-blue-50 border border-blue-200 text-blue-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Pre-fill Demo Data
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Building Select */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-slate-400" />
            Building / Space
          </label>
          <select
            required
            value={buildingId}
            onChange={(e) => {
              setBuildingId(e.target.value);
              setLocationId(''); // Reset location on building change
            }}
            className="block w-full py-2.5 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition"
          >
            <option value="">-- Select Building --</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Location Select (Depends on Building) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-slate-400" />
            Specific Room / Area
          </label>
          <select
            required
            disabled={!buildingId}
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="block w-full py-2.5 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm disabled:bg-slate-100 disabled:text-slate-500 transition"
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
        {/* Category Select */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Tag className="h-4 w-4 text-slate-400" />
            Category
          </label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="block w-full py-2.5 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition"
          >
            <option value="">-- Select Category --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Select */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <AlertOctagon className="h-4 w-4 text-slate-400" />
            Priority
          </label>
          <select
            required
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="block w-full py-2.5 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition"
          >
            <option value="LOW">LOW (Due in 7 days)</option>
            <option value="MEDIUM">MEDIUM (Due in 3 days)</option>
            <option value="HIGH">HIGH (Due in 24 hours)</option>
            <option value="URGENT">URGENT (Due in 4 hours)</option>
          </select>
        </div>
      </div>

      {/* Ticket Title */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-slate-400" />
          Brief Summary / Title
        </label>
        <input
          required
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition"
          placeholder="e.g., Leaking pipes under kitchen sink"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-slate-400" />
          Detailed Description
        </label>
        <textarea
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition"
          placeholder="Please describe the issue in detail, including specific instructions, symptoms, or warnings..."
        />
      </div>

      {/* Photo URL (Simulating Image Upload) */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
          <ImageIcon className="h-4 w-4 text-slate-400" />
          Photo URL (Optional)
        </label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition font-mono text-xs"
          placeholder="e.g., https://example.com/photo.jpg"
        />
        <p className="mt-1 text-[11px] text-slate-500">
          Paste an image link from the web to include visual proof of the issue.
        </p>
      </div>

      <div className="border-t border-slate-100 pt-6">
        <h3 className="font-bold text-slate-900 text-sm mb-3">Your Contact Information</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="h-4 w-4 text-slate-400" />
                Your Full Name
              </label>
              <input
                required
                type="text"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition"
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-slate-400" />
                Email Address
              </label>
              <input
                required
                type="email"
                value={requesterEmail}
                onChange={(e) => setRequesterEmail(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition"
                placeholder="jane.smith@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-slate-400" />
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={requesterPhone}
              onChange={(e) => setRequesterPhone(e.target.value)}
              className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition"
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition items-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting Request...
          </>
        ) : (
          'Submit Maintenance Request'
        )}
      </button>
    </form>
  );
}
