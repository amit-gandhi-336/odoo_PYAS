const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true }, // Displayed in brackets [SKU]
  category: { type: String, required: true },
  unit: { type: String, default: 'Units' },
  price: { type: Number, default: 0 }, // For "per unit cost" column
  minStock: { type: Number, default: 10 },
  
  // Cache for performance (Stock Page "On Hand"):
  totalStock: { type: Number, default: 0 } 
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);