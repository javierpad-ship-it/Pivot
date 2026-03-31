import Link from "next/link";

const sections = [
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
        <p className="text-sm text-gray-500 mt-1">Administra tiendas, marcas, mundos y líneas</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-2xl">
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
