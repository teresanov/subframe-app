/** Mapeo supplierId → nombre para demo y producto */
export const SUPPLIER_NAMES: Record<string, string> = {
  "sup-acme": "Acme Steel Co.",
  "sup-electro": "ElectroComponents SA",
  "sup-fastbolts": "FastBolts Inc.",
  "sup-pinturas": "Pinturas del Norte",
  "sup-sellados": "Sellados Industriales",
  "sup-metales": "Metales y Aleaciones",
  "sup-roberto-campos": "Componentes Industriales",
  "sup-carlos-fernandez": "Suministros Beta",
  "sup-maria-rodriguez": "Piezas y Suministros",
};

export function getSupplierName(supplierId: string): string {
  return SUPPLIER_NAMES[supplierId] ?? supplierId;
}
