import axios from "axios";

const API_URL = "http://localhost:8000/carts";
const APIKEY = "SEACRET1234567";

const cfg = {
  withCredentials: true,
  headers: { apiKey: APIKEY },
};

export async function getCart() {
  const res = await axios.get(`${API_URL}/`, cfg);
  return res.data;
}

export async function addToCart(productId, quantity = 1) {
  const res = await axios.post(
    `${API_URL}/add`,
    { product_id: productId, quantity },
    cfg
  );
  return res.data;
}

export async function updateCartItemQuantity(productId, quantity) {
  const res = await axios.patch(
    `${API_URL}/items/${productId}?quantity=${quantity}`,
    {},
    cfg
  );
  return res.data;
}

export async function deleteCartItem(productId) {
  const res = await axios.delete(`${API_URL}/items/${productId}`, cfg);
  return res.data;
}

export async function checkoutCart() {
  const res = await axios.post(`${API_URL}/checkout`, {}, cfg);
  return res.data;
}


