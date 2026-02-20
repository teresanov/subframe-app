"use client";

import React, { useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { ProyectoNexusSidebar } from "@/components/ProyectoNexusSidebar";
import type { Draft } from "@/lib/drafts/types";
import { getSentRfqDrafts } from "@/lib/drafts/storage";
import { isPlanRevisado } from "@/lib/plan/revisionState";
import { getRejectedLineIds } from "@/lib/quote/reviewDecisions";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { FeatherAlertCircle } from "@subframe/core";

export type OpenPlanType = "presupuesto_pendiente" | "sustituciones_pendientes" | "sin_incidencias";

export interface OpenPlan {
  id: string;
  projectId: string;
  revisionId: string;
  supplierId: string;
  supplierName: string;
  type: OpenPlanType;
  hasIncident: boolean;
  /** Fecha envío RFQ (solo para presupuesto_pendiente) */
  rfqSentAt?: string;
}

/** Presupuestos recibidos: sin_incidencias, sustituciones_pendientes */
const MOCK_RECIBIDOS: OpenPlan[] = [
  { id: "op-1", projectId: "PRJ-2847", revisionId: "Rev04", supplierId: "sup-acme", supplierName: "Acme Steel Co.", type: "sin_incidencias", hasIncident: false },
  { id: "op-2", projectId: "PRJ-2847", revisionId: "Rev04", supplierId: "sup-electro", supplierName: "ElectroComponents SA", type: "sustituciones_pendientes", hasIncident: true },
  { id: "op-3", projectId: "PRJ-2847", revisionId: "Rev04", supplierId: "sup-fastbolts", supplierName: "FastBolts Inc.", type: "sin_incidencias", hasIncident: false },
  { id: "op-4", projectId: "PRJ-2999", revisionId: "Rev01", supplierId: "sup-acme", supplierName: "Acme Steel Co.", type: "sin_incidencias", hasIncident: false },
  { id: "op-5", projectId: "PRJ-2999", revisionId: "Rev01", supplierId: "sup-metales", supplierName: "Metales y Aleaciones", type: "sin_incidencias", hasIncident: false },
  // Presupuestos del Inbox (email presupuesto_proveedor) → visibles en Plan de compra
  { id: "op-6", projectId: "PRJ-2845", revisionId: "Rev01", supplierId: "sup-roberto-campos", supplierName: "Componentes Industriales", type: "sin_incidencias", hasIncident: false },
  { id: "op-7", projectId: "PRJ-2840", revisionId: "Rev05", supplierId: "sup-carlos-fernandez", supplierName: "Suministros Beta", type: "sin_incidencias", hasIncident: false },
  // Incidencia del Inbox (email incidencia_proveedor)
  { id: "op-8", projectId: "PRJ-2842", revisionId: "Rev01", supplierId: "sup-maria-rodriguez", supplierName: "Piezas y Suministros", type: "sustituciones_pendientes", hasIncident: true },
];

/** Pendientes de respuesta: RFQ enviado, esperando presupuesto */
const MOCK_PENDIENTES: OpenPlan[] = [
  { id: "op-p1", projectId: "PRJ-2847", revisionId: "Rev04", supplierId: "sup-pinturas", supplierName: "Pinturas del Norte", type: "presupuesto_pendiente", hasIncident: false, rfqSentAt: "2025-02-15T10:30:00" },
  { id: "op-p2", projectId: "PRJ-2847", revisionId: "Rev04", supplierId: "sup-sellados", supplierName: "Sellados Industriales", type: "presupuesto_pendiente", hasIncident: false, rfqSentAt: "2025-02-16T09:15:00" },
  { id: "op-p3", projectId: "PRJ-2999", revisionId: "Rev01", supplierId: "sup-electro", supplierName: "ElectroComponents SA", type: "presupuesto_pendiente", hasIncident: false, rfqSentAt: "2025-02-14T14:00:00" },
];

const MOCK_OPEN_PLANS = [...MOCK_RECIBIDOS, ...MOCK_PENDIENTES];

function typeLabel(t: OpenPlanType): string {
  switch (t) {
    case "presupuesto_pendiente": return "Pendiente";
    case "sustituciones_pendientes": return "Sustituciones pendientes";
    case "sin_incidencias": return "Sin incidencias";
    default: return t;
  }
}

function formatRfqDate(iso?: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

function typeBadgeVariant(t: OpenPlanType): "neutral" | "brand" | "warning" | "success" {
  switch (t) {
    case "presupuesto_pendiente": return "neutral";
    case "sustituciones_pendientes": return "warning";
    case "sin_incidencias": return "success";
    default: return "neutral";
  }
}

function isRecibido(plan: OpenPlan): boolean {
  return plan.type === "sin_incidencias" || plan.type === "sustituciones_pendientes";
}

function draftToOpenPlan(d: Draft): OpenPlan {
  return {
    id: "op-rfq-" + d.id,
    projectId: d.projectId,
    revisionId: d.revisionId,
    supplierId: d.supplierId,
    supplierName: d.supplierName,
    type: "presupuesto_pendiente",
    hasIncident: false,
    rfqSentAt: d.updatedAt,
  };
}

export function PurchasePlanPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const projectFromUrl = searchParams.get("project") ?? "";
  const [filterProject, setFilterProject] = useState(projectFromUrl);
  const [filterType, setFilterType] = useState<OpenPlanType | "">("");

  React.useEffect(() => {
    if (projectFromUrl) setFilterProject(projectFromUrl);
  }, [projectFromUrl]);

  const filtered = useMemo(() => {
    let list = MOCK_OPEN_PLANS;
    if (filterProject) {
      list = list.filter((p) => p.projectId === filterProject);
    }
    if (filterType) {
      list = list.filter((p) => p.type === filterType);
    }
    return list;
  }, [filterProject, filterType]);

  const recibidos = useMemo(() => filtered.filter(isRecibido), [filtered]);

  const pendientes = useMemo(() => {
    const sentRfqs = getSentRfqDrafts().map(draftToOpenPlan);
    const base = [...sentRfqs, ...MOCK_PENDIENTES];
    let list = base;
    if (filterProject) list = list.filter((p) => p.projectId === filterProject);
    if (filterType) list = list.filter((p) => p.type === filterType);
    return list;
  }, [filterProject, filterType, location.key]);

  const plansWithRejectedLines = useMemo(() => {
    return recibidos
      .filter((plan) => isPlanRevisado(plan.id))
      .map((plan) => {
        const rejected = getRejectedLineIds(plan.id);
        return { ...plan, rejectedLineIds: rejected };
      })
      .filter((p) => p.rejectedLineIds.length > 0);
  }, [recibidos]);

  const projects = useMemo(() => [...new Set(MOCK_OPEN_PLANS.map((p) => p.projectId))], []);

  return (
    <div className="flex min-h-screen w-full items-start bg-neutral-50">
      <ProyectoNexusSidebar />
      <div className="flex grow shrink-0 basis-0 flex-col items-start self-stretch overflow-auto">
        <div className="flex w-full flex-col items-start gap-6 px-8 py-8">
          <div className="flex w-full items-center justify-between">
            <span className="text-heading-2 font-heading-2 text-default-font">
              Plan de compra
            </span>
            <span className="text-body font-body text-subtext-color">
              Revisión, cambios y aprobación de órdenes abiertas
            </span>
          </div>
          <div className="flex w-full items-center gap-4">
            <select
              className="rounded-md border border-neutral-border px-3 py-2 text-body font-body text-default-font bg-default-background"
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
            >
              <option value="">Todos los proyectos</option>
              {projects.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              className="rounded-md border border-neutral-border px-3 py-2 text-body font-body text-default-font bg-default-background"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as OpenPlanType | "")}
            >
              <option value="">Todos los tipos</option>
              <option value="sustituciones_pendientes">Sustituciones pendientes</option>
              <option value="sin_incidencias">Sin incidencias</option>
              <option value="presupuesto_pendiente">Pendiente de respuesta</option>
            </select>
            <span className="text-caption font-caption text-subtext-color">
              {filtered.length} órdenes
            </span>
          </div>

          {/* --- Presupuestos recibidos --- */}
          <div className="flex w-full flex-col gap-3">
            <h3 className="text-heading-3 font-heading-3 text-default-font">
              Presupuestos recibidos
            </h3>
            <div className="flex w-full flex-col gap-2 rounded-lg border border-solid border-neutral-border bg-white overflow-hidden">
              <div className="flex w-full items-center gap-4 px-6 py-4 border-b border-neutral-border bg-neutral-50">
                <span className="w-24 text-caption-bold text-subtext-color">Proyecto</span>
                <span className="w-20 text-caption-bold text-subtext-color">Revisión</span>
                <span className="w-44 text-caption-bold text-subtext-color">Proveedor</span>
                <span className="w-48 text-caption-bold text-subtext-color">Tipo</span>
                <span className="w-28 text-caption-bold text-subtext-color">Incidencias</span>
                <span className="flex-1 text-caption-bold text-subtext-color">Acciones</span>
              </div>
              {recibidos.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 px-6 py-8 text-center">
                  <span className="text-body font-body text-subtext-color">
                    No hay presupuestos recibidos con los filtros aplicados.
                  </span>
                </div>
              ) : (
                recibidos.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex w-full items-center gap-4 px-6 py-4 border-b border-neutral-border last:border-b-0 hover:bg-neutral-50"
                  >
                    <span className="w-24 text-body font-body text-default-font">{plan.projectId}</span>
                    <span className="w-20 text-body font-body text-default-font">{plan.revisionId}</span>
                    <span className="w-44 text-body font-body text-default-font">{plan.supplierName}</span>
                    <span className="w-48">
                      <Badge variant={typeBadgeVariant(plan.type)}>
                        {typeLabel(plan.type)}
                      </Badge>
                    </span>
                    <span className="w-28">
                      {plan.hasIncident ? (
                        <Badge variant="error" icon={<FeatherAlertCircle />}>Incidencia</Badge>
                      ) : (
                        <span className="text-caption text-subtext-color">—</span>
                      )}
                    </span>
                    <div className="flex flex-1 items-center gap-2">
                      {(plan.type === "sustituciones_pendientes" || plan.type === "sin_incidencias") && (
                        isPlanRevisado(plan.id) ? (
                          <Link
                            to={`/orden/nueva/${plan.projectId}/${plan.revisionId}?supplier=${encodeURIComponent(plan.supplierId)}&planId=${encodeURIComponent(plan.id)}`}
                            className="inline-block"
                          >
                            <Button variant="brand-primary" size="small">
                              Crear pedido
                            </Button>
                          </Link>
                        ) : (
                          <Link
                            to={`/presupuestos/${plan.projectId}/${plan.revisionId}?planId=${encodeURIComponent(plan.id)}&supplier=${encodeURIComponent(plan.supplierId)}`}
                            className="inline-block"
                          >
                            <Button variant="neutral-secondary" size="small">
                              Revisar
                            </Button>
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* --- Líneas rechazadas: pedir presupuesto a otro proveedor --- */}
          {plansWithRejectedLines.length > 0 && (
            <div className="flex w-full flex-col gap-3 pt-2 border-t border-neutral-border">
              <h3 className="text-heading-3 font-heading-3 text-default-font">
                Líneas rechazadas
              </h3>
              <p className="text-body text-subtext-color">
                Hay líneas rechazadas por precio. Puedes pedir presupuesto a otro proveedor.
              </p>
              <div className="flex flex-col gap-2 rounded-lg border border-solid border-neutral-border bg-white overflow-hidden">
                {plansWithRejectedLines.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex w-full items-center gap-4 px-6 py-4 border-b border-neutral-border last:border-b-0 hover:bg-neutral-50"
                  >
                    <span className="w-24 text-body font-body text-default-font">{plan.projectId}</span>
                    <span className="w-20 text-body font-body text-default-font">{plan.revisionId}</span>
                    <span className="w-44 text-body font-body text-default-font">{plan.supplierName}</span>
                    <span className="text-caption text-subtext-color">
                      Líneas {plan.rejectedLineIds.join(", ")}
                    </span>
                    <Link
                      to={`/orden/nueva/${plan.projectId}/${plan.revisionId}?rejectedLines=${encodeURIComponent(plan.rejectedLineIds.join(","))}&planId=${encodeURIComponent(plan.id)}`}
                      className="ml-auto"
                    >
                      <Button variant="neutral-secondary" size="small">
                        Pedir presupuesto a otro proveedor
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- Pendientes de respuesta --- */}
          <div className="flex w-full flex-col gap-3 pt-2 border-t border-neutral-border">
            <h3 className="text-heading-3 font-heading-3 text-default-font">
              Pendientes de respuesta
            </h3>
            <div className="flex w-full flex-col gap-2 rounded-lg border border-solid border-neutral-border bg-white overflow-hidden">
              <div className="flex w-full items-center gap-4 px-6 py-4 border-b border-neutral-border bg-neutral-50">
                <span className="w-24 text-caption-bold text-subtext-color">Proyecto</span>
                <span className="w-20 text-caption-bold text-subtext-color">Revisión</span>
                <span className="w-44 text-caption-bold text-subtext-color">Proveedor</span>
                <span className="w-40 text-caption-bold text-subtext-color">Fecha envío RFQ</span>
                <span className="flex-1 text-caption-bold text-subtext-color">Estado</span>
              </div>
              {pendientes.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 px-6 py-8 text-center">
                  <span className="text-body font-body text-subtext-color">
                    No hay órdenes pendientes de respuesta con los filtros aplicados.
                  </span>
                </div>
              ) : (
                pendientes.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex w-full items-center gap-4 px-6 py-4 border-b border-neutral-border last:border-b-0 hover:bg-neutral-50"
                  >
                    <span className="w-24 text-body font-body text-default-font">{plan.projectId}</span>
                    <span className="w-20 text-body font-body text-default-font">{plan.revisionId}</span>
                    <span className="w-44 text-body font-body text-default-font">{plan.supplierName}</span>
                    <span className="w-40 text-body font-body text-default-font">{formatRfqDate(plan.rfqSentAt)}</span>
                    <span className="flex-1 text-caption text-subtext-color">
                      Esperando respuesta
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PurchasePlanPage;
