import axios from "axios";

const API = "http://localhost:8000";
const APIKEY = "SEACRET1234567";

// יצירת instance קבוע
const api = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: { apiKey: APIKEY },
});

// לוג שגיאות כללי (עוזר בטירוף בדיבאג)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const data = err?.response?.data;
    console.log("API ERROR:", { status, data });
    return Promise.reject(err);
  }
);

// --------- GET ---------
export const getSingleCategories = async () => {
  const res = await api.get(`/single-categories/`);
  return res.data;
};

export const getSingleProducts = async (categoryId) => {
  const res = await api.get(`/single-products/`, {
    params: categoryId ? { category_id: categoryId } : {},
  });
  return res.data;
};

// --------- CREATE ---------
export const createSingleCategory = async (payload) => {
  const res = await api.post(`/single-categories/`, payload);
  return res.data;
};

export const createSingleProduct = async (payload) => {
  const res = await api.post(`/single-products/`, payload);
  return res.data;
};

// --------- UPDATE (EDIT) ---------
export const updateSingleCategory = async (category_id, payload) => {
  const res = await api.put(`/single-categories/${category_id}`, payload);
  return res.data;
};

export const updateSingleProduct = async (product_id, payload) => {
  const res = await api.put(`/single-products/${product_id}`, payload);
  return res.data;
};

// --------- DELETE ---------
export const deleteSingleCategory = async (category_id) => {
  await api.delete(`/single-categories/${category_id}`);
  return true;
};

export const deleteSingleProduct = async (product_id) => {
  await api.delete(`/single-products/${product_id}`);
  return true;
};

// --------- UPLOAD IMAGE ---------
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image_file", file);

  const res = await api.post(`/api/uploads/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (res.data?.url) return res.data.url;
  if (typeof res.data === "string") return res.data;

  throw new Error("Upload response format is not supported");
};

// --------- CUSTOM BOX -> CART ---------
export const addCustomBoxToCart = async ({ name, items }) => {
  // normalize לתמיכה בכמה מבנים אפשריים מהפרונט
  const normalizedItems = (items || [])
    .map((x) => {
      const productId =
        x.product_id ?? x.product?.id ?? x.id ?? x.productId;

      const qty =
        x.quantity ?? x.qty ?? x.count ?? 1;

      return {
        product_id: Number(productId),
        quantity: Number(qty),
      };
    })
    .filter(
      (it) =>
        Number.isFinite(it.product_id) &&
        it.product_id > 0 &&
        Number.isFinite(it.quantity) &&
        it.quantity > 0
    );

  const payload = {
    name: name || "My Box",
    items: normalizedItems,
  };

  console.log("SENDING CUSTOM BOX:", payload);
  console.log("CUSTOM BOX IDS:", payload.items.map((i) => i.product_id));

  if (payload.items.length === 0) {
    throw new Error(
      "Custom box has no valid items (product_id/quantity missing). Check items shape in SelectionSummary."
    );
  }

  // חשוב: זה ה-endpoint שאת כבר קוראת אליו
  const res = await api.post(`/carts/custom-box/add`, payload);
  return res.data;
};
