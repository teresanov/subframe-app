import type { Incident } from "./types";

const STORAGE_KEY = "nexus:incidents:v1";

function loadAll(): Incident[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Incident[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAll(incidents: Incident[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
}

export function getIncidentsByRevision(projectId: string, revisionId: string): Incident[] {
  return loadAll().filter(
    (i) => i.projectId === projectId && i.revisionId === revisionId
  );
}

export function getOpenIncidentsByRevision(projectId: string, revisionId: string): Incident[] {
  return getIncidentsByRevision(projectId, revisionId).filter(
    (i) => i.status === "open" || i.status === "notified"
  );
}

export function getIncidentById(incidentId: string): Incident | null {
  return loadAll().find((i) => i.id === incidentId) ?? null;
}

export function createIncident(incident: Incident): void {
  const list = loadAll();
  list.push({ ...incident, updatedAt: new Date().toISOString() });
  saveAll(list);
}

export function updateIncident(incident: Incident): void {
  const list = loadAll();
  const idx = list.findIndex((i) => i.id === incident.id);
  const updated = { ...incident, updatedAt: new Date().toISOString() };
  if (idx >= 0) {
    list[idx] = updated;
  } else {
    list.push(updated);
  }
  saveAll(list);
}

export function resolveIncident(incidentId: string): void {
  const incident = getIncidentById(incidentId);
  if (incident) {
    updateIncident({ ...incident, status: "resolved" });
  }
}
