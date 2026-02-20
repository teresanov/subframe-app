"use client";

import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { Checkbox } from "@/ui/components/Checkbox";
import { Select } from "@/ui/components/Select";
import type { BomLine } from "./RevisionBomPage.data";
import { getBomLinesForRevision } from "./RevisionBomPage.data";
import { MOCK_SUPPLIERS } from "@/lib/suppliers/mockSuppliers";
import { saveDrafts } from "@/lib/drafts/storage";
import { isLineAccepted } from "@/lib/quote/reviewDecisions";
import type { Draft } from "@/lib/drafts/types";
import { FeatherArrowLeft } from "@subframe/core";
import { FeatherCheck } from "@subframe/core";
import { FeatherShoppingCart } from "@subframe/core";

function generateId(): string {
  return crypto.randomUUID?.() ?? `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Asignación sugerida desde el BOM cuando el Excel/CSV trae proveedor por línea. */
function getSuggestedAssignmentFromBom(
  lines: BomLine[],
  filterSupplierId?: string
): { categoryRules: Record<string, string>; supplierIds: string[] } {
  const byCategory: Record<string, string[]> = {};
  const supplierSet = new Set<string>();
  for (const line of lines) {
    if (line.supplierId) {
      if (filterSupplierId && line.supplierId !== filterSupplierId) continue;
      supplierSet.add(line.supplierId);
      if (!byCategory[line.category]) byCategory[line.category] = [];
      byCategory[line.category].push(line.supplierId);
    }
  }
  const categoryRules: Record<string, string> = {};
  for (const [cat, ids] of Object.entries(byCategory)) {
    const unique = [...new Set(ids)];
    if (unique.length === 1) categoryRules[cat] = unique[0];
  }
  const supplierIds = filterSupplierId ? [filterSupplierId] : [...supplierSet];
  return { categoryRules, supplierIds };
}

export function OrderWizardPage() {
  const { projectId = "", revisionId = "" } = useParams<{ projectId: string; revisionId: string }>();
  const [searchParams] = useSearchParams();
  const supplierFromUrl = searchParams.get("supplier") ?? "";
  const planIdFromUrl = searchParams.get("planId") ?? "";
  const rejectedLinesParam = searchParams.get("rejectedLines") ?? "";
  const rejectedLineIds = useMemo(
    () => (rejectedLinesParam ? rejectedLinesParam.split(",").map((s) => s.trim()).filter(Boolean) : []),
    [rejectedLinesParam]
  );
  const isSingleOrderMode = Boolean(supplierFromUrl) && rejectedLineIds.length === 0;
  const isRejectedLinesMode = rejectedLineIds.length > 0;
  const navigate = useNavigate();
  const bomLinesRaw = useMemo(
    () => getBomLinesForRevision(projectId, revisionId),
    [projectId, revisionId]
  );
  const bomLines = useMemo(() => {
    if (isRejectedLinesMode) {
      const idSet = new Set(rejectedLineIds);
      return bomLinesRaw.filter((l) => idSet.has(l.lineId));
    }
    return bomLinesRaw;
  }, [bomLinesRaw, isRejectedLinesMode, rejectedLineIds]);
  const suggestedFromBom = useMemo(
    () => getSuggestedAssignmentFromBom(bomLines, supplierFromUrl || undefined),
    [bomLines, supplierFromUrl]
  );
  const [step, setStep] = useState(1);
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>(() => suggestedFromBom.supplierIds);
  const [categoryRules, setCategoryRules] = useState<Record<string, string>>(() => suggestedFromBom.categoryRules);

  React.useEffect(() => {
    const suggested = getSuggestedAssignmentFromBom(
      getBomLinesForRevision(projectId, revisionId),
      supplierFromUrl || undefined
    );
    setSelectedSupplierIds(suggested.supplierIds);
    setCategoryRules(suggested.categoryRules);
  }, [projectId, revisionId, supplierFromUrl]);

  const selectedSuppliers = useMemo(
    () => MOCK_SUPPLIERS.filter((s) => selectedSupplierIds.includes(s.id)),
    [selectedSupplierIds]
  );

  const toggleSupplier = (id: string) => {
    setSelectedSupplierIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const categoriesInBom = useMemo(
    () => [...new Set(bomLines.map((l) => l.category))].sort(),
    [bomLines]
  );

  const previewBySupplier = useMemo(() => {
    const map: Record<string, BomLine[]> = {};
    for (const s of selectedSuppliers) {
      map[s.id] = bomLines.filter((line) => categoryRules[line.category] === s.id);
    }
    return map;
  }, [bomLines, selectedSuppliers, categoryRules]);

  const allCategoriesAssigned = useMemo(() => {
    return categoriesInBom.every((c) => categoryRules[c] && selectedSupplierIds.includes(categoryRules[c]));
  }, [categoriesInBom, categoryRules, selectedSupplierIds]);

  const singleSupplier = useMemo(
    () => MOCK_SUPPLIERS.find((s) => s.id === supplierFromUrl),
    [supplierFromUrl]
  );
  const singleOrderLineItems = useMemo(() => {
    const bySupplier = bomLines.filter((l) => l.supplierId === supplierFromUrl);
    if (planIdFromUrl) {
      return bySupplier.filter((l) => isLineAccepted(planIdFromUrl, l.lineId));
    }
    return bySupplier;
  }, [bomLines, supplierFromUrl, planIdFromUrl]);

  const handleCreateDrafts = () => {
    const now = new Date().toISOString();
    const drafts: Draft[] = selectedSuppliers.map((supplier) => {
      const lineItems = bomLines.filter((line) => categoryRules[line.category] === supplier.id);
      return {
        id: generateId(),
        projectId,
        revisionId,
        supplierId: supplier.id,
        supplierName: supplier.name,
        supplierEmail: supplier.email,
        createdAt: now,
        updatedAt: now,
        status: "draft",
        type: "rfq",
        categoryRules: { ...categoryRules },
        lineItems,
        subject: `Solicitud de presupuesto ${projectId} ${revisionId} - ${supplier.name}`,
        notes: "",
        requestedDeliveryDate: "",
      };
    });
    saveDrafts(drafts);
    navigate(`/app/borradores/${projectId}/${revisionId}`);
  };

  const handleCreateSingleDraft = () => {
    if (!singleSupplier) return;
    const now = new Date().toISOString();
    const categoryRules = Object.fromEntries(
      [...new Set(singleOrderLineItems.map((l) => l.category))].map((c) => [c, singleSupplier.id])
    );
    // "Crear pedido" desde Plan de compra → orden de compra (po), no RFQ
    const isOrderFromPlan = isSingleOrderMode && planIdFromUrl;
    const draft: Draft = {
      id: generateId(),
      projectId,
      revisionId,
      supplierId: singleSupplier.id,
      supplierName: singleSupplier.name,
      supplierEmail: singleSupplier.email,
      createdAt: now,
      updatedAt: now,
      status: "draft",
      type: isOrderFromPlan ? "po" : "rfq",
      categoryRules,
      lineItems: singleOrderLineItems,
      subject: isOrderFromPlan
        ? `Orden de compra ${projectId} ${revisionId} - ${singleSupplier.name}`
        : `Solicitud de presupuesto ${projectId} ${revisionId} - ${singleSupplier.name}`,
      notes: "",
      requestedDeliveryDate: "",
    };
    saveDrafts([draft]);
    navigate(`/app/borradores/${projectId}/${revisionId}`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-neutral-50">
      <div className="flex w-full items-center justify-between border-b border-neutral-border bg-default-background px-8 py-6">
        <div className="flex items-center gap-3">
          <Link
            to={isSingleOrderMode || isRejectedLinesMode ? `/app/plan?project=${encodeURIComponent(projectId)}` : `/app/revision/${projectId}/${revisionId}`}
            className="flex items-center gap-2 text-body font-body text-brand-600 hover:underline"
          >
            <FeatherArrowLeft className="h-4 w-4" />
            {isSingleOrderMode ? "Volver al Plan de compra" : isRejectedLinesMode ? "Volver al Plan de compra" : "Volver a revisión"}
          </Link>
          <span className="text-heading-2 font-heading-2 text-default-font">
            {isSingleOrderMode ? "Crear pedido" : isRejectedLinesMode ? "Pedir presupuesto a otro proveedor" : "Petición de presupuesto"}
          </span>
          <Badge variant="neutral">{projectId} · {revisionId}</Badge>
        </div>
      </div>

      <div className="flex w-full grow flex-col gap-8 px-8 py-8">
        {isSingleOrderMode ? (
          singleSupplier ? (
            <>
              <div className="flex flex-col gap-3">
                <span className="text-heading-3 font-heading-3 text-default-font">Confirmar pedido</span>
                <p className="text-body text-subtext-color">
                  Se creará un borrador de pedido para {singleSupplier.name} con las líneas asignadas en el BOM.
                </p>
              </div>
              <div className="rounded-lg border border-neutral-border bg-default-background p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-body-bold font-body-bold text-default-font">{singleSupplier.name}</span>
                  <Badge variant="neutral">{singleOrderLineItems.length} líneas</Badge>
                </div>
                <p className="text-caption text-subtext-color mb-4">{singleSupplier.email}</p>
                {singleOrderLineItems.length === 0 ? (
                  <p className="text-caption text-subtext-color">
                    {planIdFromUrl
                      ? "No hay líneas aceptadas para este proveedor. Revisa el presupuesto y acepta al menos una línea."
                      : "No hay líneas del BOM asignadas a este proveedor."}
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {singleOrderLineItems.map((line) => (
                      <div key={line.lineId} className="flex items-center gap-4 text-body text-default-font">
                        <span className="w-12">{line.lineId}</span>
                        <span className="flex-1">{line.description}</span>
                        <span>{line.qty} {line.uom}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button
                variant="brand-primary"
                size="medium"
                icon={<FeatherShoppingCart />}
                disabled={singleOrderLineItems.length === 0}
                onClick={handleCreateSingleDraft}
              >
                Crear borrador
              </Button>
            </>
          ) : (
            <div className="rounded-lg border border-neutral-border bg-default-background p-6">
              <p className="text-body text-subtext-color">Proveedor no encontrado.</p>
            </div>
          )
        ) : (
          <>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-body-bold ${
                step === s ? "bg-brand-600 text-white" : step > s ? "bg-brand-100 text-brand-700" : "bg-neutral-200 text-neutral-500"
              }`}
            >
              {step > s ? <FeatherCheck className="h-4 w-4" /> : s}
            </div>
          ))}
          <span className="text-body text-subtext-color">
            Paso {step}: {step === 1 ? "Proveedores" : step === 2 ? "Reglas por categoría" : "Vista previa"}
          </span>
        </div>

        {step === 1 && (
          <>
            <div className="flex flex-col gap-3">
              <span className="text-heading-3 font-heading-3 text-default-font">Selecciona los proveedores</span>
              <p className="text-body text-subtext-color">Elige uno o más proveedores para crear borradores de pedido.</p>
              <div className="flex flex-col gap-2 rounded-lg border border-neutral-border bg-default-background p-4">
                {MOCK_SUPPLIERS.map((s) => (
                  <label key={s.id} className="flex cursor-pointer items-center gap-3 py-2">
                    <Checkbox
                      checked={selectedSupplierIds.includes(s.id)}
                      onCheckedChange={() => toggleSupplier(s.id)}
                    />
                    <span className="text-body font-body text-default-font">{s.name}</span>
                    <span className="text-caption text-subtext-color">{s.email}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="brand-primary"
                size="medium"
                disabled={selectedSupplierIds.length === 0}
                onClick={() => setStep(2)}
              >
                Siguiente
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex flex-col gap-3">
              <span className="text-heading-3 font-heading-3 text-default-font">Asignar categorías a proveedores</span>
              <p className="text-body text-subtext-color">
                Si el Excel/CSV del BOM trae proveedor por línea, la asignación se ha rellenado automáticamente. Puedes cambiarla en cualquier categoría.
              </p>
              <div className="flex flex-col gap-3 rounded-lg border border-neutral-border bg-default-background p-4">
                {categoriesInBom.map((cat) => (
                  <div key={cat} className="flex items-center gap-4">
                    <span className="w-36 text-body font-body text-default-font">{cat}</span>
                    <Select
                      value={categoryRules[cat] || "__none__"}
                      onValueChange={(v) => setCategoryRules((prev) => ({ ...prev, [cat]: v === "__none__" ? "" : v }))}
                      placeholder="Proveedor"
                      variant="filled"
                      className="min-w-[200px]"
                    >
                      <Select.Item value="__none__">— Sin asignar —</Select.Item>
                      {selectedSuppliers.map((s) => (
                        <Select.Item key={s.id} value={s.id}>
                          {s.name}
                        </Select.Item>
                      ))}
                    </Select>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="neutral-secondary" size="medium" onClick={() => setStep(1)}>
                Atrás
              </Button>
              <Button
                variant="brand-primary"
                size="medium"
                disabled={!allCategoriesAssigned}
                onClick={() => setStep(3)}
              >
                Siguiente
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="flex flex-col gap-3">
              <span className="text-heading-3 font-heading-3 text-default-font">Vista previa por proveedor</span>
              <p className="text-body text-subtext-color">Se crearán los siguientes borradores.</p>
              <div className="flex flex-col gap-4">
                {selectedSuppliers.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-lg border border-neutral-border bg-default-background p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-body-bold font-body-bold text-default-font">{s.name}</span>
                      <Badge variant="neutral">{previewBySupplier[s.id]?.length ?? 0} líneas</Badge>
                    </div>
                    <p className="text-caption text-subtext-color mt-1">{s.email}</p>
                    {previewBySupplier[s.id]?.length === 0 && (
                      <p className="text-caption text-subtext-color mt-2">No hay líneas asignadas a este proveedor.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="neutral-secondary" size="medium" onClick={() => setStep(2)}>
                Atrás
              </Button>
              <Button
                variant="brand-primary"
                size="medium"
                icon={<FeatherShoppingCart />}
                onClick={handleCreateDrafts}
              >
                Crear borradores
              </Button>
            </div>
          </>
        )}
          </>
        )}
      </div>
    </div>
  );
}

export default OrderWizardPage;
