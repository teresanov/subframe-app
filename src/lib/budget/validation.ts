import type { BomLine } from "@/pages/RevisionBomPage.data";

/** Presupuesto máximo por petición (EUR). Configurable por proyecto en el futuro. */
export const DEFAULT_BUDGET_LIMIT = 50_000;

/** Límite por proyecto (mock). Si no existe, usa el global. */
const BUDGET_BY_PROJECT: Record<string, number> = {
  "PRJ-2847": 45_000,
  "PRJ-2999": 10_000,
};

/**
 * Calcula el importe estimado total del BOM.
 * Usa unitPrice cuando existe; si no, asume 0 para esa línea.
 */
export function computeEstimatedTotal(lines: BomLine[]): number {
  return lines.reduce((sum, line) => {
    const qty = parseFloat(line.qty) || 0;
    const price = line.unitPrice ?? 0;
    return sum + qty * price;
  }, 0);
}

/**
 * Indica si el importe total supera el límite de presupuesto.
 */
export function exceedsBudget(total: number, limit?: number): boolean {
  const cap = limit ?? DEFAULT_BUDGET_LIMIT;
  return total > cap;
}

/**
 * Devuelve el límite de presupuesto aplicable (por proyecto o global).
 */
export function getBudgetLimit(projectId?: string): number {
  if (projectId && projectId in BUDGET_BY_PROJECT) {
    return BUDGET_BY_PROJECT[projectId];
  }
  return DEFAULT_BUDGET_LIMIT;
}
