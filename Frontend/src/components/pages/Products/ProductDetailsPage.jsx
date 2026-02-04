import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById } from "../../../utils/productsApi";
import "./productDetails.css";
import { addToCart } from "../../../utils/cartApi.js";
import toast from "react-hot-toast"; // ✅ הוספה
import { getErrorText } from "../../../utils/toastText"; // ✅ הוספה
import BackButton from "../../ui/BackButton";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const isAdmin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null")?.is_admin;
    } catch {
      return false;
    }
  }, []);

  const reload = async () => {
    const p = await getProductById(id);
    setProduct(p);
  };

  useEffect(() => {
    setLoading(true);
    getProductById(id)
      .then(setProduct)
      .catch((err) => {
        toast.error(getErrorText(err, "Failed to load product"));
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const addToCartHandler = async () => {
    if (!product) return;
    if (Number(product.quantity) <= 0) return;

    try {
      setAdding(true);
      await addToCart(product.id, 1);

      toast.success("Item added to your cart");

      await reload();
    } catch (error) {
      toast.error(getErrorText(error, "Failed to add item to cart"));
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="pd-wrap">Loading...</div>;
  if (!product) return <div className="pd-wrap">Product not found</div>;

  const qty = Number(product.quantity || 0);
  const outOfStock = qty <= 0;
  const lowStock = qty > 0 && qty <= 5;

  return (
    <div className="pd-wrap">
      <BackButton />
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

          <div className="pd-qty">
            In stock: <b>{qty}</b>{" "}
            {outOfStock ? (
              <span style={{ marginLeft: 10, color: "#c22303", fontWeight: 800 }}>
                Out of stock
              </span>
            ) : lowStock ? (
              <span style={{ marginLeft: 10, color: "#c22303", fontWeight: 800 }}>
                Only {qty} left
              </span>
            ) : null}
          </div>

          <div className="pd-descTitle">Description</div>
          <div className="pd-desc">{product.description || "No description yet."}</div>

          <div className="pd-actions">
            <button
              className="pd-add"
              onClick={addToCartHandler}
              disabled={outOfStock || adding}
              style={{
                opacity: outOfStock ? 0.55 : 1,
                cursor: outOfStock ? "not-allowed" : "pointer",
              }}
            >
              {outOfStock ? "Out of stock" : adding ? "Adding..." : "Add to cart"}
            </button>

            <button className="pd-ghost" onClick={() => navigate("/products")}>
              Continue shopping
            </button>
          </div>

          {isAdmin ? (
            <div style={{ marginTop: 14, fontSize: 13, opacity: 0.8 }}></div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
