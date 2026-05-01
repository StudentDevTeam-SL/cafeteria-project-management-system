import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMenu, CATEGORIES } from '../services/mockApi.js';
import MenuCard from '../components/MenuCard.jsx';
import { MenuCardSkeleton } from '../components/SkeletonCard.jsx';
import { useToastCtx } from '../routes/AppRouter.jsx';

export default function MenuPage() {
  const toast = useToastCtx();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const activeCategory = searchParams.get('category') || 'All';

  useEffect(() => {
    getMenu().then(setItems).finally(() => setLoading(false));
  }, []);

  const setCategory = (cat) => {
    if (cat === 'All') setSearchParams({});
    else setSearchParams({ category: cat });
  };

  const filtered = useMemo(() => {
    let list = items;
    if (activeCategory !== 'All') list = list.filter((i) => i.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    return list;
  }, [items, activeCategory, search]);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Menu</h1>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `${filtered.length} item${filtered.length !== 1 ? 's' : ''} available`}
          </p>
        </div>

        {/* Search */}
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            id="menu-search-input"
            type="search"
            placeholder="Search menu…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search menu items"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="category-pills" style={{ marginBottom: '28px' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            id={`cat-pill-${cat.toLowerCase()}`}
            className={`pill${activeCategory === cat ? ' active' : ''}`}
            onClick={() => setCategory(cat)}
            aria-pressed={activeCategory === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid-auto">
          {Array.from({ length: 8 }).map((_, i) => <MenuCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No items found</h3>
          <p>Try a different category or search term.</p>
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setCategory('All'); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid-auto">
          {filtered.map((item) => (
            <MenuCard key={item.id} item={item} toast={toast} />
          ))}
        </div>
      )}
    </div>
  );
}
