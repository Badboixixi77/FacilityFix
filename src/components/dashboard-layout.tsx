import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { logout } from "@/actions/auth";
import { redirect } from "next/navigation";
import {
  Wrench,
  LayoutDashboard,
  ClipboardList,
  Building,
  MapPin,
  Tag,
  UserSquare2,
  TrendingUp,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  Menu,
} from "lucide-react";
import React from "react";
import SidebarNav from "./sidebar-nav";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await getAuthUser();

  if (!session) {
    redirect("/login");
  }

  const { user, memberOfOrgId, memberOfOrgSlug, memberRole } = session;

  const orgName = session.memberOfOrgId
    ? await dbOrganizationName(memberOfOrgId!)
    : "No Organization";

  // Define sidebar links based on role — icons pre-rendered as JSX so no functions cross the server→client boundary
  const navigationLinks = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      roles: [
        "SUPER_ADMIN",
        "ORG_ADMIN",
        "FACILITY_MANAGER",
        "TECHNICIAN",
        "REQUESTER",
      ],
    },
    {
      label: "Requests",
      href: "/requests",
      icon: <ClipboardList className="h-5 w-5" />,
      roles: [
        "SUPER_ADMIN",
        "ORG_ADMIN",
        "FACILITY_MANAGER",
        "TECHNICIAN",
        "REQUESTER",
      ],
    },
    {
      label: "Buildings",
      href: "/buildings",
      icon: <Building className="h-5 w-5" />,
      roles: ["SUPER_ADMIN", "ORG_ADMIN", "FACILITY_MANAGER"],
    },
    {
      label: "Locations",
      href: "/locations",
      icon: <MapPin className="h-5 w-5" />,
      roles: ["SUPER_ADMIN", "ORG_ADMIN", "FACILITY_MANAGER"],
    },
    {
      label: "Categories",
      href: "/categories",
      icon: <Tag className="h-5 w-5" />,
      roles: ["SUPER_ADMIN", "ORG_ADMIN", "FACILITY_MANAGER"],
    },
    {
      label: "Technicians",
      href: "/technicians",
      icon: <UserSquare2 className="h-5 w-5" />,
      roles: ["SUPER_ADMIN", "ORG_ADMIN", "FACILITY_MANAGER"],
    },
    {
      label: "Reports",
      href: "/reports",
      icon: <TrendingUp className="h-5 w-5" />,
      roles: ["SUPER_ADMIN", "ORG_ADMIN", "FACILITY_MANAGER"],
    },
    {
      label: "Team",
      href: "/team",
      icon: <Users className="h-5 w-5" />,
      roles: ["SUPER_ADMIN", "ORG_ADMIN"],
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      roles: ["SUPER_ADMIN", "ORG_ADMIN", "FACILITY_MANAGER"],
    },
  ];

  // Filter links by user role
  const filteredLinks = navigationLinks.filter(
    (link) => memberRole && link.roles.includes(memberRole),
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-slate-200 lg:bg-white z-30">
        {/* Brand */}
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-200">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <Wrench className="h-4.5 w-4.5" />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">
            FacilityFix
          </span>
        </div>

        {/* Org Selector Placeholder */}
        <div className="p-4 border-b border-slate-100">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between">
            <div className="truncate">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Active Facility
              </span>
              <span className="text-xs font-bold text-slate-800 truncate block">
                {orgName}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SidebarNav links={filteredLinks} />
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 text-blue-700 h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="truncate flex-1">
              <span className="text-xs font-bold text-slate-900 block truncate">
                {user.name}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-150 px-1.5 py-0.5 rounded uppercase inline-block mt-0.5">
                {memberRole?.replace("_", " ")}
              </span>
            </div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 w-full">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
              <Menu className="h-5 w-5" />
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <div className="bg-blue-600 text-white p-1 rounded">
                <Wrench className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm">FacilityFix</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Public Link */}
            {memberOfOrgSlug && (
              <Link
                href={`/request/${memberOfOrgSlug}`}
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-bold bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg transition"
              >
                <span>Public Request Portal</span>
                <ChevronDown className="h-3 w-3 rotate-270" />
              </Link>
            )}

            {/* Notifications Icon */}
            <button className="p-2 text-slate-400 hover:text-slate-600 relative hover:bg-slate-50 rounded-lg">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600" />
            </button>

            {/* Avatar block */}
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 hidden md:inline">
                {user.name}
              </span>
              <div className="bg-slate-100 text-slate-700 h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border border-slate-200">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Inner Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

// Inline DB helper to avoid circular imports / keep clean
async function dbOrganizationName(orgId: string): Promise<string> {
  try {
    const { db } = await import("@/lib/db");
    const org = await db.organization.findUnique({ where: { id: orgId } });
    return org?.name || "Default Facility";
  } catch (e) {
    return "Default Facility";
  }
}
