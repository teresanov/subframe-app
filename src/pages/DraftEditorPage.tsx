"use client";

import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ProyectoNexusSidebar } from "@/components/ProyectoNexusSidebar";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { TextField } from "@/ui/components/TextField";
import { TextArea } from "@/ui/components/TextArea";
import { getDraftById, saveDraft } from "@/lib/drafts/storage";
import type { Draft } from "@/lib/drafts/types";
import type { BomEstado } from "./RevisionBomPage.data";
import { FeatherArrowLeft } from "@subframe/core";
import { FeatherCheck } from "@subframe/core";
import { FeatherMinus } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherArrowUpDown } from "@subframe/core";

function EstadoBadge({ estado }: { estado: BomEstado }) {
  const config = {
    added: { label: "Añadido", icon: <FeatherPlus className="h-3 w-3" />, variant: "success" as const },
    removed: { label: "Eliminado", icon: <FeatherMinus className="h-3 w-3" />, variant: "error" as const },
    qty_changed: { label: "Δ Cantidad", icon: <FeatherArrowUpDown className="h-3 w-3" />, variant: "warning" as const },
    unchanged: { label: "Sin cambios", icon: <FeatherCheck className="h-3 w-3" />, variant: "neutral" as const },
  };
  const c = config[estado];
  return <Badge variant={c.variant} icon={c.icon}>{c.label}</Badge>;
}

export function DraftEditorPage() {
  const { draftId = "" } = useParams<{ draftId: string }>();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState("");

  useEffect(() => {
    const d = getDraftById(draftId);
    setDraft(d ?? null);
    if (d) {
      setSubject(d.subject);
      setNotes(d.notes);
      setRequestedDeliveryDate(d.requestedDeliveryDate);
    }
  }, [draftId]);

  const handleSave = () => {
    if (!draft) return;
    saveDraft({
      ...draft,
      subject,
      notes,
      requestedDeliveryDate,
      updatedAt: new Date().toISOString(),
    });
    navigate(`/borradores/${draft.projectId}/${draft.revisionId}`);
  };

  if (!draft) {
    return (
      <div className="flex min-h-screen w-full items-start bg-neutral-50">
        <ProyectoNexusSidebar />
        <div className="flex grow flex-col items-center justify-center gap-4">
          <span className="text-body font-body text-subtext-color">Borrador no encontrado.</span>
          <Link to="/inbox" className="text-body font-body text-brand-600 hover:underline">
            Volver al Inbox
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-start bg-neutral-50">
      <ProyectoNexusSidebar />
      <div className="flex grow flex-col self-stretch overflow-auto">
      <div className="flex w-full items-center justify-between border-b border-neutral-border bg-default-background px-8 py-6">
        <div className="flex items-center gap-3">
          <Link
            to={`/borradores/${draft.projectId}/${draft.revisionId}`}
            className="flex items-center gap-2 text-body font-body text-brand-600 hover:underline"
          >
            <FeatherArrowLeft className="h-4 w-4" />
            Volver a borradores
          </Link>
          <span className="text-heading-2 font-heading-2 text-default-font">
            {draft.type === "rfq" ? "Editar petición de presupuesto" : "Editar borrador"}
          </span>
          <Badge variant={draft.type === "rfq" ? "brand" : "neutral"}>
            {draft.type === "rfq" ? "RFQ" : "Orden"}
          </Badge>
          <Badge variant="neutral">{draft.supplierName}</Badge>
          <Badge variant="neutral">{draft.projectId} · {draft.revisionId}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="neutral-secondary" size="medium" onClick={handleSave}>
            Guardar borrador
          </Button>
          {draft.status === "draft" && (
            <Button
              variant="brand-primary"
              size="medium"
              icon={<FeatherCheck />}
              onClick={() => {
                if (!draft) return;
                saveDraft({
                  ...draft,
                  subject,
                  notes,
                  requestedDeliveryDate,
                  status: "sent",
                  updatedAt: new Date().toISOString(),
                });
                // Tras enviar: órdenes de compra → En tránsito; RFQ → Plan de compra
                if (draft.type === "po") {
                  navigate("/transito");
                } else {
                  navigate(`/plan?project=${encodeURIComponent(draft.projectId)}`);
                }
              }}
            >
              {draft.type === "rfq" ? "Pedir presupuesto al proveedor" : "Lanzar orden"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex w-full grow flex-col gap-8 px-8 py-8 overflow-auto">
        <div className="flex flex-col gap-4 rounded-lg border border-neutral-border bg-default-background p-6">
          <span className="text-heading-3 font-heading-3 text-default-font">
            {draft.type === "rfq" ? "Datos de la petición de presupuesto" : "Datos del pedido"}
          </span>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="w-40 text-body font-body text-subtext-color">Proveedor:</span>
              <span className="text-body font-body text-default-font">{draft.supplierName}</span>
              <span className="text-caption text-subtext-color">{draft.supplierEmail}</span>
            </div>
            <TextField label="Asunto" variant="filled" className="max-w-xl">
              <TextField.Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </TextField>
            <TextField label="Fecha deseada de entrega" variant="filled" className="max-w-xs">
              <TextField.Input
                value={requestedDeliveryDate}
                onChange={(e) => setRequestedDeliveryDate(e.target.value)}
                placeholder="YYYY-MM-DD"
              />
            </TextField>
            <div className="flex flex-col gap-2">
              <span className="text-body font-body text-subtext-color">Notas</span>
              <TextArea label="" className="min-h-[100px] w-full max-w-xl">
                <TextArea.Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas internas o para el proveedor..."
                />
              </TextArea>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-neutral-border bg-default-background p-6">
          <span className="text-heading-3 font-heading-3 text-default-font">
            Líneas asignadas ({draft.lineItems.length})
          </span>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-border">
                  <th className="pb-2 pr-4 text-caption-bold text-subtext-color">Line ID</th>
                  <th className="pb-2 pr-4 text-caption-bold text-subtext-color">SAP</th>
                  <th className="pb-2 pr-4 text-caption-bold text-subtext-color">Descripción</th>
                  <th className="pb-2 pr-4 text-caption-bold text-subtext-color">UOM</th>
                  <th className="pb-2 pr-4 text-caption-bold text-subtext-color">Cantidad</th>
                  <th className="pb-2 pr-4 text-caption-bold text-subtext-color">Categoría</th>
                  <th className="pb-2 text-caption-bold text-subtext-color">Estado</th>
                </tr>
              </thead>
              <tbody>
                {draft.lineItems.map((line) => (
                  <tr key={line.lineId} className="border-b border-neutral-border hover:bg-neutral-50">
                    <td className="py-2 pr-4 text-body text-default-font">{line.lineId}</td>
                    <td className="py-2 pr-4 text-body text-default-font">{line.sapCode}</td>
                    <td className="py-2 pr-4 text-body text-default-font">{line.description}</td>
                    <td className="py-2 pr-4 text-body text-default-font">{line.uom}</td>
                    <td className="py-2 pr-4 text-body-bold text-default-font">{line.qty}</td>
                    <td className="py-2 pr-4 text-body text-default-font">{line.category}</td>
                    <td className="py-2">
                      <EstadoBadge estado={line.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default DraftEditorPage;
