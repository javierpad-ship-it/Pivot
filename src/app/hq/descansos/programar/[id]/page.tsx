import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session-server";
import { ProgramacionEditor } from "@/components/hq/descansos/ProgramacionEditor";

export const dynamic = "force-dynamic";

export default async function EditProgramacionPage({ params }: { params: { id: string } }) {
  const user = getSession();

  const prog = await prisma.programacionDescanso.findUnique({
    where: { id: params.id },
    include: {
      zona: { select: { name: true } },
      creadoPor: { select: { nombre: true } },
      aprobadoPor: { select: { nombre: true } },
      registros: {
        orderBy: [{ fecha: "asc" }, { cargo: "asc" }],
        include: {
          store: { select: { name: true } },
          persona: { select: { nombreCompleto: true, codigo: true } },
          cobertura: { select: { nombreCompleto: true, codigo: true } },
        },
      },
      auditoria: {
        orderBy: { fechaHora: "desc" },
        take: 10,
        include: { usuario: { select: { nombre: true } } },
      },
    },
  });

  if (!prog) notFound();

  // Load stores for this zone + all personas activas for coverage selection
  const [storesDeLaZona, personasActivas] = await Promise.all([
    prisma.store.findMany({
      where: { zonaId: prog.zonaId },
      orderBy: { name: "asc" },
      select: {
        id: true, name: true,
        formatoDireccion: true,
        gerenteTitularId: true, jefeTurnoTitularId: true,
      },
    }),
    prisma.persona.findMany({
      where: { activo: true },
      orderBy: { nombreCompleto: "asc" },
      select: {
        id: true, nombreCompleto: true, codigo: true,
        tiendaBaseId: true,
        roles: { select: { rol: true } },
        elegibilidades: { select: { rolHabilita: true } },
      },
    }),
  ]);

  const canEdit = ["BORRADOR", "RECHAZADO"].includes(prog.estado);
  const canApprove = ["SUPER_ADMIN", "ADMIN"].includes(user?.rol ?? "");

  return (
    <div className="p-4 sm:p-6 max-w-6xl">
      <ProgramacionEditor
        programacion={{
          id: prog.id,
          estado: prog.estado,
          motivoRechazo: prog.motivoRechazo,
          periodoInicio: prog.periodoInicio.toISOString().split("T")[0],
          periodoFin: prog.periodoFin.toISOString().split("T")[0],
          zonaName: prog.zona.name,
          creadoPorNombre: prog.creadoPor.nombre,
          aprobadoPorNombre: prog.aprobadoPor?.nombre ?? null,
          registros: prog.registros.map((r) => ({
            id: r.id,
            fecha: r.fecha instanceof Date
              ? r.fecha.toISOString().split("T")[0]
              : String(r.fecha),
            storeId: r.storeId,
            storeName: r.store.name,
            personaId: r.personaId,
            personaNombre: r.persona.nombreCompleto,
            cargo: r.cargo,
            tipoMovimiento: r.tipoMovimiento,
            coberturaId: r.coberturaId ?? null,
            coberturaNombre: r.cobertura?.nombreCompleto ?? null,
            observacion: r.observacion ?? "",
            alertaSabadoAceptada: r.alertaSabadoAceptada,
          })),
          auditoria: prog.auditoria.map((a) => ({
            id: a.id,
            fechaHora: a.fechaHora.toISOString(),
            usuario: a.usuario.nombre,
            accion: a.accion,
          })),
        }}
        stores={storesDeLaZona}
        personas={personasActivas.map((p) => ({
          id: p.id,
          nombreCompleto: p.nombreCompleto,
          codigo: p.codigo,
          tiendaBaseId: p.tiendaBaseId,
          roles: p.roles.map((r) => r.rol),
          elegibilidades: p.elegibilidades.map((e) => e.rolHabilita),
        }))}
        canEdit={canEdit}
        canApprove={canApprove}
      />
    </div>
  );
}
