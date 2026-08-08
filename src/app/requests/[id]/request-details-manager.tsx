'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  assignRequest, 
  updateRequestStatus, 
  updateRequestPriority, 
  addRequestComment, 
  uploadRequestImage 
} from '@/actions/requests';
import { 
  UserRole, 
  RequestPriority, 
  RequestStatus, 
  User as PrismaUser,
  Technician
} from '@prisma/client';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Tag, 
  MessageSquare, 
  Activity, 
  Image as ImageIcon,
  CheckCircle2,
  Wrench,
  ChevronDown,
  Loader2,
  Lock,
  Plus,
  ArrowUpRight,
  RefreshCw,
  Send,
  HelpCircle
} from 'lucide-react';

interface RequestDetailsManagerProps {
  initialRequest: any; // Type comes from prisma join
  technicians: Technician[];
  currentUser: PrismaUser;
  memberRole: UserRole;
}

export default function RequestDetailsManager({
  initialRequest,
  technicians,
  currentUser,
  memberRole,
}: RequestDetailsManagerProps) {
  const router = useRouter();
  const [request, setRequest] = useState(initialRequest);
  const [isPending, startTransition] = useTransition();

  // Inputs state
  const [newComment, setNewComment] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [statusNote, setStatusNote] = useState('');

  const now = new Date();
  const isOverdue = 
    request.status !== 'RESOLVED' && 
    request.status !== 'CONFIRMED' && 
    request.status !== 'CANCELLED' && 
    new Date(request.slaDueAt) < now;

  const isManagerOrAdmin = memberRole === 'ORG_ADMIN' || memberRole === 'FACILITY_MANAGER';
  const isAssignedTechnician = request.assignedTechnician?.email === currentUser.email || memberRole === 'TECHNICIAN';

  // Styling helper classes
  const priorityColors: Record<RequestPriority, { bg: string; text: string; border: string }> = {
    LOW: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
    MEDIUM: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    HIGH: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    URGENT: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  };

  const statusColors: Record<RequestStatus, { bg: string; text: string; border: string }> = {
    OPEN: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    ASSIGNED: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    IN_PROGRESS: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    ON_HOLD: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' },
    RESOLVED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    CONFIRMED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  };

  // 1. Assign Technician Action
  const handleAssign = async (techId: string) => {
    startTransition(async () => {
      const res = await assignRequest(request.id, techId || null);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || 'Failed to assign technician');
      }
    });
  };

  // 2. Change Status Action
  const handleStatusChange = async (newStatus: RequestStatus) => {
    startTransition(async () => {
      const res = await updateRequestStatus(request.id, newStatus, statusNote);
      if (res.success) {
        setStatusNote('');
        router.refresh();
      } else {
        alert(res.error || 'Failed to update status');
      }
    });
  };

  // 3. Change Priority Action
  const handlePriorityChange = async (newPriority: RequestPriority) => {
    startTransition(async () => {
      const res = await updateRequestPriority(request.id, newPriority);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || 'Failed to update priority');
      }
    });
  };

  // 4. Submit Comment Action
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    startTransition(async () => {
      const res = await addRequestComment(request.id, newComment);
      if (res.success) {
        setNewComment('');
        router.refresh();
      } else {
        alert(res.error || 'Failed to add comment');
      }
    });
  };

  // 5. Submit Image Action
  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;

    startTransition(async () => {
      const res = await uploadRequestImage(request.id, newImageUrl);
      if (res.success) {
        setNewImageUrl('');
        setShowImageInput(false);
        router.refresh();
      } else {
        alert(res.error || 'Failed to upload photo');
      }
    });
  };

  const priorityStyle = priorityColors[request.priority as RequestPriority] || priorityColors.MEDIUM;
  const statusStyle = statusColors[request.status as RequestStatus] || statusColors.OPEN;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg border uppercase tracking-wider ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}>
              {request.priority} Priority
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg border uppercase tracking-wider ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
              {request.status}
            </span>
            {isOverdue && (
              <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs font-black uppercase px-2.5 py-1 rounded-lg border border-red-200 animate-pulse">
                <AlertTriangle className="h-3.5 w-3.5" />
                SLA BREACHED
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 leading-tight">
            {request.title}
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            Filed on {new Date(request.createdAt).toLocaleString()} • SLA Target: {new Date(request.slaDueAt).toLocaleString()}
          </p>
        </div>

        {/* Global Loading Spinner */}
        {isPending && (
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-150 animate-pulse">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Syncing database...
          </div>
        )}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Description, Attachments, Comments */}
        <div className="lg:col-span-2 space-y-8">
          {/* Detailed Description */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <Tag className="h-4.5 w-4.5 text-blue-600" />
              Request Details & Specifications
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {request.description}
            </p>

            {/* Photo Attachments (Gallery) */}
            {request.images.length > 0 && (
              <div className="space-y-2 pt-3">
                <h4 className="font-bold text-xs text-slate-500">Visual Photo Proof</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {request.images.map((img: any, idx: number) => (
                    <a 
                      key={img.id} 
                      href={img.url} 
                      target="_blank" 
                      className="border border-slate-200 rounded-2xl overflow-hidden hover:opacity-90 transition block aspect-video relative group bg-slate-50"
                    >
                      <img 
                        src={img.url} 
                        alt={`Attachment ${idx + 1}`} 
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          // Fallback
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="absolute bottom-2 right-2 bg-slate-950/75 text-[10px] text-white font-bold px-2 py-0.5 rounded-md">
                        View Photo
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <MessageSquare className="h-4.5 w-4.5 text-indigo-500" />
              Communication Threads ({request.comments.length})
            </h3>

            {/* Comments list */}
            {request.comments.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                No comments written yet. Leave a status note below.
              </div>
            ) : (
              <div className="space-y-4">
                {request.comments.map((comm: any) => {
                  const initials = comm.authorName.substring(0, 2).toUpperCase();
                  const isSelf = comm.userId === currentUser.id;

                  return (
                    <div key={comm.id} className={`flex gap-3 p-3 rounded-2xl border ${
                      isSelf 
                        ? 'bg-blue-50/30 border-blue-100 ml-4' 
                        : 'bg-slate-50/50 border-slate-100 mr-4'
                    }`}>
                      <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-slate-900">{comm.authorName}</span>
                          <span className="text-[10px] font-medium text-slate-400">
                            {new Date(comm.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {comm.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Leave a comment form */}
            <form onSubmit={handleCommentSubmit} className="pt-4 border-t border-slate-100 flex gap-3">
              <input
                required
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type a response or query updates..."
                className="flex-1 block px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs placeholder-slate-400 transition"
              />
              <button
                type="submit"
                disabled={isPending || !newComment.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Management Console, Location, Requester */}
        <div className="space-y-8">
          {/* Management Console */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 bg-slate-800/40 rounded-bl-3xl border-l border-b border-slate-800/80">
              <Wrench className="h-5 w-5 text-blue-400" />
            </div>
            
            <h3 className="font-black text-sm text-blue-400 uppercase tracking-wider">
              Management Console
            </h3>

            {/* Workflow status picker (Admins/Managers, or assigned Technician) */}
            {(isManagerOrAdmin || isAssignedTechnician) ? (
              <div className="space-y-4">
                {/* Text Note for Status change */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Optional Transition Note
                  </label>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Parts arrived, waiting for Otis"
                    className="block w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none text-xs placeholder-slate-500 transition"
                  />
                </div>

                {/* Status transitions grid */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Set Workflow Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* IN PROGRESS */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange('IN_PROGRESS')}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center border transition ${
                        request.status === 'IN_PROGRESS'
                          ? 'bg-amber-600 border-amber-500 text-white shadow-sm'
                          : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      In Progress
                    </button>

                    {/* ON HOLD */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange('ON_HOLD')}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center border transition ${
                        request.status === 'ON_HOLD'
                          ? 'bg-slate-600 border-slate-500 text-white shadow-sm'
                          : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      On Hold
                    </button>

                    {/* RESOLVED */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange('RESOLVED')}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center border transition ${
                        request.status === 'RESOLVED'
                          ? 'bg-green-600 border-green-500 text-white shadow-sm'
                          : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      Mark Resolved
                    </button>

                    {/* CANCELLED */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange('CANCELLED')}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center border transition ${
                        request.status === 'CANCELLED'
                          ? 'bg-red-600 border-red-500 text-white shadow-sm'
                          : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      Cancel Request
                    </button>
                  </div>
                </div>

                {/* Reopen or Confirm for Admin / Requester */}
                <div className="border-t border-slate-800 pt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange('OPEN')}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
                  >
                    Reopen Request
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange('CONFIRMED')}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow"
                  >
                    Confirm Resolution
                  </button>
                </div>
              </div>
            ) : (
              // Requesters can confirm or cancel their own requests!
              <div className="space-y-3 pt-2">
                <p className="text-xs text-slate-400">
                  As the requester, you can confirm that the issue has been resolved to your satisfaction or cancel it if it is no longer required.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange('CONFIRMED')}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow"
                  >
                    Confirm Solved
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange('CANCELLED')}
                    className="flex-1 py-2.5 bg-red-600/25 border border-red-500/20 text-red-400 hover:bg-red-600/40 text-xs font-bold rounded-xl transition"
                  >
                    Cancel Ticket
                  </button>
                </div>
              </div>
            )}

            {/* Technician assignment console (Admins/Managers) */}
            {isManagerOrAdmin && (
              <div className="border-t border-slate-800 pt-4 space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Assign Technician
                </label>
                <select
                  value={request.assignedTechnicianId || ''}
                  onChange={(e) => handleAssign(e.target.value)}
                  className="block w-full py-2 px-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none transition"
                >
                  <option value="">-- Unassigned --</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.specialty || 'General'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Upload completion photo */}
            <div className="border-t border-slate-800 pt-4">
              {!showImageInput ? (
                <button
                  type="button"
                  onClick={() => setShowImageInput(true)}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition"
                >
                  <Plus className="h-4 w-4" />
                  Attach completion photo / proof
                </button>
              ) : (
                <form onSubmit={handleImageSubmit} className="space-y-2">
                  <input
                    required
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Paste visual proof photo URL..."
                    className="block w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none placeholder-slate-500 font-mono"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowImageInput(false)}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-300 px-2 py-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1 rounded-lg transition"
                    >
                      Attach
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Location Information Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-150 pb-2 flex items-center gap-1.5">
              <MapPin className="h-4.5 w-4.5 text-blue-600" />
              Facility Location
            </h4>
            
            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="font-bold text-slate-400">Building</span>
                <span className="font-bold text-slate-900">{request.building.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-400">Room / Unit</span>
                <span className="font-bold text-slate-900">{request.location.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-400">Floor</span>
                <span className="font-bold text-slate-900">{request.location.floor || 'N/A'}</span>
              </div>
              {request.location.description && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">Location Notes</span>
                  <p className="text-[11px] text-slate-600 font-medium italic leading-normal">
                    "{request.location.description}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Requester Profile Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-150 pb-2 flex items-center gap-1.5">
              <UserIcon className="h-4.5 w-4.5 text-indigo-600" />
              Requester Profile
            </h4>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="font-bold text-slate-400">Name</span>
                <span className="font-bold text-slate-900">{request.requesterName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-400">Email</span>
                <span className="font-bold text-slate-900 truncate max-w-[150px]">{request.requesterEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-400">Phone</span>
                <span className="font-bold text-slate-900">{request.requesterPhone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Audit Trail Timeline */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-150 pb-2 flex items-center gap-1.5">
              <Activity className="h-4.5 w-4.5 text-emerald-600" />
              Audit Trail Timeline
            </h4>

            <div className="flow-root max-h-[220px] overflow-y-auto pr-1">
              <ul className="-mb-8">
                {request.activities.map((act: any, idx: number) => (
                  <li key={act.id}>
                    <div className="relative pb-6">
                      {idx !== request.activities.length - 1 ? (
                        <span className="absolute top-3.5 left-3.5 -ml-px h-full w-0.5 bg-slate-100" />
                      ) : null}
                      <div className="relative flex space-x-2.5">
                        <div className="h-7 w-7 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400 flex-shrink-0">
                          <Clock className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 pt-0.5">
                          <p className="text-[11px] font-black text-slate-900">
                            {act.actorName} <span className="text-slate-500 font-semibold">{act.action.toLowerCase().replace('_', ' ')}</span>
                          </p>
                          {act.metadata && (
                            <p className="text-[10px] text-slate-400 italic font-medium leading-normal mt-0.5">
                              {act.metadata}
                            </p>
                          )}
                          <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                            {new Date(act.createdAt).toLocaleDateString()} {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
