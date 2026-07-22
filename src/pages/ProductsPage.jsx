import { useState, useEffect, useMemo } from 'react';
import { fetchProducts } from '../services/api';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { Search, Filter, ShoppingBag, Tag, Star, Eye } from 'lucide-react';
import './ProductsPage.css';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matches =
          (p.name && p.name.toLowerCase().includes(term)) ||
          (p.category && p.category.toLowerCase().includes(term)) ||
          (p.description && p.description.toLowerCase().includes(term));
        if (!matches) return false;
      }
      return true;
    });
  }, [products, categoryFilter, searchTerm]);

  return (
    <div className="products-page">
      {/* Header */}
      <div className="products-page__header">
        <div>
          <h2 className="products-page__title">Product Catalog</h2>
          <p className="products-page__subtitle">
            Explore commercial laundry machines, finishing equipment, chemicals, and genuine spare parts.
          </p>
        </div>
      </div>

      {/* Controls / Filters */}
      <div className="products-page__controls">
        <div className="products-page__search-wrapper">
          <Search size={18} className="products-page__search-icon" />
          <input
            type="text"
            className="products-page__search-input"
            placeholder="Search products by name, model or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="products-page__filter-wrapper">
          <Filter size={16} color="var(--color-primary)" />
          <select
            className="products-page__category-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div style={{ padding: '2rem', color: 'var(--color-danger)', textAlign: 'center' }}>
          {error}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="products-page__empty">
          <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>No products found</h3>
          <p>Try adjusting your search criteria or category filter.</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product.id || product._id} className="product-card">
              {product.badge && <span className="product-card__badge">{product.badge}</span>}
              <div className="product-card__image-container">
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-card__image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%231e2030"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="sans-serif" font-size="14">Product Image</text></svg>';
                  }}
                />
              </div>

              <div className="product-card__content">
                <span className="product-card__category">{product.category}</span>
                <h3 className="product-card__name" title={product.name}>
                  {product.name}
                </h3>
                <p className="product-card__description">{product.description || 'No description available.'}</p>

                <div className="product-card__footer">
                  <div className="product-card__price-wrapper">
                    <span className="product-card__price">
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="product-card__original-price">
                        ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="secondary"
                    className="product-card__view-btn"
                    onClick={() => setSelectedProduct(product)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem' }}
                  >
                    <Eye size={15} /> View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Tag size={18} color="var(--color-primary)" />
              <span>{selectedProduct.name}</span>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ width: '100%', maxHeight: '250px', display: 'flex', justifyContent: 'center', overflow: 'hidden', borderRadius: 'var(--radius-md)', background: '#1e2030' }}>
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                style={{ maxHeight: '250px', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%231e2030"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="sans-serif" font-size="14">Product Image</text></svg>';
                }}
              />
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {selectedProduct.category}
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.2rem 0 0.5rem 0', color: 'var(--color-text)' }}>
                {selectedProduct.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-success)' }}>
                  ₹{Number(selectedProduct.price).toLocaleString('en-IN')}
                </span>
                {selectedProduct.rating && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: '#f59e0b' }}>
                    <Star size={14} fill="#f59e0b" /> {selectedProduct.rating} ({selectedProduct.reviews || 0} reviews)
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                {selectedProduct.description}
              </p>
            </div>

            {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
                  Specifications
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem' }}>
                  {Object.entries(selectedProduct.specifications).map(([key, val]) => (
                    <div key={key} style={{ background: '#1e2030', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-dimmed)', fontWeight: 500 }}>
                        {key}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button variant="secondary" onClick={() => setSelectedProduct(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
