import { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Tag, Plus, Trash2, Upload, Image as ImageIcon, X } from 'lucide-react';

export default function ProductModal({ isOpen, onClose, onSave, product = null, categories = [] }) {
  const isEditing = !!product;
  const fileInputRef = useRef(null);

  const DEFAULT_CATEGORIES = [
    'Washing Machines',
    'Finishing Equipment',
    'Dry Cleaning Machines',
    'Laundry Chemicals',
    'Spare Parts & Accessories',
  ];

  const categoryOptions = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...categories.filter(Boolean)])
  );

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    customCategory: '',
    price: '',
    originalPrice: '',
    badge: '',
    image: '',
    description: '',
    specifications: [{ key: '', value: '' }],
  });

  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      const specs = product.specifications && Object.keys(product.specifications).length > 0
        ? Object.entries(product.specifications).map(([key, value]) => ({ key, value }))
        : [{ key: '', value: '' }];

      const isPreset = categoryOptions.includes(product.category);

      setFormData({
        name: product.name || '',
        category: isPreset ? product.category : (product.category ? 'Other' : ''),
        customCategory: isPreset ? '' : (product.category || ''),
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        badge: product.badge || '',
        image: product.image || '',
        description: product.description || '',
        specifications: specs,
      });
      setImagePreview(product.image || '');
    } else {
      setFormData({
        name: '',
        category: categoryOptions[0] || 'Washing Machines',
        customCategory: '',
        price: '',
        originalPrice: '',
        badge: '',
        image: '',
        description: '',
        specifications: [{ key: '', value: '' }],
      });
      setImagePreview('');
    }
    setError('');
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'image') {
      setImagePreview(value);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setFormData((prev) => ({ ...prev, image: dataUrl }));
      setImagePreview(dataUrl);
      setError('');
    };
    reader.onerror = () => {
      setError('Failed to read selected image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }));
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData((prev) => ({ ...prev, specifications: newSpecs }));
  };

  const addSpecRow = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }],
    }));
  };

  const removeSpecRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Product Name is required.');
      return;
    }

    const selectedCategory = formData.category === 'Other'
      ? formData.customCategory.trim()
      : formData.category.trim();

    if (!selectedCategory) {
      setError('Please select or specify a Category.');
      return;
    }

    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      setError('Please enter a valid price.');
      return;
    }

    const specsObj = {};
    formData.specifications.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specsObj[s.key.trim()] = s.value.trim();
      }
    });

    const payload = {
      name: formData.name.trim(),
      category: selectedCategory,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : Number(formData.price),
      badge: formData.badge.trim() || null,
      image: formData.image.trim() || 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&auto=format&fit=crop&q=80',
      description: formData.description.trim(),
      specifications: specsObj,
    };

    try {
      setSubmitting(true);
      setError('');
      await onSave(payload, product ? (product.id || product._id) : null);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Tag size={18} color="var(--color-primary)" />
          <span>{isEditing ? 'Edit Product Details' : 'Add New Product'}</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && (
          <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-dimmed)', marginBottom: '0.3rem' }}>
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Washer Extractor 50kg"
              required
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', background: '#1e2030', border: '1px solid var(--color-border)', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-dimmed)', marginBottom: '0.3rem' }}>
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', background: '#1e2030', border: '1px solid var(--color-border)', color: '#fff' }}
            >
              <option value="" disabled>Select a Category...</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="Other">+ Add Custom Category</option>
            </select>

            {formData.category === 'Other' && (
              <input
                type="text"
                name="customCategory"
                value={formData.customCategory}
                onChange={handleChange}
                placeholder="Enter custom category name..."
                required
                style={{ width: '100%', marginTop: '0.5rem', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', background: '#1e2030', border: '1px solid var(--color-border)', color: '#fff' }}
              />
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-dimmed)', marginBottom: '0.3rem' }}>
              Price (₹) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g. 450000"
              required
              min="0"
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', background: '#1e2030', border: '1px solid var(--color-border)', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-dimmed)', marginBottom: '0.3rem' }}>
              Original Price (₹)
            </label>
            <input
              type="number"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleChange}
              placeholder="e.g. 480000"
              min="0"
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', background: '#1e2030', border: '1px solid var(--color-border)', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-dimmed)', marginBottom: '0.3rem' }}>
              Badge (Optional)
            </label>
            <input
              type="text"
              name="badge"
              value={formData.badge}
              onChange={handleChange}
              placeholder="e.g. Best Seller / New"
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', background: '#1e2030', border: '1px solid var(--color-border)', color: '#fff' }}
            />
          </div>
        </div>

        {/* Product Image Section: File Upload + Image URL + Live Preview */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-dimmed)', marginBottom: '0.3rem' }}>
            Product Image
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.5rem 0.8rem' }}
                >
                  <Upload size={15} /> Upload Image File
                </Button>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-dimmed)' }}>or enter URL below</span>
              </div>

              <input
                type="text"
                name="image"
                value={formData.image.startsWith('data:image/') ? '[Uploaded File Selected]' : formData.image}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', background: '#1e2030', border: '1px solid var(--color-border)', color: '#fff', fontSize: '0.85rem' }}
              />
            </div>

            {/* Preview Thumbnail */}
            {imagePreview ? (
              <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--color-border)', background: '#1e2030', flexShrink: 0 }}>
                <img
                  src={imagePreview}
                  alt="Product preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="%231e2030"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="sans-serif" font-size="10">Invalid URL</text></svg>';
                  }}
                />
                <button
                  type="button"
                  onClick={handleClearImage}
                  style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', color: '#fff', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Remove Image"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--color-border)', background: '#1e2030', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-dimmed)', flexShrink: 0 }}>
                <ImageIcon size={24} style={{ opacity: 0.5 }} />
                <span style={{ fontSize: '0.65rem', marginTop: '0.2rem' }}>No image</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-dimmed)', marginBottom: '0.3rem' }}>
            Description
          </label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed description of the product..."
            style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', background: '#1e2030', border: '1px solid var(--color-border)', color: '#fff', resize: 'vertical' }}
          />
        </div>

        {/* Dynamic Specifications */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-dimmed)' }}>
              Specifications
            </label>
            <Button
              type="button"
              variant="secondary"
              onClick={addSpecRow}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
            >
              <Plus size={13} /> Add Spec
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
            {formData.specifications.map((spec, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Feature (e.g. Capacity)"
                  value={spec.key}
                  onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                  style={{ flex: 1, padding: '0.45rem 0.65rem', borderRadius: 'var(--radius-sm)', background: '#1e2030', border: '1px solid var(--color-border)', color: '#fff', fontSize: '0.825rem' }}
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 50 kg)"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                  style={{ flex: 1, padding: '0.45rem 0.65rem', borderRadius: 'var(--radius-sm)', background: '#1e2030', border: '1px solid var(--color-border)', color: '#fff', fontSize: '0.825rem' }}
                />
                {formData.specifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSpecRow(index)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '0.25rem' }}
                    title="Remove specification"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.85rem' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Update Product' : 'Add Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
