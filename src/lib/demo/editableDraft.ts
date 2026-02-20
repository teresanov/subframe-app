/** Borrador editable para la demo (Step 8). */

export interface EditableDraft {
  id: string;
  projectId: string;
  revisionId: string;
  supplierId: string;
  supplierName: string;
  to: string;
  subject: string;
  body: string;
  originalSubject: string;
  originalBody: string;
  isEdited: boolean;
}
