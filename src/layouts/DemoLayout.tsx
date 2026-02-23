"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/ui/components/Button";
import { FeatherCornerUpLeft } from "@subframe/core";

interface DemoLayoutProps {
  stepPanel: React.ReactNode;
  stagePanel: React.ReactNode;
  stepperNode?: React.ReactNode;
  /** Indicador visible en la zona de contenido para que el usuario sepa en qué paso está */
  stepBanner?: { step: number; total: number; title: string };
  onContinue: () => void;
  onBack?: () => void;
  canContinue?: boolean;
  canBack?: boolean;
  continueLabel?: string;
}

export function DemoLayout({
  stepPanel,
  stagePanel,
  stepperNode,
  stepBanner,
  onContinue,
  onBack,
  canContinue = true,
  canBack = false,
  continueLabel = "Continuar",
}: DemoLayoutProps) {
  return (
    <div className="flex h-screen w-full flex-col bg-neutral-50">
      <header className="flex w-full items-center justify-between gap-4 border-b border-neutral-border bg-white px-6 py-3">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-caption font-caption text-subtext-color transition-colors hover:bg-neutral-50 hover:text-neutral-700"
          >
            <FeatherCornerUpLeft className="h-4 w-4" />
            <span>Ir al inicio</span>
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600">
            <span className="text-body-bold font-body-bold text-white">PN</span>
          </div>
          <span className="text-heading-3 font-heading-3 text-default-font">
            Proyecto Nexus — Asistente guiado
          </span>
        </div>
      </header>

      <div className="flex grow overflow-hidden">
        <aside className="flex w-80 flex-shrink-0 flex-col overflow-auto border-r border-neutral-border bg-white p-6">
          {stepperNode}
          {stepPanel}
        </aside>
        <main className="flex min-w-0 flex-1 flex-col overflow-auto">
          {stepBanner && (
            <div className="flex shrink-0 items-center gap-3 border-b border-neutral-border bg-brand-50 px-6 py-3">
              <span className="rounded-md bg-brand-600 px-2 py-0.5 text-caption-bold font-caption-bold text-white">
                Paso {stepBanner.step} de {stepBanner.total}
              </span>
              <span className="text-body font-body text-default-font">{stepBanner.title}</span>
            </div>
          )}
          <div className="flex min-h-0 flex-1 flex-col overflow-auto p-6">
            {stagePanel}
          </div>
        </main>
      </div>

      <footer className="flex items-center justify-between border-t border-neutral-border bg-white px-6 py-4">
        <div>
          {onBack && (
            <Button
              variant="neutral-secondary"
              onClick={onBack}
              disabled={!canBack}
            >
              Atrás
            </Button>
          )}
        </div>
        <Button variant="brand-primary" onClick={onContinue} disabled={!canContinue}>
          {continueLabel}
        </Button>
      </footer>
    </div>
  );
}
