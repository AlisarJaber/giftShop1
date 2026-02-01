import { useEffect, useMemo, useState } from "react";
import {
  getCart,
  updateCartItemQuantity,
  deleteCartItem,
  checkoutCart,
} from "../../../utils/cartApi";
import { getProductById } from "../../../utils/productsApi";
import { useNavigate } from "react-router-dom";
import "./cart.css";

const CartPage = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);

  const total = useMemo(() => {
    const t = items.reduce((sum, it) => {
      const price = Number(it.product?.price ?? 0);
      return sum + price * Number(it.quantity ?? 0);
    }, 0);
    return t;
  }, [items]);

  const totalItems = useMemo(() => {
    return items.reduce((s, it) => s + Number(it.quantity ?? 0), 0);
  }, [items]);

  const loadCart = async () => {
    const cartRows = await getCart();

    if (!cartRows || cartRows.length === 0) {
      setItems([]);
      return;
    }

    const merged = await Promise.all(
      cartRows.map(async (row) => {
        const product = await getProductById(row.product_id);
        return { product, quantity: row.quantity };
      })
    );

    setItems(merged);
  };

  const handlePlus = async (productId, currentQty) => {
    try {
      setError("");

      const item = items.find((x) => x.product?.id === productId);
      const stock = Number(item?.product?.quantity ?? 0);

      if (currentQty + 1 > stock) {
        setError(`Not enough stock. Only ${stock} left.`);
        return;
      }

      await updateCartItemQuantity(productId, currentQty + 1);
      await loadCart();
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "Failed to update quantity";
      setError(msg);
    }
  };

  const handleMinus = async (productId, currentQty) => {
    try {
      setError("");
      const nextQty = currentQty - 1;

      await updateCartItemQuantity(productId, Math.max(nextQty, 0));
      await loadCart();
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "Failed to update quantity";
      setError(msg);
    }
  };

  const handleDelete = async (productId) => {
    try {
      setError("");
      await deleteCartItem(productId);
      await loadCart();
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "Failed to delete item";
      setError(msg);
    }
  };

  const handleCheckout = async () => {
    try {
      setError("");
      setCheckingOut(true);

      await checkoutCart();
      await loadCart();
      alert("Order completed! 🎉");
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "Checkout failed";
      setError(msg);
    } finally {
      setCheckingOut(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");
        await loadCart();
      } catch (e) {
        setError("Failed to load cart");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading cart...</div>;

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h2 className="cart-title">Your Shopping Cart</h2>
          <p className="cart-subtitle">Review your items before checkout</p>
        </div>

        {error ? (
          <div className="cart-error">{error}</div>
        ) : null}

        {items.length === 0 ? (
          <div className="cart-empty">
            Your cart is empty 🛒
            <div style={{ marginTop: 12 }}>
              <button className="cart-continue-btn" onClick={() => navigate("/products")}>
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="cart-content">
            <aside className="cart-summary-card">
              <div className="cart-summary-title">Order Summary</div>

              <div className="cart-summary-row">
                <span>Total Items</span>
                <span>{totalItems}</span>
              </div>

              <div className="cart-summary-row">
                <span>Total Price</span>
                <span className="cart-summary-total">₪{total.toFixed(2)}</span>
              </div>

              <button
                className="cart-checkout-btn"
                onClick={handleCheckout}
                disabled={checkingOut}
                style={{ opacity: checkingOut ? 0.7 : 1 }}
              >
                {checkingOut ? "Processing..." : "Proceed to Checkout"}
              </button>

              <button
                className="cart-continue-btn"
                onClick={() => navigate("/products")}
                type="button"
              >
                Continue Shopping
              </button>

              <div className="cart-summary-note">
                Secure payment • Customer support available
              </div>
            </aside>

            <section className="cart-items">
              <div className="cart-items-toprow">
                <div className="cart-items-count">{items.length} items in cart</div>
              </div>

              <div className="cart-list">
                {items.map((it) => {
                  const stock = Number(it.product?.quantity ?? 0);
                  const atMax = Number(it.quantity) >= stock;

                  return (
                    <div key={it.product?.id} className="cart-item">
                      <div className="cart-item-main">
                        <div className="cart-item-line1">
                          <div className="cart-item-name">{it.product?.name}</div>

                          <button
                            className="cart-delete-icon"
                            onClick={() => handleDelete(it.product.id)}
                            title="Remove item"
                            type="button"
                          >
                            🗑
                          </button>
                        </div>

                        <div className="cart-item-prices">
                          <span className="cart-item-unit">
                            ₪{it.product?.price} per item
                          </span>
                          <span className="cart-item-total">
                            ₪{(Number(it.product?.price ?? 0) * Number(it.quantity)).toFixed(2)}
                          </span>
                        </div>

                        <div className="cart-stock-line">
                          In stock: <b>{stock}</b>
                          {stock === 0 ? (
                            <span className="cart-out"> • Out of stock</span>
                          ) : null}
                        </div>

                        <div className="cart-qty-pill" dir="ltr">
                          <button
                            className="cart-qty-pill-btn"
                            onClick={() => handleMinus(it.product.id, it.quantity)}
                            type="button"
                          >
                            −
                          </button>

                          <span className="cart-qty-pill-value">{it.quantity}</span>

                          <button
                            className="cart-qty-pill-btn"
                            onClick={() => handlePlus(it.product.id, it.quantity)}
                            disabled={stock === 0 || atMax}
                            title={atMax ? "Reached max stock" : "Increase"}
                            type="button"
                            style={{
                              opacity: stock === 0 || atMax ? 0.45 : 1,
                              cursor: stock === 0 || atMax ? "not-allowed" : "pointer",
                            }}
                          >
                            +
                          </button>
                        </div>

                        {atMax && stock > 0 ? (
                          <div className="cart-max-note">Max reached (stock: {stock})</div>
                        ) : null}
                      </div>
                      <img
                        src={
                          it.product?.image_url ||
                          it.product?.image ||
                          "https://via.placeholder.com/90"
                        }
                        alt={it.product?.name || "product"}
                        className="cart-item-image"
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
