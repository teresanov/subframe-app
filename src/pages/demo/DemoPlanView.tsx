"use client";

import React, { useMemo } from "react";
import { Accordion } from "@/ui/components/Accordion";
import { Badge } from "@/ui/components/Badge";
import { getBomLinesForRevision } from "@/pages/RevisionBomPage.data";
import type { BomLine } from "@/pages/RevisionBomPage.data";
import { getSupplierName } from "@/lib/demo/supplierNames";
import { FeatherArrowUpDown } from "@subframe/core";
import { FeatherMinus } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";

function groupBySupplier(lines: BomLine[]): Map<string, BomLine[]> {
  const map = new Map<string, BomLine[]>();
  for (const line of lines) {
    const sid = line.supplierId ?? "unknown";
    if (!map.has(sid)) map.set(sid, []);
    map.get(sid)!.push(line);
  }
  return map;
}

type Props = {
  projectId: string;
  revisionId: string;
};

export function DemoPlanView({ projectId, revisionId }: Props) {
  const bySupplier = useMemo(() => {
    const lines = getBomLinesForRevision(projectId, revisionId);
    return groupBySupplier(lines);
  }, [projectId, revisionId]);

  return (
    <div className="flex w-full flex-col gap-3" data-demo-highlight="demo-step3">
      <span className="text-heading-3 font-heading-3 text-default-font">
        Plan de acción por proveedor
      </span>
      <div className="flex flex-col gap-2">
        {Array.from(bySupplier.entries()).map(([supplierId, lines]) => {
          const added = lines.filter((l) => l.estado === "added");
          const removed = lines.filter((l) => l.estado === "removed");
          const qtyChanged = lines.filter((l) => l.estado === "qty_changed");
          const name = getSupplierName(supplierId);

          return (
            <Accordion
              key={supplierId}
              trigger={
                <div className="flex w-full items-center justify-between py-2">
                  <span className="text-body-bold font-body-bold text-default-font">
                    {name}
                  </span>
                  <div className="flex items-center gap-2">
                    {added.length > 0 && (
                      <Badge variant="success" icon={<FeatherPlus />}>
                        Comprar: {added.length}
                      </Badge>
                    )}
                    {removed.length > 0 && (
                      <Badge variant="error" icon={<FeatherMinus />}>
                        Cancelar: {removed.length}
                      </Badge>
                    )}
                    {qtyChanged.length > 0 && (
                      <Badge variant="warning" icon={<FeatherArrowUpDown />}>
                        Δ Cantidad: {qtyChanged.length}
                      </Badge>
                    )}
                    <Accordion.Chevron />
                  </div>
                </div>
              }
            >
              <div className="flex flex-col gap-4 rounded-lg border border-neutral-border bg-neutral-50 p-4">
                {added.length > 0 && (
                  <div>
                    <span className="text-caption-bold font-caption-bold text-subtext-color">
                      Comprar
                    </span>
                    <div className="mt-2 flex flex-col gap-1">
                      {added.map((l) => (
                        <div
                          key={l.lineId}
                          className="text-body font-body text-default-font"
                        >
                          {l.sapCode} — {l.description} ({l.qty} {l.uom})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {removed.length > 0 && (
                  <div>
                    <span className="text-caption-bold font-caption-bold text-subtext-color">
                      Cancelar
                    </span>
                    <div className="mt-2 flex flex-col gap-1">
                      {removed.map((l) => (
                        <div
                          key={l.lineId}
                          className="text-body font-body text-subtext-color line-through"
                        >
                          {l.sapCode} — {l.oldQty} {l.uom}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {qtyChanged.length > 0 && (
                  <div>
                    <span className="text-caption-bold font-caption-bold text-subtext-color">
                      Δ Cantidad
                    </span>
                    <div className="mt-2 flex flex-col gap-1">
                      {qtyChanged.map((l) => (
                        <div
                          key={l.lineId}
                          className="text-body font-body text-default-font"
                        >
                          {l.oldQty} → {l.qty} {l.uom}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Accordion>
          );
        })}
      </div>
    </div>
  );
}
