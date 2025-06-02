import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import { DashboardPage } from "./components/Dashboard/DashboardPage";
import { AuthPage } from "./components/Auth/AuthPage";
import { SettingsPanel } from "./components/Settings/SettingsPanel";
import { AppLayout } from "./components/Layout/AppLayout";
import { GoalsPage } from "./components/Goals/GoalsPage";
import { TransactionsPage } from "./components/Transactions";
import { BudgetPage } from "./components/Budget/BudgetPage";
import { ReportsPage } from "./components/Reports/ReportsPage";

// Protected route component
// Protected route component that includes the app layout
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-opacity-50 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <div className="min-h-screen bg-black text-white font-sans antialiased">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/30 via-black to-black"></div>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<AuthPage />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <TransactionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/goals"
                element={
                  <ProtectedRoute>
                    <GoalsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/budget"
                element={
                  <ProtectedRoute>
                    <BudgetPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPanel />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all route to redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
