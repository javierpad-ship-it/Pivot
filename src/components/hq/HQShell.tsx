"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { SessionUser } from "@/lib/session";

// ─── MÓDULO CONTEO ───────────────────────────────────────────────────────────
const CONTEO_ITEMS = [
  {
    href: "/hq",
    label: "Dashboard",
    roles: ["SUPER_ADMIN", "ADMIN", "PROGRAMADOR"],
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/hq/programacion",
    label: "Programación",
    roles: ["SUPER_ADMIN", "ADMIN", "PROGRAMADOR"],
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/hq/tasks",
    label: "Tareas",
    roles: ["SUPER_ADMIN", "ADMIN"],
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: "/hq/reports",
    label: "Reportes",
    roles: ["SUPER_ADMIN", "ADMIN", "PROGRAMADOR"],
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

// ─── MÓDULO DESCANSOS ─────────────────────────────────────────────────────────
const DESCANSOS_ITEMS = [
  {
    href: "/hq/descansos",
    label: "Calendario",
    roles: ["SUPER_ADMIN", "ADMIN", "GERENTE_ZONAL"],
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/hq/descansos/programar",
    label: "Programaciones",
    roles: ["SUPER_ADMIN", "ADMIN", "GERENTE_ZONAL"],
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: "/hq/descansos/aprobaciones",
    label: "Aprobaciones",
    roles: ["SUPER_ADMIN", "ADMIN"],
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/hq/descansos/personal",
    label: "Personal",
    roles: ["SUPER_ADMIN", "ADMIN", "GERENTE_ZONAL"],
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrador",
  PROGRAMADOR: "Programador",
  GERENTE_ZONAL: "Gerente Zonal",
  TIENDA: "Tienda",
};

function NavItem({
  href,
  label,
  icon,
  isActive,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
    >
      <span className={isActive ? "text-blue-600" : "text-gray-400"}>{icon}</span>
      {label}
    </Link>
  );
}

function ModuleSection({
  title,
  color,
  items,
  userRole,
  pathname,
  onClose,
}: {
  title: string;
  color: string;
  items: typeof CONTEO_ITEMS;
  userRole: string;
  pathname: string;
  onClose?: () => void;
}) {
  const visible = items.filter((i) => i.roles.includes(userRole));
  if (visible.length === 0) return null;

  return (
    <div>
      <p className={`px-3 mb-1 text-[10px] font-bold uppercase tracking-widest ${color}`}>{title}</p>
      <div className="space-y-0.5">
        {visible.map((item) => {
          const isActive =
            item.href === "/hq"
              ? pathname === "/hq"
              : pathname.startsWith(item.href);
          return (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={isActive}
              onClick={onClose}
            />
          );
        })}
      </div>
    </div>
  );
}

function SidebarContent({
  user,
  pathname,
  onClose,
}: {
  user: SessionUser;
  pathname: string;
  onClose?: () => void;
}) {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const showMantenimiento = ["SUPER_ADMIN", "ADMIN"].includes(user.rol);
  const isMantenimientoActive = pathname.startsWith("/hq/mantenimiento");

  return (
    <>
      {/* Logo header */}
      <div className="h-16 flex items-center justify-between gap-3 px-5 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">Pivot Store</p>
            <p className="text-xs text-gray-400 truncate">Casa Matriz</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        <ModuleSection
          title="Conteo"
          color="text-blue-500"
          items={CONTEO_ITEMS}
          userRole={user.rol}
          pathname={pathname}
          onClose={onClose}
        />
        <ModuleSection
          title="Descansos"
          color="text-teal-600"
          items={DESCANSOS_ITEMS}
          userRole={user.rol}
          pathname={pathname}
          onClose={onClose}
        />
        {showMantenimiento && (
          <div>
            <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Sistema</p>
            <NavItem
              href="/hq/mantenimiento"
              label="Mantenimiento"
              isActive={isMantenimientoActive}
              onClick={onClose}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />
          </div>
        )}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-gray-200 space-y-3 flex-shrink-0">
        <div className="px-2">
          <p className="text-xs font-medium text-gray-900 truncate">{user.nombre}</p>
          <p className="text-xs text-gray-400">{ROLE_LABELS[user.rol] ?? user.rol}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </>
  );
}

export function HQShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex w-60 bg-white border-r border-gray-200 flex-col flex-shrink-0">
        <SidebarContent user={user} pathname={pathname} />
      </aside>

      {/* Drawer — mobile */}
      {open && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="relative z-50 w-60 bg-white flex flex-col h-full shadow-xl">
            <SidebarContent user={user} pathname={pathname} onClose={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 h-14 px-4 bg-white border-b border-gray-200 flex-shrink-0">
          <button onClick={() => setOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900">Pivot Store</p>
          </div>
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
