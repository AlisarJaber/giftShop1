import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./categories.css";

import AdminProductModal from "../Products/AdminProductModal";
import ProductCard from "../Products/ProductCard";
import { createProduct, updateProduct } from "../../../utils/productsApi";

import {
  Home,
  Gift,
  Sparkles,
  Heart,
  Cake,
  PartyPopper,
  ShoppingBag,
  Baby,
  GraduationCap,
  BriefcaseBusiness,
  Gem,
  Smile,
} from "lucide-react";

const API = "http://localhost:8000";
const APIKEY = "SEACRET1234567";

const CATEGORY_ICONS = [
  { match: ["home", "house"], icon: Home },
  { match: ["birthday", "bday"], icon: Cake },
  { match: ["baby", "newborn"], icon: Baby },
  { match: ["love", "valentine"], icon: Heart },
  { match: ["wedding"], icon: Gem },
  { match: ["holiday", "eid", "ramadan", "christmas"], icon: Sparkles },
  { match: ["work", "office", "business"], icon: BriefcaseBusiness },
  { match: ["graduation", "school"], icon: GraduationCap },
  { match: ["party", "celebration"], icon: PartyPopper },
  { match: ["gift"], icon: Gift },
  { match: ["shop", "store"], icon: ShoppingBag },
];

function pickIconByName(name) {
  const n = String(name || "").toLowerCase();
  const hit = CATEGORY_ICONS.find((x) => x.match.some((m) => n.includes(m)));
  return hit?.icon || Smile;
}

export default function CategoriesPage() {
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
        alert("Failed to load categories/products");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [me]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const s = params.get("search");
    if (s && s.trim()) {
      navigate(`/products?search=${encodeURIComponent(s)}`, { replace: true });
    }
  }, [location.search, navigate]);

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
    return <div className="state-box" style={{ margin: 20 }}>Checking session...</div>;
  }

  return (
    <div className="categories-page">
      <section className="categories-hero">
        <h1 className="categories-title">Gift Categories</h1>
        <p className="categories-subtitle">
          Explore our collection and find the perfect gift by category
        </p>

        <div className="categories-cards" dir="ltr">
          <button
            type="button"
            className={selected === "ALL" ? "cat-card active" : "cat-card"}
            onClick={() => setSelected("ALL")}
          >
            <div className="cat-icon">
              <Sparkles size={18} />
            </div>
            <div className="cat-text">
              <div className="cat-name">All</div>
              <div className="cat-sub">All gifts</div>
            </div>
          </button>

          {(categories || []).map((c) => {
            const Icon = pickIconByName(c.name);
            const isActive = String(selected) === String(c.id);

            return (
              <button
                key={c.id}
                type="button"
                className={isActive ? "cat-card active" : "cat-card"}
                onClick={() => setSelected(String(c.id))}
              >
                <div className="cat-icon">
                  <Icon size={18} />
                </div>
                <div className="cat-text">
                  <div className="cat-name">{c.name}</div>
                  <div className="cat-sub">Gifts for {c.name}</div>
                </div>
              </button>
            );
          })}
        </div>

        {isAdmin && (
          <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              className="admin-add"
              onClick={() => {
                setEditInitial(null);
                setModalOpen(true);
              }}
              type="button"
            >
              + Add product
            </button>

            <button
              className="add-category-btn"
              onClick={() => setShowAdd(true)}
              type="button"
            >
              + Add Category
            </button>
          </div>
        )}
      </section>

      <section className="products-section">
        {loading ? (
          <div className="state-box">Loading...</div>
        ) : shownProducts.length === 0 ? (
          <div className="state-box">No products found in this category.</div>
        ) : (
          <div className="products-grid">
            {shownProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isAdmin={isAdmin}
                onDeleted={(id) => setProducts((prev) => prev.filter((x) => x.id !== id))}
                onEdit={(fullProduct) => {
                  setEditInitial(fullProduct);
                  setModalOpen(true);
                }}
              />
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
              <button className="modal-btn primary" onClick={createCategory} disabled={creating} type="button">
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
}
