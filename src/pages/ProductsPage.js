import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productAPI, categoryAPI } from "../api";

const formatPrice = (p) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(p);

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryAPI
      .getAll()
      .then((res) => setCategories(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    productAPI
      .getAll({ category: selectedCategory || undefined, page, limit: 12 })
      .then((res) => {
        setProducts(res.data);
        setPagination(res.pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCategory, page]);

  return (
    <div className="page-container animate-in">
      <div
        className="page-header"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1>Products</h1>
          <p>
            {pagination
              ? `${pagination.total} total products`
              : "All products in the catalog"}
          </p>
        </div>
        <Link to="/products/add" className="btn btn-primary">
          + Add Product
        </Link>
      </div>

      {/* Category filter tabs */}
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}
      >
        <button
          className={`sort-btn${!selectedCategory ? " active" : ""}`}
          onClick={() => {
            setSelectedCategory("");
            setPage(1);
          }}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            className={`sort-btn${selectedCategory === cat.slug ? " active" : ""}`}
            onClick={() => {
              setSelectedCategory(cat.slug);
              setPage(1);
            }}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="product-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 300, borderRadius: "var(--radius-lg)" }}
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No products yet</h3>
          <p>Start by adding your first product</p>
          <Link
            to="/products/add"
            className="btn btn-primary"
            style={{ marginTop: 16 }}
          >
            + Add Product
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => {
            const attrDefs = product.category?.attributes || [];
            const topAttrs = attrDefs
              .filter((d) => product.attributes?.[d.key] !== undefined)
              .slice(0, 3);

            return (
              <Link
                key={product._id}
                to={`/products/${product.slug}`}
                className="product-card"
              >
                <div className="product-card-img">
                  {product.thumbnail ? (
                    <img src={product.thumbnail} alt={product.name} />
                  ) : (
                    <span>{product.category?.icon || "📦"}</span>
                  )}
                </div>
                <div className="product-card-body">
                  <div className="product-card-category">
                    {product.category?.name}
                  </div>
                  <div className="product-card-name">{product.name}</div>
                  <div className="product-card-attrs">
                    {topAttrs.map((d) => {
                      const val = product.attributes[d.key];
                      return (
                        <span key={d.key} className="product-card-attr">
                          {Array.isArray(val) ? val[0] : val}
                        </span>
                      );
                    })}
                  </div>
                  <div className="product-card-footer">
                    <div className="product-card-price">
                      {formatPrice(product.price)}
                    </div>
                    <span
                      className={`badge ${product.stock > 0 ? "badge-success" : "badge-danger"}`}
                    >
                      {product.stock > 0 ? "In Stock" : "OOS"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
