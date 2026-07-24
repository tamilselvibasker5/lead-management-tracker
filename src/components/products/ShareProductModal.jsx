import { useState, useEffect, useMemo } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { MessageCircle, Mail, User, Phone, CheckCircle2, Send, ExternalLink, Sparkles } from 'lucide-react';
import './ShareProductModal.css';

/**
 * Modal component for sharing a product's details with a lead via WhatsApp or Email.
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   product: object|null,
 *   leads: object[],
 *   onAddActivity: (leadId: string, activity: object) => Promise<void>
 * }} props
 */
export default function ShareProductModal({ isOpen, onClose, product, leads = [], onAddActivity }) {
  const { user } = useAuth();
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [message, setMessage] = useState('');
  const [sentSuccessMsg, setSentSuccessMsg] = useState('');

  // Selected lead object
  const selectedLead = useMemo(() => {
    return leads.find((l) => l.id === selectedLeadId || l._id === selectedLeadId) || null;
  }, [leads, selectedLeadId]);

  // Set initial selected lead and message when product changes
  useEffect(() => {
    if (product) {
      if (leads.length > 0 && !selectedLeadId) {
        setSelectedLeadId(leads[0].id || leads[0]._id);
      }
      setSentSuccessMsg('');
    }
  }, [product, leads, selectedLeadId]);

  // Auto-generate formatted message text when lead or product changes
  useEffect(() => {
    if (!product) return;

    const leadName = selectedLead ? selectedLead.name : (customName.trim() || 'Valued Customer');
    const priceFormatted = Number(product.price).toLocaleString('en-IN');

    let specsText = '';
    if (product.specifications && Object.keys(product.specifications).length > 0) {
      specsText = '\n\n*Key Specifications:*\n' + Object.entries(product.specifications)
        .slice(0, 4)
        .map(([k, v]) => `• ${k}: ${v}`)
        .join('\n');
    }

    const defaultMsg = `Hello ${leadName},

I wanted to share this product details with you:

📌 *${product.name}*
🏷️ Category: ${product.category || 'N/A'}
💰 Price: ₹${priceFormatted}

${product.description || ''}${specsText}

Feel free to reply if you have any questions or would like to request a quote!

Best regards,
${user?.name || 'Lead Tracker Team'}`;

    setMessage(defaultMsg);
  }, [product, selectedLead, customName, user?.name]);

  if (!isOpen || !product) return null;

  // Recipient details
  const recipientPhone = selectedLead ? (selectedLead.phone || '') : customPhone;
  const recipientEmail = selectedLead ? (selectedLead.email || '') : customEmail;
  const recipientName = selectedLead ? selectedLead.name : (customName || 'Customer');

  // Format phone number for WhatsApp wa.me (remove spaces, symbols)
  const formatWhatsAppPhone = (phoneStr) => {
    if (!phoneStr) return '';
    let cleaned = phoneStr.replace(/\D/g, '');
    // If 10 digits (Indian local), prepend country code 91
    if (cleaned.length === 10) {
      cleaned = `91${cleaned}`;
    }
    return cleaned;
  };

  /* ── Share via WhatsApp ── */
  const handleShareWhatsApp = async () => {
    const rawPhone = recipientPhone;
    const formattedPhone = formatWhatsAppPhone(rawPhone);

    const waUrl = formattedPhone
      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // Log Activity to Lead timeline if a lead is selected
    if (selectedLead && onAddActivity) {
      try {
        await onAddActivity(selectedLead.id || selectedLead._id, {
          type: 'note',
          note: `Shared product "${product.name}" via WhatsApp.`,
          authorName: user?.name || 'System',
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        console.error('Failed to log activity:', e);
      }
    }

    setSentSuccessMsg(`Product shared via WhatsApp with ${recipientName}! Activity logged.`);
  };

  /* ── Share via Email ── */
  const handleShareEmail = async () => {
    const subject = `Product Details: ${product.name}`;
    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

    window.open(mailtoUrl, '_self');

    // Log Activity to Lead timeline if a lead is selected
    if (selectedLead && onAddActivity) {
      try {
        await onAddActivity(selectedLead.id || selectedLead._id, {
          type: 'note',
          note: `Shared product "${product.name}" via Email.`,
          authorName: user?.name || 'System',
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        console.error('Failed to log activity:', e);
      }
    }

    setSentSuccessMsg(`Product shared via Email with ${recipientName}! Activity logged.`);
  };

  const footer = (
    <Button variant="secondary" onClick={onClose}>
      Close
    </Button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="var(--color-primary)" />
          <span>Share Product with Lead</span>
        </div>
      }
      footer={footer}
    >
      <div className="share-product-modal">
        {/* Product Preview Header */}
        <div className="share-product-modal__product-card">
          <img
            src={product.image}
            alt={product.name}
            className="share-product-modal__product-thumb"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><rect width="60" height="60" fill="%231e2030"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="sans-serif" font-size="10">Product</text></svg>';
            }}
          />
          <div className="share-product-modal__product-info">
            <div className="share-product-modal__product-category">{product.category}</div>
            <div className="share-product-modal__product-title" title={product.name}>{product.name}</div>
            <div className="share-product-modal__product-price">₹{Number(product.price).toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Lead Selection */}
        <div className="share-product-modal__section">
          <label className="share-product-modal__label">
            <User size={14} /> Select Lead Recipient
          </label>
          <select
            className="share-product-modal__select"
            value={selectedLeadId}
            onChange={(e) => {
              setSelectedLeadId(e.target.value);
              setSentSuccessMsg('');
            }}
          >
            {leads.length > 0 ? (
              leads.map((l) => (
                <option key={l.id || l._id} value={l.id || l._id}>
                  {l.name} — {l.phone || l.email || 'No contact info'} ({l.location || 'N/A'})
                </option>
              ))
            ) : (
              <option value="">No leads available (Custom Recipient)</option>
            )}
            <option value="custom">＋ Enter Custom Recipient Details...</option>
          </select>

          {/* If custom recipient option selected or no leads */}
          {selectedLeadId === 'custom' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem', marginTop: '0.4rem' }}>
              <input
                type="text"
                className="share-product-modal__input"
                placeholder="Recipient Name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
              <input
                type="tel"
                className="share-product-modal__input"
                placeholder="Phone Number (for WhatsApp)"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
              />
              <input
                type="email"
                className="share-product-modal__input"
                placeholder="Email Address"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
              />
            </div>
          )}

          {/* Lead Contact Info Pill */}
          {selectedLead && (
            <div className="share-product-modal__lead-details">
              <div><strong>Lead Name:</strong> {selectedLead.name}</div>
              <div><strong>Phone:</strong> {selectedLead.phone || 'N/A'}</div>
              <div><strong>Email:</strong> {selectedLead.email || 'N/A'}</div>
              <div><strong>Location:</strong> {selectedLead.location || 'N/A'}</div>
            </div>
          )}
        </div>

        {/* Message Content Customization */}
        <div className="share-product-modal__section">
          <label className="share-product-modal__label">
            <Send size={14} /> Message Content Preview
          </label>
          <textarea
            className="share-product-modal__textarea"
            rows={7}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {/* Success Alert */}
        {sentSuccessMsg && (
          <div className="share-product-modal__alert">
            <CheckCircle2 size={16} />
            <span>{sentSuccessMsg}</span>
          </div>
        )}

        {/* Share Action Buttons */}
        <div className="share-product-modal__actions">
          <button
            type="button"
            className="share-btn-whatsapp"
            onClick={handleShareWhatsApp}
          >
            <MessageCircle size={18} /> Share via WhatsApp
          </button>
          <button
            type="button"
            className="share-btn-email"
            onClick={handleShareEmail}
          >
            <Mail size={18} /> Share via Email
          </button>
        </div>
      </div>
    </Modal>
  );
}
