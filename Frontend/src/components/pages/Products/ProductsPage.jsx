import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import HeroSection from "./HeroSection";
import { getProducts } from "../../../../utils/productsApi";
import "./products.css";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError("");

    getProducts()
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((e) =>
        setError(e?.response?.data?.detail || "Error loading products")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <HeroSection />

      <div className="products-page">
        <div className="products-header">
          <h1 className="products-title">Recommended products</h1>
          <p className="products-subtitle">Our most popular gifts</p>
        </div>

        {error && <div className="products-error">{error}</div>}

        <div className="products-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div className="p-skel" key={i} />
              ))
            : products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </>
  );
}
