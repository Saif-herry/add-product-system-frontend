import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Response interceptor ──────────────────────────────────────────
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.message || err.message || "Something went wrong";
    return Promise.reject(new Error(message));
  },
);

// ── Categories ────────────────────────────────────────────────────
export const categoryAPI = {
  /** List all active categories (name + slug only) */
  getAll: () => api.get("/categories"),

  /** Get single category with full attribute definitions */
  getBySlug: (slug) => api.get(`/categories/${slug}`),

  /** Admin: create a new category */
  create: (data) => api.post("/categories", data),

  /** Admin: update category */
  update: (id, data) => api.put(`/categories/${id}`, data),

  /** Admin: soft-delete */
  delete: (id) => api.delete(`/categories/${id}`),
};

// ── Products ──────────────────────────────────────────────────────
export const productAPI = {
  /** List products — supports ?category=slug&page=&limit= */
  getAll: (params = {}) => api.get("/products", { params }),

  /** Single product detail by slug */
  getBySlug: (slug) => api.get(`/products/${slug}`),

  /** Admin: create product */
  create: (data) => api.post("/products", data),

  /** Admin: update product */
  update: (id, data) => api.put(`/products/${id}`, data),

  /** Admin: delete product */
  delete: (id) => api.delete(`/products/${id}`),
};

// ── Search & Filters ──────────────────────────────────────────────
export const searchAPI = {
  /**
   * Backend-driven search.
   * params: { q, category, page, limit, sort, minPrice, maxPrice, ...attrFilters }
   */
  search: (params = {}) => api.get("/search", { params }),

  /**
   * Get dynamic filter definitions for a category.
   * Returns: [{ key, label, type, options?, min?, max? }, ...]
   */
  getFilters: (categorySlug) =>
    api.get("/search/filters", { params: { category: categorySlug } }),
};

export default api;
