"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Avatar } from "@/ui/components/Avatar";
import { IconButton } from "@/ui/components/IconButton";
import { Side_Bar } from "@/ui/components/Side_Bar";
import {
  FeatherBarChart2,
  FeatherClock,
  FeatherDollarSign,
  FeatherFileText,
  FeatherHome,
  FeatherSettings,
  FeatherShoppingCart,
  FeatherStar,
  FeatherTruck,
  FeatherUserPlus,
  FeatherUsers,
} from "@subframe/core";

/**
 * Sidebar unificado para Proyecto Nexus.
 * Flujo: Inbox (entrada) → Proyectos BOM / Revisión → Plan de compra → Borradores → En tránsito.
 * Todas las páginas principales usan este sidebar para mantener consistencia.
 */
export function ProyectoNexusSidebar() {
  const location = useLocation();
  const path = location.pathname;

  const isInbox = path === "/inbox";
  const isProyectos = path === "/proyectos" || path.startsWith("/proyectos/") || path.startsWith("/revision");
  const isPlan = path === "/plan";
  const isBorradores = path === "/borradores" || path.startsWith("/borradores/") || path.startsWith("/borrador/");
  const isTransito = path === "/transito";

  const navItemClass = (active: boolean) =>
    `flex w-full items-center gap-2 rounded-md px-3 py-2 ${active ? "bg-brand-50" : "hover:bg-neutral-50 active:bg-neutral-100"} cursor-pointer`;
  const iconClass = (active: boolean) =>
    `text-heading-3 font-heading-3 ${active ? "text-brand-700" : "text-neutral-600"}`;
  const textClass = (active: boolean) =>
    `line-clamp-1 grow shrink-0 basis-0 text-body-bold font-body-bold ${active ? "text-brand-700" : "text-neutral-600"}`;

  const NavLink = ({
    to,
    active,
    icon,
    label,
  }: {
    to: string;
    active: boolean;
    icon: React.ReactNode;
    label: string;
  }) => {
    if (active) {
      return (
        <div className={navItemClass(true)}>
          {icon}
          <span className={textClass(true)}>{label}</span>
        </div>
      );
    }
    return (
      <Link to={to} className="block w-full">
        <div className={navItemClass(false)}>
          {icon}
          <span className={textClass(false)}>{label}</span>
        </div>
      </Link>
    );
  };

  return (
    <div className="flex w-60 flex-none flex-col items-start self-stretch border-r border-solid border-neutral-border bg-default-background">
      <div className="flex w-full flex-col items-start gap-2 px-6 py-6">
        <div className="flex w-full items-center gap-3">
          <div className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-brand-600">
            <span className="text-body-bold font-body-bold text-white">PN</span>
          </div>
          <span className="text-heading-3 font-heading-3 text-default-font">
            Proyecto Nexus
          </span>
        </div>
      </div>
      <Side_Bar
        homeItem={
          <NavLink
            to="/inbox"
            active={isInbox}
            icon={<FeatherHome className={iconClass(isInbox)} />}
            label="Inbox"
          />
        }
        ordersSectionTitle="Órdenes de compra"
        ordersItems={
          <>
            <NavLink
              to="/proyectos"
              active={isProyectos}
              icon={<FeatherShoppingCart className={iconClass(isProyectos)} />}
              label="Proyectos BOM"
            />
            <NavLink
              to="/plan"
              active={isPlan}
              icon={<FeatherFileText className={iconClass(isPlan)} />}
              label="Plan de compra"
            />
            <NavLink
              to="/borradores"
              active={isBorradores}
              icon={<FeatherClock className={iconClass(isBorradores)} />}
              label="Borradores"
            />
            <NavLink
              to="/transito"
              active={isTransito}
              icon={<FeatherTruck className={iconClass(isTransito)} />}
              label="En tránsito"
            />
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
      <div className="flex w-full flex-col gap-3 border-t border-solid border-neutral-border px-6 py-6">
        <div className="flex w-full items-center gap-4">
          <div className="flex grow shrink-0 basis-0 items-start gap-2">
            <Avatar
              size="small"
              image="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop"
            />
            <div className="flex flex-col items-start">
              <span className="text-caption-bold font-caption-bold text-default-font">
                Alex Chen
              </span>
              <span className="text-caption font-caption text-subtext-color">
                Responsable de compras
              </span>
            </div>
          </div>
          <IconButton
            size="small"
            icon={<FeatherSettings />}
            onClick={() => {}}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("¿Resetear todos los datos de desarrollo? Se borrarán borradores, decisiones y estado de revisión.")) {
              ["nexus:drafts:v1", "nexus:plan:revisado:v1", "nexus:quote:decisions:v1", "nexus:incidents:v1", "nexus:transit:v1"].forEach((k) =>
                localStorage.removeItem(k)
              );
              window.location.reload();
            }
          }}
          className="text-left text-caption font-caption text-subtext-color hover:text-neutral-700 hover:underline"
        >
          Reset datos (dev)
        </button>
      </div>
    </div>
  );
}
