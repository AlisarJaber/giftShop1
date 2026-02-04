import { useEffect, useMemo, useState } from "react";
import "./adminUsers.css";
import { getAllUsers, blockUser, unblockUser } from "../../../utils/usersApi";

export default function AdminUsersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // UI state
  const [blockMinutes, setBlockMinutes] = useState({});
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
    // אדמין למעלה, ואז לפי id
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

    const minutesRaw = blockMinutes[userId];
    const minutes = Number(minutesRaw);

    if (!Number.isFinite(minutes) || minutes <= 0) {
      alert("Enter valid minutes (> 0)");
      return;
    }

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

      {sortedRows.length === 0 ? (
        <div className="admin-users-empty">No users found.</div>
      ) : (
        <div className="admin-users-table">
          {sortedRows.map((u) => {
            const id = u?.id;
            const isAdmin = !!u?.is_admin;

            // אם בבאקאנד נחזיר blocked_until (timestamp או null) נוכל להציג:
            const blockedUntil = u?.blocked_until ?? null; // optional
            const isBlocked =
              u?.is_blocked === true || (blockedUntil ? true : false); // optional fallback

            return (
              <div key={id} className="user-row">
                <div className="user-row-top">
                  <div>
                    <div className="user-row-title">
                      User #{id} • {u?.first_name} {u?.last_name}
                    </div>
                    <div className="user-row-meta">
                      Email: <b>{u?.email}</b>
                      {"  "}• Role:{" "}
                      <span className={isAdmin ? "role-admin" : "role-user"}>
                        {isAdmin ? "Admin" : "User"}
                      </span>
                      {"  "}• Status:{" "}
                      <span className={isBlocked ? "blocked" : "active"}>
                        {isBlocked ? "Blocked" : "Active"}
                      </span>
                      {blockedUntil ? (
                        <>
                          {"  "}• Blocked until: <b>{String(blockedUntil)}</b>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="user-actions">
                    <input
                      className="mins-input"
                      type="number"
                      min="1"
                      placeholder="minutes"
                      value={blockMinutes[id] ?? ""}
                      onChange={(e) =>
                        setBlockMinutes((prev) => ({
                          ...prev,
                          [id]: e.target.value,
                        }))
                      }
                      disabled={busyId === id || isAdmin}
                      title={isAdmin ? "Cannot block admin" : "Block minutes"}
                    />

                    <button
                      className="btn danger"
                      type="button"
                      onClick={() => handleBlock(u)}
                      disabled={busyId === id || isAdmin}
                      title={isAdmin ? "Cannot block admin" : "Block user"}
                    >
                      Block
                    </button>

                    <button
                      className="btn"
                      type="button"
                      onClick={() => handleUnblock(u)}
                      disabled={busyId === id || isAdmin}
                      title={isAdmin ? "Cannot unblock admin" : "Unblock user"}
                    >
                      Unblock
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
