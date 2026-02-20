"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { TextField } from "@/ui/components/TextField";
import { TextArea } from "@/ui/components/TextArea";
import { DemoLayout } from "@/layouts/DemoLayout";
import { NexusProcurementDashboard } from "@/pages/NexusProcurementDashboard";
import { RevisionBomPage } from "@/pages/RevisionBomPage";
import { DraftsPage } from "@/pages/DraftsPage";
import { DemoPlanView } from "@/pages/demo/DemoPlanView";
import { DemoSupplierQuotesView } from "@/pages/demo/DemoSupplierQuotesView";
import { DemoOverlay } from "@/pages/demo/DemoOverlay";
import { getBomLinesForRevision } from "@/pages/RevisionBomPage.data";
import type { BomLine } from "@/pages/RevisionBomPage.data";
import { MOCK_INBOX_EMAILS } from "@/lib/inbox/mockEmails";
import { getSupplierName } from "@/lib/demo/supplierNames";
import { saveDrafts } from "@/lib/drafts/storage";
import type { Draft } from "@/lib/drafts/types";
import type { EditableDraft } from "@/lib/demo/editableDraft";

const STEPS = [
  { id: 1, title: "Email", desc: "La bandeja recibe la petición con la lista de materiales adjunta.", highlight: "demo-step1" },
  { id: 2, title: "BOM", desc: "El sistema normaliza el BOM y calcula el delta respecto a la revisión anterior.", highlight: "demo-step2" },
  { id: 3, title: "Plan de acción", desc: "Acciones por proveedor: Comprar, Cancelar o ajustar cantidades.", highlight: "demo-step3" },
  { id: 4, title: "Borradores RFQ", desc: "Peticiones de presupuesto generadas. Revisa y envía a los proveedores.", highlight: "demo-step4" },
  { id: 5, title: "Revisar presupuesto", desc: "El proveedor envió su oferta. Homologa o rechaza las sustituciones propuestas.", highlight: "demo-step5" },
  { id: 6, title: "Orden enviada", desc: "Orden de compra lanzada. En tránsito." },
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
  const emailId = state?.emailId ?? "PRJ-2850/Rev02";

  const [step, setStep] = useState(1);
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

  const handleContinue = useCallback(() => {
    if (step === 3) initDrafts();
    if (step === 6) {
      navigate("/");
      return;
    }
    if (step < 6) setStep((s) => s + 1);
  }, [step, initDrafts, navigate]);

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-4">
          <span className="text-body font-body text-subtext-color">
            No hay contexto de demo. Selecciona un email en el inbox.
          </span>
          <Button variant="brand-primary" onClick={() => navigate("/demo/inbox")}>
            Volver al Inbox
          </Button>
        </div>
      </div>
    );
  }

  const currentStep = STEPS[step - 1]!;
  const displayDrafts = editableDrafts.map((d) => editedDrafts[d.id] ?? d);
  const editingDraft = openDraftId ? displayDrafts.find((d) => d.id === openDraftId) : null;

  const stepPanel = (
    <div className="flex flex-col gap-4">
      <span className="text-caption font-caption text-subtext-color">
        Paso {step} de 6
      </span>
      <h2 className="text-heading-2 font-heading-2 text-default-font">{currentStep.title}</h2>
      <p className="text-body font-body text-subtext-color">{currentStep.desc}</p>
    </div>
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
        <div className="h-full w-full overflow-auto px-6 py-6">
          <DemoPlanView projectId={projectId} revisionId={revisionId} />
        </div>
      );
    }
    if (step === 4) {
      return (
        <div className="flex h-full w-full gap-6 overflow-hidden">
          <div className="min-w-0 flex-1 overflow-auto">
            <DraftsPage
            embedMode
            demoContext={ctx}
            onDraftSelect={(id) => setOpenDraftId(id)}
          />
          </div>
          {editingDraft && (
            <div className="flex w-96 flex-shrink-0 flex-col gap-4 rounded-lg border border-neutral-border bg-white p-6">
              <div className="flex items-center gap-2">
                <h3 className="text-heading-3 font-heading-3 text-default-font">
                  {editingDraft.supplierName}
                </h3>
                <Badge variant="brand">RFQ</Badge>
              </div>
              <TextField label="Para" disabled>
                <TextField.Input value={editingDraft.to} readOnly />
              </TextField>
              <TextField
                label="Asunto"
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
              <TextArea label="Cuerpo" variant="filled">
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
                  size="small"
                  onClick={() => setOpenDraftId(null)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }
    if (step === 5) {
      const demoSupplierId = bomLines.some((l) => l.supplierId === "sup-electro")
        ? "sup-electro"
        : Array.from(new Set(bomLines.map((l) => l.supplierId).filter(Boolean)))[0] ?? "sup-electro";
      return (
        <div className="h-full w-full overflow-auto px-6 py-6">
          <DemoSupplierQuotesView
            projectId={projectId}
            revisionId={revisionId}
            supplierId={demoSupplierId}
          />
        </div>
      );
    }
    if (step === 6) {
      return (
        <div className="flex flex-col items-center justify-center gap-6 rounded-lg border border-neutral-border bg-white p-12">
          <Badge variant="success">Orden enviada</Badge>
          <p className="text-body font-body text-subtext-color text-center max-w-md">
            La orden de compra se ha enviado al proveedor. El pedido está en tránsito. Flujo de demo completado.
          </p>
        </div>
      );
    }
    return null;
  };

  const showOverlay = step <= 5 && currentStep.highlight;

  return (
    <>
      <DemoLayout
        stepPanel={stepPanel}
        stagePanel={renderStage()}
        onContinue={handleContinue}
        continueLabel={step === 6 ? "Volver al inicio" : "Continuar"}
      />
      {showOverlay && (
        <DemoOverlay
          targetSelector={`[data-demo-highlight="${currentStep.highlight}"]`}
          content={
            <p className="text-body font-body text-default-font">{currentStep.desc}</p>
          }
          onContinue={handleContinue}
        />
      )}
    </>
  );
}
