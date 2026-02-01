import { useEffect, useMemo, useState } from "react";
import { getCart, updateCartItemQuantity, deleteCartItem } from "../../../utils/cartApi";
import { getProductById } from "../../../utils/productsApi";
import "./cart.css";

const CartPage = () => {
  const [items, setItems] = useState([]); // [{product, quantity}]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const total = useMemo(() => {
    return items.reduce((sum, it) => {
      const price = Number(it.product?.price ?? 0);
      return sum + price * it.quantity;
    }, 0);
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
      await updateCartItemQuantity(productId, currentQty + 1);
      await loadCart();
    } catch (e) {
      setError("Failed to update quantity");
    }
  };

  const handleMinus = async (productId, currentQty) => {
    try {
      const nextQty = currentQty - 1;
      // אם יורד ל-0, זה ימחק אצלך בבאקנד (כי PATCH עם quantity=0 מוחק)
      await updateCartItemQuantity(productId, Math.max(nextQty, 0));
      await loadCart();
    } catch (e) {
      setError("Failed to update quantity");
    }
  };

  const handleDelete = async (productId) => {
    try {
      await deleteCartItem(productId);
      await loadCart();
    } catch (e) {
      setError("Failed to delete item");
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
  if (error) return <div style={{ padding: 20 }}>{error}</div>;

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h2 className="cart-title">Your Shopping Cart</h2>
          <p className="cart-subtitle">Review your items before checkout</p>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">Your cart is empty 🛒</div>
        ) : (
          <div className="cart-content">
            {/* LEFT: Order Summary */}
            <aside className="cart-summary-card">
              <div className="cart-summary-title">Order Summary</div>

              <div className="cart-summary-row">
                <span>Total Items</span>
                <span>{items.reduce((s, it) => s + it.quantity, 0)}</span>
              </div>

              <div className="cart-summary-row">
                <span>Total Price</span>
                <span className="cart-summary-total">₪{total}</span>
              </div>

              <button className="cart-checkout-btn">Proceed to Checkout</button>
              <button className="cart-continue-btn">Continue Shopping</button>

              <div className="cart-summary-note">
                Secure payment • Customer support available
              </div>
            </aside>

            {/* RIGHT: Cart Items */}
            <section className="cart-items">
              <div className="cart-items-toprow">
                <div className="cart-items-count">
                  {items.length} items in cart
                </div>
              </div>

              <div className="cart-list">
                {items.map((it) => (
                  <div key={it.product?.id} className="cart-item">
                    {/* Details */}
                    <div className="cart-item-main">
                      <div className="cart-item-line1">
                        <div className="cart-item-name">
                          {it.product?.name}
                        </div>

                        <button
                          className="cart-delete-icon"
                          onClick={() => handleDelete(it.product.id)}
                          title="Remove item"
                        >
                          🗑
                        </button>
                      </div>

                      <div className="cart-item-prices">
                        <span className="cart-item-unit">
                          ₪{it.product?.price} per item
                        </span>
                        <span className="cart-item-total">
                          ₪{Number(it.product?.price ?? 0) * it.quantity}
                        </span>
                      </div>

                      <div className="cart-qty-pill" dir="ltr">
                        <button
                          className="cart-qty-pill-btn"
                          onClick={() =>
                            handleMinus(it.product.id, it.quantity)
                          }
                        >
                          −
                        </button>

                        <span className="cart-qty-pill-value">
                          {it.quantity}
                        </span>

                        <button
                          className="cart-qty-pill-btn"
                          onClick={() =>
                            handlePlus(it.product.id, it.quantity)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Image */}
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
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );

}

export default CartPage