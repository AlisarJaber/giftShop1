import { http } from "./http";

export async function getProducts() {
  const res = await http.get("/products")
  return res.data
}

export async function getProductById(id) {
  const res = await http.get(`/products/${id}`)
  return res.data
}

export async function deleteProduct(id) {
  await http.delete(`/products/${id}`)
}
export async function createProduct(payload) {
  const res = await http.post("/products", payload);
  return res.data;
}

export async function updateProduct(id, payload) {
  const res = await http.put(`/products/${id}`, payload);
  return res.data;
}

export async function getFavoriteIds() {
  const res = await http.get("/favorites")
  return res.data
}

export async function toggleFavorite(productId) {
  const res = await http.post(`/favorites/${productId}`);
  return res.data
}
