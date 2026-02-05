import { http } from "./http";

export async function getAuditLogs(limit = 200) {
  const res = await http.get(`/audit-logs/admin?limit=${limit}`);
  return res.data;
}
