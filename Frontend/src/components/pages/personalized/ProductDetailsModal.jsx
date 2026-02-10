import "./personalized.css";

export default function ProductDetailsModal({
  open,
  product,
  picked = false,
  onClose,
  onTogglePick,
}) {
  if (!open || !product) return null;

  const qty = Number(product.quantity ?? 0);
  const isOut = qty <= 0;

  return (
    <div
      className="pg2-modalOverlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="pg2-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="pg2-modalHead">
          <h3 className="pg2-modalTitle">{product.name}</h3>
          <button className="pg2-modalX" type="button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="pg2-modalBody">
          <div className="pg2-detailsGrid">
            <img className="pg2-detailsImg" src={product.image_url} alt={product.name} />

            <div className="pg2-detailsInfo">
              <div className="pg2-detailsPrice">₪{product.price}</div>

              <div className={`pg2-stock ${isOut ? "out" : ""}`}>
                {isOut ? "Out of stock" : `In stock: ${qty}`}
              </div>

              <div className="pg2-detailsDesc">
                <div className="pg2-detailsDescTitle">Description</div>
                <div className="pg2-detailsDescText">
                  {product.description?.trim()
                    ? product.description
                    : "No description provided."}
                </div>
              </div>

              <div className="pg2-detailsActions">
                <button type="button" className="pg2-adminBtn" onClick={onClose}>
                  Close
                </button>

                <button
                  type="button"
                  className={`pg2-adminBtn ${picked ? "danger" : ""}`}
                  onClick={onTogglePick}
                  disabled={isOut}
                  title={isOut ? "Out of stock" : ""}
                >
                  {picked ? "Unselect" : "Select"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
