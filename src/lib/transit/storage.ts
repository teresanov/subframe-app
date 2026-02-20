/** Estado de una orden en tránsito (mock, sin actualizaciones en tiempo real). */
export type TransitOrderStatus = "enviada" | "confirmada" | "en_transito" | "entregada" | "cancelada";

export interface TransitOrderState {
  status?: TransitOrderStatus;
  archived?: boolean;
  cancelled?: boolean;
}

const STORAGE_KEY = "nexus:transit:v1";

function load(): Record<string, TransitOrderState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, TransitOrderState>;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function save(data: Record<string, TransitOrderState>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getTransitState(orderId: string): TransitOrderState | null {
  const all = load();
  return all[orderId] ?? null;
}

export function setTransitStatus(orderId: string, status: TransitOrderStatus): void {
  const all = load();
  all[orderId] = { ...all[orderId], status, cancelled: status === "cancelada" ? true : all[orderId]?.cancelled };
  save(all);
}

export function archiveTransitOrder(orderId: string): void {
  const all = load();
  all[orderId] = { ...all[orderId], archived: true };
  save(all);
}

export function cancelTransitOrder(orderId: string): void {
  const all = load();
  all[orderId] = { ...all[orderId], cancelled: true, status: "cancelada" };
  save(all);
}

export function unarchiveTransitOrder(orderId: string): void {
  const all = load();
  all[orderId] = { ...all[orderId], archived: false };
  save(all);
}
