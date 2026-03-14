import React, { useState, useRef } from 'react';

const TagsInput = ({ value = [], onChange, placeholder = 'Add tag, press Enter' }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef();

  const addTag = (tag) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
  };

  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="tags-container" onClick={() => inputRef.current?.focus()}>
      {value.map((tag) => (
        <span key={tag} className="tag-chip">
          {tag}
          <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(tag); }}>
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        className="tags-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input.trim() && addTag(input)}
        placeholder={value.length === 0 ? placeholder : ''}
      />
    </div>
  );
};

export default TagsInput;
