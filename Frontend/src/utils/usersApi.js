import { http } from "./http";

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
