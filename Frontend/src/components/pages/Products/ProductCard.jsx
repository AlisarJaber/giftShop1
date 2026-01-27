import { useEffect, useState } from "react";
import {getProductById, deleteProduct, getFavoriteIds,toggleFavorite,}from "../../../../utils/productsApi";

export default function ProductCard({
  product,
  isAdmin = false,
  onDeleted,
  onEdit,
}) {
  const { id, name, price, image_url, badge } = product;

  const [fav, setFav] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    getFavoriteIds()
      .then((ids) => setFav(Array.isArray(ids) && ids.includes(id)))
      .catch(() => {});
  }, [id]);

  const toggleFav = async () => {
    try {
      const res = await toggleFavorite(id); // { favorite: true/false }
      setFav(!!res.favorite);
    } catch (e) {
      alert(e?.response?.data?.detail || "Favorite failed");
    }
  };

  const toggleDetails = async () => {
    const nextShow = !showDetails;
    setShowDetails(nextShow);

    if (nextShow && !details) {
      setLoadingDetails(true);
      try {
        const data = await getProductById(id);
        setDetails(data);
      } catch (e) {
        alert(e?.response?.data?.detail || "Failed loading details");
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      onDeleted?.(id);
    } catch (e) {
      alert(e?.response?.data?.detail || "Delete failed");
    }
  };

  const handleEdit = async () => {
    try {
      const data = await getProductById(id); // כולל description+quantity
      onEdit?.(data);
    } catch (e) {
      alert(e?.response?.data?.detail || "Failed loading product");
    }
  };

  return (
    <div className="p-card">
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

        <div className="p-bottom">
          <div className="p-price">₪{price}</div>
          <button className="p-btn" type="button" onClick={toggleDetails}>
            {showDetails ? "hide" : "for details"}
          </button>
        </div>

        {showDetails && (
          <div className="p-desc">
            {loadingDetails
              ? "Loading..."
              : details?.description || "No description yet."}
          </div>
        )}

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
