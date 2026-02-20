import type { Draft, DraftType } from "./types";

const STORAGE_KEY = "nexus:drafts:v1";

function loadAll(): Draft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as (Draft & { type?: Draft["type"] })[];
    const list = Array.isArray(parsed) ? parsed : [];
    return list.map((d) => ({ ...d, type: (d.type ?? "po") as DraftType }));
  } catch {
    return [];
  }
}

function saveAll(drafts: Draft[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export function getAllDrafts(): Draft[] {
  return loadAll();
}

export function getDraftsByRevision(projectId: string, revisionId: string): Draft[] {
  return loadAll().filter(
    (d) => d.projectId === projectId && d.revisionId === revisionId
  );
}

/** Solo borradores pendientes (status === "draft"). */
export function getPendingDrafts(): Draft[] {
  return loadAll().filter((d) => d.status === "draft");
}

/** Solo borradores pendientes de una revisión. */
export function getPendingDraftsByRevision(projectId: string, revisionId: string): Draft[] {
  return loadAll().filter(
    (d) => d.status === "draft" && d.projectId === projectId && d.revisionId === revisionId
  );
}

/** Borradores ya enviados (RFQ o PO). */
export function getSentDrafts(): Draft[] {
  return loadAll().filter((d) => d.status === "sent");
}

/** Solo POs enviados (para En tránsito). */
export function getSentPoDrafts(): Draft[] {
  return loadAll().filter((d) => d.status === "sent" && d.type === "po");
}

/** Solo RFQ enviados (para Plan de compra - Pendientes de respuesta). */
export function getSentRfqDrafts(): Draft[] {
  return loadAll().filter((d) => d.status === "sent" && d.type === "rfq");
}

export function getDraftById(draftId: string): Draft | null {
  return loadAll().find((d) => d.id === draftId) ?? null;
}

export function saveDraft(draft: Draft): void {
  const list = loadAll();
  const idx = list.findIndex((d) => d.id === draft.id);
  const updated = { ...draft, updatedAt: new Date().toISOString() };
  if (idx >= 0) {
    list[idx] = updated;
  } else {
    list.push(updated);
  }
  saveAll(list);
}

export function saveDrafts(drafts: Draft[]): void {
  const existing = loadAll();
  const ids = new Set(drafts.map((d) => d.id));
  const kept = existing.filter((d) => !ids.has(d.id));
  const now = new Date().toISOString();
  const toSave = drafts.map((d) => ({ ...d, updatedAt: now }));
  saveAll([...kept, ...toSave]);
}

export function deleteDraft(draftId: string): void {
  saveAll(loadAll().filter((d) => d.id !== draftId));
}

/** Vacía todos los borradores (útil para desarrollo/pruebas). */
export function clearAllDrafts(): void {
  saveAll([]);
}

/** Elimina solo borradores pendientes; los enviados permanecen en En tránsito. */
export function clearPendingDrafts(): void {
  saveAll(loadAll().filter((d) => d.status === "sent"));
}
