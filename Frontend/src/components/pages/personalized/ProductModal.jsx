import { useEffect, useState } from "react";

export default function ProductModal({ modal, categories, onClose, onSave, isAdmin = false }) {
  const open = !!modal?.open;
  if (!isAdmin) return null;
  if (!open) return null;

  const mode = modal?.mode || "create";
  const data = modal?.data || {};

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(data?.name ?? "");
    setCategoryId(String(data?.category_id ?? ""));
    setPrice(String(data?.price ?? ""));
    setImageUrl(data?.image_url ?? "");
    setDesc(data?.description ?? "");
  }, [open, data]);

  const submit = () => {
    const p = {
      name: name.trim(),
      category_id: Number(categoryId),
      price: Number(price),
      image_url: imageUrl.trim() || null,
      description: desc.trim() || null,
    };
    if (!p.name || !p.category_id || !Number.isFinite(p.price) || p.price <= 0) return;
    onSave?.(p);
  };

  return (
    <div className="pg2-modalBackdrop" onClick={onClose}>
      <div className="pg2-modalCard" onClick={(e) => e.stopPropagation()}>
        <div className="pg2-modalHead">
          <div className="pg2-modalTitle">{mode === "create" ? "Add product" : "Edit product"}</div>
          <button className="pg2-modalX" onClick={onClose} type="button">✕</button>
        </div>

        <div className="pg2-modalBody">
          <label className="pg2-modalLabel">Name</label>
          <input className="pg2-modalInput" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" />

          <label className="pg2-modalLabel">Category</label>
          <select className="pg2-modalInput" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Select category</option>
            {(categories || []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <label className="pg2-modalLabel">Price</label>
          <input className="pg2-modalInput" value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="0" />

          <label className="pg2-modalLabel">Image URL (optional)</label>
          <input className="pg2-modalInput" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />

          <label className="pg2-modalLabel">Description (optional)</label>
          <textarea className="pg2-modalTextarea" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="..." />
        </div>

        <div className="pg2-modalActions">
          <button className="pg2-modalBtn ghost" onClick={onClose} type="button">Cancel</button>
          <button className="pg2-modalBtn primary" onClick={submit} type="button">Save</button>
        </div>
      </div>
    </div>
  );
}
