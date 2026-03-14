import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productAPI } from '../../api';
import './ProductDetail.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    setLoading(true);
    productAPI
      .getBySlug(slug)
      .then((res) => {
        setProduct(res.data);
        // Set default tab to first available section
        const firstSection = res.data.categoryDefinition?.detailSections?.[0];
        setActiveTab(firstSection || 'specifications');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSkeleton />;
  if (error) return (
    <div className="page-container">
      <div className="alert alert-danger">✕ {error}</div>
    </div>
  );
  if (!product) return null;

  const category = product.categoryDefinition;
  const sections = category?.detailSections || ['specifications'];
  const attrDefs = category?.attributes || [];

  // Build attribute display pairs: [{ label, value, unit }]
  const attrPairs = attrDefs
    .filter((def) => {
      const val = product.attributes?.[def.key];
      return val !== undefined && val !== null && val !== '';
    })
    .map((def) => ({
      label: def.label,
      value: formatAttrValue(product.attributes[def.key], def),
      unit: def.unit,
    }));

  const renderTabContent = () => {
    switch (activeTab) {
      case 'highlights':
        return product.highlights?.length > 0 ? (
          <ul className="highlights-ul">
            {product.highlights.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No highlights available.</p>
        );

      case 'specifications':
        return attrPairs.length > 0 ? (
          <table className="spec-table">
            <tbody>
              {attrPairs.map(({ label, value, unit }) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{value}{unit ? ` ${unit}` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No specifications available.</p>
        );

      case 'description':
        return product.description ? (
          <p className="product-description">{product.description}</p>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No description available.</p>
        );

      default:
        return null;
    }
  };

  return (
    <div className="page-container animate-in">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Products</Link>
        <span>›</span>
        <Link to={`/?category=${category?.slug}`}>{category?.name}</Link>
        <span>›</span>
        <span>{product.name}</span>
      </div>

      <div className="detail-layout">
        {/* Image */}
        <div className="detail-img-area">
          {product.thumbnail ? (
            <img src={product.thumbnail} alt={product.name} />
          ) : (
            <span>{category?.icon || '📦'}</span>
          )}
        </div>

        {/* Info */}
        <div className="detail-info">
          <div className="detail-category">{category?.name}</div>
          <h1 className="detail-name">{product.name}</h1>
          <div className="detail-price">{formatPrice(product.price)}</div>

          {/* Quick attribute chips */}
          <div className="detail-attr-chips">
            {attrPairs.slice(0, 4).map(({ label, value }) => (
              <div key={label} className="detail-attr-chip">
                <span className="chip-label">{label}</span>
                <span className="chip-value">{value}</span>
              </div>
            ))}
          </div>

          {/* Stock */}
          <div className="detail-stock">
            {product.stock > 0 ? (
              <span className="badge badge-success">✓ In Stock ({product.stock} units)</span>
            ) : (
              <span className="badge badge-danger">Out of Stock</span>
            )}
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="detail-tags">
              {product.tags.map((t) => (
                <span key={t} className="tag-chip">{t}</span>
              ))}
            </div>
          )}

          <div className="detail-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate(`/products/${slug}/edit`)}>
              Edit Product
            </button>
            <Link to="/" className="btn btn-secondary btn-lg">← Back</Link>
          </div>

          {/* Dynamic Tabs — driven by category.detailSections */}
          <div className="detail-tabs-section">
            <div className="detail-tabs">
              {sections.map((section) => (
                <button
                  key={section}
                  className={`detail-tab${activeTab === section ? ' active' : ''}`}
                  onClick={() => setActiveTab(section)}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </div>
            <div className="detail-tab-content fade-in" key={activeTab}>
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Helpers ────────────────────────────────────────────────────────
function formatAttrValue(val, def) {
  if (Array.isArray(val)) return val.join(', ');
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (typeof val === 'object' && val !== null) return `${val.min}–${val.max}`;
  return String(val);
}

// ── Loading skeleton ───────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="page-container">
    <div className="detail-layout">
      <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius-xl)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="skeleton" style={{ height: 16, width: '40%' }} />
        <div className="skeleton" style={{ height: 36, width: '80%' }} />
        <div className="skeleton" style={{ height: 28, width: '30%' }} />
        <div className="skeleton" style={{ height: 80 }} />
        <div className="skeleton" style={{ height: 120 }} />
      </div>
    </div>
  </div>
);

export default ProductDetail;
