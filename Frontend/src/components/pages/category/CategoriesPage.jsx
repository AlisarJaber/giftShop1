import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./categories.css";

import AdminProductModal from "../Products/AdminProductModal";
import { createProduct, updateProduct } from "../../../utils/productsApi"; // ✅ חשוב

const API = "http://localhost:8000";
const APIKEY = "SEACRET1234567";

const CategoriesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [me, setMe] = useState(undefined);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editInitial, setEditInitial] = useState(null);

  const isAdmin = !!me?.is_admin;

  useEffect(() => {
    axios
      .get(`${API}/auth/me`, {
        withCredentials: true,
        headers: { apiKey: APIKEY },
      })
      .then((res) => setMe(res.data))
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    if (me === null) navigate("/login", { replace: true });
  }, [me, navigate]);

  useEffect(() => {
    if (!me) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${API}/categories`, {
            withCredentials: true,
            headers: { apiKey: APIKEY },
          }),
          axios.get(`${API}/products`, {
            withCredentials: true,
            headers: { apiKey: APIKEY },
          }),
        ]);

        setCategories(catRes.data || []);
        setProducts(prodRes.data || []);
      } catch (e) {
        console.error(e);
        alert("Failed to load categories/products");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [me]);

  // אם הגיע ?search לפה -> מעבירים ל-products כי החיפוש שם בנאבר
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const s = params.get("search");
    if (s && s.trim()) {
      navigate(`/products?search=${encodeURIComponent(s)}`, { replace: true });
    }
  }, [location.search, navigate]);

  const buttons = useMemo(
    () => [{ id: "ALL", name: "All" }, ...(categories || [])],
    [categories]
  );

  const shownProducts = useMemo(() => {
    if (selected === "ALL") return products;
    const id = Number(selected);
    return (products || []).filter((p) => Number(p.category_id) === id);
  }, [products, selected]);

  const createCategory = async () => {
    const name = newName.trim();
    if (!name) return;

    setCreating(true);
    try {
      const res = await axios.post(
        `${API}/categories`,
        { name },
        { withCredentials: true, headers: { apiKey: APIKEY } }
      );
      setCategories((prev) => [res.data, ...prev]);
      setNewName("");
      setShowAdd(false);
    } catch (e) {
      alert(e?.response?.data?.detail || "Failed to create category");
    } finally {
      setCreating(false);
    }
  };

  const submitProductModal = async (payload) => {
    if (!isAdmin) return;

    try {
      // אם מוסיפים מוצר בזמן שבחרנו קטגוריה ספציפית -> שייך אותה אוטומטית
      const payloadWithCategory =
        !editInitial?.id && selected !== "ALL"
          ? { ...payload, category_id: Number(selected) }
          : payload;

      if (editInitial?.id) {
        const updated = await updateProduct(editInitial.id, payloadWithCategory);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await createProduct(payloadWithCategory);
        setProducts((prev) => [created, ...prev]);
      }

      setModalOpen(false);
      setEditInitial(null);
    } catch (e) {
      alert(e?.response?.data?.detail || "Save failed");
    }
  };

  if (me === undefined) {
    return (
      <div className="state-box" style={{ margin: 20 }}>
        Checking session...
      </div>
    );
  }

  return (
    <div className="categories-page">
      <section className="categories-hero">
        <h1 className="categories-title">Gift Categories</h1>
        <p className="categories-subtitle">
          Explore our collection and find the perfect gift by category
        </p>

        {isAdmin && (
          <button
            className="admin-add"
            style={{ marginTop: 12 }}
            onClick={() => {
              setEditInitial(null);
              setModalOpen(true);
            }}
            type="button"
          >
            + Add product
          </button>
        )}

        <div className="categories-bar" dir="ltr">
          {buttons.map((c) => (
            <button
              key={c.id}
              className={String(selected) === String(c.id) ? "cat-chip active" : "cat-chip"}
              onClick={() => setSelected(String(c.id))}
              type="button"
            >
              {c.name}
            </button>
          ))}

          {isAdmin && (
            <button className="add-category-btn" onClick={() => setShowAdd(true)} type="button">
              + Add Category
            </button>
          )}
        </div>
      </section>

      <section className="products-section">
        {loading ? (
          <div className="state-box">Loading...</div>
        ) : shownProducts.length === 0 ? (
          <div className="state-box">No products found in this category.</div>
        ) : (
          <div className="products-grid">
            {shownProducts.map((p) => (
              <div key={p.id} className="product-card">
                <div
                  className="product-image-wrap"
                  onClick={() => navigate(`/products/${p.id}`)}
                  role="button"
                  tabIndex={0}
                >
                  <img
                    src={p.image_url || "https://via.placeholder.com/400x300?text=No+Image"}
                    alt={p.name}
                    className="product-image"
                  />
                  {p.badge && (
                    <div className="badge-row">
                      <span className="badge">{String(p.badge).toUpperCase()}</span>
                    </div>
                  )}
                </div>

                <div className="product-info">
                  <div className="product-name">{p.name}</div>

                  <div className="product-bottom">
                    <div className="product-price">${Number(p.price).toFixed(2)}</div>

                    <div className="product-actions">
                      <button className="add-to-cart-btn" type="button" onClick={() => navigate("/cart")}>
                        Add to cart
                      </button>

                      {isAdmin && (
                        <button
                          className="edit-product-btn"
                          type="button"
                          onClick={() => {
                            setEditInitial(p);
                            setModalOpen(true);
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showAdd && isAdmin && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Add new category</div>

            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="modal-input"
              placeholder="Category name (English)"
            />

            <div className="modal-actions">
              <button className="modal-btn ghost" onClick={() => setShowAdd(false)} type="button">
                Cancel
              </button>
              <button
                className="modal-btn primary"
                onClick={createCategory}
                disabled={creating}
                type="button"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminProductModal
        open={modalOpen}
        initial={editInitial}
        onClose={() => {
          setModalOpen(false);
          setEditInitial(null);
        }}
        onSubmit={submitProductModal}
      />
    </div>
  );
};

export default CategoriesPage;
