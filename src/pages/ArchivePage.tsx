"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ProyectoNexusSidebar } from "@/components/ProyectoNexusSidebar";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import type { ArchivedOrder } from "@/lib/archive/types";
import { getArchivedOrders, downloadArchivedOrdersAsFile } from "@/lib/archive/storage";
import { FeatherArrowLeft } from "@subframe/core";
import { FeatherDownload } from "@subframe/core";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export function ArchivePage() {
  const [searchParams] = useSearchParams();
  const projectFromUrl = searchParams.get("project") ?? "";
  const [filterProject, setFilterProject] = useState(projectFromUrl);
  const [filterPeticionario, setFilterPeticionario] = useState("");

  useEffect(() => {
    if (projectFromUrl) setFilterProject(projectFromUrl);
  }, [projectFromUrl]);

  const allOrders = useMemo(() => getArchivedOrders(), []);

  const projects = useMemo(
    () => [...new Set(allOrders.map((o) => o.projectId))].sort(),
    [allOrders]
  );

  const peticionarios = useMemo(
    () => [...new Set(allOrders.map((o) => o.peticionario))].sort(),
    [allOrders]
  );

  const filtered = useMemo(() => {
    let list = allOrders;
    if (filterProject) {
      list = list.filter((o) => o.projectId === filterProject);
    }
    if (filterPeticionario) {
      list = list.filter((o) => o.peticionario === filterPeticionario);
    }
    return list;
  }, [allOrders, filterProject, filterPeticionario]);

  const handleDownload = () => {
    if (!filterProject) return;
    downloadArchivedOrdersAsFile(filtered, filterProject);
  };

  return (
    <div className="flex min-h-screen w-full items-start bg-neutral-50">
      <ProyectoNexusSidebar />
      <div className="flex grow shrink-0 basis-0 flex-col items-start self-stretch overflow-auto">
        <div className="flex w-full flex-col gap-6 px-8 py-8">
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-3">
                <Link
                  to="/proyectos"
                  className="flex items-center gap-2 text-body font-body text-subtext-color hover:text-default-font"
                >
                  <FeatherArrowLeft className="h-4 w-4" />
                  Proyectos
                </Link>
              </div>
              <span className="text-heading-2 font-heading-2 text-default-font">
                Archivo de órdenes
              </span>
              <span className="text-body font-body text-subtext-color">
                Histórico de peticiones y órdenes de compra archivadas
              </span>
            </div>
            <Button
              variant="neutral-secondary"
              size="medium"
              icon={<FeatherDownload />}
              onClick={handleDownload}
              disabled={!filterProject}
              title={filterProject ? `Descargar órdenes de ${filterProject}` : "Selecciona un proyecto para descargar"}
            >
              {filterProject ? `Descargar archivo de ${filterProject}` : "Descargar por proyecto (selecciona uno)"}
            </Button>
          </div>

          <div className="flex w-full items-center gap-4">
            <select
              className="rounded-md border border-neutral-border bg-default-background px-3 py-2 text-body font-body text-default-font"
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
            >
              <option value="">Todos los proyectos</option>
              {projects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              className="rounded-md border border-neutral-border bg-default-background px-3 py-2 text-body font-body text-default-font"
              value={filterPeticionario}
              onChange={(e) => setFilterPeticionario(e.target.value)}
            >
              <option value="">Todos los peticionarios</option>
              {peticionarios.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <span className="text-caption font-caption text-subtext-color">
              {filtered.length} órdenes
            </span>
          </div>
          <span className="text-caption font-caption text-subtext-color -mt-4">
            {filterProject
              ? "Mostrando las últimas órdenes del proyecto seleccionado. Puedes descargar el archivo completo de este proyecto (todas sus órdenes archivadas) en formato JSON."
              : "Selecciona un proyecto para ver sus órdenes y descargar el archivo completo del mismo."}
          </span>
          <div className="flex w-full flex-col gap-2 rounded-lg border border-solid border-neutral-border bg-white overflow-hidden">
            <div className="flex w-full items-center gap-4 px-6 py-4 border-b border-neutral-border bg-neutral-50">
              <span className="w-24 text-caption-bold text-subtext-color">Proyecto</span>
              <span className="w-20 text-caption-bold text-subtext-color">Revisión</span>
              <span className="w-44 text-caption-bold text-subtext-color">Peticionario</span>
              <span className="w-44 text-caption-bold text-subtext-color">Proveedor</span>
              <span className="w-28 text-caption-bold text-subtext-color">Fecha envío</span>
              <span className="w-24 text-caption-bold text-subtext-color">Estado</span>
            </div>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                <span className="text-body font-body text-subtext-color">
                  No hay órdenes archivadas con los filtros aplicados.
                </span>
              </div>
            ) : (
              filtered.map((order: ArchivedOrder) => (
                <div
                  key={order.id}
                  className="flex w-full items-center gap-4 px-6 py-4 border-b border-neutral-border last:border-b-0 hover:bg-neutral-50"
                >
                  <span className="w-24 text-body font-body text-default-font">
                    {order.projectId}
                  </span>
                  <span className="w-20 text-body font-body text-default-font">
                    {order.revisionId}
                  </span>
                  <span className="w-44 text-body font-body text-default-font truncate">
                    {order.peticionario}
                  </span>
                  <span className="w-44 text-body font-body text-default-font truncate">
                    {order.supplierName}
                  </span>
                  <span className="w-28 text-body font-body text-subtext-color">
                    {formatDate(order.sentAt)}
                  </span>
                  <span className="w-24">
                    <Badge variant="purple">Archivada</Badge>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArchivePage;
