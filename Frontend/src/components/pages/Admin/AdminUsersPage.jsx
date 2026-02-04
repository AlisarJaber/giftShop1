import { useEffect, useMemo, useState } from "react";
import "./adminUsers.css";
import { getAllUsers, blockUser, unblockUser } from "../../../utils/usersApi";

const DAYS_TO_MINUTES = 1440;

export default function AdminUsersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // UI state
  const [blockDays, setBlockDays] = useState({});
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");

      const data = await getAllUsers();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const aa = a?.is_admin ? 1 : 0;
      const bb = b?.is_admin ? 1 : 0;
      if (aa !== bb) return bb - aa;
      return Number(a?.id ?? 0) - Number(b?.id ?? 0);
    });
  }, [rows]);

  const handleBlock = async (u) => {
    const userId = u?.id;
    if (!userId) return;

    const daysRaw = blockDays[userId];
    const days = Number(daysRaw);

    if (!Number.isFinite(days) || days <= 0) {
      alert("Enter valid days (> 0)");
      return;
    }

    const minutes = days * DAYS_TO_MINUTES;

    try {
      setBusyId(userId);
      await blockUser(userId, minutes);
      await load();
    } catch (e) {
      alert(e?.response?.data?.detail || "Failed to block user");
    } finally {
      setBusyId(null);
    }
  };

  const handleUnblock = async (u) => {
    const userId = u?.id;
    if (!userId) return;

    try {
      setBusyId(userId);
      await unblockUser(userId);
      await load();
    } catch (e) {
      alert(e?.response?.data?.detail || "Failed to unblock user");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="admin-users-wrap">Loading...</div>;
  if (err) return <div className="admin-users-wrap">{err}</div>;

  return (
    <div className="admin-users-wrap">
      <h1 className="admin-users-title">All Users (Admin)</h1>
      <p className="admin-users-sub">View users and block/unblock access</p>

      <div className="admin-users-table">
        {sortedRows.map((u) => {
          const id = u?.id;
          const isAdmin = !!u?.is_admin;
          const isBlocked = u?.is_blocked === true;

          return (
            <div key={id} className="user-row">
              <div className="user-row-top">
                <div>
                  <div className="user-row-title">
                    User #{id} • {u?.first_name} {u?.last_name}
                  </div>
                  <div className="user-row-meta">
                    Email: <b>{u?.email}</b> • Role:{" "}
                    <span className={isAdmin ? "role-admin" : "role-user"}>
                      {isAdmin ? "Admin" : "User"}
                    </span>{" "}
                    • Status:{" "}
                    <span className={isBlocked ? "blocked" : "active"}>
                      {isBlocked ? "Blocked" : "Active"}
                    </span>
                  </div>
                </div>

                <div className="user-actions">
                  <input
                    className="mins-input"
                    type="number"
                    min="1"
                    placeholder="days"
                    value={blockDays[id] ?? ""}
                    onChange={(e) =>
                      setBlockDays((prev) => ({
                        ...prev,
                        [id]: e.target.value,
                      }))
                    }
                    disabled={busyId === id || isAdmin}
                    title={isAdmin ? "Cannot block admin" : "Block days"}
                  />

                  <button
                    className="btn danger"
                    type="button"
                    onClick={() => handleBlock(u)}
                    disabled={busyId === id || isAdmin}
                  >
                    Block
                  </button>

                  <button
                    className="btn"
                    type="button"
                    onClick={() => handleUnblock(u)}
                    disabled={busyId === id || isAdmin}
                  >
                    Unblock
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
