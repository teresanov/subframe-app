"use client";

import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { ProyectoNexusSidebar } from "@/components/ProyectoNexusSidebar";
import { getArchivedOrders } from "@/lib/archive/storage";
import { FeatherCheck } from "@subframe/core";
import { FeatherSearch } from "@subframe/core";
import { MOCK_PROJECTS } from "@/lib/projects/mockProjects";

function statusLabel(s: string): string {
  switch (s) {
    case "active": return "Activo";
    case "blocked": return "Bloqueado";
    case "complete": return "Completado";
    default: return s;
  }
}

function statusVariant(s: string): "neutral" | "success" | "error" | "warning" {
  switch (s) {
    case "active": return "success";
    case "blocked": return "error";
    case "complete": return "neutral";
    default: return "neutral";
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export function ProyectosLibraryPage() {
  const [search, setSearch] = useState("");

  const archivedOrders = useMemo(() => getArchivedOrders(), []);
  const last10Orders = useMemo(() => archivedOrders.slice(0, 10), [archivedOrders]);

  const filtered = search.trim()
    ? MOCK_PROJECTS.filter(
        (p) =>
          p.projectId.toLowerCase().includes(search.toLowerCase()) ||
          (p.projectName?.toLowerCase().includes(search.toLowerCase()))
      )
    : MOCK_PROJECTS;

  return (
    <div className="flex min-h-screen w-full items-start bg-neutral-50">
      <ProyectoNexusSidebar />
      <div className="flex grow shrink-0 basis-0 flex-col items-start self-stretch overflow-auto">
        <div className="flex w-full flex-col gap-6 px-8 py-8">
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col items-start gap-1">
              <span className="text-heading-2 font-heading-2 text-default-font">
                Proyectos BOM
              </span>
              <span className="text-body font-body text-subtext-color">
                Librería de proyectos y revisiones. Haz clic en una fila para ver el BOM.
              </span>
            </div>
          </div>
          <div className="flex w-full items-center gap-4">
            <div className="flex h-10 w-80 items-center gap-2 rounded-md border border-neutral-border bg-default-background px-3">
              <FeatherSearch className="h-4 w-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar proyecto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-body font-body text-default-font placeholder:text-subtext-color focus:outline-none"
              />
            </div>
            <span className="text-caption font-caption text-subtext-color">
              {filtered.length} proyectos
            </span>
          </div>
          <div className="flex w-full flex-col gap-2 rounded-lg border border-solid border-neutral-border bg-white overflow-hidden">
            <div className="flex w-full items-center gap-4 px-6 py-4 border-b border-neutral-border bg-neutral-50">
              <span className="w-28 text-caption-bold text-subtext-color">Proyecto</span>
              <span className="w-24 text-caption-bold text-subtext-color">Revisión</span>
              <span className="w-48 text-caption-bold text-subtext-color">Nombre</span>
              <span className="w-24 text-caption-bold text-subtext-color">Líneas</span>
              <span className="w-28 text-caption-bold text-subtext-color">Baseline</span>
              <span className="w-28 text-caption-bold text-subtext-color">Estado</span>
              <span className="flex-1 text-caption-bold text-subtext-color">Acciones</span>
            </div>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                <span className="text-body font-body text-subtext-color">
                  No hay proyectos que coincidan con la búsqueda.
                </span>
              </div>
            ) : (
              filtered.map((p) => (
                <Link
                  key={`${p.projectId}-${p.revisionId}`}
                  to={`/app/revision/${p.projectId}/${p.revisionId}`}
                  className="flex w-full items-center gap-4 px-6 py-4 border-b border-neutral-border last:border-b-0 hover:bg-neutral-50"
                >
                  <span className="w-28 text-body-bold font-body-bold text-default-font">
                    {p.projectId}
                  </span>
                  <span className="w-24 text-body font-body text-default-font">
                    {p.revisionId}
                  </span>
                  <span className="w-48 text-body font-body text-default-font truncate">
                    {p.projectName ?? "—"}
                  </span>
                  <span className="w-24 text-body font-body text-subtext-color">
                    {p.lineCount}
                  </span>
                  <span className="w-28 text-body font-body text-subtext-color">
                    {p.baselineRevisionId ?? "—"}
                  </span>
                  <span className="w-28">
                    <Badge variant={statusVariant(p.status)} icon={<FeatherCheck />}>
                      {statusLabel(p.status)}
                    </Badge>
                  </span>
                  <div className="flex flex-1 justify-end">
                    <Button variant="neutral-secondary" size="small">
                      Ver revisión
                    </Button>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="flex w-full flex-col gap-4 mt-8">
            <div className="flex w-full items-center justify-between">
              <span className="text-heading-3 font-heading-3 text-default-font">
                Histórico de compras
              </span>
              <Link to="/app/proyectos/archivo">
                <Button variant="neutral-tertiary" size="small">
                  Ver archivo y descargar por proyecto
                </Button>
              </Link>
            </div>
            <div className="flex w-full flex-col gap-2 rounded-lg border border-solid border-neutral-border bg-white overflow-hidden">
              <div className="flex w-full items-center gap-4 px-6 py-4 border-b border-neutral-border bg-neutral-50">
                <span className="w-24 text-caption-bold text-subtext-color">Proyecto</span>
                <span className="w-20 text-caption-bold text-subtext-color">Revisión</span>
                <span className="w-40 text-caption-bold text-subtext-color">Peticionario</span>
                <span className="w-40 text-caption-bold text-subtext-color">Proveedor</span>
                <span className="w-28 text-caption-bold text-subtext-color">Fecha</span>
                <span className="w-24 text-caption-bold text-subtext-color">Estado</span>
              </div>
              {last10Orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 px-6 py-8 text-center">
                  <span className="text-body font-body text-subtext-color">
                    No hay órdenes archivadas. Las órdenes entregadas y archivadas en En tránsito aparecerán aquí.
                  </span>
                </div>
              ) : (
                last10Orders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/proyectos/archivo?project=${encodeURIComponent(order.projectId)}`}
                    className="flex w-full items-center gap-4 px-6 py-4 border-b border-neutral-border last:border-b-0 hover:bg-neutral-50"
                  >
                    <span className="w-24 text-body font-body text-default-font">{order.projectId}</span>
                    <span className="w-20 text-body font-body text-default-font">{order.revisionId}</span>
                    <span className="w-40 text-body font-body text-default-font truncate">{order.peticionario}</span>
                    <span className="w-40 text-body font-body text-default-font truncate">{order.supplierName}</span>
                    <span className="w-28 text-body font-body text-subtext-color">{formatDate(order.sentAt)}</span>
                    <span className="w-24">
                      <Badge variant="purple">Archivada</Badge>
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProyectosLibraryPage;
