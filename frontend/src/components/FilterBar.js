import React from 'react';
import './FilterBar.css';

const filters = [
  { key: 'newest', icon: '🕐', label: 'Newest' },
  { key: 'most_liked', icon: '👍', label: 'Most Liked' },
  { key: 'most_commented', icon: '💬', label: 'Most Commented' },
  { key: 'most_shared', icon: '🔗', label: 'Most Shared' }
];

const FilterBar = ({ activeFilter, onFilterChange }) => {
  return (
    <div className="filter-bar">
      {filters.map((f) => (
        <button
          key={f.key}
          className={`filter-pill ${activeFilter === f.key ? 'active' : ''}`}
          onClick={() => onFilterChange(f.key)}
        >
          <span className="filter-pill-icon">{f.icon}</span>
          <span className="filter-pill-label">{f.label}</span>
        </button>
      ))}
    </div>
  );
};

export default FilterBar;
