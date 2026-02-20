"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { ProyectoNexusSidebar } from "@/components/ProyectoNexusSidebar";
import { Alert } from "@/ui/components/Alert";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { getSentPoDrafts } from "@/lib/drafts/storage";
import {
  archiveTransitOrder,
  cancelTransitOrder,
  getTransitState,
  setTransitStatus,
  type TransitOrderStatus,
} from "@/lib/transit/storage";
import { FeatherArchive } from "@subframe/core";
import { FeatherChevronDown } from "@subframe/core";
import { FeatherChevronUp } from "@subframe/core";
import { FeatherX } from "@subframe/core";

type OrderStatus = TransitOrderStatus;

interface TransitOrder {
  id: string;
  projectId: string;
  revisionId: string;
  supplierName: string;
  status: OrderStatus;
  sentAt: string;
}

const MOCK_TRANSIT_ORDERS: TransitOrder[] = [
  { id: "ord-1", projectId: "PRJ-2847", revisionId: "Rev04", supplierName: "Acme Steel Co.", status: "en_transito", sentAt: "2025-02-15" },
  { id: "ord-2", projectId: "PRJ-2847", revisionId: "Rev04", supplierName: "ElectroComponents SA", status: "confirmada", sentAt: "2025-02-16" },
  { id: "ord-3", projectId: "PRJ-2999", revisionId: "Rev01", supplierName: "FastBolts Inc.", status: "entregada", sentAt: "2025-02-10" },
  { id: "ord-4", projectId: "PRJ-2847", revisionId: "Rev04", supplierName: "Pinturas del Norte", status: "enviada", sentAt: "2025-02-17" },
  { id: "ord-5", projectId: "PRJ-2999", revisionId: "Rev01", supplierName: "Metales y Aleaciones", status: "entregada", sentAt: "2025-02-08" },
];

function draftToTransitOrder(d: { id: string; projectId: string; revisionId: string; supplierName: string; updatedAt: string }): TransitOrder {
  const sentDate = d.updatedAt.slice(0, 10);
  return {
    id: d.id,
    projectId: d.projectId,
    revisionId: d.revisionId,
    supplierName: d.supplierName,
    status: "enviada",
    sentAt: sentDate,
  };
}

function statusLabel(s: OrderStatus): string {
  switch (s) {
    case "enviada": return "Enviada";
    case "confirmada": return "Confirmada";
    case "en_transito": return "En tránsito";
    case "entregada": return "Entregada";
    case "cancelada": return "Cancelada";
    default: return s;
  }
}

function statusVariant(s: OrderStatus): "neutral" | "info" | "success" | "warning" | "error" | "purple" {
  switch (s) {
    case "enviada": return "neutral";
    case "confirmada": return "info";
    case "en_transito": return "warning";
    case "entregada": return "success";
    case "cancelada": return "error";
    default: return "neutral";
  }
}

const STATUS_ORDER: OrderStatus[] = ["enviada", "confirmada", "en_transito", "entregada", "cancelada"];
const GROUP_LABELS: Record<OrderStatus, string> = {
  enviada: "Enviadas",
  confirmada: "Confirmadas",
  en_transito: "En tránsito",
  entregada: "Entregadas",
  cancelada: "Canceladas",
};

export function TransitPage() {
  const location = useLocation();
  const [showArchived, setShowArchived] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const applyTransitState = useCallback((order: TransitOrder): TransitOrder => {
    const stored = getTransitState(order.id);
    if (stored?.cancelled) return { ...order, status: "cancelada" as const };
    if (stored?.status) return { ...order, status: stored.status };
    return order;
  }, []);

  const allOrders = useMemo(() => {
    const sent = getSentPoDrafts().map(draftToTransitOrder);
    const mock = MOCK_TRANSIT_ORDERS.filter((m) => !sent.some((s) => s.id === m.id));
    const combined = [...sent, ...mock].map(applyTransitState);
    return combined;
  }, [location.key, refreshKey, applyTransitState]);

  const { active, archived } = useMemo(() => {
    const storedArchived = new Set(
      allOrders.filter((o) => getTransitState(o.id)?.archived).map((o) => o.id)
    );
    const active = allOrders.filter((o) => !storedArchived.has(o.id));
    const archived = allOrders.filter((o) => storedArchived.has(o.id));
    return { active, archived };
  }, [allOrders]);

  const grouped = useMemo(() => {
    const map = new Map<OrderStatus, TransitOrder[]>();
    for (const s of STATUS_ORDER) map.set(s, []);
    for (const o of active) {
      const list = map.get(o.status) ?? [];
      list.push(o);
      map.set(o.status, list);
    }
    return map;
  }, [active]);

  const handleArchive = (orderId: string) => {
    archiveTransitOrder(orderId);
    setRefreshKey((k) => k + 1);
  };

  const handleCancel = (orderId: string) => {
    if (window.confirm("¿Cancelar esta orden? La suspensión quedará registrada.")) {
      cancelTransitOrder(orderId);
      setRefreshKey((k) => k + 1);
    }
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setTransitStatus(orderId, newStatus);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="flex min-h-screen w-full items-start bg-neutral-50">
      <ProyectoNexusSidebar />
      <div className="flex grow flex-col items-start px-8 py-8">
        <span className="text-heading-2 font-heading-2 text-default-font mb-2 block">
          Órdenes en curso
        </span>
        <p className="text-body text-subtext-color mb-4">
          Estado de las órdenes de compra enviadas a proveedores.
        </p>

        <Alert
          variant="neutral"
          title="Modo demo"
          description="Los estados se actualizan manualmente. En producción recibiríamos actualizaciones automáticas del proveedor y de la logística."
          className="mb-6 w-full max-w-2xl"
        />

        {/* Grupos por estado */}
        <div className="flex w-full flex-col gap-6">
          {STATUS_ORDER.map((status) => {
            const orders = grouped.get(status) ?? [];
            if (orders.length === 0 && status !== "cancelada") return null;
            if (orders.length === 0 && status === "cancelada") return null;

            return (
              <div key={status} className="flex flex-col gap-2 rounded-lg border border-solid border-neutral-border bg-white overflow-hidden">
                <div className="flex items-center justify-between px-6 py-3 bg-neutral-50 border-b border-neutral-border">
                  <span className="text-body-bold font-body-bold text-default-font">
                    {GROUP_LABELS[status]}
                  </span>
                  <Badge variant={statusVariant(status)}>{orders.length}</Badge>
                </div>
                <div className="flex flex-col">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex w-full items-center gap-4 px-6 py-4 border-b border-neutral-border last:border-b-0 hover:bg-neutral-50"
                    >
                      <span className="w-24 text-body font-body text-default-font">
                        {order.projectId} {order.revisionId}
                      </span>
                      <span className="w-40 text-body font-body text-default-font">{order.supplierName}</span>
                      <span className="w-28 text-body font-body text-subtext-color">{order.sentAt}</span>
                      <Badge variant={statusVariant(order.status)}>{statusLabel(order.status)}</Badge>
                      <div className="flex flex-1 items-center gap-2 justify-end">
                        {order.status === "entregada" && (
                          <Button variant="neutral-tertiary" size="small" icon={<FeatherArchive />} onClick={() => handleArchive(order.id)}>
                            Archivar
                          </Button>
                        )}
                        {order.status !== "cancelada" && order.status !== "entregada" && (
                          <>
                            {order.status !== "confirmada" && (
                              <Button variant="neutral-tertiary" size="small" onClick={() => handleStatusChange(order.id, "confirmada")}>
                                Confirmar
                              </Button>
                            )}
                            {order.status !== "en_transito" && (
                              <Button variant="neutral-tertiary" size="small" onClick={() => handleStatusChange(order.id, "en_transito")}>
                                En tránsito
                              </Button>
                            )}
                            <Button variant="neutral-tertiary" size="small" onClick={() => handleStatusChange(order.id, "entregada")}>
                              Entregada
                            </Button>
                            <Button variant="neutral-tertiary" size="small" icon={<FeatherX />} onClick={() => handleCancel(order.id)}>
                              Cancelar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Archivadas */}
        {archived.length > 0 && (
          <div className="flex w-full flex-col gap-2 mt-6">
            <button
              type="button"
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2 text-body font-body text-default-font hover:text-brand-600 py-2"
            >
              {showArchived ? <FeatherChevronUp className="h-4 w-4" /> : <FeatherChevronDown className="h-4 w-4" />}
              Archivadas ({archived.length})
            </button>
            {showArchived && (
              <div className="flex flex-col gap-2 rounded-lg border border-solid border-neutral-border bg-white overflow-hidden">
                {archived.map((order) => (
                  <div
                    key={order.id}
                    className="flex w-full items-center gap-4 px-6 py-4 border-b border-neutral-border last:border-b-0 bg-neutral-50"
                  >
                    <span className="w-24 text-body font-body text-subtext-color">
                      {order.projectId} {order.revisionId}
                    </span>
                    <span className="w-40 text-body font-body text-subtext-color">{order.supplierName}</span>
                    <span className="w-28 text-caption text-subtext-color">{order.sentAt}</span>
                    <Badge variant="purple">Archivada</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TransitPage;
