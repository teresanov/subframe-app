"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/ui/components/Button";

/**
 * BOM Inbox – lista de emails con adjuntos BOM.
 *
 * Para reemplazar con el diseño real de Subframe:
 * 1. Abre https://app.subframe.com/fd4b193724a6/design/fffb2b6a-34d5-4f50-8f3e-06e5e2585e7e/edit
 * 2. Exporta / copia el código de la página.
 * 3. Sustituye el contenido de este archivo por ese código (mantén el export default).
 */
export function InboxPage() {
  return (
    <div className="flex h-full flex-col gap-6 overflow-auto p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading-1 font-heading-1 text-neutral-900">
          Inbox
        </h1>
      </div>
      <div className="rounded-lg border border-neutral-200 bg-white p-8">
        <p className="text-body font-body text-neutral-600">
          Contenido de <strong>BOM Inbox</strong>. Aquí irá la tabla de emails y
          el drawer de detalle al hacer clic en un email.
        </p>
        <p className="mt-4 text-caption font-caption text-neutral-500">
          Flujo: al abrir un email, el CTA principal debe llevar a la revisión
          BOM de ese proyecto.
        </p>
        <div className="mt-6">
          <Link to="/revision/PRJ-2007/Rev07">
            <Button variant="brand-primary">Abrir proyecto y revisión (PRJ-2007 · Rev07)</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
