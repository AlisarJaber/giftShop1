import { useEffect, useState } from "react";
import { uploadImage } from "../../../utils/singleApi";

export default function CategoryModal({ modal, onClose, onSave, isAdmin = false }) {
  const open = !!modal?.open;
  if (!isAdmin) return null;
  if (!open) return null;

  const mode = modal?.mode || "create";
  const data = modal?.data || {};
  const dataId = modal?.data?.id ?? null;

  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Upload UI states
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (!open) return;

    setName(data?.name ?? "");
    setImageUrl(data?.image_url ?? "");
    setIsActive(data?.is_active !== false);

    setLoading(false);
    setErrMsg("");
    setFileName("");
  }, [open, mode, dataId]);

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
      setLoading(true);
      setFileName(file.name);

      const url = await uploadImage(file);
      setImageUrl(url);
    } catch (err) {
      console.error("Image upload failed", err);
      setErrMsg("Upload failed. Please try again.");
      setFileName("");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  };

  const submit = () => {
    if (loading) return;

    const payload = {
      name: name.trim(),
      image_url: imageUrl?.trim() || null,
      is_active: !!isActive,
    };

    if (!payload.name) {
      setErrMsg("Name is required");
      return;
    }

    onSave?.(payload);
  };

  return (
    <div className="pg2-modalBackdrop" onClick={onClose}>
      <div className="pg2-modalCard" onClick={(e) => e.stopPropagation()}>
        <div className="pg2-modalHead">
          <div className="pg2-modalTitle">
            {mode === "create" ? "Add category" : "Edit category"}
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
            placeholder="Category name"
            autoFocus
          />

          <label className="pg2-modalLabel">Category image</label>

          {/* ✅ אותו UI כמו AdminProductModal */}
          <div className="file-row">
            <input
              id="category-image-file"
              className="file-input-hidden"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
            />

            <label
              htmlFor="category-image-file"
              className={`file-btn ${loading ? "is-disabled" : ""}`}
            >
              {loading ? "Uploading..." : "Upload image"}
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
                disabled={loading}
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
