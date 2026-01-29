import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById } from "../../../utils/productsApi";
import "./productDetails.css";
import { addToCart } from "../../../utils/cartApi.js";


export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null")?.is_admin; }
    catch { return false; }
  }, []);

  useEffect(() => {
    setLoading(true);
    getProductById(id)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [id]);

  const addToCartHandler = async () => {
    try {
      await addToCart(product.id, 1);
      alert("Added to cart!");
    } catch (error) {
      alert("Failed to add to cart");
    }
  };


  if (loading) return <div className="pd-wrap">Loading...</div>;
  if (!product) return <div className="pd-wrap">Product not found</div>;

  return (
    <div className="pd-wrap">
      <button className="pd-back" onClick={() => navigate(-1)}>← Back</button>

      <div className="pd-card">
        <div className="pd-imgBox">
          <img
            src={product.image_url || "https://via.placeholder.com/900x700?text=Gift"}
            alt={product.name}
          />
        </div>

        <div className="pd-info">
          <div className="pd-top">
            <h1 className="pd-title">{product.name}</h1>
            {product.badge ? <span className="pd-badge">{product.badge}</span> : null}
          </div>

          <div className="pd-price">₪{product.price}</div>
          <div className="pd-qty">In stock: {product.quantity}</div>

          <div className="pd-descTitle">Description</div>
          <div className="pd-desc">{product.description || "No description yet."}</div>

          <div className="pd-actions">
            <button className="pd-add" onClick={addToCartHandler}>Add to cart</button>
            <button className="pd-ghost" onClick={() => navigate("/products")}>Continue shopping</button>
          </div>
        </div>
      </div>
    </div>
  );
}
