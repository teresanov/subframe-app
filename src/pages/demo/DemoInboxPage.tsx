"use client";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { FeatherArrowRight } from "@subframe/core";
import { FeatherCornerUpLeft } from "@subframe/core";
import {
  MOCK_INBOX_EMAILS,
  type InboxEmail,
} from "@/lib/inbox/mockEmails";

const DEMO_EMAILS = MOCK_INBOX_EMAILS.filter(
  (e) => e.emailType === "peticion_compra" && e.validation === "valid"
);

export function DemoInboxPage() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = DEMO_EMAILS.find((e) => e.id === selectedId);

  const handleStartDemo = () => {
    if (!selected) return;
    navigate("/demo/runner", {
      state: { projectId: selected.projectId, revisionId: selected.revisionId, emailId: selected.id },
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-neutral-50">
      <header className="flex w-full items-center justify-between gap-4 border-b border-neutral-border bg-white px-8 py-4">
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

      <main className="flex grow flex-col gap-6 overflow-auto px-8 py-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-heading-1 font-heading-1 text-default-font">
            Inbox de emails
          </h1>
          <p className="text-body font-body text-subtext-color">
            Selecciona un email con petición de compra válida para iniciar la demo.
          </p>
        </div>

        <div className="flex w-full gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-lg border border-neutral-border bg-white overflow-hidden">
            <div className="flex items-center gap-4 border-b border-neutral-border bg-neutral-50 px-4 py-3">
              <span className="w-48 text-caption-bold text-subtext-color">Remitente</span>
              <span className="flex-1 text-caption-bold text-subtext-color">Asunto</span>
              <span className="w-24 text-caption-bold text-subtext-color">Proyecto</span>
              <span className="w-16 text-caption-bold text-subtext-color">Revisión</span>
            </div>
            {DEMO_EMAILS.map((email) => (
              <button
                key={email.id}
                type="button"
                onClick={() => setSelectedId(email.id)}
                className={`flex items-center gap-4 px-4 py-3 text-left transition-colors ${
                  selectedId === email.id ? "bg-brand-50" : "hover:bg-neutral-50"
                }`}
              >
                <span className="w-48 truncate text-body font-body text-default-font">
                  {email.senderName}
                </span>
                <span className="flex-1 truncate text-body font-body text-default-font">
                  {email.subject}
                </span>
                <span className="w-24 text-body font-body text-default-font">{email.projectId}</span>
                <span className="w-16 text-body font-body text-subtext-color">{email.revisionId}</span>
              </button>
            ))}
          </div>

          {selected && (
            <div className="flex w-80 flex-shrink-0 flex-col gap-4 rounded-lg border border-neutral-border bg-white p-4">
              <div className="flex flex-col gap-2">
                <span className="text-heading-3 font-heading-3 text-default-font">
                  {selected.senderName}
                </span>
                <span className="text-caption font-caption text-subtext-color">
                  {selected.senderEmail}
                </span>
                <p className="text-body font-body text-default-font">{selected.subject}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="neutral">{selected.projectId}</Badge>
                  <Badge variant="neutral">{selected.revisionId}</Badge>
                </div>
              </div>
              <Button
                className="w-full"
                variant="brand-primary"
                icon={<FeatherArrowRight className="h-4 w-4" />}
                onClick={handleStartDemo}
              >
                Iniciar demo
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
