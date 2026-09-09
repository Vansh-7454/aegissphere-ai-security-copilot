import React from 'react';
import { Search, X } from 'lucide-react';
import './SearchBox.css';

export const SearchBox = ({
  value,
  onChange,
  placeholder = 'Search threats, logs, IPs, or IOCs...',
  onClear,
  showShortcut = true,
  className = '',
  ...props
}) => {
  return (
    <div className={`aegis-search-box ${className}`}>
      <Search size={15} />
      <input
        type="text"
        className="aegis-search-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
      {value ? (
        <button
          type="button"
          className="aegis-search-clear"
          onClick={onClear || (() => onChange({ target: { value: '' } }))}
        >
          <X size={13} />
        </button>
      ) : showShortcut ? (
        <kbd className="aegis-search-kbd">Ctrl K</kbd>
      ) : null}
    </div>
  );
};

export default SearchBox;
