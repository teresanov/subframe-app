"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { ProyectoNexusSidebar } from "@/components/ProyectoNexusSidebar";
import { Avatar } from "@/ui/components/Avatar";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { Alert } from "@/ui/components/Alert";
import { IconButton } from "@/ui/components/IconButton";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { TextField } from "@/ui/components/TextField";
import { FeatherAlertCircle } from "@subframe/core";
import { FeatherArrowRight } from "@subframe/core";
import { FeatherCheck } from "@subframe/core";
import { FeatherChevronDown } from "@subframe/core";
import { FeatherDollarSign } from "@subframe/core";
import { FeatherDownload } from "@subframe/core";
import { FeatherEye } from "@subframe/core";
import { FeatherFile } from "@subframe/core";
import { FeatherFileSpreadsheet } from "@subframe/core";
import { FeatherFileText } from "@subframe/core";
import { FeatherRefreshCw } from "@subframe/core";
import { FeatherSearch } from "@subframe/core";
import { FeatherX } from "@subframe/core";
import { FeatherZap } from "@subframe/core";
import {
  MOCK_INBOX_EMAILS,
  type EmailType,
  type InboxEmail,
} from "@/lib/inbox/mockEmails";

type InboxEmailId = string;

export type DemoContext = {
  projectId: string;
  revisionId: string;
  emailId: string;
};

type Props = {
  embedMode?: boolean;
  demoContext?: DemoContext;
};

export function NexusProcurementDashboard({ embedMode = false, demoContext }: Props) {
  const navigate = useNavigate();
  const [selectedEmail, setSelectedEmail] = React.useState<InboxEmailId>(
    demoContext?.emailId ?? "PRJ-2850/Rev02"
  );
  const [filterEmailType, setFilterEmailType] = React.useState<EmailType | "">("");
  const [resendRequestedIds, setResendRequestedIds] = React.useState<Set<string>>(new Set());

  const filteredEmails = React.useMemo(() => {
    if (!filterEmailType) return MOCK_INBOX_EMAILS;
    return MOCK_INBOX_EMAILS.filter((e) => e.emailType === filterEmailType);
  }, [filterEmailType]);

  function renderTypeBadge(email: InboxEmail) {
    switch (email.emailType) {
      case "peticion_compra":
        return (
          <Badge variant="neutral" icon={<FeatherFileText />}>
            Petición
          </Badge>
        );
      case "presupuesto_proveedor":
        return (
          <Badge variant="brand" icon={<FeatherDollarSign />}>
            Presupuesto
          </Badge>
        );
      case "incidencia_proveedor":
        return (
          <Badge variant="error" icon={<FeatherAlertCircle />}>
            Incidencia
          </Badge>
        );
      default:
        return null;
    }
  }

  return (
    <div className="flex h-full w-full items-start bg-neutral-50">
      {!embedMode && <ProyectoNexusSidebar />}
      <div className="flex grow shrink-0 basis-0 flex-col items-start self-stretch bg-neutral-50" data-demo-highlight="demo-step1">
        <div className="flex w-full flex-col items-start gap-6 bg-default-background px-12 py-8">
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col items-start gap-1">
              <span className="text-heading-1 font-heading-1 text-default-font">
                Bandeja de BOM
              </span>
              <span className="text-body font-body text-subtext-color">
                Emails con adjuntos de lista de materiales
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="neutral-secondary"
                icon={<FeatherRefreshCw />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              >
                Actualizar
              </Button>
            </div>
          </div>
          <div className="flex w-full items-center gap-2">
            <div className="flex grow shrink-0 basis-0 items-center gap-2">
              <Button
                variant={!filterEmailType ? "brand-secondary" : "neutral-tertiary"}
                onClick={() => setFilterEmailType("")}
              >
                Todos
              </Button>
              <Button
                variant={filterEmailType === "peticion_compra" ? "brand-secondary" : "neutral-tertiary"}
                onClick={() => setFilterEmailType("peticion_compra")}
              >
                Peticiones
              </Button>
              <Button
                variant={filterEmailType === "presupuesto_proveedor" ? "brand-secondary" : "neutral-tertiary"}
                onClick={() => setFilterEmailType("presupuesto_proveedor")}
              >
                Presupuestos
              </Button>
              <Button
                variant={filterEmailType === "incidencia_proveedor" ? "brand-secondary" : "neutral-tertiary"}
                onClick={() => setFilterEmailType("incidencia_proveedor")}
              >
                Incidencias
              </Button>
              <span className="text-caption font-caption text-subtext-color">
                {filteredEmails.length} emails
              </span>
            </div>
            <TextField
              className="h-auto w-80 flex-none"
              variant="filled"
              label=""
              helpText=""
              icon={<FeatherSearch />}
            >
              <TextField.Input
                placeholder="Buscar emails, proyectos, remitentes..."
                value=""
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
              />
            </TextField>
          </div>
        </div>
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start overflow-hidden px-12 pb-8">
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-lg border border-solid border-neutral-border bg-white">
            <div className="flex w-full items-start overflow-x-auto">
              <div className="flex grow shrink-0 basis-0 items-start bg-white">
                <div className="flex h-10 grow shrink-0 basis-0 items-center gap-1 px-4 text-left">
                  <span className="whitespace-nowrap text-caption-bold font-caption-bold text-subtext-color">
                    Remitente
                  </span>
                </div>
                <div className="flex h-10 grow shrink-0 basis-0 items-center gap-1 px-4 text-left">
                  <span className="whitespace-nowrap text-caption-bold font-caption-bold text-subtext-color">
                    Asunto
                  </span>
                </div>
                <div className="flex h-10 grow shrink-0 basis-0 items-center gap-1 px-4 text-left">
                  <span className="whitespace-nowrap text-caption-bold font-caption-bold text-subtext-color">
                    Fecha
                  </span>
                </div>
                <div className="flex h-10 grow shrink-0 basis-0 items-center gap-1 px-4 text-left">
                  <span className="whitespace-nowrap text-caption-bold font-caption-bold text-subtext-color">
                    ID de Proyecto
                  </span>
                </div>
                <div className="flex h-10 grow shrink-0 basis-0 items-center gap-1 px-4 text-left">
                  <span className="whitespace-nowrap text-caption-bold font-caption-bold text-subtext-color">
                    Revisión
                  </span>
                </div>
                <div className="flex h-10 w-32 flex-none items-center gap-1 px-4 text-left">
                  <span className="whitespace-nowrap text-caption-bold font-caption-bold text-subtext-color">
                    Tipo
                  </span>
                </div>
                <div className="flex h-10 grow shrink-0 basis-0 items-center gap-1 px-4 text-left">
                  <span className="whitespace-nowrap text-caption-bold font-caption-bold text-subtext-color">
                    Validación
                  </span>
                </div>
                <div className="flex h-10 w-12 flex-none items-center gap-1 px-4 text-left" />
              </div>
            </div>
            <div className="flex w-full grow shrink-0 basis-0 flex-col items-start overflow-y-auto">
              {filteredEmails.map((email) => (
              <div
                key={email.id}
                role="button"
                tabIndex={0}
                className={`flex w-full grow shrink-0 basis-0 items-start border-t border-solid border-neutral-border cursor-pointer hover:bg-neutral-50 ${selectedEmail === email.id ? "bg-brand-50" : ""}`}
                onClick={() => setSelectedEmail(email.id)}
                onKeyDown={(e) => e.key === "Enter" && setSelectedEmail(email.id)}
              >
                <div className="flex h-16 grow shrink-0 basis-0 items-center gap-3 px-4">
                  <Avatar size="medium" image={email.senderAvatar}>
                    {email.senderName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-body-bold font-body-bold text-default-font">
                      {email.senderName}
                    </span>
                    <span className="text-caption font-caption text-subtext-color">
                      {email.senderEmail}
                    </span>
                  </div>
                </div>
                <div className="flex h-16 grow shrink-0 basis-0 items-center gap-1 px-4">
                  <span className="line-clamp-2 text-body font-body text-default-font">
                    {email.subject}
                  </span>
                </div>
                <div className="flex h-16 grow shrink-0 basis-0 items-center gap-1 px-4">
                  <span className="text-body font-body text-subtext-color">
                    {email.date}
                  </span>
                </div>
                <div className="flex h-16 grow shrink-0 basis-0 items-center gap-1 px-4">
                  <span className="text-body-bold font-body-bold text-default-font">
                    {email.projectId}
                  </span>
                </div>
                <div className="flex h-16 grow shrink-0 basis-0 items-center gap-1 px-4">
                  <span className="text-body font-body text-default-font">
                    {email.revisionId}
                  </span>
                </div>
                <div className="flex h-16 w-32 flex-none items-center gap-1 px-4">
                  {renderTypeBadge(email)}
                </div>
                <div className="flex h-16 grow shrink-0 basis-0 items-center gap-1 px-4">
                  <Badge variant={email.validation === "valid" ? "success" : "error"} icon={email.validation === "valid" ? <FeatherCheck /> : <FeatherX />}>
                    {email.validation === "valid" ? "Válido" : "Inválido"}
                  </Badge>
                </div>
                <div className="flex h-16 w-12 flex-none items-center justify-end gap-2 px-4">
                  <IconButton
                    variant="neutral-tertiary"
                    size="small"
                    icon={<FeatherEye />}
                    onClick={(e) => { e.stopPropagation(); setSelectedEmail(email.id); }}
                  />
                </div>
              </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-96 flex-none flex-col items-start self-stretch border-l border-solid border-neutral-border bg-neutral-50 overflow-auto">
        <div className="flex w-full flex-col items-start gap-6 px-6 py-6">
          {(() => {
            const email = MOCK_INBOX_EMAILS.find((e) => e.id === selectedEmail);
            if (!email) return null;

            const isPeticion = email.emailType === "peticion_compra";
            const isPresupuesto = email.emailType === "presupuesto_proveedor";
            const isIncidencia = email.emailType === "incidencia_proveedor";

            return (
            <>
                <div className="flex w-full flex-col items-start gap-4 rounded-lg border border-solid border-neutral-border bg-white px-4 py-4">
                  <div className="flex w-full items-start gap-3">
                    <Avatar size="large" image={email.senderAvatar}>{email.senderName.split(" ").map((n) => n[0]).join("").slice(0, 2)}</Avatar>
                    <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2">
                      <div className="flex w-full items-center justify-between">
                        <span className="text-body-bold font-body-bold text-default-font">{email.senderName}</span>
                        <span className="text-caption font-caption text-subtext-color">{email.date}</span>
                      </div>
                      <span className="text-caption font-caption text-subtext-color">{email.senderEmail}</span>
                      <div className="flex w-full flex-col items-start gap-1 pt-2">
                        <span className="text-body-bold font-body-bold text-default-font">{email.subject}</span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="neutral">{email.projectId}</Badge>
                          <Badge variant="neutral">{email.revisionId}</Badge>
                          {renderTypeBadge(email)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {isPeticion && (
                  <>
                    {email.validation === "valid" ? (
                      <>
                        <div className="flex w-full flex-col items-start gap-3">
                          <div className="flex items-center gap-2">
                            <IconWithBackground variant="brand" size="small" icon={<FeatherZap />} />
                            <span className="text-body-bold font-body-bold text-default-font">Procesamiento Automatizado Completo</span>
                          </div>
                          <span className="text-body font-body text-subtext-color">
                            {email.id === "PRJ-2999/Rev01"
                              ? "LDM con 3 líneas y 3 proveedores asignados. Listo para lanzar orden."
                              : "El sistema ha analizado y normalizado automáticamente la LDM del archivo Excel adjunto. Todos los elementos de línea han sido validados contra nuestro catálogo interno y base de datos de proveedores."}
                          </span>
                        </div>
                        <div className="flex w-full flex-col items-start gap-3">
                          <span className="text-heading-3 font-heading-3 text-default-font">Archivos Adjuntos</span>
                          <div className="flex w-full flex-col items-start gap-2">
                            <div className="flex w-full items-center gap-3 rounded-md border border-solid border-neutral-border bg-white px-4 py-3 hover:bg-neutral-50">
                              <IconWithBackground variant="success" size="medium" icon={<FeatherFileSpreadsheet />} />
                              <div className="flex grow shrink-0 basis-0 flex-col items-start">
                                <span className="text-body-bold font-body-bold text-default-font">
                                  {email.id === "PRJ-2999/Rev01" ? "Pedido_3materiales_Rev01.xlsx" : "LDM_Delta_T3_Rev04.xlsx"}
                                </span>
                                <span className="text-caption font-caption text-subtext-color">
                                  {email.id === "PRJ-2999/Rev01" ? "Excel · 3 elementos de línea" : "Excel · 2.4 MB · 342 elementos de línea"}
                                </span>
                              </div>
                              <Badge variant="success" icon={<FeatherCheck />}>Válido</Badge>
                              <IconButton variant="neutral-tertiary" size="small" icon={<FeatherDownload />} onClick={() => {}} />
                            </div>
                            {email.id === "PRJ-2847/Rev04" && (
                              <div className="flex w-full items-center gap-3 rounded-md border border-solid border-neutral-border bg-white px-4 py-3 hover:bg-neutral-50">
                                <IconWithBackground variant="neutral" size="medium" icon={<FeatherFile />} />
                                <div className="flex grow shrink-0 basis-0 flex-col items-start">
                                  <span className="text-body-bold font-body-bold text-default-font">especificaciones_v2.pdf</span>
                                  <span className="text-caption font-caption text-subtext-color">PDF · 1.8 MB</span>
                                </div>
                                <IconButton variant="neutral-tertiary" size="small" icon={<FeatherDownload />} onClick={() => {}} />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex w-full flex-col items-start gap-3">
                          <span className="text-heading-3 font-heading-3 text-default-font">Resumen de Validación</span>
                          <div className="flex w-full flex-col items-start gap-2 rounded-lg border border-solid border-neutral-border bg-white px-4 py-4">
                            <div className="flex w-full items-center justify-between">
                              <span className="text-body font-body text-subtext-color">Total de elementos de línea</span>
                              <span className="text-body-bold font-body-bold text-default-font">{email.id === "PRJ-2999/Rev01" ? "3" : "342"}</span>
                            </div>
                            <div className="flex w-full items-center justify-between">
                              <span className="text-body font-body text-subtext-color">Elementos válidos</span>
                              <span className="text-body-bold font-body-bold text-[#14b8a6ff]">{email.id === "PRJ-2999/Rev01" ? "3" : "342"}</span>
                            </div>
                            <div className="flex w-full items-center justify-between">
                              <span className="text-body font-body text-subtext-color">Elementos inválidos</span>
                              <span className="text-body-bold font-body-bold text-subtext-color">0</span>
                            </div>
                            <div className="flex w-full items-center justify-between pt-2">
                              <span className="text-body font-body text-subtext-color">
                                {email.id === "PRJ-2999/Rev01" ? "Proveedores en BOM" : "Coincidencias de catálogo"}
                              </span>
                              <span className="text-body-bold font-body-bold text-default-font">{email.id === "PRJ-2999/Rev01" ? "3" : "98.2%"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex w-full flex-col items-start gap-3 pt-2">
                          <Button
                            className="h-10 w-full flex-none"
                            icon={<FeatherArrowRight />}
                            onClick={() => !embedMode && navigate(`/app/revision/${email.projectId}/${email.revisionId}`)}
                          >
                            Abrir proyecto y revisión
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Alert
                          variant="warning"
                          icon={<FeatherAlertCircle />}
                          title="Validación automática fallida"
                          description="El archivo adjunto no ha podido ser validado automáticamente. El formato o la estructura no cumplen con lo esperado."
                        />
                        <div className="flex w-full flex-col items-start gap-3">
                          <span className="text-heading-3 font-heading-3 text-default-font">Archivos Adjuntos</span>
                          <div className="flex w-full flex-col items-start gap-2">
                            <div className="flex w-full items-center gap-3 rounded-md border border-solid border-neutral-border bg-white px-4 py-3">
                              <IconWithBackground variant="error" size="medium" icon={<FeatherFileSpreadsheet />} />
                              <div className="flex grow shrink-0 basis-0 flex-col items-start">
                                <span className="text-body-bold font-body-bold text-default-font">LDM_T4_Rev02.xlsx</span>
                                <span className="text-caption font-caption text-subtext-color">Excel · No validado automáticamente</span>
                              </div>
                              <Badge variant="error" icon={<FeatherX />}>Inválido</Badge>
                              <IconButton variant="neutral-tertiary" size="small" icon={<FeatherDownload />} onClick={() => {}} />
                            </div>
                          </div>
                        </div>
                        <div className="flex w-full flex-col items-start gap-3">
                          <span className="text-body font-body text-subtext-color">
                            Si crees que la validación es errónea (por ejemplo, el archivo tiene el formato correcto pero hubo un fallo del sistema), puedes solicitar al remitente que vuelva a enviar el adjunto en otro formato o con la estructura esperada.
                          </span>
                          {resendRequestedIds.has(email.id) ? (
                            <div className="flex w-full items-center gap-2 rounded-lg border border-solid border-success-100 bg-success-50 px-4 py-3">
                              <FeatherCheck className="h-5 w-5 flex-none text-success-600" />
                              <div className="flex flex-col items-start gap-0.5">
                                <span className="text-body-bold font-body-bold text-default-font">Solicitud enviada</span>
                                <span className="text-caption font-caption text-subtext-color">
                                  Se ha pedido a {email.senderName} que reenvíe el adjunto. La petición permanecerá en la bandeja hasta recibir el nuevo archivo.
                                </span>
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="neutral-secondary"
                              className="h-10 w-full flex-none"
                              icon={<FeatherRefreshCw />}
                              onClick={() => setResendRequestedIds((prev) => new Set(prev).add(email.id))}
                            >
                              Solicitar reenvío del adjunto
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}

                {isPresupuesto && (
                  <>
                    <div className="flex w-full flex-col items-start gap-3">
                      <div className="flex items-center gap-2">
                        <IconWithBackground variant="brand" size="small" icon={<FeatherDollarSign />} />
                        <span className="text-body-bold font-body-bold text-default-font">Presupuesto recibido de {email.senderName}</span>
                      </div>
                      <span className="text-body font-body text-subtext-color">
                        El documento adjunto ha sido normalizado al formato de presupuestos. Puedes revisarlo y compararlo en el Plan de compra del proyecto.
                      </span>
                    </div>
                    <div className="flex w-full flex-col items-start gap-3">
                      <span className="text-heading-3 font-heading-3 text-default-font">Documento Adjunto</span>
                      <div className="flex w-full flex-col items-start gap-2">
                        <div className="flex w-full items-center gap-3 rounded-md border border-solid border-neutral-border bg-white px-4 py-3 hover:bg-neutral-50">
                          <IconWithBackground variant="brand" size="medium" icon={<FeatherFileSpreadsheet />} />
                          <div className="flex grow shrink-0 basis-0 flex-col items-start">
                            <span className="text-body-bold font-body-bold text-default-font">
                              Presupuesto_{email.projectId}_{email.revisionId}_{email.senderName.replace(/\s/g, "")}.xlsx
                            </span>
                            <span className="text-caption font-caption text-subtext-color">Excel · Formato normalizado</span>
                          </div>
                          <Badge variant={email.validation === "valid" ? "success" : "error"} icon={email.validation === "valid" ? <FeatherCheck /> : <FeatherX />}>
                            {email.validation === "valid" ? "Válido" : "Inválido"}
                          </Badge>
                          <IconButton variant="neutral-tertiary" size="small" icon={<FeatherDownload />} onClick={() => {}} />
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full flex-col items-start gap-3 pt-2">
                      <Button
                        className="h-10 w-full flex-none"
                        icon={<FeatherArrowRight />}
                        onClick={() => !embedMode && navigate(`/app/plan?project=${email.projectId}`)}
                      >
                        Ver presupuesto en Plan de compra
                      </Button>
                    </div>
                  </>
                )}

                {isIncidencia && (
                  <>
                    <div className="flex w-full flex-col items-start gap-3">
                      <div className="flex items-center gap-2">
                        <IconWithBackground variant="error" size="small" icon={<FeatherAlertCircle />} />
                        <span className="text-body-bold font-body-bold text-default-font">Incidencia comunicada por {email.senderName}</span>
                      </div>
                      <span className="text-body font-body text-subtext-color">
                        El proveedor ha comunicado un problema con la LDM o el pedido. Revisa los detalles en el Plan de compra para gestionar la incidencia.
                      </span>
                    </div>
                    <div className="flex w-full flex-col items-start gap-3">
                      <span className="text-heading-3 font-heading-3 text-default-font">Asunto</span>
                      <div className="flex w-full flex-col items-start gap-2 rounded-lg border border-solid border-neutral-border bg-white px-4 py-3">
                        <span className="text-body font-body text-default-font">{email.subject}</span>
                        <Badge variant="error" icon={<FeatherAlertCircle />}>Requiere atención</Badge>
                      </div>
                    </div>
                    <div className="flex w-full flex-col items-start gap-3 pt-2">
                      <Button
                        className="h-10 w-full flex-none"
                        icon={<FeatherArrowRight />}
                        onClick={() => !embedMode && navigate(`/app/plan?project=${email.projectId}`)}
                      >
                        Ver incidencia en Plan de compra
                      </Button>
                    </div>
                  </>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export default NexusProcurementDashboard;
