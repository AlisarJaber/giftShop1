import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./categories.css";
import "../Products/products.css";
import AdminProductModal from "../Products/AdminProductModal";
import ProductCard from "../Products/ProductCard";
import { createProduct, updateProduct } from "../../../utils/productsApi";
import { onInventoryUpdate } from "../../../utils/inventoryBus";
import toast from "react-hot-toast";
import { getErrorText } from "../../../utils/toastText";

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

  // ✅ FILTERS
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [badgeFilter, setBadgeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NONE");

  // ✅ Search from URL (once) + local typing state
  const urlSearch = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("search") || "";
  }, [location.search]);

  const [search, setSearch] = useState(urlSearch);

  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  // ✅ IMPORTANT: don't navigate on every keystroke
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // ✅ Debounced sync to URL (stays in /categories)
  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(location.search);
      const v = search.trim();

      if (v) next.set("search", v);
      else next.delete("search");

      const nextQs = next.toString();
      const curQs = location.search.startsWith("?")
        ? location.search.slice(1)
        : location.search;

      // avoid needless replace loops
      if (nextQs !== curQs) {
        navigate(
          { pathname: location.pathname, search: nextQs ? `?${nextQs}` : "" },
          { replace: true }
        );
      }
    }, 300);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const PAGE_SIZE = 9;
  const [page, setPage] = useState(1);

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

  const loadAll = useCallback(async () => {
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
      toast.error(getErrorText(e, "Failed to load categories/products"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!me) return;
    loadAll();
  }, [me, loadAll]);

  useEffect(() => {
    if (!me) return;
    const off = onInventoryUpdate(() => loadAll());
    return off;
  }, [me, loadAll]);

  // ✅ category filter
  const shownProducts = useMemo(() => {
    if (selected === "ALL") return products;
    const id = Number(selected);
    return (products || []).filter((p) => Number(p.category_id) === id);
  }, [products, selected]);

  // ✅ collect badges
  const badgeOptions = useMemo(() => {
    const set = new Set();
    (products || []).forEach((p) => {
      const b = String(p?.badge || "").trim();
      if (b) set.add(b.toUpperCase());
    });
    return ["ALL", ...Array.from(set)];
  }, [products]);

  // ✅ apply filters + sort + SEARCH (inside categories page)
  const filteredProducts = useMemo(() => {
    const min = minPrice === "" ? null : Number(minPrice);
    const max = maxPrice === "" ? null : Number(maxPrice);
    const q = search.trim().toLowerCase();

    let list = Array.isArray(shownProducts) ? [...shownProducts] : [];

    // ✅ search by name / badge (same logic as ProductsPage)
    if (q) {
      list = list.filter((p) => {
        const name = String(p.name || "").toLowerCase();
        const badge = String(p.badge || "").toLowerCase();
        return name.includes(q) || badge.includes(q);
      });
    }

    if (min !== null && Number.isFinite(min)) {
      list = list.filter((p) => Number(p.price ?? 0) >= min);
    }
    if (max !== null && Number.isFinite(max)) {
      list = list.filter((p) => Number(p.price ?? 0) <= max);
    }

    if (onlyInStock) {
      list = list.filter((p) => Number(p.quantity ?? 0) > 0);
    }

    if (badgeFilter !== "ALL") {
      const target = String(badgeFilter).toUpperCase();
      list = list.filter((p) => String(p.badge || "").toUpperCase() === target);
    }

    if (sortBy === "PRICE_ASC") {
      list.sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0));
    } else if (sortBy === "PRICE_DESC") {
      list.sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0));
    } else if (sortBy === "NAME_ASC") {
      list.sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""))
      );
    } else if (sortBy === "NAME_DESC") {
      list.sort((a, b) =>
        String(b.name || "").localeCompare(String(a.name || ""))
      );
    }

    return list;
  }, [
    shownProducts,
    minPrice,
    maxPrice,
    onlyInStock,
    badgeFilter,
    sortBy,
    search,
  ]);

  useEffect(() => {
    setPage(1);
  }, [selected, minPrice, maxPrice, onlyInStock, badgeFilter, sortBy, search]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

  const pagedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setOnlyInStock(false);
    setBadgeFilter("ALL");
    setSortBy("NONE");
  };

  const createCategory = async () => {
    const name = newName.trim();

    if (!name) {
      toast.error("Please enter a category name.");
      return;
    }
    if (name.length < 2) {
      toast.error("Category name is too short.");
      return;
    }

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

      toast.success("Category created successfully ✅");
    } catch (e) {
      toast.error(getErrorText(e, "Failed to create category"));
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
        setProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
      } else {
        const created = await createProduct(payloadWithCategory);
        setProducts((prev) => [created, ...prev]);
      }

      setModalOpen(false);
      setEditInitial(null);
    } catch (e) {
      toast.error(getErrorText(e, "Save failed"));
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

        {/* ✅ FILTER BAR + SEARCH */}
        <div
          className="cats-filterbar"
          style={{
            marginTop: 14,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            className="page-search"
            style={{ maxWidth: 240 }}
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={handleSearchChange}
          />

          <input
            className="page-search"
            style={{ maxWidth: 140 }}
            type="number"
            placeholder="Min ₪"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />

          <input
            className="page-search"
            style={{ maxWidth: 140 }}
            type="number"
            placeholder="Max ₪"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />

          <select
            className="page-search"
            style={{ maxWidth: 180 }}
            value={badgeFilter}
            onChange={(e) => setBadgeFilter(e.target.value)}
          >
            {badgeOptions.map((b) => (
              <option key={b} value={b}>
                Badge: {b}
              </option>
            ))}
          </select>

          <select
            className="page-search"
            style={{ maxWidth: 200 }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="NONE">Sort: None</option>
            <option value="PRICE_ASC">Price: Low → High</option>
            <option value="PRICE_DESC">Price: High → Low</option>
            <option value="NAME_ASC">Name: A → Z</option>
            <option value="NAME_DESC">Name: Z → A</option>
          </select>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
            />
            In stock only
          </label>

          <button
            type="button"
            className="pager-btn"
            onClick={clearFilters}
            style={{ height: 38 }}
          >
            Clear
          </button>

          <div style={{ marginLeft: "auto", opacity: 0.8, fontWeight: 700 }}>
            Showing {filteredProducts.length} items
          </div>
        </div>

        {isAdmin && (
          <div
            style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}
          >
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
        ) : filteredProducts.length === 0 ? (
          <div className="state-box">No products found with these filters.</div>
        ) : (
          <>
            <div className="cat-products-grid">
              {pagedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isAdmin={isAdmin}
                  onDeleted={(id) =>
                    setProducts((prev) => prev.filter((x) => x.id !== id))
                  }
                  onEdit={(data) => {
                    setEditInitial(data);
                    setModalOpen(true);
                  }}
                />
              ))}
            </div>

            {pageCount > 1 && (
              <div className="pager">
                <button
                  className="pager-btn"
                  onClick={() => setPage((x) => Math.max(1, x - 1))}
                  disabled={page === 1}
                  type="button"
                >
                  Prev
                </button>

                <div className="pager-info">
                  Page {page} / {pageCount}
                </div>

                <button
                  className="pager-btn"
                  onClick={() => setPage((x) => Math.min(pageCount, x + 1))}
                  disabled={page === pageCount}
                  type="button"
                >
                  Next
                </button>
              </div>
            )}
          </>
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
              <button
                className="modal-btn ghost"
                onClick={() => setShowAdd(false)}
                type="button"
              >
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
}
