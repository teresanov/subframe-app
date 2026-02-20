"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/ui/components/Button";
import { FeatherArrowRight } from "@subframe/core";
import { FeatherCompass } from "@subframe/core";

export function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-neutral-50 px-6 py-12">
      <div className="flex w-full max-w-2xl flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-600">
            <span className="text-heading-1 font-heading-1 text-white">PN</span>
          </div>
          <h1 className="text-heading-1 font-heading-1 text-default-font">
            Proyecto Nexus
          </h1>
          <p className="text-body font-body text-subtext-color">
            Compras Asia: Gestión de revisiones BOM
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate("/demo/inbox")}
            className="flex flex-col items-start gap-4 rounded-lg border border-solid border-neutral-border bg-white p-6 text-left transition-colors hover:border-brand-300 hover:bg-neutral-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-100">
              <FeatherArrowRight className="h-5 w-5 text-brand-600" />
            </div>
            <div className="flex flex-col items-start gap-1">
              <span className="text-heading-3 font-heading-3 text-default-font">
                Iniciar asistente guiado
              </span>
              <span className="text-body font-body text-subtext-color">
                Recorre el flujo completo: email → BOM → delta → plan de compra → borradores
              </span>
            </div>
            <span className="text-caption font-caption text-brand-600">
              Ir a demo →
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/app/inbox")}
            className="flex flex-col items-start gap-4 rounded-lg border border-solid border-neutral-border bg-white p-6 text-left transition-colors hover:border-brand-300 hover:bg-neutral-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100">
              <FeatherCompass className="h-5 w-5 text-neutral-600" />
            </div>
            <div className="flex flex-col items-start gap-1">
              <span className="text-heading-3 font-heading-3 text-default-font">
                Explorar producto
              </span>
              <span className="text-body font-body text-subtext-color">
                Navega libremente con datos de ejemplo (Inbox, Proyectos, Borradores…)
              </span>
            </div>
            <span className="text-caption font-caption text-brand-600">
              Entrar a la app →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
