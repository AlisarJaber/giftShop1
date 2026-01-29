import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/pages/auth/login";
import Signup from "./components/pages/auth/signup";
import ProductsPage from "./components/pages/Products/ProductsPage";
import Navigation from "./components/layouts/layout/navigation";
import ProductDetailsPage from "./components/pages/Products/ProductDetailsPage";
import CartPage from "./components/pages/carts/CartPage";



function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  if (!token && !user) return <Navigate to="/login" replace />;
  return children;
}



function App() {

  function isLoggedIn() {
    return !!localStorage.getItem("user");
  }

  return (
    <>

      <Routes>
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route
          path="/signup"
          element={isLoggedIn() ? <Navigate to="/products" replace /> : <Signup />}
        />

        <Route
          path="/login"
          element={isLoggedIn() ? <Navigate to="/products" replace /> : <Login />}
        />

        <Route path="/products" element={<RequireAuth> <Navigation /> <ProductsPage />  </RequireAuth>} />
        <Route path="/products/:id" element={<RequireAuth> <Navigation /> <ProductDetailsPage />  </RequireAuth>} />
        <Route path="/cart" element={<RequireAuth> <Navigation /> <CartPage />  </RequireAuth>} />
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </>
  );
}

export default App;



