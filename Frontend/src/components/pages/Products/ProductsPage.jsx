import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProductCard from "./ProductCard";
import HeroSection from "./HeroSection";
import AdminProductModal from "./AdminProductModal";
import { getProducts, createProduct, updateProduct } from "../../../utils/productsApi";
import "./products.css";

export default function ProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editInitial, setEditInitial] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem("user") || "null"));
    } catch {
      setUser(null);
    }
  }, []);

  const isAdmin = !!user?.is_admin;

  useEffect(() => {
    if (user === null) return;
    if (!user) navigate("/signup", { replace: true });
  }, [user, navigate]);

  const load = () => {
    setLoading(true);
    setError("");

    getProducts()
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((e) => {
        if (e?.response?.status === 401) {
          navigate("/login", { replace: true });
        } else {
          setError(e?.response?.data?.detail || "Error loading products");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const search = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get("search") || "").trim().toLowerCase();
  }, [location.search]);

  const filteredProducts = useMemo(() => {
    if (!search) return products;

    return products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const badge = (p.badge || "").toLowerCase();
      return name.includes(search) || badge.includes(search);
    });
  }, [products, search]);

  const openAdd = () => {
    if (!isAdmin) return;
    setEditInitial(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    if (!isAdmin) return;
    setEditInitial(product);
    setModalOpen(true);
  };

  const submitModal = async (payload) => {
    if (!isAdmin) return;

    try {
      if (editInitial?.id) {
        const updated = await updateProduct(editInitial.id, payload);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await createProduct(payload);
        setProducts((prev) => [created, ...prev]);
      }

      setModalOpen(false);
      setEditInitial(null);
    } catch (e) {
      alert(e?.response?.data?.detail || "Save failed");
    }
  };

  return (
    <>
      {!search && <HeroSection />}

      <div className="products-page">
        <div className="products-header">
          <div>
            <h1 className="products-title">Recommended products</h1>
            <p className="products-subtitle">Our most popular gifts</p>
            {search && !loading && !error && (
              <p className="products-subtitle" style={{ marginTop: 10 }}>
                Search: <b>{search}</b> ({filteredProducts.length})
              </p>
            )}
          </div>

          {isAdmin && (
            <button className="admin-add" onClick={openAdd}>
              + Add product
            </button>
          )}
        </div>

        {error && <div className="products-error">{error}</div>}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="products-error">
            Product not found{search ? ` for "${search}"` : ""}.
          </div>
        )}

        <div className="products-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <div className="p-skel" key={i} />)
            : filteredProducts.map((p) => (
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
        onClose={() => {
          setModalOpen(false);
          setEditInitial(null);
        }}
        onSubmit={submitModal}
      />
    </>
  );
}


