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

  return (
    <div className="pg2-products">
      {products.map((p) => {
        const picked = (selections[activeCat?.id] || []).some(
          (x) => x.id === p.id
        );
        const handleToggle = () => onToggle?.(p);

        return (
          <div
            key={p.id}
            className={`pg2-product ${picked ? "is-picked" : ""}`}
          >
            {/* אזור הקליק של הכרטיס בלבד (לא כולל כפתורי Admin) */}
            <div
              className="pg2-product-clickarea"
              role="button"
              tabIndex={0}
              onClick={handleToggle}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleToggle();
                }
              }}
            >
              <img src={p.image_url} alt={p.name} />
              <div>{p.name}</div>
              <div>₪{p.price}</div>
            </div>

            {isAdmin && (
              <div className="pg2-admin-actions product">
                <button
                  type="button"
                  aria-label="Edit product"
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(p.id);
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
