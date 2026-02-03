import { useEffect, useMemo, useState } from "react";
import "./personalized.css";
import {
  getSingleCategories,
  getSingleProducts,
  createSingleCategory,
  updateSingleCategory,
  deleteSingleCategory,
  createSingleProduct,
  updateSingleProduct,
  deleteSingleProduct,
} from "../../../utils/singleApi";

import CategoryGrid from "./CategoryGrid";
import ProductGrid from "./ProductGrid";
import SelectionSummary from "./SelectionSummary";
import CategoryModal from "./CategoryModal";
import ProductModal from "./ProductModal";

export default function PersonalizedGifts() {
  // ✅ admin gate from localStorage (kept updated by Navigation)
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }
  const isAdmin = !!user?.is_admin;

  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [products, setProducts] = useState([]);
  const [selections, setSelections] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [catModal, setCatModal] = useState({
    open: false,
    mode: "create",
    data: null,
  });
  const [prodModal, setProdModal] = useState({
    open: false,
    mode: "create",
    data: null,
  });

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeCat?.id) loadProducts(activeCat.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCat?.id]);

  const loadCategories = async () => {
    const cats = await getSingleCategories();
    const active = cats.filter((c) => c.is_active !== false);
    setCategories(active);
    if (!activeCat && active.length) setActiveCat(active[0]);
  };

  const loadProducts = async (catId) => {
    setLoadingProducts(true);
    const rows = await getSingleProducts(catId);
    setProducts(rows);
    setLoadingProducts(false);
  };

  const togglePick = (product) => {
    const catId = activeCat.id;
    setSelections((prev) => {
      const cur = prev[catId] || [];
      const exists = cur.some((p) => p.id === product.id);
      if (exists) return { ...prev, [catId]: cur.filter((p) => p.id !== product.id) };
      if (cur.length >= 2) return prev;
      return { ...prev, [catId]: [...cur, product] };
    });
  };

  const total = useMemo(
    () => Object.values(selections).flat().reduce((s, p) => s + Number(p.price), 0),
    [selections]
  );

  const handleAddToCart = () => {
    const payload = {
      type: "custom_box",
      items: Object.entries(selections).map(([catId, items]) => ({
        category_id: Number(catId),
        products: items.map((p) => ({ product_id: p.id, price: p.price })),
      })),
      total,
    };
    console.log("ADD CUSTOM BOX TO CART:", payload);
    alert("Custom gift box added to cart (check console)");
  };

  const pickedCount = activeCat?.id ? (selections[activeCat.id] || []).length : 0;

  return (
    <div className="pg2-page">
      <div className="pg2-layout">
        <div className="pg2-left">
          {/* ✅ ADMIN BUTTONS - only if admin */}
          {isAdmin && (
            <div className="pg2-adminCard">
              <button
                className="pg2-adminBtn"
                onClick={() => setCatModal({ open: true, mode: "create" })}
              >
                + Add Category
              </button>
              <button
                className="pg2-adminBtn"
                onClick={() => setProdModal({ open: true, mode: "create" })}
              >
                + Add Product
              </button>
            </div>
          )}

          <div className="pg2-intro">
            <h2 className="pg2-intro-title">Create your perfect gift 🎁</h2>
            <p className="pg2-intro-sub">
              Choose categories, pick your favorite items, and we’ll bundle them into one beautiful gift box.
            </p>
          </div>

          <div className="pg2-section">
            <div className="pg2-section-head">
              <div className="pg2-section-head-left">
                <div className="pg2-step-badge">1</div>
                <h3 className="pg2-section-title">Choose a category</h3>
              </div>
            </div>

            <p className="pg2-step-help">
              Pick one category to start. Then choose up to <b>2</b> products from it.
            </p>

            <CategoryGrid
              categories={categories}
              activeCat={activeCat}
              selections={selections}
              onSelect={setActiveCat}
              isAdmin={isAdmin}
              onEdit={isAdmin ? (c) => setCatModal({ open: true, mode: "edit", data: c }) : undefined}
              onDelete={
                isAdmin
                  ? async (id) => {
                      await deleteSingleCategory(id);
                      loadCategories();
                    }
                  : undefined
              }
            />
          </div>

          <div className="pg2-section">
            <div className="pg2-section-head">
              <div className="pg2-section-head-left">
                <div className={`pg2-step-badge ${activeCat ? "" : "gray"}`}>2</div>
                <h3 className="pg2-section-title">
                  {activeCat ? `Select products — ${activeCat.name}` : "Select products"}
                </h3>
              </div>

              {activeCat && (
                <div className="pg2-selected-counter">Selected: {pickedCount}/2</div>
              )}
            </div>

            {!activeCat ? (
              <div className="pg2-loading">Choose a category first 👆</div>
            ) : (
              <ProductGrid
                products={products}
                loading={loadingProducts}
                activeCat={activeCat}
                selections={selections}
                onToggle={togglePick}
                isAdmin={isAdmin}
                onEdit={isAdmin ? (p) => setProdModal({ open: true, mode: "edit", data: p }) : undefined}
                onDelete={
                  isAdmin
                    ? async (id) => {
                        await deleteSingleProduct(id);
                        loadProducts(activeCat.id);
                      }
                    : undefined
                }
              />
            )}
          </div>
        </div>

        <SelectionSummary
          categories={categories}
          selections={selections}
          total={total}
          onAddToCart={handleAddToCart}
        />
      </div>

      {/* ✅ MODALS - only if admin */}
      {isAdmin && (
        <CategoryModal
          modal={catModal}
          onClose={() => setCatModal({ open: false })}
          onSave={async (payload) => {
            catModal.mode === "create"
              ? await createSingleCategory(payload)
              : await updateSingleCategory(catModal.data.id, payload);
            setCatModal({ open: false });
            loadCategories();
          }}
        />
      )}

      {isAdmin && (
        <ProductModal
          modal={prodModal}
          categories={categories}
          onClose={() => setProdModal({ open: false })}
          onSave={async (payload) => {
            prodModal.mode === "create"
              ? await createSingleProduct(payload)
              : await updateSingleProduct(prodModal.data.id, payload);
            setProdModal({ open: false });
            loadProducts(activeCat.id);
          }}
        />
      )}
    </div>
  );
}
