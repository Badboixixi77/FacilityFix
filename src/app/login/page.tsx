import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./login-form";
import { Wrench } from "lucide-react";

export default async function LoginPage() {
  const session = await getAuthUser();

  // If already logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  const demoAccounts = [
    {
      label: "Admin",
      email: "admin@facilityfix.com",
      pass: "admin123",
      color: "bg-indigo-50 border-indigo-200 text-indigo-700",
    },
    {
      label: "Manager",
      email: "manager@facilityfix.com",
      pass: "manager123",
      color: "bg-amber-50 border-amber-200 text-amber-700",
    },
    {
      label: "Technician",
      email: "tech@facilityfix.com",
      pass: "tech123",
      color: "bg-purple-50 border-purple-200 text-purple-700",
    },
    {
      label: "Tenant / Requester",
      email: "tenant@facilityfix.com",
      pass: "tenant123",
      color: "bg-emerald-50 border-emerald-200 text-emerald-700",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <Wrench className="h-6 w-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-950">
              FacilityFix
            </span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{" "}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            register a new organization
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-200">
          <LoginForm />

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500 font-medium">
                  Seeded Demo Accounts
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {demoAccounts.map((acc, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-xl border text-center flex flex-col justify-between ${acc.color}`}
                >
                  <div>
                    <div className="font-bold text-xs uppercase tracking-wider">
                      {acc.label}
                    </div>
                    <div className="text-xs font-mono mt-1 truncate">
                      {acc.email}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    Pass: {acc.pass}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center text-xs text-slate-500">
              💡 Hint: You can type any of these credentials into the login form
              above to instantly view the app from that user's perspective.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
