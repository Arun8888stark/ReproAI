import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ToastProvider } from "./Components/Toast";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import ReportDetails from "./pages/ReportDetails";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

function AppRoutes() {
  const location = useLocation();
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/new" element={<Dashboard key={location.key} />} />
      <Route path="/history" element={<History />} />
      <Route path="/reports/:id" element={<ReportDetails />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
