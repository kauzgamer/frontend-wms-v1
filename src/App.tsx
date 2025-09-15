import DashboardPage from "@/page/dashboard/page"
import SettingsPage from "@/page/settings/page"
import { Routes, Route, Navigate } from "react-router-dom"

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
