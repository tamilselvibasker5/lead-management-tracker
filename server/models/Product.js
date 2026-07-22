import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    rating: { type: Number, default: 5 },
    reviews: { type: Number, default: 0 },
    image: { type: String, required: true },
    description: { type: String, default: '' },
    badge: { type: String, default: null },
    specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);
