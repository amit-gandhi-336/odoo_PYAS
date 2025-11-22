const mongoose = require('mongoose');

const OperationSchema = new mongoose.Schema({
  // Auto-generated: WH/IN/0001 or WH/OUT/0001
  reference: { type: String, required: true, unique: true }, 
  type: { 
    type: String, 
    enum: ['RECEIPT', 'DELIVERY', 'ADJUSTMENT'], 
    required: true 
  },
  // Pipeline statuses from wireframes:
  status: { 
    type: String, 
    enum: ['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELLED'], 
    default: 'DRAFT' 
  },
  // Critical for Dashboard "Late" vs "Operations" cards:
  scheduleDate: { type: Date, default: Date.now },
  
  sourceLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  destinationLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  
  contact: { type: String }, // Vendor or Customer Name
  responsible: { type: String }, // User Name (Auto-filled)

  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Operation', OperationSchema);