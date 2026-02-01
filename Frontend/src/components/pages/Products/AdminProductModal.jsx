import { useEffect, useState } from "react";
import { getCategories } from "../../../utils/categoriesApi";

export default function AdminProductModal({ open, onClose, initial, onSubmit }) {
  const [categories, setCategories] = useState([]);
  const [catError, setCatError] = useState("");

  const [form, setForm] = useState({
    name: "",
    price: 0,
    quantity: 0, 
    badge: "",
    image_url: "",
    description: "",
    category_id: "",
  });

  useEffect(() => {
    if (!open) return;

    setCatError("");
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCatError("Failed to load categories"));
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (initial) {
      setForm({
        name: initial.name || "",
        price: initial.price ?? 0,
        quantity: initial.quantity ?? 0,
        badge: initial.badge || "",
        image_url: initial.image_url || "",
        description: initial.description || "",
        category_id: initial.category_id ? String(initial.category_id) : "",
      });
    } else {
      setForm({
        name: "",
        price: 0,
        quantity: 0,
        badge: "",
        image_url: "",
        description: "",
        category_id: "",
      });
    }
  }, [initial, open]);

  if (!open) return null;

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      quantity: Math.max(0, Number(form.quantity || 0)),
      badge: form.badge.trim() || null,
      image_url: form.image_url.trim() || null,
      description: form.description.trim() || null,
      category_id: form.category_id ? Number(form.category_id) : null,
    };

    await onSubmit(payload);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{initial ? "Edit product" : "Add product"}</h3>
          <button className="modal-x" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <form className="modal-form" onSubmit={submit}>
          <label>Name</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />

          <label>Category</label>
          {catError ? (
            <div className="products-error" style={{ marginBottom: 8 }}>
              {catError}
            </div>
          ) : (
            <select
              value={form.category_id}
              onChange={(e) => set("category_id", e.target.value)}
              required
            >
              <option value="" disabled>
                Select a category...
              </option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          <label>Price</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            min="0"
            required
          />

          <label>Stock (Quantity)</label>
          <input
            type="number"
            value={form.quantity}
            onChange={(e) => set("quantity", e.target.value)}
            min="0"
            required
          />

          <label>Badge (optional)</label>
          <input value={form.badge} onChange={(e) => set("badge", e.target.value)} />

          <label>Image URL (optional)</label>
          <input value={form.image_url} onChange={(e) => set("image_url", e.target.value)} />

          <label>Description (optional)</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" type="submit">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
