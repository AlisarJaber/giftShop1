import { useEffect, useMemo, useState } from "react";
import { getCart } from "../../../utils/cartApi";
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

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const cartRows = await getCart(); // [{product_id, quantity}]
        // אם העגלה ריקה
        if (!cartRows || cartRows.length === 0) {
          setItems([]);
          return;
        }

        // מביאים פרטי מוצר לכל product_id וממזגים עם quantity
        const merged = await Promise.all(
          cartRows.map(async (row) => {
            const product = await getProductById(row.product_id);
            return { product, quantity: row.quantity };
          })
        );

        setItems(merged);
      } catch (e) {
        setError("Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading cart...</div>;
  if (error) return <div style={{ padding: 20 }}>{error}</div>;

  return (
    <div className="cart-container">
      <h2 className="cart-title">My Cart</h2>

      {items.length === 0 ? (
        <div className="cart-empty">Your cart is empty 🛒</div>
      ) : (
        <>
          <div className="cart-list">
            {items.map((it) => (
              <div key={it.product?.id} className="cart-item">
                <img
                  src={
                    it.product?.image_url ||
                    it.product?.image ||
                    "https://via.placeholder.com/90"
                  }
                  alt={it.product?.name || "product"}
                  className="cart-item-image"
                />

                <div>
                  <div className="cart-item-name">{it.product?.name}</div>
                  <div className="cart-item-price">
                    Price: ₪{it.product?.price}
                  </div>
                  <div className="cart-item-quantity">
                    Quantity: <b>{it.quantity}</b>
                  </div>
                </div>

                <div className="cart-item-total">
                  ₪{Number(it.product?.price ?? 0) * it.quantity}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <span>Total</span>
            <span>₪{total}</span>
          </div>
        </>
      )}
    </div>

  );
}

export default CartPage