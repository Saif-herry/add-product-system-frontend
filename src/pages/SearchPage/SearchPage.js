import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchAPI, categoryAPI } from "../../api";
import "./SearchPage.css";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price ↑" },
  { value: "price-desc", label: "Price ↓" },
  { value: "featured", label: "Featured" },
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "relevance");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const [filterDefs, setFilterDefs] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [filtersLoading, setFiltersLoading] = useState(false);

  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState([]);

  const debounceRef = useRef(null);

  // Load categories once
  useEffect(() => {
    categoryAPI
      .getAll()
      .then((res) => setCategories(res.data))
      .catch(console.error);
  }, []);

  // Load dynamic filters when category changes
  useEffect(() => {
    setFiltersLoading(true);
    setActiveFilters({});
    searchAPI
      .getFilters(selectedCategory || undefined)
      .then((res) => setFilterDefs(res.data))
      .catch(console.error)
      .finally(() => setFiltersLoading(false));
  }, [selectedCategory]);

  // Run search whenever any search param changes
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      executeSearch(query, selectedCategory, sort, page, activeFilters);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query, selectedCategory, sort, page, activeFilters]); // eslint-disable-line

  const executeSearch = async (q, category, sortVal, pageVal, filters) => {
    setLoading(true);

    const params = { sort: sortVal, page: pageVal, limit: 12 };
    if (q) params.q = q;
    if (category) params.category = category;

    // Add attribute filters
    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      if (key === "price") {
        if (value.min) params.minPrice = value.min;
        if (value.max) params.maxPrice = value.max;
      } else if (Array.isArray(value) && value.length > 0) {
        params[key] = value;
      }
    }

    // Sync URL
    const urlParams = {};
    if (q) urlParams.q = q;
    if (category) urlParams.category = category;
    if (sortVal !== "relevance") urlParams.sort = sortVal;
    if (pageVal > 1) urlParams.page = pageVal;
    setSearchParams(urlParams, { replace: true });

    try {
      const res = await searchAPI.search(params);
      setResults(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleCheckboxFilter = (key, value) => {
    setActiveFilters((prev) => {
      const current = Array.isArray(prev[key]) ? prev[key] : [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next.length > 0 ? next : undefined };
    });
    setPage(1);
  };

  const setRangeFilter = (key, field, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: value ? Number(value) : undefined,
      },
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSelectedCategory("");
    setQuery("");
    setSort("relevance");
    setPage(1);
  };

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <h1>Search & Browse</h1>
        <p>
          Filters are generated dynamically from the backend based on category
        </p>
      </div>

      {/* Search bar */}
      <div className="search-controls">
        <div className="search-bar-wrapper">
          <span className="search-icon">⌕</span>
          <input
            className="search-bar"
            type="text"
            placeholder="Search products by name, description or tags…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="category-tabs">
        <button
          className={`category-tab${!selectedCategory ? " active" : ""}`}
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
            className={`category-tab${selectedCategory === cat.slug ? " active" : ""}`}
            onClick={() => {
              setSelectedCategory(cat.slug);
              setPage(1);
            }}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      <div className="search-layout">
        {/* Filters Panel */}
        <div className="filters-panel">
          <div className="filters-header">
            <span className="filter-section-title">Filters</span>
            {activeFilterCount > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                Clear all ({activeFilterCount})
              </button>
            )}
          </div>

          {filtersLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 60 }} />
              ))}
            </div>
          ) : filterDefs.length === 0 ? (
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              No filters available
            </p>
          ) : (
            filterDefs.map((filterDef) => (
              <FilterSection
                key={filterDef.key}
                filterDef={filterDef}
                activeFilters={activeFilters}
                onCheckbox={toggleCheckboxFilter}
                onRange={setRangeFilter}
              />
            ))
          )}
        </div>

        {/* Results */}
        <div className="search-results">
          <div className="sort-bar">
            <span className="sort-label">Sort by:</span>
            <div className="sort-options">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`sort-btn${sort === opt.value ? " active" : ""}`}
                  onClick={() => {
                    setSort(opt.value);
                    setPage(1);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {pagination && (
              <span className="results-count">
                {pagination.total} result{pagination.total !== 1 ? "s" : ""}
              </span>
            )}
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
          ) : results.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">⊘</div>
              <h3>No products found</h3>
              <p>Try adjusting your search or clearing filters</p>
              <button
                className="btn btn-secondary"
                style={{ marginTop: 16 }}
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {results.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              {pagination && pagination.pages > 1 && (
                <Pagination
                  current={page}
                  total={pagination.pages}
                  onChange={setPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Filter Section
const FilterSection = ({ filterDef, activeFilters, onCheckbox, onRange }) => {
  const { key, label, type, options, min, max, unit } = filterDef;
  const current = activeFilters[key];

  if (type === "multiselect" && options?.length > 0) {
    return (
      <div className="filter-section">
        <div className="filter-section-title">{label}</div>
        {options.slice(0, 8).map((opt) => (
          <label key={opt.value} className="filter-option">
            <input
              type="checkbox"
              checked={Array.isArray(current) && current.includes(opt.value)}
              onChange={() => onCheckbox(key, opt.value)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    );
  }

  if (type === "range") {
    return (
      <div className="filter-section">
        <div className="filter-section-title">
          {label}
          {unit && (
            <span
              style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem" }}
            >
              {" "}
              ({unit})
            </span>
          )}
        </div>
        <div className="range-inputs">
          <input
            className="range-input"
            type="number"
            placeholder={`Min${min !== undefined ? ` (${min})` : ""}`}
            value={current?.min || ""}
            onChange={(e) => onRange(key, "min", e.target.value)}
          />
          <input
            className="range-input"
            type="number"
            placeholder={`Max${max !== undefined ? ` (${max})` : ""}`}
            value={current?.max || ""}
            onChange={(e) => onRange(key, "max", e.target.value)}
          />
        </div>
      </div>
    );
  }

  return null;
};

// Product Card
const ProductCard = ({ product }) => {
  const attrDefs = product.category?.attributes || [];
  const topAttrs = attrDefs
    .filter((d) => product.attributes?.[d.key] !== undefined)
    .slice(0, 3);

  return (
    <Link to={`/products/${product.slug}`} className="product-card">
      <div className="product-card-img">
        {product.thumbnail ? (
          <img src={product.thumbnail} alt={product.name} />
        ) : (
          <span>{product.category?.icon || "📦"}</span>
        )}
      </div>
      <div className="product-card-body">
        <div className="product-card-category">{product.category?.name}</div>
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
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(product.price)}
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
};

// Pagination
const Pagination = ({ current, total, onChange }) => {
  const pages = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - 2 && i <= current + 2)) {
      pages.push(i);
    }
  }
  return (
    <div className="pagination">
      <button
        className="page-btn"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
      >
        ‹
      </button>
      {pages.map((p, i) => {
        const prev = pages[i - 1];
        return (
          <React.Fragment key={p}>
            {prev && p - prev > 1 && (
              <span style={{ color: "var(--text-muted)", padding: "0 4px" }}>
                …
              </span>
            )}
            <button
              className={`page-btn${p === current ? " active" : ""}`}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          </React.Fragment>
        );
      })}
      <button
        className="page-btn"
        disabled={current === total}
        onClick={() => onChange(current + 1)}
      >
        ›
      </button>
    </div>
  );
};

export default SearchPage;
