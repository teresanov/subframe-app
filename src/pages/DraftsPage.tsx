"use client";

import React, { useCallback, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ProyectoNexusSidebar } from "@/components/ProyectoNexusSidebar";
import type { DemoContext } from "./NexusProcurementDashboard";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { getPendingDrafts, getPendingDraftsByRevision, clearPendingDrafts } from "@/lib/drafts/storage";
import type { Draft } from "@/lib/drafts/types";
import { FeatherArrowLeft } from "@subframe/core";
import { FeatherFileText } from "@subframe/core";

function groupDraftsByRevision(drafts: Draft[]): { key: string; projectId: string; revisionId: string; drafts: Draft[] }[] {
  const map = new Map<string, Draft[]>();
  for (const d of drafts) {
    const key = `${d.projectId}/${d.revisionId}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(d);
  }
  return Array.from(map.entries()).map(([key, list]) => {
    const [projectId, revisionId] = key.split("/");
    return { key, projectId, revisionId, drafts: list };
  });
}

type Props = {
  embedMode?: boolean;
  demoContext?: DemoContext;
  onDraftSelect?: (draftId: string) => void;
};

export function DraftsPage({ embedMode = false, demoContext, onDraftSelect }: Props) {
  const params = useParams<{ projectId?: string; revisionId?: string }>();
  const location = useLocation();
  const projectId = demoContext?.projectId ?? params.projectId;
  const revisionId = demoContext?.revisionId ?? params.revisionId;
  const isFiltered = Boolean(projectId && revisionId);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleClearAll = useCallback(() => {
    if (window.confirm("¿Vaciar todos los borradores pendientes? Los enviados permanecerán en En tránsito.")) {
      clearPendingDrafts();
      setRefreshKey((k) => k + 1);
    }
  }, []);

  // Solo pendientes (status === "draft"); location.key fuerza recarga al volver
  const drafts = React.useMemo(() => {
    if (isFiltered) return getPendingDraftsByRevision(projectId!, revisionId!);
    return getPendingDrafts();
  }, [projectId, revisionId, isFiltered, refreshKey, location.key]);

  const grouped = React.useMemo(
    () => (isFiltered ? null : groupDraftsByRevision(drafts)),
    [isFiltered, drafts]
  );

  return (
    <div className="flex min-h-screen w-full items-start bg-neutral-50">
      {!embedMode && <ProyectoNexusSidebar />}
      <div className="flex grow flex-col self-stretch overflow-auto">
      <div className="flex w-full items-center justify-between border-b border-neutral-border bg-default-background px-8 py-6">
        <div className="flex items-center gap-3">
          {!embedMode && (
            <Link
              to="/app/inbox"
              className="flex items-center gap-2 text-body font-body text-brand-600 hover:underline"
            >
              <FeatherArrowLeft className="h-4 w-4" />
              Volver al Inbox
            </Link>
          )}
          <span className="text-heading-2 font-heading-2 text-default-font">Borradores</span>
          {isFiltered && (
            <>
              <Badge variant="neutral">{projectId} · {revisionId}</Badge>
              {!embedMode && (
                <Link
                  to="/app/borradores"
                  className="text-body font-body text-brand-600 hover:underline"
                >
                  Ver todos los proyectos
                </Link>
              )}
            </>
          )}
        </div>
        {!isFiltered && drafts.length > 0 && (
          <Button variant="neutral-secondary" size="medium" onClick={handleClearAll}>
            Vaciar borradores
          </Button>
        )}
      </div>

      <div className="flex w-full grow flex-col gap-6 px-8 py-8" data-demo-highlight="demo-step4">
        {drafts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-neutral-border bg-default-background py-16">
            <FeatherFileText className="h-12 w-12 text-neutral-300" />
            <span className="text-body font-body text-subtext-color">
              {isFiltered ? "No hay borradores pendientes para esta revisión." : "No hay borradores."}
            </span>
            <p className="text-caption text-subtext-color text-center max-w-md">
              {isFiltered
                ? "Si has enviado órdenes o peticiones, aparecen en En tránsito. Para crear nuevos borradores de presupuesto, ve a la revisión BOM."
                : "Los borradores aparecerán aquí cuando crees peticiones de presupuesto desde la revisión BOM."}
            </p>
            {!embedMode && (
              <div className="flex items-center gap-3">
                <Link to="/app/inbox">
                  <Button variant="brand-primary" size="medium">
                    Ir al Inbox
                  </Button>
                </Link>
                {isFiltered && (
                  <Link to="/app/transito">
                    <Button variant="neutral-secondary" size="medium">
                      Ver En tránsito
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        ) : isFiltered ? (
          <div className="flex flex-col gap-3">
            <span className="text-heading-3 font-heading-3 text-default-font">
              {drafts.length} borrador{drafts.length !== 1 ? "es" : ""}
            </span>
            <div className="flex flex-col gap-2 rounded-lg border border-neutral-border bg-default-background">
              {drafts.map((d) =>
                embedMode ? (
                  <div
                    key={d.id}
                    role="button"
                    tabIndex={0}
                    className="flex w-full cursor-pointer items-center justify-between border-b border-neutral-border px-6 py-4 last:border-b-0 hover:bg-neutral-50"
                    onClick={() => onDraftSelect?.(d.id)}
                    onKeyDown={(e) => e.key === "Enter" && onDraftSelect?.(d.id)}
                  >
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-body-bold font-body-bold text-default-font">{d.supplierName}</span>
                    <span className="text-caption text-subtext-color">{d.supplierEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={d.type === "rfq" ? "brand" : "neutral"}>
                      {d.type === "rfq" ? "RFQ" : "Orden"}
                    </Badge>
                    <Badge variant="neutral">{d.lineItems.length} líneas</Badge>
                  </div>
                </div>
                ) : (
                  <Link
                    key={d.id}
                    to={`/app/borrador/${d.id}`}
                    className="flex w-full items-center justify-between border-b border-neutral-border px-6 py-4 last:border-b-0 hover:bg-neutral-50"
                  >
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-body-bold font-body-bold text-default-font">{d.supplierName}</span>
                      <span className="text-caption text-subtext-color">{d.supplierEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={d.type === "rfq" ? "brand" : "neutral"}>
                        {d.type === "rfq" ? "RFQ" : "Orden"}
                      </Badge>
                      <Badge variant="neutral">{d.lineItems.length} líneas</Badge>
                    </div>
                  </Link>
                )
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <span className="text-heading-3 font-heading-3 text-default-font">
              {drafts.length} borrador{drafts.length !== 1 ? "es" : ""} en total
            </span>
            {grouped?.map(({ key, projectId: pid, revisionId: rid, drafts: list }) => (
              <div key={key} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/app/revision/${pid}/${rid}`}
                    className="text-body-bold font-body-bold text-brand-600 hover:underline"
                  >
                    {pid} · {rid}
                  </Link>
                  <Badge variant="neutral">{list.length} borrador{list.length !== 1 ? "es" : ""}</Badge>
                </div>
                <div className="flex flex-col gap-1 rounded-lg border border-neutral-border bg-default-background">
                  {list.map((d) => (
                    <Link
                      key={d.id}
                      to={`/app/borrador/${d.id}`}
                      className="flex w-full items-center justify-between border-b border-neutral-border px-6 py-4 last:border-b-0 hover:bg-neutral-50"
                    >
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-body-bold font-body-bold text-default-font">{d.supplierName}</span>
                        <span className="text-caption text-subtext-color">{d.supplierEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={d.type === "rfq" ? "brand" : "neutral"}>
                          {d.type === "rfq" ? "RFQ" : "Orden"}
                        </Badge>
                        <Badge variant="neutral">{d.lineItems.length} líneas</Badge>
                        <Badge variant="neutral">{d.status}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

export default DraftsPage;
