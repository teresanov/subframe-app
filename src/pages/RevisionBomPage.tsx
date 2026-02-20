"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert } from "@/ui/components/Alert";
import { Avatar } from "@/ui/components/Avatar";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { Dialog } from "@/ui/components/Dialog";
import { IconButton } from "@/ui/components/IconButton";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { ProyectoNexusSidebar } from "@/components/ProyectoNexusSidebar";
import { Select } from "@/ui/components/Select";
import { TextField } from "@/ui/components/TextField";
import { checkBudgetAndRecordIncident } from "@/lib/incidents/budgetCheck";
import { getOpenIncidentsByRevision, updateIncident } from "@/lib/incidents/storage";
import type { BomEstado, BomLine } from "./RevisionBomPage.data";
import { CATEGORIAS, ESTADOS, getBomLinesForRevision } from "./RevisionBomPage.data";
import { FeatherAlertCircle } from "@subframe/core";
import { FeatherArrowUpDown } from "@subframe/core";
import { FeatherCheck } from "@subframe/core";
import { FeatherChevronDown } from "@subframe/core";
import { FeatherDownload } from "@subframe/core";
import { FeatherFilter } from "@subframe/core";
import { FeatherMinus } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherSearch } from "@subframe/core";
import { FeatherShoppingCart } from "@subframe/core";
import { FeatherZap } from "@subframe/core";

export function RevisionBomPage() {
  const { projectId = "PRJ-2847", revisionId = "Rev04" } = useParams<{
    projectId?: string;
    revisionId?: string;
  }>();
  const navigate = useNavigate();

  const [filterEstado, setFilterEstado] = useState<BomEstado | "">("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [searchSap, setSearchSap] = useState("");
  const [showNotifyN1Dialog, setShowNotifyN1Dialog] = useState(false);

  const bomLines = useMemo(
    () => getBomLinesForRevision(projectId ?? "PRJ-2847", revisionId ?? "Rev04"),
    [projectId, revisionId]
  );

  const filteredRows = useMemo(() => {
    return bomLines.filter((row) => {
      if (filterEstado && row.estado !== filterEstado) return false;
      if (filterCategoria && row.category !== filterCategoria) return false;
      const term = searchSap.trim().toLowerCase();
      if (term) {
        const matchSap = row.sapCode.toLowerCase().includes(term);
        const matchDesc = row.description.toLowerCase().includes(term);
        const matchLineId = row.lineId.toLowerCase().includes(term);
        if (!matchSap && !matchDesc && !matchLineId) return false;
      }
      return true;
    });
  }, [bomLines, filterEstado, filterCategoria, searchSap]);

  const budgetCheck = useMemo(() => {
    return checkBudgetAndRecordIncident(projectId ?? "PRJ-2847", revisionId ?? "Rev04", bomLines);
  }, [projectId, revisionId, bomLines]);

  const openIncidents = useMemo(() => {
    return getOpenIncidentsByRevision(projectId ?? "PRJ-2847", revisionId ?? "Rev04");
  }, [projectId, revisionId]);

  const handleNotifyN1 = useCallback(() => {
    const incident = openIncidents.find((i) => i.type === "presupuesto_superado");
    if (incident) {
      updateIncident({ ...incident, status: "notified" });
    }
    setShowNotifyN1Dialog(false);
    window.location.reload();
  }, [openIncidents]);

  function renderEstadoBadge(estado: BomEstado) {
    switch (estado) {
      case "added":
        return (
          <Badge variant="success" icon={<FeatherPlus />}>
            Añadido
          </Badge>
        );
      case "removed":
        return (
          <Badge variant="error" icon={<FeatherMinus />}>
            Eliminado
          </Badge>
        );
      case "qty_changed":
        return (
          <Badge variant="warning" icon={<FeatherArrowUpDown />}>
            Δ Cantidad
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" icon={<FeatherCheck />}>
            Sin cambios
          </Badge>
        );
    }
  }

  return (
    <div className="flex min-h-screen w-full items-start bg-neutral-50">
      <ProyectoNexusSidebar />
      <div className="flex grow shrink-0 basis-0 flex-col items-start self-stretch bg-neutral-50">
        <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border bg-default-background px-8 py-6">
          <div className="flex items-center gap-3">
            <span className="text-heading-2 font-heading-2 text-default-font">
              Revisión de BOM
            </span>
            <Badge variant="neutral" icon={null} iconRight={null}>
              {projectId} · {revisionId}
            </Badge>
            <Badge variant="success" icon={<FeatherCheck />} iconRight={null}>
              Activo
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="neutral-secondary"
              size="medium"
              icon={<FeatherDownload />}
              iconRight={null}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
            >
              Exportar
            </Button>
            <Button
              variant="brand-primary"
              size="medium"
              icon={<FeatherShoppingCart />}
              iconRight={null}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/orden/nueva/${projectId}/${revisionId}`);
              }}
            >
              Pedir Presupuesto
            </Button>
          </div>
        </div>
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-6 px-8 py-8 overflow-auto">
          {budgetCheck.exceeds && (
            <Alert
              variant="error"
              icon={<FeatherAlertCircle />}
              title="Presupuesto superado"
              description={`Se ha superado el presupuesto máximo de compra. Importe estimado: ${budgetCheck.total.toLocaleString("es-ES")} EUR. Límite: ${budgetCheck.limit.toLocaleString("es-ES")} EUR. Revisar la petición y notificar al N1 de la fábrica.`}
              actions={
                <Button
                  variant="neutral-secondary"
                  size="small"
                  onClick={() => setShowNotifyN1Dialog(true)}
                >
                  Notificar al N1
                </Button>
              }
            />
          )}
          <div className="flex w-full flex-col items-start gap-3 rounded-lg border border-solid border-neutral-border bg-default-background px-6 py-6">
            <div className="flex items-center gap-2">
              <IconWithBackground
                variant="brand"
                size="small"
                icon={<FeatherZap />}
              />
              <span className="text-body-bold font-body-bold text-default-font">
                Procesamiento automático completado
              </span>
            </div>
            <span className="text-body font-body text-subtext-color">
              El sistema analizó automáticamente el archivo Excel adjunto y
              normalizó todas las líneas al esquema canónico de BOM. Se
              detectaron y calcularon las diferencias con respecto a Rev03.
            </span>
            <div className="flex w-full items-center gap-2 pt-2">
              <Badge variant="success" icon={<FeatherPlus />}>
                12 Añadidos
              </Badge>
              <Badge variant="error" icon={<FeatherMinus />}>
                5 Eliminados
              </Badge>
              <Badge variant="warning" icon={<FeatherArrowUpDown />}>
                8 Cantidad modificada
              </Badge>
              <Badge variant="neutral" icon={<FeatherCheck />}>
                317 Sin cambios
              </Badge>
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-4">
            <div className="flex w-full items-center justify-between">
              <span className="text-heading-3 font-heading-3 text-default-font">
                BOM Canónico - {filteredRows.length} líneas
              </span>
              <div className="flex items-center gap-2">
                <Select
                  value={filterEstado === "" ? "__all__" : filterEstado}
                  onValueChange={(v) => setFilterEstado(v === "__all__" ? "" : (v as BomEstado))}
                  placeholder="Estado"
                  variant="filled"
                  className="h-auto w-40 flex-none"
                >
                  <Select.Item value="__all__">Todos los estados</Select.Item>
                  {ESTADOS.filter((e) => e.value !== "__all__").map((e) => (
                    <Select.Item key={e.value} value={e.value}>
                      {e.label}
                    </Select.Item>
                  ))}
                </Select>
                <Select
                  value={filterCategoria || "__all__"}
                  onValueChange={(v) => setFilterCategoria(v === "__all__" ? "" : v)}
                  placeholder="Categoría"
                  variant="filled"
                  className="h-auto w-40 flex-none"
                >
                  <Select.Item value="__all__">Todas las categorías</Select.Item>
                  {CATEGORIAS.map((c) => (
                    <Select.Item key={c} value={c}>
                      {c}
                    </Select.Item>
                  ))}
                </Select>
                <TextField
                  className="h-auto w-64 flex-none"
                  variant="filled"
                  label=""
                  helpText=""
                  icon={<FeatherSearch />}
                >
                  <TextField.Input
                    placeholder="Buscar por código SAP o descripción..."
                    value={searchSap}
                    onChange={(e) => setSearchSap(e.target.value)}
                  />
                </TextField>
              </div>
            </div>
            <div className="flex w-full flex-col items-start overflow-hidden rounded-lg border border-solid border-neutral-border bg-white">
              <div className="flex w-full items-start overflow-x-auto">
                <div className="flex grow shrink-0 basis-0 items-start bg-white">
                  <div className="flex h-10 w-20 flex-none items-center gap-1 px-3 text-left">
                    <span className="whitespace-nowrap text-caption-bold font-caption-bold text-subtext-color">
                      Line ID
                    </span>
                  </div>
                  <div className="flex h-10 w-32 flex-none items-center gap-1 px-3 text-left">
                    <span className="whitespace-nowrap text-caption-bold font-caption-bold text-subtext-color">
                      SAP Code
                    </span>
                  </div>
                  <div className="flex h-10 grow shrink-0 basis-0 items-center gap-1 px-3 text-left">
                    <span className="whitespace-nowrap text-caption-bold font-caption-bold text-subtext-color">
                      Descripción
                    </span>
                  </div>
                  <div className="flex h-10 w-24 flex-none items-center gap-1 px-3 text-left">
                    <span className="whitespace-nowrap text-caption-bold font-caption-bold text-subtext-color">
                      UOM
                    </span>
                  </div>
                  <div className="flex h-10 w-24 flex-none items-center gap-1 px-3 text-left">
                    <span className="whitespace-nowrap text-caption-bold font-caption-bold text-subtext-color">
                      Cantidad
                    </span>
                  </div>
                  <div className="flex h-10 w-24 flex-none items-center gap-1 px-3 text-left">
                    <span className="whitespace-nowrap text-caption-bold font-caption-bold text-subtext-color">
                      Ant.
                    </span>
                  </div>
                  <div className="flex h-10 w-32 flex-none items-center gap-1 px-3 text-left">
                    <span className="whitespace-nowrap text-caption-bold font-caption-bold text-subtext-color">
                      Categoría
                    </span>
                  </div>
                  <div className="flex h-10 w-32 flex-none items-center gap-1 px-3 text-left">
                    <span className="whitespace-nowrap text-caption-bold font-caption-bold text-subtext-color">
                      Estado
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-col items-start">
                {filteredRows.map((row) => (
                  <div
                    key={row.lineId}
                    className="flex w-full grow shrink-0 basis-0 items-start border-t border-solid border-neutral-border hover:bg-neutral-50"
                  >
                    <div className="flex h-12 w-20 flex-none items-center gap-1 px-3">
                      <span className="text-body font-body text-default-font">
                        {row.lineId}
                      </span>
                    </div>
                    <div className="flex h-12 w-32 flex-none items-center gap-1 px-3">
                      <span
                        className={
                          row.sapCode === "—"
                            ? "text-body font-body text-subtext-color"
                            : "text-body font-body text-default-font"
                        }
                      >
                        {row.sapCode}
                      </span>
                    </div>
                    <div className="flex h-12 grow shrink-0 basis-0 items-center gap-1 px-3">
                      <span className="line-clamp-2 text-body font-body text-default-font">
                        {row.description}
                      </span>
                    </div>
                    <div className="flex h-12 w-24 flex-none items-center gap-1 px-3">
                      <span className="text-body font-body text-default-font">
                        {row.uom}
                      </span>
                    </div>
                    <div className="flex h-12 w-24 flex-none items-center gap-1 px-3">
                      <span className="text-body-bold font-body-bold text-default-font">
                        {row.qty}
                      </span>
                    </div>
                    <div className="flex h-12 w-24 flex-none items-center gap-1 px-3">
                      <span className="text-body font-body text-subtext-color">
                        {row.oldQty}
                      </span>
                    </div>
                    <div className="flex h-12 w-32 flex-none items-center gap-1 px-3">
                      <span className="text-body font-body text-default-font">
                        {row.category}
                      </span>
                    </div>
                    <div className="flex h-12 w-32 flex-none items-center gap-1 px-3">
                      {renderEstadoBadge(row.estado)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={showNotifyN1Dialog} onOpenChange={setShowNotifyN1Dialog}>
        <Dialog.Content className="flex flex-col gap-4 p-6 max-w-md">
          <span className="text-heading-2 font-heading-2 text-default-font">
            Notificar al N1 de fábrica
          </span>
          <p className="text-body font-body text-subtext-color">
            Se ha enviado la notificación. El N1 de fábrica recibirá un aviso de que la petición de compra {projectId} {revisionId} supera el presupuesto máximo y debe ser revisada.
          </p>
          <div className="flex w-full justify-end gap-2">
            <Button
              variant="neutral-secondary"
              onClick={() => setShowNotifyN1Dialog(false)}
            >
              Cerrar
            </Button>
            <Button
              variant="brand-primary"
              onClick={handleNotifyN1}
            >
              Marcar como notificado
            </Button>
          </div>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}

export default RevisionBomPage;
