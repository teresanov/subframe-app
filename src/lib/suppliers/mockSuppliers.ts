export interface Supplier {
  id: string;
  name: string;
  email: string;
}

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: "sup-acme", name: "Acme Steel Co.", email: "sales@acmesteel.com" },
  { id: "sup-fastbolts", name: "FastBolts Inc.", email: "pedidos@fastbolts.com" },
  { id: "sup-electro", name: "ElectroComponents SA", email: "compras@electrocomp.com" },
  { id: "sup-pinturas", name: "Pinturas del Norte", email: "ventas@pinturasnorte.es" },
  { id: "sup-sellados", name: "Sellados Industriales", email: "info@selladosind.com" },
  { id: "sup-metales", name: "Metales y Aleaciones", email: "compras@metalesaleaciones.es" },
  // Proveedores de presupuestos del Inbox (nombres de empresa)
  { id: "sup-roberto-campos", name: "Componentes Industriales", email: "rcampos@industrial.com" },
  { id: "sup-carlos-fernandez", name: "Suministros Beta", email: "cfernandez@suministro.mx" },
  { id: "sup-maria-rodriguez", name: "Piezas y Suministros", email: "mrodriguez@piezas.com" },
];
