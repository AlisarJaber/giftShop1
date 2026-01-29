import { useEffect, useMemo, useState } from "react";
import { getCart } from "../../../utils/cartApi";
import { getProductById } from "../../../utils/productsApi";

export default function CartPage() {
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
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 16 }}>My Cart</h2>

      {items.length === 0 ? (
        <div>Your cart is empty 🛒</div>
      ) : (
        <>
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((it) => (
              <div
                key={it.product?.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "90px 1fr 120px",
                  gap: 12,
                  padding: 12,
                  border: "1px solid #eee",
                  borderRadius: 12,
                  background: "white",
                  alignItems: "center",
                }}
              >
                <img
                  src={
                    it.product?.image_url ||
                    it.product?.image ||
                    "https://via.placeholder.com/90"
                  }
                  alt={it.product?.name || "product"}
                  style={{
                    width: 90,
                    height: 90,
                    objectFit: "cover",
                    borderRadius: 10,
                  }}
                />

                <div>
                  <div style={{ fontWeight: 700 }}>{it.product?.name}</div>
                  <div style={{ opacity: 0.8, marginTop: 4 }}>
                    Price: ₪{it.product?.price}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    Quantity: <b>{it.quantity}</b>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700 }}>
                    ₪{Number(it.product?.price ?? 0) * it.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 18,
              paddingTop: 12,
              borderTop: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            <span>Total</span>
            <span>₪{total}</span>
          </div>
        </>
      )}
    </div>
  );
}
