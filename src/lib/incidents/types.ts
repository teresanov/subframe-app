export type IncidentType = "presupuesto_superado" | "sustitucion_rechazada" | "otro";

export type IncidentStatus = "open" | "notified" | "resolved";

export interface Incident {
  id: string;
  projectId: string;
  revisionId: string;
  type: IncidentType;
  status: IncidentStatus;
  /** Descripción legible. */
  description: string;
  /** Importe estimado que superó el límite (si aplica). */
  estimatedTotal?: number;
  /** Límite de presupuesto aplicado (si aplica). */
  budgetLimit?: number;
  /** Email del remitente de la petición (para notificar). */
  requesterEmail?: string;
  /** Nombre del N1 de fábrica a notificar. */
  n1FactoryName?: string;
  createdAt: string;
  updatedAt: string;
}
