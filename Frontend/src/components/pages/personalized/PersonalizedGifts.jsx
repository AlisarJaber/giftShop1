import { useEffect, useMemo, useState, useCallback } from "react";
import "./personalized.css";
import axios from "axios";
import toast from "react-hot-toast";
import { getErrorText } from "../../../utils/toastText";
import BackButton from "../../ui/BackButton";

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

const API = "http://localhost:8000";
const APIKEY = "SEACRET1234567";

const AXIOS_CFG = {
  withCredentials: true,
  headers: { apiKey: APIKEY },
};

export default function PersonalizedGifts() {
  const [isAdmin, setIsAdmin] = useState(false);

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

  const syncAdminFromStorage = useCallback(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      setIsAdmin(!!u?.is_admin);
    } catch {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    syncAdminFromStorage();
    const onAuthChange = () => syncAdminFromStorage();
    window.addEventListener("auth-change", onAuthChange);
    return () => window.removeEventListener("auth-change", onAuthChange);
  }, [syncAdminFromStorage]);

  const loadCategories = useCallback(async () => {
    try {
      const cats = await getSingleCategories();
      const active = (cats || []).filter((c) => c.is_active !== false);
      setCategories(active);

      setActiveCat((prev) => {
        if (prev?.id && active.some((c) => c.id === prev.id)) return prev;
        return active.length ? active[0] : null;
      });
    } catch (e) {
      toast.error(getErrorText(e, "Failed to load categories"));
    }
  }, []);

  const loadProducts = useCallback(async (catId) => {
    try {
      setLoadingProducts(true);
      const rows = await getSingleProducts(catId);
      setProducts(rows || []);
    } catch (e) {
      toast.error(getErrorText(e, "Failed to load products"));
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (activeCat?.id) loadProducts(activeCat.id);
  }, [activeCat?.id, loadProducts]);

  const togglePick = (product) => {
    const catId = activeCat?.id;
    if (!catId) return;

    setSelections((prev) => {
      const cur = prev[catId] || [];
      const exists = cur.some((p) => p.id === product.id);
      if (exists) return { ...prev, [catId]: cur.filter((p) => p.id !== product.id) };
      if (cur.length >= 2) {
        toast.error("You can select up to 2 items per category");
        return prev;
      }
      return { ...prev, [catId]: [...cur, product] };
    });
  };

  const total = useMemo(
    () => Object.values(selections).flat().reduce((s, p) => s + Number(p.price), 0),
    [selections]
  );

  // ✅ IMPORTANT: support UI-only call to avoid double POST + double toasts
  const handleAddToCart = async (opts) => {
    if (opts?.onlyUI) {
      setSelections({});
      return;
    }

    try {
      const flat = Object.values(selections).flat();
      if (!flat.length) {
        toast.error("Please select at least one item to create a gift box");
        return;
      }

      const items = flat.map((p) => ({
        product_id: Number(p.id),
        quantity: 1,
      }));

      const body = { name: "My Box", items };

      await axios.post(`${API}/carts/custom-box/add`, body, AXIOS_CFG);

      toast.success("Gift box added to cart successfully");
      setSelections({});
    } catch (e) {
      toast.error(getErrorText(e, "Failed to add gift box to cart"));
    }
  };

  const pickedCount = activeCat?.id ? (selections[activeCat.id] || []).length : 0;

  const safeEditCategory = (c) => {
    if (!isAdmin) return;
    setCatModal({ open: true, mode: "edit", data: c });
  };

  const safeDeleteCategory = async (id) => {
    if (!isAdmin) return;
    try {
      await deleteSingleCategory(id);
      toast.success("Category deleted");
      await loadCategories();
    } catch (e) {
      toast.error(getErrorText(e, "Failed to delete category"));
    }
  };

  const safeEditProduct = (p) => {
    if (!isAdmin) return;
    setProdModal({ open: true, mode: "edit", data: p });
  };

  const safeDeleteProduct = async (id) => {
    if (!isAdmin) return;
    try {
      await deleteSingleProduct(id);
      toast.success("Product deleted");
      if (activeCat?.id) await loadProducts(activeCat.id);
    } catch (e) {
      toast.error(getErrorText(e, "Failed to delete product"));
    }
  };

  return (
    <div className="pg2-page">
      <div className="pg2-layout">
        <div className="pg2-left">
          <BackButton />

          {isAdmin && (
            <div className="pg2-adminCard">
              <button
                type="button"
                className="pg2-adminBtn"
                onClick={() => {
                  console.log("CLICK ADD CATEGORY");
                  setCatModal({ open: true, mode: "create", data: null });
                }}
              >
                + Add Category
              </button>

              <button
                type="button"
                className="pg2-adminBtn"
                onClick={() => setProdModal({ open: true, mode: "create", data: null })}
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
              onEdit={safeEditCategory}
              onDelete={safeDeleteCategory}
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
                onEdit={safeEditProduct}
                onDelete={safeDeleteProduct}
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

      {isAdmin && (
        <CategoryModal
          modal={catModal}
          isAdmin={isAdmin}
          onClose={() => setCatModal({ open: false, mode: "create", data: null })}
          onSave={async (payload) => {
            try {
              if (catModal.mode === "create") {
                await createSingleCategory(payload);
                toast.success("Category created");
              } else {
                await updateSingleCategory(catModal.data.id, payload);
                toast.success("Category updated");
              }
              setCatModal({ open: false, mode: "create", data: null });
              await loadCategories();
            } catch (e) {
              toast.error(getErrorText(e, "Failed to save category"));
            }
          }}
        />
      )}

      {isAdmin && (
        <ProductModal
          modal={prodModal}
          isAdmin={isAdmin}
          categories={categories}
          onClose={() => setProdModal({ open: false, mode: "create", data: null })}
          onSave={async (payload) => {
            try {
              if (prodModal.mode === "create") {
                await createSingleProduct(payload);
                toast.success("Product created");
              } else {
                await updateSingleProduct(prodModal.data.id, payload);
                toast.success("Product updated");
              }
              setProdModal({ open: false, mode: "create", data: null });
              if (activeCat?.id) await loadProducts(activeCat.id);
            } catch (e) {
              toast.error(getErrorText(e, "Failed to save product"));
            }
          }}
        />
      )}
    </div>
  );
}
