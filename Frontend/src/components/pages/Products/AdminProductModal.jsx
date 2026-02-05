import { useEffect, useState } from "react";
import { getCategories } from "../../../utils/categoriesApi";
import toast from "react-hot-toast";
import { getErrorText } from "../../../utils/toastText";

// ⬇️ שימי לב: עדכני את הנתיב לפי איפה שהפונקציה אצלך נמצאת
import { uploadImage } from "../../../utils/singleApi";

export default function AdminProductModal({ open, onClose, initial, onSubmit }) {
  const [categories, setCategories] = useState([]);
  const [catError, setCatError] = useState("");

  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  const [form, setForm] = useState({
    name: "",
    price: 0,
    quantity: 0,
    badge: "",
    image_url: "", // נשמר פה ה-URL שמתקבל אחרי upload
    description: "",
    category_id: "",
  });

  useEffect(() => {
    if (!open) return;

    setCatError("");
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => {
        setCatError("Failed to load categories");
        toast.error(getErrorText(err, "Failed to load categories"));
      });
  }, [open]);

  useEffect(() => {
    if (!open) return;

    // reset upload status on open
    setUploading(false);
    setUploadErr("");

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

  // ✅ זה בדיוק כמו הפונקציה שלך, רק מחובר ל-form.image_url
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadErr("");
      setUploading(true);

      const url = await uploadImage(file);

      set("image_url", url); // שומר URL בתוך הטופס
      toast.success("Image uploaded ✅");
    } catch (err) {
      console.error("Image upload failed", err);
      setUploadErr("Upload failed. Please try again.");
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      // מאפשר לבחור שוב אותו קובץ אם רוצים
      event.target.value = "";
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (uploading) {
      toast.error("Please wait for the image upload to finish.");
      return;
    }

    // ✅ ולידציות פרונט מינימליות
    const name = form.name.trim();
    const priceNum = Number(form.price);
    const qtyNum = Number(form.quantity || 0);
    const categoryId = form.category_id ? Number(form.category_id) : null;

    if (!name) {
      toast.error("Please enter a product name.");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a category.");
      return;
    }

    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      toast.error("Price must be greater than 0.");
      return;
    }

    if (!Number.isFinite(qtyNum) || qtyNum < 0) {
      toast.error("Quantity must be 0 or more.");
      return;
    }

    // image_url הוא optional — אבל אם קיים נוודא שהוא באמת URL
    const imageUrl = (form.image_url || "").trim();
    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
      toast.error("Image upload returned an invalid URL.");
      return;
    }

    const payload = {
      name,
      price: priceNum,
      quantity: Math.max(0, qtyNum),
      badge: form.badge.trim() || null,
      image_url: imageUrl || null,
      description: form.description.trim() || null,
      category_id: categoryId,
    };

    try {
      await onSubmit(payload);
      toast.success(
        initial ? "Product updated successfully ✅" : "Product created successfully 🎉"
      );
    } catch (err) {
      toast.error(getErrorText(err, "Save failed. Please try again."));
    }
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
          <input
            value={form.badge}
            onChange={(e) => set("badge", e.target.value)}
          />

          {/* ✅ במקום Image URL */}
          <label>Product image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />

          {/* מצב upload + הודעה */}
          <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
            {uploading ? "Uploading image..." : null}
            {uploadErr ? (
              <div style={{ color: "#b00020", marginTop: 4 }}>{uploadErr}</div>
            ) : null}

            {/* מציג אם כבר יש תמונה (ב-edit או אחרי upload) */}
            {form.image_url ? (
              <div style={{ marginTop: 6 }}>
                <div style={{ marginBottom: 6 }}>Current image:</div>
                <img
                  src={form.image_url}
                  alt="product"
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 10,
                    border: "1px solid #eee",
                  }}
                />
              </div>
            ) : null}
          </div>

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
            <button className="btn-primary" type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
