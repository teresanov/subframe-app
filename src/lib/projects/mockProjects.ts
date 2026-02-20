export interface ProjectRevision {
  projectId: string;
  revisionId: string;
  projectName?: string;
  baselineRevisionId?: string;
  lineCount: number;
  status: "active" | "blocked" | "complete";
}

/** Proyectos y revisiones mock para la biblioteca. */
export const MOCK_PROJECTS: ProjectRevision[] = [
  { projectId: "PRJ-2847", revisionId: "Rev04", projectName: "Proyecto Delta T3", baselineRevisionId: "Rev03", lineCount: 342, status: "active" },
  { projectId: "PRJ-2999", revisionId: "Rev01", projectName: "Pedido pequeño", baselineRevisionId: undefined, lineCount: 3, status: "active" },
  { projectId: "PRJ-2846", revisionId: "Rev02", projectName: "Componentes electrónicos", baselineRevisionId: "Rev01", lineCount: 28, status: "active" },
  { projectId: "PRJ-2845", revisionId: "Rev01", projectName: "Especificaciones revisadas", baselineRevisionId: undefined, lineCount: 15, status: "complete" },
];
