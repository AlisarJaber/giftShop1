import { http } from "./http";

/* =========================
   AUTH
========================= */

/**
 * Auth: current user
 * GET /auth/me
 */
export async function getMe() {
  const res = await http.get("/auth/me");
  return res.data;
}

/**
 * Auth: login
 * POST /auth/login
 */
export async function login(payload) {
  // payload: { email, password }
  const res = await http.post("/auth/login", payload);
  return res.data;
}

/**
 * Auth: signup
 * POST /auth/signup
 */
export async function signup(payload) {
  // payload: { first_name, last_name, email, password, image_url? }
  const res = await http.post("/auth/signup", payload);
  return res.data;
}

/**
 * Auth: logout
 * POST /auth/logout
 */
export async function logout() {
  const res = await http.post("/auth/logout");
  return res.data;
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