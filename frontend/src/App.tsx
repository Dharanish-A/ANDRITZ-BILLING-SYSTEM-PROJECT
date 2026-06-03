import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { useAuth } from "./hooks/useAuth";

const LoginPage = lazy(() => import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const ExpenseSubmissionPage = lazy(() =>
  import("./pages/ExpenseSubmissionPage").then((module) => ({ default: module.ExpenseSubmissionPage }))
);
const ExpenseListPage = lazy(() => import("./pages/ExpenseListPage").then((module) => ({ default: module.ExpenseListPage })));
const ApprovalsPage = lazy(() => import("./pages/ApprovalsPage").then((module) => ({ default: module.ApprovalsPage })));
const ReportsPage = lazy(() => import("./pages/ReportsPage").then((module) => ({ default: module.ReportsPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then((module) => ({ default: module.ProfilePage })));

function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-andritz-light text-andritz-dark">Loading secure workspace...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <AppLayout />;
}

export function App() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-andritz-light text-andritz-dark">Loading workspace...</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/expenses/new" element={<ExpenseSubmissionPage />} />
          <Route path="/expenses" element={<ExpenseListPage />} />
          <Route path="/approvals" element={<ApprovalsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
