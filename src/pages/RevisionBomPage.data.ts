export type BomEstado = "added" | "removed" | "qty_changed" | "unchanged";

/** Sustitución homologada propuesta por proveedor. */
export interface Homologation {
  sapCode: string;
  brand: string;
  status: "homologated" | "pending" | "rejected";
}

export interface BomLine {
  lineId: string;
  sapCode: string;
  description: string;
  uom: string;
  qty: string;
  oldQty: string;
  category: string;
  estado: BomEstado;
  /** Proveedor asignado en Excel/CSV; si viene en el archivo, se usa para asignación automática en el wizard. */
  supplierId?: string;
  /** Precio unitario estimado (EUR) para cálculo de presupuesto. */
  unitPrice?: number;
  /** Sustituciones propuestas por proveedor en presupuestos. */
  homologations?: Homologation[];
}

/** Primer pedido mock: 10 líneas, 5 proveedores (PRJ-2847 / Rev04). Importe estimado ~52k (supera límite 45k). */
export const BOM_LINES: BomLine[] = [
  { lineId: "001", sapCode: "SAP-8472", description: "Chapa de acero inoxidable 304 - 1.5mm", uom: "kg", qty: "850", oldQty: "650", category: "Materiales", estado: "qty_changed", supplierId: "sup-acme", unitPrice: 12 },
  { lineId: "002", sapCode: "SAP-9203", description: "Tornillo M8x20 acero galvanizado", uom: "pcs", qty: "2400", oldQty: "—", category: "Ferretería", estado: "unchanged", supplierId: "sup-fastbolts", unitPrice: 0.15 },
  { lineId: "003", sapCode: "—", description: "Sensor de temperatura PT100 clase A", uom: "pcs", qty: "12", oldQty: "—", category: "Electrónica", estado: "added", supplierId: "sup-electro", unitPrice: 85 },
  { lineId: "004", sapCode: "SAP-5612", description: "Cable eléctrico 3x1.5mm² 450/750V", uom: "m", qty: "150", oldQty: "200", category: "Eléctrico", estado: "qty_changed", supplierId: "sup-electro", unitPrice: 2.5 },
  { lineId: "005", sapCode: "SAP-7834", description: "Rodamiento 6205-2RS SKF", uom: "pcs", qty: "0", oldQty: "24", category: "Mecánica", estado: "removed", supplierId: "sup-acme", unitPrice: 8 },
  { lineId: "006", sapCode: "SAP-4521", description: "Pintura epoxi RAL 7035 gris claro", uom: "L", qty: "15", oldQty: "—", category: "Acabados", estado: "unchanged", supplierId: "sup-pinturas", unitPrice: 45 },
  { lineId: "007", sapCode: "—", description: "Contactor trifásico 25A 220V AC", uom: "pcs", qty: "8", oldQty: "—", category: "Electrónica", estado: "added", supplierId: "sup-electro", unitPrice: 120 },
  { lineId: "008", sapCode: "SAP-6749", description: "Empaquetadura EPDM 3mm DN50", uom: "pcs", qty: "36", oldQty: "—", category: "Sellado", estado: "unchanged", supplierId: "sup-sellados", unitPrice: 3.5 },
  { lineId: "009", sapCode: "SAP-3198", description: "Interruptor termomagnético 3P 25A curva C", uom: "pcs", qty: "0", oldQty: "4", category: "Protección", estado: "removed", supplierId: "sup-electro", unitPrice: 25 },
  { lineId: "010", sapCode: "SAP-8921", description: "Tubo rectangular 40x20x2mm acero estructural", uom: "m", qty: "48", oldQty: "36", category: "Estructura", estado: "qty_changed", supplierId: "sup-acme", unitPrice: 18 },
];

/** Segundo pedido mock: 3 materiales, 3 proveedores (PRJ-2999 / Rev01). Importe estimado ~5k (bajo límite 10k). */
export const BOM_LINES_SECOND: BomLine[] = [
  { lineId: "001", sapCode: "SAP-8472", description: "Chapa de acero inoxidable 304 - 1.5mm", uom: "kg", qty: "200", oldQty: "—", category: "Materiales", estado: "added", supplierId: "sup-acme", unitPrice: 12 },
  { lineId: "002", sapCode: "SAP-9203", description: "Tornillo M8x20 acero galvanizado", uom: "pcs", qty: "500", oldQty: "—", category: "Ferretería", estado: "added", supplierId: "sup-fastbolts", unitPrice: 0.15 },
  { lineId: "003", sapCode: "SAP-5612", description: "Cable eléctrico 3x1.5mm² 450/750V", uom: "m", qty: "80", oldQty: "—", category: "Eléctrico", estado: "added", supplierId: "sup-electro", unitPrice: 2.5 },
];

/**
 * Devuelve las líneas BOM para un proyecto/revisión (mock por id).
 * En producción esto vendría del API según projectId/revisionId.
 */
export function getBomLinesForRevision(projectId: string, revisionId: string): BomLine[] {
  if (projectId === "PRJ-2999" && revisionId === "Rev01") {
    return BOM_LINES_SECOND;
  }
  return BOM_LINES;
}

/** Use "__all__" for "all states"; Subframe Select.Item does not allow value "". */
export const ESTADOS: { value: BomEstado | "__all__"; label: string }[] = [
  { value: "__all__", label: "Todos los estados" },
  { value: "added", label: "Añadido" },
  { value: "removed", label: "Eliminado" },
  { value: "qty_changed", label: "Δ Cantidad" },
  { value: "unchanged", label: "Sin cambios" },
];

export const CATEGORIAS = [
  "Materiales",
  "Ferretería",
  "Electrónica",
  "Eléctrico",
  "Mecánica",
  "Acabados",
  "Sellado",
  "Protección",
  "Estructura",
];
