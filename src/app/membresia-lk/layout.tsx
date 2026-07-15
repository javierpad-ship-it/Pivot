import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session-server";
import { LogoutButton } from "@/components/store/LogoutButton";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "TIENDA"];

export default async function MembresiaLkLayout({ children }: { children: React.ReactNode }) {
  const user = getSession();
  if (!user) redirect("/login");
  if (!ALLOWED_ROLES.includes(user.rol)) redirect("/login");

  const homeHref = user.rol === "TIENDA" ? `/store/${user.storeId}` : "/hq";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center gap-3 h-14 px-4 sm:px-8 bg-white border-b border-gray-200">
        <Link href={homeHref} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <p className="flex-1 text-sm font-semibold text-gray-900">Membresía LK</p>
        <LogoutButton className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500" />
      </div>
      <div className="max-w-4xl mx-auto p-4 sm:p-8">{children}</div>
    </div>
  );
}
