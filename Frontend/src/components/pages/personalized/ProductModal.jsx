import { useEffect, useMemo, useState } from "react";
import { uploadImage } from "../../../utils/singleApi";

export default function ProductModal({
  modal,
  categories,
  onClose,
  onSave,
  isAdmin = false,
}) {
  const open = !!modal?.open;
  if (!isAdmin) return null;
  if (!open) return null;

  const mode = modal?.mode || "create";
  const data = modal?.data || null;
  const dataId = data?.id ?? null;

  const categoriesList = useMemo(() => categories || [], [categories]);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [desc, setDesc] = useState("");

  // ✅ upload state
  const [uploading, setUploading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [fileName, setFileName] = useState("");

  // ✅ אתחול שדות רק כשפותחים מודאל / מחליפים mode / מחליפים מוצר לעריכה
  useEffect(() => {
    if (!open) return;

    setErrMsg("");
    setUploading(false);
    setFileName("");

    if (mode === "edit" && data) {
      setName(data?.name ?? "");
      setCategoryId(String(data?.category_id ?? ""));
      setPrice(String(data?.price ?? ""));
      setImageUrl(data?.image_url ?? "");
      setDesc(data?.description ?? "");
    } else {
      // create mode
      setName("");
      setCategoryId("");
      setPrice("");
      setImageUrl("");
      setDesc("");
    }
  }, [open, mode, dataId]); // ✅ חשוב: לא לשים data או modal

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type?.startsWith("image/")) {
      setErrMsg("Please upload an image file.");
      event.target.value = "";
      return;
    }

    try {
      setErrMsg("");
      setUploading(true);
      setFileName(file.name);

      const url = await uploadImage(file);
      setImageUrl(url);
    } catch (err) {
      console.error("Image upload failed", err);
      setErrMsg("Upload failed. Please try again.");
      setFileName("");
    } finally {
      setUploading(false);
      // מאפשר לבחור שוב אותו קובץ אם רוצים
      event.target.value = "";
    }
  };

  const submit = () => {
    if (uploading) return;

    const p = {
      name: name.trim(),
      category_id: Number(categoryId),
      price: Number(price),
      image_url: imageUrl?.trim() || null,
      description: desc.trim() || null,
    };

    if (!p.name) return;
    if (!p.category_id) return;
    if (!Number.isFinite(p.price) || p.price <= 0) return;

    onSave?.(p);
  };

  return (
    <div className="pg2-modalBackdrop" onClick={onClose}>
      <div className="pg2-modalCard" onClick={(e) => e.stopPropagation()}>
        <div className="pg2-modalHead">
          <div className="pg2-modalTitle">
            {mode === "create" ? "Add product" : "Edit product"}
          </div>
          <button className="pg2-modalX" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <div className="pg2-modalBody">
          <label className="pg2-modalLabel">Name</label>
          <input
            className="pg2-modalInput"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product name"
            autoFocus
          />

          <label className="pg2-modalLabel">Category</label>
          <select
            className="pg2-modalInput"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Select category</option>
            {categoriesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <label className="pg2-modalLabel">Price</label>
          <input
            className="pg2-modalInput"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            placeholder="0"
          />

          {/* ✅ Upload UI (קליל, בלי Choose file) */}
          <label className="pg2-modalLabel">Product image</label>

          <div className="file-row">
            <input
              id="product-modal-image-file"
              className="file-input-hidden"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />

            <label
              htmlFor="product-modal-image-file"
              className={`file-btn ${uploading ? "is-disabled" : ""}`}
            >
              {uploading ? "Uploading..." : "Upload image"}
            </label>

            <span className="file-name">
              {fileName
                ? fileName
                : imageUrl
                ? "Image selected"
                : "No file selected"}
            </span>

            {imageUrl ? (
              <button
                type="button"
                className="file-clear"
                onClick={() => {
                  setImageUrl("");
                  setFileName("");
                  setErrMsg("");
                }}
                disabled={uploading}
                title="Remove image"
              >
                ✕
              </button>
            ) : null}
          </div>

          {errMsg ? <div className="file-error">{errMsg}</div> : null}

          {imageUrl ? (
            <div className="image-preview">
              <img src={imageUrl} alt="preview" />
            </div>
          ) : null}

          <label className="pg2-modalLabel">Description (optional)</label>
          <textarea
            className="pg2-modalTextarea"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="..."
          />
        </div>

        <div className="pg2-modalActions">
          <button className="pg2-modalBtn ghost" onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className="pg2-modalBtn primary"
            onClick={submit}
            type="button"
            disabled={uploading}
            style={uploading ? { opacity: 0.7, cursor: "not-allowed" } : undefined}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
