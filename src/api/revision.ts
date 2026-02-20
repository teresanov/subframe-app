import type { BomLine } from "@/pages/RevisionBomPage.data";
import { getBomLinesForRevision } from "@/pages/RevisionBomPage.data";

const getBaseUrl = () => import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

export interface RevisionBomResponse {
  lines: BomLine[];
}

/**
 * Carga las líneas BOM de una revisión desde el servidor.
 * Si VITE_API_URL no está definida o la petición falla, devuelve datos locales (fallback).
 */
export async function fetchRevisionBom(
  projectId: string,
  revisionId: string
): Promise<BomLine[]> {
  const base = getBaseUrl();
  if (!base) {
    return Promise.resolve(getBomLinesForRevision(projectId, revisionId));
  }

  const url = `${base}/api/projects/${encodeURIComponent(projectId)}/revisions/${encodeURIComponent(revisionId)}/bom`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data: RevisionBomResponse = await res.json();
    if (!Array.isArray(data?.lines)) {
      throw new Error("Formato de respuesta inválido");
    }
    return data.lines;
  } catch {
    return getBomLinesForRevision(projectId, revisionId);
  }
}
