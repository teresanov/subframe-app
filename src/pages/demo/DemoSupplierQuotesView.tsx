"use client";

import React, { useMemo, useState } from "react";
import { Badge } from "@/ui/components/Badge";
import { Select } from "@/ui/components/Select";
import { getSupplierName } from "@/lib/demo/supplierNames";
import { getBomLinesForRevision } from "@/pages/RevisionBomPage.data";
import type { HomologationStatus } from "@/lib/homologation/types";

/** Línea con sustitución para la demo. */
interface DemoQuoteLine {
  lineId: string;
  sapCode: string;
  description: string;
  qty: string;
  uom: string;
  unitPrice: number;
  /** Sustitución propuesta por el proveedor */
  substitution?: {
    sapCode: string;
    brand: string;
  };
}

type Props = {
  projectId: string;
  revisionId: string;
  supplierId: string;
};

/** Datos mock de sustituciones para la demo (líneas que el proveedor propone sustituir). */
const DEMO_SUBSTITUTIONS: Record<string, Record<string, { sapCode: string; brand: string; unitPrice: number }>> = {
  "PRJ-2847/Rev04/sup-electro": {
    "003": { sapCode: "SEN-PT100-WIKA", brand: "Wika", unitPrice: 82 },
    "007": { sapCode: "CONT-25A-SCH", brand: "Schneider", unitPrice: 115 },
  },
  "PRJ-2999/Rev01/sup-acme": {
    "001": { sapCode: "CHP-304-ALT", brand: "Acerinox", unitPrice: 11.5 },
  },
};

function getDemoQuoteLines(
  projectId: string,
  revisionId: string,
  supplierId: string
): DemoQuoteLine[] {
  const bomLines = getBomLinesForRevision(projectId, revisionId);
  const key = `${projectId}/${revisionId}/${supplierId}`;
  const subs = DEMO_SUBSTITUTIONS[key] ?? {};
  const filtered = bomLines.filter((l) => l.supplierId === supplierId).slice(0, 3);
  if (filtered.length === 0) {
    return [
      {
        lineId: "001",
        sapCode: "SAP-XXX",
        description: "Componente electrónico",
        qty: "12",
        uom: "pcs",
        unitPrice: 82,
        substitution: { sapCode: "SEN-PT100-WIKA", brand: "Wika" },
      },
    ];
  }
  return filtered.map((l) => {
    const sub = subs[l.lineId];
    return {
      lineId: l.lineId,
      sapCode: l.sapCode,
      description: l.description,
      qty: l.qty,
      uom: l.uom,
      unitPrice: sub?.unitPrice ?? l.unitPrice ?? 0,
      substitution: sub ? { sapCode: sub.sapCode, brand: sub.brand } : undefined,
    };
  });
}

export function DemoSupplierQuotesView({
  projectId,
  revisionId,
  supplierId,
}: Props) {
  const lines = useMemo(
    () => getDemoQuoteLines(projectId, revisionId, supplierId),
    [projectId, revisionId, supplierId]
  );
  const [homologation, setHomologation] = useState<Record<string, HomologationStatus>>({});

  const supplierName = getSupplierName(supplierId);

  return (
    <div className="flex w-full flex-col gap-6" data-demo-highlight="demo-step5">
      <div className="flex flex-col gap-2">
        <span className="text-heading-2 font-heading-2 text-default-font">
          Revisar presupuesto
        </span>
        <p className="text-body font-body text-subtext-color">
          El proveedor ha enviado su presupuesto. Algunas líneas proponen un sustituto homologado.
          Puedes homologar (aceptar) o rechazar cada sustitución.
        </p>
      </div>

      <div className="rounded-lg border border-neutral-border bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-heading-3 font-heading-3 text-default-font">
            {supplierName}
          </span>
          <Badge variant="neutral">{projectId} · {revisionId}</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-border">
                <th className="pb-2 pr-4 text-caption-bold font-caption-bold text-subtext-color">
                  Línea
                </th>
                <th className="pb-2 pr-4 text-caption-bold font-caption-bold text-subtext-color">
                  Original
                </th>
                <th className="pb-2 pr-4 text-caption-bold font-caption-bold text-subtext-color">
                  Cant.
                </th>
                <th className="pb-2 pr-4 text-caption-bold font-caption-bold text-subtext-color text-right">
                  Precio
                </th>
                <th className="pb-2 pr-4 text-caption-bold font-caption-bold text-subtext-color">
                  Sustitución propuesta
                </th>
                <th className="pb-2 text-caption-bold font-caption-bold text-subtext-color">
                  Homologación
                </th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => {
                const qtyNum = parseFloat(line.qty) || 0;
                const total = qtyNum * line.unitPrice;
                const status = line.substitution
                  ? (homologation[line.lineId] ?? "pending")
                  : null;

                return (
                  <tr
                    key={line.lineId}
                    className="border-b border-neutral-border last:border-b-0 hover:bg-neutral-50"
                  >
                    <td className="py-3 pr-4 text-body font-body text-default-font">
                      {line.lineId}
                    </td>
                    <td className="py-3 pr-4 text-body font-body text-default-font">
                      {line.sapCode} — {line.description}
                    </td>
                    <td className="py-3 pr-4 text-body font-body text-default-font">
                      {line.qty} {line.uom}
                    </td>
                    <td className="py-3 pr-4 text-body font-body text-default-font text-right">
                      {line.unitPrice.toFixed(2)} €
                    </td>
                    <td className="py-3 pr-4 text-body font-body text-default-font">
                      {line.substitution ? (
                        <span>
                          {line.substitution.sapCode} · {line.substitution.brand}
                        </span>
                      ) : (
                        <span className="text-subtext-color">—</span>
                      )}
                    </td>
                    <td className="py-3">
                      {line.substitution ? (
                        <Select
                          value={status ?? "pending"}
                          onValueChange={(v) =>
                            setHomologation((prev) => ({
                              ...prev,
                              [line.lineId]: v as HomologationStatus,
                            }))
                          }
                          variant="filled"
                          className="w-36"
                        >
                          <Select.Item value="pending">Pendiente</Select.Item>
                          <Select.Item value="homologated">Homologado</Select.Item>
                          <Select.Item value="rejected">Rechazado</Select.Item>
                        </Select>
                      ) : (
                        <span className="text-caption font-caption text-subtext-color">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 border-t border-neutral-border pt-4">
          <span className="text-body-bold font-body-bold text-default-font">
            Total: {lines
              .reduce((sum, l) => sum + (parseFloat(l.qty) || 0) * l.unitPrice, 0)
              .toFixed(2)}{" "}
            €
          </span>
        </div>
      </div>
    </div>
  );
}
