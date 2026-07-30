import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { category: regex }, { description: regex }];
    }

    const products = await Product.find(filter).sort({ id: 1 }).lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ id }).lean();
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products - Create a new product
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    if (!data.name || !data.category || data.price === undefined) {
      return res.status(400).json({ error: 'Name, category, and price are required.' });
    }

    const productId = data.id || `prod_${Date.now()}`;
    const newProduct = new Product({
      id: productId,
      name: data.name,
      category: data.category,
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : Number(data.price),
      rating: data.rating !== undefined ? Number(data.rating) : 5,
      reviews: data.reviews !== undefined ? Number(data.reviews) : 0,
      image: data.image || 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&auto=format&fit=crop&q=80',
      description: data.description || '',
      badge: data.badge || null,
      specifications: data.specifications || {},
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id - Update product details
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.originalPrice !== undefined) updates.originalPrice = Number(updates.originalPrice);
    if (updates.rating !== undefined) updates.rating = Number(updates.rating);
    if (updates.reviews !== undefined) updates.reviews = Number(updates.reviews);

    const updatedProduct = await Product.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

