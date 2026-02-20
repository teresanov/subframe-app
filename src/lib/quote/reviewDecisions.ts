/** Decisiones por línea en revisión de presupuesto (aceptar/rechazar por precio). */
const STORAGE_KEY = "nexus:quote:decisions:v1";

export type LineDecision = "accepted" | "rejected";

type PlanDecisions = Record<string, LineDecision>;
type AllDecisions = Record<string, PlanDecisions>;

function load(): AllDecisions {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as AllDecisions;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function save(data: AllDecisions): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Devuelve todas las decisiones por línea para un planId. */
export function getLineDecisions(planId: string): PlanDecisions {
  const all = load();
  return all[planId] ?? {};
}

/** Establece la decisión de una línea. */
export function setLineDecision(planId: string, lineId: string, status: LineDecision): void {
  const all = load();
  if (!all[planId]) all[planId] = {};
  all[planId][lineId] = status;
  save(all);
}

/** Indica si una línea está aceptada. Si no hay decisión guardada, se considera aceptada (compatibilidad). */
export function isLineAccepted(planId: string, lineId: string): boolean {
  const decisions = getLineDecisions(planId);
  const status = decisions[lineId];
  return status !== "rejected";
}

/** Devuelve los IDs de las líneas aceptadas para un planId (no rechazadas). Si no hay decisiones, todas se consideran aceptadas. */
export function getAcceptedLineIds(planId: string): Set<string> {
  const decisions = getLineDecisions(planId);
  const accepted = new Set<string>();
  for (const [lineId, status] of Object.entries(decisions)) {
    if (status !== "rejected") accepted.add(lineId);
  }
  return accepted;
}

/** Devuelve los IDs de las líneas rechazadas para un planId. */
export function getRejectedLineIds(planId: string): string[] {
  const decisions = getLineDecisions(planId);
  return Object.entries(decisions)
    .filter(([, status]) => status === "rejected")
    .map(([lineId]) => lineId);
}

/** Establece múltiples decisiones para un plan. */
export function setLineDecisions(planId: string, decisions: PlanDecisions): void {
  const all = load();
  all[planId] = { ...decisions };
  save(all);
}
