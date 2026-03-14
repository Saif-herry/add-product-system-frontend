import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryAPI, productAPI } from '../../api';
import DynamicField from '../../components/common/DynamicField';
import TagsInput from '../../components/common/TagsInput';
import './AddProduct.css';

const AddProduct = () => {
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    thumbnail: '',
    description: '',
    tags: [],
    highlights: [''],
    attributes: {},
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null); // { type: 'success'|'error', msg }

  // ── Load categories on mount ──────────────────────────────────
  useEffect(() => {
    categoryAPI.getAll().then((res) => setCategories(res.data)).catch(console.error);
  }, []);

  // ── Load category attribute definitions when category changes ─
  const handleCategoryChange = useCallback(async (slug) => {
    if (!slug) {
      setSelectedCategory(null);
      setForm((f) => ({ ...f, attributes: {} }));
      return;
    }
    setCategoryLoading(true);
    try {
      const res = await categoryAPI.getBySlug(slug);
      setSelectedCategory(res.data);
      setForm((f) => ({ ...f, attributes: {} }));
      setErrors({});
    } catch (err) {
      console.error(err);
    } finally {
      setCategoryLoading(false);
    }
  }, []);

  // ── Field change handlers ────────────────────────────────────
  const handleField = (key, value) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleAttribute = (key, value) =>
    setForm((f) => ({ ...f, attributes: { ...f.attributes, [key]: value } }));

  // Highlights (bullet points)
  const updateHighlight = (i, val) => {
    const h = [...form.highlights];
    h[i] = val;
    setForm((f) => ({ ...f, highlights: h }));
  };
  const addHighlight = () =>
    setForm((f) => ({ ...f, highlights: [...f.highlights, ''] }));
  const removeHighlight = (i) =>
    setForm((f) => ({ ...f, highlights: f.highlights.filter((_, idx) => idx !== i) }));

  // ── Validation ───────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Product name is required';
    if (!selectedCategory) errs.category = 'Please select a category';
    if (!form.price || Number(form.price) <= 0) errs.price = 'Enter a valid price';

    // Validate required dynamic attributes
    if (selectedCategory) {
      for (const attr of selectedCategory.attributes) {
        if (attr.required) {
          const val = form.attributes[attr.key];
          if (val === undefined || val === null || val === '' ||
              (Array.isArray(val) && val.length === 0)) {
            errs[`attr_${attr.key}`] = `${attr.label} is required`;
          }
        }
      }
    }
    return errs;
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Scroll to first error
      document.querySelector('.form-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    setSubmitResult(null);

    try {
      const payload = {
        name: form.name.trim(),
        category: selectedCategory._id,
        price: Number(form.price),
        stock: Number(form.stock) || 0,
        thumbnail: form.thumbnail.trim(),
        description: form.description.trim(),
        tags: form.tags,
        highlights: form.highlights.filter((h) => h.trim()),
        attributes: form.attributes,
      };

      const res = await productAPI.create(payload);
      setSubmitResult({ type: 'success', msg: 'Product created successfully!' });
      setTimeout(() => navigate(`/products/${res.data.slug}`), 1200);
    } catch (err) {
      setSubmitResult({ type: 'error', msg: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived: show detail sections ───────────────────────────
  const showHighlights = selectedCategory?.detailSections?.includes('highlights');

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <h1>Add Product</h1>
        <p>Fields update dynamically based on the selected category</p>
      </div>

      {submitResult && (
        <div className={`alert alert-${submitResult.type === 'success' ? 'success' : 'danger'} mb-20`}>
          <span>{submitResult.type === 'success' ? '✓' : '✕'}</span>
          {submitResult.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="add-product-grid">

          {/* ─── Left column: core fields ───────────────────── */}
          <div className="add-product-main">

            {/* Basic Info */}
            <div className="card">
              <div className="card-title">Basic Information</div>

              <div className="form-group">
                <label className="form-label">
                  Product Name <span className="required">*</span>
                </label>
                <input
                  className={`form-input${errors.name ? ' error' : ''}`}
                  type="text"
                  placeholder="e.g. Samsung Galaxy S24 Ultra"
                  value={form.name}
                  onChange={(e) => { handleField('name', e.target.value); setErrors((e2) => ({ ...e2, name: null })); }}
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">
                    Price (₹) <span className="required">*</span>
                  </label>
                  <input
                    className={`form-input${errors.price ? ' error' : ''}`}
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => { handleField('price', e.target.value); setErrors((e2) => ({ ...e2, price: null })); }}
                  />
                  {errors.price && <span className="form-error">{errors.price}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Stock</label>
                  <input
                    className="form-input"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={form.stock}
                    onChange={(e) => handleField('stock', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Thumbnail URL</label>
                <input
                  className="form-input"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={form.thumbnail}
                  onChange={(e) => handleField('thumbnail', e.target.value)}
                />
              </div>
            </div>

            {/* Category selector */}
            <div className="card mt-20">
              <div className="card-title">Category</div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Product Category <span className="required">*</span>
                </label>
                <div className="category-selector">
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      className={`category-pill${selectedCategory?.slug === cat.slug ? ' active' : ''}`}
                      onClick={() => { handleCategoryChange(cat.slug); setErrors((e2) => ({ ...e2, category: null })); }}
                    >
                      <span>{cat.icon}</span>
                      {cat.name}
                    </button>
                  ))}
                </div>
                {errors.category && <span className="form-error" style={{ marginTop: 8 }}>{errors.category}</span>}
              </div>
            </div>

            {/* ── Dynamic Attributes ─────────────────────────── */}
            {categoryLoading && (
              <div className="card mt-20">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--text-muted)' }}>
                  <div className="spinner" />
                  Loading {selectedCategory?.name || 'category'} attributes…
                </div>
              </div>
            )}

            {selectedCategory && !categoryLoading && (
              <div className="card mt-20 fade-in">
                <div className="card-title">
                  {selectedCategory.name} Specifications
                  <span className="badge badge-accent" style={{ marginLeft: 8 }}>
                    {selectedCategory.attributes.length} fields
                  </span>
                </div>

                {selectedCategory.attributes.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No attribute definitions for this category yet.
                  </p>
                ) : (
                  <div className="dynamic-fields-grid">
                    {selectedCategory.attributes
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((attrDef) => (
                        <DynamicField
                          key={attrDef.key}
                          attrDef={attrDef}
                          value={form.attributes[attrDef.key]}
                          onChange={(key, val) => {
                            handleAttribute(key, val);
                            setErrors((e2) => ({ ...e2, [`attr_${key}`]: null }));
                          }}
                          error={errors[`attr_${attrDef.key}`]}
                        />
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="card mt-20">
              <div className="card-title">Description</div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <textarea
                  className="form-textarea"
                  placeholder="Detailed product description…"
                  value={form.description}
                  onChange={(e) => handleField('description', e.target.value)}
                  rows={5}
                />
              </div>
            </div>

            {/* Highlights — shown only if category uses them */}
            {showHighlights && (
              <div className="card mt-20 fade-in">
                <div className="card-title">Highlights</div>
                <div className="highlights-list">
                  {form.highlights.map((h, i) => (
                    <div key={i} className="highlight-item">
                      <input
                        className="form-input"
                        type="text"
                        placeholder={`Highlight ${i + 1}`}
                        value={h}
                        onChange={(e) => updateHighlight(i, e.target.value)}
                      />
                      <button type="button" onClick={() => removeHighlight(i)}>×</button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-ghost btn-sm" onClick={addHighlight}>
                    + Add Highlight
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* ─── Right column: tags + submit ────────────────── */}
          <div className="add-product-sidebar">

            <div className="card">
              <div className="card-title">Tags</div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <TagsInput
                  value={form.tags}
                  onChange={(tags) => handleField('tags', tags)}
                  placeholder="Type tag, press Enter"
                />
                <span className="form-hint">Press Enter or comma to add a tag</span>
              </div>
            </div>

            {selectedCategory && (
              <div className="card mt-20 category-summary fade-in">
                <div className="card-title">Category Info</div>
                <div className="category-summary-icon">{selectedCategory.icon}</div>
                <div className="category-summary-name">{selectedCategory.name}</div>
                {selectedCategory.description && (
                  <p className="category-summary-desc">{selectedCategory.description}</p>
                )}
                <div className="divider" style={{ margin: '12px 0' }} />
                <div className="category-summary-sections">
                  {selectedCategory.detailSections?.map((s) => (
                    <span key={s} className="badge badge-default">{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="card mt-20 submit-card">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={submitting}
              >
                {submitting ? (
                  <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Publishing…</>
                ) : (
                  '+ Publish Product'
                )}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: 8 }}
                onClick={() => navigate('/')}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
