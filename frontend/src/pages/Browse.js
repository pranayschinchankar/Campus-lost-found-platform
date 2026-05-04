import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import ItemCard from '../components/ItemCard';
import './Browse.css';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Accessories', 'Keys', 'Bags', 'ID/Cards', 'Sports', 'Other'];

const Browse = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ type: '', category: '', search: '' });
  const [searchInput, setSearchInput] = useState('');

  const fetchItems = useCallback(async (page = 1, filterState = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (filterState.type) params.set('type', filterState.type);
      if (filterState.category) params.set('category', filterState.category);
      if (filterState.search) params.set('search', filterState.search);

      const res = await api.get(`/items?${params}`);
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
      setCurrentPage(page);
    } catch (err) {
      console.error('Could not load items');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchItems(1);
  }, []);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchItems(1, newFilters);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newFilters = { ...filters, search: searchInput };
    setFilters(newFilters);
    fetchItems(1, newFilters);
  };

  const clearFilters = () => {
    const reset = { type: '', category: '', search: '' };
    setFilters(reset);
    setSearchInput('');
    fetchItems(1, reset);
  };

  const hasActiveFilters = filters.type || filters.category || filters.search;

  return (
    <div className="browse-page">
      <div className="container">
        <div className="browse-header page-header">
          <div>
            <h1>Browse Items</h1>
            <p>{total} item{total !== 1 ? 's' : ''} found</p>
          </div>
        </div>

        {/* search + filters */}
        <div className="browse-toolbar">
          <form onSubmit={handleSearch} className="search-bar">
            <input
              type="text"
              placeholder="Search by keyword…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <div className="filter-row">
            <div className="filter-group">
              <button
                className={`filter-btn ${!filters.type ? 'active' : ''}`}
                onClick={() => handleFilterChange('type', '')}
              >All</button>
              <button
                className={`filter-btn lost ${filters.type === 'lost' ? 'active-lost' : ''}`}
                onClick={() => handleFilterChange('type', 'lost')}
              >Lost</button>
              <button
                className={`filter-btn found ${filters.type === 'found' ? 'active-found' : ''}`}
                onClick={() => handleFilterChange('type', 'found')}
              >Found</button>
            </div>

            <select
              className="category-select"
              value={filters.category}
              onChange={e => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {hasActiveFilters && (
              <button className="btn btn-ghost" onClick={clearFilters}>Clear filters ✕</button>
            )}
          </div>
        </div>

        {/* results */}
        {loading ? (
          <div className="spinner" />
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🔍</div>
            <h3>No items found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="grid-3 items-grid">
              {items.map(item => <ItemCard key={item.id} item={item} />)}
            </div>

            {/* pagination */}
            {pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`page-btn ${p === currentPage ? 'active' : ''}`}
                    onClick={() => fetchItems(p)}
                  >{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Browse;
