import { useEffect, useState } from "react";
import { uploadImage } from "../../../utils/singleApi";

export default function CategoryModal({ modal, onClose, onSave, isAdmin = false }) {
  const open = !!modal?.open;
  if (!isAdmin) return null; // ✅ guard
  if (!open) return null;

  const mode = modal?.mode || "create";
  const data = modal?.data || {};
  const dataId = modal?.data?.id ?? null;

  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (!open) return;

    setName(data?.name ?? "");
    setImageUrl(data?.image_url ?? "");
    setIsActive(data?.is_active !== false);

    setLoading(false);
    setErrMsg("");
  }, [open, mode, dataId]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setErrMsg("");
      setLoading(true);
      const url = await uploadImage(file);
      setImageUrl(url);
    } catch (err) {
      console.error("Image upload failed", err);
      setErrMsg("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submit = () => {
    if (loading) return;

    const payload = {
      name: name.trim(),
      image_url: imageUrl?.trim() || null,
      is_active: !!isActive,
    };

    if (!payload.name) return;
    onSave(payload);
  };

  return (
    <div className="pg2-modalBackdrop" onClick={onClose}>
      <div className="pg2-modalCard" onClick={(e) => e.stopPropagation()}>
        <div className="pg2-modalHead">
          <div className="pg2-modalTitle">
            {mode === "create" ? "Add category" : "Edit category"}
          </div>
          <button className="pg2-modalX" onClick={onClose} type="button">✕</button>
        </div>

        <div className="pg2-modalBody">
          <label className="pg2-modalLabel">Name</label>
          <input
            className="pg2-modalInput"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            autoFocus
          />

          <label className="pg2-modalLabel">Category image</label>
          <input
            className="pg2-modalInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
          />

          {loading && (
            <small style={{ color: "#7a7a7a", fontWeight: 700 }}>
              Uploading image...
            </small>
          )}

          {errMsg && (
            <small style={{ color: "#c22303", fontWeight: 800 }}>
              {errMsg}
            </small>
          )}

          {imageUrl && (
            <img
              src={imageUrl}
              alt="preview"
              style={{
                width: "100%",
                maxWidth: 260,
                height: 160,
                objectFit: "cover",
                borderRadius: 12,
                border: "1px solid #eee4dc",
                marginTop: 8,
              }}
            />
          )}

          <label className="pg2-modalCheck">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active
          </label>
        </div>

        <div className="pg2-modalActions">
          <button className="pg2-modalBtn ghost" onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className="pg2-modalBtn primary"
            onClick={submit}
            type="button"
            disabled={loading}
            style={loading ? { opacity: 0.7, cursor: "not-allowed" } : undefined}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
