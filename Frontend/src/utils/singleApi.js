import axios from "axios";

const API = "http://localhost:8000";
const APIKEY = "SEACRET1234567";

const AXIOS_CONFIG = {
  withCredentials: true,
  headers: { apiKey: APIKEY },
};

// --------- GET ---------
export const getSingleCategories = async () => {
  const res = await axios.get(`${API}/single-categories/`, AXIOS_CONFIG);
  return res.data;
};

export const getSingleProducts = async (categoryId) => {
  const res = await axios.get(`${API}/single-products/`, {
    ...AXIOS_CONFIG,
    params: categoryId ? { category_id: categoryId } : {},
  });
  return res.data;
};

// --------- CREATE ---------
export const createSingleCategory = async (payload) => {
  // payload = { name, image_url?, is_active? }
  const res = await axios.post(
    `${API}/single-categories/`,
    payload,
    AXIOS_CONFIG
  );
  return res.data;
};


export const createSingleProduct = async (payload) => {
  const res = await axios.post(
    `${API}/single-products/`,
    payload,
    AXIOS_CONFIG
  );
  return res.data;
};

// --------- UPDATE (EDIT) ---------
export const updateSingleCategory = async (category_id, payload) => {
  // payload = { name: "New Name" }
  const res = await axios.put(
    `${API}/single-categories/${category_id}`,
    payload,
    AXIOS_CONFIG
  );
  return res.data;
};

export const updateSingleProduct = async (product_id, payload) => {
  // payload = { name, price, description, image_url, category_id }
  const res = await axios.put(
    `${API}/single-products/${product_id}`,
    payload,
    AXIOS_CONFIG
  );
  return res.data;
};

// --------- DELETE ---------
export const deleteSingleCategory = async (category_id) => {
  // בדרך כלל 204 -> אין body
  await axios.delete(`${API}/single-categories/${category_id}`, AXIOS_CONFIG);
  return true;
};

export const deleteSingleProduct = async (product_id) => {
  await axios.delete(`${API}/single-products/${product_id}`, AXIOS_CONFIG);
  return true;
};

// --------- UPLOAD IMAGE ---------
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image_file", file);

  const res = await axios.post(`${API}/api/uploads/image`, formData, {
    ...AXIOS_CONFIG,
    headers: {
      ...AXIOS_CONFIG.headers,
      "Content-Type": "multipart/form-data",
    },
  });

  // אם הבאקנד מחזיר { url: "..." }:
  if (res.data?.url) return res.data.url;

  // אם הבאקנד מחזיר את ה-URL כמחרוזת:
  if (typeof res.data === "string") return res.data;

  throw new Error("Upload response format is not supported");
};
