import { useEffect, useMemo, useState } from "react";
import "./personalized.css";
import { getSingleCategories, getSingleProducts, createSingleCategory, createSingleProduct } from "../../../utils/singleApi";


// שמים תמונות לפי שם קטגוריה (כי בטבלה שלך לקטגוריות אין image_url)
const CATEGORY_IMAGES = {
  Perfume:
    "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=70",
  Candles:
    "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=70",
  Chocolate:
    "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=1200&q=70",
  Skincare:
    "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=1200&q=70",
  Accessories:
    "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=70",
  Stationery:
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=70",
};

// fallback אם אין התאמה בשם
const FALLBACK_CAT_IMG =
  "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=1200&q=60";

export default function PersonalizedGifts() {
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState(null); // object
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState("");
  // --- Admin form states ---
  const [newCatName, setNewCatName] = useState("");

  const [pName, setPName] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pImg, setPImg] = useState("");
  const [pCatId, setPCatId] = useState(""); // select category id


  // selections: { [catId]: SinProduct[] }
  const [selections, setSelections] = useState({});

  // load categories
  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const cats = await getSingleCategories();
        const active = (cats || []).filter((c) => c.is_active !== false);
        setCategories(active);

        if (active.length) setActiveCat(active[0]);
      } catch (e) {
        setError("Failed to load categories");
      }
    };
    load();
  }, []);

  // load products when category changes
  useEffect(() => {
    const loadProducts = async () => {
      if (!activeCat?.id) return;
      try {
        setError("");
        setLoadingProducts(true);
        const rows = await getSingleProducts(activeCat.id);
        setProducts(rows || []);
      } catch (e) {
        setError("Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, [activeCat?.id]);

  const selectedInActive = selections[activeCat?.id] || [];

  const isPicked = (catId, productId) =>
    (selections[catId] || []).some((p) => p.id === productId);

  const togglePick = (product) => {
    const catId = activeCat?.id;
    if (!catId) return;

    setSelections((prev) => {
      const current = prev[catId] || [];
      const exists = current.some((p) => p.id === product.id);

      // remove
      if (exists) {
        return { ...prev, [catId]: current.filter((p) => p.id !== product.id) };
      }

      // limit 2 per category
      if (current.length >= 2) {
        alert("You can pick up to 2 items per category.");
        return prev;
      }

      return { ...prev, [catId]: [...current, product] };
    });
  };

  const removeFromCategory = (catId, productId) => {
    setSelections((prev) => {
      const current = prev[catId] || [];
      return { ...prev, [catId]: current.filter((p) => p.id !== productId) };
    });
  };

  const total = useMemo(() => {
    const all = Object.values(selections).flat();
    return all.reduce((sum, p) => sum + Number(p.price || 0), 0);
  }, [selections]);

  const totalItems = useMemo(() => Object.values(selections).flat().length, [selections]);

  const handleAddToCart = () => {
    // פה את מחברת ל-API שלך: POST /cart/custom או whatever
    // כרגע רק דוגמה:
    const payload = Object.entries(selections).map(([catId, items]) => ({
      category_id: Number(catId),
      items: items.map((p) => ({ product_id: p.id, price: p.price })),
    }));

    console.log("CUSTOM BOX PAYLOAD:", payload);
    alert("Saved! (check console for payload)");
  };

  const refreshCategories = async () => {
    const cats = await getSingleCategories();
    const active = (cats || []).filter((c) => c.is_active !== false);
    setCategories(active);
    if (!activeCat && active.length) setActiveCat(active[0]);
  };

  const refreshProducts = async (catId) => {
    if (!catId) return;
    const rows = await getSingleProducts(catId);
    setProducts(rows || []);
  };

  const handleCreateCategory = async () => {
    try {
      if (!newCatName.trim()) return alert("Enter category name");
      await createSingleCategory(newCatName.trim());
      setNewCatName("");
      await refreshCategories();
    } catch (e) {
      alert("Failed to create category (only admin can do this)");
    }
  };

  const handleCreateProduct = async () => {
    try {
      if (!pName.trim()) return alert("Enter product name");
      if (!pPrice || Number(pPrice) <= 0) return alert("Enter valid price");
      if (!pCatId) return alert("Select a category");

      await createSingleProduct({
        name: pName.trim(),
        description: pDesc.trim() || null,
        price: Number(pPrice),
        image_url: pImg.trim() || null,
        category_id: Number(pCatId),
      });

      setPName("");
      setPDesc("");
      setPPrice("");
      setPImg("");

      // refresh current category products
      const current = activeCat?.id ? activeCat.id : Number(pCatId);
      await refreshProducts(current);
    } catch (e) {
      alert("Failed to create product (only admin can do this)");
    }
  };


  if (error) {
    return <div style={{ padding: 20 }}>{error}</div>;
  }

  return (
    <div className="pg2-page">
      <div className="pg2-container">
        <div className="pg2-layout">
          {/* LEFT */}
          <div className="pg2-left">
            {/* ADMIN: Add Category / Product */}
            <div className="pg2-adminCard">
              <div className="pg2-adminTitle">Admin Panel</div>

              <div className="pg2-adminRow">
                <input
                  className="pg2-adminInput"
                  placeholder="New category name (e.g. Perfume)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
                <button className="pg2-adminBtn" onClick={handleCreateCategory} type="button">
                  + Add Category
                </button>
              </div>

              <div className="pg2-adminRow">
                <input
                  className="pg2-adminInput"
                  placeholder="Product name"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                />
                <input
                  className="pg2-adminInput"
                  placeholder="Price (₪)"
                  type="number"
                  value={pPrice}
                  onChange={(e) => setPPrice(e.target.value)}
                />
              </div>

              <div className="pg2-adminRow">
                <input
                  className="pg2-adminInput"
                  placeholder="Image URL (optional)"
                  value={pImg}
                  onChange={(e) => setPImg(e.target.value)}
                />
                <select
                  className="pg2-adminSelect"
                  value={pCatId}
                  onChange={(e) => setPCatId(e.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pg2-adminRow">
                <input
                  className="pg2-adminInput"
                  placeholder="Description (optional)"
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                />
                <button className="pg2-adminBtn" onClick={handleCreateProduct} type="button">
                  + Add Product
                </button>
              </div>
            </div>

            {/* Step 1 */}
            <div className="pg2-section">
              <div className="pg2-section-head">
                <div className="pg2-step-badge">1</div>
                <h3 className="pg2-section-title">Choose a Category</h3>
              </div>

              <div className="pg2-cats">
                {categories.map((c) => {
                  const count = (selections[c.id] || []).length;
                  const active = activeCat?.id === c.id;

                  const img =
                    CATEGORY_IMAGES[c.name] || FALLBACK_CAT_IMG;

                  return (
                    <button
                      key={c.id}
                      className={`pg2-cat ${active ? "is-active" : ""}`}
                      onClick={() => setActiveCat(c)}
                      type="button"
                      style={{ backgroundImage: `url(${img})` }}
                    >
                      <div className="pg2-cat-overlay" />
                      <div className="pg2-cat-name">{c.name}</div>

                      {/* badge top-right */}
                      <div className={`pg2-cat-count ${count ? "has" : ""}`}>
                        {count}
                      </div>

                      {/* checkmark when active */}
                      {active ? <div className="pg2-cat-check">✓</div> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2 */}
            <div className="pg2-section">
              <div className="pg2-section-head pg2-section-head-row">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="pg2-step-badge">2</div>
                  <h3 className="pg2-section-title">Select Products</h3>
                </div>

                <div className="pg2-selected-counter">
                  Selected: {selectedInActive.length}/2
                </div>
              </div>

              {loadingProducts ? (
                <div className="pg2-loading">Loading products...</div>
              ) : (
                <div className="pg2-products">
                  {products.map((p) => {
                    const picked = isPicked(activeCat?.id, p.id);
                    return (
                      <button
                        key={p.id}
                        className={`pg2-product ${picked ? "is-picked" : ""}`}
                        onClick={() => togglePick(p)}
                        type="button"
                      >
                        <div className="pg2-product-imgWrap">
                          <img
                            src={p.image_url || "https://via.placeholder.com/400x300"}
                            alt={p.name}
                            className="pg2-product-img"
                          />
                          {picked ? <div className="pg2-product-check">✓</div> : null}
                        </div>

                        <div className="pg2-product-body">
                          <div className="pg2-product-name">{p.name}</div>
                          <div className="pg2-product-price">₪{p.price}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <aside className="pg2-right">
            <div className="pg2-sideCard">
              <div className="pg2-sideHead">
                <div className="pg2-step-badge">3</div>
                <h3 className="pg2-sideTitle">Your Selection</h3>
              </div>

              {totalItems === 0 ? (
                <div className="pg2-empty">
                  <div className="pg2-empty-icon">📦</div>
                  <div className="pg2-empty-title">Your custom gift box is empty</div>
                  <div className="pg2-empty-sub">
                    Select products to build your gift
                  </div>
                </div>
              ) : (
                <div className="pg2-chosen">
                  {categories.map((c) => {
                    const items = selections[c.id] || [];
                    if (!items.length) return null;

                    return (
                      <div key={c.id} className="pg2-chosen-group">
                        <div className="pg2-chosen-cat">{c.name}</div>

                        {items.map((p) => (
                          <div key={p.id} className="pg2-chosen-item">
                            <img
                              src={p.image_url || "https://via.placeholder.com/80"}
                              alt={p.name}
                              className="pg2-chosen-thumb"
                            />
                            <div className="pg2-chosen-meta">
                              <div className="pg2-chosen-name">{p.name}</div>
                              <div className="pg2-chosen-price">₪{p.price}</div>
                            </div>
                            <button
                              className="pg2-remove"
                              onClick={() => removeFromCategory(c.id, p.id)}
                              type="button"
                              title="Remove"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })}

                  <div className="pg2-divider" />

                  <div className="pg2-totalRow">
                    <span>Total</span>
                    <span className="pg2-total">₪{total}</span>
                  </div>

                  <button className="pg2-addBtn" onClick={handleAddToCart} type="button">
                    🛒 Add to Cart
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
