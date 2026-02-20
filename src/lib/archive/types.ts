export interface ArchivedOrder {
  id: string;
  projectId: string;
  revisionId: string;
  projectName?: string;
  supplierName: string;
  peticionario: string;
  sentAt: string;
  deliveredAt?: string;
  status: "entregada" | "archivada";
}
