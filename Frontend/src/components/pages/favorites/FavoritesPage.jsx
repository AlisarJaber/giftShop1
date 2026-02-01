import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFavoriteIds, getProducts } from "../../../utils/productsApi";
import ProductCard from "../Products/ProductCard";
import "./favorites.css";

export default function FavoritesPage() {
  const navigate = useNavigate();

  const [favIds, setFavIds] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const [ids, prods] = await Promise.all([getFavoriteIds(), getProducts()]);
        setFavIds(Array.isArray(ids) ? ids : []);
        setProducts(Array.isArray(prods) ? prods : []);
      } catch (e) {
        alert(e?.response?.data?.detail || "Failed to load favorites");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const favoriteProducts = useMemo(() => {
    const setIds = new Set((favIds || []).map(Number));
    return (products || []).filter((p) => setIds.has(Number(p.id)));
  }, [favIds, products]);

  const refreshAfterToggle = async () => {
    try {
      const ids = await getFavoriteIds();
      setFavIds(Array.isArray(ids) ? ids : []);
    } catch {}
  };

  if (loading) {
    return <div className="fav-wrap"><div className="fav-box">Loading favorites...</div></div>;
  }

  return (
    <div className="fav-wrap">
      <div className="fav-head">
        <div>
          <h1 className="fav-title">Your Favorites</h1>
          <p className="fav-sub">All the items you liked in one place</p>
        </div>

        <button className="fav-back" type="button" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="fav-box">
          No favorites yet ❤️ <br />
          Go to Products and click the heart on items you like.
        </div>
      ) : (
        <div className="fav-grid">
          {favoriteProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              isAdmin={false}
              onDeleted={null}
              onEdit={null}
            />
          ))}
        </div>
      )}

      <div style={{ display: "none" }}>
        <button type="button" onClick={refreshAfterToggle}>refresh</button>
      </div>
    </div>
  );
}
