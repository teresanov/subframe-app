import type { BomLine } from "@/pages/RevisionBomPage.data";
import {
  computeEstimatedTotal,
  exceedsBudget,
  getBudgetLimit,
} from "@/lib/budget/validation";
import type { Incident } from "./types";
import { getIncidentsByRevision, createIncident } from "./storage";

function generateId(): string {
  return crypto.randomUUID?.() ?? `inc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface BudgetCheckResult {
  exceeds: boolean;
  total: number;
  limit: number;
  incidentId?: string;
}

/**
 * Valida el presupuesto del BOM y crea incidencia si se supera el límite.
 * Idempotente: si ya existe incidencia abierta de presupuesto, la reutiliza.
 */
export function checkBudgetAndRecordIncident(
  projectId: string,
  revisionId: string,
  lines: BomLine[],
  options?: { requesterEmail?: string; n1FactoryName?: string }
): BudgetCheckResult {
  const total = computeEstimatedTotal(lines);
  const limit = getBudgetLimit(projectId);
  const over = exceedsBudget(total, limit);

  const existing = getIncidentsByRevision(projectId, revisionId).find(
    (i) => i.type === "presupuesto_superado" && (i.status === "open" || i.status === "notified")
  );

  if (over && !existing) {
    const incident: Incident = {
      id: generateId(),
      projectId,
      revisionId,
      type: "presupuesto_superado",
      status: "open",
      description: `Se ha superado el presupuesto máximo de compra. Importe estimado: ${total.toLocaleString("es-ES")} EUR. Límite: ${limit.toLocaleString("es-ES")} EUR.`,
      estimatedTotal: total,
      budgetLimit: limit,
      requesterEmail: options?.requesterEmail,
      n1FactoryName: options?.n1FactoryName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    createIncident(incident);
    return { exceeds: true, total, limit, incidentId: incident.id };
  }

  if (over && existing) {
    return { exceeds: true, total, limit, incidentId: existing.id };
  }

  return { exceeds: false, total, limit };
}
