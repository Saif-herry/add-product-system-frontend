import React, { useState } from 'react';

/**
 * DynamicField
 * Renders a form input based on the attribute definition from the Category API.
 *
 * Supported types: text | number | select | multiselect | boolean | range
 *
 * Props:
 *   attrDef  — { key, label, type, options, unit, required }
 *   value    — current field value
 *   onChange — (key, value) => void
 *   error    — error string or null
 */
const DynamicField = ({ attrDef, value, onChange, error }) => {
  const { key, label, type, options = [], unit, required } = attrDef;

  const handleChange = (val) => onChange(key, val);

  const renderInput = () => {
    switch (type) {
      case 'text':
        return (
          <input
            className={`form-input${error ? ' error' : ''}`}
            type="text"
            placeholder={`Enter ${label.toLowerCase()}${unit ? ` (${unit})` : ''}`}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
          />
        );

      case 'number':
        return (
          <input
            className={`form-input${error ? ' error' : ''}`}
            type="number"
            placeholder={`Enter ${label.toLowerCase()}`}
            value={value || ''}
            onChange={(e) =>
              handleChange(e.target.value === '' ? '' : Number(e.target.value))
            }
          />
        );

      case 'select':
        return (
          <select
            className={`form-select${error ? ' error' : ''}`}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
          >
            <option value="">Select {label}</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <MultiSelectField
            options={options}
            value={Array.isArray(value) ? value : []}
            onChange={handleChange}
          />
        );

      case 'boolean':
        return (
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {['Yes', 'No'].map((opt) => (
              <label
                key={opt}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <input
                  type="radio"
                  name={key}
                  value={opt === 'Yes' ? 'true' : 'false'}
                  checked={String(value) === (opt === 'Yes' ? 'true' : 'false')}
                  onChange={() => handleChange(opt === 'Yes')}
                  style={{ accentColor: 'var(--accent)' }}
                />
                {opt}
              </label>
            ))}
          </div>
        );

      case 'range':
        return (
          <div className="range-inputs">
            <input
              className="range-input"
              type="number"
              placeholder="Min"
              value={value?.min || ''}
              onChange={(e) =>
                handleChange({ ...value, min: Number(e.target.value) })
              }
            />
            <input
              className="range-input"
              type="number"
              placeholder="Max"
              value={value?.max || ''}
              onChange={(e) =>
                handleChange({ ...value, max: Number(e.target.value) })
              }
            />
          </div>
        );

      default:
        return (
          <input
            className="form-input"
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
          />
        );
    }
  };

  return (
    <div className="form-group dynamic-field">
      <label className="form-label">
        {label}
        {required && <span className="required">*</span>}
        {unit && <span className="unit">{unit}</span>}
      </label>
      {renderInput()}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
};

// ── Multi-select pill UI ──────────────────────────────────────────
const MultiSelectField = ({ options, value, onChange }) => {
  const toggle = (opt) => {
    const next = value.includes(opt)
      ? value.filter((v) => v !== opt)
      : [...value, opt];
    onChange(next);
  };

  return (
    <div className="multiselect-grid">
      {options.map((opt) => (
        <label key={opt} className={`multiselect-option${value.includes(opt) ? ' selected' : ''}`}>
          <input
            type="checkbox"
            checked={value.includes(opt)}
            onChange={() => toggle(opt)}
          />
          {value.includes(opt) && <span style={{ fontSize: '10px' }}>✓</span>}
          {opt}
        </label>
      ))}
    </div>
  );
};

export default DynamicField;
