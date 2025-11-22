const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  quantity: { type: Number, default: 0 } // Physical count at this specific shelf
});
// Ensure one record per Product-Location pair
StockSchema.index({ product: 1, location: 1 }, { unique: true });

module.exports = mongoose.model('Stock', StockSchema);