"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface SidebarNavProps {
  links: {
    label: string;
    href: string;
    icon: ReactNode;
  }[];
}

export default function SidebarNav({ links }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <ul className="space-y-1">
      {links.map((link, idx) => {
        const isActive =
          pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <li key={idx}>
            <Link
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition group ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span
                className={`h-5 w-5 transition flex-shrink-0 ${
                  isActive
                    ? "text-blue-600"
                    : "text-slate-400 group-hover:text-slate-600"
                }`}
              >
                {link.icon}
              </span>
              <span>{link.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
