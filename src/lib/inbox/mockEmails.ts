export type EmailType = "peticion_compra" | "presupuesto_proveedor" | "incidencia_proveedor";

export type ValidationStatus = "valid" | "invalid";

export interface InboxEmail {
  id: string;
  senderName: string;
  senderEmail: string;
  senderAvatar?: string;
  subject: string;
  date: string;
  projectId: string;
  revisionId: string;
  validation: ValidationStatus;
  emailType: EmailType;
}

export const MOCK_INBOX_EMAILS: InboxEmail[] = [
  {
    id: "PRJ-2847/Rev04",
    senderName: "Jorge Martínez",
    senderEmail: "jmartinez@proveedor.com",
    subject: "LDM actualizada - Proyecto Delta T3",
    date: "Hoy, 9:42 AM",
    projectId: "PRJ-2847",
    revisionId: "Rev04",
    validation: "valid",
    emailType: "peticion_compra",
  },
  {
    id: "PRJ-2999/Rev01",
    senderName: "Ana Suárez",
    senderEmail: "asuarez@vendedor.mx",
    subject: "Pedido pequeño - 3 materiales, 3 proveedores",
    date: "Hoy, 8:15 AM",
    projectId: "PRJ-2999",
    revisionId: "Rev01",
    validation: "valid",
    emailType: "peticion_compra",
  },
  {
    id: "PRJ-2845/Rev01",
    senderName: "Componentes Industriales",
    senderEmail: "rcampos@industrial.com",
    subject: "Propuesta revisada con especificaciones",
    date: "Ayer, 4:32 PM",
    projectId: "PRJ-2845",
    revisionId: "Rev01",
    validation: "valid",
    emailType: "presupuesto_proveedor",
  },
  {
    id: "PRJ-2850/Rev02",
    senderName: "Carlos Ruiz",
    senderEmail: "cruiz@fabricacion.nexus.com",
    subject: "Petición de suministros - LDM T4",
    date: "Hoy, 10:20 AM",
    projectId: "PRJ-2850",
    revisionId: "Rev02",
    validation: "invalid",
    emailType: "peticion_compra",
  },
  {
    id: "PRJ-2843/Rev03",
    senderName: "Luis García",
    senderEmail: "lgarcia@materiales.mx",
    subject: "Lista de materiales Alpha - Actualización",
    date: "Ayer, 2:18 PM",
    projectId: "PRJ-2843",
    revisionId: "Rev03",
    validation: "valid",
    emailType: "peticion_compra",
  },
  {
    id: "PRJ-2842/Rev01",
    senderName: "Piezas y Suministros",
    senderEmail: "mrodriguez@piezas.com",
    subject: "Fwd: LDM incompleta - requiere revisión",
    date: "Ayer, 11:05 AM",
    projectId: "PRJ-2842",
    revisionId: "Rev01",
    validation: "invalid",
    emailType: "incidencia_proveedor",
  },
  {
    id: "PRJ-2840/Rev05",
    senderName: "Suministros Beta",
    senderEmail: "cfernandez@suministro.mx",
    subject: "Componentes Beta - Lista final aprobada",
    date: "Hace 2 días",
    projectId: "PRJ-2840",
    revisionId: "Rev05",
    validation: "valid",
    emailType: "presupuesto_proveedor",
  },
];
