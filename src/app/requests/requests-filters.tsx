'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building, Category, Technician } from '@prisma/client';
import { Search, Filter, X } from 'lucide-react';

interface RequestsFiltersProps {
  buildings: Building[];
  categories: Category[];
  technicians: Technician[];
}

export default function RequestsFilters({
  buildings,
  categories,
  technicians,
}: RequestsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [priority, setPriority] = useState(searchParams.get('priority') || '');
  const [buildingId, setBuildingId] = useState(searchParams.get('buildingId') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState(searchParams.get('assignedTechnicianId') || '');

  function handleApplyFilters(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (priority) params.set('priority', priority);
    if (buildingId) params.set('buildingId', buildingId);
    if (categoryId) params.set('categoryId', categoryId);
    if (assignedTechnicianId) params.set('assignedTechnicianId', assignedTechnicianId);

    router.push(`/requests?${params.toString()}`);
  }

  function handleResetFilters() {
    setSearch('');
    setStatus('');
    setPriority('');
    setBuildingId('');
    setCategoryId('');
    setAssignedTechnicianId('');
    router.push('/requests');
  }

  const activeFiltersCount = [
    status,
    priority,
    buildingId,
    categoryId,
    assignedTechnicianId,
  ].filter(Boolean).length;

  return (
    <form onSubmit={handleApplyFilters} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs placeholder-slate-400 transition"
            placeholder="Search by summary, description, requester..."
          />
        </div>
        
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <Filter className="h-4 w-4" />
            Apply Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>

          {(search || activeFiltersCount > 0) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs px-3 py-2.5 rounded-xl transition flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Dropdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
        {/* Status */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="block w-full py-2 px-2 border border-slate-300 bg-white rounded-xl text-slate-700 focus:outline-none text-xs transition"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="ON_HOLD">ON_HOLD</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="block w-full py-2 px-2 border border-slate-300 bg-white rounded-xl text-slate-700 focus:outline-none text-xs transition"
          >
            <option value="">All Priorities</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>
        </div>

        {/* Building */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Building</label>
          <select
            value={buildingId}
            onChange={(e) => setBuildingId(e.target.value)}
            className="block w-full py-2 px-2 border border-slate-300 bg-white rounded-xl text-slate-700 focus:outline-none text-xs transition"
          >
            <option value="">All Buildings</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="block w-full py-2 px-2 border border-slate-300 bg-white rounded-xl text-slate-700 focus:outline-none text-xs transition"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Technician */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Technician</label>
          <select
            value={assignedTechnicianId}
            onChange={(e) => setAssignedTechnicianId(e.target.value)}
            className="block w-full py-2 px-2 border border-slate-300 bg-white rounded-xl text-slate-700 focus:outline-none text-xs transition"
          >
            <option value="">All Technicians</option>
            <option value="unassigned">Unassigned</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </form>
  );
}
