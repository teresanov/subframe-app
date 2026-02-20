"use client";

import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { Select } from "@/ui/components/Select";
import { MOCK_SUPPLIERS } from "@/lib/suppliers/mockSuppliers";
import type { HomologationStatus } from "@/lib/homologation/types";
import { markPlanRevisado } from "@/lib/plan/revisionState";
import {
  getLineDecisions,
  setLineDecisions,
  type LineDecision,
} from "@/lib/quote/reviewDecisions";
import { getBomLinesForRevision, type BomLine } from "./RevisionBomPage.data";

interface QuoteSubstitution {
  sapCode: string;
  brand: string;
  status: HomologationStatus;
}

/** Mock: sustituciones propuestas por proveedor (solo líneas con cambios). Precio ofertado opcional (EUR). */
const MOCK_QUOTE_SUBSTITUTIONS: Record<string, Record<string, { sub: QuoteSubstitution; quotedPrice?: number }>> = {
  "PRJ-2847/Rev04/sup-electro": {
    "003": { sub: { sapCode: "SEN-PT100-WIKA", brand: "Wika", status: "pending" }, quotedPrice: 82 },
    "007": { sub: { sapCode: "CONT-25A-SCH", brand: "Schneider", status: "homologated" }, quotedPrice: 115 },
  },
  "PRJ-2999/Rev01/sup-acme": {
    "001": { sub: { sapCode: "CHP-304-ALT", brand: "Acerinox", status: "pending" }, quotedPrice: 11.5 },
  },
  /** Incidencia María Rodríguez (PRJ-2842) - sustituciones en ambas líneas */
  "PRJ-2842/Rev01/sup-maria-rodriguez": {
    "001": { sub: { sapCode: "CHP-304-SUB", brand: "Acerinox Alt", status: "pending" }, quotedPrice: 11.8 },
    "002": { sub: { sapCode: "EMP-EPDM-3", brand: "Flexitech", status: "pending" }, quotedPrice: 3.5 },
  },
};

function getQuoteKey(projectId: string, revisionId: string, supplierId: string): string {
  return `${projectId}/${revisionId}/${supplierId}`;
}

export function SupplierQuotesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planIdFromUrl = searchParams.get("planId") ?? "";
  const supplierFromUrl = searchParams.get("supplier") ?? "";
  const { projectId = "PRJ-2847", revisionId = "Rev04" } = useParams();
  const [homologationUpdates, setHomologationUpdates] = useState<Record<string, HomologationStatus>>({});

  const savedDecisions = useMemo(
    () => (planIdFromUrl ? getLineDecisions(planIdFromUrl) : {}),
    [planIdFromUrl]
  );
  const [lineDecisions, setLineDecisionsState] = useState<Record<string, LineDecision>>(() => savedDecisions);

  React.useEffect(() => {
    setLineDecisionsState(savedDecisions);
  }, [planIdFromUrl, savedDecisions]);

  const setLineDecisionLocal = (lineId: string, status: LineDecision) => {
    setLineDecisionsState((prev) => ({ ...prev, [lineId]: status }));
  };

  const getLineDecision = (lineId: string): LineDecision => {
    return lineDecisions[lineId] ?? "accepted";
  };

  const applyAndGoToPlan = () => {
    if (planIdFromUrl && supplierQuote) {
      const decisions: Record<string, LineDecision> = {};
      for (const line of supplierQuote.lines) {
        const subInfo = quoteSubstitutions[line.lineId];
        const lineKey = `${supplierFromUrl}-${line.lineId}`;
        const homologationStatus = subInfo ? getStatus(lineKey, subInfo.sub) : null;
        // Si la sustitución está rechazada en homologación, la línea cuenta como rechazada para Líneas rechazadas
        const isRejectedByHomologation = homologationStatus === "rejected";
        const existingDecision = getLineDecision(line.lineId);
        decisions[line.lineId] = isRejectedByHomologation || existingDecision === "rejected" ? "rejected" : "accepted";
      }
      setLineDecisions(planIdFromUrl, decisions);
      markPlanRevisado(planIdFromUrl);
    }
    const pid = projectId ?? "PRJ-2847";
    navigate(`/plan?project=${encodeURIComponent(pid)}`);
  };

  const bomLines = useMemo(
    () => getBomLinesForRevision(projectId ?? "PRJ-2847", revisionId ?? "Rev04"),
    [projectId, revisionId]
  );

  const supplierQuote = useMemo(() => {
    if (!supplierFromUrl) return null;
    const supplier = MOCK_SUPPLIERS.find((s) => s.id === supplierFromUrl);
    if (!supplier) return null;
    const lines = bomLines.filter((l) => l.supplierId === supplierFromUrl);
    if (lines.length === 0) return null;
    return { supplier, lines };
  }, [supplierFromUrl, bomLines]);

  const quoteSubstitutions = useMemo(() => {
    const pid = projectId ?? "PRJ-2847";
    const rid = revisionId ?? "Rev04";
    const key = getQuoteKey(pid, rid, supplierFromUrl);
    return MOCK_QUOTE_SUBSTITUTIONS[key] ?? {};
  }, [projectId, revisionId, supplierFromUrl]);

  const hasIncidents = Object.keys(quoteSubstitutions).length > 0;

  const getStatus = (lineKey: string, sub?: { status: HomologationStatus }): HomologationStatus => {
    return homologationUpdates[lineKey] ?? sub?.status ?? "pending";
  };

  const setStatus = (lineKey: string, status: HomologationStatus) => {
    setHomologationUpdates((prev) => ({ ...prev, [lineKey]: status }));
  };

  if (!supplierFromUrl || !supplierQuote) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-neutral-50">
        <p className="text-body text-subtext-color">Selecciona un proveedor desde el Plan de compra.</p>
        <Link to="/plan" className="text-body font-body text-brand-600 hover:underline">Volver al Plan de compra</Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-neutral-50">
      <div className="flex w-full items-center justify-between border-b border-neutral-border bg-default-background px-8 py-6">
        <div className="flex items-center gap-3">
          <Link to="/plan" className="flex items-center gap-2 text-body font-body text-brand-600 hover:underline">
            Volver al Plan de compra
          </Link>
          <span className="text-heading-2 font-heading-2 text-default-font">
            Presupuestos recibidos
          </span>
          <Badge variant="neutral">{projectId} · {revisionId}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="neutral-secondary" onClick={() => navigate(`/plan?project=${encodeURIComponent(projectId ?? "PRJ-2847")}`)}>
            Volver sin aplicar
          </Button>
          <Button variant="brand-primary" onClick={applyAndGoToPlan}>
            {hasIncidents ? "Aplicar cambios y volver al plan" : "Aceptar presupuesto y volver al plan"}
          </Button>
        </div>
      </div>

      <div className="flex w-full grow flex-col gap-6 px-8 py-8">
        <p className="text-body text-subtext-color">
          {hasIncidents
            ? `Presupuesto de ${supplierQuote.supplier.name} con incidencias. Revisa el listado con precios, homologa o rechaza las sustituciones y acepta para continuar.`
            : `Presupuesto de ${supplierQuote.supplier.name} sin incidencias. Revisa el listado con precios y acepta para continuar.`}
        </p>
        <div className="rounded-lg border border-neutral-border bg-default-background p-6">
          <span className="text-heading-3 font-heading-3 text-default-font block mb-4">
            {supplierQuote.supplier.name}
          </span>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-border">
                  <th className="pb-2 pr-4 text-caption-bold text-subtext-color">Línea</th>
                  <th className="pb-2 pr-4 text-caption-bold text-subtext-color">Código SAP</th>
                  <th className="pb-2 pr-4 text-caption-bold text-subtext-color">Descripción</th>
                  <th className="pb-2 pr-4 text-caption-bold text-subtext-color">Cantidad</th>
                  <th className="pb-2 pr-4 text-caption-bold text-subtext-color">UOM</th>
                  <th className="pb-2 pr-4 text-caption-bold text-subtext-color text-right">Precio unit.</th>
                  <th className="pb-2 pr-4 text-caption-bold text-subtext-color text-right">Total (EUR)</th>
                  <th className="pb-2 text-caption-bold text-subtext-color">Acción</th>
                  {hasIncidents && (
                    <>
                      <th className="pb-2 pr-4 text-caption-bold text-subtext-color">Sustitución propuesta</th>
                      <th className="pb-2 text-caption-bold text-subtext-color">Homologación</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {supplierQuote.lines.map((line: BomLine) => {
                  const qtyNum = parseFloat(line.qty) || 0;
                  const subInfo = quoteSubstitutions[line.lineId];
                  const unitPrice = subInfo?.quotedPrice ?? line.unitPrice ?? 0;
                  const total = qtyNum * unitPrice;
                  const lineKey = `${supplierFromUrl}-${line.lineId}`;
                  const status = subInfo ? getStatus(lineKey, subInfo.sub) : null;
                  const priceDecision = getLineDecision(line.lineId);
                  const isRejected = priceDecision === "rejected";
                  return (
                    <tr
                      key={line.lineId}
                      className={`border-b border-neutral-border hover:bg-neutral-50 ${isRejected ? "bg-neutral-100 opacity-75" : ""}`}
                    >
                      <td className="py-3 pr-4 text-body text-default-font">{line.lineId}</td>
                      <td className={`py-3 pr-4 text-body text-default-font ${isRejected ? "line-through" : ""}`}>{line.sapCode}</td>
                      <td className={`py-3 pr-4 text-body text-default-font ${isRejected ? "line-through" : ""}`}>{line.description}</td>
                      <td className="py-3 pr-4 text-body text-default-font">{line.qty}</td>
                      <td className="py-3 pr-4 text-body text-default-font">{line.uom}</td>
                      <td className="py-3 pr-4 text-body text-default-font text-right">{unitPrice.toFixed(2)} €</td>
                      <td className="py-3 pr-4 text-body text-default-font text-right">{total.toFixed(2)} €</td>
                      <td className="py-3">
                        <Select
                          value={priceDecision}
                          onValueChange={(v) => setLineDecisionLocal(line.lineId, v as LineDecision)}
                          variant="filled"
                          className="w-36"
                        >
                          <Select.Item value="accepted">Aceptar</Select.Item>
                          <Select.Item value="rejected">Rechazar</Select.Item>
                        </Select>
                      </td>
                      {hasIncidents && (
                        <>
                          <td className="py-3 pr-4 text-body text-default-font">
                            {subInfo ? `${subInfo.sub.sapCode} · ${subInfo.sub.brand}` : "—"}
                          </td>
                          <td className="py-3">
                            {subInfo ? (
                              <Select
                                value={status ?? "pending"}
                                onValueChange={(v) => setStatus(lineKey, v as HomologationStatus)}
                                variant="filled"
                                className="w-40"
                              >
                                <Select.Item value="pending">Pendiente</Select.Item>
                                <Select.Item value="homologated">Homologado</Select.Item>
                                <Select.Item value="rejected">Rechazado</Select.Item>
                              </Select>
                            ) : (
                              <span className="text-caption text-subtext-color">—</span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end border-t border-neutral-border pt-4">
            <span className="text-body-bold font-body-bold text-default-font">
              Total (líneas aceptadas): {supplierQuote.lines
                .filter((line) => getLineDecision(line.lineId) === "accepted")
                .reduce((sum, line) => {
                  const qtyNum = parseFloat(line.qty) || 0;
                  const subInfo = quoteSubstitutions[line.lineId];
                  const unitPrice = subInfo?.quotedPrice ?? line.unitPrice ?? 0;
                  return sum + qtyNum * unitPrice;
                }, 0).toFixed(2)} €
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupplierQuotesPage;
