import type { ArchivedOrder } from "./types";
import { MOCK_INBOX_EMAILS } from "@/lib/inbox/mockEmails";
import { MOCK_PROJECTS } from "@/lib/projects/mockProjects";
import { getSentPoDrafts } from "@/lib/drafts/storage";
import { getTransitState } from "@/lib/transit/storage";

/** Mapeo projectId+revisionId → peticionario (requester) desde inbox peticiones de compra. */
function getPeticionarioMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const e of MOCK_INBOX_EMAILS) {
    if (e.emailType === "peticion_compra") {
      map[`${e.projectId}/${e.revisionId}`] = e.senderName;
    }
  }
  return map;
}

/** Mapeo projectId+revisionId → projectName. */
function getProjectNameMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const p of MOCK_PROJECTS) {
    map[`${p.projectId}/${p.revisionId}`] = p.projectName ?? p.projectId;
  }
  return map;
}

const PETICIONARIO_MAP = getPeticionarioMap();
const PROJECT_NAME_MAP = getProjectNameMap();

function getPeticionario(projectId: string, revisionId: string): string {
  return PETICIONARIO_MAP[`${projectId}/${revisionId}`] ?? "Dep. Producción";
}

function getProjectName(projectId: string, revisionId: string): string | undefined {
  return PROJECT_NAME_MAP[`${projectId}/${revisionId}`];
}

/** Mock de órdenes históricas (además de las archivadas en transit). */
const MOCK_HISTORICAL_ORDERS: Omit<ArchivedOrder, "projectName">[] = [
  { id: "ord-h1", projectId: "PRJ-2847", revisionId: "Rev03", supplierName: "Acme Steel Co.", peticionario: "Jorge Martínez", sentAt: "2025-01-12", deliveredAt: "2025-01-28", status: "archivada" },
  { id: "ord-h2", projectId: "PRJ-2847", revisionId: "Rev03", supplierName: "ElectroComponents SA", peticionario: "Jorge Martínez", sentAt: "2025-01-13", deliveredAt: "2025-01-30", status: "archivada" },
  { id: "ord-h3", projectId: "PRJ-2846", revisionId: "Rev01", supplierName: "Metales y Aleaciones", peticionario: "Luis García", sentAt: "2025-01-08", deliveredAt: "2025-01-22", status: "archivada" },
  { id: "ord-h4", projectId: "PRJ-2845", revisionId: "Rev01", supplierName: "Componentes Industriales", peticionario: "Dep. Compras", sentAt: "2025-01-20", deliveredAt: "2025-02-05", status: "archivada" },
  { id: "ord-h5", projectId: "PRJ-2840", revisionId: "Rev04", supplierName: "Suministros Beta", peticionario: "Carlos Fernández", sentAt: "2025-01-15", deliveredAt: "2025-02-01", status: "archivada" },
  { id: "ord-h6", projectId: "PRJ-2847", revisionId: "Rev04", supplierName: "Pinturas del Norte", peticionario: "Jorge Martínez", sentAt: "2025-02-01", deliveredAt: "2025-02-14", status: "archivada" },
  { id: "ord-h7", projectId: "PRJ-2999", revisionId: "Rev01", supplierName: "FastBolts Inc.", peticionario: "Ana Suárez", sentAt: "2025-02-02", deliveredAt: "2025-02-12", status: "archivada" },
  { id: "ord-h8", projectId: "PRJ-2843", revisionId: "Rev02", supplierName: "Luis García Materiales", peticionario: "Luis García", sentAt: "2025-01-25", deliveredAt: "2025-02-08", status: "archivada" },
  { id: "ord-h9", projectId: "PRJ-2846", revisionId: "Rev02", supplierName: "ElectroComponents SA", peticionario: "Luis García", sentAt: "2025-02-05", deliveredAt: "2025-02-16", status: "archivada" },
  { id: "ord-h10", projectId: "PRJ-2847", revisionId: "Rev04", supplierName: "Sellados Industriales", peticionario: "Jorge Martínez", sentAt: "2025-02-03", deliveredAt: "2025-02-15", status: "archivada" },
];

function transitOrderToArchived(
  order: { id: string; projectId: string; revisionId: string; supplierName: string; sentAt: string },
  deliveredAt?: string
): ArchivedOrder {
  const key = `${order.projectId}/${order.revisionId}`;
  return {
    ...order,
    projectName: getProjectName(order.projectId, order.revisionId),
    peticionario: getPeticionario(order.projectId, order.revisionId),
    deliveredAt: deliveredAt ?? order.sentAt,
    status: "archivada",
  };
}

/** Obtiene todas las órdenes archivadas (transit archivadas + mock histórico). Ordenadas por sentAt descendente. */
export function getArchivedOrders(): ArchivedOrder[] {
  const seen = new Set<string>();
  const result: ArchivedOrder[] = [];

  const sentDrafts = getSentPoDrafts();
  const transitOrderIds = new Set(sentDrafts.map((d) => d.id));

  const MOCK_TRANSIT_IDS = ["ord-1", "ord-2", "ord-3", "ord-4", "ord-5"];
  const MOCK_TRANSIT: { id: string; projectId: string; revisionId: string; supplierName: string; sentAt: string }[] = [
    { id: "ord-1", projectId: "PRJ-2847", revisionId: "Rev04", supplierName: "Acme Steel Co.", sentAt: "2025-02-15" },
    { id: "ord-2", projectId: "PRJ-2847", revisionId: "Rev04", supplierName: "ElectroComponents SA", sentAt: "2025-02-16" },
    { id: "ord-3", projectId: "PRJ-2999", revisionId: "Rev01", supplierName: "FastBolts Inc.", sentAt: "2025-02-10" },
    { id: "ord-4", projectId: "PRJ-2847", revisionId: "Rev04", supplierName: "Pinturas del Norte", sentAt: "2025-02-17" },
    { id: "ord-5", projectId: "PRJ-2999", revisionId: "Rev01", supplierName: "Metales y Aleaciones", sentAt: "2025-02-08" },
  ];

  for (const d of sentDrafts) {
    const stored = getTransitState(d.id);
    if (stored?.archived) {
      const sentDate = d.updatedAt.slice(0, 10);
      const archived = transitOrderToArchived(
        { id: d.id, projectId: d.projectId, revisionId: d.revisionId, supplierName: d.supplierName, sentAt: sentDate },
        sentDate
      );
      if (!seen.has(archived.id)) {
        seen.add(archived.id);
        result.push(archived);
      }
    }
  }

  for (const m of MOCK_TRANSIT) {
    if (transitOrderIds.has(m.id)) continue;
    const stored = getTransitState(m.id);
    if (stored?.archived) {
      const archived = transitOrderToArchived(m, m.sentAt);
      if (!seen.has(archived.id)) {
        seen.add(archived.id);
        result.push(archived);
      }
    }
  }

  for (const h of MOCK_HISTORICAL_ORDERS) {
    if (seen.has(h.id)) continue;
    seen.add(h.id);
    result.push({
      ...h,
      projectName: getProjectName(h.projectId, h.revisionId),
    });
  }

  result.sort((a, b) => (b.sentAt > a.sentAt ? 1 : b.sentAt < a.sentAt ? -1 : 0));
  return result;
}

/** Descarga órdenes archivadas como archivo JSON. Si projectId está definido, el nombre incluye el proyecto. */
export function downloadArchivedOrdersAsFile(orders: ArchivedOrder[], projectId?: string): void {
  const json = JSON.stringify(orders, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const date = new Date().toISOString().slice(0, 10);
  a.download = projectId
    ? `archivo_ordenes_${projectId}_${date}.json`
    : `archivo_ordenes_${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
