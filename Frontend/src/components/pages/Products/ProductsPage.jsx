import { useEffect, useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import HeroSection from "./HeroSection";
import AdminProductModal from "./AdminProductModal";
import { getProducts, createProduct, updateProduct } from "../../../../utils/productsApi";
import "./products.css";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editInitial, setEditInitial] = useState(null);

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  }, []);
  const isAdmin = !!user?.is_admin;

  const load = () => {
    setLoading(true);
    setError("");
    getProducts()
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((e) => setError(e?.response?.data?.detail || "Error loading products"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditInitial(null);
    setModalOpen(true);
  }

  const openEdit = (detailsProduct) => {
    setEditInitial(detailsProduct); // כולל description/quantity
    setModalOpen(true);
  }

  const submitModal = async (payload) => {
    try {
      if (editInitial?.id) {
        const updated = await updateProduct(editInitial.id, payload);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await createProduct(payload);
        setProducts((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (e) {
      alert(e?.response?.data?.detail || "Save failed");
    }
  }

  return (
    <>
      <HeroSection />

      <div className="products-page">
        <div className="products-header">
          <div>
            <h1 className="products-title">Recommended products</h1>
            <p className="products-subtitle">Our most popular gifts</p>
          </div>

          {isAdmin && (
            <button className="admin-add" onClick={openAdd}>
              + Add product
            </button>
          )}
        </div>

        {error && <div className="products-error">{error}</div>}

        <div className="products-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <div className="p-skel" key={i} />)
            : products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isAdmin={isAdmin}
                  onDeleted={(id) => setProducts((prev) => prev.filter((x) => x.id !== id))}
                  onEdit={openEdit}
                />
              ))}
        </div>
      </div>

      <AdminProductModal
        open={modalOpen}
        initial={editInitial}
        onClose={() => setModalOpen(false)}
        onSubmit={submitModal}
      />
    </>
  )
}
