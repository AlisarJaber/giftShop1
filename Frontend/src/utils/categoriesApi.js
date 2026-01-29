import { http } from "./http";

export async function getCategories() {
  const res = await http.get("/categories");
  return res.data;
}

export async function createCategory(payload) {
  const res = await http.post("/categories", payload)
  return res.data;
}
