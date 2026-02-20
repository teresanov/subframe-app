# Flujo de producto – Proyecto Nexus

## Limitación

No puedo “ver” los diseños de Subframe en el navegador; solo puedo listar páginas y usar las herramientas (design_page, edit_page, etc.). El flujo siguiente se basa en los **nombres y roles** de las páginas que existen en tu proyecto Subframe.

---

## Páginas actuales en Subframe

| Página | ID | Uso en el flujo |
|--------|-----|------------------|
| Nexus Procurement Dashboard | 86af865e… | Layout base (sidebar + área de contenido). |
| BOM Inbox | fffb2b6a… | Entrada: bandeja de emails con adjuntos BOM. |
| Project Library Overview | ad11f350… | Librería de proyectos (lista de PRJ-XXXX). |
| Revision BOM Tracking | 9e3a8328… | Detalle de un proyecto: revisiones + BOM canónico + deltas. |

*(Otras páginas creadas después, ej. Plan de compra o Borradores, pueden no aparecer en list_pages; si existen, se integran en los pasos 4 y 5.)*

---

## Flujo que hace que el producto “funcione”

Objetivo: **un solo recorrido claro**, no vistas sueltas por menú.

### Paso 1 – Entrada: Inbox (BOM Inbox)

- Usuario ve la bandeja de emails con adjuntos BOM.
- Ve estado de validación del adjunto (válido / inválido).
- **Acción:** abre un email → drawer con detalle, adjuntos, CTAs.

### Paso 2 – Ir al contexto del proyecto

- Desde el drawer del email, **un solo CTA principal:**  
  **“Abrir proyecto y revisión”** (o “Ver revisión”).
- **Navegación:**  
  `Inbox` → **misma app, misma sesión** → vista de **detalle de esa revisión** (proyecto + revisión concretos).

No hace falta pasar antes por “Biblioteca de proyectos” para este camino; la Biblioteca sirve para **entrar por otro sitio** (ver todos los proyectos).

### Paso 3 – Detalle de proyecto/revisión (Revision BOM Tracking)

- Pantalla con:
  - Breadcrumb: `Revisiones / PRJ-2007 / Rev07`.
  - Timeline/lista de revisiones del proyecto (baseline, actual).
  - BOM canónico + deltas de la revisión seleccionada.
- **Acciones desde aquí (mismo contexto PRJ-XXXX · RevXX):**
  - **“Ver plan por proveedor”** → Paso 4.
  - **“Ver borradores de email”** → Paso 5.

Así, “Plan de compra” y “Borradores” **no son un menú aparte**, sino **pasos siguientes del mismo flujo** cuando ya estás en una revisión.

### Paso 4 – Plan por proveedor (dentro del flujo)

- Vista contextual a **esa revisión**: acordeones por proveedor, tabs Comprar / Cancelar / Δ Cantidad.
- **Acción:** “Generar / Ver borradores de email” → Paso 5.

### Paso 5 – Borradores de email (dentro del flujo)

- Lista de borradores **de esa revisión** (por proveedor).
- Abrir editor (drawer), “Sugerir con IA”, Guardar, Restablecer.
- Estados: Borrador, Listo, Enviado (mock).

### Paso 6 – Dónde ver “borradores” y “enviados”

- Opción A: mismo lugar que Paso 5, con filtros o tabs “En borrador / Listos / Enviados”.
- Opción B: en el menú lateral, un solo ítem **“Borradores”** que, al abrirlo, muestre **por defecto** el contexto de la última revisión abierta, o un selector “Revisión: PRJ-2007 · Rev07”.

---

## Menú lateral propuesto (para que el flujo tenga sentido)

- **Inbox**  
  Siempre entrada principal para “trabajo nuevo”.

- **Proyectos BOM**  
  Librería: lista de proyectos. Al hacer clic en un proyecto → entras al **detalle de ese proyecto** (Revision BOM Tracking). Desde ahí, los pasos 4 y 5 (Plan, Borradores) son acciones o pestañas dentro del mismo contexto, no ítems del menú.

- *(Opcional)* **Borradores**  
  Si quieres un atajo global: “Ver todos mis borradores” (agrupados por revisión o por proveedor). Al elegir uno, entras al flujo de esa revisión.

- *No hace falta* un ítem “Plan de compra” en el menú: se llega siempre desde la revisión (Paso 3 → Paso 4).

---

## Resumen

- **Flujo:** Inbox → Abrir revisión → (Revisión BOM) → Plan por proveedor → Borradores → Enviados/estado.
- **Librería:** Proyectos BOM = listado de proyectos; al entrar en uno, estás en el flujo de ese proyecto/revisión.
- **Plan de compra y Borradores** viven **dentro del flujo** de una revisión concreta, no como vistas sueltas de menú.
- Así el producto “hace algo”: el usuario sigue un camino de principio a fin (email → validación → conversión → plan → redacción → estado).

Cuando implementes en código (rutas, estado global o contexto de `projectId`/`revisionId`), este documento sirve como guía para enlazar las pantallas diseñadas en Subframe con ese flujo.
