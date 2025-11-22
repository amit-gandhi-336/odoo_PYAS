const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shortCode: { type: String, required: true }, // e.g., "WH" or "SH-A"
  type: { 
    type: String, 
    enum: ['WAREHOUSE', 'VENDOR', 'CUSTOMER', 'INTERNAL'], 
    required: true 
  },
  address: { type: String },
  // Hierarchy support (Shelf A belongs to Main Warehouse):
  parentLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' } 
}, { timestamps: true });

module.exports = mongoose.model('Location', LocationSchema);