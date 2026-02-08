import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProductById,
  deleteProduct,
  getFavoriteIds,
  toggleFavorite,
} from "../../../utils/productsApi";
import toast from "react-hot-toast";
import { getErrorText } from "../../../utils/toastText";

export default function ProductCard({
  product,
  isAdmin = false,
  onDeleted,
  onEdit,
}) {
  const navigate = useNavigate();
  const { id, name, price, image_url, badge, quantity } = product;

  const qtyNum =
    quantity === null || quantity === undefined ? null : Number(quantity);
  const hasQty = Number.isFinite(qtyNum);

  const [fav, setFav] = useState(false);

  useEffect(() => {
    getFavoriteIds()
      .then((ids) => setFav(Array.isArray(ids) && ids.includes(id)))
      .catch(() => {});
  }, [id]);

  const goDetails = () => {
    navigate(`/products/${id}`);
  };

  const toggleFav = async (e) => {
    e.stopPropagation();
    try {
      const res = await toggleFavorite(id);
      const next = !!res.favorite;
      setFav(next);
      toast.success(next ? "Added to favorites" : "Removed from favorites");
    } catch (e2) {
      toast.error(getErrorText(e2, "Could not update favorites"));
    }
  };

  // ✅ DELETE עם confirm מעוצב (בלי alert)
  const handleDelete = (e) => {
    e.stopPropagation();

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
          Delete product?
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
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await deleteProduct(id);
                onDeleted?.(id);
                toast.success("Product deleted successfully");
              } catch (e2) {
                toast.error(getErrorText(e2, "Delete failed"));
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  const handleEdit = async (e) => {
    e.stopPropagation();
    try {
      const data = await getProductById(id);
      onEdit?.(data);
    } catch (e2) {
      toast.error(getErrorText(e2, "Failed to load product"));
    }
  };

  return (
    <div
      className="p-card"
      role="button"
      tabIndex={0}
      onClick={goDetails}
      onKeyDown={(e) => e.key === "Enter" && goDetails()}
      style={{ cursor: "pointer" }}
    >
      <button
        className={`p-heart ${fav ? "active" : ""}`}
        type="button"
        aria-label="favorite"
        onClick={toggleFav}
        title="Favorite"
      >
        {fav ? "♥" : "♡"}
      </button>

      {badge ? <div className="p-badge">{badge}</div> : null}

      <div className="p-imgBox">
        <img
          className="p-img"
          src={image_url || "https://placehold.co/800x600?text=Gift"}
          alt={name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://placehold.co/800x600?text=Gift";
          }}
        />
      </div>

      <div className="p-info">
        <div className="p-name" title={name}>
          {name}
        </div>

        {hasQty && (
          <div className={`p-stock ${qtyNum === 0 ? "out" : "in"}`}>
            {qtyNum === 0 ? "Out of stock" : `In stock: ${qtyNum}`}
          </div>
        )}

        <div className="p-bottom">
          <div className="p-price">₪{price}</div>

          <button
            className="p-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goDetails();
            }}
          >
            View
          </button>
        </div>

        {isAdmin && (
          <div className="p-admin">
            <button className="p-adminBtn" type="button" onClick={handleEdit}>
              Edit
            </button>
            <button
              className="p-adminBtn danger"
              type="button"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}