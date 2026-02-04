import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProductById,
  deleteProduct,
  updateProduct,
} from "../../../utils/productsApi";
import "./productDetails.css";
import { addToCart } from "../../../utils/cartApi.js";
import toast from "react-hot-toast";
import { getErrorText } from "../../../utils/toastText";
import BackButton from "../../ui/BackButton";
import AdminProductModal from "./AdminProductModal";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editInitial, setEditInitial] = useState(null);

  const isAdmin = useMemo(() => {
    try {
      return !!JSON.parse(localStorage.getItem("user") || "null")?.is_admin;
    } catch {
      return false;
    }
  }, []);

  const reload = async () => {
    const p = await getProductById(id);
    setProduct(p);
    return p;
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

  const handleAdminEdit = async () => {
    if (!isAdmin) return;
    try {
      const fresh = await reload();
      setEditInitial(fresh);
      setEditOpen(true);
    } catch (e) {
      toast.error(getErrorText(e, "Failed to load product for edit"));
    }
  };

  const submitEdit = async (payload) => {
    if (!isAdmin || !product?.id) return;

    try {
      const updated = await updateProduct(product.id, payload);
      setProduct(updated); 
      setEditOpen(false);
      setEditInitial(null);
      toast.success("Product updated");
    } catch (e) {
      toast.error(getErrorText(e, "Save failed"));
    }
  };

  const handleAdminDelete = async () => {
    if (!product) return;
    const ok = confirm("Delete this product?");
    if (!ok) return;

    try {
      setDeleting(true);
      await deleteProduct(product.id);
      toast.success("Product deleted successfully");
      navigate("/products", { replace: true });
    } catch (e) {
      toast.error(getErrorText(e, "Delete failed"));
    } finally {
      setDeleting(false);
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
            {isAdmin ? (
              <>
                <button className="pd-add" type="button" onClick={handleAdminEdit}>
                  Edit
                </button>

                <button
                  className="pd-ghost"
                  type="button"
                  onClick={handleAdminDelete}
                  disabled={deleting}
                  style={{
                    opacity: deleting ? 0.7 : 1,
                    cursor: deleting ? "not-allowed" : "pointer",
                    borderColor: "rgba(194,35,3,.35)",
                    color: "#c22303",
                    fontWeight: 900,
                  }}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      <AdminProductModal
        open={editOpen}
        initial={editInitial}
        onClose={() => {
          setEditOpen(false);
          setEditInitial(null);
        }}
        onSubmit={submitEdit}
      />
    </div>
  );
}
