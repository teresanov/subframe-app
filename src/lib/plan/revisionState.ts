/** IDs de planes que ya han sido revisados (aceptado presupuesto o homologadas sustituciones). */
const STORAGE_KEY = "nexus:plan:revisado:v1";

function loadRevisados(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveRevisados(set: Set<string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export function isPlanRevisado(planId: string): boolean {
  return loadRevisados().has(planId);
}

export function markPlanRevisado(planId: string): void {
  const set = loadRevisados();
  set.add(planId);
  saveRevisados(set);
}
