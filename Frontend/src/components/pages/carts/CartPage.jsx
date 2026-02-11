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

import toast from "react-hot-toast";
import { getErrorText } from "../../../utils/toastText";
import BackButton from "../../ui/BackButton";

const FALLBACK_BOX_IMAGE =
  "http://localhost:8000/static/images/custom_gift_box.png";

const CartPage = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);

  // ✅ מחיר מארז – אם boxItems הם אובייקטים עם price
  const getBoxFallbackPrice = (boxItems) => {
    if (!Array.isArray(boxItems)) return 0;
    // אם זה array של strings אין price -> מחיר 0 (נשתמש ב-boxPrice מהשרת)
    return boxItems.reduce((sum, p) => sum + Number(p?.price ?? 0), 0);
  };

  const getUnitPrice = (it) => {
    if (it?.isBox) {
      const serverPrice = Number(it?.boxPrice ?? 0);
      if (serverPrice > 0) return serverPrice;
      return getBoxFallbackPrice(it?.boxItems);
    }
    return Number(it?.product?.price ?? 0);
  };

  const total = useMemo(() => {
    return items.reduce((sum, it) => {
      const unit = getUnitPrice(it);
      const qty = Number(it.quantity ?? 0);
      return sum + unit * qty;
    }, 0);
  }, [items]);

  const totalItems = useMemo(() => {
    return items.reduce((s, it) => s + Number(it.quantity ?? 0), 0);
  }, [items]);

  // ✅ להפוך boxItems לכללי לתצוגה:
  // אם זה strings -> מציג אותם
  // אם זה objects -> מציג name
  const getBoxNamesString = (boxItems) => {
    if (!Array.isArray(boxItems) || boxItems.length === 0) return "";

    // strings
    if (typeof boxItems[0] === "string") {
      return boxItems.filter(Boolean).join(", ");
    }

    // objects
    return boxItems
      .map((p) => p?.name)
      .filter(Boolean)
      .join(", ");
  };

  const loadCart = async () => {
    const cartRows = await getCart();

    if (!cartRows || cartRows.length === 0) {
      setItems([]);
      return;
    }

    const merged = await Promise.all(
      cartRows.map(async (row) => {
        const product = await getProductById(row.product_id);

        const boxItems = row?.box_items ?? row?.boxItems ?? null;
        const boxPrice = row?.box_price ?? row?.boxPrice ?? null;

        // ✅ הכי בטוח: אם יש box_items/box_price - זה מארז
        const isBox =
          Boolean(row?.is_box) ||
          Boolean(row?.isBox) ||
          (Array.isArray(row?.box_items) && row.box_items.length > 0) ||
          (Array.isArray(row?.boxItems) && row.boxItems.length > 0) ||
          (row?.box_price != null && Number(row.box_price) > 0) ||
          (row?.boxPrice != null && Number(row.boxPrice) > 0);

        return {
          product,
          quantity: row.quantity,
          isBox,
          boxItems,
          boxPrice,
        };
      })
    );

    setItems(merged);
  };

  const handlePlus = async (productId, currentQty) => {
    try {
      setError("");

      const item = items.find((x) => x.product?.id === productId);

      // ✅ אם זה לא מארז – עושים בדיקת סטוק
      if (!item?.isBox) {
        const stock = Number(item?.product?.quantity ?? 0);

        if (currentQty + 1 > stock) {
          const msg = `Not enough stock. Only ${stock} left.`;
          setError(msg);
          toast.error(msg);
          return;
        }
      }

      await updateCartItemQuantity(productId, currentQty + 1);
      await loadCart();
      toast.success("Quantity updated");
    } catch (e) {
      const msg = getErrorText(e, "Failed to update quantity");
      setError(msg);
      toast.error(msg);
    }
  };

  const handleMinus = async (productId, currentQty) => {
    try {
      setError("");
      const nextQty = currentQty - 1;

      await updateCartItemQuantity(productId, Math.max(nextQty, 0));
      await loadCart();
      toast.success("Quantity updated");
    } catch (e) {
      const msg = getErrorText(e, "Failed to update quantity");
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDelete = async (productId) => {
    try {
      setError("");
      await deleteCartItem(productId);
      await loadCart();
      toast.success("Item removed from cart");
    } catch (e) {
      const msg = getErrorText(e, "Failed to delete item");
      setError(msg);
      toast.error(msg);
    }
  };

  const handleCheckout = async () => {
    try {
      setError("");
      setCheckingOut(true);

      await checkoutCart();
      await loadCart();

      toast.success("Order completed successfully");
    } catch (e) {
      const msg = getErrorText(e, "Checkout failed");
      setError(msg);
      toast.error(msg);
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
        const msg = getErrorText(e, "Failed to load cart");
        setError(msg);
        toast.error(msg);
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
        <BackButton />

        <div className="cart-header">
          <h2 className="cart-title">Your Shopping Cart</h2>
          <p className="cart-subtitle">Review your items before checkout</p>
        </div>

        {error ? <div className="cart-error">{error}</div> : null}

        {items.length === 0 ? (
          <div className="cart-empty">
            Your cart is empty 🛒
            <div style={{ marginTop: 12 }}>
              <button
                className="cart-continue-btn"
                onClick={() => navigate("/products")}
              >
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
                <div className="cart-items-count">
                  {items.length} items in cart
                </div>
              </div>

              <div className="cart-list">
                {items.map((it) => {
                  const isBox = !!it.isBox;

                  const stock = isBox ? null : Number(it.product?.quantity ?? 0);
                  const atMax = isBox ? false : Number(it.quantity) >= stock;

                  const unitPrice = getUnitPrice(it);
                  const lineTotal = (
                    unitPrice * Number(it.quantity ?? 0)
                  ).toFixed(2);

                  const boxNames = getBoxNamesString(it.boxItems);

                  const displayName = isBox
                    ? it.product?.name || "My Box"
                    : it.product?.name || "";

                  const imageSrc =
                    it.product?.image_url ||
                    it.product?.image ||
                    (isBox ? FALLBACK_BOX_IMAGE : FALLBACK_BOX_IMAGE);

                  return (
                    <div key={it.product?.id} className="cart-item">
                      <div className="cart-item-main">
                        <div className="cart-item-line1">
                          <div className="cart-item-name">{displayName}</div>

                          <button
                            className="cart-delete-icon"
                            onClick={() => handleDelete(it.product.id)}
                            title="Remove item"
                            type="button"
                          >
                            🗑
                          </button>
                        </div>

                        {isBox && boxNames ? (
                          <div
                            className="cart-box-includes"
                            style={{ marginTop: 6, opacity: 0.9 }}
                          >
                            <b>Includes:</b> {boxNames}
                          </div>
                        ) : null}

                        <div className="cart-item-prices">
                          <span className="cart-item-unit">
                            ₪{unitPrice.toFixed(2)} per item
                          </span>
                          <span className="cart-item-total">₪{lineTotal}</span>
                        </div>

                        {!isBox ? (
                          <div className="cart-stock-line">
                            In stock: <b>{stock}</b>
                            {stock === 0 ? (
                              <span className="cart-out"> • Out of stock</span>
                            ) : null}
                          </div>
                        ) : (
                          <div className="cart-stock-line">
                            <span style={{ opacity: 0.85 }}>
                              Custom box item
                            </span>
                          </div>
                        )}

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
                            disabled={!isBox && (stock === 0 || atMax)}
                            title={!isBox && atMax ? "Reached max stock" : "Increase"}
                            type="button"
                            style={{
                              opacity: !isBox && (stock === 0 || atMax) ? 0.45 : 1,
                              cursor:
                                !isBox && (stock === 0 || atMax)
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            +
                          </button>
                        </div>

                        {!isBox && atMax && stock > 0 ? (
                          <div className="cart-max-note">
                            Max reached (stock: {stock})
                          </div>
                        ) : null}
                      </div>

                      <img
                        src={imageSrc}
                        alt={displayName || "product"}
                        className="cart-item-image"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_BOX_IMAGE;
                        }}
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