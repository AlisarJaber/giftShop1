import { Routes, Route, Navigate } from "react-router-dom";

import Navigation from "./components/layouts/layout/navigation";

import Login from "./components/pages/auth/login";
import Signup from "./components/pages/auth/signup";

import ProductsPage from "./components/pages/Products/ProductsPage";
import ProductDetailsPage from "./components/pages/Products/ProductDetailsPage";
import CategoriesPage from "./components/pages/category/CategoriesPage";
import CartPage from "./components/pages/carts/CartPage";
import PersonalizedGifts from "./components/pages/personalized/PersonalizedGifts";
import AdminCartsPage from "./components/pages/Admin/AdminCartsPage";
import AdminUsersPage from "./components/pages/Admin/AdminUsersPage";
import FavoritesPage from "./components/pages/favorites/FavoritesPage";

import SocketBridge from "./components/SocketBridge";
import AdminAuditLogsPage from "./components/pages/Admin/AdminAuditLogsPage";
import { Toaster } from "react-hot-toast";

import "./assets/toast.css";

function getLocalUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function RequireAuth({ children }) {
  const user = getLocalUser();

  // not logged in
  if (!user) return <Navigate to="/login" replace />;

  // blocked user -> kick out
  if (user?.is_blocked === true) {
    // clear local
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("is_admin");
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RequireAdmin({ children }) {
  const user = getLocalUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user?.is_blocked === true) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("is_admin");
    return <Navigate to="/login" replace />;
  }
  if (!user?.is_admin) return <Navigate to="/products" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <SocketBridge />
      <Navigation />

      <Routes>
        <Route path="/" element={<Navigate to="/products" replace />} />

        {/* Public */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Protected (any logged-in user) */}
        <Route
          path="/products"
          element={
            <RequireAuth>
              <ProductsPage />
            </RequireAuth>
          }
        />

        <Route
          path="/products/:id"
          element={
            <RequireAuth>
              <ProductDetailsPage />
            </RequireAuth>
          }
        />

        <Route
          path="/categories"
          element={
            <RequireAuth>
              <CategoriesPage />
            </RequireAuth>
          }
        />

        <Route
          path="/personal"
          element={
            <RequireAuth>
              <PersonalizedGifts />
            </RequireAuth>
          }
        />

        <Route
          path="/cart"
          element={
            <RequireAuth>
              <CartPage />
            </RequireAuth>
          }
        />

        <Route
          path="/favorites"
          element={
            <RequireAuth>
              <FavoritesPage />
            </RequireAuth>
          }
        />

        {/* Admin only */}
        <Route
          path="/admin/carts"
          element={
            <RequireAdmin>
              <AdminCartsPage />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/users"
          element={
            <RequireAdmin>
              <AdminUsersPage />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/audit-logs"
          element={
            <RequireAdmin>
              <AdminAuditLogsPage />
            </RequireAdmin>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <Toaster
        position="top-center"
        toastOptions={{
          className: "gs-toast",
          duration: 3500,
          success: { className: "gs-toast gs-toast--success" },
          error: { className: "gs-toast gs-toast--error" },
        }}
      />
    </>
  );
}