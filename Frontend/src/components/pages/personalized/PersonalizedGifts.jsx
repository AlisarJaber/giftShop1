import { useMemo, useState } from "react";
import "./personalized.css";

const PRODUCT_TYPES = [
  { id: "mugs", label: "Mugs", emoji: "☕" },
  { id: "tshirts", label: "T-Shirts", emoji: "👕" },
  { id: "bags", label: "Bags", emoji: "👜" },
  { id: "candles", label: "Candles", emoji: "🕯️" },
];

const OPTIONS = [
  { id: "image", title: "Image", desc: "Upload a photo" , icon: "🖼️" },
  { id: "text", title: "Text", desc: "Add a custom message", icon: "T" },
  { id: "color", title: "Color", desc: "Choose your colors", icon: "🎨" },
  { id: "frame", title: "Frame", desc: "Pick a frame style", icon: "▢" },
];

export default function PersonalizedGifts() {
  const [selectedType, setSelectedType] = useState(PRODUCT_TYPES[0].id);
  const [selectedOptions, setSelectedOptions] = useState(new Set());
  const [fileName, setFileName] = useState("");

  const toggleOption = (id) => {
    setSelectedOptions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedTypeLabel = useMemo(
    () => PRODUCT_TYPES.find((t) => t.id === selectedType)?.label,
    [selectedType]
  );

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    setFileName(f ? f.name : "");
  };

  const handleSubmit = () => {
    // כאן בהמשך תשלחי לשרת / תנווטי לעמוד הבא
    alert(
      `Type: ${selectedTypeLabel}\nOptions: ${[...selectedOptions].join(", ") || "None"}\nFile: ${fileName || "No file"}`
    );
  };

  return (
    <div className="pg-page">
      <div className="pg-container">
        <div className="pg-top">
          <span className="pg-badge">Personalized Gifts</span>
          <h1 className="pg-title">Personalize Your Gift</h1>
          <p className="pg-subtitle">
            Choose a product type and customization options, then upload your files.
          </p>
        </div>

        {/* Step 1 */}
        <section className="pg-card">
          <div className="pg-card-head">
            <div className="pg-card-title">Choose a Product Type</div>
            <div className="pg-step">1</div>
          </div>

          <div className="pg-grid">
            {PRODUCT_TYPES.map((t) => (
              <button
                key={t.id}
                className={`pg-tile ${selectedType === t.id ? "is-active" : ""}`}
                onClick={() => setSelectedType(t.id)}
                type="button"
              >
                <div className="pg-tile-icon">{t.emoji}</div>
                <div className="pg-tile-label">{t.label}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Step 2 */}
        <section className="pg-card">
          <div className="pg-card-head">
            <div className="pg-card-title">Choose Customization Options</div>
            <div className="pg-step">2</div>
          </div>

          <div className="pg-grid options">
            {OPTIONS.map((op) => (
              <button
                key={op.id}
                className={`pg-tile ${selectedOptions.has(op.id) ? "is-active" : ""}`}
                onClick={() => toggleOption(op.id)}
                type="button"
              >
                <div className="pg-option-icon">{op.icon}</div>
                <div className="pg-tile-label">{op.title}</div>
                <div className="pg-tile-desc">{op.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Step 3 */}
        <section className="pg-card">
          <div className="pg-card-head">
            <div className="pg-card-title">Add Files</div>
            <div className="pg-step">3</div>
          </div>

          <label className="pg-drop">
            <input
              className="pg-file"
              type="file"
              accept="image/*"
              onChange={handleFile}
            />
            <div className="pg-drop-icon">⬆️</div>
            <div className="pg-drop-text">
              Drag & drop a file here or <span>browse</span>
            </div>
            <div className="pg-drop-hint">PNG, JPG up to 5MB</div>
            {fileName ? <div className="pg-file-name">Selected: {fileName}</div> : null}
          </label>
        </section>

        <button className="pg-submit" onClick={handleSubmit} type="button">
          Submit Custom Request
        </button>

        <div className="pg-footer-note">
          We’ll review your request and get back to you within 24 hours.
        </div>
      </div>
    </div>
  );
}
