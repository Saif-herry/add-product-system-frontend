import React, { useState, useEffect } from 'react';
import { categoryAPI } from '../../api';
import './Categories.css';

const ATTR_TYPES = ['text', 'number', 'select', 'multiselect', 'boolean', 'range'];

const emptyAttr = () => ({
  key: '', label: '', type: 'text', options: [], unit: '',
  required: false, filterable: true, sortOrder: 0,
});

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  const [form, setForm] = useState({
    name: '', description: '', icon: '',
    detailSections: ['highlights', 'specifications', 'description'],
    attributes: [emptyAttr()],
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    setLoading(true);
    categoryAPI.getAll()
      .then((res) => setCategories(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleAttrChange = (i, field, value) => {
    const attrs = [...form.attributes];
    attrs[i] = { ...attrs[i], [field]: value };
    setForm((f) => ({ ...f, attributes: attrs }));
  };

  const addAttr = () =>
    setForm((f) => ({ ...f, attributes: [...f.attributes, { ...emptyAttr(), sortOrder: f.attributes.length }] }));

  const removeAttr = (i) =>
    setForm((f) => ({ ...f, attributes: f.attributes.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setResult(null);
    try {
      await categoryAPI.create({
        ...form,
        slug: form.name.toLowerCase().replace(/\s+/g, '-'),
        attributes: form.attributes.filter((a) => a.key && a.label),
      });
      setResult({ type: 'success', msg: `Category "${form.name}" created!` });
      setShowForm(false);
      setForm({ name: '', description: '', icon: '', detailSections: ['highlights', 'specifications', 'description'], attributes: [emptyAttr()] });
      loadCategories();
    } catch (err) {
      setResult({ type: 'error', msg: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Categories</h1>
          <p>Define categories and their dynamic attribute schemas</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? '✕ Cancel' : '+ New Category'}
        </button>
      </div>

      {result && (
        <div className={`alert alert-${result.type === 'success' ? 'success' : 'danger'}`} style={{ marginBottom: 20 }}>
          {result.msg}
        </div>
      )}

      {/* ── Create Category Form ───────────────────────────── */}
      {showForm && (
        <div className="card fade-in" style={{ marginBottom: 24 }}>
          <div className="card-title">New Category</div>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Name <span className="required">*</span></label>
                <input className="form-input" required value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Watches" />
              </div>
              <div className="form-group">
                <label className="form-label">Icon (emoji)</label>
                <input className="form-input" value={form.icon}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="⌚" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Short description" />
            </div>

            <div className="section-label">Attribute Definitions</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              These define the fields shown in the Add Product form for this category.
              No frontend changes needed — the UI reads these dynamically.
            </p>

            {form.attributes.map((attr, i) => (
              <div key={i} className="attr-def-row">
                <div className="attr-def-grid">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Key</label>
                    <input className="form-input" value={attr.key} placeholder="ram"
                      onChange={(e) => handleAttrChange(i, 'key', e.target.value.toLowerCase().replace(/\s+/g, '_'))} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Label</label>
                    <input className="form-input" value={attr.label} placeholder="RAM"
                      onChange={(e) => handleAttrChange(i, 'label', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Type</label>
                    <select className="form-select" value={attr.type}
                      onChange={(e) => handleAttrChange(i, 'type', e.target.value)}>
                      {ATTR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Unit</label>
                    <input className="form-input" value={attr.unit} placeholder="GB"
                      onChange={(e) => handleAttrChange(i, 'unit', e.target.value)} />
                  </div>
                </div>

                {(attr.type === 'select' || attr.type === 'multiselect') && (
                  <div className="form-group" style={{ marginTop: 8, marginBottom: 0 }}>
                    <label className="form-label">Options (comma-separated)</label>
                    <input className="form-input" placeholder="4GB, 8GB, 16GB"
                      value={attr.options.join(', ')}
                      onChange={(e) => handleAttrChange(i, 'options', e.target.value.split(',').map((o) => o.trim()).filter(Boolean))} />
                  </div>
                )}

                <div className="attr-def-flags">
                  <label className="flag-check">
                    <input type="checkbox" checked={attr.required}
                      onChange={(e) => handleAttrChange(i, 'required', e.target.checked)} />
                    Required
                  </label>
                  <label className="flag-check">
                    <input type="checkbox" checked={attr.filterable}
                      onChange={(e) => handleAttrChange(i, 'filterable', e.target.checked)} />
                    Filterable
                  </label>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeAttr(i)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button type="button" className="btn btn-ghost btn-sm" onClick={addAttr} style={{ marginBottom: 20 }}>
              + Add Attribute
            </button>

            <div className="divider" />
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Create Category'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Category List ──────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 80 }} />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⊞</div>
          <h3>No categories yet</h3>
          <p>Create your first category to get started</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {categories.map((cat) => (
            <div key={cat._id} className="card category-card">
              <div className="category-card-icon">{cat.icon || '📁'}</div>
              <div className="category-card-info">
                <div className="category-card-name">{cat.name}</div>
                {cat.description && <div className="category-card-desc">{cat.description}</div>}
              </div>
              <div className="category-card-slug">/{cat.slug}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
