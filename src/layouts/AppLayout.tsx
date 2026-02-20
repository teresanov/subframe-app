"use client";

import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { SidebarWithSections } from "@/ui/components/SidebarWithSections";

export function AppLayout() {
  const location = useLocation();
  const isInbox = location.pathname.startsWith("/app/inbox");
  const isProyectos = location.pathname.startsWith("/app/proyectos");

  return (
    <div className="flex h-screen w-full">
      <SidebarWithSections
        header={
          <>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-neutral-200" aria-hidden />
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-body-bold font-body-bold text-neutral-900">
                  Proyecto Nexus
                </span>
                <span className="text-caption font-caption text-neutral-500">
                  Compras Asia: Gestión de revisiones BOM
                </span>
              </div>
            </div>
          </>
        }
      >
        <SidebarWithSections.NavSection label="Órdenes de compra">
          <Link to="/app/inbox">
            <SidebarWithSections.NavItem selected={isInbox}>
              Inbox
            </SidebarWithSections.NavItem>
          </Link>
          <Link to="/app/proyectos">
            <SidebarWithSections.NavItem selected={isProyectos}>
              Proyectos BOM
            </SidebarWithSections.NavItem>
          </Link>
        </SidebarWithSections.NavSection>
      </SidebarWithSections>
      <main className="flex flex-1 flex-col overflow-hidden bg-neutral-50">
        <Outlet />
      </main>
    </div>
  );
}
