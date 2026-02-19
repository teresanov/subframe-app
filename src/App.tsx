import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import NexusProcurementDashboard from "./pages/NexusProcurementDashboard";
import { RevisionBomPage } from "./pages/RevisionBomPage";
import { ProyectosLibraryPage } from "./pages/ProyectosLibraryPage";
import { OrderWizardPage } from "./pages/OrderWizardPage";
import { DraftsPage } from "./pages/DraftsPage";
import { DraftEditorPage } from "./pages/DraftEditorPage";
import { PurchasePlanPage } from "./pages/PurchasePlanPage";
import { SupplierQuotesPage } from "./pages/SupplierQuotesPage";
import { TransitPage } from "./pages/TransitPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/inbox" element={<NexusProcurementDashboard />} />
        <Route path="/proyectos" element={<ProyectosLibraryPage />} />
        <Route path="/revision/:projectId?/:revisionId?" element={<RevisionBomPage />} />
        <Route path="/plan" element={<PurchasePlanPage />} />
        <Route path="/presupuestos/:projectId?/:revisionId?" element={<SupplierQuotesPage />} />
        <Route path="/transito" element={<TransitPage />} />
        <Route path="/orden/nueva/:projectId/:revisionId" element={<OrderWizardPage />} />
        <Route path="/borradores" element={<DraftsPage />} />
        <Route path="/borradores/:projectId/:revisionId" element={<DraftsPage />} />
        <Route path="/borrador/:draftId" element={<DraftEditorPage />} />
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/inbox" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/inbox" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
