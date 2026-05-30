export const ROL_PERSONAL_LABELS: Record<string, string> = {
  GERENTE_TIENDA: "Gerente de Tienda",
  JEFE_TURNO: "Jefe de Turno",
  SUPERVISOR_SECCION: "Supervisor de Sección",
  SUPERVISOR_TESOROS: "Supervisor Tesoros",
  SUPERVISOR_ASESORIA: "Supervisor Asesoría",
  TRAINING: "Training",
  ASESOR: "Asesor",
  CUBRE_TIENDA: "Cubre Tienda",
};

export const ROL_PERSONAL_OPTIONS = Object.entries(ROL_PERSONAL_LABELS).map(
  ([value, label]) => ({ value, label })
);

export const TIPO_MOVIMIENTO_LABELS: Record<string, string> = {
  DESCANSO: "Descanso",
  VACACIONES: "Vacaciones",
  LICENCIA: "Licencia",
  CAPACITACION: "Capacitación",
  DESCANSO_MEDICO: "Descanso Médico",
};

export const TIPO_MOVIMIENTO_OPTIONS = Object.entries(TIPO_MOVIMIENTO_LABELS).map(
  ([value, label]) => ({ value, label })
);

export const ESTADO_LABELS: Record<string, string> = {
  BORRADOR: "Borrador",
  PENDIENTE_APROBACION: "Pendiente de Aprobación",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
};

export const ESTADO_COLORS: Record<string, string> = {
  BORRADOR: "bg-gray-100 text-gray-700",
  PENDIENTE_APROBACION: "bg-yellow-100 text-yellow-800",
  APROBADO: "bg-green-100 text-green-800",
  RECHAZADO: "bg-red-100 text-red-700",
};

// Which roles can cover which other roles (spec §9)
export const COBERTURA_VALIDA: Record<string, string[]> = {
  GERENTE_TIENDA: ["JEFE_TURNO", "CUBRE_TIENDA", "TRAINING", "SUPERVISOR_SECCION", "SUPERVISOR_TESOROS", "SUPERVISOR_ASESORIA"],
  JEFE_TURNO: ["GERENTE_TIENDA", "CUBRE_TIENDA", "TRAINING", "SUPERVISOR_SECCION", "SUPERVISOR_TESOROS", "SUPERVISOR_ASESORIA"],
  SUPERVISOR_SECCION: ["SUPERVISOR_SECCION", "SUPERVISOR_TESOROS", "SUPERVISOR_ASESORIA", "TRAINING", "ASESOR"],
  SUPERVISOR_TESOROS: ["SUPERVISOR_SECCION", "SUPERVISOR_TESOROS", "SUPERVISOR_ASESORIA", "TRAINING", "ASESOR"],
  SUPERVISOR_ASESORIA: ["SUPERVISOR_SECCION", "SUPERVISOR_TESOROS", "SUPERVISOR_ASESORIA", "TRAINING", "ASESOR"],
};

export const TIPO_COLOR: Record<string, string> = {
  DESCANSO: "bg-red-100 text-red-700 border-red-200",
  VACACIONES: "bg-gray-100 text-gray-600 border-gray-200",
  LICENCIA: "bg-orange-100 text-orange-700 border-orange-200",
  CAPACITACION: "bg-blue-100 text-blue-700 border-blue-200",
  DESCANSO_MEDICO: "bg-purple-100 text-purple-700 border-purple-200",
};
