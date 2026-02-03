import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProductById,
  deleteProduct,
  getFavoriteIds,
  toggleFavorite,
} from "../../../utils/productsApi";
import toast from "react-hot-toast"; // ✅ הוספה
import { getErrorText } from "../../../utils/toastText"; // ✅ הוספה

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
      setFav(!!res.favorite);
      const next = !!res.favorite;
      setFav(next);

      // ✅ הודעה קטנה רק כשיש שינוי (לא חובה אבל נחמד)
      toast.success(next ? "Added to favorites" : "Removed from favorites");
    } catch (e2) {
      toast.error(getErrorText(e2, "Could not update favorites"));
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm("Delete this product?")) return;

    try {
      await deleteProduct(id);
      onDeleted?.(id);
      toast.success("Product deleted successfully");
    } catch (e2) {
      toast.error(getErrorText(e2, "Delete failed"));
    }
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
          src={image_url || "https://via.placeholder.com/800x600?text=Gift"}
          alt={name}
          loading="lazy"
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
