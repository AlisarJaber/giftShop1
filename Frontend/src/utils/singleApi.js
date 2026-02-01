import axios from "axios";

const API = "http://localhost:8000";
const APIKEY = "SEACRET1234567";

export const getSingleCategories = async () => {
  const res = await axios.get(`${API}/single-categories`, {
    headers: { apiKey: APIKEY },
    withCredentials: true,
  });
  return res.data;
};

export const getSingleProducts = async (categoryId) => {
  const res = await axios.get(`${API}/single-products`, {
    params: categoryId ? { category_id: categoryId } : {},
    headers: { apiKey: APIKEY },
    withCredentials: true,
  });
  return res.data;
};

export const createSingleCategory = async (name) => {
  const res = await axios.post(
    `${API}/single-categories`,
    { name },
    { withCredentials: true, headers: { apiKey: APIKEY } }
  );
  return res.data;
};

export const createSingleProduct = async (payload) => {
  const res = await axios.post(
    `${API}/single-products`,
    payload,
    { withCredentials: true, headers: { apiKey: APIKEY } }
  );
  return res.data;
};
