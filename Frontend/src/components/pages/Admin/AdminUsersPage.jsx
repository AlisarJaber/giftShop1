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
  // Try common backend field names:
  const raw =
    u?.blocked_until ??
    u?.blocked_until_at ??
    u?.blocked_until_date ??
    u?.blockedUntil ??
    null;

  if (!raw) return null;

  // If already Date-like:
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw;

  // If ISO string or timestamp:
  const dt = new Date(raw);
  if (!Number.isNaN(dt.getTime())) return dt;

  return null;
}

function formatDate(dt) {
  // English date formatting (e.g., Feb 10, 2026)
  return dt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function daysLeftFromNow(dt) {
  const now = new Date();
  const diffMs = dt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default function AdminUsersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // UI state per user
  const [blockDays, setBlockDays] = useState({}); // { [id]: "3" }
  const [blockUntil, setBlockUntil] = useState({}); // { [id]: "YYYY-MM-DD" }
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
      await blockUser(userId, minutes);

      if (untilRaw) toast.success(`User blocked until ${untilRaw}`);
      else toast.success(`User blocked for ${daysRaw} day(s)`);

      // optional: clear inputs after success
      setBlockDays((prev) => ({ ...prev, [userId]: "" }));
      setBlockUntil((prev) => ({ ...prev, [userId]: "" }));

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

          // blocked info (if backend provides a date)
          const blockedUntilDate = isBlocked ? parseBlockedUntil(u) : null;
          const daysLeft =
            blockedUntilDate ? daysLeftFromNow(blockedUntilDate) : null;

          const blockedInfo =
            blockedUntilDate && Number.isFinite(daysLeft)
              ? `Blocked until ${formatDate(blockedUntilDate)}${
                  daysLeft > 0 ? ` (${daysLeft} day${daysLeft === 1 ? "" : "s"} left)` : ""
                }`
              : null;

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

                  {/* Show extra blocked details */}
                  {isBlocked && (
                    <div className="user-row-blockinfo">
                      {blockedInfo ? blockedInfo : "Blocked (no end date provided by API)"}
                    </div>
                  )}
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
                          if (v !== "")
                            setBlockUntil((prev) => ({ ...prev, [id]: "" }));
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