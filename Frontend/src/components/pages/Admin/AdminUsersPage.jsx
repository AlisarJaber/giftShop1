import { useEffect, useMemo, useState } from "react";
import "./adminUsers.css";
import toast from "react-hot-toast";
import { getAllUsers, blockUser, unblockUser } from "../../../utils/usersApi";
import BackButton from "../../ui/BackButton";

const DAYS_TO_MINUTES = 1440;

function normalizeApiError(e, fallback = "Something went wrong") {
  const detail = e?.response?.data?.detail;

  if (Array.isArray(detail)) {
    const msg = detail
      .map((x) => x?.msg)
      .filter(Boolean)
      .join(" | ");
    return msg || fallback;
  }

  if (typeof detail === "string") return detail;
  if (typeof e?.message === "string") return e.message;
  return fallback;
}

// Convert YYYY-MM-DD to minutes from now until end of that day (23:59)
function minutesUntilEndOfDate(dateStr) {
  const now = new Date();
  const [y, m, d] = String(dateStr).split("-").map(Number);
  if (!y || !m || !d) return null;

  const end = new Date(y, m - 1, d, 23, 59, 0, 0);
  const diffMs = end.getTime() - now.getTime();
  const diffMin = Math.ceil(diffMs / 60000);

  if (!Number.isFinite(diffMin) || diffMin <= 0) return null;
  return diffMin;
}

function parseBlockedUntil(u) {
  const raw =
    u?.blocked_until ??
    u?.blocked_until_at ??
    u?.blocked_until_date ??
    u?.blockedUntil ??
    null;

  if (!raw) return null;

  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw;

  const dt = new Date(raw);
  if (!Number.isNaN(dt.getTime())) return dt;

  return null;
}

function formatDate(dt) {
  return dt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function daysLeftFromNow(dt) {
  const now = new Date();
  const diffMs = dt.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export default function AdminUsersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // UI state per user
  const [blockDays, setBlockDays] = useState({});
  const [blockUntil, setBlockUntil] = useState({});
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await getAllUsers();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(normalizeApiError(e, "Failed to load users"));
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

    const isAdmin = !!u?.is_admin;
    if (isAdmin) return;

    const untilRaw = (blockUntil[userId] ?? "").trim();
    const daysRaw = (blockDays[userId] ?? "").trim();

    let minutes;

    // Must choose date OR days
    if (untilRaw) {
      const mins = minutesUntilEndOfDate(untilRaw);
      if (!mins) {
        toast.error("Please choose a valid future date.");
        return;
      }
      minutes = mins;
    } else if (daysRaw !== "") {
      const days = Number(daysRaw);
      if (!Number.isFinite(days) || days <= 0) {
        toast.error("Enter valid days (> 0) or choose a date.");
        return;
      }
      minutes = Math.round(days * DAYS_TO_MINUTES);
    } else {
      toast.error("Please enter days or choose a date before blocking.");
      return;
    }

    try {
      setBusyId(userId);

      const res = await blockUser(userId, minutes);

      // Clear inputs after success
      setBlockDays((prev) => ({ ...prev, [userId]: "" }));
      setBlockUntil((prev) => ({ ...prev, [userId]: "" }));

      // Prefer showing the real date from backend if it exists
      const backendUntil = res?.blocked_until ? new Date(res.blocked_until) : null;
      if (backendUntil && !Number.isNaN(backendUntil.getTime())) {
        toast.success(`User blocked until ${formatDate(backendUntil)}`);
      } else if (untilRaw) {
        toast.success(`User blocked until ${untilRaw}`);
      } else {
        toast.success(`User blocked for ${daysRaw} day(s)`);
      }

      await load();
    } catch (e) {
      toast.error(normalizeApiError(e, "Failed to block user"));
    } finally {
      setBusyId(null);
    }
  };

  const handleUnblock = async (u) => {
    const userId = u?.id;
    if (!userId) return;

    const isAdmin = !!u?.is_admin;
    if (isAdmin) return;

    try {
      setBusyId(userId);
      await unblockUser(userId);
      toast.success("User unblocked");
      await load();
    } catch (e) {
      toast.error(normalizeApiError(e, "Failed to unblock user"));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="admin-users-wrap">Loading...</div>;
  if (err) return <div className="admin-users-wrap">{err}</div>;

  return (
    <div className="admin-users-wrap">
      <BackButton />
      <h1 className="admin-users-title">All Users (Admin)</h1>
      <p className="admin-users-sub">View users and block/unblock access</p>

      <div className="admin-users-table">
        {sortedRows.map((u) => {
          const id = u?.id;
          const isAdmin = !!u?.is_admin;
          const isBlocked = u?.is_blocked === true;

          const daysVal = blockDays[id] ?? "";
          const untilVal = blockUntil[id] ?? "";

          const blockedUntilDate = isBlocked ? parseBlockedUntil(u) : null;
          const daysLeft =
            blockedUntilDate ? daysLeftFromNow(blockedUntilDate) : null;

          let blockedInfo = null;

          if (isBlocked) {
            if (blockedUntilDate && Number.isFinite(daysLeft)) {
              // If already expired (can happen until backend auto-clears on next request)
              if (daysLeft <= 0) {
                blockedInfo = `Blocked until ${formatDate(blockedUntilDate)} (expired)`;
              } else {
                blockedInfo = `Blocked until ${formatDate(blockedUntilDate)} (${daysLeft} day${
                  daysLeft === 1 ? "" : "s"
                } left)`;
              }
            } else {
              blockedInfo = "Blocked (manual unblock required)";
            }
          }

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

                  {isBlocked && <div className="user-row-blockinfo">{blockedInfo}</div>}
                </div>

                <div className="user-actions">
                  {!isBlocked && (
                    <>
                      <input
                        className="mins-input"
                        type="number"
                        min="1"
                        placeholder="days"
                        value={daysVal}
                        onChange={(e) => {
                          const v = e.target.value;
                          setBlockDays((prev) => ({ ...prev, [id]: v }));
                          if (v !== "") setBlockUntil((prev) => ({ ...prev, [id]: "" }));
                        }}
                        disabled={busyId === id || isAdmin}
                        title={isAdmin ? "Cannot block admin" : "Block for N days"}
                      />

                      <input
                        className="mins-input"
                        type="date"
                        value={untilVal}
                        onChange={(e) => {
                          const v = e.target.value;
                          setBlockUntil((prev) => ({ ...prev, [id]: v }));
                          if (v) setBlockDays((prev) => ({ ...prev, [id]: "" }));
                        }}
                        disabled={busyId === id || isAdmin}
                        title={isAdmin ? "Cannot block admin" : "Block until date"}
                      />

                      <div className="choose-hint">Choose days OR date</div>
                    </>
                  )}

                  {!isBlocked ? (
                    <button
                      className="btn danger"
                      type="button"
                      onClick={() => handleBlock(u)}
                      disabled={busyId === id || isAdmin}
                    >
                      Block
                    </button>
                  ) : (
                    <button
                      className="btn"
                      type="button"
                      onClick={() => handleUnblock(u)}
                      disabled={busyId === id || isAdmin}
                    >
                      Unblock
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}