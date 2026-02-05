import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./adminCarts.css";
import { onAdminEvent } from "../../../utils/adminBus"; 

const API = "http://localhost:8000";
const APIKEY = "SEACRET1234567";

export default function AdminCartsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await axios.get(`${API}/carts/admin/all`, {
        withCredentials: true,
        headers: { apiKey: APIKEY },
      });

      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to load carts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const off = onAdminEvent((payload) => {
      if (payload?.evt === "audit_log_added" || payload?.evt === "cart_paid") {
        load();
      }
    });
    return off;
  }, [load]);

  const visibleRows = useMemo(() => {
    return (rows || []).filter((c) => c.is_paid || (c.items || []).length > 0);
  }, [rows]);

  if (loading) return <div className="admin-carts-wrap">Loading...</div>;
  if (err) return <div className="admin-carts-wrap">{err}</div>;

  return (
    <div className="admin-carts-wrap">
      <h1 className="admin-carts-title">All Carts (Admin)</h1>
      <p className="admin-carts-sub">View all user carts and their items</p>

      {visibleRows.length === 0 ? (
        <div className="admin-carts-empty">No carts found.</div>
      ) : (
        <div className="admin-carts-table">
          {visibleRows.map((c) => {
            const total = (c.items || []).reduce(
              (sum, it) =>
                sum + Number(it.product_price ?? 0) * Number(it.quantity ?? 0),
              0
            );

            return (
              <div key={c.id} className="cart-row">
                <div className="cart-row-top">
                  <div>
                    <div className="cart-row-title">
                      Cart #{c.id} • {c.user_name || `User #${c.user_id}`}
                    </div>

                    {c.user_email && (
                      <div className="cart-row-user-email">{c.user_email}</div>
                    )}

                    <div className="cart-row-meta">
                      Status:{" "}
                      <span className={c.is_paid ? "paid" : "open"}>
                        {c.is_paid ? "Paid" : "Open"}
                      </span>
                      {"  "}• Total: <b>₪{total.toFixed(2)}</b>
                    </div>
                  </div>
                </div>

                <div className="cart-items">
                  {(c.items || []).length === 0 ? (
                    <div className="cart-items-empty">No items</div>
                  ) : (
                    (c.items || []).map((it, idx) => (
                      <div key={idx} className="cart-item-line">
                        <div className="ci-name">
                          {it.product_name || `Product ${it.product_id}`}
                        </div>
                        <div className="ci-qty">x{it.quantity}</div>
                        <div className="ci-price">
                          ₪{Number(it.product_price ?? 0).toFixed(2)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
