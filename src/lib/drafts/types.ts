import type { BomLine } from "@/pages/RevisionBomPage.data";

export type DraftStatus = "draft" | "sent";

export type DraftType = "rfq" | "po";

export interface Draft {
  id: string;
  projectId: string;
  revisionId: string;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  createdAt: string;
  updatedAt: string;
  status: DraftStatus;
  /** rfq = petición de presupuesto, po = orden de compra */
  type: DraftType;
  /** category -> supplierId (for this draft, category maps to this supplier) */
  categoryRules: Record<string, string>;
  lineItems: BomLine[];
  subject: string;
  notes: string;
  requestedDeliveryDate: string;
}

export type CategoryRules = Record<string, string>;
