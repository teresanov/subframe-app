"use client";

import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/ui/components/Badge";
import { getSentDrafts } from "@/lib/drafts/storage";
import { Side_Bar } from "@/ui/components/Side_Bar";
import { FeatherBarChart2 } from "@subframe/core";
import { FeatherClock } from "@subframe/core";
import { FeatherDollarSign } from "@subframe/core";
import { FeatherFileText } from "@subframe/core";
import { FeatherHome } from "@subframe/core";
import { FeatherShoppingCart } from "@subframe/core";
import { FeatherStar } from "@subframe/core";
import { FeatherTruck } from "@subframe/core";
import { FeatherUserPlus } from "@subframe/core";
import { FeatherUsers } from "@subframe/core";

type OrderStatus = "enviada" | "confirmada" | "en_transito" | "entregada";

interface TransitOrder {
  id: string;
  projectId: string;
  revisionId: string;
  supplierName: string;
  status: OrderStatus;
  sentAt: string;
  type: "rfq" | "po";
}

const MOCK_TRANSIT_ORDERS: TransitOrder[] = [
  { id: "ord-1", projectId: "PRJ-2847", revisionId: "Rev04", supplierName: "Acme Steel Co.", status: "en_transito", sentAt: "2025-02-15", type: "po" },
  { id: "ord-2", projectId: "PRJ-2847", revisionId: "Rev04", supplierName: "ElectroComponents SA", status: "confirmada", sentAt: "2025-02-16", type: "po" },
  { id: "ord-3", projectId: "PRJ-2999", revisionId: "Rev01", supplierName: "FastBolts Inc.", status: "entregada", sentAt: "2025-02-10", type: "po" },
];

function draftToTransitOrder(d: { id: string; projectId: string; revisionId: string; supplierName: string; updatedAt: string; type: "rfq" | "po" }): TransitOrder {
  const sentDate = d.updatedAt.slice(0, 10);
  return {
    id: d.id,
    projectId: d.projectId,
    revisionId: d.revisionId,
    supplierName: d.supplierName,
    status: "enviada",
    sentAt: sentDate,
    type: d.type,
  };
}

function statusLabel(s: OrderStatus): string {
  switch (s) {
    case "enviada": return "Enviada";
    case "confirmada": return "Confirmada";
    case "en_transito": return "En tránsito";
    case "entregada": return "Entregada";
    default: return s;
  }
}

function statusVariant(s: OrderStatus): "neutral" | "brand" | "success" | "warning" {
  switch (s) {
    case "en_transito": return "brand";
    case "confirmada": return "warning";
    case "entregada": return "success";
    default: return "neutral";
  }
}

export function TransitPage() {
  const location = useLocation();
  const transitOrders = useMemo(() => {
    const sent = getSentDrafts().map(draftToTransitOrder);
    return sent.length > 0 ? sent : MOCK_TRANSIT_ORDERS;
  }, [location.key]);

  return (
    <div className="flex min-h-screen w-full items-start bg-neutral-50">
      <div className="flex w-60 flex-none flex-col items-start self-stretch border-r border-solid border-neutral-border bg-default-background">
        <div className="flex w-full flex-col items-start gap-2 px-6 py-6">
          <div className="flex w-full items-center gap-3">
            <div className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-brand-600">
              <span className="text-body-bold font-body-bold text-white">PN</span>
            </div>
            <span className="text-heading-3 font-heading-3 text-default-font">Proyecto Nexus</span>
          </div>
        </div>
        <Side_Bar
          homeItem={
            <Link to="/inbox" className="block w-full">
              <div className="flex w-full items-center gap-2 rounded-md px-3 py-2 cursor-pointer hover:bg-neutral-50">
                <FeatherHome className="text-heading-3 font-heading-3 text-neutral-600" />
                <span className="line-clamp-1 grow shrink-0 basis-0 text-body-bold font-body-bold text-neutral-600">
                  Inbox
                </span>
              </div>
            </Link>
          }
          ordersSectionTitle="Órdenes de compra"
          ordersItems={
            <>
              <Link to="/proyectos" className="block w-full">
                <div className="flex w-full items-center gap-2 rounded-md px-3 py-2 cursor-pointer hover:bg-neutral-50">
                  <FeatherShoppingCart className="text-heading-3 font-heading-3 text-neutral-600" />
                  <span className="line-clamp-1 grow shrink-0 basis-0 text-body-bold font-body-bold text-neutral-600">
                    Proyectos BOM
                  </span>
                </div>
              </Link>
              <Link to="/plan" className="block w-full">
                <div className="flex w-full items-center gap-2 rounded-md px-3 py-2 cursor-pointer hover:bg-neutral-50">
                  <FeatherFileText className="text-heading-3 font-heading-3 text-neutral-600" />
                  <span className="line-clamp-1 grow shrink-0 basis-0 text-body-bold font-body-bold text-neutral-600">
                    Plan de compra
                  </span>
                </div>
              </Link>
              <Link to="/borradores" className="block w-full">
                <div className="flex w-full items-center gap-2 rounded-md px-3 py-2 cursor-pointer hover:bg-neutral-50">
                  <FeatherClock className="text-heading-3 font-heading-3 text-neutral-600" />
                  <span className="line-clamp-1 grow shrink-0 basis-0 text-body-bold font-body-bold text-neutral-600">
                    Borradores
                  </span>
                </div>
              </Link>
              <div className="flex w-full items-center gap-2 rounded-md px-3 py-2 bg-brand-50">
                <FeatherTruck className="text-heading-3 font-heading-3 text-brand-700" />
                <span className="line-clamp-1 grow shrink-0 basis-0 text-body-bold font-body-bold text-brand-700">
                  En tránsito
                </span>
              </div>
            </>
          }
          suppliersSectionTitle="Proveedores"
          suppliersItems={
            <>
              <div className="flex w-full items-center gap-2 rounded-md px-3 py-2 cursor-pointer hover:bg-neutral-50 active:bg-neutral-100">
                <FeatherUsers className="text-heading-3 font-heading-3 text-neutral-600" />
                <span className="line-clamp-1 grow shrink-0 basis-0 text-body-bold font-body-bold text-neutral-600">
                  Todos los proveedores
                </span>
              </div>
              <div className="flex w-full items-center gap-2 rounded-md px-3 py-2 cursor-pointer hover:bg-neutral-50 active:bg-neutral-100">
                <FeatherStar className="text-heading-3 font-heading-3 text-neutral-600" />
                <span className="line-clamp-1 grow shrink-0 basis-0 text-body-bold font-body-bold text-neutral-600">
                  Preferidos
                </span>
              </div>
              <div className="flex w-full items-center gap-2 rounded-md px-3 py-2 cursor-pointer hover:bg-neutral-50 active:bg-neutral-100">
                <FeatherUserPlus className="text-heading-3 font-heading-3 text-neutral-600" />
                <span className="line-clamp-1 grow shrink-0 basis-0 text-body-bold font-body-bold text-neutral-600">
                  Añadir proveedor
                </span>
              </div>
            </>
          }
          reportsSectionTitle="Informes"
          reportsItems={
            <>
              <div className="flex w-full items-center gap-2 rounded-md px-3 py-2 cursor-pointer hover:bg-neutral-50 active:bg-neutral-100">
                <FeatherBarChart2 className="text-heading-3 font-heading-3 text-neutral-600" />
                <span className="line-clamp-1 grow shrink-0 basis-0 text-body-bold font-body-bold text-neutral-600">
                  Analítica
                </span>
              </div>
              <div className="flex w-full items-center gap-2 rounded-md px-3 py-2 cursor-pointer hover:bg-neutral-50 active:bg-neutral-100">
                <FeatherDollarSign className="text-heading-3 font-heading-3 text-neutral-600" />
                <span className="line-clamp-1 grow shrink-0 basis-0 text-body-bold font-body-bold text-neutral-600">
                  Análisis de gasto
                </span>
              </div>
            </>
          }
        />
      </div>
      <div className="flex grow flex-col items-start px-8 py-8">
        <span className="text-heading-2 font-heading-2 text-default-font mb-6 block">
          Órdenes en curso
        </span>
        <p className="text-body text-subtext-color mb-6">
          Estado de las órdenes de compra enviadas a proveedores.
        </p>
        <div className="flex w-full flex-col gap-2 rounded-lg border border-solid border-neutral-border bg-white overflow-hidden">
          <div className="flex w-full items-center gap-4 px-6 py-4 border-b border-neutral-border bg-neutral-50">
            <span className="w-24 text-caption-bold text-subtext-color">Proyecto</span>
            <span className="w-28 text-caption-bold text-subtext-color">Tipo</span>
            <span className="w-32 text-caption-bold text-subtext-color">Proveedor</span>
            <span className="w-28 text-caption-bold text-subtext-color">Enviada</span>
            <span className="w-32 text-caption-bold text-subtext-color">Estado</span>
          </div>
          {transitOrders.map((order) => (
            <div
              key={order.id}
              className="flex w-full items-center gap-4 px-6 py-4 border-b border-neutral-border last:border-b-0 hover:bg-neutral-50"
            >
              <span className="w-24 text-body font-body text-default-font">
                {order.projectId} {order.revisionId}
              </span>
              <Badge variant={order.type === "rfq" ? "brand" : "neutral"}>
                {order.type === "rfq" ? "RFQ" : "Orden"}
              </Badge>
              <span className="w-32 text-body font-body text-default-font">{order.supplierName}</span>
              <span className="w-28 text-body font-body text-subtext-color">{order.sentAt}</span>
              <Badge variant={statusVariant(order.status)}>{statusLabel(order.status)}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TransitPage;
