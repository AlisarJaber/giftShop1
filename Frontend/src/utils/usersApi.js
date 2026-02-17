import { http } from "./http";

function saveAuth(data) {
  const token = data?.access_token || null;
  const user = data?.user || null;

  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");

  if (user) localStorage.setItem("user", JSON.stringify(user));
  else localStorage.removeItem("user");

  localStorage.setItem("is_admin", String(!!user?.is_admin));

  window.dispatchEvent(new Event("auth-change"));
}

/* =========================
   AUTH
========================= */

/**
 * Auth: current user
 * GET /auth/me
 */
export async function getMe() {
  const res = await http.get("/auth/me");
  const me = res.data;

  localStorage.setItem("user", JSON.stringify(me));
  localStorage.setItem("is_admin", String(!!me?.is_admin));

  return me;
}

/**
 * Auth: login
 * POST /auth/login
 */
export async function login(payload) {
  const res = await http.post("/auth/login", payload);
  saveAuth(res.data);
  return res.data;
}

/**
 * Auth: signup
 * POST /auth/signup
 */
export async function signup(payload) {
  const res = await http.post("/auth/signup", payload);
  saveAuth(res.data);
  return res.data;
}

/**
 * Auth: logout
 * POST /auth/logout
 */
export async function logout() {
  try {
    const res = await http.post("/auth/logout");
    return res.data;
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("is_admin");
    window.dispatchEvent(new Event("auth-change"));
  }
}

/* =========================
   ADMIN USERS
========================= */

/**
 * Admin: get all users
 * GET /admin/users
 */
export async function getAllUsers() {
  const res = await http.get("/admin/users");
  return res.data;
}

/**
 * Admin: block user for X minutes
 * POST /admin/users/{id}/block
 * body: { minutes }
 */
export async function blockUser(userId, minutes) {
  const res = await http.post(`/admin/users/${userId}/block`, { minutes });
  return res.data;
}

/**
 * Admin: unblock user
 * POST /admin/users/{id}/unblock
 */
export async function unblockUser(userId) {
  const res = await http.post(`/admin/users/${userId}/unblock`);
  return res.data;
}
