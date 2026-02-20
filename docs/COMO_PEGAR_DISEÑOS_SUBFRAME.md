# Cómo pegar los diseños de Subframe en el proyecto

El flujo de rutas ya está montado. Para sustituir los placeholders por el diseño real de cada página:

## Flujo actual en la app

1. **Inbox** (`/inbox`) – Lista de emails BOM. CTA "Abrir proyecto y revisión" → lleva a `/revision/PRJ-2007/Rev07`.
2. **Proyectos BOM** (`/proyectos`) – Librería de proyectos. Enlaces a revisión.
3. **Revisión BOM** (`/revision/:projectId/:revisionId`) – BOM canónico y deltas.

## Dónde pegar cada diseño

| Vista | Archivo en el proyecto | Enlace Subframe |
|-------|------------------------|-----------------|
| Layout (sidebar + marca) | `src/layouts/AppLayout.tsx` | [Nexus Procurement Dashboard](https://app.subframe.com/fd4b193724a6/design/86af865e-66b3-4e57-9a42-2cb4d1482296/edit) |
| BOM Inbox | `src/pages/InboxPage.tsx` | [BOM Inbox](https://app.subframe.com/fd4b193724a6/design/fffb2b6a-34d5-4f50-8f3e-06e5e2585e7e/edit) |
| Revisión BOM | `src/pages/RevisionBomPage.tsx` | [Revision BOM Tracking](https://app.subframe.com/fd4b193724a6/design/9e3a8328-bc1e-416d-9f2f-deaf610f0675/edit) |
| Librería de proyectos | `src/pages/ProyectosLibraryPage.tsx` | [Project Library Overview](https://app.subframe.com/fd4b193724a6/design/ad11f350-1243-4bfa-9aa5-1941bbd0e874/edit) |

## Pasos para cada página

1. Abre el enlace de Subframe de la tabla.
2. En Subframe, exporta o copia el código de la página (botón Export / Copy code).
3. En el proyecto, abre el archivo indicado.
4. Sustituye el contenido del componente por el código exportado.
5. Mantén el **nombre del componente** y el **export default** (o export nombrado) que usa el router:
   - `InboxPage`, `RevisionBomPage`, `ProyectosLibraryPage`.
6. Si el código exportado usa `useParams()` para `projectId`/`revisionId`, perfecto; si no, añade esa lógica para que los enlaces desde Inbox/Proyectos pasen el proyecto y revisión correctos.

## Ejecutar la app

```bash
cd "e:\Cursor Projects\subframe-app"
npm run dev
```

Abre `http://localhost:5173`. Navega por Inbox → "Abrir proyecto y revisión" → Revisión BOM, o por Proyectos BOM → enlace a una revisión.
