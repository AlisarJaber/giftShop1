import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProductCard from "./ProductCard";
import HeroSection from "./HeroSection";
import AdminProductModal from "./AdminProductModal";
import {
  getProducts,
  createProduct,
  updateProduct,
  getProductById,
} from "../../../utils/productsApi";
import "./products.css";
import { onInventoryUpdate } from "../../../utils/inventoryBus";
import toast from "react-hot-toast";
import { getErrorText } from "../../../utils/toastText";

const RECOMMENDED_BADGES = new Set(["recommended", "popular", "featured"]);

export default function ProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const openedEditRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editInitial, setEditInitial] = useState(null);
  const [user, setUser] = useState(null);

  const params = new URLSearchParams(location.search);
  const urlSearch = params.get("search") || "";
  const [searchInput, setSearchInput] = useState(urlSearch);

  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    const next = new URLSearchParams(location.search);
    if (value.trim()) next.set("search", value);
    else next.delete("search");

    const qs = next.toString();
    navigate(qs ? `/products?${qs}` : "/products", { replace: true });
  };

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
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  const load = useCallback(() => {
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
  }, [navigate]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  useEffect(() => {
    if (!user) return;
    const off = onInventoryUpdate(() => load());
    return off;
  }, [user, load]);

  const search = useMemo(() => {
    const p = new URLSearchParams(location.search);
    return (p.get("search") || "").trim().toLowerCase();
  }, [location.search]);

  const filteredProducts = useMemo(() => {
    if (!search) return products;

    return (products || []).filter((p) => {
      const name = (p.name || "").toLowerCase();
      const badge = (p.badge || "").toLowerCase();
      return name.includes(search) || badge.includes(search);
    });
  }, [products, search]);

  const recommendedOnly = useMemo(() => {
    return (products || []).filter((p) => {
      const b = String(p.badge || "").trim().toLowerCase();
      return RECOMMENDED_BADGES.has(b);
    });
  }, [products]);

  const shown = useMemo(() => {
    return search ? filteredProducts : recommendedOnly;
  }, [search, filteredProducts, recommendedOnly]);

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
        setProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
      } else {
        const created = await createProduct(payload);
        setProducts((prev) => [created, ...prev]);
      }

      setModalOpen(false);
      setEditInitial(null);
    } catch (e) {
      throw e;
    }
  };

  useEffect(() => {
    const editId = location.state?.editProductId;
    if (!editId) return;
    if (!isAdmin) return;

    if (openedEditRef.current === editId) return;
    openedEditRef.current = editId;

    (async () => {
      try {
        const data = await getProductById(editId);
        openEdit(data);

        navigate("/products" + location.search, { replace: true, state: null });
      } catch (e) {
        toast.error(getErrorText(e, "Failed to load product"));
        navigate("/products" + location.search, { replace: true, state: null });
      }
    })();
  }, [location.state, isAdmin, navigate, location.search]);

  return (
    <>
      {!search && <HeroSection />}

      <div className="products-page">
        <div className="products-header">
          <div>
            <h1 className="products-title">
              {search ? "Search results" : "Recommended products"}
            </h1>
            <p className="products-subtitle">
              {search ? "Results by name / badge" : "Our most popular gifts"}
            </p>

            <input
              className="page-search"
              style={{ marginTop: 14, maxWidth: 360 }}
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={handleSearchChange}
            />

            {search && !loading && !error && (
              <p className="products-subtitle" style={{ marginTop: 10 }}>
                Search: <b>{search}</b> ({shown.length})
              </p>
            )}
          </div>

          {isAdmin && (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button className="admin-add" onClick={openAdd} type="button">
                + Add product
              </button>
            </div>
          )}
        </div>

        {error && <div className="products-error">{error}</div>}

        {!loading && !error && shown.length === 0 && (
          <div className="products-error">
            {search
              ? `Product not found for "${search}".`
              : 'No recommended products yet. (Set badge to "recommended" / "popular" / "featured")'}
          </div>
        )}

        <div className="products-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div className="p-skel" key={i} />
              ))
            : shown.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isAdmin={isAdmin}
                  onDeleted={(id) =>
                    setProducts((prev) => prev.filter((x) => x.id !== id))
                  }
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
