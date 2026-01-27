import { http } from "./http";

export async function getProducts() {
  const res = await http.get("/products")
  return res.data;
}
