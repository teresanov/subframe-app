"use client";

import React from "react";
import { Button } from "@/ui/components/Button";

interface DemoLayoutProps {
  stepPanel: React.ReactNode;
  stagePanel: React.ReactNode;
  onContinue: () => void;
  canContinue?: boolean;
  continueLabel?: string;
}

export function DemoLayout({
  stepPanel,
  stagePanel,
  onContinue,
  canContinue = true,
  continueLabel = "Continuar",
}: DemoLayoutProps) {
  return (
    <div className="flex h-screen w-full flex-col bg-neutral-50">
      <header className="flex w-full items-center gap-4 border-b border-neutral-border bg-white px-6 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600">
          <span className="text-body-bold font-body-bold text-white">PN</span>
        </div>
        <span className="text-heading-3 font-heading-3 text-default-font">
          Proyecto Nexus — Asistente guiado
        </span>
      </header>

      <div className="flex grow overflow-hidden">
        <aside className="flex w-80 flex-shrink-0 flex-col overflow-auto border-r border-neutral-border bg-white p-6">
          {stepPanel}
        </aside>
        <main className="flex min-w-0 flex-1 flex-col overflow-auto p-6">
          {stagePanel}
        </main>
      </div>

      <footer className="flex items-center justify-end border-t border-neutral-border bg-white px-6 py-4">
        <Button variant="brand-primary" onClick={onContinue} disabled={!canContinue}>
          {continueLabel}
        </Button>
      </footer>
    </div>
  );
}
