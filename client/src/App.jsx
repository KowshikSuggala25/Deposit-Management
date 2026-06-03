import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import BankDetailsPage from "./pages/BankDetailsPage";
import HolderDetailsPage from "./pages/HolderDetailsPage";
import NotFoundPage from "./pages/NotFoundPage";

const AppLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-blue-500/30 blur-3xl" />
      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};

const App = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/banks/:bankId" element={<BankDetailsPage />} />
        <Route path="/holders/:holderId" element={<HolderDetailsPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </AppLayout>
  );
};

export default App;
