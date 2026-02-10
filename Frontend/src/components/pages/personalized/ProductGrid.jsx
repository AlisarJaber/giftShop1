import toast from "react-hot-toast";

export default function ProductGrid({
  products,
  loading,
  activeCat,
  selections,
  onToggle,
  onEdit,
  onDelete,
  isAdmin = false,
}) {
  if (loading) return <div>Loading...</div>;

  const confirmDelete = (productId) => {
    toast.custom((t) => (
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 14,
          boxShadow: "0 10px 30px rgba(0,0,0,.12)",
          border: "1px solid rgba(0,0,0,.06)",
          width: 320,
        }}
        onClick={(ev) => ev.stopPropagation()}
      >
        <div style={{ fontWeight: 800, marginBottom: 6 }}>Delete product?</div>
        <div style={{ opacity: 0.75, fontSize: 14, marginBottom: 12 }}>
          This action can’t be undone.
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            type="button"
            className="p-adminBtn"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>

          <button
            type="button"
            className="p-adminBtn danger"
            onClick={() => {
              toast.dismiss(t.id);
              onDelete?.(productId);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="pg2-products">
      {products.map((p) => {
        const qty = Number(p.quantity ?? 0);
        const isOut = qty <= 0;

        // ✅ אם נגמר המלאי – שלא יישאר "נבחר"
        const picked =
          !isOut &&
          (selections[activeCat?.id] || []).some((x) => x.id === p.id);

        const handleToggle = () => {
          if (isOut) return; // ✅ חסימה מלאה להוספה/בחירה
          onToggle?.(p);
        };

        return (
          <div
            key={p.id}
            className={`pg2-product ${picked ? "is-picked" : ""} ${
              isOut ? "is-out" : ""
            }`}
          >
            {/* אזור הקליק של הכרטיס בלבד (לא כולל כפתורי Admin) */}
            <div
              className="pg2-product-clickarea"
              role="button"
              tabIndex={isOut ? -1 : 0} // ✅ לא פוקוס אם אין מלאי
              onClick={handleToggle}
              onKeyDown={(e) => {
                if (isOut) return; // ✅ גם מקלדת חסומה
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleToggle();
                }
              }}
              aria-disabled={isOut ? "true" : "false"}
            >
              <img src={p.image_url} alt={p.name} />
              <div>{p.name}</div>

              {/* stock line (כמו שכבר הוספת) */}
              <div className={`pg2-stock ${isOut ? "out" : ""}`}>
                {isOut ? "Out of stock" : `In stock: ${qty}`}
              </div>

              <div>₪{p.price}</div>
            </div>

            {isAdmin && (
              <div className="pg2-admin-actions product">
                <button
                  type="button"
                  aria-label="Edit product"
                  title="Edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(p);
                  }}
                >
                  ✏️
                </button>

                <button
                  type="button"
                  aria-label="Delete product"
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDelete(p.id);
                  }}
                >
                  🗑
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}