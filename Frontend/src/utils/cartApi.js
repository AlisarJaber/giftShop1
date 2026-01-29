import axios from "axios";

const API_URL = "http://localhost:8000/carts";

export async function getCart() {
  const res = await axios.get(`${API_URL}/`, {
    withCredentials: true,
    headers: { apiKey: "SEACRET1234567" },
  });
  return res.data; 
}

export async function addToCart(productId, quantity = 1) {
  const res = await axios.post(
    `${API_URL}/add`,
    { product_id: productId, quantity },
    {
      withCredentials: true,
      headers: { apiKey: "SEACRET1234567" },
    }
  );
  return res.data;
}

export async function updateCartItemQuantity(productId, quantity) {
  const res = await axios.patch(
    `${API_URL}/items/${productId}?quantity=${quantity}`,
    {},
    {
      withCredentials: true,
      headers: { apiKey: "SEACRET1234567" },
    }
  );
  return res.data;
}

export async function deleteCartItem(productId) {
  const res = await axios.delete(`${API_URL}/items/${productId}`, {
    withCredentials: true,
    headers: { apiKey: "SEACRET1234567" },
  });
  return res.data;
}

