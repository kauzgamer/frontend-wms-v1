import { Routes, Route } from 'react-router-dom';
import { UnifiedProduct } from './unified-product';
import { ErpIntegration } from './erp-integration';

export function OrganizationSettings() {
  return (
    <Routes>
      <Route index element={<UnifiedProduct />} />
      <Route path="unified-product" element={<UnifiedProduct />} />
      <Route path="erp-integration" element={<ErpIntegration />} />
    </Routes>
  );
}
