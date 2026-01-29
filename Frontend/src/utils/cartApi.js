import axios from "axios";

const API_URL = "http://localhost:8000/carts";

export async function addToCart(productId, quantity = 1) {
  const response = await axios.post(
    `${API_URL}/add`,
    { product_id: productId, quantity },
    {
      withCredentials: true,
      headers: {
        apiKey: "SEACRET1234567", 
      },
    }
  );

  return response.data;
}
