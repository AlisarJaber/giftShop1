import toast from "react-hot-toast";

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
  const confirmDelete = (catId) => {
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
        <div style={{ fontWeight: 800, marginBottom: 6 }}>
          Delete category?
        </div>
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
              onDelete?.(catId);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

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
                  title="Edit"
                >
                  ✏️
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDelete(c.id);
                  }}
                  title="Delete"
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