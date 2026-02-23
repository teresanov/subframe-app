"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { TextField } from "@/ui/components/TextField";
import { TextArea } from "@/ui/components/TextArea";
import { DemoLayout } from "@/layouts/DemoLayout";
import { DemoStepper } from "@/pages/demo/DemoStepper";
import { NexusProcurementDashboard } from "@/pages/NexusProcurementDashboard";
import { RevisionBomPage } from "@/pages/RevisionBomPage";
import { DraftsPage } from "@/pages/DraftsPage";
import { PurchasePlanPage } from "@/pages/PurchasePlanPage";
import { SupplierQuotesPage } from "@/pages/SupplierQuotesPage";
import { OrderWizardPage } from "@/pages/OrderWizardPage";
import { getBomLinesForRevision } from "@/pages/RevisionBomPage.data";
import type { BomLine } from "@/pages/RevisionBomPage.data";
import { getSupplierName } from "@/lib/demo/supplierNames";
import { saveDrafts } from "@/lib/drafts/storage";
import type { Draft } from "@/lib/drafts/types";
import type { EditableDraft } from "@/lib/demo/editableDraft";

const STEPS = [
  { id: 1, title: "Bandeja de entrada", desc: "Inbox con peticiones y presupuestos recibidos.", highlight: "demo-step1" },
  { id: 2, title: "Canonización BOM", desc: "El sistema normaliza el BOM y calcula el delta respecto a la revisión anterior.", highlight: "demo-step2" },
  { id: 3, title: "Borradores RFQ", desc: "Ver borradores, editar y enviar (simulado).", highlight: "demo-step3" },
  { id: 4, title: "Homologar presupuesto", desc: "Plan de compra con presupuestos recibidos y pendientes.", highlight: "demo-step4" },
  { id: 5, title: "Crear orden", desc: "Flujo del wizard para crear la orden de compra.", highlight: "demo-step5" },
];

function groupBySupplier(lines: BomLine[]): Map<string, BomLine[]> {
  const map = new Map<string, BomLine[]>();
  for (const line of lines) {
    const sid = line.supplierId ?? "unknown";
    if (!map.has(sid)) map.set(sid, []);
    map.get(sid)!.push(line);
  }
  return map;
}

function editableDraftsToDrafts(
  projectId: string,
  revisionId: string,
  bomLines: BomLine[],
  editable: EditableDraft[]
): Draft[] {
  const bySupplier = groupBySupplier(bomLines);
  const now = new Date().toISOString();
  return editable.map((e) => {
    const lineItems = bySupplier.get(e.supplierId) ?? [];
    const categoryRules = Object.fromEntries(
      [...new Set(lineItems.map((l) => l.category))].map((c) => [c, e.supplierId])
    );
    return {
      id: e.id,
      projectId,
      revisionId,
      supplierId: e.supplierId,
      supplierName: e.supplierName,
      supplierEmail: e.to,
      createdAt: now,
      updatedAt: now,
      status: "draft" as const,
      type: "rfq" as const,
      categoryRules,
      lineItems,
      subject: e.subject,
      notes: e.body,
      requestedDeliveryDate: "",
    };
  });
}

function generateEditableDrafts(
  projectId: string,
  revisionId: string,
  lines: BomLine[]
): EditableDraft[] {
  const bySupplier = groupBySupplier(lines);
  const drafts: EditableDraft[] = [];
  let i = 0;
  bySupplier.forEach((supplierLines, supplierId) => {
    const supplierName = getSupplierName(supplierId);
    const added = supplierLines.filter((l) => l.estado === "added");
    const removed = supplierLines.filter((l) => l.estado === "removed");
    const qtyChanged = supplierLines.filter((l) => l.estado === "qty_changed");
    const parts: string[] = [];
    if (qtyChanged.length) parts.push(`Actualizaciones de cantidad: ${qtyChanged.length} línea(s)`);
    if (removed.length) parts.push(`Cancelaciones: ${removed.length} línea(s)`);
    if (added.length) parts.push(`Nuevos ítems: ${added.length} línea(s)`);
    const subject = `PRJ ${projectId} - ${revisionId} - Cambios en lista de materiales`;
    const body = parts.join("\n\n") || "Sin cambios pendientes.";
    drafts.push({
      id: `demo-draft-${i++}`,
      projectId,
      revisionId,
      supplierId,
      supplierName,
      to: `${supplierId}@proveedor.com`,
      subject,
      body,
      originalSubject: subject,
      originalBody: body,
      isEdited: false,
    });
  });
  return drafts;
}

const demoContext = (projectId: string, revisionId: string, emailId: string) => ({
  projectId,
  revisionId,
  emailId,
});

export function DemoRunnerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    projectId?: string;
    revisionId?: string;
    emailId?: string;
  } | null;

  const projectId = state?.projectId ?? "PRJ-2847";
  const revisionId = state?.revisionId ?? "Rev04";
  const emailId = state?.emailId ?? "PRJ-2847/Rev04";

  const [step, setStep] = useState(1);
  const [step4Sub, setStep4Sub] = useState<"plan" | "quotes">("plan");
  const [orderCreated, setOrderCreated] = useState(false);
  const [editableDrafts, setEditableDrafts] = useState<EditableDraft[]>([]);
  const [openDraftId, setOpenDraftId] = useState<string | null>(null);
  const [editedDrafts, setEditedDrafts] = useState<Record<string, EditableDraft>>({});

  const ctx = useMemo(
    () => demoContext(projectId, revisionId, emailId),
    [projectId, revisionId, emailId]
  );

  const bomLines = useMemo(
    () => getBomLinesForRevision(projectId, revisionId),
    [projectId, revisionId]
  );

  const initDrafts = useCallback(() => {
    const generated = generateEditableDrafts(projectId, revisionId, bomLines);
    setEditableDrafts(generated);
    const asDraft = editableDraftsToDrafts(projectId, revisionId, bomLines, generated);
    saveDrafts(asDraft);
  }, [projectId, revisionId, bomLines]);

  // Al entrar al paso 3, inicializar borradores
  useEffect(() => {
    if (step === 3) initDrafts();
  }, [step, initDrafts]);

  // Al tener borradores en paso 3, preseleccionar el primero para mostrar vista previa
  useEffect(() => {
    if (step === 3 && editableDrafts.length > 0 && !openDraftId) {
      setOpenDraftId(editableDrafts[0]!.id);
    }
  }, [step, editableDrafts, openDraftId]);

  const handleContinue = useCallback(() => {
    if (step === 4 && step4Sub === "plan") {
      setStep4Sub("quotes");
      return;
    }
    if (step === 5 && orderCreated) {
      navigate("/");
      return;
    }
    if (step < 5) {
      setStep((s) => s + 1);
      if (step === 4) setStep4Sub("plan");
    }
  }, [step, step4Sub, orderCreated, initDrafts, navigate]);

  const handleSupplierQuotesComplete = useCallback(() => {
    setStep(5);
  }, []);

  const handleOrderCreated = useCallback(() => {
    setOrderCreated(true);
  }, []);

  const handleBack = useCallback(() => {
    if (step === 4 && step4Sub === "quotes") {
      setStep4Sub("plan");
      return;
    }
    if (step > 1) {
      setStep((s) => s - 1);
      if (step === 5 && orderCreated) setOrderCreated(false);
      if (step === 5) setStep4Sub("quotes");
    }
  }, [step, step4Sub, orderCreated]);

  const canBack = step > 1 || (step === 4 && step4Sub === "quotes");

  const currentStep = STEPS[step - 1]!;
  const displayDrafts = editableDrafts.map((d) => editedDrafts[d.id] ?? d);
  const editingDraft = openDraftId ? displayDrafts.find((d) => d.id === openDraftId) : null;

  const getStepDescription = () => {
    if (step === 4 && step4Sub === "plan") {
      return (
        <div className="flex flex-col gap-3 text-body font-body text-subtext-color">
          <p><strong>Qué estás viendo:</strong> El Plan de compra muestra los presupuestos recibidos y los pendientes de respuesta.</p>
          <p><strong>Qué hacer:</strong> Localiza el plan de <strong>ElectroComponents SA</strong> con "Sustituciones pendientes". Pulsa <strong>Revisar</strong> para homologar las sustituciones propuestas por el proveedor. Después podrás lanzar la orden.</p>
          <p>También verás planes pendientes (ej. Pinturas del Norte) esperando respuesta del proveedor.</p>
        </div>
      );
    }
    if (step === 4 && step4Sub === "quotes") {
      return (
        <div className="flex flex-col gap-3 text-body font-body text-subtext-color">
          <p><strong>Qué estás viendo:</strong> Pantalla de homologación de presupuesto. El proveedor ha propuesto sustituciones en algunas líneas.</p>
          <p><strong>Qué hacer:</strong> Revisa cada sustitución y marca Homologar o Rechazar. Pulsa <strong>Aplicar y volver al plan</strong> para guardar y pasar al wizard de creación de orden. O usa el botón Continuar del pie.</p>
        </div>
      );
    }
    if (step === 1) {
      return (
        <div className="flex flex-col gap-3 text-body font-body text-subtext-color">
          <p><strong>Qué estás viendo:</strong> La bandeja con peticiones de compra y presupuestos recibidos.</p>
          <p><strong>Qué hacer:</strong> Selecciona el email de Jorge Martínez (PRJ-2847, Rev04) — la petición válida. Usa los filtros Todos/Peticiones/Presupuestos si quieres. Luego pulsa Continuar.</p>
        </div>
      );
    }
    if (step === 2) {
      return (
        <div className="flex flex-col gap-3 text-body font-body text-subtext-color">
          <p><strong>Qué estás viendo:</strong> El BOM canonizado por el sistema, con el delta respecto a la revisión anterior (añadidos, quitados, cambios de cantidad).</p>
          <p><strong>Qué hacer:</strong> Revisa la tabla normalizada. Pulsa Continuar para pasar a los borradores RFQ.</p>
        </div>
      );
    }
    if (step === 3) {
      return (
        <div className="flex flex-col gap-3 text-body font-body text-subtext-color">
          <p><strong>Qué estás viendo:</strong> Los borradores de RFQ generados a partir del BOM, uno por proveedor.</p>
          <p><strong>Qué hacer:</strong> Selecciona un borrador en la lista. En la derecha verás la vista previa del mensaje que se enviará. Puedes editar asunto y cuerpo. Pulsa Enviar (simulado) y Continuar.</p>
        </div>
      );
    }
    if (step === 5) {
      return (
        <div className="flex flex-col gap-3 text-body font-body text-subtext-color">
          <p><strong>Qué estás viendo:</strong> El wizard para crear la orden de compra con las líneas homologadas.</p>
          <p><strong>Qué hacer:</strong> Confirma el proveedor y las líneas. Pulsa <strong>Crear pedido</strong> para lanzar la orden.</p>
        </div>
      );
    }
    return <p className="text-body font-body text-subtext-color">{currentStep.desc}</p>;
  };

  const stepPanel = (
    <div className="flex flex-col gap-4">
      <span className="text-caption font-caption text-subtext-color">
        Paso {step} de 5
      </span>
      <h2 className="text-heading-2 font-heading-2 text-default-font">{currentStep.title}</h2>
      {getStepDescription()}
    </div>
  );

  const stepperNode = (
    <DemoStepper
      steps={STEPS}
      currentStep={step}
      description={null}
    />
  );

  const renderStage = () => {
    if (step === 1) {
      return (
        <div className="h-full w-full overflow-auto">
          <NexusProcurementDashboard embedMode demoContext={ctx} />
        </div>
      );
    }
    if (step === 2) {
      return (
        <div className="h-full w-full overflow-auto">
          <RevisionBomPage embedMode demoContext={ctx} />
        </div>
      );
    }
    if (step === 3) {
      return (
        <div className="flex h-full w-full gap-6 overflow-hidden">
          <div className="min-w-0 flex-1 overflow-auto">
            <DraftsPage
              embedMode
              demoContext={ctx}
              onDraftSelect={(id) => setOpenDraftId(id)}
            />
          </div>
          <div className="flex w-[420px] flex-shrink-0 flex-col gap-4 rounded-lg border border-neutral-border bg-white p-6 shadow-sm">
            <h3 className="text-heading-3 font-heading-3 text-default-font">
              Vista previa del mensaje al proveedor
            </h3>
            <p className="text-caption font-caption text-subtext-color">
              Lo que se enviará al proveedor cuando pulses Enviar
            </p>
            {editingDraft ? (
              <>
                <div className="flex flex-col gap-3 rounded-lg border border-neutral-border bg-neutral-50 p-4">
                  <div>
                    <span className="text-caption-bold text-subtext-color">Para: </span>
                    <span className="text-body font-body text-default-font">{editingDraft.to}</span>
                  </div>
                  <div>
                    <span className="text-caption-bold text-subtext-color">Asunto: </span>
                    <span className="text-body font-body text-default-font">
                      {editedDrafts[editingDraft.id]?.subject ?? editingDraft.subject}
                    </span>
                  </div>
                  <div className="border-t border-neutral-border pt-3">
                    <span className="text-caption-bold text-subtext-color block mb-1">Cuerpo:</span>
                    <pre className="whitespace-pre-wrap text-body font-body text-default-font font-sans">
                      {editedDrafts[editingDraft.id]?.body ?? editingDraft.body}
                    </pre>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <TextField
                    label="Editar asunto"
                    variant="filled"
                  >
                    <TextField.Input
                      value={editedDrafts[editingDraft.id]?.subject ?? editingDraft.subject}
                      onChange={(e) => {
                        const next = {
                          ...(editedDrafts[editingDraft.id] ?? editingDraft),
                          subject: e.target.value,
                          isEdited: true,
                        };
                        setEditedDrafts((prev) => ({ ...prev, [editingDraft.id]: next }));
                      }}
                    />
                  </TextField>
                  <TextArea label="Editar cuerpo" variant="filled">
                    <TextArea.Input
                      value={editedDrafts[editingDraft.id]?.body ?? editingDraft.body}
                      onChange={(e) => {
                        const next = {
                          ...(editedDrafts[editingDraft.id] ?? editingDraft),
                          body: e.target.value,
                          isEdited: true,
                        };
                        setEditedDrafts((prev) => ({ ...prev, [editingDraft.id]: next }));
                      }}
                    />
                  </TextArea>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="neutral-secondary"
                    size="small"
                    onClick={() => {
                      setEditedDrafts((prev) => {
                        const next = { ...prev };
                        delete next[editingDraft.id];
                        return next;
                      });
                    }}
                  >
                    Restaurar
                  </Button>
                  <Button
                    variant="brand-primary"
                    size="medium"
                    onClick={() => setOpenDraftId(null)}
                  >
                    Enviar (simulado)
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-body font-body text-subtext-color">
                Selecciona un borrador en la lista para ver la vista previa.
              </p>
            )}
          </div>
        </div>
      );
    }
    if (step === 4) {
      if (step4Sub === "plan") {
        return (
          <div className="h-full w-full overflow-auto">
            <PurchasePlanPage embedMode projectIdProp={projectId} useDemoPlans />
          </div>
        );
      }
      return (
        <div className="h-full w-full overflow-auto">
          <SupplierQuotesPage
            embedMode
            projectIdProp={projectId}
            revisionIdProp={revisionId}
            supplierIdProp="sup-electro"
            planIdProp="op-2"
            onComplete={handleSupplierQuotesComplete}
          />
        </div>
      );
    }
    if (step === 5) {
      if (orderCreated) {
        return (
          <div className="flex flex-col items-center justify-center gap-6 rounded-lg border border-neutral-border bg-white p-12">
            <Badge variant="success">Orden creada</Badge>
            <p className="text-body font-body text-subtext-color text-center max-w-md">
              La orden de compra se ha creado correctamente. Flujo de demo completado.
            </p>
          </div>
        );
      }
      return (
        <div className="h-full w-full overflow-auto">
          <OrderWizardPage
            embedMode
            demoOverride={{
              projectId,
              revisionId,
              supplierId: "sup-electro",
              planId: "op-2",
            }}
            onOrderCreated={handleOrderCreated}
          />
        </div>
      );
    }
    return null;
  };

  const continueLabel = step === 5 && orderCreated ? "Volver al inicio" : "Continuar";
  const canContinue = step !== 5 || orderCreated;

  const stepBannerTitle = (() => {
    if (step === 4 && step4Sub === "plan") return "Homologar presupuesto — Plan de compra";
    if (step === 4 && step4Sub === "quotes") return "Homologar presupuesto — Revisar sustituciones";
    return currentStep.title;
  })();

  return (
    <DemoLayout
      stepPanel={stepPanel}
      stagePanel={renderStage()}
      stepperNode={stepperNode}
      stepBanner={{ step, total: 5, title: stepBannerTitle }}
      onContinue={handleContinue}
      onBack={handleBack}
      canContinue={canContinue}
      canBack={canBack}
      continueLabel={continueLabel}
    />
  );
}
