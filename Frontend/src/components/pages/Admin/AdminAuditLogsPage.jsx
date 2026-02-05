import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getErrorText } from "../../../utils/toastText";
import { getAuditLogs } from "../../../utils/auditLogsApi";
import "./adminAuditLogs.css";

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AdminAuditLogsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setErr("");

        const data = await getAuditLogs(200);
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        const msg = getErrorText(e, "Failed to load audit logs");
        setErr(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  if (loading) return <div className="audit-wrap">Loading...</div>;
  if (err) return <div className="audit-wrap">{err}</div>;

  return (
    <div className="audit-wrap">
      <h1 className="audit-title">Audit Logs (Admin)</h1>
      <p className="audit-sub">All recent actions in the system</p>

      {rows.length === 0 ? (
        <div className="audit-empty">No logs yet.</div>
      ) : (
        <div className="audit-table">
          <div className="audit-head">
            <div>Time</div>
            <div>User</div>
            <div>Action</div>
            <div>Product</div>
            <div>Qty</div>
            <div>Cart</div>
          </div>

          {rows.map((r) => (
            <div className="audit-row" key={r.id}>
              <div className="audit-cell">{formatTime(r.created_at)}</div>

              <div className="audit-cell">
                <div className="audit-user">{r.actor_name}</div>
                <div className="audit-email">{r.actor_email}</div>
              </div>

              <div className="audit-cell">
                <span className={`audit-badge ${r.action}`}>{r.action}</span>
              </div>

              <div className="audit-cell">{r.product_name || "-"}</div>
              <div className="audit-cell">{r.quantity_delta}</div>
              <div className="audit-cell">{r.cart_id ?? "-"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
