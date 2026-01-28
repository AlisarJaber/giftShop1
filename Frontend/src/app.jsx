import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/pages/login";
import Signup from "./components/pages/signup";
import ProductsPage from "./components/pages/Products/ProductsPage";
import Navigation from "./components/layouts/layout/navigation";
import ProductDetailsPage from "./components/pages/Products/ProductDetailsPage";

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <>
      <Navigation />

      <Routes>
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
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

        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </>
  );
}

export default App;



