import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/pages/login";
import Signup from "./components/pages/signup";
import ProductsPage from "./components/pages/Products/ProductsPage";
import Navigation from "./components/layouts/layout/navigation";

function App() {
  return (
    <> 
    <Navigation/>
    <Routes>
      <Route path="/" element={<Navigate to="/signup" replace />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/login" element={<Login />} />
    </Routes>
    </>
  )
}

export default App;

