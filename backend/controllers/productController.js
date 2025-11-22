const Product = require('../models/Product');

// @desc    Get All Products (Supports Search)
// @route   GET /api/products?search=desk
exports.getProducts = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    // If search param exists, filter by Name or SKU
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } }, // Case insensitive
          { sku: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Single Product
// @route   GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a Product
// @route   POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const { name, sku, category, unit, price, minStock } = req.body;

    // Check for duplicate SKU
    const productExists = await Product.findOne({ sku });
    if (productExists) {
      return res.status(400).json({ message: 'Product with this SKU already exists' });
    }

    const product = await Product.create({
      name,
      sku,
      category,
      unit,
      price: price || 0,
      minStock: minStock || 10,
      totalStock: 0 // Starts at 0 until we add stock via Operations
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Product
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const { name, category, price, minStock } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.category = category || product.category;
      product.price = price || product.price;
      product.minStock = minStock || product.minStock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};