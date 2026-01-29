import { Routes, Route, Navigate } from "react-router-dom";

import Navigation from "./components/layouts/layout/navigation";

import Login from "./components/pages/auth/login";
import Signup from "./components/pages/auth/signup";

import ProductsPage from "./components/pages/Products/ProductsPage";
import ProductDetailsPage from "./components/pages/Products/ProductDetailsPage";
import CategoriesPage from "./components/pages/category/CategoriesPage";
import CartPage from "./components/pages/carts/CartPage";

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navigation />

      <Routes>
        {/* דף בית -> מוצרים */}
        <Route path="/" element={<Navigate to="/products" replace />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/login" element={<Login />} />

        <Route path="/products" element={ <RequireAuth> <ProductsPage /> </RequireAuth>}/>

        <Route path="/products/:id" element={ <RequireAuth> <ProductDetailsPage /> </RequireAuth>}/>

        <Route path="/categories" element={ <RequireAuth> <CategoriesPage /> </RequireAuth>}/>

        <Route path="/cart" element={ <RequireAuth> <CartPage /> </RequireAuth>}/>


        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
