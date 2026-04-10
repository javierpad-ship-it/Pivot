import Link from "next/link";

const sections = [
  {
    href: "/hq/mantenimiento/dias",
    label: "Días de conteo",
    desc: "Activa los días en que se programan conteos",
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: "bg-blue-100 group-hover:bg-blue-200",
  },
  {
    href: "/hq/mantenimiento/tiendas",
    label: "Tiendas",
    desc: "Agregar, editar o eliminar tiendas",
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    color: "bg-blue-100 group-hover:bg-blue-200",
  },
  {
    href: "/hq/mantenimiento/generos",
    label: "Géneros",
    desc: "Agregar, editar o eliminar géneros",
    icon: (
      <svg className="w-6 h-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    color: "bg-pink-100 group-hover:bg-pink-200",
  },
  {
    href: "/hq/mantenimiento/empresas",
    label: "Empresas",
    desc: "Agregar, editar o eliminar empresas",
    icon: (
      <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: "bg-indigo-100 group-hover:bg-indigo-200",
  },
  {
    href: "/hq/mantenimiento/zonas",
    label: "Zonas",
    desc: "Crear zonas y asignar tiendas",
    icon: (
      <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    color: "bg-teal-100 group-hover:bg-teal-200",
  },
  {
    href: "/hq/mantenimiento/marcas",
    label: "Marcas",
    desc: "Agregar, editar o eliminar marcas",
    icon: (
      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    color: "bg-purple-100 group-hover:bg-purple-200",
  },
  {
    href: "/hq/mantenimiento/mundos",
    label: "Mundos",
    desc: "Agregar, editar o eliminar mundos",
    icon: (
      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
    color: "bg-green-100 group-hover:bg-green-200",
  },
  {
    href: "/hq/mantenimiento/lineas",
    label: "Líneas",
    desc: "Agregar, editar o eliminar líneas de producto",
    icon: (
      <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    color: "bg-orange-100 group-hover:bg-orange-200",
  },
];

export default function MantenimientoPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mantenimiento</h1>
        <p className="text-sm text-gray-500 mt-1">Administra tiendas, empresas, zonas, marcas, mundos y líneas</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-2xl sm:grid-cols-3">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}
            className="group bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${s.color}`}>
              {s.icon}
            </div>
            <p className="font-semibold text-gray-900">{s.label}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
