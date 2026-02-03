const FALLBACK =
  "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=1200&q=60";

export default function CategoryGrid({
  categories,
  activeCat,
  selections,
  onSelect,
  onEdit,
  onDelete,
  isAdmin = false,
}) {
  return (
    <div className="pg2-cats">
      {categories.map((c) => {
        const isActive = activeCat?.id === c.id;

        const handleSelect = () => onSelect(c);

        return (
          <div
            key={c.id}
            className={`pg2-cat ${isActive ? "is-active" : ""}`}
            role="button"
            tabIndex={0}
            onClick={handleSelect}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelect();
              }
            }}
            style={{ backgroundImage: `url(${c.image_url || FALLBACK})` }}
          >
            <div className="pg2-cat-name">{c.name}</div>
            <div className="pg2-cat-count">{(selections[c.id] || []).length}</div>

            {isAdmin && (
              <div className="pg2-admin-actions">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(c);
                  }}
                >
                  ✏️
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(c.id);
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
