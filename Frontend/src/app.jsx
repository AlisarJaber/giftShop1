import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/pages/login";
import Signup from "./components/pages/signup";
import ProductsPage from "./components/pages/Products/ProductsPage";
import Navigation from "./components/layouts/layout/navigation";
import ProductDetailsPage from "./components/pages/Products/ProductDetailsPage";

function App() {
  return (
    <>
      <Navigation />

      <Routes>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </>
  );
}

export default App;


